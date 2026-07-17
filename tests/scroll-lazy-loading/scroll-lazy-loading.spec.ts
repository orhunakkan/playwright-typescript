import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';
import type { Route } from '@playwright/test';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-33 — Scroll & Lazy Loading

const LAB_URL = '/practice/scroll-lazy-loading';
const PAGE_SIZE = 8;
const TOTAL_ITEMS = 42;

test.describe('Scroll & Lazy Loading', () => {
  test.beforeEach(async ({ page, scrollLazyLoadingPage }) => {
    await page.goto(LAB_URL);
    // The initial fetch (and the sentinel it renders) is async — wait for it before any test
    // scrolls, or a scroll issued too early finds no sentinel in the DOM yet and is a no-op.
    await expect(scrollLazyLoadingPage.feedItems).toHaveCount(PAGE_SIZE);
  });

  // AC-1 (TAB1-33): the initial fetch renders exactly the first 8 feed items without any scroll.
  test.describe('AC-1 — initial page load renders the first 8 feed items', () => {
    test('positive: the first 8 activity feed items are visible after initial page load', async ({ scrollLazyLoadingPage }) => {
      for (let id = 1; id <= 8; id++) {
        await expect(scrollLazyLoadingPage.item(id)).toBeVisible();
      }
      await expect(scrollLazyLoadingPage.feedItems).toHaveCount(8);
    });

    test('negative/AC-1a: no page-2 item is present before any scroll occurs', async ({ scrollLazyLoadingPage }) => {
      await expect(scrollLazyLoadingPage.item(9)).toHaveCount(0);
    });

    test('boundary/AC-1b: exactly item #8 is visible and item #9 is absent pre-scroll', async ({ scrollLazyLoadingPage }) => {
      await expect(scrollLazyLoadingPage.item(8)).toBeVisible();
      await expect(scrollLazyLoadingPage.item(9)).toHaveCount(0);
    });
  });

  // AC-2 (TAB1-33): scrolling the sentinel into view triggers the IntersectionObserver and fetches
  // page 2, surfacing items #9-#16 in the DOM.
  test.describe('AC-2 — scrolling the sentinel triggers the next page fetch', () => {
    test('positive: scrolling to the sentinel triggers the observer and page-2 items appear in the DOM', async ({ page, scrollLazyLoadingPage }) => {
      await scrollLazyLoadingPage.scrollToBottom();

      await expect(scrollLazyLoadingPage.item(9)).toBeVisible();
      await expect(scrollLazyLoadingPage.feedItems).toHaveCount(2 * PAGE_SIZE);
    });

    test('boundary/AC-2a: item #9 (first page-2 item) appears immediately once the sentinel intersects', async ({ page, scrollLazyLoadingPage }) => {
      await expect(scrollLazyLoadingPage.item(9)).toHaveCount(0);

      await scrollLazyLoadingPage.scrollToBottom();

      await expect(scrollLazyLoadingPage.item(9)).toBeVisible();
    });
  });

  // AC-3 (TAB1-33): repeated scrolling exhausts all pages and surfaces the "all caught up" marker.
  test.describe('AC-3 — scrolling until the end marker confirms all pages fetched', () => {
    test('positive: repeated scrolling until the end marker is visible confirms all pages fetched', async ({ page, scrollLazyLoadingPage }) => {
      await scrollLazyLoadingPage.scrollUntilEndMarkerVisible();

      await expect(scrollLazyLoadingPage.endMarker).toBeVisible();
      await expect(scrollLazyLoadingPage.feedItems).toHaveCount(TOTAL_ITEMS);
    });

    test('negative/AC-3a: the end marker is not visible while pages remain unfetched', async ({ page, scrollLazyLoadingPage }) => {
      await scrollLazyLoadingPage.scrollToBottom();

      await expect(scrollLazyLoadingPage.endMarker).toHaveCount(0);
      await expect(scrollLazyLoadingPage.feedItems).not.toHaveCount(TOTAL_ITEMS);
    });
  });

  // AC-4 (TAB1-33): once loaded, a specific item can be brought into the viewport via
  // locator.scrollIntoViewIfNeeded() and expect(locator).toBeInViewport() passes.
  test.describe('AC-4 — scrollIntoViewIfNeeded brings a specific item into the viewport', () => {
    test('positive: scrollIntoViewIfNeeded() brings item #30 into view and toBeInViewport() passes', async ({ page, scrollLazyLoadingPage }) => {
      await scrollLazyLoadingPage.scrollUntilEndMarkerVisible();
      const item30 = scrollLazyLoadingPage.item(30);
      await expect(item30).toBeVisible();

      await page.evaluate(() => window.scrollTo(0, 0));
      await item30.scrollIntoViewIfNeeded();

      await expect(item30).toBeInViewport();
    });

    test('negative/AC-4a: a locator for an item beyond the total count resolves to zero elements', async ({ page, scrollLazyLoadingPage }) => {
      await scrollLazyLoadingPage.scrollUntilEndMarkerVisible();

      await expect(scrollLazyLoadingPage.item(TOTAL_ITEMS + 1)).toHaveCount(0);
    });
  });

  // AC-5 (TAB1-33): page.route("/api/feed*", ...) stubs the paginated endpoint with controlled
  // data; only the stubbed items must appear in the feed.
  test.describe('AC-5 — page.route stubs the paginated feed endpoint', () => {
    test('positive: stubbed feed data renders only the stubbed items', async ({ page, scrollLazyLoadingPage }) => {
      await page.route('**/api/feed*', (route: Route) => {
        route.fulfill({
          json: scrollLazyLoadingPage.feedPage(
            [
              { id: 1, title: 'Stub item one', body: 'Stubbed body one' },
              { id: 2, title: 'Stub item two', body: 'Stubbed body two' },
            ],
            1,
            false,
            2,
          ),
        });
      });

      await page.goto(LAB_URL);

      await expect(scrollLazyLoadingPage.feedItems).toHaveCount(2);
      await expect(page.getByText('Stub item one')).toBeVisible();
      await expect(page.getByText('Stub item two')).toBeVisible();
      await expect(scrollLazyLoadingPage.endMarker).toBeVisible();
    });

    test('negative/AC-5a: real unstubbed items do not leak through while the route stub is active', async ({ page, scrollLazyLoadingPage }) => {
      await page.route('**/api/feed*', (route: Route) => {
        route.fulfill({ json: scrollLazyLoadingPage.feedPage([{ id: 1, title: 'Only stubbed item', body: 'Stubbed body' }], 1, false, 1) });
      });

      await page.goto(LAB_URL);

      await expect(scrollLazyLoadingPage.feedItems).toHaveCount(1);
      await expect(page.getByText('Deployed new feature')).toHaveCount(0);
    });

    test('boundary/AC-5b: a stubbed empty page renders zero items and the end marker directly', async ({ page, scrollLazyLoadingPage }) => {
      await page.route('**/api/feed*', (route: Route) => {
        route.fulfill({ json: scrollLazyLoadingPage.feedPage([], 1, false, 0) });
      });

      await page.goto(LAB_URL);

      await expect(scrollLazyLoadingPage.feedItems).toHaveCount(0);
      await expect(scrollLazyLoadingPage.endMarker).toBeVisible();
    });

    test('boundary/AC-5c: a stubbed single-item page renders exactly that one item', async ({ page, scrollLazyLoadingPage }) => {
      await page.route('**/api/feed*', (route: Route) => {
        route.fulfill({ json: scrollLazyLoadingPage.feedPage([{ id: 7, title: 'Solo stubbed item', body: 'Solo body' }], 1, false, 1) });
      });

      await page.goto(LAB_URL);

      await expect(scrollLazyLoadingPage.feedItems).toHaveCount(1);
      await expect(page.getByText('Solo stubbed item')).toBeVisible();
    });
  });

  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations at initial load', async ({ page }) => {
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations mid-scroll (after fetching page 2)', async ({ page, scrollLazyLoadingPage }) => {
      await scrollLazyLoadingPage.scrollToBottom();
      await expect(scrollLazyLoadingPage.item(9)).toBeVisible();

      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations at end-of-feed (all pages fetched)', async ({ page, scrollLazyLoadingPage }) => {
      await scrollLazyLoadingPage.scrollUntilEndMarkerVisible();
      await expect(scrollLazyLoadingPage.endMarker).toBeVisible();

      expect((await scanWcag(page)).violations).toEqual([]);
    });
  });
});

// Performance — initial load and a single lazy-load fetch cycle must each complete within budget
test.describe('performance @performance', () => {
  test('initial feed load completes within budget', async ({ page, scrollLazyLoadingPage }) => {
    const start = Date.now();

    await page.goto(LAB_URL);
    await expect(scrollLazyLoadingPage.feedItems).toHaveCount(PAGE_SIZE);

    expect(Date.now() - start).toBeLessThan(5000);
  });

  test('a single lazy-load fetch cycle completes within budget', async ({ page, scrollLazyLoadingPage }) => {
    await page.goto(LAB_URL);
    await expect(scrollLazyLoadingPage.feedItems).toHaveCount(PAGE_SIZE);
    const start = Date.now();

    await scrollLazyLoadingPage.scrollToBottom();
    await expect(scrollLazyLoadingPage.item(9)).toBeVisible();

    expect(Date.now() - start).toBeLessThan(5000);
  });
});
