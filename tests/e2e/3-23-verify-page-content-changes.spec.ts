// spec: tests/chapter3-webdriver-fundamentals-test-plan.md

import { test, expect } from '@playwright/test';

test.describe('Navigation Testing', () => {
  test('Verify Page Content Changes', async ({ page }) => {
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/navigation1.html');

    const page1Text = await page.getByText('Lorem ipsum dolor sit amet').textContent();
    expect(page1Text).toBeTruthy();

    // Go to page 2
    await page.getByRole('link', { name: '2' }).click();
    await expect(page).toHaveURL(/navigation2\.html$/);
    const page2Text = await page.getByText('Ut enim ad minim veniam').textContent();
    expect(page2Text).toBeTruthy();
    expect(page2Text).not.toEqual(page1Text);

    // Go to page 3
    await page.getByRole('link', { name: '3' }).click();
    await expect(page).toHaveURL(/navigation3\.html$/);
    const page3Text = await page.getByText('Excepteur sint occaecat').textContent();
    expect(page3Text).toBeTruthy();
    expect(page3Text).not.toEqual(page2Text);
  });
});
