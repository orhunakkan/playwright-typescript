import { test, expect } from '@playwright/test';
import { HerokuAppHomePage } from '../../pages/heroku-app-home-page';

test.describe('Heroku App - Visual Regression', () => {
  let homePage: HerokuAppHomePage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('home page visual regression test', async ({ page }) => {
    await expect(page).toHaveScreenshot();
  });
});
