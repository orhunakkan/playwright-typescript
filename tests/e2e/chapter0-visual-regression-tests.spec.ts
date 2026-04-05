import { expect, test } from '@playwright/test';
import { config } from '../../config/env';
const BASE_URL = config.e2eUrl;

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
    await page.evaluate(async () => {
      const content = document.querySelector<HTMLElement>('#content');
      if (!content) {
        throw new Error('Missing #content container');
      }

      const response = await fetch('variation-a.html');
      if (!response.ok) {
        throw new Error(`Failed to load variation-a.html: ${response.status}`);
      }

      content.innerHTML = await response.text();
    });

    await expect(page.getByText('This is variation A')).toBeVisible();
    await expect(page).toHaveScreenshot('full-page-variation-a.png', { fullPage: true });
  });

  test('ab-testing variation B', async ({ page }) => {
    await page.goto(`${BASE_URL}/ab-testing.html`);
    await page.evaluate(async () => {
      const content = document.querySelector<HTMLElement>('#content');
      if (!content) {
        throw new Error('Missing #content container');
      }

      const response = await fetch('variation-b.html');
      if (!response.ok) {
        throw new Error(`Failed to load variation-b.html: ${response.status}`);
      }

      content.innerHTML = await response.text();
    });

    await expect(page.getByText('This is variation B')).toBeVisible();
    await expect(page).toHaveScreenshot('full-page-variation-b.png', { fullPage: true });
  });
});
