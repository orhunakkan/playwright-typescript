import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import * as fs from 'fs';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-19 — Debugging & Reporting

test.describe('Debugging & Reporting', () => {
  // ── AC-1 & AC-2 — Retries (test.describe.configure) + Tracing (on-first-retry) ──────

  // trace: 'on-first-retry' cannot be set inside a describe group (forces new worker).
  // Set it in playwright.config.ts use:{} or at file top-level; global config uses 'retain-on-failure'.
  test.describe('AC-1 | AC-2 — Retries and on-first-retry tracing', () => {
    test.describe.configure({ retries: 2 }); // override global retries: 0 for this suite

    test.beforeEach(async ({ debuggingReportingPage }) => {
      await debuggingReportingPage.goto();
    });

    // AC-1 positive: single click → success state; retry counter stays at 0
    test('positive [AC-1]: single flaky button click shows success; test runs without retrying', async ({ debuggingReportingPage }, testInfo) => {
      await debuggingReportingPage.clickFlakyButton();
      await expect(debuggingReportingPage.flakySuccess).toBeVisible();
      expect(testInfo.retry).toBe(0);
    });

    // AC-1 positive: clicks 1 and 2 are both successes
    test('positive [AC-1]: two consecutive clicks both produce the success state', async ({ debuggingReportingPage }) => {
      await debuggingReportingPage.clickFlakyButton();
      await expect(debuggingReportingPage.flakySuccess).toBeVisible();
      await debuggingReportingPage.clickFlakyButton();
      await expect(debuggingReportingPage.flakySuccess).toBeVisible();
    });

    // AC-1 boundary: exactly click 3 produces the error state
    test('boundary [AC-1]: exactly 3 clicks triggers the flaky error; error indicator visible', async ({ debuggingReportingPage }) => {
      for (let i = 0; i < 3; i++) {
        await debuggingReportingPage.clickFlakyButton();
      }
      await expect(debuggingReportingPage.flakyError).toBeVisible();
      await expect(debuggingReportingPage.flakyError).toContainText('Error');
    });

    // AC-1 negative: clicks 1–2 do NOT trigger the error state
    test('negative [AC-1]: clicks 1 and 2 never show the error indicator', async ({ debuggingReportingPage }) => {
      await debuggingReportingPage.clickFlakyButton();
      await expect(debuggingReportingPage.flakyError).not.toBeVisible();
      await debuggingReportingPage.clickFlakyButton();
      await expect(debuggingReportingPage.flakyError).not.toBeVisible();
    });

    // AC-2 positive: a test that passes on first attempt has no trace attachment
    test('positive [AC-2]: passing test with on-first-retry trace has no trace attachment on clean run', async ({
      debuggingReportingPage,
    }, testInfo) => {
      await debuggingReportingPage.clickFlakyButton();
      await expect(debuggingReportingPage.flakySuccess).toBeVisible();
      expect(testInfo.retry).toBe(0);
      const traceAttachment = testInfo.attachments.find((a) => a.name === 'trace');
      expect(traceAttachment).toBeUndefined();
    });

    // AC-2 negative: test that fails on retry 0 → retries → passes on retry 1, proving retry fired
    test('negative [AC-2]: test retries when first attempt fails; retry index confirms retry occurred', async ({
      debuggingReportingPage,
    }, testInfo) => {
      if (testInfo.retry === 0) {
        // Deliberately fail on the first attempt to force a retry and trigger trace
        await expect(debuggingReportingPage.flakyError).toBeVisible({ timeout: 300 });
      }
      // On retry 1+: the trace from retry 0 was saved by on-first-retry; confirm we retried
      expect(testInfo.retry).toBeGreaterThan(0);
    });
  });

  // ── AC-3 — Custom per-assertion timeout for slow operation (2 s) ─────────────────────

  test.describe('AC-3 — Custom assertion timeout for slow operation', () => {
    test.beforeEach(async ({ debuggingReportingPage }) => {
      await debuggingReportingPage.goto();
    });

    test('positive: slow operation result visible when assertion timeout raised to 3000 ms', async ({ debuggingReportingPage }) => {
      await debuggingReportingPage.triggerSlowOperation();
      await expect(debuggingReportingPage.slowResult).toBeVisible({ timeout: 3000 });
      await expect(debuggingReportingPage.slowResult).toContainText('complete');
    });

    test('boundary: timeout at 2500 ms is sufficient for the ~2 s slow operation', async ({ debuggingReportingPage }) => {
      await debuggingReportingPage.triggerSlowOperation();
      await expect(debuggingReportingPage.slowResult).toBeVisible({ timeout: 2500 });
    });

    test('negative [expected to fail]: 100 ms timeout is too short for the 2 s operation', async ({ debuggingReportingPage }) => {
      test.fail(true, 'A 100 ms timeout cannot cover a ~2 s slow operation — demonstrates why custom timeout is needed');
      await debuggingReportingPage.triggerSlowOperation();
      await expect(debuggingReportingPage.slowResult).toBeVisible({ timeout: 100 });
    });
  });

  // ── AC-4 — Screenshot: only-on-failure ───────────────────────────────────────────────

  // screenshot: 'only-on-failure' cannot be set inside a describe group (forces new worker).
  // It is already configured globally in playwright.config.ts use:{screenshot:'only-on-failure'}.
  test.describe('AC-4 — Screenshot only-on-failure', () => {
    test.beforeEach(async ({ debuggingReportingPage }) => {
      await debuggingReportingPage.goto();
    });

    test('positive: passing test produces no screenshot attachment in testInfo', async ({ debuggingReportingPage }, testInfo) => {
      await debuggingReportingPage.clickFlakyButton();
      await expect(debuggingReportingPage.flakySuccess).toBeVisible();
      const screenshotAttachment = testInfo.attachments.find((a) => a.contentType === 'image/png');
      expect(screenshotAttachment).toBeUndefined();
    });

    test('negative [expected to fail]: forced failure causes Playwright to save a screenshot artifact', async ({ page }, testInfo) => {
      test.fail(true, 'Deliberately failing to trigger the only-on-failure screenshot artifact');
      await expect(page.locator('[data-testid="nonexistent-element"]')).toBeVisible({ timeout: 200 });
    });

    test('boundary: manual screenshot written to outputDir is non-empty (> 0 bytes)', async ({ page }, testInfo) => {
      const screenshotPath = testInfo.outputPath('boundary-screenshot.png');
      await page.screenshot({ path: screenshotPath });
      expect(fs.existsSync(screenshotPath)).toBe(true);
      expect(fs.statSync(screenshotPath).size).toBeGreaterThan(0);
    });
  });

  // ── AC-5 — testInfo.attach() adds diagnostic artifacts ───────────────────────────────

  test.describe('AC-5 — testInfo.attach() adds named diagnostic artifacts', () => {
    test.beforeEach(async ({ debuggingReportingPage }) => {
      await debuggingReportingPage.goto();
    });

    test('positive: screenshot attached with testInfo.attach() is present in attachments list', async ({
      page,
      debuggingReportingPage,
    }, testInfo) => {
      await debuggingReportingPage.togglePanel();
      await expect(debuggingReportingPage.expandablePanel).toBeVisible();

      const screenshot = await page.screenshot();
      await testInfo.attach('expanded-panel-state', {
        body: screenshot,
        contentType: 'image/png',
      });

      const attachment = testInfo.attachments.find((a) => a.name === 'expanded-panel-state');
      expect(attachment).toBeDefined();
      expect(attachment?.contentType).toBe('image/png');
    });

    test('boundary: multiple attachments (screenshot + HTML) are all present in testInfo.attachments', async ({ page }, testInfo) => {
      const screenshot = await page.screenshot();
      await testInfo.attach('page-screenshot', { body: screenshot, contentType: 'image/png' });

      const html = await page.content();
      await testInfo.attach('page-html', { body: html, contentType: 'text/html' });

      expect(testInfo.attachments).toHaveLength(2);
      expect(testInfo.attachments.map((a) => a.name)).toEqual(expect.arrayContaining(['page-screenshot', 'page-html']));
    });

    test('boundary: attachment name is preserved exactly as provided', async ({ page }, testInfo) => {
      const screenshot = await page.screenshot();
      await testInfo.attach('step-1-named-screenshot', { body: screenshot, contentType: 'image/png' });
      expect(testInfo.attachments[0].name).toBe('step-1-named-screenshot');
    });
  });

  // ── AC-6 — Resilient matcher for non-deterministic uptime counter ─────────────────────

  test.describe('AC-6 — Resilient matcher for live uptime counter', () => {
    test.beforeEach(async ({ debuggingReportingPage }) => {
      await debuggingReportingPage.goto();
    });

    test('positive: regex matcher on live counter matches any valid uptime string', async ({ debuggingReportingPage }) => {
      await expect(debuggingReportingPage.liveCounter).toBeVisible();
      await expect(debuggingReportingPage.liveCounter).toHaveText(/^\d+s$/);
    });

    test('positive: two successive reads both match the pattern even as counter increments', async ({ page, debuggingReportingPage }) => {
      await expect(debuggingReportingPage.liveCounter).toHaveText(/\d+s/);
      await page.waitForTimeout(1100); // let counter tick once
      await expect(debuggingReportingPage.liveCounter).toHaveText(/\d+s/);
    });

    test('boundary: aria-label on counter element matches resilient pattern', async ({ debuggingReportingPage }) => {
      const ariaLabel = await debuggingReportingPage.liveCounter.getAttribute('aria-label');
      expect(ariaLabel).toMatch(/^\d+ seconds?$/);
    });

    test('negative [expected to fail]: exact-text assertion on live counter is flaky as value changes', async ({ debuggingReportingPage }) => {
      test.fail(true, 'Exact text on a live counter will fail once the counter increments — shows why resilient matchers are required');
      const exactText = await debuggingReportingPage.liveCounter.textContent();
      await new Promise<void>((r) => setTimeout(r, 1200));
      await expect(debuggingReportingPage.liveCounter).toHaveText(exactText ?? '');
    });
  });

  // ── Accessibility — WCAG 2.1 AA axe scans ────────────────────────────────────────────

  test.describe('accessibility (WCAG 2.1 AA, axe) — all UI states', () => {
    const scan = (page: import('@playwright/test').Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

    test('no violations on initial page load', async ({ page, debuggingReportingPage }) => {
      await debuggingReportingPage.goto();
      const results = await scan(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations after flaky button failure (error state)', async ({ page, debuggingReportingPage }) => {
      await debuggingReportingPage.goto();
      for (let i = 0; i < 3; i++) {
        await debuggingReportingPage.clickFlakyButton();
      }
      await expect(debuggingReportingPage.flakyError).toBeVisible();
      const results = await scan(page);
      expect(results.violations).toEqual([]);
    });
  });

  // ── Performance — navigation timing budget ────────────────────────────────────────────

  test.describe('performance @performance', () => {
    test('initial load is within 3 s budget', async ({ page, debuggingReportingPage }) => {
      await debuggingReportingPage.goto();
      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
      });
      expect(timing.domContentLoaded).toBeLessThan(3000);
      expect(timing.load).toBeLessThan(3000);
    });
  });
});
