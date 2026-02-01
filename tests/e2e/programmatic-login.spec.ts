import { expect, test } from '@playwright/test';
import { programmaticLogin } from '../../utilities/login';

const APP_BASE_URL = process.env.LOCAL_APP_BASE_URL ?? 'http://localhost:3000';

test.describe('Programmatic login', () => {
  test.beforeEach(async ({ context, request, page }) => {
    await programmaticLogin(context, request, { appBaseUrl: APP_BASE_URL });
  });

  test('shows logged in user', async ({ page }) => {
    await page.goto(`${APP_BASE_URL}/dashboard`);
    await expect(page.getByText('Welcome, testuser!')).toBeVisible();
  });

  test('can access protected dashboard page', async ({ page }) => {
    await page.goto(`${APP_BASE_URL}/dashboard`);
    await expect(page).not.toHaveTitle('Not Logged In');
    await expect(page.getByRole('heading')).toContainText('Dashboard');
  });

  test('can access admin panel when logged in', async ({ page }) => {
    await page.goto(`${APP_BASE_URL}/admin`);
    await expect(page).not.toHaveTitle('Not Logged In');
  });

  test('api/me returns authenticated user info', async ({ request }) => {
    const response = await request.get(`${APP_BASE_URL}/api/me`);
    expect(response.status()).toBe(200);
    const user = await response.json();
    expect(user).toHaveProperty('username');
    expect(user.username).toBe('testuser');
  });

  test('home page shows logged in status', async ({ page }) => {
    await page.goto(`${APP_BASE_URL}/`);
    await expect(page.getByText(/logged in/i)).toBeVisible();
  });

  test('dashboard redirects to home on logout', async ({ page }) => {
    await page.goto(`${APP_BASE_URL}/dashboard`);
    const logoutLink = page.getByRole('link', { name: /logout|sign out/i });
    if (await logoutLink.isVisible()) {
      await logoutLink.click();
      await expect(page).toHaveURL(/\//);
      await expect(page.getByText('Not logged in')).toBeVisible();
    }
  });

  test('accessing nonexistent route shows 404', async ({ page }) => {
    await page.goto(`${APP_BASE_URL}/invalid-route-xyz`);
    await expect(page.getByRole('heading', { name: '404 - Page Not Found' })).toBeVisible();
  });

  test('protected routes reject after logout', async ({ page }) => {
    // Logout via endpoint
    await page.goto(`${APP_BASE_URL}/auth/logout`);

    // Try to access protected page
    await page.goto(`${APP_BASE_URL}/dashboard`);
    await expect(page.getByRole('heading', { name: 'YOU ARE NOT LOGGED IN!' })).toBeVisible();
  });

  test('api response validates user properties', async ({ request }) => {
    const response = await request.get(`${APP_BASE_URL}/api/me`);
    const user = await response.json();

    // Verify required fields exist and have correct types
    expect(user.username).toBe('testuser');
    expect(typeof user.username).toBe('string');
    expect(user).toHaveProperty('username');
  });
});
