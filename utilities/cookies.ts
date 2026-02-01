import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BrowserContext, Cookie } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reads accepted cookies from accept-cookies.json and sets them in the browser context
 * before any page navigation.
 *
 * Call this function before any page.goto() in your test.
 *
 * @param context Playwright BrowserContext
 */
export async function acceptCookiesBeforeSession(context: BrowserContext): Promise<void> {
  const cookiesFile = 'accept-cookies.json';
  const resolvedPath = path.resolve(__dirname, '../fixtures/cookies', cookiesFile);
  const cookiesRaw = fs.readFileSync(resolvedPath, 'utf-8');
  const cookies = JSON.parse(cookiesRaw);

  const formattedCookies: Cookie[] = cookies.map((cookie: Partial<Cookie>) => ({
    ...cookie,
    expires: typeof cookie.expires === 'number' ? cookie.expires : -1,
    sameSite: cookie.sameSite === 'None' || cookie.sameSite === 'Lax' || cookie.sameSite === 'Strict' ? cookie.sameSite : 'Lax',
  }));

  await context.addCookies(formattedCookies);
}

/**
 * Reads rejected cookies from reject-cookies.json and sets them in the browser context
 * before any page navigation.
 *
 * Call this function before any page.goto() in your test.
 *
 * @param context Playwright BrowserContext
 */
export async function rejectCookiesBeforeSession(context: BrowserContext): Promise<void> {
  const cookiesFile = 'reject-cookies.json';
  const resolvedPath = path.resolve(__dirname, '../fixtures/cookies', cookiesFile);
  const cookiesRaw = fs.readFileSync(resolvedPath, 'utf-8');
  const cookies = JSON.parse(cookiesRaw);

  const formattedCookies: Cookie[] = cookies.map((cookie: Partial<Cookie>) => ({
    ...cookie,
    expires: typeof cookie.expires === 'number' ? cookie.expires : -1,
    sameSite: cookie.sameSite === 'None' || cookie.sameSite === 'Lax' || cookie.sameSite === 'Strict' ? cookie.sameSite : 'Lax',
  }));

  await context.addCookies(formattedCookies);
}
