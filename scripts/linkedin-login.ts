// Signs the owner in to LinkedIn once and saves the session for the app and scripts to reuse (DEC-032, DEC-033):
//   node scripts/linkedin-login.ts             opens a browser; if it isn't signed in already, the owner signs in by
//                                              hand (2FA included); then the session is saved
//   node scripts/linkedin-login.ts --ensure    what `npm start` runs first: checks the saved session in a hidden
//                                              browser, refreshes it, and opens the sign-in window only when LinkedIn
//                                              no longer accepts it. Never fails, so the app always starts
//   node scripts/linkedin-login.ts --check     prints the saved session's status (no browser, no request)
//   options: --session <path>   session file (default LINKEDIN_SESSION_PATH, else data/linkedin/session.json)
//            --channel <name>   msedge (default on Windows), chrome or chromium (Playwright's own build)
// The browser keeps its own profile next to the session file (browser-profile/), so later runs are usually signed in
// already. The owner types the password into LinkedIn's page: this script never sees or stores it, and it never
// prints a cookie value. Other scripts feed the saved session to a browser with
// `browser.newContext({ storageState: readLinkedInSession(path)?.storageState })`.
import { dirname, join } from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';
import { parseArgs } from 'node:util';
import { chromium, type BrowserContext } from '@playwright/test';
import { DEFAULT_LINKEDIN_SESSION_PATH } from '../src/config.ts';
import {
  createLinkedInSessionFile,
  LINKEDIN_AUTH_COOKIE,
  linkedInSessionStatus,
  saveLinkedInSession,
  type LinkedInSessionStatus,
} from '../src/linkedin/session.ts';

const SIGN_IN_URL = 'https://www.linkedin.com/login';
const FEED_URL = 'https://www.linkedin.com/feed/';
const SIGN_IN_TIMEOUT_MS = 10 * 60_000;
// Pages LinkedIn shows to a visitor who is not signed in, or while a sign-in is in progress (password, 2FA, check).
const SIGN_IN_PATHS = /^\/(?:login|checkpoint|uas|authwall)(?:\/|$)/;

const { values } = parseArgs({
  options: {
    check: { type: 'boolean', default: false },
    ensure: { type: 'boolean', default: false },
    session: { type: 'string' },
    channel: { type: 'string' },
  },
});
const sessionPath = values.session ?? process.env['LINKEDIN_SESSION_PATH'] ?? DEFAULT_LINKEDIN_SESSION_PATH;
const profileDir = join(dirname(sessionPath), 'browser-profile');
const channel = values.channel ?? (process.platform === 'win32' ? 'msedge' : 'chromium');

if (values.check) {
  const status = currentStatus();
  console.log(describe(status));
  process.exitCode = status.status === 'active' ? 0 : 1;
} else if (values.ensure) {
  await ensure();
} else {
  process.exitCode = (await signIn()) ? 0 : 1;
}

async function ensure(): Promise<void> {
  if (currentStatus().status === 'active') {
    const verified = await verify();
    if (verified === 'signed-in') {
      console.log(describe(currentStatus()));
      return;
    }
    if (verified === 'unreachable') {
      console.log('LinkedIn could not be reached; starting with the saved session as it is.');
      return;
    }
  }
  console.log('LinkedIn needs you to sign in.');
  if (!(await signIn())) console.log('Starting without a LinkedIn session. Sign in later with: npm start');
}

/** Opens LinkedIn in a hidden browser with the saved profile; refreshes the saved session when it is accepted. */
async function verify(): Promise<'signed-in' | 'signed-out' | 'unreachable'> {
  const context = await openBrowser(true);
  if (context === null) return 'unreachable';
  try {
    const page = context.pages()[0] ?? (await context.newPage());
    try {
      await page.goto(FEED_URL, { waitUntil: 'domcontentloaded' });
    } catch {
      return 'unreachable';
    }
    if (!(await signedIn(context))) return 'signed-out';
    save(await context.storageState());
    return 'signed-in';
  } finally {
    await context.close().catch(() => undefined);
  }
}

/** Opens a visible browser and waits for the owner to sign in. Returns whether a session was saved. */
async function signIn(): Promise<boolean> {
  const context = await openBrowser(false);
  if (context === null) return false;
  try {
    const page = context.pages()[0] ?? (await context.newPage());
    await page.goto(SIGN_IN_URL);

    if (!(await signedIn(context))) {
      console.log('Sign in to LinkedIn in the browser window. Waiting up to 10 minutes…');
      const deadline = Date.now() + SIGN_IN_TIMEOUT_MS;
      while (!(await signedIn(context))) {
        if (Date.now() > deadline) throw new Error('Timed out waiting for the LinkedIn sign-in');
        await sleep(1000);
      }
    }

    save(await context.storageState());
    console.log(`Saved LinkedIn session to ${sessionPath}`);
    console.log(describe(currentStatus()));
    return true;
  } catch (error) {
    // Closing the window ends the context; say so instead of printing Playwright's stack.
    if (error instanceof Error && /closed/i.test(error.message)) {
      console.error('The browser was closed before the sign-in finished. Nothing was saved.');
    } else {
      console.error(error instanceof Error ? error.message : error);
    }
    return false;
  } finally {
    await context.close().catch(() => undefined);
  }
}

async function openBrowser(headless: boolean): Promise<BrowserContext | null> {
  try {
    return await chromium.launchPersistentContext(profileDir, {
      headless,
      viewport: null,
      ...(channel === 'chromium' ? {} : { channel }),
    });
  } catch (error) {
    // Most often the profile is in use by another sign-in window, or the browser isn't installed.
    const reason = error instanceof Error ? (error.message.split('\n')[0] ?? '') : String(error);
    console.error(`Could not open ${channel}: ${reason}`);
    return null;
  }
}

/** Signed in once LinkedIn has set its sign-in cookie and no tab is on a sign-in or security-check page. */
async function signedIn(context: BrowserContext): Promise<boolean> {
  const cookies = await context.cookies('https://www.linkedin.com');
  if (!cookies.some((cookie) => cookie.name === LINKEDIN_AUTH_COOKIE)) return false;
  return context.pages().every((page) => !SIGN_IN_PATHS.test(new URL(page.url()).pathname));
}

function save(storageState: unknown): void {
  saveLinkedInSession(sessionPath, createLinkedInSessionFile(storageState, new Date().toISOString()));
}

function currentStatus(): LinkedInSessionStatus {
  return linkedInSessionStatus(sessionPath, new Date().toISOString());
}

function describe(status: LinkedInSessionStatus): string {
  switch (status.status) {
    case 'missing':
      return `LinkedIn session: missing (${sessionPath}). Run: node scripts/linkedin-login.ts`;
    case 'invalid':
      return `LinkedIn session: invalid (${sessionPath}). Run: node scripts/linkedin-login.ts`;
    case 'expired':
      return `LinkedIn session: expired at ${String(status.expiresAt)}. Run: node scripts/linkedin-login.ts`;
    case 'active':
      return `LinkedIn session: active (saved ${String(status.savedAt)}, expires ${status.expiresAt ?? 'with the browser session'})`;
  }
}
