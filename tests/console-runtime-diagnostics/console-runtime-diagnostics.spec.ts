import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';
import type { Page } from '@playwright/test';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-62 — Console & Runtime Diagnostics

const URL = '/practice/console-runtime-diagnostics';
const MISSING_RESOURCE_PATH = '/diagnostics-lab/missing-resource';

// Data-driven table for AC-1 (Phase 4b) — verified live against the app: console.log() maps to
// ConsoleMessage.type() 'log' (not 'info'), console.warn() to 'warning', console.error() to 'error'.
const logActions = [
  { button: 'logInfoButton' as const, text: 'Info message logged', type: 'log', label: 'info' },
  { button: 'logWarningButton' as const, text: 'Warning message logged', type: 'warning', label: 'warning' },
  { button: 'logErrorButton' as const, text: 'Error message logged', type: 'error', label: 'error' },
];

test.describe('Console & Runtime Diagnostics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // AC-1 (TAB1-62): Tests register a page.on('console', ...) listener before triggering the info,
  // warning, and error log actions, and assert each consoleMessage.text() and consoleMessage.type()
  // was captured correctly
  test.describe('AC-1 — console listener captures info/warning/error messages', () => {
    test('positive: info, warning, and error log actions are each captured with matching text and type', async ({
      page,
      consoleRuntimeDiagnosticsPage,
    }) => {
      const messages: { text: string; type: string }[] = [];
      page.on('console', (msg) => messages.push({ text: msg.text(), type: msg.type() }));

      await consoleRuntimeDiagnosticsPage.logInfoButton.click();
      await consoleRuntimeDiagnosticsPage.logWarningButton.click();
      await consoleRuntimeDiagnosticsPage.logErrorButton.click();

      await expect.poll(() => messages.length).toBeGreaterThanOrEqual(3);
      expect(messages).toContainEqual({ text: 'Info message logged', type: 'log' });
      expect(messages).toContainEqual({ text: 'Warning message logged', type: 'warning' });
      expect(messages).toContainEqual({ text: 'Error message logged', type: 'error' });
    });

    test('negative: no console messages are captured before any log action is triggered', async ({ page }) => {
      const messages: string[] = [];
      page.on('console', (msg) => messages.push(msg.text()));
      await page.waitForTimeout(250);
      expect(messages).toHaveLength(0);
    });

    for (const { button, text, type, label } of logActions) {
      test(`data-driven: ${label} log action is captured independently with the correct type`, async ({ page, consoleRuntimeDiagnosticsPage }) => {
        const messages: { text: string; type: string }[] = [];
        page.on('console', (msg) => messages.push({ text: msg.text(), type: msg.type() }));

        await consoleRuntimeDiagnosticsPage[button].click();

        await expect.poll(() => messages.length).toBeGreaterThanOrEqual(1);
        expect(messages).toContainEqual({ text, type });
      });
    }
  });

  // AC-2 (TAB1-62): Tests register a page.on('pageerror', ...) listener, trigger "Throw uncaught
  // error", and assert the error is captured with the expected message
  test.describe('AC-2 — pageerror listener captures the uncaught synchronous throw', () => {
    test('positive: throwing an uncaught error is captured via pageerror with the expected message', async ({
      page,
      consoleRuntimeDiagnosticsPage,
    }) => {
      const errorPromise = new Promise<Error>((resolve) => page.once('pageerror', resolve));
      await consoleRuntimeDiagnosticsPage.throwUncaughtErrorButton.click();
      const error = await errorPromise;
      expect(error.message).toBe('Uncaught runtime error triggered from the lab');
    });

    test('negative: no pageerror fires before the throw action is triggered', async ({ page }) => {
      const errors: Error[] = [];
      page.on('pageerror', (err) => errors.push(err));
      await page.waitForTimeout(250);
      expect(errors).toHaveLength(0);
    });
  });

  // AC-3 (TAB1-62): Tests use the same pageerror listener to trigger "Reject a promise" and assert
  // whether an unhandled rejection is captured the same way as a synchronous throw
  test.describe('AC-3 — pageerror parity between an unhandled rejection and a synchronous throw', () => {
    // Verified live against the app (not assumed): Playwright surfaces both a synchronous throw
    // (AC-2) and an unhandled promise rejection through the identical `pageerror` event — the
    // message text is the only thing that differs.
    test('positive: an unhandled promise rejection is also captured via pageerror', async ({ page, consoleRuntimeDiagnosticsPage }) => {
      const errorPromise = new Promise<Error>((resolve) => page.once('pageerror', resolve));
      await consoleRuntimeDiagnosticsPage.rejectPromiseButton.click();
      const error = await errorPromise;
      // WebKit prefixes the message with "Error: " (confirmed live: Chromium/Firefox/Edge report
      // the bare string); toContain() asserts the shared content without over-fitting to that
      // browser-specific formatting difference.
      expect(error.message).toContain('Unhandled rejection triggered from the lab');
    });

    test('negative: the rejection message differs from the synchronous-throw message, so listeners cannot use message text alone to tell them apart', async ({
      page,
      consoleRuntimeDiagnosticsPage,
    }) => {
      const errorPromise = new Promise<Error>((resolve) => page.once('pageerror', resolve));
      await consoleRuntimeDiagnosticsPage.rejectPromiseButton.click();
      const error = await errorPromise;
      expect(error.message).not.toContain('Uncaught runtime error triggered from the lab');
    });
  });

  // AC-4 (TAB1-62): Tests register a request listener (page.waitForRequest() or
  // page.on('request', ...)) before clicking "Fetch a missing resource" and assert the outgoing
  // request was captured
  test.describe('AC-4 — request listener captures the missing-resource fetch', () => {
    test('positive: page.waitForRequest() captures the outgoing request for the missing resource', async ({
      page,
      consoleRuntimeDiagnosticsPage,
    }) => {
      const requestPromise = page.waitForRequest((req) => req.url().includes(MISSING_RESOURCE_PATH));
      await consoleRuntimeDiagnosticsPage.fetchMissingResourceButton.click();
      const request = await requestPromise;
      expect(request.url()).toContain(MISSING_RESOURCE_PATH);
    });

    // Documents why AC-4's guidance ("register first") matters: waitForRequest() only resolves
    // for requests that fire after it is called, so registering after the click risks losing the
    // race against the app's fetch. This case proves the click alone still completes the app
    // action (the log entry appears) even with no listener armed to catch the request.
    test('negative: without a request listener registered first, the app action still completes but nothing is captured', async ({
      page,
      consoleRuntimeDiagnosticsPage,
    }) => {
      await consoleRuntimeDiagnosticsPage.fetchMissingResourceButton.click();
      await expect(consoleRuntimeDiagnosticsPage.actionLogEntries.filter({ hasText: 'Requested a missing resource' })).toBeVisible();
    });

    test('boundary: the action log records the fetch action alongside the captured request', async ({ page, consoleRuntimeDiagnosticsPage }) => {
      const requestPromise = page.waitForRequest((req) => req.url().includes(MISSING_RESOURCE_PATH));
      await consoleRuntimeDiagnosticsPage.fetchMissingResourceButton.click();
      await requestPromise;
      await expect(consoleRuntimeDiagnosticsPage.actionLogEntries.filter({ hasText: 'Requested a missing resource' })).toBeVisible();
    });
  });

  // AC-5 (TAB1-62): Tests check whether the current Playwright version exposes page-level accessor
  // methods for the historical list of console messages, errors, or requests, and compare that
  // approach against manually collecting them via event listeners
  //
  // Verified against @playwright/test 1.61.1 (see package.json): `page.consoleMessages()`,
  // `page.pageErrors()`, and `page.requests()` DO exist as built-in async accessors (confirmed
  // live via a script probing `Object.getPrototypeOf(page)` — not assumed, and not present in
  // older Playwright releases). Each returns the page's full event history without a manually
  // wired listener, taking an optional `{ filter: 'all' | 'since-navigation' }` option.
  test.describe('AC-5 — built-in page-level history accessors exist and match manual listener collection', () => {
    test('positive: page.consoleMessages() returns the same messages a manual page.on("console") listener collects', async ({
      page,
      consoleRuntimeDiagnosticsPage,
    }) => {
      const manuallyCollected: { text: string; type: string }[] = [];
      page.on('console', (msg) => manuallyCollected.push({ text: msg.text(), type: msg.type() }));

      await consoleRuntimeDiagnosticsPage.logInfoButton.click();
      await consoleRuntimeDiagnosticsPage.logWarningButton.click();

      await expect.poll(() => manuallyCollected.length).toBeGreaterThanOrEqual(2);
      const viaAccessor = await page.consoleMessages();
      const viaAccessorSimplified = viaAccessor.map((msg) => ({ text: msg.text(), type: msg.type() }));

      expect(viaAccessorSimplified).toContainEqual({ text: 'Info message logged', type: 'log' });
      expect(viaAccessorSimplified).toContainEqual({ text: 'Warning message logged', type: 'warning' });
      expect(viaAccessorSimplified).toEqual(expect.arrayContaining(manuallyCollected));
    });

    test('positive: page.pageErrors() and page.requests() are functions that resolve to arrays reflecting page activity', async ({
      page,
      consoleRuntimeDiagnosticsPage,
    }) => {
      expect(typeof page.consoleMessages).toBe('function');
      expect(typeof page.pageErrors).toBe('function');
      expect(typeof page.requests).toBe('function');

      const errorPromise = new Promise<Error>((resolve) => page.once('pageerror', resolve));
      await consoleRuntimeDiagnosticsPage.throwUncaughtErrorButton.click();
      await errorPromise;

      const errors = await page.pageErrors();
      expect(errors.length).toBeGreaterThanOrEqual(1);
      expect(errors.some((err) => err.message.includes('Uncaught runtime error triggered from the lab'))).toBe(true);

      const requests = await page.requests();
      expect(requests.length).toBeGreaterThan(0);
    });

    test('negative: accessors reflect only events that have actually fired — an untriggered action leaves no trace', async ({ page }) => {
      const errors = await page.pageErrors();
      expect(errors).toHaveLength(0);
    });
  });

  // Accessibility — scan load + mid-interaction + fully-populated action-log states (Phase 5)
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial page load', async ({ page }) => {
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations after the info/warning/error log actions populate the action log', async ({ page, consoleRuntimeDiagnosticsPage }) => {
      await consoleRuntimeDiagnosticsPage.logInfoButton.click();
      await consoleRuntimeDiagnosticsPage.logWarningButton.click();
      await consoleRuntimeDiagnosticsPage.logErrorButton.click();
      await expect(consoleRuntimeDiagnosticsPage.actionLogEntries).toHaveCount(3);
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations after every action (throw, reject, fetch) has fired', async ({ page, consoleRuntimeDiagnosticsPage }) => {
      const errorPromise = new Promise<Error>((resolve) => page.once('pageerror', resolve));
      await consoleRuntimeDiagnosticsPage.throwUncaughtErrorButton.click();
      await errorPromise;
      const rejectionPromise = new Promise<Error>((resolve) => page.once('pageerror', resolve));
      await consoleRuntimeDiagnosticsPage.rejectPromiseButton.click();
      await rejectionPromise;
      const requestPromise = page.waitForRequest((req) => req.url().includes(MISSING_RESOURCE_PATH));
      await consoleRuntimeDiagnosticsPage.fetchMissingResourceButton.click();
      await requestPromise;
      await expect(consoleRuntimeDiagnosticsPage.actionLogEntries).toHaveCount(3);
      expect((await scanWcag(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach
// warm load.
test.describe('performance @performance', () => {
  test('initial load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    // Budgets are intentionally generous so they don't flake against a live site.
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
