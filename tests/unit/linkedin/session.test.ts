import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  createLinkedInSessionFile,
  isLinkedInDomain,
  LinkedInSessionError,
  linkedInSessionStatus,
  readLinkedInSession,
  saveLinkedInSession,
} from '../../../src/linkedin/session.ts';
import { FAKE_LINKEDIN_COOKIE_VALUE, fakeLinkedInStorageState } from '../../helpers/fixtures.ts';

// The saved LinkedIn login (DEC-032): what is kept, how it is stored and how its status is judged.

const SAVED_AT = '2026-10-24T09:00:00.000Z';
const NOW = '2026-10-24T12:00:00.000Z';

describe('LinkedIn session file', () => {
  const dir = mkdtempSync(join(tmpdir(), 'linkedin-session-'));
  let pathCount = 0;
  const freshPath = () => join(dir, String(++pathCount), 'session.json');
  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it.each([
    ['linkedin.com', true],
    ['.linkedin.com', true],
    ['.www.LinkedIn.com', true],
    ['example.com', false],
    ['notlinkedin.com', false],
    ['linkedin.com.example.com', false],
  ])('FR-14: %s is a LinkedIn domain: %s', (domain, expected) => {
    expect(isLinkedInDomain(domain)).toBe(expected);
  });

  it("NFR-12: keeps only LinkedIn's cookies and storage", () => {
    const file = createLinkedInSessionFile(fakeLinkedInStorageState(), SAVED_AT);

    expect(file.version).toBe(1);
    expect(file.savedAt).toBe(SAVED_AT);
    expect(file.storageState.cookies.map((cookie) => cookie.name)).toEqual(['li_at', 'JSESSIONID']);
    expect(file.storageState.origins.map((origin) => origin.origin)).toEqual(['https://www.linkedin.com']);
  });

  it('FR-14: keeps cookie fields it does not use, so a browser gets back what it saved', () => {
    const state = fakeLinkedInStorageState();
    const cookies = state.cookies.map((cookie) => ({ ...cookie, partitionKey: 'https://www.linkedin.com' }));
    const file = createLinkedInSessionFile({ ...state, cookies }, SAVED_AT);

    expect(file.storageState.cookies[0]).toMatchObject({ partitionKey: 'https://www.linkedin.com' });
  });

  it('FR-14: drops origins that are not https LinkedIn pages, including malformed ones', () => {
    const origins = ['http://www.linkedin.com', 'not a url', 'https://www.linkedin.com'].map((origin) => ({
      origin,
      localStorage: [],
    }));
    const file = createLinkedInSessionFile({ ...fakeLinkedInStorageState(), origins }, SAVED_AT);

    expect(file.storageState.origins.map((origin) => origin.origin)).toEqual(['https://www.linkedin.com']);
  });

  it('FR-14: refuses a browser that is not signed in to LinkedIn', () => {
    const state = fakeLinkedInStorageState();
    const notSignedIn = { ...state, cookies: state.cookies.filter((cookie) => cookie.name !== 'li_at') };

    expect(() => createLinkedInSessionFile(notSignedIn, SAVED_AT)).toThrow(LinkedInSessionError);
    expect(() => createLinkedInSessionFile(notSignedIn, SAVED_AT)).toThrow('Not signed in to LinkedIn');
  });

  it('FR-14: refuses an li_at cookie from another site', () => {
    const state = fakeLinkedInStorageState();
    const cookies = state.cookies.map((cookie) =>
      cookie.name === 'li_at' ? { ...cookie, domain: '.example.com' } : cookie,
    );

    expect(() => createLinkedInSessionFile({ ...state, cookies }, SAVED_AT)).toThrow('Not signed in to LinkedIn');
  });

  it.each<[string, unknown]>([
    ['that is not an object', 'nope'],
    ['without cookies', { origins: [] }],
    ['with a cookie that has no name', { cookies: [{ value: 'x' }], origins: [] }],
  ])('FR-14: refuses a storage state %s', (_case, state) => {
    expect(() => createLinkedInSessionFile(state, SAVED_AT)).toThrow(LinkedInSessionError);
  });

  it('FR-14: saves and reads back the same session, creating the folder', () => {
    const path = freshPath();
    const file = createLinkedInSessionFile(fakeLinkedInStorageState(), SAVED_AT);
    saveLinkedInSession(path, file);

    expect(readLinkedInSession(path)).toEqual(file);
  });

  it('NFR-12: the saved file holds the cookies but no password and nothing from other sites', () => {
    const path = freshPath();
    saveLinkedInSession(path, createLinkedInSessionFile(fakeLinkedInStorageState(), SAVED_AT));
    const text = readFileSync(path, 'utf8');

    expect(text).toContain(FAKE_LINKEDIN_COOKIE_VALUE);
    expect(text).not.toMatch(/password/i);
    expect(text).not.toContain('example.com');
  });

  it('FR-14: saving again replaces the old session', () => {
    const path = freshPath();
    saveLinkedInSession(path, createLinkedInSessionFile(fakeLinkedInStorageState(), SAVED_AT));
    saveLinkedInSession(path, createLinkedInSessionFile(fakeLinkedInStorageState(), NOW));

    expect(readLinkedInSession(path)?.savedAt).toBe(NOW);
  });

  it('FR-14: there is no session when the file does not exist', () => {
    expect(readLinkedInSession(join(dir, 'none', 'session.json'))).toBeNull();
  });

  it.each([
    ['is not JSON', '{', 'not valid JSON'],
    ['has an unknown format', JSON.stringify({ version: 2 }), 'unknown format'],
    [
      'has no li_at cookie (edited by hand)',
      JSON.stringify({ version: 1, savedAt: SAVED_AT, storageState: { cookies: [], origins: [] } }),
      'no li_at cookie',
    ],
  ])('FR-14: a file that %s is a LinkedInSessionError', (_case, text, message) => {
    const path = freshPath();
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, text);

    expect(() => readLinkedInSession(path)).toThrow(LinkedInSessionError);
    expect(() => readLinkedInSession(path)).toThrow(message);
  });

  it('FR-14: other read errors are not hidden', () => {
    // A folder where the file should be: EISDIR, or EPERM on some Windows setups.
    expect(() => readLinkedInSession(dir)).toThrow();
    expect(() => readLinkedInSession(dir)).not.toThrow(LinkedInSessionError);
    expect(() => linkedInSessionStatus(dir, NOW)).toThrow();
  });
});

describe('LinkedIn session status', () => {
  const dir = mkdtempSync(join(tmpdir(), 'linkedin-status-'));
  let pathCount = 0;
  function saved(expires: number): string {
    const path = join(dir, String(++pathCount), 'session.json');
    saveLinkedInSession(path, createLinkedInSessionFile(fakeLinkedInStorageState(expires), SAVED_AT));
    return path;
  }
  afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it('FR-14: missing when nothing has been saved', () => {
    expect(linkedInSessionStatus(join(dir, 'none.json'), NOW)).toEqual({
      status: 'missing',
      savedAt: null,
      expiresAt: null,
    });
  });

  it('FR-14: invalid when the file cannot be used', () => {
    const path = join(dir, 'bad.json');
    writeFileSync(path, 'garbage');

    expect(linkedInSessionStatus(path, NOW)).toEqual({ status: 'invalid', savedAt: null, expiresAt: null });
  });

  it('FR-14: active while the sign-in cookie has not expired', () => {
    const path = saved(Date.parse('2027-04-23T12:00:00.000Z') / 1000);

    expect(linkedInSessionStatus(path, NOW)).toEqual({
      status: 'active',
      savedAt: SAVED_AT,
      expiresAt: '2027-04-23T12:00:00.000Z',
    });
  });

  it('FR-14: expired once the sign-in cookie has expired, at the exact second too', () => {
    expect(linkedInSessionStatus(saved(Date.parse('2026-10-01T00:00:00.000Z') / 1000), NOW)).toMatchObject({
      status: 'expired',
      expiresAt: '2026-10-01T00:00:00.000Z',
    });
    expect(linkedInSessionStatus(saved(Date.parse(NOW) / 1000), NOW).status).toBe('expired');
  });

  it('FR-14: active with no expiry when the sign-in cookie lasts for the browser session', () => {
    expect(linkedInSessionStatus(saved(-1), NOW)).toEqual({ status: 'active', savedAt: SAVED_AT, expiresAt: null });
  });

  it('NFR-12: the status never contains a cookie value', () => {
    expect(JSON.stringify(linkedInSessionStatus(saved(-1), NOW))).not.toContain(FAKE_LINKEDIN_COOKIE_VALUE);
  });
});
