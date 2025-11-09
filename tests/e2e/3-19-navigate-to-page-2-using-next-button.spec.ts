// spec: tests/chapter3-webdriver-fundamentals-test-plan.md

import { test, expect } from '@playwright/test';

test.describe('Navigation Testing', () => {
  test('Navigate to Page 2 Using Next Button', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/navigation1.html');

    // Verify "Previous" link is inactive (href is "#")
    const previous = page.getByRole('link', { name: 'Previous' });
    await expect(previous).toBeVisible();
    // When on page 1, Previous points to "#" and should not navigate away
    await expect(previous).toHaveAttribute('href', '#');

    // Click Next
    await page.getByRole('link', { name: 'Next' }).click();

    // Verify navigation to navigation2.html
    await expect(page).toHaveURL(/navigation2\.html$/);

    // Verify paragraph content changed (partial match)
    await expect(page.getByText('Ut enim ad minim veniam')).toBeVisible();

    // Verify Previous link is now active (points to navigation1.html)
    await expect(page.getByRole('link', { name: 'Previous' })).toHaveAttribute('href', 'navigation1.html');

    // Verify page 2 link is present
    await expect(page.getByRole('link', { name: '2' })).toBeVisible();
  });
});
