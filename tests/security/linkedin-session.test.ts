import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createLinkedInSessionFile, saveLinkedInSession } from '../../src/linkedin/session.ts';
import { FAKE_LINKEDIN_COOKIE_VALUE, fakeLinkedInStorageState } from '../helpers/fixtures.ts';
import { startTestApp, type TestApp } from '../helpers/test-app.ts';

// NFR-12: the saved LinkedIn login (DEC-032) is a secret. Its cookie values never reach an API response, a page, a
// log line or the login script's output, and the file lives where git ignores it.

const root = fileURLToPath(new URL('../../', import.meta.url));

describe('the saved LinkedIn session stays secret', () => {
  let t: TestApp;
  beforeEach(async () => {
    t = await startTestApp();
    saveLinkedInSession(
      t.linkedinSessionPath,
      createLinkedInSessionFile(fakeLinkedInStorageState(), '2026-10-23T09:00:00.000Z'),
    );
  });
  afterEach(async () => {
    await t.close();
  });

  it('NFR-12: no cookie value in the API response, any page or the logs', async () => {
    for (const path of ['/api/linkedin/session', '/', '/profile', '/runs', '/api/health']) {
      expect((await t.get(path)).text).not.toContain(FAKE_LINKEDIN_COOKIE_VALUE);
    }
    expect(t.logs.join('\n')).not.toContain(FAKE_LINKEDIN_COOKIE_VALUE);
  });

  it('NFR-12: the status endpoint is read-only', async () => {
    const response = await t.call('PUT', '/api/linkedin/session', {});
    expect(response.status).toBe(405);
  });
});

describe('scripts/linkedin-login.ts --check', () => {
  const dir = mkdtempSync(join(tmpdir(), 'linkedin-check-'));
  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function check(sessionPath: string) {
    // --check opens no browser and makes no request, so this runs anywhere.
    const result = spawnSync(process.execPath, ['scripts/linkedin-login.ts', '--check', '--session', sessionPath], {
      cwd: root,
      encoding: 'utf8',
    });
    return { status: result.status, output: result.stdout + result.stderr };
  }

  it('FR-14: reports a missing session and fails', () => {
    const { status, output } = check(join(dir, 'none.json'));

    expect(status).toBe(1);
    expect(output).toContain('LinkedIn session: missing');
    expect(output).toContain('node scripts/linkedin-login.ts');
  });

  it('FR-14, NFR-12: reports an active session without printing its cookies', () => {
    const path = join(dir, 'session.json');
    // The script uses the real clock, so the cookie expires far in the future.
    const expires = Date.parse('2099-01-01T00:00:00.000Z') / 1000;
    saveLinkedInSession(path, createLinkedInSessionFile(fakeLinkedInStorageState(expires), '2026-10-23T09:00:00.000Z'));
    const { status, output } = check(path);

    expect(status).toBe(0);
    expect(output).toContain(
      'LinkedIn session: active (saved 2026-10-23T09:00:00.000Z, expires 2099-01-01T00:00:00.000Z)',
    );
    expect(output).not.toContain(FAKE_LINKEDIN_COOKIE_VALUE);
  });
});
