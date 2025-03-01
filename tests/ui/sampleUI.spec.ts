import { test, expect } from '@playwright/test';

test('Registration Form Test', async ({ page }) => {
  // Navigate to the registration page
  await page.goto('https://practice.cydeo.com/registration_form');
  await page.waitForLoadState('networkidle');

  // Fill out text inputs
  await page.fill('input[name="firstname"]', 'John');
  await page.fill('input[name="lastname"]', 'Doe');
  await page.fill('input[name="username"]', 'johndoe123');
  await page.fill('input[name="email"]', 'john.doe@example.com');
  await page.fill('input[name="password"]', 'Password!123');
  await page.fill('input[name="phone"]', '571-000-0000');
  await page.fill('input[name="birthday"]', '01/01/1990');

  // Select a gender radio button (choose 'male' in this case)
  await page.check('input[name="gender"][value="male"]');

  // Select an option from the Department / Office dropdown
  await page.selectOption('select[name="department"]', 'DE'); // e.g., Department of Engineering

  // Select an option from the Job title dropdown (by label)
  await page.selectOption('select[name="job_title"]', { label: 'Developer' });

  // Check the programming languages checkboxes
  await page.check('#inlineCheckbox1'); // C++
  await page.check('#inlineCheckbox2'); // Java
  await page.check('#inlineCheckbox3'); // JavaScript

  // Wait for the sign up button to become enabled (assuming valid input triggers enabling)
  const signUpButton = page.locator('#wooden_spoon');
  await expect(signUpButton).toBeEnabled({ timeout: 5000 }).catch(error => {
    console.error('Sign up button is not enabled:', error.toString());
    throw new Error('Sign up button is not enabled: ' + error.toString());
  });

  // Click the "Sign up" button
  await signUpButton.click();
  
  // Assert the success message appears
  const successMessage = page.locator('div.alert-success');
  await expect(successMessage).toBeVisible();
  await expect(successMessage).toContainText("You've successfully completed registration!");
});
