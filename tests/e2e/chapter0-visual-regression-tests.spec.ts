import { expect, test } from '@playwright/test';

const BASE_URL = process.env.PRACTICE_E2E_URL;

const pages = [
  'web-form',
  'index',
  'navigation1',
  'navigation3',
  'dropdown-menu',
  'mouse-over',
  'drag-and-drop',
  'draw-in-canvas',
  'loading-images',
  'slow-calculator',
  'long-page',
  'infinite-scroll',
  'shadow-dom',
  'cookies',
  'frames',
  'iframes',
  'dialog-boxes',
  'web-storage',
  'geolocation',
  'notifications',
  'get-user-media',
  'multilanguage',
  'console-logs',
  'random-calculator',
  'download',
  'data-types',
];

test.describe('visual regression', () => {
  for (const pageName of pages) {
    test(pageName, async ({ page }) => {
      const targetUrl = `${BASE_URL}/${pageName}.html`;

      await page.goto(targetUrl);
      await expect(page).toHaveScreenshot('full-page.png', { fullPage: true });
    });
  }

  test('ab-testing variation A', async ({ page }) => {
    await page.goto(`${BASE_URL}/ab-testing.html`);
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).$?.('#content').load('variation-a.html');
    });

    await expect(page.getByText('This is variation A')).toBeVisible();
    await expect(page).toHaveScreenshot('full-page-variation-a.png', { fullPage: true });
  });

  test('ab-testing variation B', async ({ page }) => {
    await page.goto(`${BASE_URL}/ab-testing.html`);
    await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).$?.('#content').load('variation-b.html');
    });

    await expect(page.getByText('This is variation B')).toBeVisible();
    await expect(page).toHaveScreenshot('full-page-variation-b.png', { fullPage: true });
  });
});
