// spec: tests/chapter3-webdriver-fundamentals-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Web Form Testing', () => {
  test('Verify Web Form Page Load', async ({ page }) => {
    // 1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/index.html
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/index.html');

    // 2. Locate the "Chapter 3. WebDriver Fundamentals" section
    // 3. Click on "Web form" link
    await page.getByRole('link', { name: 'Web form' }).click();

    // Verify page navigates to web-form.html
    await expect(page).toHaveURL(/.*web-form\.html/);

    // Verify page title displays "Hands-On Selenium WebDriver with Java"
    await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');

    // Verify "Web form" heading (h1) is visible
    await expect(page.getByRole('heading', { name: 'Web form' })).toBeVisible();

    // Verify all form elements are present and visible
    await expect(page.getByRole('textbox', { name: 'Text input' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Textarea' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Disabled input' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Readonly input' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Dropdown (select)' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Checked checkbox' })).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Default checkbox' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Checked radio' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Default radio' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
  });
});
