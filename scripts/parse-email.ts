// Dry-run tool (PLAN.md Phases 2–3).
//   node scripts/parse-email.ts <file.txt> [more files …]
//     shows what the parser reads from saved email files; writes nothing.
//   node --env-file=.env scripts/parse-email.ts --ingest <file.txt> [more files …]
//     loads the files into the database at DB_PATH as one run. Each file's message ID is a hash of its
//     content, so loading the same file again reports it as a duplicate.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { openDatabase } from '../src/db/database.ts';
import { migrate } from '../src/db/migrate.ts';
import { createRepositories } from '../src/db/repositories/index.ts';
import { parseEmailFile, type EmailFile } from '../src/ingest/email-file.ts';
import { ingestEmails, type IncomingEmail } from '../src/ingest/ingest-service.ts';
import { parseAlertEmail } from '../src/ingest/linkedin-email-parser.ts';

const args = process.argv.slice(2);
const ingest = args.includes('--ingest');
const files = args.filter((arg) => arg !== '--ingest');

if (files.length === 0) {
  console.error('Usage: node scripts/parse-email.ts [--ingest] <email-file.txt> [more files …]');
  process.exitCode = 2;
} else if (ingest) {
  ingestFiles(files);
} else {
  printFiles(files);
}

function readEmail(file: string): EmailFile {
  return parseEmailFile(readFileSync(file, 'utf8'));
}

function printFiles(paths: string[]): void {
  for (const file of paths) {
    const result = parseAlertEmail(readEmail(file));
    console.log(`\n${file}`);

    if ('unrecognized' in result) {
      console.log(`  unrecognized: ${result.unrecognized}`);
      process.exitCode = 1;
      continue;
    }

    console.log(`  format: ${result.format}`);
    console.log(`  saved search: ${result.savedSearch ?? '(none)'}`);
    console.log(`  jobs: ${String(result.jobs.length)}`);
    console.table(
      result.jobs.map((job) => ({
        title: job.title,
        company: job.company,
        location: job.location,
        jobId: job.linkedinJobId,
        activelyHiring: job.activelyHiring ? 'yes' : '',
        easyApply: job.easyApply ? 'yes' : '',
      })),
    );
  }
}

function ingestFiles(paths: string[]): void {
  const env = z.object({ DB_PATH: z.string().trim().min(1) }).safeParse(process.env);
  if (!env.success) {
    console.error('DB_PATH is not set. Run: node --env-file=.env scripts/parse-email.ts --ingest <file.txt>');
    process.exitCode = 2;
    return;
  }

  const emails = paths.map((file): IncomingEmail => {
    const email = readEmail(file);
    const id = createHash('sha256').update(`${email.sender}\n${email.subject}\n${email.plainText}`).digest('hex');
    return {
      gmailMessageId: `file-${id.slice(0, 16)}`,
      receivedAt: email.date ?? new Date().toISOString(),
      sender: email.sender,
      subject: email.subject,
      plainText: email.plainText,
    };
  });

  const db = openDatabase(env.data.DB_PATH);
  try {
    migrate(db);
    const repos = createRepositories(db);
    const runId = repos.runs.create(new Date().toISOString());
    const { results } = ingestEmails(db, repos, runId, emails);
    repos.runs.finish(runId, new Date().toISOString());

    console.log(`\nRun ${String(runId)} → ${env.data.DB_PATH}`);
    console.table(
      results.map((result, index) => ({ file: paths[index], outcome: result.outcome, jobsFound: result.jobsFound })),
    );
    const run = repos.runs.get(runId);
    if (run !== null) {
      console.table(
        Object.fromEntries(Object.entries(run).filter(([key]) => !['id', 'startedAt', 'finishedAt'].includes(key))),
      );
    }
  } finally {
    db.close();
  }
}
