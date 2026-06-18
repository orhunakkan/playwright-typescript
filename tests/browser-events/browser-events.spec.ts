import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-17 — Browser Events

const URL = '/practice/browser-events';

test.describe('Browser Events', () => {
  test.beforeEach(async ({ browserEventsPage }) => {
    await browserEventsPage.goto();
  });

  // AC-1: page.on("dialog") handler registered before triggering each dialog type
  test.describe('AC-1 — Dialog handler registration timing', () => {
    test('positive: alert handler registered before click accepts dialog; result shown on page', async ({ page, browserEventsPage }) => {
      page.once('dialog', (dialog) => dialog.accept());
      await browserEventsPage.triggerAlertButton.click();
      await expect(browserEventsPage.dialogResult).toHaveText('Last dialog: alert → accepted');
    });

    test('boundary: confirm handler registered before click — accepted outcome on page', async ({ page, browserEventsPage }) => {
      page.once('dialog', (dialog) => dialog.accept());
      await browserEventsPage.triggerConfirmButton.click();
      await expect(browserEventsPage.dialogResult).toHaveText('Last dialog: confirm → accepted');
    });

    test('boundary: prompt handler registered before click — outcome visible on page', async ({ page, browserEventsPage }) => {
      page.once('dialog', (dialog) => dialog.accept('timing-test'));
      await browserEventsPage.triggerPromptButton.click();
      await expect(browserEventsPage.dialogResult).toContainText('prompt');
      await expect(browserEventsPage.dialogResult).toContainText('timing-test');
    });
  });

  // AC-2: Accept and dismiss confirm dialog in separate test cases; assert distinct outcomes
  test.describe('AC-2 — Confirm dialog accept and dismiss', () => {
    test('positive: accepting confirm dialog shows "accepted" outcome', async ({ page, browserEventsPage }) => {
      page.once('dialog', (dialog) => dialog.accept());
      await browserEventsPage.triggerConfirmButton.click();
      await expect(browserEventsPage.dialogResult).toHaveText('Last dialog: confirm → accepted');
    });

    test('negative: dismissing confirm dialog shows "dismissed" outcome — not accepted', async ({ page, browserEventsPage }) => {
      page.once('dialog', (dialog) => dialog.dismiss());
      await browserEventsPage.triggerConfirmButton.click();
      await expect(browserEventsPage.dialogResult).toHaveText('Last dialog: confirm → dismissed');
    });

    test('boundary: accept and dismiss outcomes are distinct page states', async ({ page, browserEventsPage }) => {
      page.once('dialog', (dialog) => dialog.accept());
      await browserEventsPage.triggerConfirmButton.click();
      const acceptedText = await browserEventsPage.dialogResult.textContent();

      await browserEventsPage.goto();
      page.once('dialog', (dialog) => dialog.dismiss());
      await browserEventsPage.triggerConfirmButton.click();
      const dismissedText = await browserEventsPage.dialogResult.textContent();

      expect(acceptedText).not.toEqual(dismissedText);
    });
  });

  // AC-3: Prompt handler returns a string; page displays exactly that string
  test.describe('AC-3 — Prompt dialog return value', () => {
    test('positive: returning "Hello Playwright" appears exactly on the page', async ({ page, browserEventsPage }) => {
      page.once('dialog', (dialog) => dialog.accept('Hello Playwright'));
      await browserEventsPage.triggerPromptButton.click();
      await expect(browserEventsPage.dialogResult).toHaveText('Last dialog: prompt → "Hello Playwright"');
    });

    test('boundary: empty string returned to prompt shows defined state without crash', async ({ page, browserEventsPage }) => {
      page.once('dialog', (dialog) => dialog.accept(''));
      await browserEventsPage.triggerPromptButton.click();
      await expect(browserEventsPage.dialogResult).toBeVisible();
      await expect(browserEventsPage.dialogResult).toContainText('prompt');
    });

    test('boundary: special characters <>& returned to prompt appear verbatim in innerText', async ({ page, browserEventsPage }) => {
      page.once('dialog', (dialog) => dialog.accept('<>&'));
      await browserEventsPage.triggerPromptButton.click();
      const text = await browserEventsPage.dialogResult.innerText();
      expect(text).toContain('<>&');
    });
  });

  // AC-4: locator.setInputFiles() on hidden input — no OS picker triggered
  test.describe('AC-4 — File upload via setInputFiles', () => {
    test('positive: setInputFiles on hidden input sets file; filename shown on page', async ({ browserEventsPage }) => {
      await browserEventsPage.fileInput.setInputFiles({
        name: 'test-upload.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('playwright upload test'),
      });
      await expect(browserEventsPage.uploadStatus).toContainText('Selected: test-upload.txt');
    });

    test('positive: initial status is "No file selected yet." before any upload', async ({ browserEventsPage }) => {
      await expect(browserEventsPage.uploadStatus).toHaveText('No file selected yet.');
    });

    test('boundary: setInputFiles([]) clears the selection; status resets', async ({ browserEventsPage }) => {
      await browserEventsPage.fileInput.setInputFiles({
        name: 'clear-test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('to be cleared'),
      });
      await expect(browserEventsPage.uploadStatus).toContainText('clear-test.txt');

      await browserEventsPage.fileInput.setInputFiles([]);
      await expect(browserEventsPage.uploadStatus).toHaveText('No file selected yet.');
    });
  });

  // AC-5: page.waitForEvent("download") captures download; suggestedFilename asserted
  // NOTE: DOM download attribute is "stagecraft-sample.txt"; AC-5 states "sample.txt" — see defect
  test.describe('AC-5 — File download', () => {
    test('positive: waitForEvent("download") captures download before click; file completes', async ({ page, browserEventsPage }) => {
      const [download] = await Promise.all([page.waitForEvent('download'), browserEventsPage.downloadLink.click()]);
      await download.path();
      expect(download.suggestedFilename()).toBe('stagecraft-sample.txt');
    });

    test('boundary: suggestedFilename matches exactly — case-sensitive; "sample.txt" variant absent', async ({ page, browserEventsPage }) => {
      const [download] = await Promise.all([page.waitForEvent('download'), browserEventsPage.downloadLink.click()]);
      const filename = download.suggestedFilename();
      expect(filename).not.toBe('sample.txt');
      expect(filename).not.toBe('Sample.txt');
      expect(filename).toBe('stagecraft-sample.txt');
    });
  });

  // AC-6: waitForURL / waitForNavigation before asserting final URL
  test.describe('AC-6 — Navigation event', () => {
    test('positive: waitForURL resolves full transition before URL assertion', async ({ page, browserEventsPage }) => {
      await Promise.all([page.waitForURL('/'), browserEventsPage.navigateToHomeLink.click()]);
      expect(page.url()).toMatch(/stagecraftlabs\.com\/?$/);
    });

    test('boundary: URL assertion runs only after navigation settles; lab path gone', async ({ page, browserEventsPage }) => {
      const navigationPromise = page.waitForURL('/');
      await browserEventsPage.navigateToHomeLink.click();
      await navigationPromise;
      expect(page.url()).not.toContain('/practice/browser-events');
    });
  });

  // Accessibility — WCAG 2.1 AA axe scans across all UI states
  test.describe('accessibility (WCAG 2.1 AA, axe) — all UI states', () => {
    const scan = (page: import('@playwright/test').Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

    test('no violations on initial page load', async ({ page }) => {
      const results = await scan(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations after confirm dialog accepted', async ({ page, browserEventsPage }) => {
      page.once('dialog', (dialog) => dialog.accept());
      await browserEventsPage.triggerConfirmButton.click();
      await expect(browserEventsPage.dialogResult).toBeVisible();
      const results = await scan(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations after file upload', async ({ page, browserEventsPage }) => {
      await browserEventsPage.fileInput.setInputFiles({
        name: 'a11y-test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('accessibility test'),
      });
      await expect(browserEventsPage.uploadStatus).toContainText('a11y-test.txt');
      const results = await scan(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations after download triggered', async ({ page, browserEventsPage }) => {
      await Promise.all([page.waitForEvent('download'), browserEventsPage.downloadLink.click()]);
      const results = await scan(page);
      expect(results.violations).toEqual([]);
    });
  });

  // Performance — navigation timing budget
  test.describe('performance @performance', () => {
    test('initial load is within 3 s budget', async ({ page }) => {
      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
      });
      expect(timing.domContentLoaded).toBeLessThan(3000);
      expect(timing.load).toBeLessThan(3000);
    });
  });
});
