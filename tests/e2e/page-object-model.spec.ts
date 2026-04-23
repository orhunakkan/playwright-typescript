import { expect, test } from '../../fixtures/page-fixtures';
import { feature, story, severity } from 'allure-js-commons';

import { config } from '../../config/env';
const BASE_URL = config.e2eUrl;

test.describe('Chapter 7 - The Page Object Model (POM)', () => {
  // ─────────────────────────────────────────────────
  //  1. Login Form
  // ─────────────────────────────────────────────────
  test.describe('Login Form', () => {
    test.beforeEach(async ({ loginFormPage }) => {
      await feature('Page Object Model');
      await story('Login Form');
      await severity('critical');
      await loginFormPage.actions.goto();
    });

    test('should display the login form heading', { tag: ['@smoke'] }, async ({ loginFormPage }) => {
      await expect(loginFormPage.locators.heading).toBeVisible();
    });

    test('should have a username input field', async ({ loginFormPage }) => {
      await expect.soft(loginFormPage.locators.usernameInput).toBeVisible();
      await expect.soft(loginFormPage.locators.usernameInput).toHaveId('username');
      await expect.soft(loginFormPage.locators.usernameInput).toHaveAttribute('type', 'text');
      await expect.soft(loginFormPage.locators.usernameInput).toHaveAttribute('name', 'username');
    });

    test('should have a password input field', async ({ loginFormPage }) => {
      await expect.soft(loginFormPage.locators.passwordInput).toBeVisible();
      await expect.soft(loginFormPage.locators.passwordInput).toHaveId('password');
      await expect.soft(loginFormPage.locators.passwordInput).toHaveAttribute('type', 'password');
      await expect.soft(loginFormPage.locators.passwordInput).toHaveAttribute('name', 'password');
      await expect.soft(loginFormPage.locators.passwordInput).toHaveAttribute('autocomplete', 'off');
    });

    test('should have a submit button', async ({ loginFormPage }) => {
      await expect(loginFormPage.locators.submitButton).toBeVisible();
      await expect(loginFormPage.locators.submitButton).toHaveAttribute('type', 'submit');
    });

    test('should have empty inputs initially', async ({ loginFormPage }) => {
      await expect(loginFormPage.locators.usernameInput).toHaveValue('');
      await expect(loginFormPage.locators.passwordInput).toHaveValue('');
    });

    test('should allow typing in the username field', async ({ loginFormPage }) => {
      await loginFormPage.locators.usernameInput.fill('testuser');
      await expect(loginFormPage.locators.usernameInput).toHaveValue('testuser');
    });

    test('should allow typing in the password field', async ({ loginFormPage }) => {
      await loginFormPage.locators.passwordInput.fill('secret123');
      await expect(loginFormPage.locators.passwordInput).toHaveValue('secret123');
    });

    test('should have a hidden invalid credentials alert', async ({ loginFormPage }) => {
      await expect.soft(loginFormPage.locators.invalidAlert).toBeAttached();
      await expect.soft(loginFormPage.locators.invalidAlert).toHaveClass(/d-none/);
      await expect.soft(loginFormPage.locators.invalidAlert).toHaveText('Invalid credentials');
    });

    test('should login successfully with valid credentials', { tag: ['@smoke', '@critical'] }, async ({ loginFormPage, page }) => {
      await loginFormPage.actions.login('user', 'user');
      await expect(page).toHaveURL(/login-sucess\.html/);
      await expect(loginFormPage.locators.successAlert).toBeVisible();
      await expect(loginFormPage.locators.successAlert).toHaveText('Login successful');
    });

    test('should show success alert with correct styling', async ({ loginFormPage, page }) => {
      await loginFormPage.actions.login('user', 'user');
      await expect(page).toHaveURL(/login-sucess\.html/);
      await expect(loginFormPage.locators.successAlert).toHaveClass(/alert-success/);
    });

    const invalidCredentialCases = [
      { label: 'wrong username', username: 'wronguser', password: 'user' },
      { label: 'wrong password', username: 'user', password: 'wrongpass' },
      { label: 'empty fields', username: '', password: '' },
      { label: 'both wrong', username: 'wrong', password: 'wrong' },
    ];

    for (const { label, username, password } of invalidCredentialCases) {
      test(`should show invalid credentials with ${label}`, { tag: ['@critical'] }, async ({ loginFormPage, page }) => {
        await loginFormPage.actions.login(username, password);
        await expect(page).toHaveURL(/login-form\.html/);
        await expect(loginFormPage.locators.invalidAlert).toBeVisible();
        await expect(loginFormPage.locators.invalidAlert).toHaveText('Invalid credentials');
      });
    }

    test('should have the form action pointing to success page', async ({ loginFormPage }) => {
      await expect.soft(loginFormPage.locators.form).toHaveAttribute('action', 'login-sucess.html');
      await expect.soft(loginFormPage.locators.form).toHaveAttribute('method', 'get');
    });

    test('should have correct button styling', async ({ loginFormPage }) => {
      await expect(loginFormPage.locators.submitButton).toHaveClass(/btn-outline-primary/);
    });

    test('should pass query parameters on successful login', async ({ loginFormPage, page }) => {
      await loginFormPage.actions.login('user', 'user');
      await expect(page).toHaveURL(/username=user/);
      await expect(page).toHaveURL(/password=user/);
    });

    test('should clear and re-type credentials', async ({ loginFormPage }) => {
      await loginFormPage.locators.usernameInput.fill('wrong');
      await loginFormPage.locators.passwordInput.fill('wrong');
      await expect(loginFormPage.locators.usernameInput).toHaveValue('wrong');

      await loginFormPage.locators.usernameInput.clear();
      await loginFormPage.locators.passwordInput.clear();
      await expect(loginFormPage.locators.usernameInput).toHaveValue('');
      await expect(loginFormPage.locators.passwordInput).toHaveValue('');

      await loginFormPage.locators.usernameInput.fill('user');
      await loginFormPage.locators.passwordInput.fill('user');
      await expect(loginFormPage.locators.usernameInput).toHaveValue('user');
      await expect(loginFormPage.locators.passwordInput).toHaveValue('user');
    });

    test('should submit form via Enter key', { tag: ['@critical'] }, async ({ loginFormPage, page }) => {
      await loginFormPage.locators.usernameInput.fill('user');
      await loginFormPage.locators.passwordInput.fill('user');
      await loginFormPage.locators.passwordInput.press('Enter');

      await expect(page).toHaveURL(/login-sucess\.html/);
      await expect(loginFormPage.locators.successAlert).toBeVisible();
    });

    test('should verify page title and copyright', async ({ page }) => {
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(page.getByText('Copyright © 2021-2025')).toBeAttached();
    });

    test('should tab between form fields', async ({ loginFormPage, page }) => {
      await loginFormPage.locators.usernameInput.click();
      await expect(loginFormPage.locators.usernameInput).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(loginFormPage.locators.passwordInput).toBeFocused();
    });
  });

  // ─────────────────────────────────────────────────
  //  2. Slow Login Form
  // ─────────────────────────────────────────────────
  test.describe('Slow Login Form', () => {
    test.beforeEach(async ({ slowLoginFormPage }) => {
      await feature('Page Object Model');
      await story('Slow Login Form');
      await severity('critical');
      await slowLoginFormPage.actions.goto();
    });

    test('should display the slow login form heading', { tag: ['@smoke'] }, async ({ slowLoginFormPage }) => {
      await expect(slowLoginFormPage.locators.heading).toBeVisible();
    });

    test('should have a username input field', async ({ slowLoginFormPage }) => {
      await expect(slowLoginFormPage.locators.usernameInput).toBeVisible();
      await expect(slowLoginFormPage.locators.usernameInput).toHaveId('username');
    });

    test('should have a password input field', async ({ slowLoginFormPage }) => {
      await expect(slowLoginFormPage.locators.passwordInput).toBeVisible();
      await expect(slowLoginFormPage.locators.passwordInput).toHaveId('password');
    });

    test('should have a submit button', async ({ slowLoginFormPage }) => {
      await expect(slowLoginFormPage.locators.submitButton).toBeVisible();
    });

    test('should have a hidden spinner element', async ({ slowLoginFormPage }) => {
      await expect.soft(slowLoginFormPage.locators.spinner).toBeAttached();
      await expect.soft(slowLoginFormPage.locators.spinner).toBeHidden();
      await expect.soft(slowLoginFormPage.locators.spinner).toHaveClass(/spinner-border/);
    });

    test('should show spinner when form is submitted', async ({ slowLoginFormPage }) => {
      await slowLoginFormPage.locators.usernameInput.fill('user');
      await slowLoginFormPage.locators.passwordInput.fill('user');

      await expect(slowLoginFormPage.locators.spinner).toBeHidden();

      await slowLoginFormPage.locators.submitButton.click();

      // Spinner should become visible during the delay
      await expect(slowLoginFormPage.locators.spinner).toBeVisible();
    });

    test('should login successfully with valid credentials after delay', { tag: ['@smoke', '@critical'] }, async ({ slowLoginFormPage, page }) => {
      await slowLoginFormPage.actions.login('user', 'user');
      await expect(page).toHaveURL(/login-sucess\.html/, { timeout: 10000 });
      await expect(slowLoginFormPage.locators.successAlert).toBeVisible();
      await expect(slowLoginFormPage.locators.successAlert).toHaveText('Login successful');
    });

    test('should show invalid credentials with wrong credentials after delay', { tag: ['@critical'] }, async ({ slowLoginFormPage }) => {
      await slowLoginFormPage.actions.login('wronguser', 'wrongpass');

      // Spinner appears during delay
      await expect(slowLoginFormPage.locators.spinner).toBeVisible();

      // After delay, error should show and spinner should hide
      await expect(slowLoginFormPage.locators.invalidAlert).toBeVisible({ timeout: 10000 });
      await expect(slowLoginFormPage.locators.spinner).toBeHidden();
    });

    const slowInvalidCredentialCases = [
      { label: 'wrong username', username: 'wrong', password: 'user' },
      { label: 'wrong password', username: 'user', password: 'wrong' },
      { label: 'empty fields', username: '', password: '' },
    ];

    for (const { label, username, password } of slowInvalidCredentialCases) {
      test(`should show invalid credentials with ${label} after delay`, async ({ slowLoginFormPage }) => {
        await slowLoginFormPage.actions.login(username, password);
        await expect(slowLoginFormPage.locators.invalidAlert).toBeVisible({ timeout: 10000 });
        await expect(slowLoginFormPage.locators.invalidAlert).toHaveText('Invalid credentials');
      });
    }

    test('should hide spinner after delay completes on failure', async ({ slowLoginFormPage }) => {
      await slowLoginFormPage.actions.login('wrong', 'wrong');

      // Spinner shows during delay
      await expect(slowLoginFormPage.locators.spinner).toBeVisible();

      // After ~3s the spinner should hide and the error should appear
      await expect(slowLoginFormPage.locators.spinner).toBeHidden({ timeout: 10000 });
      await expect(slowLoginFormPage.locators.invalidAlert).toBeVisible();
    });

    test('should stay on the same page during the delay', async ({ slowLoginFormPage, page }) => {
      await slowLoginFormPage.actions.login('user', 'user');

      // Right after clicking, should still be on login-slow.html
      await expect(page).toHaveURL(/login-slow\.html/);

      // Spinner should be visible during the wait
      await expect(slowLoginFormPage.locators.spinner).toBeVisible();

      // Eventually navigates
      await expect(page).toHaveURL(/login-sucess\.html/, { timeout: 10000 });
    });

    test('should have the form with correct id and action', async ({ slowLoginFormPage }) => {
      await expect.soft(slowLoginFormPage.locators.form).toBeAttached();
      await expect.soft(slowLoginFormPage.locators.form).toHaveAttribute('action', 'login-sucess.html');
      await expect.soft(slowLoginFormPage.locators.form).toHaveAttribute('method', 'get');
    });

    test('should verify success page shows correct heading after slow login', async ({ slowLoginFormPage, page }) => {
      await slowLoginFormPage.actions.login('user', 'user');

      await expect(page).toHaveURL(/login-sucess\.html/, { timeout: 10000 });

      // Success page should still show "Login form" heading
      await expect(page.getByRole('heading', { name: 'Login form' })).toBeVisible();
      await expect(slowLoginFormPage.locators.successAlert).toHaveClass(/alert-success/);
    });

    test('should pass query parameters on successful slow login', async ({ slowLoginFormPage, page }) => {
      await slowLoginFormPage.actions.login('user', 'user');

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
    test.beforeEach(async () => {
      await feature('Page Object Model');
      await story('Chapter 7 Index');
      await severity('normal');
    });
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
