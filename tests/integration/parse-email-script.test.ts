import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

// Runs the dry-run tool the way the owner does at CP-2: node scripts/parse-email.ts <file>.
const root = fileURLToPath(new URL('../../', import.meta.url));

function run(...files: string[]) {
  const result = spawnSync(process.execPath, ['scripts/parse-email.ts', ...files], { cwd: root, encoding: 'utf8' });
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
});
