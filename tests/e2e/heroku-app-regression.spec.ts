import { test, expect } from '@playwright/test';
import { HerokuAppHomePage } from '../../pages/heroku-app-home-page';

test.describe('Heroku App - Regression Suite', { tag: '@regression' }, () => {
  let homePage: HerokuAppHomePage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    homePage = new HerokuAppHomePage(page);
  });

  test('should load the homepage and validate title and basic elements', async () => {
    expect(await homePage.Title).toBe('The Internet');
    await expect(homePage.header1).toHaveText('Welcome to the-internet');
    await expect(homePage.header2).toHaveText('Available Examples');
  });
});
