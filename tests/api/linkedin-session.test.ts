import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createLinkedInSessionFile, saveLinkedInSession } from '../../src/linkedin/session.ts';
import { fakeLinkedInStorageState } from '../helpers/fixtures.ts';
import { startTestApp, type TestApp } from '../helpers/test-app.ts';

// GET /api/linkedin/session (DEC-032): the status of the owner's saved LinkedIn login. The test app's clock reads
// 2026-10-23T12:00:00Z.

const SAVED_AT = '2026-10-23T09:00:00.000Z';

describe('GET /api/linkedin/session', () => {
  let t: TestApp;
  beforeEach(async () => {
    t = await startTestApp();
  });
  afterEach(async () => {
    await t.close();
  });

  function save(expires: number): void {
    saveLinkedInSession(t.linkedinSessionPath, createLinkedInSessionFile(fakeLinkedInStorageState(expires), SAVED_AT));
  }

  it('FR-14: missing before the owner has signed in', async () => {
    const response = await t.get('/api/linkedin/session');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'missing', savedAt: null, expiresAt: null });
  });

  it('FR-14: active after the login script saved a session', async () => {
    save(Date.parse('2027-04-23T12:00:00.000Z') / 1000);

    expect((await t.get('/api/linkedin/session')).body).toEqual({
      status: 'active',
      savedAt: SAVED_AT,
      expiresAt: '2027-04-23T12:00:00.000Z',
    });
  });

  it('FR-14: expired once the sign-in cookie has expired', async () => {
    save(Date.parse('2026-10-01T00:00:00.000Z') / 1000);

    expect((await t.get('/api/linkedin/session')).body).toMatchObject({ status: 'expired' });
  });

  it('FR-14: invalid when the saved file cannot be used', async () => {
    mkdirSync(dirname(t.linkedinSessionPath), { recursive: true });
    writeFileSync(t.linkedinSessionPath, 'garbage');

    expect((await t.get('/api/linkedin/session')).body).toEqual({ status: 'invalid', savedAt: null, expiresAt: null });
  });

  it('FR-14: the status is read fresh on every request, so a new sign-in shows without a restart', async () => {
    expect((await t.get('/api/linkedin/session')).body).toMatchObject({ status: 'missing' });
    save(-1);
    expect((await t.get('/api/linkedin/session')).body).toMatchObject({ status: 'active', expiresAt: null });
  });
});
