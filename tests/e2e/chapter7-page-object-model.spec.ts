import { expect, test } from '@playwright/test';
import { LoginFormPage } from '../../pages/login-form.page';
import { SlowLoginFormPage } from '../../pages/slow-login-form.page';

const BASE_URL = process.env.PRACTICE_E2E_URL;

test.describe('Chapter 7 - The Page Object Model (POM)', () => {
  // ─────────────────────────────────────────────────
  //  1. Login Form
  // ─────────────────────────────────────────────────
  test.describe('Login Form', () => {
    let loginPage: LoginFormPage;

    test.beforeEach(async ({ page }) => {
      loginPage = new LoginFormPage(page);
      await loginPage.goto();
    });

    test('should display the login form heading', async () => {
      await expect(loginPage.heading).toBeVisible();
    });

    test('should have a username input field', async () => {
      await expect(loginPage.usernameInput).toBeVisible();
      await expect(loginPage.usernameInput).toHaveId('username');
      await expect(loginPage.usernameInput).toHaveAttribute('type', 'text');
      await expect(loginPage.usernameInput).toHaveAttribute('name', 'username');
    });

    test('should have a password input field', async () => {
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.passwordInput).toHaveId('password');
      await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
      await expect(loginPage.passwordInput).toHaveAttribute('name', 'password');
      await expect(loginPage.passwordInput).toHaveAttribute('autocomplete', 'off');
    });

    test('should have a submit button', async () => {
      await expect(loginPage.submitButton).toBeVisible();
      await expect(loginPage.submitButton).toHaveAttribute('type', 'submit');
    });

    test('should have empty inputs initially', async () => {
      await expect(loginPage.usernameInput).toHaveValue('');
      await expect(loginPage.passwordInput).toHaveValue('');
    });

    test('should allow typing in the username field', async () => {
      await loginPage.usernameInput.fill('testuser');
      await expect(loginPage.usernameInput).toHaveValue('testuser');
    });

    test('should allow typing in the password field', async () => {
      await loginPage.passwordInput.fill('secret123');
      await expect(loginPage.passwordInput).toHaveValue('secret123');
    });

    test('should have a hidden invalid credentials alert', async () => {
      await expect(loginPage.invalidAlert).toBeAttached();
      await expect(loginPage.invalidAlert).toHaveClass(/d-none/);
      await expect(loginPage.invalidAlert).toHaveText('Invalid credentials');
    });

    test('should login successfully with valid credentials', async () => {
      await loginPage.login('user', 'user');
      await loginPage.expectSuccessfulLogin();
    });

    test('should show success alert with correct styling', async () => {
      await loginPage.login('user', 'user');
      await expect(loginPage.page).toHaveURL(/login-sucess\.html/);
      await expect(loginPage.successAlert).toHaveClass(/alert-success/);
    });

    test('should show invalid credentials with wrong username', async () => {
      await loginPage.login('wronguser', 'user');
      await loginPage.expectInvalidCredentials();
    });

    test('should show invalid credentials with wrong password', async () => {
      await loginPage.login('user', 'wrongpass');
      await expect(loginPage.page).toHaveURL(/login-form\.html/);
      await expect(loginPage.invalidAlert).toBeVisible();
    });

    test('should show invalid credentials with empty fields', async () => {
      await loginPage.submitButton.click();
      await loginPage.expectInvalidCredentials();
    });

    test('should show invalid credentials with both wrong', async () => {
      await loginPage.login('wrong', 'wrong');
      await expect(loginPage.page).toHaveURL(/login-form\.html/);
      await expect(loginPage.invalidAlert).toBeVisible();
    });

    test('should have the form action pointing to success page', async () => {
      await expect(loginPage.form).toHaveAttribute('action', 'login-sucess.html');
      await expect(loginPage.form).toHaveAttribute('method', 'get');
    });

    test('should have correct button styling', async () => {
      await expect(loginPage.submitButton).toHaveClass(/btn-outline-primary/);
    });

    test('should pass query parameters on successful login', async () => {
      await loginPage.login('user', 'user');
      await expect(loginPage.page).toHaveURL(/username=user/);
      await expect(loginPage.page).toHaveURL(/password=user/);
    });

    test('should clear and re-type credentials', async () => {
      await loginPage.usernameInput.fill('wrong');
      await loginPage.passwordInput.fill('wrong');
      await expect(loginPage.usernameInput).toHaveValue('wrong');

      await loginPage.usernameInput.clear();
      await loginPage.passwordInput.clear();
      await expect(loginPage.usernameInput).toHaveValue('');
      await expect(loginPage.passwordInput).toHaveValue('');

      await loginPage.usernameInput.fill('user');
      await loginPage.passwordInput.fill('user');
      await expect(loginPage.usernameInput).toHaveValue('user');
      await expect(loginPage.passwordInput).toHaveValue('user');
    });

    test('should submit form via Enter key', async () => {
      await loginPage.usernameInput.fill('user');
      await loginPage.passwordInput.fill('user');
      await loginPage.passwordInput.press('Enter');

      await expect(loginPage.page).toHaveURL(/login-sucess\.html/);
      await expect(loginPage.successAlert).toBeVisible();
    });

    test('should verify page title and copyright', async () => {
      await expect(loginPage.page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(loginPage.page.getByText('Copyright © 2021-2025')).toBeAttached();
    });

    test('should tab between form fields', async () => {
      await loginPage.usernameInput.click();
      await expect(loginPage.usernameInput).toBeFocused();

      await loginPage.page.keyboard.press('Tab');
      await expect(loginPage.passwordInput).toBeFocused();
    });
  });

  // ─────────────────────────────────────────────────
  //  2. Slow Login Form
  // ─────────────────────────────────────────────────
  test.describe('Slow Login Form', () => {
    let slowLoginPage: SlowLoginFormPage;

    test.beforeEach(async ({ page }) => {
      slowLoginPage = new SlowLoginFormPage(page);
      await slowLoginPage.goto();
    });

    test('should display the slow login form heading', async () => {
      await expect(slowLoginPage.heading).toBeVisible();
    });

    test('should have a username input field', async () => {
      await expect(slowLoginPage.usernameInput).toBeVisible();
      await expect(slowLoginPage.usernameInput).toHaveId('username');
    });

    test('should have a password input field', async () => {
      await expect(slowLoginPage.passwordInput).toBeVisible();
      await expect(slowLoginPage.passwordInput).toHaveId('password');
    });

    test('should have a submit button', async () => {
      await expect(slowLoginPage.submitButton).toBeVisible();
    });

    test('should have a hidden spinner element', async () => {
      await expect(slowLoginPage.spinner).toBeAttached();
      await expect(slowLoginPage.spinner).toBeHidden();
      await expect(slowLoginPage.spinner).toHaveClass(/spinner-border/);
    });

    test('should show spinner when form is submitted', async () => {
      await slowLoginPage.usernameInput.fill('user');
      await slowLoginPage.passwordInput.fill('user');

      await expect(slowLoginPage.spinner).toBeHidden();

      await slowLoginPage.submitButton.click();

      // Spinner should become visible during the delay
      await expect(slowLoginPage.spinner).toBeVisible();
    });

    test('should login successfully with valid credentials after delay', async () => {
      await slowLoginPage.login('user', 'user');
      await slowLoginPage.expectSuccessfulLogin();
    });

    test('should show invalid credentials with wrong credentials after delay', async () => {
      await slowLoginPage.login('wronguser', 'wrongpass');

      // Spinner appears during delay
      await expect(slowLoginPage.spinner).toBeVisible();

      // After delay, error should show and spinner should hide
      await expect(slowLoginPage.invalidAlert).toBeVisible({ timeout: 10000 });
      await expect(slowLoginPage.spinner).toBeHidden();
    });

    test('should show invalid credentials with wrong username after delay', async () => {
      await slowLoginPage.login('wrong', 'user');
      await slowLoginPage.expectInvalidCredentials();
    });

    test('should show invalid credentials with wrong password after delay', async () => {
      await slowLoginPage.login('user', 'wrong');
      await expect(slowLoginPage.invalidAlert).toBeVisible({ timeout: 10000 });
    });

    test('should show invalid credentials with empty fields after delay', async () => {
      await slowLoginPage.submitButton.click();
      await slowLoginPage.expectInvalidCredentials();
    });

    test('should hide spinner after delay completes on failure', async () => {
      await slowLoginPage.login('wrong', 'wrong');

      // Spinner shows during delay
      await expect(slowLoginPage.spinner).toBeVisible();

      // After ~3s the spinner should hide and the error should appear
      await expect(slowLoginPage.spinner).toBeHidden({ timeout: 10000 });
      await expect(slowLoginPage.invalidAlert).toBeVisible();
    });

    test('should stay on the same page during the delay', async () => {
      await slowLoginPage.login('user', 'user');

      // Right after clicking, should still be on login-slow.html
      await expect(slowLoginPage.page).toHaveURL(/login-slow\.html/);

      // Spinner should be visible during the wait
      await expect(slowLoginPage.spinner).toBeVisible();

      // Eventually navigates
      await expect(slowLoginPage.page).toHaveURL(/login-sucess\.html/, { timeout: 10000 });
    });

    test('should have the form with correct id and action', async () => {
      await expect(slowLoginPage.form).toBeAttached();
      await expect(slowLoginPage.form).toHaveAttribute('action', 'login-sucess.html');
      await expect(slowLoginPage.form).toHaveAttribute('method', 'get');
    });

    test('should verify success page shows correct heading after slow login', async () => {
      await slowLoginPage.login('user', 'user');

      await expect(slowLoginPage.page).toHaveURL(/login-sucess\.html/, { timeout: 10000 });

      // Success page should still show "Login form" heading
      await expect(slowLoginPage.page.getByRole('heading', { name: 'Login form' })).toBeVisible();
      await expect(slowLoginPage.successAlert).toHaveClass(/alert-success/);
    });

    test('should pass query parameters on successful slow login', async () => {
      await slowLoginPage.login('user', 'user');

      await expect(slowLoginPage.page).toHaveURL(/login-sucess\.html/, { timeout: 10000 });
      await expect(slowLoginPage.page).toHaveURL(/login-sucess\.html/);
    });

    test('should verify page title and copyright on slow login page', async () => {
      await expect(slowLoginPage.page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(slowLoginPage.page.getByText('Copyright © 2021-2025')).toBeAttached();
      await expect(slowLoginPage.page.getByRole('link', { name: 'Boni García' })).toBeVisible();
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
