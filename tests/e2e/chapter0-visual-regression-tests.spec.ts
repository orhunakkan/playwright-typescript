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
  'ab-testing',
  'data-types',
];

for (const pageName of pages) {
  test(pageName, async ({ page }) => {
    await page.goto(`${BASE_URL}/${pageName}.html`);
    await expect(page).toHaveScreenshot('full-page.png', { fullPage: true });
  });
}
