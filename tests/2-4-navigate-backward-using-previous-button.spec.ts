// spec: tests/chapter3-webdriver-fundamentals-test-plan.md

import { test, expect } from '@playwright/test';

test.describe('Navigation Testing', () => {
  test('Navigate Backward Using Previous Button', async ({ page }) => {
    // Start at navigation2.html by using navigation1 -> Next
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/navigation1.html');
    await page.getByRole('link', { name: 'Next' }).click();
    await expect(page).toHaveURL(/navigation2\.html$/);

    // Verify Previous is active (points to navigation1.html)
    const previous = page.getByRole('link', { name: 'Previous' });
    await expect(previous).toHaveAttribute('href', 'navigation1.html');

    // Click Previous
    await previous.click();

    // Verify we are back on navigation1.html
    await expect(page).toHaveURL(/navigation1\.html$/);
    await expect(page.getByText('Lorem ipsum dolor sit amet')).toBeVisible();

    // Verify Previous is inactive again (href="#")
    await expect(page.getByRole('link', { name: 'Previous' })).toHaveAttribute('href', '#');
  });
});
