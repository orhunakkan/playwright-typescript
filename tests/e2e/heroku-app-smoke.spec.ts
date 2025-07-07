import { test, expect } from '@playwright/test';
import { HerokuAppHomePage } from '../../pages/heroku-app-home-page';
import {
  logConsoleErrors,
  logNetworkErrors,
  logPageErrors,
} from '../../utilities/error-logger';

test.describe('Heroku App - Smoke Suite', () => {
  let homePage: HerokuAppHomePage;

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await logConsoleErrors(page);
    await logNetworkErrors(page);
    await logPageErrors(page);
    homePage = new HerokuAppHomePage(page);
  });

  test('should load the homepage and validate title and basic elements', async () => {
    expect(await homePage.getTitle()).toBe('The Internet');
    expect(await homePage.getHeader1Text()).toBe('Welcome to the-internet');
    expect(await homePage.getHeader2Text()).toBe('Available Examples');
  });
});
