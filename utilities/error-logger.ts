import { Page } from '@playwright/test';

/**
 * Logs console errors from the browser without failing the test
 *
 * @param page - The Playwright page instance
 *
 */
export async function logConsoleErrors(page: Page): Promise<void> {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[CONSOLE ERROR] ${msg.text()}`);
    }
  });
}

/**
 * Logs network errors (failed requests) without failing the test
 *
 * @param page - The Playwright page instance
 *
 */
export async function logNetworkErrors(page: Page): Promise<void> {
  page.on('requestfailed', request => {
    console.log(`[NETWORK ERROR] ${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });
}

/**
 * Logs uncaught page errors without failing the test
 *
 * @param page - The Playwright page instance
 *
 */
export async function logPageErrors(page: Page): Promise<void> {
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
  });
}
