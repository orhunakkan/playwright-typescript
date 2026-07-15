import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-21 — Fake Auth

const LOGIN_URL = '/practice/fake-auth';
const DASHBOARD_URL = '/practice/fake-auth/dashboard';
const AUTH_STATE_PATH = 'fixtures/auth/fake-auth.json';

// Data-driven table for AC-1: all invalid credential combinations to cover
const INVALID_CREDENTIALS = [
  { username: 'wronguser', password: 'badpass', label: 'wrong username and wrong password' },
  { username: 'alice', password: 'wrongpass', label: 'valid username, wrong password' },
  { username: 'wronguser', password: 'password123', label: 'wrong username, valid password' },
];

const scan = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

test.describe('Fake Auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
  });

  // AC-1 (TAB1-21): Tests submit the login form with wrong credentials and assert the inline
  // error message appears without relying on CSS classes
  test.describe('AC-1 — invalid credentials show inline error without CSS class assertion', () => {
    for (const { username, password, label } of INVALID_CREDENTIALS) {
      test(`negative: ${label} shows role=alert error`, async ({ fakeAuthPage }) => {
        await fakeAuthPage.usernameInput.fill(username);
        await fakeAuthPage.passwordInput.fill(password);
        await fakeAuthPage.signInButton.click();
        // Assert by role + text — NOT by CSS class (text-red-600 is implementation detail)
        await expect(fakeAuthPage.loginErrorMessage).toBeVisible();
        await expect(fakeAuthPage.loginErrorMessage).toHaveText('Invalid username or password.');
      });
    }

    test('boundary: Sign in button is disabled when both fields are empty', async ({ fakeAuthPage }) => {
      await expect(fakeAuthPage.signInButton).toBeDisabled();
    });

    test('boundary: Sign in button enables once both username and password are filled', async ({ fakeAuthPage }) => {
      await fakeAuthPage.usernameInput.fill('someuser');
      await fakeAuthPage.passwordInput.fill('somepass');
      await expect(fakeAuthPage.signInButton).toBeEnabled();
    });
  });

  // AC-2 (TAB1-21): Tests submit with valid credentials (alice / password123) and assert the
  // browser navigates to the dashboard URL using toHaveURL
  test.describe('AC-2 — valid credentials navigate to dashboard URL (toHaveURL)', () => {
    test('positive: alice/password123 navigates to dashboard and shows welcome message', async ({ fakeAuthPage, page }) => {
      await fakeAuthPage.usernameInput.fill('alice');
      await fakeAuthPage.passwordInput.fill('password123');
      await fakeAuthPage.signInButton.click();
      await expect(page).toHaveURL(/\/practice\/fake-auth\/dashboard$/);
      await expect(fakeAuthPage.dashboardHeading).toBeVisible();
      await expect(fakeAuthPage.welcomeMessage).toContainText('Alice');
      await expect(fakeAuthPage.authenticatedStatus).toBeVisible();
    });

    test('positive: bob/letmein also navigates to dashboard URL', async ({ fakeAuthPage, page }) => {
      await fakeAuthPage.usernameInput.fill('bob');
      await fakeAuthPage.passwordInput.fill('letmein');
      await fakeAuthPage.signInButton.click();
      await expect(page).toHaveURL(/\/practice\/fake-auth\/dashboard$/);
      await expect(fakeAuthPage.dashboardHeading).toBeVisible();
    });

    test('negative: valid username with wrong password stays on login and shows error', async ({ fakeAuthPage, page }) => {
      await fakeAuthPage.usernameInput.fill('alice');
      await fakeAuthPage.passwordInput.fill('wrongpassword');
      await fakeAuthPage.signInButton.click();
      await expect(page).toHaveURL(/\/practice\/fake-auth$/);
      await expect(fakeAuthPage.loginErrorMessage).toBeVisible();
      await expect(fakeAuthPage.dashboardHeading).not.toBeVisible();
    });
  });

  // AC-3 (TAB1-21): Tests navigate directly to the dashboard URL without logging in first and
  // assert the app redirects to the login page
  test.describe('AC-3 — unauthenticated direct navigation to dashboard redirects to login', () => {
    test('positive: navigating to dashboard URL without auth redirects to login page', async ({ fakeAuthPage, page }) => {
      await page.goto(DASHBOARD_URL);
      await expect(page).toHaveURL(/\/practice\/fake-auth$/);
      await expect(fakeAuthPage.loginForm).toBeVisible();
    });

    test('negative: dashboard content is not visible after redirect to login', async ({ fakeAuthPage, page }) => {
      await page.goto(DASHBOARD_URL);
      await expect(fakeAuthPage.dashboardHeading).not.toBeVisible();
      await expect(fakeAuthPage.signOutButton).not.toBeVisible();
    });
  });

  // AC-4 (TAB1-21): Tests log in, click logout, assert the user is returned to the login page,
  // and confirm the dashboard URL is no longer accessible
  test.describe('AC-4 — sign out returns to login page and revokes dashboard access', () => {
    test('positive: login then sign out returns to login page', async ({ fakeAuthPage, page }) => {
      await fakeAuthPage.usernameInput.fill('alice');
      await fakeAuthPage.passwordInput.fill('password123');
      await fakeAuthPage.signInButton.click();
      await expect(page).toHaveURL(/\/practice\/fake-auth\/dashboard$/);
      await fakeAuthPage.signOutButton.click();
      await expect(page).toHaveURL(/\/practice\/fake-auth$/);
      await expect(fakeAuthPage.loginForm).toBeVisible();
    });

    test('negative: after sign out, direct navigation to dashboard redirects back to login', async ({ fakeAuthPage, page }) => {
      await fakeAuthPage.usernameInput.fill('alice');
      await fakeAuthPage.passwordInput.fill('password123');
      await fakeAuthPage.signInButton.click();
      await expect(page).toHaveURL(/\/practice\/fake-auth\/dashboard$/);
      await fakeAuthPage.signOutButton.click();
      // Sign out clears the session via an async POST /api/auth/logout call. Navigating away
      // immediately can race that request (and cancel it), leaving the server session intact,
      // so wait for the app's own post-sign-out redirect before checking the dashboard is gated.
      await expect(page).toHaveURL(/\/practice\/fake-auth$/);
      await page.goto(DASHBOARD_URL);
      await expect(page).toHaveURL(/\/practice\/fake-auth$/);
      await expect(fakeAuthPage.dashboardHeading).not.toBeVisible();
    });
  });

  // AC-5 (TAB1-21): Tests demonstrate using context.storageState() to serialize session state
  // so subsequent tests can start pre-logged-in without repeating the UI login flow.
  // serial: test 2 depends on the state file written by test 1
  test.describe.serial('AC-5 — context.storageState() serializes session for reuse across tests', () => {
    test('positive: login and serialize session state to file with context.storageState()', async ({ fakeAuthPage, page, context }) => {
      await fakeAuthPage.usernameInput.fill('alice');
      await fakeAuthPage.passwordInput.fill('password123');
      await fakeAuthPage.signInButton.click();
      await expect(page).toHaveURL(/\/practice\/fake-auth\/dashboard$/);
      fs.mkdirSync(path.dirname(AUTH_STATE_PATH), { recursive: true });
      await context.storageState({ path: AUTH_STATE_PATH });
      expect(fs.existsSync(AUTH_STATE_PATH)).toBe(true);
      const state = JSON.parse(fs.readFileSync(AUTH_STATE_PATH, 'utf-8'));
      // Verify the serialized state contains session data (cookies or localStorage origins)
      expect(state.cookies.length + (state.origins?.length ?? 0)).toBeGreaterThan(0);
    });

    test('positive: new browser context loaded with storageState reaches dashboard without UI login', async ({ browser }) => {
      const authedContext = await browser.newContext({ storageState: AUTH_STATE_PATH });
      const authedPage = await authedContext.newPage();
      await authedPage.goto(DASHBOARD_URL);
      // Session is restored — no redirect to login
      await expect(authedPage).toHaveURL(/\/practice\/fake-auth\/dashboard$/);
      await expect(authedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      await authedContext.close();
    });
  });

  // Accessibility — scan load state + error state + dashboard state (Gap #3: axe multi-state)
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on login page load', async ({ page }) => {
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations while login error message is displayed', async ({ fakeAuthPage, page }) => {
      await fakeAuthPage.usernameInput.fill('wrong');
      await fakeAuthPage.passwordInput.fill('creds');
      await fakeAuthPage.signInButton.click();
      await expect(fakeAuthPage.loginErrorMessage).toBeVisible();
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations on dashboard (authenticated state)', async ({ fakeAuthPage, page }) => {
      await fakeAuthPage.usernameInput.fill('alice');
      await fakeAuthPage.passwordInput.fill('password123');
      await fakeAuthPage.signInButton.click();
      await expect(page).toHaveURL(/\/practice\/fake-auth\/dashboard$/);
      expect((await scan(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach warm load
test.describe('performance @performance', () => {
  test('initial login page load is within budget', async ({ page }) => {
    await page.goto(LOGIN_URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
