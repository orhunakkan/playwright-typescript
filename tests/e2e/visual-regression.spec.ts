import { expect, test } from '@playwright/test';

test('visual regression test', async ({ page }) => {
  await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');
  await expect(page).toHaveScreenshot({ fullPage: true });
});
