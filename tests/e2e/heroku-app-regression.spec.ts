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
    expect(await homePage.header1.textContent()).toBe('Welcome to the-internet');
    expect(await homePage.header2.textContent()).toBe('Available Examples');
  });
});
