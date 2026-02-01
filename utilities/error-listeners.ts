import { Page } from '@playwright/test';

/**
 * Attaches a listener for console errors.
 * Pushes any error messages into the provided array.
 */
export function attachConsoleErrorListener(page: Page, errorMessages: string[]): void {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errorMessages.push(msg.text());
    }
  });
}

/**
 * Attaches a listener for uncaught JS errors (page errors).
 * Pushes any error messages into the provided array.
 */
export function attachPageErrorListener(page: Page, errorMessages: string[]): void {
  page.on('pageerror', (error) => {
    errorMessages.push(`${error.message} - ${error.stack}`);
  });
}

/**
 * Attaches a listener for failed network requests (4xx or 5xx).
 * Pushes any error messages into the provided array.
 */
export function attachRequestFailedListener(page: Page, errorMessages: string[]): void {
  page.on('requestfailed', (request) => {
    const errorText = request.failure()?.errorText ?? 'Unknown error';
    errorMessages.push(`Request Failed: ${request.url()} - ${errorText}`);
  });
}

/**
 * Attaches all three listeners and returns the shared errorMessages array.
 */
export function attachAllErrorListeners(page: Page): string[] {
  const errorMessages: string[] = [];

  attachConsoleErrorListener(page, errorMessages);
  attachPageErrorListener(page, errorMessages);
  attachRequestFailedListener(page, errorMessages);

  return errorMessages;
}
