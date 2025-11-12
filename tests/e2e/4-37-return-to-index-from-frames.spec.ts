// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Frames - HTML Frameset', () => {
  test('Return to Index from Frames Page', async ({ page }) => {
    // 1. Navigate to frames page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/frames.html');

    // Verify on frames page
    await expect(page).toHaveURL('https://bonigarcia.dev/selenium-webdriver-java/frames.html');
    await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');

    // 2. Navigate back to index page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // Verify successfully returned to index page
    await expect(page).toHaveURL(/.*index\.html/);
    await expect(page.getByRole('heading', { name: 'Hands-On Selenium WebDriver with Java', level: 1 })).toBeVisible();

    // Verify Chapter 4 section is visible
    await expect(page.getByRole('heading', { name: 'Chapter 4. Browser-Agnostic Features' })).toBeVisible();

    // Verify Frames link is visible (can navigate back if needed)
    await expect(page.getByRole('link', { name: 'Frames', exact: true })).toBeVisible();

    // Verify no frame content persists - index page has standard layout (no frameset)
    const frameCount = await page.evaluate(() => window.frames.length);
    expect(frameCount).toBe(0);

    // Verify standard body content is visible
    await expect(page.getByText('This site contains a collection of sample web pages')).toBeVisible();
  });
});
