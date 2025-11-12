// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('IFrames - Inline Frames', () => {
  test('Verify IFrames Page Load', async ({ page }) => {
    // 1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/iframes.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/iframes.html');

    // 2. Wait for page to load completely - verify page URL, title, main heading, iframe element
    await expect(page).toHaveURL('https://bonigarcia.dev/selenium-webdriver-java/iframes.html');
    await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
    await expect(page.getByRole('heading', { name: 'IFrame', exact: true })).toBeVisible();

    const iframe = page.locator('iframe');
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute('src', /content\.html/);
  });
});
