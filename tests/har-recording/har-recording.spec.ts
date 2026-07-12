import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import fs from 'fs';
import os from 'os';
import path from 'path';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-27 — HAR Recording

const URL = '/practice/har-recording';
const FIXTURE_HAR = path.join(process.cwd(), 'fixtures', 'har', 'har-recording', 'products.har');

// Recorded from the live GET /api/products endpoint when fixtures/har/har-recording/products.har
// was generated — see docs/test-plan/har-recording.test-plan.md §3.
const RECORDED_PRODUCTS = [
  { name: 'Mechanical Keyboard', stock: 'In stock' },
  { name: 'USB-C Hub', stock: 'In stock' },
  { name: '4K Monitor', stock: 'Out of stock' },
  { name: 'Wireless Mouse', stock: 'In stock' },
  { name: 'Laptop Stand', stock: 'In stock' },
  { name: 'Webcam 1080p', stock: 'Out of stock' },
  { name: 'Noise-Cancelling Headphones', stock: 'In stock' },
  { name: 'Desk Mat XL', stock: 'In stock' },
  { name: 'External SSD 1TB', stock: 'In stock' },
  { name: 'LED Desk Lamp', stock: 'Out of stock' },
] as const;

const scan = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

// Applies the committed HAR fixture. Default `notFound: 'abort'` means any request not present
// in the HAR is aborted rather than falling back to the network — proven directly by the AC-2
// negative test below. (An earlier version of this helper also set `context.setOffline(true)` to
// force the point, but that blocks navigation at a lower network layer than route interception in
// Firefox/WebKit — NS_ERROR_OFFLINE — so it isn't cross-browser safe; the abort-on-notFound
// behavior alone is sufficient proof and works identically in all four browsers.)
async function replayFromHar(page: Page) {
  await page.context().routeFromHAR(FIXTURE_HAR);
}

test.describe('HAR Recording', () => {
  // AC-1 (TAB1-27): Tests record a HAR by passing { update: true } to page.routeFromHAR() before
  // navigating and verify the HAR file is created on disk
  test.describe('AC-1 — recording a HAR writes the file to disk', () => {
    test('positive: routeFromHAR({ update: true }) + context.close() creates the HAR file on disk', async ({ browser }) => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'har-recording-'));
      const harPath = path.join(dir, 'products.har');
      const context = await browser.newContext();
      const page = await context.newPage();

      await context.routeFromHAR(harPath, { update: true });
      await page.goto(URL);
      await expect(page.getByRole('status')).toHaveText('10 products loaded');
      await context.close();

      expect(fs.existsSync(harPath)).toBe(true);
      fs.rmSync(dir, { recursive: true, force: true });
    });

    test('negative: the file does not exist until the recording context is closed', async ({ browser }) => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'har-recording-'));
      const harPath = path.join(dir, 'products.har');
      const context = await browser.newContext();
      const page = await context.newPage();

      await context.routeFromHAR(harPath, { update: true });
      await page.goto(URL);
      await expect(page.getByRole('status')).toHaveText('10 products loaded');
      expect(fs.existsSync(harPath)).toBe(false);

      await context.close();
      expect(fs.existsSync(harPath)).toBe(true);
      fs.rmSync(dir, { recursive: true, force: true });
    });
  });

  // AC-2 (TAB1-27): Tests replay the recorded HAR in a second test (without { update }) and assert
  // the product list renders all 10 products from the recorded data without a live server
  test.describe('AC-2 — HAR replay renders all 10 products with no live server', () => {
    test('positive: replaying the HAR renders all 10 recorded products with no live network call', async ({ page, harRecordingPage }) => {
      await replayFromHar(page);
      await page.goto(URL);
      await expect(harRecordingPage.statusRegion).toHaveText('10 products loaded');
      await expect(harRecordingPage.productCards).toHaveCount(10);
    });

    test('negative: default notFound "abort" blocks any URL not present in the HAR, proving replay never falls back to the network', async ({
      page,
    }) => {
      await replayFromHar(page);
      await expect(page.goto('/practice/network-api')).rejects.toThrow();
    });
  });

  // AC-3 (TAB1-27): Tests combine HAR replay with page.route() to override a single endpoint with
  // a mock response while all other requests are served from the HAR
  test.describe('AC-3 — page.route() overrides a single endpoint while everything else replays from the HAR', () => {
    test('positive: a page.route() override for /api/products wins over the HAR-recorded response', async ({ page, harRecordingPage }) => {
      await replayFromHar(page);
      await page.route('**/api/products', (route) =>
        route.fulfill({
          contentType: 'application/json',
          body: JSON.stringify([{ id: 999, name: 'Override Product', category: 'Test', price: 1, inStock: true }]),
        }),
      );

      await page.goto(URL);
      await expect(harRecordingPage.statusRegion).toContainText('1');
      await expect(harRecordingPage.productCards).toHaveCount(1);
      await expect(harRecordingPage.productCard('Override Product')).toBeVisible();
      // The page shell (heading, guidance text) still rendered — proof those requests kept coming
      // from the HAR rather than failing once a single endpoint was overridden.
      await expect(page.getByRole('heading', { name: 'HAR Recording', level: 1 })).toBeVisible();
    });

    test('negative: without registering an override, replaying the same HAR still serves the original 10 products', async ({
      page,
      harRecordingPage,
    }) => {
      await replayFromHar(page);
      await page.goto(URL);
      await expect(harRecordingPage.productCards).toHaveCount(10);
      await expect(harRecordingPage.productCard('Override Product')).toHaveCount(0);
    });
  });

  // AC-4 (TAB1-27): Tests assert the correct "In stock" and "Out of stock" badge text appears for
  // products as recorded in the HAR
  test.describe('AC-4 — "In stock" / "Out of stock" badge text matches the recorded HAR data', () => {
    for (const product of RECORDED_PRODUCTS) {
      test(`data: "${product.name}" shows "${product.stock}"`, async ({ page, harRecordingPage }) => {
        await replayFromHar(page);
        await page.goto(URL);
        await expect(harRecordingPage.stockBadge(product.name)).toHaveText(product.stock);
      });
    }
  });

  // AC-5 (TAB1-27): Tests verify the HAR replay correctly serves the GET /api/products endpoint,
  // confirmed by the "10 products loaded" status
  test.describe('AC-5 — HAR replay correctly serves GET /api/products, confirmed by "10 products loaded"', () => {
    test('positive: initial replayed load shows "10 products loaded"', async ({ page, harRecordingPage }) => {
      await replayFromHar(page);
      await page.goto(URL);
      await expect(harRecordingPage.statusRegion).toHaveText('10 products loaded');
    });

    test('positive: clicking "Reload products" re-fetches and still shows "10 products loaded" from the HAR', async ({
      page,
      harRecordingPage,
    }) => {
      await replayFromHar(page);
      await page.goto(URL);
      await expect(harRecordingPage.statusRegion).toHaveText('10 products loaded');

      await harRecordingPage.reloadProductsButton.click();
      await expect(harRecordingPage.statusRegion).toHaveText('10 products loaded');
      await expect(harRecordingPage.productCards).toHaveCount(10);
    });
  });

  // Accessibility — scan the live page load and the fully HAR-replayed load
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial page load (live)', async ({ page }) => {
      await page.goto(URL);
      await expect(page.getByRole('status')).toHaveText('10 products loaded');
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations when the page is rendered entirely from a replayed HAR', async ({ page }) => {
      await replayFromHar(page);
      await page.goto(URL);
      await expect(page.getByRole('status')).toHaveText('10 products loaded');
      expect((await scan(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach warm load
test.describe('performance @performance', () => {
  test('initial har-recording page load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
