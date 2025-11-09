// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Chapter 3: WebDriver Fundamentals - Web Form Testing', () => {
  test('Navigate Back from Web Form', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 1. Navigate to the Web form page
    await page.getByRole('link', { name: 'Web form' }).click();

    // 2. Click "Return to index" and verify navigation
    await page.getByRole('link', { name: 'Return to index' }).click();
    await expect(page).toHaveURL('https://bonigarcia.dev/selenium-webdriver-java/index.html');
  });
});
