// Fake data for performance tests and screenshots (PLAN.md Phase 7 task 1).
//   node scripts/seed.ts --count 5000 --db data/perf.db [--seed 1]
// Builds LinkedIn-style digest emails and loads them through the real ingest service, then scores jobs and
// moves some through the status workflow with the real status service, so every counter, sighting and history
// row follows the same rules as real data. The same --seed always gives the same database. Everything is
// made up: no real job, company or person. It refuses to write into a database that already has jobs, so it
// can never mix fake jobs into the owner's board.
import { z } from 'zod';
import type { DatabaseSync } from 'node:sqlite';
import { openDatabase, transaction } from '../src/db/database.ts';
import { migrate } from '../src/db/migrate.ts';
import { createRepositories, type Repositories } from '../src/db/repositories/index.ts';
import { labelForScore } from '../src/domain/score.ts';
import type { Status } from '../src/domain/status.ts';
import { ingestEmails, type IncomingEmail } from '../src/ingest/ingest-service.ts';
import { changeJobStatus } from '../src/jobs/status-service.ts';

export interface SeedOptions {
  count: number;
  seed: number;
  /** The newest email arrives at this time; the others are spread over the 30 days before it. */
  until: string;
}

export interface SeedSummary {
  runs: number;
  emails: number;
  jobs: number;
  scored: number;
  byStatus: Record<string, number>;
}

export class SeedError extends Error {
  override name = 'SeedError';
}

const ROLES = [
  'QA Automation Engineer',
  'Senior QA Engineer',
  'Software Development Engineer in Test',
  'Senior SDET',
  'Test Automation Engineer',
  'Quality Engineer',
  'Staff Quality Engineer',
  'Lead Test Automation Engineer',
  'AI Quality Engineer',
  'Manual QA Analyst',
  'Hardware Test Engineer',
  'QA Engineer II',
];
const STACKS = ['', '', '', ' (Playwright)', ' (TypeScript)', ' (Cypress)', ' (Selenium, Java)', ' - API Testing'];
const COMPANY_A = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Hooli', 'Vandelay', 'Stark', 'Wayne', 'Tyrell', 'Soylent'];
const COMPANY_B = ['Labs', 'Systems', 'Health', 'Financial', 'Software', 'Analytics', 'Robotics', 'Media'];
const LOCATIONS = [
  'United States',
  'United States',
  'United States (Remote)',
  'Chicago, IL',
  'Austin, TX',
  'New York, NY',
  'Seattle, WA',
  'Denver, CO',
  'Atlanta, GA',
];
const SEARCHES = ['sdet in United States', 'senior quality assurance engineer in United States', 'test automation'];
const REASONS = [
  'Senior automation title, US-wide; no stack named.',
  'Playwright named in the title, remote US.',
  'QA role, but the city is not marked remote.',
  'Mid-level title with a secondary stack.',
  'Capped: manual-only role (deal-breaker).',
  'Adjacent role, not core QA.',
];

/** Where each target status is reached from `new`, one allowed transition at a time (PLAN.md §5.4). */
const PATHS: readonly (readonly Status[])[] = [
  ...Array<Status[]>(70).fill([]),
  ...Array<Status[]>(8).fill(['saved']),
  ...Array<Status[]>(3).fill(['applied']),
  ...Array<Status[]>(3).fill(['saved', 'applied']),
  ...Array<Status[]>(3).fill(['applied', 'interviewing']),
  ['applied', 'interviewing', 'offer'],
  ...Array<Status[]>(3).fill(['applied', 'rejected']),
  ...Array<Status[]>(9).fill(['dismissed']),
];

const JOBS_PER_EMAIL = 6;
const NEW_PER_EMAIL = 4; // the other two are repeats of earlier jobs, as in real alerts
const DAY_MS = 24 * 60 * 60 * 1000;

/** mulberry32: a small, fast PRNG, so a seed always gives the same data. */
function random(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedDatabase(db: DatabaseSync, repos: Repositories, options: SeedOptions): SeedSummary {
  const existing = repos.jobs.count({ statuses: null, minScore: null, text: null, unscoredOnly: false });
  if (existing > 0) {
    throw new SeedError(`the database already has ${String(existing)} jobs; seed only into a new database`);
  }

  const rand = random(options.seed);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(rand() * items.length)] as T;
  const until = Date.parse(options.until);
  const emailCount = Math.ceil(options.count / NEW_PER_EMAIL);
  const runCount = Math.min(30, emailCount);
  const runIds: number[] = [];
  let clock = until - 30 * DAY_MS;
  const tick = () => new Date((clock += 1000)).toISOString();

  // 1. Emails, through the real ingest service: about one run per day, each with its share of the emails.
  const linkedinIds: string[] = [];
  for (let e = 0; e < emailCount; e += 1) {
    const run = Math.floor((e * runCount) / emailCount);
    const runId = (runIds[run] ??= repos.runs.create(tick()));
    const receivedAt = new Date(until - ((emailCount - 1 - e) * 30 * DAY_MS) / emailCount).toISOString();
    clock = Math.max(clock, Date.parse(receivedAt));

    const blocks: string[] = [];
    for (let n = 0; n < NEW_PER_EMAIL && linkedinIds.length < options.count; n += 1) {
      const id = String(4_400_000_000 + linkedinIds.length);
      linkedinIds.push(id);
      blocks.push(block(id, pick, rand));
    }
    for (let n = blocks.length; n < JOBS_PER_EMAIL && linkedinIds.length > blocks.length; n += 1) {
      const earlier = linkedinIds.slice(0, linkedinIds.length - NEW_PER_EMAIL);
      if (earlier.length > 0) blocks.push(block(pick(earlier), pick, rand));
    }
    const email: IncomingEmail = {
      gmailMessageId: `seed${String(options.seed)}e${String(e)}`,
      receivedAt,
      sender: 'jobalerts-noreply@linkedin.com',
      subject: 'New jobs for your search',
      plainText: `Your job alert for ${pick(SEARCHES)}\nNew jobs match your preferences.\n\n${blocks.join(
        '\n\n---------------------------------------------------------\n\n',
      )}\n\nThis email was intended for Test User (QA Engineer)\n`,
    };
    ingestEmails(db, repos, runId, [email], tick);
  }

  // 2. Scores, statuses and notes, in one transaction.
  const byStatus: Record<string, number> = {};
  let scored = 0;
  transaction(db, () => {
    const jobs = repos.jobs.list({
      statuses: null,
      minScore: null,
      text: null,
      unscoredOnly: false,
      sort: 'recent',
      limit: options.count,
      offset: 0,
    });
    for (const job of jobs) {
      if (rand() < 0.9) {
        const score = Math.min(100, Math.max(0, Math.round(35 + rand() * 45 + (rand() - 0.5) * 30)));
        repos.jobs.setScore(job.id, {
          score,
          label: labelForScore(score),
          reason: pick(REASONS),
          rubricVersion: 'triage-v1',
          scoredAt: tick(),
        });
        repos.runs.addCounts(job.firstRunId ?? runIds[0] ?? 0, { jobsScored: 1 });
        scored += 1;
      }
      const path = pick(PATHS);
      for (const status of path) changeJobStatus(db, repos, job.id, status, tick);
      if (path.length > 0 && rand() < 0.5) repos.jobs.updateNotes(job.id, 'Seeded note: follow up next week.');
      const status = path.at(-1) ?? 'new';
      byStatus[status] = (byStatus[status] ?? 0) + 1;
    }
    for (const runId of runIds) repos.runs.finish(runId, tick());
  });

  return { runs: runIds.length, emails: emailCount, jobs: linkedinIds.length, scored, byStatus };
}

function block(linkedinId: string, pick: <T>(items: readonly T[]) => T, rand: () => number): string {
  const lines = [
    `${pick(ROLES)}${pick(STACKS)}`,
    `${pick(COMPANY_A)} ${pick(COMPANY_B)}`,
    pick(LOCATIONS),
    rand() < 0.3 ? 'This company is actively hiring' : '',
    rand() < 0.4 ? 'Apply with resume & profile' : '',
    `View job: https://www.linkedin.com/comm/jobs/view/${linkedinId}/`,
  ];
  return lines.filter((line) => line !== '').join('\n');
}

const ArgsSchema = z.object({
  count: z.coerce.number().int().min(1).max(100_000),
  db: z.string().trim().min(1),
  seed: z.coerce.number().int().min(0).default(1),
});

function parseArgs(argv: readonly string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 2) {
    const [key, value] = [argv[i], argv[i + 1]];
    if (key?.startsWith('--') !== true || value === undefined)
      throw new SeedError(`unexpected argument: ${String(key)}`);
    args[key.slice(2)] = value;
  }
  return args;
}

if (import.meta.main) {
  const usage = 'Usage: node scripts/seed.ts --count 5000 --db data/perf.db [--seed 1]';
  try {
    const args = ArgsSchema.safeParse(parseArgs(process.argv.slice(2)));
    if (!args.success) {
      console.error(usage);
      process.exitCode = 2;
    } else {
      const db = openDatabase(args.data.db);
      try {
        migrate(db);
        const started = performance.now();
        const summary = seedDatabase(db, createRepositories(db), {
          count: args.data.count,
          seed: args.data.seed,
          until: new Date().toISOString(),
        });
        console.log(`Seeded ${args.data.db} in ${String(Math.round(performance.now() - started))} ms`);
        console.table({ runs: summary.runs, emails: summary.emails, jobs: summary.jobs, scored: summary.scored });
        console.table(summary.byStatus);
      } finally {
        db.close();
      }
    }
  } catch (error) {
    if (!(error instanceof SeedError)) throw error;
    console.error(`${error.message}\n${usage}`);
    process.exitCode = 1;
  }
}
