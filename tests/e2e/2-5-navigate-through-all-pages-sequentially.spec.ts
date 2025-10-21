// spec: tests/chapter3-webdriver-fundamentals-test-plan.md

import { test, expect } from '@playwright/test';

test.describe('Navigation Testing', () => {
  test('Navigate Through All Pages Sequentially', async ({ page }) => {
    // Open navigation1 and verify
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/navigation1.html');
    await expect(page).toHaveURL(/navigation1\.html$/);
    await expect(page.getByText('Lorem ipsum dolor sit amet')).toBeVisible();

    // Next -> page 2
    await page.getByRole('link', { name: 'Next' }).click();
    await expect(page).toHaveURL(/navigation2\.html$/);
    await expect(page.getByText('Ut enim ad minim veniam')).toBeVisible();

    // Next -> page 3
    await page.getByRole('listitem').filter({ hasText: 'Next' }).click();
    await expect(page).toHaveURL(/navigation3\.html$/);
    await expect(page.getByText('Excepteur sint occaecat')).toBeVisible();

    // Previous -> back to page 2
    await page.getByRole('link', { name: 'Previous' }).click();
    await expect(page).toHaveURL(/navigation2\.html$/);
    await expect(page.getByText('Ut enim ad minim veniam')).toBeVisible();

    // Previous -> back to page 1
    await page.getByRole('link', { name: 'Previous' }).click();
    await expect(page).toHaveURL(/navigation1\.html$/);
    await expect(page.getByText('Lorem ipsum dolor sit amet')).toBeVisible();
  });
});
