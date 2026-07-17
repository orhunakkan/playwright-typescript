import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-12 — Network & API

const URL = '/practice/network-api';
const NOTES_ENDPOINT = '**/api/notes';

// Controlled stub data — deterministic so assertions can be exact
const STUB_NOTES = [
  { id: 101, text: 'Stub note alpha', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 102, text: 'Stub note beta', createdAt: '2026-01-01T00:00:01.000Z' },
];

// Data-driven table for boundary payload check (AC-3)
const specialCharNotes = [
  { text: 'Note with <script>alert(1)</script>', label: 'HTML/XSS chars' },
  { text: 'Note with "quotes" & \'apostrophes\'', label: 'quotes and ampersand' },
  { text: 'ノート 📝', label: 'unicode + emoji' },
];

test.describe('Network & API', () => {
  // AC-1: Tests register a page.route() handler BEFORE navigation to intercept
  //       the initial data fetch and return controlled stub data.
  test.describe('AC-1 — page.route() registered before navigation intercepts initial fetch', () => {
    test('positive: stub notes returned before navigation render in the list', async ({ page, networkApiPage }) => {
      await page.route(NOTES_ENDPOINT, (route) => route.fulfill({ json: STUB_NOTES }));
      await page.goto(URL);

      for (const note of STUB_NOTES) {
        await expect(networkApiPage.noteItem(note.text)).toBeVisible();
      }
    });

    test('boundary: empty-array stub shows empty-state placeholder (list is not rendered)', async ({ page, networkApiPage }) => {
      await page.route(NOTES_ENDPOINT, (route) => route.fulfill({ json: [] }));
      await page.goto(URL);

      // App does not render the <ul> when notes array is empty — shows a placeholder instead.
      // Confirmed by DOM inspection: ul[aria-label="Notes list"] is absent from the DOM.
      await expect(networkApiPage.notesList).toBeHidden();
      await expect(networkApiPage.emptyStateText).toBeVisible();
    });

    test('negative: without a route handler the real endpoint is called', async ({ page, networkApiPage }) => {
      // No route registered — real GET fires and the list populates from the server.
      const responsePromise = page.waitForResponse((r) => r.url().includes('/api/notes') && r.request().method() === 'GET');
      await page.goto(URL);
      const response = await responsePromise;

      expect(response.status()).toBe(200);
      const body = (await response.json()) as Array<{ id: number; text: string }>;
      expect(Array.isArray(body)).toBe(true);
      // Real notes render — stub notes are absent (confirms no interception occurred)
      await expect(networkApiPage.noteItem(STUB_NOTES[0].text)).toBeHidden();
    });
  });

  // AC-2: Tests use page.waitForResponse() to confirm a specific endpoint was
  //       called after a UI action (adding a note).
  test.describe('AC-2 — page.waitForResponse() confirms endpoint called after UI action', () => {
    test('positive: POST /api/notes response received after Add action', async ({ page, networkApiPage }) => {
      await page.goto(URL);
      await networkApiPage.noteInput.fill('waitForResponse test note');

      // Promise.all prevents the race: listener is set before click fires the request.
      const [response] = await Promise.all([
        page.waitForResponse((r) => r.url().includes('/api/notes') && r.request().method() === 'POST'),
        networkApiPage.addButton.click(),
      ]);

      expect(response.status()).toBe(201);
    });

    test('boundary: Promise.all pattern is race-condition-safe', async ({ page, networkApiPage }) => {
      // Intercept POST to keep the test isolated from the real backend
      await page.route(NOTES_ENDPOINT, async (route) => {
        if (route.request().method() === 'POST') {
          const body = route.request().postDataJSON() as { text: string };
          await route.fulfill({ status: 201, json: { id: 999, text: body.text, createdAt: new Date().toISOString() } });
        } else {
          await route.fulfill({ json: STUB_NOTES });
        }
      });
      await page.goto(URL);
      await networkApiPage.noteInput.fill('race-safe note');

      // The Promise.all ensures waitForResponse is registered before the click
      const [response] = await Promise.all([
        page.waitForResponse((r) => r.url().includes('/api/notes') && r.request().method() === 'POST'),
        networkApiPage.addButton.click(),
      ]);

      expect(response.status()).toBe(201);
    });
  });

  // AC-3: Tests add a note via the UI and inspect the outgoing POST request
  //       payload to assert it contains the correct note text.
  test.describe('AC-3 — POST request payload inspection', () => {
    test('positive: POST payload contains the exact typed note text', async ({ page, networkApiPage }) => {
      await page.goto(URL);
      const noteText = 'Payload inspection test note';
      await networkApiPage.noteInput.fill(noteText);

      const [postRequest] = await Promise.all([
        page.waitForRequest((r) => r.url().includes('/api/notes') && r.method() === 'POST'),
        networkApiPage.addButton.click(),
      ]);

      expect(postRequest.postDataJSON()).toMatchObject({ text: noteText });
    });

    test('negative: empty input keeps Add button disabled — no POST fires', async ({ page, networkApiPage }) => {
      await page.goto(URL);
      // Input is empty on load — button must be disabled
      await expect(networkApiPage.addButton).toBeDisabled();

      let postFired = false;
      page.on('request', (req) => {
        if (req.url().includes('/api/notes') && req.method() === 'POST') postFired = true;
      });

      // Attempt to force-click a disabled button — no network request should fire
      await networkApiPage.addButton.click({ force: true });
      // Brief wait to confirm no POST was queued
      await page.waitForTimeout(300);
      expect(postFired).toBe(false);
    });

    for (const { text, label } of specialCharNotes) {
      test(`boundary: POST payload preserves special characters (${label})`, async ({ page, networkApiPage }) => {
        // Intercept POST to keep isolated; GET passes through for normal load
        await page.route(NOTES_ENDPOINT, async (route) => {
          if (route.request().method() === 'POST') {
            const body = route.request().postDataJSON() as { text: string };
            await route.fulfill({ status: 201, json: { id: 998, text: body.text, createdAt: new Date().toISOString() } });
          } else {
            await route.continue();
          }
        });
        await page.goto(URL);
        await networkApiPage.noteInput.fill(text);

        const [postRequest] = await Promise.all([
          page.waitForRequest((r) => r.url().includes('/api/notes') && r.method() === 'POST'),
          networkApiPage.addButton.click(),
        ]);

        expect(postRequest.postDataJSON()).toMatchObject({ text });
      });
    }
  });

  // AC-4: Tests simulate a server error (HTTP 500) via route.fulfill() and
  //       assert the UI displays an error state.
  test.describe('AC-4 — simulate server error → UI error state', () => {
    test('positive: GET /api/notes returning 500 shows error region', async ({ page, networkApiPage }) => {
      await page.route(NOTES_ENDPOINT, (route) =>
        route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Server Error' }) }),
      );
      await page.goto(URL);

      await expect(networkApiPage.errorRegion).toBeVisible();
    });

    test('negative: POST /api/notes returning 500 shows error region', async ({ page, networkApiPage }) => {
      await page.route(NOTES_ENDPOINT, async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Write failed' }) });
        } else {
          await route.fulfill({ json: STUB_NOTES });
        }
      });
      await page.goto(URL);
      await networkApiPage.noteInput.fill('trigger 500 on POST');
      await networkApiPage.addButton.click();

      await expect(networkApiPage.errorRegion).toBeVisible();
    });
  });

  // AC-5: Tests use route.fulfill() to return static JSON and verify the notes
  //       list renders the stubbed data correctly.
  test.describe('AC-5 — route.fulfill() with static JSON renders correct list', () => {
    test('positive: each stub note text is visible in the rendered list', async ({ page, networkApiPage }) => {
      await page.route(NOTES_ENDPOINT, (route) => route.fulfill({ json: STUB_NOTES }));
      await page.goto(URL);

      await expect(networkApiPage.notesList.locator('li')).toHaveCount(STUB_NOTES.length);
      for (const note of STUB_NOTES) {
        await expect(networkApiPage.noteItem(note.text)).toBeVisible();
      }
    });

    test('boundary: empty-array JSON → no list rendered, empty-state placeholder shown', async ({ page, networkApiPage }) => {
      await page.route(NOTES_ENDPOINT, (route) => route.fulfill({ json: [] }));
      await page.goto(URL);

      // App does not render the <ul> when the stub returns []; shows a placeholder instead.
      await expect(networkApiPage.notesList).toBeHidden();
      await expect(networkApiPage.emptyStateText).toBeVisible();
    });
  });

  // AC-6: Tests are network-isolated — no real requests reach the backend when
  //       route handlers are registered.
  test.describe('AC-6 — network isolation when route handlers are active', () => {
    test('positive: route handler intercepts all /api/notes calls — none reach the real backend', async ({ page, networkApiPage }) => {
      let interceptedCount = 0;

      await page.route(NOTES_ENDPOINT, async (route) => {
        interceptedCount++;
        if (route.request().method() === 'POST') {
          const body = route.request().postDataJSON() as { text: string };
          await route.fulfill({ status: 201, json: { id: 997, text: body.text, createdAt: new Date().toISOString() } });
        } else {
          await route.fulfill({ json: STUB_NOTES });
        }
      });

      await page.goto(URL);
      // Trigger a second request (POST) to confirm both are intercepted
      await networkApiPage.noteInput.fill('isolation check');
      await Promise.all([page.waitForRequest((r) => r.url().includes('/api/notes') && r.method() === 'POST'), networkApiPage.addButton.click()]);

      // At least one GET (initial load) + one POST were fulfilled by our handler
      expect(interceptedCount).toBeGreaterThanOrEqual(2);
      // Stub data renders — confirms the real server was never consulted for the GET
      await expect(networkApiPage.noteItem(STUB_NOTES[0].text)).toBeVisible();
    });
  });

  // Accessibility — axe-core scan on load and error state
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial page load', async ({ page }) => {
      await page.goto(URL);
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations while error state is displayed (500 response)', async ({ page, networkApiPage }) => {
      await page.route(NOTES_ENDPOINT, (route) =>
        route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Server Error' }) }),
      );
      await page.goto(URL);
      await expect(networkApiPage.errorRegion).toBeVisible();

      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });
  });

  // Performance @performance
  test.describe('performance @performance', () => {
    test('initial load is within budget', async ({ page }) => {
      await page.goto(URL);
      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
      });
      // Generous budgets against the live site — tighten in a controlled environment.
      expect(timing.domContentLoaded).toBeLessThan(6000);
      expect(timing.load).toBeLessThan(12000);
    });
  });
});
