import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import type { Page, BrowserContext } from '@playwright/test';
import { StorageStatePage } from '../../pages/storage-state.page';
import * as fs from 'fs';
import * as path from 'path';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-23 — Storage State

const LOGIN_URL = '/practice/fake-auth';
const STORAGE_STATE_URL = '/practice/storage-state';
const LOGIN_API = '/api/auth/login';

const ADMIN = { username: 'alice', password: 'password123', role: 'admin', displayName: 'Alice Chen' };
const USER = { username: 'bob', password: 'letmein', role: 'user', displayName: 'Robert Smith' };

// Each AC gets its own state file path so parallel workers (fullyParallel: true) never
// race on the same file across independent describe blocks.
const AC1_STATE_PATH = 'fixtures/auth/ss-ac1-admin.json';
const AC1_NOAUTH_PATH = 'fixtures/auth/ss-ac1-noauth.json';
const AC2_STATE_PATH = 'fixtures/auth/ss-ac2-admin.json';
const AC3_ADMIN_PATH = 'fixtures/auth/ss-ac3-admin.json';
const AC3_USER_PATH = 'fixtures/auth/ss-ac3-user.json';
const AC4_ADMIN_PATH = 'fixtures/auth/ss-ac4-admin.json';
const AC4_USER_PATH = 'fixtures/auth/ss-ac4-user.json';
const AC5_STATE_PATH = 'fixtures/auth/ss-ac5-admin.json';
const A11Y_ADMIN_PATH = 'fixtures/auth/ss-a11y-admin.json';
const A11Y_USER_PATH = 'fixtures/auth/ss-a11y-user.json';

const scan = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

// Logs in via the UI login form and serializes the resulting session to statePath.
async function loginAndSaveState(page: Page, context: BrowserContext, username: string, password: string, statePath: string) {
  await page.goto(LOGIN_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(username);
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/practice\/fake-auth\/dashboard$/);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  await context.storageState({ path: statePath });
}

function readSessionCookie(statePath: string) {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
  return state.cookies.find((c: { name: string }) => c.name === 'connect.sid');
}

test.describe('Storage State', () => {
  // AC-1 (TAB1-23): Tests log in via the UI as alice and call context.storageState({ path })
  // to save the session to a file
  test.describe.serial('AC-1 — UI login as alice; context.storageState() persists session to file', () => {
    test('positive: after UI login, context.storageState() writes a file to disk', async ({ page, context }) => {
      await loginAndSaveState(page, context, ADMIN.username, ADMIN.password, AC1_STATE_PATH);
      expect(fs.existsSync(AC1_STATE_PATH)).toBe(true);
    });

    test('boundary: saved state file contains the session cookie that authenticates the user', async () => {
      const sessionCookie = readSessionCookie(AC1_STATE_PATH);
      expect(sessionCookie).toBeDefined();
      expect(sessionCookie.value.length).toBeGreaterThan(0);
    });

    test('negative: storageState() from a context that never logged in has no session cookie', async ({ browser }) => {
      const freshContext = await browser.newContext();
      const freshPage = await freshContext.newPage();
      await freshPage.goto(LOGIN_URL);
      fs.mkdirSync(path.dirname(AC1_NOAUTH_PATH), { recursive: true });
      await freshContext.storageState({ path: AC1_NOAUTH_PATH });
      expect(readSessionCookie(AC1_NOAUTH_PATH)).toBeUndefined();
      await freshContext.close();
    });
  });

  // AC-2 (TAB1-23): Tests load the saved state with browser.newContext({ storageState }),
  // navigate to the profile page, and assert the correct user is shown — no login step required
  test.describe.serial('AC-2 — browser.newContext({ storageState }) restores session without UI login', () => {
    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await loginAndSaveState(page, context, ADMIN.username, ADMIN.password, AC2_STATE_PATH);
      await context.close();
    });

    test('positive: new context loaded from storage state shows the correct user with no login step', async ({ browser }) => {
      const authedContext = await browser.newContext({ storageState: AC2_STATE_PATH });
      const authedPage = await authedContext.newPage();
      await authedPage.goto(STORAGE_STATE_URL);
      const storageStatePage = new StorageStatePage(authedPage);
      await expect(storageStatePage.displayName).toHaveText(ADMIN.displayName);
      await expect(storageStatePage.userRole).toHaveText(ADMIN.role);
      await authedContext.close();
    });

    test('negative: loading from a nonexistent storage state file rejects', async ({ browser }) => {
      await expect(browser.newContext({ storageState: 'fixtures/auth/does-not-exist.json' })).rejects.toThrow();
    });

    test('boundary: context restored from storage state does not show the unauthenticated block', async ({ browser }) => {
      const authedContext = await browser.newContext({ storageState: AC2_STATE_PATH });
      const authedPage = await authedContext.newPage();
      await authedPage.goto(STORAGE_STATE_URL);
      const storageStatePage = new StorageStatePage(authedPage);
      await expect(storageStatePage.notAuthenticated).not.toBeVisible();
      await expect(storageStatePage.profileCard).toBeVisible();
      await authedContext.close();
    });
  });

  // AC-3 (TAB1-23): Tests create two separate storage state files (admin role and regular
  // user role) and assert role-specific UI differences are visible between the two contexts
  test.describe.serial('AC-3 — two-role storage state files show role-specific UI in isolated contexts', () => {
    test.beforeAll(async ({ browser }) => {
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      await loginAndSaveState(adminPage, adminContext, ADMIN.username, ADMIN.password, AC3_ADMIN_PATH);
      await adminContext.close();

      const userContext = await browser.newContext();
      const userPage = await userContext.newPage();
      await loginAndSaveState(userPage, userContext, USER.username, USER.password, AC3_USER_PATH);
      await userContext.close();
    });

    test('positive: admin context sees the Admin panel; user context does not', async ({ browser }) => {
      const adminContext = await browser.newContext({ storageState: AC3_ADMIN_PATH });
      const userContext = await browser.newContext({ storageState: AC3_USER_PATH });
      const adminPage = await adminContext.newPage();
      const userPage = await userContext.newPage();
      await adminPage.goto(STORAGE_STATE_URL);
      await userPage.goto(STORAGE_STATE_URL);

      await expect(new StorageStatePage(adminPage).adminPanel).toBeVisible();
      await expect(new StorageStatePage(userPage).adminPanel).not.toBeVisible();

      await adminContext.close();
      await userContext.close();
    });

    test('negative: user context never exposes admin-only stats', async ({ browser }) => {
      const userContext = await browser.newContext({ storageState: AC3_USER_PATH });
      const userPage = await userContext.newPage();
      await userPage.goto(STORAGE_STATE_URL);
      const storageStatePage = new StorageStatePage(userPage);
      await expect(storageStatePage.totalUsers).toHaveCount(0);
      await expect(storageStatePage.pendingReviews).toHaveCount(0);
      await userContext.close();
    });

    test('boundary: role badge text differs between the admin and user contexts', async ({ browser }) => {
      const adminContext = await browser.newContext({ storageState: AC3_ADMIN_PATH });
      const userContext = await browser.newContext({ storageState: AC3_USER_PATH });
      const adminPage = await adminContext.newPage();
      const userPage = await userContext.newPage();
      await adminPage.goto(STORAGE_STATE_URL);
      await userPage.goto(STORAGE_STATE_URL);

      await expect(new StorageStatePage(adminPage).userRole).toHaveText(ADMIN.role);
      await expect(new StorageStatePage(userPage).userRole).toHaveText(USER.role);

      await adminContext.close();
      await userContext.close();
    });
  });

  // AC-4 (TAB1-23): Tests authenticate as each user using the request fixture (no browser)
  // and capture their storage state file to avoid a full browser startup in setup
  test.describe.serial('AC-4 — request fixture authenticates without a browser and captures storage state', () => {
    test('positive: request.post to the login API authenticates alice and request.storageState() captures the session', async ({
      request,
    }) => {
      const res = await request.post(LOGIN_API, { data: { username: ADMIN.username, password: ADMIN.password } });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toMatchObject({ username: ADMIN.username, role: ADMIN.role });

      fs.mkdirSync(path.dirname(AC4_ADMIN_PATH), { recursive: true });
      const state = await request.storageState({ path: AC4_ADMIN_PATH });
      expect(state.cookies.find((c) => c.name === 'connect.sid')).toBeDefined();
    });

    test('positive: state captured via the request fixture authenticates a real browser context', async ({ browser }) => {
      const authedContext = await browser.newContext({ storageState: AC4_ADMIN_PATH });
      const authedPage = await authedContext.newPage();
      await authedPage.goto(STORAGE_STATE_URL);
      await expect(new StorageStatePage(authedPage).displayName).toHaveText(ADMIN.displayName);
      await authedContext.close();
    });

    test('negative: request-based login with invalid credentials returns 401 and sets no session', async ({ request }) => {
      const res = await request.post(LOGIN_API, { data: { username: ADMIN.username, password: 'wrongpass' } });
      expect(res.status()).toBe(401);
      const state = await request.storageState();
      expect(state.cookies.find((c) => c.name === 'connect.sid')).toBeUndefined();
    });

    test('boundary: request-based auth for bob captures a session distinct from alice', async ({ request }) => {
      const res = await request.post(LOGIN_API, { data: { username: USER.username, password: USER.password } });
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body).toMatchObject({ username: USER.username, role: USER.role });

      fs.mkdirSync(path.dirname(AC4_USER_PATH), { recursive: true });
      await request.storageState({ path: AC4_USER_PATH });
      expect(readSessionCookie(AC4_USER_PATH)).toBeDefined();
    });
  });

  // AC-5 (TAB1-23): Tests verify that a fresh context loaded from a storage state file skips
  // the login form entirely and lands on the authenticated view
  test.describe.serial('AC-5 — storage state skips login and persists across reload', () => {
    test.beforeAll(async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await loginAndSaveState(page, context, ADMIN.username, ADMIN.password, AC5_STATE_PATH);
      await context.close();
    });

    test('positive: context loaded from storage state lands directly on the authenticated view', async ({ browser }) => {
      const authedContext = await browser.newContext({ storageState: AC5_STATE_PATH });
      const authedPage = await authedContext.newPage();
      await authedPage.goto(STORAGE_STATE_URL);
      const storageStatePage = new StorageStatePage(authedPage);
      await expect(storageStatePage.profileCard).toBeVisible();
      await expect(storageStatePage.notAuthenticated).not.toBeVisible();
      await authedContext.close();
    });

    test('negative: a fresh context with no storage state shows the unauthenticated block', async ({ browser }) => {
      const freshContext = await browser.newContext();
      const freshPage = await freshContext.newPage();
      await freshPage.goto(STORAGE_STATE_URL);
      const storageStatePage = new StorageStatePage(freshPage);
      await expect(storageStatePage.notAuthenticated).toBeVisible();
      await expect(storageStatePage.profileCard).not.toBeVisible();
      await freshContext.close();
    });

    test('boundary: authenticated session persists across a page reload in the same context', async ({ browser }) => {
      const authedContext = await browser.newContext({ storageState: AC5_STATE_PATH });
      const authedPage = await authedContext.newPage();
      await authedPage.goto(STORAGE_STATE_URL);
      await authedPage.reload();
      await expect(new StorageStatePage(authedPage).displayName).toHaveText(ADMIN.displayName);
      await authedContext.close();
    });
  });

  // Accessibility — scan unauthenticated + admin-authenticated + user-authenticated states
  // (Gap #3: axe multi-state). Each state is captured independently so this block is safe
  // to run under fullyParallel workers.
  test.describe.serial('accessibility (WCAG 2.x, axe)', () => {
    test.beforeAll(async ({ browser }) => {
      const adminContext = await browser.newContext();
      const adminPage = await adminContext.newPage();
      await loginAndSaveState(adminPage, adminContext, ADMIN.username, ADMIN.password, A11Y_ADMIN_PATH);
      await adminContext.close();

      const userContext = await browser.newContext();
      const userPage = await userContext.newPage();
      await loginAndSaveState(userPage, userContext, USER.username, USER.password, A11Y_USER_PATH);
      await userContext.close();
    });

    test('no violations on unauthenticated storage-state page', async ({ page }) => {
      await page.goto(STORAGE_STATE_URL);
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations on admin-authenticated view', async ({ browser }) => {
      const authedContext = await browser.newContext({ storageState: A11Y_ADMIN_PATH });
      const authedPage = await authedContext.newPage();
      await authedPage.goto(STORAGE_STATE_URL);
      expect((await scan(authedPage)).violations).toEqual([]);
      await authedContext.close();
    });

    test('no violations on user-authenticated view', async ({ browser }) => {
      const authedContext = await browser.newContext({ storageState: A11Y_USER_PATH });
      const authedPage = await authedContext.newPage();
      await authedPage.goto(STORAGE_STATE_URL);
      expect((await scan(authedPage)).violations).toEqual([]);
      await authedContext.close();
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach warm load
test.describe('performance @performance', () => {
  test('initial storage-state page load is within budget', async ({ page }) => {
    await page.goto(STORAGE_STATE_URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
