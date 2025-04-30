import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('Registration functionality', () => {
  // Define base URL for consistent testing
  const baseUrl = 'http://localhost:3000';

  test('successfully registers a new user', async ({ page }) => {
    // Generate random user data using faker
    const userData = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 10, memorable: true })
    };

    // Navigate to the registration page
    await page.goto(`${baseUrl}/register`);

    // Verify we're on the register page
    await expect(page.getByTestId('register-page')).toBeVisible();
    await expect(page.getByTestId('register-title')).toHaveText('Register');

    // Fill out the registration form
    await page.getByTestId('register-name').fill(userData.name);
    await page.getByTestId('register-email').fill(userData.email);
    await page.getByTestId('register-password').fill(userData.password);

    // Submit the form
    await page.getByTestId('register-submit').click();

    // Wait for success message
    await expect(page.getByTestId('register-success')).toBeVisible();
    await expect(page.getByTestId('register-success')).toContainText('Registration successful');

    // Verify redirection to login page (happens after timeout)
    await page.waitForURL(`${baseUrl}/login`, { timeout: 5000 });

    // Bonus: Try logging in with the newly created account
    await page.getByTestId('login-email').fill(userData.email);
    await page.getByTestId('login-password').fill(userData.password);
    await page.getByTestId('login-submit').click();

    // Verify successful login with redirect to dashboard
    await page.waitForURL(`${baseUrl}/dashboard`);
    await expect(page.getByTestId('dashboard-page')).toBeVisible();
  });

  test('displays error for duplicate email registration', async ({ page }) => {
    // First register a user
    const userData = {
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password({ length: 10 })
    };

    // Register first time
    await page.goto(`${baseUrl}/register`);
    await page.getByTestId('register-name').fill(userData.name);
    await page.getByTestId('register-email').fill(userData.email);
    await page.getByTestId('register-password').fill(userData.password);
    await page.getByTestId('register-submit').click();

    // Wait for success and redirection
    await expect(page.getByTestId('register-success')).toBeVisible();
    await page.waitForURL(`${baseUrl}/login`, { timeout: 5000 });

    // Try to register again with same email
    await page.goto(`${baseUrl}/register`);
    await page.getByTestId('register-name').fill(faker.person.fullName());
    await page.getByTestId('register-email').fill(userData.email); // Same email
    await page.getByTestId('register-password').fill(faker.internet.password({ length: 10 }));
    await page.getByTestId('register-submit').click();

    // Verify error message
    await expect(page.getByTestId('register-error')).toBeVisible();
    await expect(page.getByTestId('register-error')).toContainText('Email already registered');
  });

  test('validates form inputs before submission', async ({ page }) => {
    await page.goto(`${baseUrl}/register`);

    // Test empty form submission
    await page.getByTestId('register-submit').click();

    // HTML validation should prevent form submission
    // Check we're still on register page
    await expect(page.url()).toBe(`${baseUrl}/register`);

    // Test invalid email format
    await page.getByTestId('register-name').fill(faker.person.fullName());
    await page.getByTestId('register-email').fill('invalid-email');
    await page.getByTestId('register-password').fill(faker.internet.password());
    await page.getByTestId('register-submit').click();

    // HTML validation should catch this
    await expect(page.url()).toBe(`${baseUrl}/register`);

    // Test very short password
    await page.getByTestId('register-email').fill(faker.internet.email());
    await page.getByTestId('register-password').fill('12345');
    await page.getByTestId('register-submit').click();

    // Check we stay on register page (assuming minimum 6 chars)
    await expect(page.url()).toBe(`${baseUrl}/register`);
  });

  test('has proper UI elements and styling', async ({ page }) => {
    await page.goto(`${baseUrl}/register`);

    // Check form elements existence
    await expect(page.getByTestId('register-name')).toBeVisible();
    await expect(page.getByTestId('register-email')).toBeVisible();
    await expect(page.getByTestId('register-password')).toBeVisible();
    await expect(page.getByTestId('register-submit')).toBeVisible();

    // Check UI styling (just basic checks)
    const submitButton = page.getByTestId('register-submit');
    await expect(submitButton).toHaveCSS('background-color', 'rgb(59, 130, 246)'); // blue-500 in Tailwind

    // Check form container styling
    const formContainer = page.getByTestId('register-page');
    await expect(formContainer).toHaveCSS('border-radius', '8px'); // rounded-lg in Tailwind
  });

  test('navigates between register and login pages', async ({ page }) => {
    // While this isn't directly related to registration functionality,
    // it's good to test navigation between authentication pages

    // Start at register page
    await page.goto(`${baseUrl}/register`);

    // Navigate to login through the app navigation
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page.url()).toBe(`${baseUrl}/login`);
    await expect(page.getByTestId('login-page')).toBeVisible();

    // Go back to register page
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page.url()).toBe(`${baseUrl}/register`);
    await expect(page.getByTestId('register-page')).toBeVisible();
  });
});
