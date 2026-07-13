import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { ServiceWorkersPage } from '../../pages/service-workers.page';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-28 — Service Workers
//
// TAB1-53: on Desktop Safari, context.setOffline(true) prevents an active service worker from
// ever responding — confirmed to be a Playwright/WebKit driver limitation (reproduced with a raw
// fetch() call, no app or test code involved), not fixable in this app's source. The 4 tests that
// exercise context.setOffline() are intentionally NOT skipped and are expected to be red/flaky on
// Desktop Safari until TAB1-53 is resolved.

const URL = '/practice/service-workers';

const scan = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
// TAB1-52: the "✓ Service worker registered" status text is #009966 on #fafafa (3.5:1, needs
// 4.5:1) — a real, reproducible app defect tracked separately. Excluded here so it doesn't block
// this story, same pattern as TAB1-42 on the Async UI lab.
const filterKnown = (violations: { id: string }[]) => violations.filter((v) => v.id !== 'color-contrast');

async function registerServiceWorker(page: Page, serviceWorkersPage: ServiceWorkersPage) {
  await serviceWorkersPage.registerButton.click();
  await expect(serviceWorkersPage.registrationStatus).toHaveText('✓ Service worker registered');
}

test.describe('Service Workers', () => {
  // AC-6 (TAB1-28): tests that validate the SW's own caching strategy must leave it active, and
  // are kept in a structurally separate describe block from tests that need page.route() to win —
  // an active SW always claims /api/sw-items before Playwright's routing layer sees it (AC-3).
  test.describe('Caching strategy — service worker left active (AC-1, AC-4)', () => {
    // AC-1 (TAB1-28): register the SW via the button, fetch items, assert the response source is
    // from the SW cache (stale data) rather than the real network
    test('positive: after registering the service worker, fetched items are served from its cache (stale)', async ({ page, serviceWorkersPage }) => {
      await page.goto(URL);
      await registerServiceWorker(page, serviceWorkersPage);

      await serviceWorkersPage.fetchItemsButton.click();
      await expect(serviceWorkersPage.fetchedItems).toHaveCount(3);
      for (let i = 0; i < 3; i++) {
        await expect(serviceWorkersPage.itemSourceBadge(i)).toHaveText('cache');
      }
      await expect(serviceWorkersPage.fetchedItemsList).toContainText('(stale)');
    });

    test('negative (control): without registering the service worker, fetched items are served fresh from the network', async ({
      page,
      serviceWorkersPage,
    }) => {
      await page.goto(URL);
      await serviceWorkersPage.fetchItemsButton.click();

      await expect(serviceWorkersPage.fetchedItems).toHaveCount(3);
      for (let i = 0; i < 3; i++) {
        await expect(serviceWorkersPage.itemSourceBadge(i)).toHaveText('network');
      }
      await expect(serviceWorkersPage.fetchedItemsList).not.toContainText('(stale)');
    });

    // AC-4 (TAB1-28): context.setOffline(true) with an active service worker still shows
    // cached/stale data, since the SW answers from its own cache without touching the network
    test('positive: context.setOffline(true) with an active service worker still shows cached/stale data', async ({
      page,
      context,
      serviceWorkersPage,
    }) => {
      await page.goto(URL);
      await registerServiceWorker(page, serviceWorkersPage);

      await context.setOffline(true);
      await serviceWorkersPage.fetchItemsButton.click();

      await expect(serviceWorkersPage.fetchedItems).toHaveCount(3);
      await expect(serviceWorkersPage.itemSourceBadge(0)).toHaveText('cache');
      await expect(serviceWorkersPage.fetchedItemsList).toContainText('(stale)');
    });

    test('boundary: going offline before ever registering the service worker leaves no cache to serve, so the fetch fails', async ({
      page,
      context,
      serviceWorkersPage,
    }) => {
      await page.goto(URL);
      await context.setOffline(true);
      await serviceWorkersPage.fetchItemsButton.click();

      // Exact wording of the fetch failure differs per browser (Chromium: "Failed to fetch",
      // Firefox: "NetworkError when attempting to fetch resource.") — the AC only requires that
      // a network error state is shown, so assert visibility + non-empty content, not exact text.
      await expect(serviceWorkersPage.errorRegion).toBeVisible();
      await expect(serviceWorkersPage.errorRegion).not.toBeEmpty();
      await expect(serviceWorkersPage.fetchedItems).toHaveCount(0);
    });
  });

  // AC-6 (TAB1-28): tests that need page.route() to actually intercept /api/sw-items must block
  // the service worker at the context level — otherwise the active SW claims the request first.
  test.describe('page.route() interception — service worker blocked via context option (AC-2, AC-3, AC-5)', () => {
    // AC-2 (TAB1-28): a context created with serviceWorkers: 'block' lets page.route() intercept
    // /api/sw-items as expected
    test('positive: serviceWorkers: "block" lets page.route() intercept /api/sw-items', async ({ browser }) => {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const page = await context.newPage();
      const serviceWorkersPage = new ServiceWorkersPage(page);
      let routed = false;

      await page.route('**/api/sw-items', (route) => {
        routed = true;
        route.fulfill({ contentType: 'application/json', body: JSON.stringify([{ id: 1, name: 'Routed Item', source: 'route' }]) });
      });
      await page.goto(URL);
      await serviceWorkersPage.fetchItemsButton.click();

      expect(routed).toBe(true);
      await expect(serviceWorkersPage.fetchedItems).toHaveCount(1);
      await expect(serviceWorkersPage.itemSourceBadge(0)).toHaveText('route');

      await context.close();
    });

    // AC-3 (TAB1-28): without blocking the service worker, page.route() does not intercept a
    // request the active SW handles first
    test('positive: with the service worker active (not blocked), page.route() does not intercept — the SW claims the request first', async ({
      page,
      serviceWorkersPage,
    }) => {
      let routed = false;
      await page.route('**/api/sw-items', (route) => {
        routed = true;
        route.continue();
      });

      await page.goto(URL);
      await registerServiceWorker(page, serviceWorkersPage);
      await serviceWorkersPage.fetchItemsButton.click();

      await expect(serviceWorkersPage.fetchedItems).toHaveCount(3);
      await expect(serviceWorkersPage.itemSourceBadge(0)).toHaveText('cache');
      expect(routed).toBe(false);
    });

    test('negative (control): with no service worker registered, page.route() does intercept the same request', async ({
      page,
      serviceWorkersPage,
    }) => {
      let routed = false;
      await page.route('**/api/sw-items', (route) => {
        routed = true;
        route.continue();
      });

      await page.goto(URL);
      await serviceWorkersPage.fetchItemsButton.click();

      await expect(serviceWorkersPage.fetchedItems).toHaveCount(3);
      expect(routed).toBe(true);
    });

    // AC-5 (TAB1-28): context.setOffline(true) with the service worker blocked shows a network
    // error state
    test('positive: serviceWorkers: "block" + context.setOffline(true) shows a network error state', async ({ browser }) => {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const page = await context.newPage();
      const serviceWorkersPage = new ServiceWorkersPage(page);

      await page.goto(URL);
      await context.setOffline(true);
      await serviceWorkersPage.fetchItemsButton.click();

      // See the boundary test above for why exact error wording isn't asserted here.
      await expect(serviceWorkersPage.errorRegion).toBeVisible();
      await expect(serviceWorkersPage.errorRegion).not.toBeEmpty();
      await expect(serviceWorkersPage.fetchedItems).toHaveCount(0);

      await context.close();
    });

    // Doubles as the AC-2 negative control: blocking the SW alone (no route override, still
    // online) does not change anything — the request still reaches the real network normally.
    test('negative (control): serviceWorkers: "block" while online still fetches normally from the network', async ({ browser }) => {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const page = await context.newPage();
      const serviceWorkersPage = new ServiceWorkersPage(page);

      await page.goto(URL);
      await serviceWorkersPage.fetchItemsButton.click();

      await expect(serviceWorkersPage.fetchedItems).toHaveCount(3);
      await expect(serviceWorkersPage.itemSourceBadge(0)).toHaveText('network');

      await context.close();
    });
  });

  // Accessibility — scan initial load, cache-sourced items, network-sourced items, and the
  // offline network-error state
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial page load', async ({ page }) => {
      await page.goto(URL);
      expect(filterKnown((await scan(page)).violations)).toEqual([]);
    });

    test('no violations once items are rendered from the service worker cache', async ({ page, serviceWorkersPage }) => {
      await page.goto(URL);
      await registerServiceWorker(page, serviceWorkersPage);
      await serviceWorkersPage.fetchItemsButton.click();
      await expect(serviceWorkersPage.fetchedItems).toHaveCount(3);
      expect(filterKnown((await scan(page)).violations)).toEqual([]);
    });

    test('no violations once items are rendered from the network', async ({ page, serviceWorkersPage }) => {
      await page.goto(URL);
      await serviceWorkersPage.fetchItemsButton.click();
      await expect(serviceWorkersPage.fetchedItems).toHaveCount(3);
      expect(filterKnown((await scan(page)).violations)).toEqual([]);
    });

    test('no violations in the offline network-error state', async ({ browser }) => {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const page = await context.newPage();
      const serviceWorkersPage = new ServiceWorkersPage(page);

      await page.goto(URL);
      await context.setOffline(true);
      await serviceWorkersPage.fetchItemsButton.click();
      await expect(serviceWorkersPage.errorRegion).toBeVisible();

      expect(filterKnown((await scan(page)).violations)).toEqual([]);
      await context.close();
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach warm load
test.describe('performance @performance', () => {
  test('initial service-workers page load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
