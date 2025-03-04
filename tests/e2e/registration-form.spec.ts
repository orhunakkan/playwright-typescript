import { test, expect } from '@playwright/test';

test.describe('Registration Form Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the registration form page
    await page.goto('https://practice.cydeo.com/registration_form');
  });

  test('should successfully submit the registration form with valid data', async ({ page }) => {
    // Fill in the form with valid data
    await page.fill('input[name="firstname"]', 'John');
    await page.fill('input[name="lastname"]', 'Doe');
    await page.fill('input[name="username"]', 'johndoe123');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.fill('input[name="phone"]', '571-123-4567');

    // Select gender
    await page.check('input[name="gender"][value="male"]');

    // Enter date of birth
    await page.fill('input[name="birthday"]', '01/15/1990');

    // Select department using select dropdown
    await page.selectOption('select[name="department"]', 'DE');

    // Select job title
    await page.selectOption('select[name="job_title"]', { label: 'SDET' });

    // Select programming languages
    await page.check('#inlineCheckbox2'); // Java
    await page.check('#inlineCheckbox3'); // JavaScript

    // Submit the form
    await page.click('#wooden_spoon');

    // Wait for navigation after form submission
    await page.waitForURL(/.*registration_confirmation.*/);

    // Verify the landed page contains You've successfully completed registration!
    const confirmationMessage = await page.locator('.alert-success').textContent();
    expect(confirmationMessage).toContain("You've successfully completed registration!");
  });

  test('should display validation errors for invalid form submission', async ({ page }) => {
    // Fill form with invalid data
    await page.fill('input[name="firstname"]', 'Jane');
    await page.fill('input[name="lastname"]', 'Smith');
    await page.fill('input[name="username"]', 'jane'); // Too short username
    await page.fill('input[name="email"]', 'invalid-email'); // Invalid email
    await page.fill('input[name="password"]', 'pass'); // Too short password
    await page.fill('input[name="phone"]', '123-456'); // Invalid phone format

    // Focus away from the inputs to trigger validation
    await page.click('body');

    // Verify validation errors are displayed
    const usernameError = page.locator('small:text-matches("username must be more than 6")');
    const emailError = page.locator('small:text-matches("Email format is not correct")');
    const passwordError = page.locator('small:text-matches("password must have at least 8 characters")');
    const phoneError = page.locator('small:text-matches("Phone format is not correct")');

    // Assert validation errors are displayed
    await expect(usernameError).toBeVisible();
    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
    await expect(phoneError).toBeVisible();

    // Verify we are still on the registration page (form not submitted)
    expect(page.url()).toContain('registration_form');
  });
});
