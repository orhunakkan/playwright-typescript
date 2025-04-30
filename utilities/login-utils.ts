import { Page, expect } from '@playwright/test';

/**
 * Navigate to the login page
 */
export async function goto(page: Page, baseUrl: string): Promise<void> {
  await page.goto(`${baseUrl}/login`);
}

/**
 * Fill the login form with user credentials
 */
export async function fillLoginForm(page: Page, email: string, password: string): Promise<void> {
  await page.getByTestId('login-email').fill(email);
  await page.getByTestId('login-password').fill(password);
}

/**
 * Submit the login form
 */
export async function submitLogin(page: Page): Promise<void> {
  await page.getByTestId('login-submit').click();
}

/**
 * Log in a user (combines form filling and submission)
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await fillLoginForm(page, email, password);
  await submitLogin(page);
}

/**
 * Verify error message appears with specified text
 */
export async function expectErrorMessage(page: Page, errorText: string): Promise<void> {
  await expect(page.getByTestId('login-error')).toBeVisible();
  await expect(page.getByTestId('login-error')).toContainText(errorText);
}

/**
 * Navigate from login page to registration page
 */
export async function navigateToRegister(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Register' }).click();
}

/**
 * Navigate to forgot password page
 */
export async function navigateToForgotPassword(page: Page): Promise<void> {
  await page.getByTestId('forgot-password-link').click();
}

/**
 * Verify login page styling
 */
export async function checkPageStyling(page: Page): Promise<void> {
  await expect(page.getByTestId('login-submit')).toHaveCSS('background-color', 'rgb(59, 130, 246)');
  await expect(page.getByTestId('login-page')).toHaveCSS('border-radius', '8px');
}

/**
 * Verify we are on the login page
 */
export async function verifyOnLoginPage(page: Page, baseUrl: string): Promise<void> {
  await expect(page.url()).toBe(`${baseUrl}/login`);
  await expect(page.getByTestId('login-page')).toBeVisible();
  await expect(page.getByTestId('login-title')).toHaveText('Login');
}

/**
 * Verify successful login (redirected to dashboard)
 */
export async function verifySuccessfulLogin(page: Page, baseUrl: string): Promise<void> {
  await page.waitForURL(`${baseUrl}/dashboard`);
  await expect(page.getByTestId('dashboard-page')).toBeVisible();
}
