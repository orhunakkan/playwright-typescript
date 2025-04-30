import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { RegisterPage } from '../../pages/task-manager-register';
import { LoginPage } from '../../pages/task-manager-login';

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

    // Initialize the RegisterPage
    const registerPage = new RegisterPage(page);

    // Navigate to the registration page
    await registerPage.goto(baseUrl);

    // Verify we're on the register page
    await expect(registerPage.pageContainer).toBeVisible();
    await expect(registerPage.pageTitle).toHaveText('Register');

    // Register with the generated user data
    await registerPage.register(userData.name, userData.email, userData.password);

    // Verify success message
    await registerPage.expectSuccessMessage();

    // Verify redirection to login page (happens after timeout)
    await page.waitForURL(`${baseUrl}/login`, { timeout: 5000 });

    // Bonus: Try logging in with the newly created account
    const loginPage = new LoginPage(page);
    await loginPage.login(userData.email, userData.password);

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

    const registerPage = new RegisterPage(page);

    // Register first time
    await registerPage.goto(baseUrl);
    await registerPage.register(userData.name, userData.email, userData.password);

    // Wait for success and redirection
    await registerPage.expectSuccessMessage();
    await page.waitForURL(`${baseUrl}/login`, { timeout: 5000 });

    // Try to register again with same email
    await registerPage.goto(baseUrl);
    await registerPage.register(
      faker.person.fullName(),
      userData.email, // Same email
      faker.internet.password({ length: 10 })
    );

    // Verify error message
    await registerPage.expectErrorMessage('Email already registered');
  });

  test('validates form inputs before submission', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto(baseUrl);

    // Test empty form submission
    await registerPage.submitRegistration();

    // HTML validation should prevent form submission
    // Check we're still on register page
    await expect(page.url()).toBe(`${baseUrl}/register`);

    // Test invalid email format
    await registerPage.fillRegistrationForm(faker.person.fullName(), 'invalid-email', faker.internet.password());
    await registerPage.submitRegistration();

    // HTML validation should catch this
    await expect(page.url()).toBe(`${baseUrl}/register`);

    // Test very short password
    await registerPage.emailInput.fill(faker.internet.email());
    await registerPage.passwordInput.fill('12345');
    await registerPage.submitRegistration();

    // Check we stay on register page (assuming minimum 6 chars)
    await expect(page.url()).toBe(`${baseUrl}/register`);
  });

  test('has proper UI elements and styling', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto(baseUrl);

    // Check form elements existence
    await expect(registerPage.nameInput).toBeVisible();
    await expect(registerPage.emailInput).toBeVisible();
    await expect(registerPage.passwordInput).toBeVisible();
    await expect(registerPage.submitButton).toBeVisible();

    // Check UI styling
    await registerPage.checkPageStyling();
  });

  test('navigates between register and login pages', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);

    // Start at register page
    await registerPage.goto(baseUrl);

    // Navigate to login through the app navigation
    await registerPage.navigateToLogin();
    await loginPage.verifyOnLoginPage(baseUrl);

    // Go back to register page
    await loginPage.navigateToRegister();
    await expect(page.url()).toBe(`${baseUrl}/register`);
    await expect(registerPage.pageContainer).toBeVisible();
  });
});
