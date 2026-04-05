import { expect, test } from '@playwright/test';
import { LoginFormPage } from '../../pages/login-form.page';
import { SlowLoginFormPage } from '../../pages/slow-login-form.page';

import { config } from '../../config/env';
const BASE_URL = config.e2eUrl;

test.describe('Chapter 7 - The Page Object Model (POM)', () => {
  // ─────────────────────────────────────────────────
  //  1. Login Form
  // ─────────────────────────────────────────────────
  test.describe('Login Form', () => {
    let loginPage: LoginFormPage;

    test.beforeEach(async ({ page }) => {
      loginPage = new LoginFormPage(page);
      await loginPage.actions.goto();
    });

    test('should display the login form heading @smoke', async () => {
      await expect(loginPage.locators.heading).toBeVisible();
    });

    test('should have a username input field', async () => {
      await expect.soft(loginPage.locators.usernameInput).toBeVisible();
      await expect.soft(loginPage.locators.usernameInput).toHaveId('username');
      await expect.soft(loginPage.locators.usernameInput).toHaveAttribute('type', 'text');
      await expect.soft(loginPage.locators.usernameInput).toHaveAttribute('name', 'username');
    });

    test('should have a password input field', async () => {
      await expect.soft(loginPage.locators.passwordInput).toBeVisible();
      await expect.soft(loginPage.locators.passwordInput).toHaveId('password');
      await expect.soft(loginPage.locators.passwordInput).toHaveAttribute('type', 'password');
      await expect.soft(loginPage.locators.passwordInput).toHaveAttribute('name', 'password');
      await expect.soft(loginPage.locators.passwordInput).toHaveAttribute('autocomplete', 'off');
    });

    test('should have a submit button', async () => {
      await expect(loginPage.locators.submitButton).toBeVisible();
      await expect(loginPage.locators.submitButton).toHaveAttribute('type', 'submit');
    });

    test('should have empty inputs initially', async () => {
      await expect(loginPage.locators.usernameInput).toHaveValue('');
      await expect(loginPage.locators.passwordInput).toHaveValue('');
    });

    test('should allow typing in the username field', async () => {
      await loginPage.locators.usernameInput.fill('testuser');
      await expect(loginPage.locators.usernameInput).toHaveValue('testuser');
    });

    test('should allow typing in the password field', async () => {
      await loginPage.locators.passwordInput.fill('secret123');
      await expect(loginPage.locators.passwordInput).toHaveValue('secret123');
    });

    test('should have a hidden invalid credentials alert', async () => {
      await expect.soft(loginPage.locators.invalidAlert).toBeAttached();
      await expect.soft(loginPage.locators.invalidAlert).toHaveClass(/d-none/);
      await expect.soft(loginPage.locators.invalidAlert).toHaveText('Invalid credentials');
    });

    test('should login successfully with valid credentials @smoke @critical', async ({ page }) => {
      await loginPage.actions.login('user', 'user');
      await expect(page).toHaveURL(/login-sucess\.html/);
      await expect(loginPage.locators.successAlert).toBeVisible();
      await expect(loginPage.locators.successAlert).toHaveText('Login successful');
    });

    test('should show success alert with correct styling', async ({ page }) => {
      await loginPage.actions.login('user', 'user');
      await expect(page).toHaveURL(/login-sucess\.html/);
      await expect(loginPage.locators.successAlert).toHaveClass(/alert-success/);
    });

    const invalidCredentialCases = [
      { label: 'wrong username', username: 'wronguser', password: 'user' },
      { label: 'wrong password', username: 'user', password: 'wrongpass' },
      { label: 'empty fields', username: '', password: '' },
      { label: 'both wrong', username: 'wrong', password: 'wrong' },
    ];

    for (const { label, username, password } of invalidCredentialCases) {
      test(`should show invalid credentials with ${label} @critical`, async ({ page }) => {
        await loginPage.actions.login(username, password);
        await expect(page).toHaveURL(/login-form\.html/);
        await expect(loginPage.locators.invalidAlert).toBeVisible();
        await expect(loginPage.locators.invalidAlert).toHaveText('Invalid credentials');
      });
    }

    test('should have the form action pointing to success page', async () => {
      await expect.soft(loginPage.locators.form).toHaveAttribute('action', 'login-sucess.html');
      await expect.soft(loginPage.locators.form).toHaveAttribute('method', 'get');
    });

    test('should have correct button styling', async () => {
      await expect(loginPage.locators.submitButton).toHaveClass(/btn-outline-primary/);
    });

    test('should pass query parameters on successful login', async ({ page }) => {
      await loginPage.actions.login('user', 'user');
      await expect(page).toHaveURL(/username=user/);
      await expect(page).toHaveURL(/password=user/);
    });

    test('should clear and re-type credentials', async () => {
      await loginPage.locators.usernameInput.fill('wrong');
      await loginPage.locators.passwordInput.fill('wrong');
      await expect(loginPage.locators.usernameInput).toHaveValue('wrong');

      await loginPage.locators.usernameInput.clear();
      await loginPage.locators.passwordInput.clear();
      await expect(loginPage.locators.usernameInput).toHaveValue('');
      await expect(loginPage.locators.passwordInput).toHaveValue('');

      await loginPage.locators.usernameInput.fill('user');
      await loginPage.locators.passwordInput.fill('user');
      await expect(loginPage.locators.usernameInput).toHaveValue('user');
      await expect(loginPage.locators.passwordInput).toHaveValue('user');
    });

    test('should submit form via Enter key @critical', async ({ page }) => {
      await loginPage.locators.usernameInput.fill('user');
      await loginPage.locators.passwordInput.fill('user');
      await loginPage.locators.passwordInput.press('Enter');

      await expect(page).toHaveURL(/login-sucess\.html/);
      await expect(loginPage.locators.successAlert).toBeVisible();
    });

    test('should verify page title and copyright', async ({ page }) => {
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(page.getByText('Copyright © 2021-2025')).toBeAttached();
    });

    test('should tab between form fields', async ({ page }) => {
      await loginPage.locators.usernameInput.click();
      await expect(loginPage.locators.usernameInput).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(loginPage.locators.passwordInput).toBeFocused();
    });
  });

  // ─────────────────────────────────────────────────
  //  2. Slow Login Form
  // ─────────────────────────────────────────────────
  test.describe('Slow Login Form', () => {
    let slowLoginPage: SlowLoginFormPage;

    test.beforeEach(async ({ page }) => {
      slowLoginPage = new SlowLoginFormPage(page);
      await slowLoginPage.actions.goto();
    });

    test('should display the slow login form heading @smoke', async () => {
      await expect(slowLoginPage.locators.heading).toBeVisible();
    });

    test('should have a username input field', async () => {
      await expect(slowLoginPage.locators.usernameInput).toBeVisible();
      await expect(slowLoginPage.locators.usernameInput).toHaveId('username');
    });

    test('should have a password input field', async () => {
      await expect(slowLoginPage.locators.passwordInput).toBeVisible();
      await expect(slowLoginPage.locators.passwordInput).toHaveId('password');
    });

    test('should have a submit button', async () => {
      await expect(slowLoginPage.locators.submitButton).toBeVisible();
    });

    test('should have a hidden spinner element', async () => {
      await expect.soft(slowLoginPage.locators.spinner).toBeAttached();
      await expect.soft(slowLoginPage.locators.spinner).toBeHidden();
      await expect.soft(slowLoginPage.locators.spinner).toHaveClass(/spinner-border/);
    });

    test('should show spinner when form is submitted', async () => {
      await slowLoginPage.locators.usernameInput.fill('user');
      await slowLoginPage.locators.passwordInput.fill('user');

      await expect(slowLoginPage.locators.spinner).toBeHidden();

      await slowLoginPage.locators.submitButton.click();

      // Spinner should become visible during the delay
      await expect(slowLoginPage.locators.spinner).toBeVisible();
    });

    test('should login successfully with valid credentials after delay @smoke @critical', async ({ page }) => {
      await slowLoginPage.actions.login('user', 'user');
      await expect(page).toHaveURL(/login-sucess\.html/, { timeout: 10000 });
      await expect(slowLoginPage.locators.successAlert).toBeVisible();
      await expect(slowLoginPage.locators.successAlert).toHaveText('Login successful');
    });

    test('should show invalid credentials with wrong credentials after delay @critical', async () => {
      await slowLoginPage.actions.login('wronguser', 'wrongpass');

      // Spinner appears during delay
      await expect(slowLoginPage.locators.spinner).toBeVisible();

      // After delay, error should show and spinner should hide
      await expect(slowLoginPage.locators.invalidAlert).toBeVisible({ timeout: 10000 });
      await expect(slowLoginPage.locators.spinner).toBeHidden();
    });

    const slowInvalidCredentialCases = [
      { label: 'wrong username', username: 'wrong', password: 'user' },
      { label: 'wrong password', username: 'user', password: 'wrong' },
      { label: 'empty fields', username: '', password: '' },
    ];

    for (const { label, username, password } of slowInvalidCredentialCases) {
      test(`should show invalid credentials with ${label} after delay`, async () => {
        await slowLoginPage.actions.login(username, password);
        await expect(slowLoginPage.locators.invalidAlert).toBeVisible({ timeout: 10000 });
        await expect(slowLoginPage.locators.invalidAlert).toHaveText('Invalid credentials');
      });
    }

    test('should hide spinner after delay completes on failure', async () => {
      await slowLoginPage.actions.login('wrong', 'wrong');

      // Spinner shows during delay
      await expect(slowLoginPage.locators.spinner).toBeVisible();

      // After ~3s the spinner should hide and the error should appear
      await expect(slowLoginPage.locators.spinner).toBeHidden({ timeout: 10000 });
      await expect(slowLoginPage.locators.invalidAlert).toBeVisible();
    });

    test('should stay on the same page during the delay', async ({ page }) => {
      await slowLoginPage.actions.login('user', 'user');

      // Right after clicking, should still be on login-slow.html
      await expect(page).toHaveURL(/login-slow\.html/);

      // Spinner should be visible during the wait
      await expect(slowLoginPage.locators.spinner).toBeVisible();

      // Eventually navigates
      await expect(page).toHaveURL(/login-sucess\.html/, { timeout: 10000 });
    });

    test('should have the form with correct id and action', async () => {
      await expect.soft(slowLoginPage.locators.form).toBeAttached();
      await expect.soft(slowLoginPage.locators.form).toHaveAttribute('action', 'login-sucess.html');
      await expect.soft(slowLoginPage.locators.form).toHaveAttribute('method', 'get');
    });

    test('should verify success page shows correct heading after slow login', async ({ page }) => {
      await slowLoginPage.actions.login('user', 'user');

      await expect(page).toHaveURL(/login-sucess\.html/, { timeout: 10000 });

      // Success page should still show "Login form" heading
      await expect(page.getByRole('heading', { name: 'Login form' })).toBeVisible();
      await expect(slowLoginPage.locators.successAlert).toHaveClass(/alert-success/);
    });

    test('should pass query parameters on successful slow login', async ({ page }) => {
      await slowLoginPage.actions.login('user', 'user');

      await expect(page).toHaveURL(/login-sucess\.html/, { timeout: 10000 });
      await expect(page).toHaveURL(/login-sucess\.html/);
    });

    test('should verify page title and copyright on slow login page', async ({ page }) => {
      await expect.soft(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect.soft(page.getByText('Copyright © 2021-2025')).toBeAttached();
      await expect.soft(page.getByRole('link', { name: 'Boni García' })).toBeVisible();
    });
  });

  // ─────────────────────────────────────────────────
  //  Index Page - Chapter 7 Links
  // ─────────────────────────────────────────────────
  test.describe('Index Page - Chapter 7 Links', () => {
    test('should display the Chapter 7 section heading', async ({ page }) => {
      await page.goto(`${BASE_URL}/index.html`);
      await expect(page.getByRole('heading', { name: 'Chapter 7. The Page Object Model (POM)' })).toBeVisible();
    });

    test('should have all Chapter 7 links', async ({ page }) => {
      await page.goto(`${BASE_URL}/index.html`);

      await expect(page.getByRole('link', { name: 'Login form' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Slow login' })).toBeVisible();
    });

    test('should navigate to each Chapter 7 page and back', async ({ page }) => {
      const links = [
        { name: 'Login form', url: 'login-form.html' },
        { name: 'Slow login', url: 'login-slow.html' },
      ];

      for (const link of links) {
        await page.goto(`${BASE_URL}/index.html`);
        await page.getByRole('link', { name: link.name }).click();
        await expect(page).toHaveURL(new RegExp(link.url.replace('.', '\\.')));
        await page.goBack();
        await expect(page).toHaveURL(/index\.html/);
      }
    });
  });
});
