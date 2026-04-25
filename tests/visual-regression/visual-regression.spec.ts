import { expect, test } from '../../fixtures/page-fixtures';
import { config } from '../../config/env';
import { feature, story, severity } from 'allure-js-commons';
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

test.describe('visual regression', { tag: ['@visual'] }, () => {
  for (const pageName of pages) {
    test(pageName, async ({ page }) => {
      await feature('Visual Regression');
      await story('Full Page Snapshots');
      await severity('normal');
      const targetUrl = `${BASE_URL}/${pageName}.html`;

      await page.goto(targetUrl);
      await expect(page).toHaveScreenshot('full-page.png', { fullPage: true });
    });
  }
});
