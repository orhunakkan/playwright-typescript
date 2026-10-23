// Dry-run tool (PLAN.md Phase 2): shows what the parser reads from saved email files. Writes nothing.
// Usage: node scripts/parse-email.ts tests/fixtures/emails/<file>.txt [more files …]
import { readFileSync } from 'node:fs';
import { parseEmailFile } from '../src/ingest/email-file.ts';
import { parseAlertEmail } from '../src/ingest/linkedin-email-parser.ts';

const files = process.argv.slice(2);

if (files.length === 0) {
  console.error('Usage: node scripts/parse-email.ts <email-file.txt> [more files …]');
  process.exitCode = 2;
}

for (const file of files) {
  const result = parseAlertEmail(parseEmailFile(readFileSync(file, 'utf8')));
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
