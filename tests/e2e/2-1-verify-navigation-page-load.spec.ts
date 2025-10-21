// spec: tests/chapter3-webdriver-fundamentals-test-plan.md

import { test, expect } from '@playwright/test';

test.describe('Navigation Testing', () => {
  test('Verify Navigation Page Load', async ({ page }) => {
    // 1. Navigate to index
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // Click on "Navigation" link in Chapter 3 section
    await page.getByRole('link', { name: 'Navigation' }).click();

    // Verify the page navigated to navigation1.html
    await expect(page).toHaveURL(/navigation1\.html$/);

    // Verify the heading "Navigation example" is visible
    await expect(page.getByRole('heading', { name: 'Navigation example' })).toBeVisible();

    // Verify the paragraph text is visible (partial match)
    await expect(page.getByText('Lorem ipsum dolor sit amet')).toBeVisible();

    // Verify pagination controls - Previous, 1, 2, 3, Next are visible
    await expect(page.getByRole('link', { name: 'Previous' })).toBeVisible();
    await expect(page.getByRole('link', { name: '1' })).toBeVisible();
    await expect(page.getByRole('link', { name: '2' })).toBeVisible();
    await expect(page.getByRole('link', { name: '3' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Next' })).toBeVisible();
  });
});
