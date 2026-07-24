import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';
import type { Page } from '@playwright/test';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-67 — Audit Log & Search

const AUDIT_LOG_URL = '/practice/audit-log-search';
const LOGIN_URL = '/practice/fake-auth';
const ADMIN = { username: 'alice', password: 'password123' };
const USER = { username: 'bob', password: 'letmein' };
const SEEDED_TOTAL = 120;
const SEEDED_PAGE_COUNT = 6;
const SEEDED_USERNAME_TOTAL = 24;
const SQL_INJECTION_SEARCH = "' OR '1'='1' --";

async function signIn(page: Page, credentials: { username: string; password: string }) {
  await page.goto(LOGIN_URL);
  await page.getByRole('textbox', { name: 'Username' }).fill(credentials.username);
  await page.getByRole('textbox', { name: 'Password' }).fill(credentials.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/practice\/fake-auth\/dashboard$/);
}

async function seedAuditLog(page: Page) {
  await signIn(page, ADMIN);
  await page.goto(AUDIT_LOG_URL);
  await page.getByRole('button', { name: 'Reseed fixture data' }).click();
  await expect(page.getByText(`Page 1 of ${SEEDED_PAGE_COUNT} (${SEEDED_TOTAL} total)`)).toBeVisible();
}

test.describe('Audit Log & Search', () => {
  // Reseeding intentionally mutates one shared Azure SQL audit table. Fixed alice/bob identities
  // are the supported fixture contract; do not add account-provisioning endpoints for this lab.
  test.describe.configure({ mode: 'serial' });

  // AC-1 (TAB1-67): Tests assert an unauthenticated session sees a "must be signed in as an admin"
  // message, and a non-admin session (bob) sees a "does not have admin access" message.
  test.describe('AC-1 — admin authorization', () => {
    test('negative: unauthenticated and non-admin users receive distinct access messages', async ({ page, auditLogSearchPage }) => {
      await page.goto(AUDIT_LOG_URL);
      await expect(auditLogSearchPage.alertMessage).toContainText('must be signed in as an admin');

      await signIn(page, USER);
      await page.goto(AUDIT_LOG_URL);
      await expect(auditLogSearchPage.alertMessage).toContainText('does not have admin access');
      await expect(auditLogSearchPage.auditLogEntries).toHaveCount(0);
    });
  });

  // AC-2 (TAB1-67): Tests reseed fixture data via the reseed action and assert the admin sees
  // seeded audit log entries with the correct total count and page count.
  test.describe('AC-2 — fixture reseeding', () => {
    test('positive: admin reseeding restores the known entry and page totals', async ({ page, auditLogSearchPage }) => {
      await seedAuditLog(page);
      await expect(auditLogSearchPage.pageSummary).toHaveText(`Page 1 of ${SEEDED_PAGE_COUNT} (${SEEDED_TOTAL} total)`);
      await expect(auditLogSearchPage.auditLogItems).toHaveCount(20);
      await expect(auditLogSearchPage.alertMessage).toHaveCount(0);
    });
  });

  // AC-3 (TAB1-67): Tests paginate with Next and Prev and assert the row content changes between
  // pages, including at the last-page boundary.
  test.describe('AC-3 — server-side pagination', () => {
    test('positive: Next and Prev change results and the last page disables Next', async ({ page, auditLogSearchPage }) => {
      await seedAuditLog(page);
      const firstPageRows = await auditLogSearchPage.auditLogItems.allTextContents();

      await auditLogSearchPage.nextPageButton.click();
      await expect(auditLogSearchPage.pageSummary).toHaveText(`Page 2 of ${SEEDED_PAGE_COUNT} (${SEEDED_TOTAL} total)`);
      await expect(auditLogSearchPage.auditLogItems).not.toHaveText(firstPageRows);

      await auditLogSearchPage.previousPageButton.click();
      await expect(auditLogSearchPage.pageSummary).toHaveText(`Page 1 of ${SEEDED_PAGE_COUNT} (${SEEDED_TOTAL} total)`);
      await expect(auditLogSearchPage.auditLogItems).toHaveText(firstPageRows);

      for (let pageNumber = 1; pageNumber < SEEDED_PAGE_COUNT; pageNumber += 1) {
        await auditLogSearchPage.nextPageButton.click();
      }
      await expect(auditLogSearchPage.pageSummary).toHaveText(`Page ${SEEDED_PAGE_COUNT} of ${SEEDED_PAGE_COUNT} (${SEEDED_TOTAL} total)`);
      await expect(auditLogSearchPage.nextPageButton).toBeDisabled();
      await expect(auditLogSearchPage.previousPageButton).toBeEnabled();
    });
  });

  // AC-4 (TAB1-67): Tests filter by username search and assert the filtered result count and that
  // returned rows contain the searched username.
  test.describe('AC-4 — username search', () => {
    test('positive: searching bob returns only bob rows with the seeded total', async ({ page, auditLogSearchPage }) => {
      await seedAuditLog(page);
      await auditLogSearchPage.usernameInput.fill(USER.username);
      await auditLogSearchPage.searchButton.click();

      await expect(auditLogSearchPage.pageSummary).toHaveText(`Page 1 of 2 (${SEEDED_USERNAME_TOTAL} total)`);
      await expect(auditLogSearchPage.auditLogItems).toHaveCount(20);
      const rows = await auditLogSearchPage.auditLogItems.allTextContents();
      rows.forEach((row) => expect(row).toContain(USER.username));
    });
  });

  // AC-5 (TAB1-67): Tests filter by a date range and assert both the "no results" empty state and
  // a populated results state, using accessible roles rather than counting DOM nodes directly.
  test.describe('AC-5 — date-range filtering', () => {
    test('positive: date filters expose accessible empty and populated result states', async ({ page, auditLogSearchPage }) => {
      await seedAuditLog(page);
      await auditLogSearchPage.fromDateInput.fill('2099-01-01');
      await auditLogSearchPage.toDateInput.fill('2099-12-31');
      await auditLogSearchPage.searchButton.click();
      await expect(auditLogSearchPage.emptyResultsMessage).toBeVisible();
      await expect(auditLogSearchPage.auditLogEntries).toHaveCount(0);

      await auditLogSearchPage.fromDateInput.fill('2026-04-01');
      await auditLogSearchPage.toDateInput.fill('2026-05-01');
      await auditLogSearchPage.searchButton.click();
      await expect(auditLogSearchPage.auditLogEntries).toBeVisible();
      await expect(auditLogSearchPage.auditLogItems).toHaveCount(20);
    });
  });

  // AC-6 (TAB1-67): Tests submit a SQL-injection-style search string and assert it is treated as
  // a safe literal substring with no matching rows, then run a normal search afterward.
  test.describe('AC-6 — injection-safe literal search', () => {
    test('negative: SQL-injection-style input returns no rows and normal search still works', async ({ page, auditLogSearchPage }) => {
      await seedAuditLog(page);
      await auditLogSearchPage.usernameInput.fill(SQL_INJECTION_SEARCH);
      await auditLogSearchPage.searchButton.click();
      await expect(auditLogSearchPage.emptyResultsMessage).toBeVisible();
      await expect(auditLogSearchPage.pageSummary).toHaveText('Page 1 of 1 (0 total)');

      await auditLogSearchPage.usernameInput.fill(ADMIN.username);
      await auditLogSearchPage.searchButton.click();
      await expect(auditLogSearchPage.pageSummary).toHaveText(`Page 1 of 2 (${SEEDED_USERNAME_TOTAL} total)`);
      await expect(auditLogSearchPage.auditLogEntries).toBeVisible();
    });
  });

  // AC-7 (TAB1-67, adapted): fixed fixture identities are intentional. A fresh alice login must
  // be immediately queryable after reseeding, proving the shared persistent audit trail is updated.
  test.describe('AC-7 — fixed-identity login-event persistence', () => {
    test('positive: a fresh alice login is immediately queryable after reseeding', async ({ page, auditLogSearchPage }) => {
      await seedAuditLog(page);
      await page.goto('/practice/fake-auth/dashboard');
      await page.getByRole('button', { name: 'Sign out' }).click();
      await expect(page).toHaveURL(/\/practice\/fake-auth$/);
      await signIn(page, ADMIN);
      await page.goto(AUDIT_LOG_URL);
      await auditLogSearchPage.usernameInput.fill(ADMIN.username);
      await auditLogSearchPage.searchButton.click();

      await expect(auditLogSearchPage.pageSummary).toHaveText(/Page 1 of \d+ \((?:2[5-9]|[3-9]\d+|\d{3,}) total\)/);
      await expect(auditLogSearchPage.auditLogItems.first()).toContainText(ADMIN.username);
    });
  });

  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on unauthenticated, populated, and empty-result states', async ({ page, auditLogSearchPage }) => {
      await page.goto(AUDIT_LOG_URL);
      expect((await scanWcag(page)).violations).toEqual([]);

      await seedAuditLog(page);
      expect((await scanWcag(page)).violations).toEqual([]);

      await auditLogSearchPage.fromDateInput.fill('2099-01-01');
      await auditLogSearchPage.toDateInput.fill('2099-12-31');
      await auditLogSearchPage.searchButton.click();
      await expect(auditLogSearchPage.emptyResultsMessage).toBeVisible();
      expect((await scanWcag(page)).violations).toEqual([]);
    });
  });
});

test.describe('performance @performance', () => {
  test('initial audit-log page load is within budget', async ({ page }) => {
    await page.goto(AUDIT_LOG_URL);
    const timing = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: navigation.domContentLoadedEventEnd, load: navigation.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
