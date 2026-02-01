import { Page, Locator, expect } from '@playwright/test';

/**
 * Switches to a newly opened tab after clicking a button,
 * waits for the page to load, verifies a success message,
 * and checks if the URL contains an expected substring.
 *
 * @param page The current Playwright page instance
 * @param button The button locator that triggers the new tab
 */
export async function validateLinkNewTab(page: Page, button: Locator) {
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
  // Accept cookies if banner is present
  try {
    await page.getByRole('button', { name: 'Accept All Cookies' }).click({ timeout: 2000 });
    await expect(page.getByRole('button', { name: 'Accept All Cookies' })).toBeHidden({ timeout: 2000 });
  } catch {
    // Ignore if not present
  }
  const [dedicatedPage] = await Promise.all([page.waitForEvent('popup', { timeout: 10000 }), button.click()]);
  await dedicatedPage.waitForLoadState('domcontentloaded');
  await expect(dedicatedPage.getByRole('heading', { name: 'Success!' })).toBeVisible({ timeout: 10000 });
  await expect(dedicatedPage.url()).toContain('dedicated-page');
}

/**
 * Stays in the same tab after clicking a button,
 * verifies a success message, and checks the URL.
 *
 * @param page The current Playwright page instance
 * @param button The button locator that opens the link in the current page
 */
export async function validateLinkCurrentTab(page: Page, button: Locator) {
  await button.click();
  const successMessage = page.getByRole('heading', { name: 'Success!' });
  await expect(successMessage).toBeVisible({ timeout: 10000 });
  await expect(page.url()).toContain('dedicated-page');
}
