import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';
import { openDatabase } from '../../src/db/database.ts';

// Runs the dry-run tool the way the owner does at CP-2 and CP-3: node scripts/parse-email.ts [--ingest] <file>.
const root = fileURLToPath(new URL('../../', import.meta.url));
const FIXTURES = ['digest-test-automation.txt', 'digest-senior-qa.txt', 'recommendations.txt'].map(
  (name) => `tests/fixtures/emails/${name}`,
);

function run(...files: string[]) {
  return runWith({}, ...files);
}

// The child never inherits a DB_PATH from the shell, so it can't touch data/jobboard.db.
function runWith(env: { DB_PATH?: string }, ...files: string[]) {
  const inherited = Object.fromEntries(Object.entries(process.env).filter(([key]) => key !== 'DB_PATH'));
  const result = spawnSync(process.execPath, ['scripts/parse-email.ts', ...files], {
    cwd: root,
    encoding: 'utf8',
    env: { ...inherited, ...env },
  });
  return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

describe('scripts/parse-email.ts', () => {
  const tempDir = mkdtempSync(join(tmpdir(), 'parse-email-'));
  afterAll(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it.each([
    ['digest-test-automation.txt', 'digest', 'Cboe Global Markets'],
    ['digest-senior-qa.txt', 'digest', 'ConsumerAffairs'],
    ['recommendations.txt', 'recommendations', 'Workiva'],
  ])('FR-03: prints the jobs parsed from %s', (name, format, company) => {
    const { status, stdout } = run(`tests/fixtures/emails/${name}`);

    expect(status).toBe(0);
    expect(stdout).toContain(`format: ${format}`);
    expect(stdout).toContain('jobs: 6');
    expect(stdout).toContain(company);
  });

  it('FR-12: reports an unrecognized email and exits with 1', () => {
    const file = join(tempDir, 'unknown.txt');
    writeFileSync(file, 'From: jobs-noreply@linkedin.com\nSubject: Hi\n\nHappy work anniversary!\n');

    const { status, stdout } = run(file);

    expect(status).toBe(1);
    expect(stdout).toContain('unrecognized: unknown email format');
  });

  it('FR-03: prints usage and exits with 2 when no file is given', () => {
    const { status, stderr } = run();

    expect(status).toBe(2);
    expect(stderr).toContain('Usage: node scripts/parse-email.ts');
  });

  it('FR-05: --ingest loads every fixture, and a second run reports only duplicates', () => {
    const dbPath = join(tempDir, 'ingest', 'dev.db');

    const first = runWith({ DB_PATH: dbPath }, '--ingest', ...FIXTURES);
    const second = runWith({ DB_PATH: dbPath }, '--ingest', ...FIXTURES);

    expect(first.status).toBe(0);
    expect(first.stdout).toContain('Run 1');
    expect(first.stdout.match(/'new'/g)).toHaveLength(3);
    expect(second.status).toBe(0);
    expect(second.stdout).toContain('Run 2');
    expect(second.stdout.match(/'duplicate'/g)).toHaveLength(3);
    expect(second.stdout).not.toContain("'new'");

    const db = openDatabase(dbPath);
    try {
      expect(db.prepare('SELECT count(*) AS n FROM jobs').get()).toEqual({ n: 18 });
      expect(db.prepare('SELECT emails_new, emails_duplicate, jobs_new FROM runs ORDER BY id').all()).toEqual([
        { emails_new: 3, emails_duplicate: 0, jobs_new: 18 },
        { emails_new: 0, emails_duplicate: 3, jobs_new: 0 },
      ]);
    } finally {
      db.close();
    }
  });

  it('NFR-08: --ingest refuses to run without DB_PATH', () => {
    const { status, stderr } = run('--ingest', ...FIXTURES);

    expect(status).toBe(2);
    expect(stderr).toContain('DB_PATH is not set');
  });
});
