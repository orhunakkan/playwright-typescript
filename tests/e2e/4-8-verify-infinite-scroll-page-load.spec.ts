// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Infinite Scroll - Dynamic Content Loading', () => {
  test('Verify Infinite Scroll Page Load', async ({ page }) => {
    // 1. Navigate to infinite scroll page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/infinite-scroll.html');

    // 2. Wait for page to load completely - Page URL is correct
    await expect(page).toHaveURL('https://bonigarcia.dev/selenium-webdriver-java/infinite-scroll.html');

    // Page title is "Hands-On Selenium WebDriver with Java"
    await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');

    // Main heading "Infinite scroll" is visible
    await expect(page.getByRole('heading', { name: 'Infinite scroll' })).toBeVisible();

    // Initial set of Lorem ipsum paragraphs is loaded
    const paragraphs = page.locator('p');
    await expect(paragraphs.first()).toBeVisible();
    
    // Verify multiple paragraphs are loaded (at least 10)
    const count = await paragraphs.count();
    expect(count).toBeGreaterThanOrEqual(10);

    // Page is scrollable - verify we can see the footer
    const footer = page.getByText('Copyright © 2021-2025');
    await expect(footer).toBeVisible();
  });
});
