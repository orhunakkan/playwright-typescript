import { Page, expect } from '@playwright/test';

/**
 * Navigate to the registration page
 */
export async function goto(page: Page, baseUrl: string): Promise<void> {
  await page.goto(`${baseUrl}/register`);
}

/**
 * Fill the registration form with user data
 */
export async function fillRegistrationForm(page: Page, name: string, email: string, password: string): Promise<void> {
  await page.getByTestId('register-name').fill(name);
  await page.getByTestId('register-email').fill(email);
  await page.getByTestId('register-password').fill(password);
}

/**
 * Submit the registration form
 */
export async function submitRegistration(page: Page): Promise<void> {
  await page.getByTestId('register-submit').click();
}

/**
 * Register a new user (combines form filling and submission)
 */
export async function register(page: Page, name: string, email: string, password: string): Promise<void> {
  await fillRegistrationForm(page, name, email, password);
  await submitRegistration(page);
}

/**
 * Verify success message appears after registration
 */
export async function expectSuccessMessage(page: Page): Promise<void> {
  await expect(page.getByTestId('register-success')).toBeVisible();
  await expect(page.getByTestId('register-success')).toContainText('Registration successful');
}

/**
 * Verify error message appears with specified text
 */
export async function expectErrorMessage(page: Page, errorText: string): Promise<void> {
  await expect(page.getByTestId('register-error')).toBeVisible();
  await expect(page.getByTestId('register-error')).toContainText(errorText);
}

/**
 * Navigate from registration page to login page
 */
export async function navigateToLogin(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Login' }).click();
}

/**
 * Verify registration page styling
 */
export async function checkPageStyling(page: Page): Promise<void> {
  await expect(page.getByTestId('register-submit')).toHaveCSS('background-color', 'rgb(59, 130, 246)');
  await expect(page.getByTestId('register-page')).toHaveCSS('border-radius', '8px');
}

/**
 * Verify we are on the registration page
 */
export async function verifyOnRegisterPage(page: Page, baseUrl: string): Promise<void> {
  await expect(page.url()).toBe(`${baseUrl}/register`);
  await expect(page.getByTestId('register-page')).toBeVisible();
  await expect(page.getByTestId('register-title')).toHaveText('Register');
}
