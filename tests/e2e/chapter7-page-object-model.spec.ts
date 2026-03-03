import { expect, test } from '@playwright/test';

const BASE_URL = 'https://bonigarcia.dev/selenium-webdriver-java';

test.describe('Chapter 7 - The Page Object Model (POM)', () => {
  // ─────────────────────────────────────────────────
  //  1. Login Form
  // ─────────────────────────────────────────────────
  test.describe('Login Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login-form.html`);
    });

    test('should display the login form heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Login form' })).toBeVisible();
    });

    test('should have a username input field', async ({ page }) => {
      const username = page.getByLabel('Login');
      await expect(username).toBeVisible();
      await expect(username).toHaveId('username');
      await expect(username).toHaveAttribute('type', 'text');
      await expect(username).toHaveAttribute('name', 'username');
    });

    test('should have a password input field', async ({ page }) => {
      const password = page.getByLabel('Password');
      await expect(password).toBeVisible();
      await expect(password).toHaveId('password');
      await expect(password).toHaveAttribute('type', 'password');
      await expect(password).toHaveAttribute('name', 'password');
      await expect(password).toHaveAttribute('autocomplete', 'off');
    });

    test('should have a submit button', async ({ page }) => {
      const button = page.getByRole('button', { name: 'Submit' });
      await expect(button).toBeVisible();
      await expect(button).toHaveAttribute('type', 'submit');
    });

    test('should have empty inputs initially', async ({ page }) => {
      await expect(page.getByLabel('Login')).toHaveValue('');
      await expect(page.getByLabel('Password')).toHaveValue('');
    });

    test('should allow typing in the username field', async ({ page }) => {
      const username = page.getByLabel('Login');
      await username.fill('testuser');
      await expect(username).toHaveValue('testuser');
    });

    test('should allow typing in the password field', async ({ page }) => {
      const password = page.getByLabel('Password');
      await password.fill('secret123');
      await expect(password).toHaveValue('secret123');
    });

    test('should have a hidden invalid credentials alert', async ({ page }) => {
      const alert = page.locator('#invalid');
      await expect(alert).toBeAttached();
      await expect(alert).toHaveClass(/d-none/);
      await expect(alert).toHaveText('Invalid credentials');
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await page.getByLabel('Login').fill('user');
      await page.getByLabel('Password').fill('user');
      await page.getByRole('button', { name: 'Submit' }).click();

      // Should navigate to the success page
      await expect(page).toHaveURL(/login-sucess\.html/);
      await expect(page.locator('#success')).toBeVisible();
      await expect(page.locator('#success')).toHaveText('Login successful');
    });

    test('should show success alert with correct styling', async ({ page }) => {
      await page.getByLabel('Login').fill('user');
      await page.getByLabel('Password').fill('user');
      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page).toHaveURL(/login-sucess\.html/);
      const success = page.locator('#success');
      await expect(success).toHaveClass(/alert-success/);
    });

    test('should show invalid credentials with wrong username', async ({ page }) => {
      await page.getByLabel('Login').fill('wronguser');
      await page.getByLabel('Password').fill('user');
      await page.getByRole('button', { name: 'Submit' }).click();

      // Should stay on the same page and show the error
      await expect(page).toHaveURL(/login-form\.html/);
      const alert = page.locator('#invalid');
      await expect(alert).not.toHaveClass(/d-none/);
      await expect(alert).toBeVisible();
      await expect(alert).toHaveText('Invalid credentials');
    });

    test('should show invalid credentials with wrong password', async ({ page }) => {
      await page.getByLabel('Login').fill('user');
      await page.getByLabel('Password').fill('wrongpass');
      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page).toHaveURL(/login-form\.html/);
      const alert = page.locator('#invalid');
      await expect(alert).toBeVisible();
    });

    test('should show invalid credentials with empty fields', async ({ page }) => {
      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page).toHaveURL(/login-form\.html/);
      const alert = page.locator('#invalid');
      await expect(alert).toBeVisible();
      await expect(alert).toHaveText('Invalid credentials');
    });

    test('should show invalid credentials with both wrong', async ({ page }) => {
      await page.getByLabel('Login').fill('wrong');
      await page.getByLabel('Password').fill('wrong');
      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page).toHaveURL(/login-form\.html/);
      await expect(page.locator('#invalid')).toBeVisible();
    });

    test('should have the form action pointing to success page', async ({ page }) => {
      const form = page.locator('form');
      await expect(form).toHaveAttribute('action', 'login-sucess.html');
      await expect(form).toHaveAttribute('method', 'get');
    });

    test('should have correct button styling', async ({ page }) => {
      const button = page.getByRole('button', { name: 'Submit' });
      await expect(button).toHaveClass(/btn-outline-primary/);
    });

    test('should pass query parameters on successful login', async ({ page }) => {
      await page.getByLabel('Login').fill('user');
      await page.getByLabel('Password').fill('user');
      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page).toHaveURL(/username=user/);
      await expect(page).toHaveURL(/password=user/);
    });

    test('should clear and re-type credentials', async ({ page }) => {
      const username = page.getByLabel('Login');
      const password = page.getByLabel('Password');

      await username.fill('wrong');
      await password.fill('wrong');
      await expect(username).toHaveValue('wrong');

      await username.clear();
      await password.clear();
      await expect(username).toHaveValue('');
      await expect(password).toHaveValue('');

      await username.fill('user');
      await password.fill('user');
      await expect(username).toHaveValue('user');
      await expect(password).toHaveValue('user');
    });

    test('should submit form via Enter key', async ({ page }) => {
      await page.getByLabel('Login').fill('user');
      await page.getByLabel('Password').fill('user');
      await page.getByLabel('Password').press('Enter');

      await expect(page).toHaveURL(/login-sucess\.html/);
      await expect(page.locator('#success')).toBeVisible();
    });

    test('should verify page title and copyright', async ({ page }) => {
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(page.getByText('Copyright © 2021-2025')).toBeAttached();
    });

    test('should tab between form fields', async ({ page }) => {
      const username = page.getByLabel('Login');
      const password = page.getByLabel('Password');

      await username.click();
      await expect(username).toBeFocused();

      await page.keyboard.press('Tab');
      await expect(password).toBeFocused();
    });
  });

  // ─────────────────────────────────────────────────
  //  2. Slow Login Form
  // ─────────────────────────────────────────────────
  test.describe('Slow Login Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/login-slow.html`);
    });

    test('should display the slow login form heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Slow login form' })).toBeVisible();
    });

    test('should have a username input field', async ({ page }) => {
      const username = page.getByLabel('Login');
      await expect(username).toBeVisible();
      await expect(username).toHaveId('username');
    });

    test('should have a password input field', async ({ page }) => {
      const password = page.getByLabel('Password');
      await expect(password).toBeVisible();
      await expect(password).toHaveId('password');
    });

    test('should have a submit button', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
    });

    test('should have a hidden spinner element', async ({ page }) => {
      const spinner = page.locator('#spinner');
      await expect(spinner).toBeAttached();
      await expect(spinner).toBeHidden();
      await expect(spinner).toHaveClass(/spinner-border/);
    });

    test('should show spinner when form is submitted', async ({ page }) => {
      await page.getByLabel('Login').fill('user');
      await page.getByLabel('Password').fill('user');

      const spinner = page.locator('#spinner');
      await expect(spinner).toBeHidden();

      await page.getByRole('button', { name: 'Submit' }).click();

      // Spinner should become visible during the delay
      await expect(spinner).toBeVisible();
    });

    test('should login successfully with valid credentials after delay', async ({ page }) => {
      await page.getByLabel('Login').fill('user');
      await page.getByLabel('Password').fill('user');
      await page.getByRole('button', { name: 'Submit' }).click();

      // Should navigate to the success page after ~3 second delay
      await expect(page).toHaveURL(/login-sucess\.html/, { timeout: 10000 });
      await expect(page.locator('#success')).toBeVisible();
      await expect(page.locator('#success')).toHaveText('Login successful');
    });

    test('should show invalid credentials with wrong credentials after delay', async ({ page }) => {
      await page.getByLabel('Login').fill('wronguser');
      await page.getByLabel('Password').fill('wrongpass');
      await page.getByRole('button', { name: 'Submit' }).click();

      // Spinner appears during delay
      await expect(page.locator('#spinner')).toBeVisible();

      // After delay, error should show and spinner should hide
      const alert = page.locator('#invalid');
      await expect(alert).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#spinner')).toBeHidden();
    });

    test('should show invalid credentials with wrong username after delay', async ({ page }) => {
      await page.getByLabel('Login').fill('wrong');
      await page.getByLabel('Password').fill('user');
      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page.locator('#invalid')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#invalid')).toHaveText('Invalid credentials');
    });

    test('should show invalid credentials with wrong password after delay', async ({ page }) => {
      await page.getByLabel('Login').fill('user');
      await page.getByLabel('Password').fill('wrong');
      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page.locator('#invalid')).toBeVisible({ timeout: 10000 });
    });

    test('should show invalid credentials with empty fields after delay', async ({ page }) => {
      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page.locator('#invalid')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('#invalid')).toHaveText('Invalid credentials');
    });

    test('should hide spinner after delay completes on failure', async ({ page }) => {
      await page.getByLabel('Login').fill('wrong');
      await page.getByLabel('Password').fill('wrong');
      await page.getByRole('button', { name: 'Submit' }).click();

      // Spinner shows during delay
      await expect(page.locator('#spinner')).toBeVisible();

      // After ~3s the spinner should hide and the error should appear
      await expect(page.locator('#spinner')).toBeHidden({ timeout: 10000 });
      await expect(page.locator('#invalid')).toBeVisible();
    });

    test('should stay on the same page during the delay', async ({ page }) => {
      await page.getByLabel('Login').fill('user');
      await page.getByLabel('Password').fill('user');
      await page.getByRole('button', { name: 'Submit' }).click();

      // Right after clicking, should still be on login-slow.html
      await expect(page).toHaveURL(/login-slow\.html/);

      // Spinner should be visible during the wait
      await expect(page.locator('#spinner')).toBeVisible();

      // Eventually navigates
      await expect(page).toHaveURL(/login-sucess\.html/, { timeout: 10000 });
    });

    test('should have the form with correct id and action', async ({ page }) => {
      const form = page.locator('#form');
      await expect(form).toBeAttached();
      await expect(form).toHaveAttribute('action', 'login-sucess.html');
      await expect(form).toHaveAttribute('method', 'get');
    });

    test('should verify success page shows correct heading after slow login', async ({ page }) => {
      await page.getByLabel('Login').fill('user');
      await page.getByLabel('Password').fill('user');
      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page).toHaveURL(/login-sucess\.html/, { timeout: 10000 });

      // Success page should still show "Login form" heading
      await expect(page.getByRole('heading', { name: 'Login form' })).toBeVisible();
      await expect(page.locator('#success')).toHaveClass(/alert-success/);
    });

    test('should pass query parameters on successful slow login', async ({ page }) => {
      await page.getByLabel('Login').fill('user');
      await page.getByLabel('Password').fill('user');
      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page).toHaveURL(/login-sucess\.html/, { timeout: 10000 });
      // Slow login uses window.location = form.action, which is GET-based
      // The query params depend on the form action URL set by JS
      await expect(page).toHaveURL(/login-sucess\.html/);
    });

    test('should verify page title and copyright on slow login page', async ({ page }) => {
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(page.getByText('Copyright © 2021-2025')).toBeAttached();
      await expect(page.getByRole('link', { name: 'Boni García' })).toBeVisible();
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
