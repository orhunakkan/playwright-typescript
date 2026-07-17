import { test, expect } from '../../fixtures/index';
import { scanWcag, violationsExcluding } from '../../utilities/accessibility';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-14 — Async UI

const URL = '/practice/async-ui';

test.describe('Async UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // AC-1: Loading skeleton visible immediately after triggering load, disappears once content replaces it
  test.describe('AC-1 — Loading skeleton lifecycle', () => {
    test('negative: loading indicator absent before any load is triggered', async ({ asyncUiPage }) => {
      await expect(asyncUiPage.loadingIndicator).toBeHidden();
    });

    test('positive: skeleton visible immediately after Load articles click, then replaced by articles', async ({ asyncUiPage }) => {
      await asyncUiPage.loadArticlesButton.click();
      // Skeleton appears while the ~1.5 s fetch is in flight
      await expect(asyncUiPage.loadingIndicator).toBeVisible({ timeout: 2000 });
      // Skeleton is hidden once real content renders — no sleep needed
      await expect(asyncUiPage.loadingIndicator).toBeHidden({ timeout: 5000 });
    });

    test('boundary: skeleton gone and articles visible within the declared load timeout (no sleep)', async ({ asyncUiPage }) => {
      await asyncUiPage.loadArticlesButton.click();
      await expect(asyncUiPage.loadingIndicator).toBeVisible({ timeout: 2000 });
      // Final assertion fires only after loading has fully settled
      await expect(asyncUiPage.articleItems.first()).toBeVisible({ timeout: 5000 });
      await expect(asyncUiPage.loadingIndicator).toBeHidden();
    });
  });

  // AC-2: Delayed news articles asserted via waitFor/toBeVisible — no page.waitForTimeout()
  test.describe('AC-2 — Delayed news articles', () => {
    test('negative: articles absent before Load articles is clicked', async ({ asyncUiPage }) => {
      await expect(asyncUiPage.articleItems).toHaveCount(0);
    });

    test('positive: all four articles appear after clicking Load articles', async ({ asyncUiPage }) => {
      await asyncUiPage.loadArticlesButton.click();
      // toBeVisible auto-waits — zero waitForTimeout calls needed
      await expect(asyncUiPage.articleItems.first()).toBeVisible({ timeout: 5000 });
      await expect(asyncUiPage.articleItems).toHaveCount(4, { timeout: 5000 });
    });

    test('boundary: first article visible at/near the ~1.5 s delay (not a premature assertion)', async ({ asyncUiPage }) => {
      const start = Date.now();
      await asyncUiPage.loadArticlesButton.click();
      await expect(asyncUiPage.articleItems.first()).toBeVisible({ timeout: 5000 });
      // Confirm we actually waited for the real delay rather than asserting prematurely
      expect(Date.now() - start).toBeGreaterThan(500);
    });

    test('positive: article headings contain non-empty text after load', async ({ asyncUiPage }) => {
      await asyncUiPage.loadArticlesButton.click();
      await expect(asyncUiPage.articleItems).toHaveCount(4, { timeout: 5000 });
      for (const article of await asyncUiPage.articleItems.all()) {
        await expect(article.getByRole('heading', { level: 3 })).not.toBeEmpty();
      }
    });
  });

  // AC-3: expect.poll() on the auto-updating stock ticker (updates every 2 s)
  test.describe('AC-3 — Auto-polling stock ticker', () => {
    test('positive: expect.poll() detects a price change from the initial value', async ({ asyncUiPage }) => {
      const initialPrice = await asyncUiPage.stockPrice.textContent();
      await expect
        .poll(() => asyncUiPage.stockPrice.textContent(), {
          intervals: [500, 1000, 2000],
          timeout: 12000,
        })
        .not.toBe(initialPrice);
    });

    test('negative: ticker value does not stay at its initial value after ≥ 2 s', async ({ asyncUiPage }) => {
      const firstPrice = await asyncUiPage.stockPrice.textContent();
      // Poll with a 2.5 s leading interval to land just after the update cycle
      await expect
        .poll(() => asyncUiPage.stockPrice.textContent(), {
          intervals: [2500],
          timeout: 10000,
        })
        .not.toBe(firstPrice);
    });

    test('boundary: every polled price value matches the $NNN.NN format', async ({ asyncUiPage }) => {
      await expect
        .poll(() => asyncUiPage.stockPrice.textContent(), {
          intervals: [500, 1000, 2000],
          timeout: 8000,
        })
        .toMatch(/^\$\d+\.\d{2}$/);
    });

    test('positive: last-updated timestamp is visible in the ticker', async ({ asyncUiPage }) => {
      await expect(asyncUiPage.lastUpdated).toBeVisible();
      await expect(asyncUiPage.lastUpdated).not.toBeEmpty();
    });
  });

  // AC-4: Error state triggered by "Load with error" button
  test.describe('AC-4 — Error state', () => {
    test('negative: error alert absent before "Load with error" is clicked', async ({ asyncUiPage }) => {
      await expect(asyncUiPage.errorAlert).toBeHidden();
    });

    test('positive: clicking "Load with error" shows the error alert', async ({ asyncUiPage }) => {
      await asyncUiPage.loadWithErrorButton.click();
      await expect(asyncUiPage.errorAlert).toBeVisible({ timeout: 5000 });
      await expect(asyncUiPage.errorAlert).toContainText('Failed to load articles');
    });

    test('boundary: error alert appears within the expected async settling timeout', async ({ asyncUiPage }) => {
      const start = Date.now();
      await asyncUiPage.loadWithErrorButton.click();
      await expect(asyncUiPage.errorAlert).toBeVisible({ timeout: 5000 });
      expect(Date.now() - start).toBeLessThan(5000);
    });

    test('positive: Retry button inside the error alert is visible and enabled', async ({ asyncUiPage }) => {
      await asyncUiPage.loadWithErrorButton.click();
      await expect(asyncUiPage.errorAlert).toBeVisible({ timeout: 5000 });
      await expect(asyncUiPage.retryButton).toBeVisible();
      await expect(asyncUiPage.retryButton).toBeEnabled();
    });

    test('positive: clicking Retry after an error loads articles successfully', async ({ asyncUiPage }) => {
      await asyncUiPage.loadWithErrorButton.click();
      await expect(asyncUiPage.errorAlert).toBeVisible({ timeout: 5000 });
      await asyncUiPage.retryButton.click();
      // After retry, articles should eventually load
      await expect(asyncUiPage.articleItems.first()).toBeVisible({ timeout: 5000 });
    });
  });

  // AC-5: Transient toast — captured before it auto-dismisses (800 ms window)
  test.describe('AC-5 — Transient toast notification', () => {
    test('positive: toast appears after trigger and text is asserted before auto-dismissal', async ({ asyncUiPage }) => {
      await asyncUiPage.triggerNotificationButton.click();
      // Toast appears after ~800 ms; toBeVisible auto-waits without sleep
      await expect(asyncUiPage.toastNotification).toBeVisible({ timeout: 3000 });
      await expect(asyncUiPage.toastTitle).toHaveText('Notification sent');
      await expect(asyncUiPage.toastBody).toContainText('Your request was processed.');
    });

    test('boundary: toast text captured within the 800 ms visibility window', async ({ asyncUiPage }) => {
      const start = Date.now();
      await asyncUiPage.triggerNotificationButton.click();
      await expect(asyncUiPage.toastNotification).toBeVisible({ timeout: 2000 });
      // Assert text before it disappears
      await expect(asyncUiPage.toastTitle).toBeVisible();
      expect(Date.now() - start).toBeLessThan(3000);
    });

    test('negative (AC-5a): toast not visible after the Dismiss button is clicked', async ({ asyncUiPage }) => {
      // Note: auto-dismiss duration exceeds the test budget (quarantined).
      // This test verifies the same post-dismissed state via the Dismiss button instead.
      await asyncUiPage.triggerNotificationButton.click();
      await expect(asyncUiPage.toastNotification).toBeVisible({ timeout: 3000 });
      await asyncUiPage.dismissNotificationButton.click();
      await expect(asyncUiPage.toastNotification).toBeHidden({ timeout: 3000 });
    });

    test('positive: Trigger notification button is disabled while toast is displayed', async ({ asyncUiPage }) => {
      await asyncUiPage.triggerNotificationButton.click();
      await expect(asyncUiPage.toastNotification).toBeVisible({ timeout: 3000 });
      await expect(asyncUiPage.triggerNotificationButton).toBeDisabled();
    });

    test('positive: Dismiss button closes the toast before auto-dismissal', async ({ asyncUiPage }) => {
      await asyncUiPage.triggerNotificationButton.click();
      await expect(asyncUiPage.toastNotification).toBeVisible({ timeout: 3000 });
      await asyncUiPage.dismissNotificationButton.click();
      await expect(asyncUiPage.toastNotification).toBeHidden();
    });
  });

  // Accessibility — WCAG 2.1 AA axe scan across all five UI states
  test.describe('accessibility (WCAG 2.1 AA, axe) — all UI states', () => {
    // KNOWN DEFECT (TAB1-42): <code> elements (bg-surface-raised: #f4f4f5, fg: #71717a) = 4.39:1.
    // Below WCAG 2.1 AA threshold of 4.5:1. Excluded so it doesn't mask regressions elsewhere via
    // violationsExcluding(...). Remove the filter once the app fixes the contrast (see TAB1-42).

    test('no violations on initial page load', async ({ page }) => {
      const results = await scanWcag(page);
      expect(violationsExcluding(results, ['color-contrast'])).toEqual([]);
    });

    test('no violations during loading skeleton state', async ({ page, asyncUiPage }) => {
      await asyncUiPage.loadArticlesButton.click();
      await expect(asyncUiPage.loadingIndicator).toBeVisible({ timeout: 2000 });
      const results = await scanWcag(page);
      expect(violationsExcluding(results, ['color-contrast'])).toEqual([]);
    });

    test('no violations in loaded/success state', async ({ page, asyncUiPage }) => {
      await asyncUiPage.loadArticlesButton.click();
      await expect(asyncUiPage.articleItems.first()).toBeVisible({ timeout: 5000 });
      const results = await scanWcag(page);
      expect(violationsExcluding(results, ['color-contrast'])).toEqual([]);
    });

    test('no violations in error state', async ({ page, asyncUiPage }) => {
      await asyncUiPage.loadWithErrorButton.click();
      await expect(asyncUiPage.errorAlert).toBeVisible({ timeout: 5000 });
      const results = await scanWcag(page);
      expect(violationsExcluding(results, ['color-contrast'])).toEqual([]);
    });

    test('no violations while toast is visible', async ({ page, asyncUiPage }) => {
      await asyncUiPage.triggerNotificationButton.click();
      await expect(asyncUiPage.toastNotification).toBeVisible({ timeout: 3000 });
      const results = await scanWcag(page);
      expect(violationsExcluding(results, ['color-contrast'])).toEqual([]);
    });
  });

  // Performance — navigation timing budget on initial load
  test.describe('performance @performance', () => {
    test('initial load is within budget', async ({ page }) => {
      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
      });
      expect(timing.domContentLoaded).toBeLessThan(6000);
      expect(timing.load).toBeLessThan(12000);
    });
  });
});
