import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';
import type { StubEvent } from '../../pages/server-sent-events.page';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-38 — Server-Sent Events

const URL = '/practice/server-sent-events';

test.describe('Server-Sent Events', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // AC-1 (TAB1-38): Tests click "Start Stream" and use expect.poll to wait until at least
  // three event log entries are visible in the Event Log region — against the real backend.
  test.describe('AC-1 — expect.poll waits until at least 3 entries appear after Start Stream', () => {
    test('positive: clicking Start Stream eventually produces at least 3 log entries', async ({ serverSentEventsPage }) => {
      await serverSentEventsPage.startStreamButton.click();
      await expect.poll(() => serverSentEventsPage.eventLogEntries.count()).toBeGreaterThanOrEqual(3);
    });

    test('negative: before Start Stream is clicked, the log shows the empty state with 0 entries', async ({ serverSentEventsPage }) => {
      await expect(serverSentEventsPage.eventLogEmptyMessage).toBeVisible();
      await expect(serverSentEventsPage.eventLogEntries).toHaveCount(0);
    });
  });

  // AC-2 (TAB1-38): Tests assert each SSE event type (info, warn, error) renders with its
  // corresponding colour badge text in the log. Stubbed via page.route for determinism.
  test.describe('AC-2 — each SSE event type renders its corresponding colour badge', () => {
    const badgeCases: StubEvent[] = [
      { type: 'info', message: 'Build started' },
      { type: 'warn', message: 'Deprecated API usage detected' },
      { type: 'error', message: 'Health-check failed — retrying…' },
    ];

    for (const { type, message } of badgeCases) {
      test(`data-driven: a "${type}" event renders the "${type}" badge in the log`, async ({ page, serverSentEventsPage }) => {
        await page.route('**/api/sse', (route) =>
          route.fulfill({ status: 200, contentType: 'text/event-stream', body: serverSentEventsPage.buildSsePayload([{ type, message }]) }),
        );
        await serverSentEventsPage.startStreamButton.click();

        await expect(serverSentEventsPage.logEntry(type, message)).toBeVisible();
        await expect(serverSentEventsPage.logEntry(type, message).getByText(type, { exact: true })).toBeVisible();
      });
    }

    test('boundary: the two system entries (connecting/complete) use the system badge, not info/warn/error', async ({
      page,
      serverSentEventsPage,
    }) => {
      await page.route('**/api/sse', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: serverSentEventsPage.buildSsePayload([{ type: 'info', message: 'Build started' }]),
        }),
      );
      await serverSentEventsPage.startStreamButton.click();

      await expect(serverSentEventsPage.systemBadges).toHaveCount(2);
      await expect(serverSentEventsPage.logEntry('system', 'Connecting to stream…')).toBeVisible();
      await expect(serverSentEventsPage.logEntry('system', 'Stream complete.')).toBeVisible();
    });
  });

  // AC-4 (TAB1-38): Tests use page.route("/api/sse", ...) to fulfill the request with a
  // hand-crafted SSE payload (2–3 events) and assert exactly those entries — and no others —
  // appear in the log.
  test.describe('AC-4 — page.route() stubs /api/sse and exactly the stubbed entries appear', () => {
    test('positive: a stubbed 2-event payload renders exactly those 2 entries plus the 2 system markers, no others', async ({
      page,
      serverSentEventsPage,
    }) => {
      const stub: StubEvent[] = [
        { type: 'info', message: 'Custom deploy step one' },
        { type: 'warn', message: 'Custom deploy step two' },
      ];
      await page.route('**/api/sse', (route) =>
        route.fulfill({ status: 200, contentType: 'text/event-stream', body: serverSentEventsPage.buildSsePayload(stub) }),
      );
      await serverSentEventsPage.startStreamButton.click();

      await expect(serverSentEventsPage.eventLogEntries).toHaveCount(4);
      await expect(serverSentEventsPage.logEntry('system', 'Connecting to stream…')).toBeVisible();
      await expect(serverSentEventsPage.logEntry('info', 'Custom deploy step one')).toBeVisible();
      await expect(serverSentEventsPage.logEntry('warn', 'Custom deploy step two')).toBeVisible();
      await expect(serverSentEventsPage.logEntry('system', 'Stream complete.')).toBeVisible();
    });

    test('boundary: a stubbed 3-event payload renders exactly those 3 entries plus the 2 system markers, no others', async ({
      page,
      serverSentEventsPage,
    }) => {
      const stub: StubEvent[] = [
        { type: 'info', message: 'Custom step A' },
        { type: 'warn', message: 'Custom step B' },
        { type: 'error', message: 'Custom step C' },
      ];
      await page.route('**/api/sse', (route) =>
        route.fulfill({ status: 200, contentType: 'text/event-stream', body: serverSentEventsPage.buildSsePayload(stub) }),
      );
      await serverSentEventsPage.startStreamButton.click();

      await expect(serverSentEventsPage.eventLogEntries).toHaveCount(5);
      for (const { type, message } of stub) {
        await expect(serverSentEventsPage.logEntry(type, message)).toBeVisible();
      }
    });

    test('negative: entries from a previous stub do not bleed into a differently-stubbed run', async ({ page, serverSentEventsPage }) => {
      await page.route('**/api/sse', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: serverSentEventsPage.buildSsePayload([{ type: 'error', message: 'Stub-only entry' }]),
        }),
      );
      await serverSentEventsPage.startStreamButton.click();
      await expect(serverSentEventsPage.eventLogEntries).toHaveCount(3);

      await expect(serverSentEventsPage.logEntry('info', 'Build started')).toHaveCount(0);
      await expect(serverSentEventsPage.logEntry('info', 'Deploy succeeded ✓')).toHaveCount(0);
    });
  });

  // AC-5 (TAB1-38): Tests click "Stop Stream" and assert the log entry count does not grow
  // after stopping. Clicking Stop immediately after Start (rather than waiting) reliably
  // catches the stream mid-flight — waiting even a few hundred ms let the whole (fast) real
  // stream finish first, which made the assertion vacuously true against a fully-drained log.
  test.describe('AC-5 — Stop Stream halts further log growth', () => {
    test('positive: clicking Stop Stream shortly after Start halts further log growth', async ({ page, serverSentEventsPage }) => {
      await serverSentEventsPage.startStreamButton.click();
      await serverSentEventsPage.stopStreamButton.click();

      const countAfterStop = await serverSentEventsPage.eventLogEntries.count();
      await page.waitForTimeout(1000);
      await expect(serverSentEventsPage.eventLogEntries).toHaveCount(countAfterStop);
    });

    test('negative: Start Stream re-enables and Stop Stream disables after stopping', async ({ serverSentEventsPage }) => {
      await serverSentEventsPage.startStreamButton.click();
      await serverSentEventsPage.stopStreamButton.click();

      await expect(serverSentEventsPage.startStreamButton).toBeEnabled();
      await expect(serverSentEventsPage.stopStreamButton).toBeDisabled();
    });

    test('boundary: Stop Stream is disabled and Start Stream is enabled before any stream begins', async ({ serverSentEventsPage }) => {
      await expect(serverSentEventsPage.startStreamButton).toBeEnabled();
      await expect(serverSentEventsPage.stopStreamButton).toBeDisabled();
    });
  });

  // Accessibility — scan idle, populated (streaming), and stopped states (Phase 5). Populated
  // and stopped states use a stub so the scan runs against a stable, fully-rendered log rather
  // than racing a live stream.
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial page load (idle, pre-stream)', async ({ page }) => {
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations with a populated event log (streaming/complete state)', async ({ page, serverSentEventsPage }) => {
      await page.route('**/api/sse', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'text/event-stream',
          body: serverSentEventsPage.buildSsePayload([
            { type: 'info', message: 'Build started' },
            { type: 'warn', message: 'Deprecated API usage detected' },
            { type: 'error', message: 'Health-check failed — retrying…' },
          ]),
        }),
      );
      await serverSentEventsPage.startStreamButton.click();
      await expect(serverSentEventsPage.eventLogEntries).toHaveCount(5);

      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations after Stop Stream is clicked', async ({ page, serverSentEventsPage }) => {
      await serverSentEventsPage.startStreamButton.click();
      await serverSentEventsPage.stopStreamButton.click();

      expect((await scanWcag(page)).violations).toEqual([]);
    });
  });
});

// AC-3 (TAB1-38): Tests use page.waitForResponse to capture the /api/sse response before
// navigating and assert the Content-Type header is text/event-stream. Kept outside the shared
// beforeEach so the response promise can be registered before page.goto, per the AC's literal
// requirement.
test.describe('AC-3 — page.waitForResponse captures the /api/sse response headers', () => {
  test('positive: the captured /api/sse response has Content-Type text/event-stream', async ({ page, serverSentEventsPage }) => {
    const responsePromise = page.waitForResponse((response) => response.url().endsWith('/api/sse'));
    await page.goto(URL);
    await serverSentEventsPage.startStreamButton.click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('text/event-stream');
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach warm load
test.describe('performance @performance', () => {
  test('initial server-sent-events page load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
