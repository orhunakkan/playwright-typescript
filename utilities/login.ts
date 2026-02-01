import { APIRequestContext, APIResponse, BrowserContext } from '@playwright/test';

const DEFAULT_APP_BASE_URL = process.env.LOCAL_APP_BASE_URL ?? 'http://localhost:3000';
const DEFAULT_USERNAME = 'testuser';
const DEFAULT_PASSWORD = '4284';

export type LoginOptions = {
  appBaseUrl?: string;
  username?: string;
  password?: string;
};

/**
 * Runs the local Keycloak login flow without UI and hydrates the Playwright browser context with the resulting session cookies.
 */
export async function programmaticLogin(context: BrowserContext, request: APIRequestContext, options: LoginOptions = {}): Promise<void> {
  // Extract and use provided options or fall back to defaults
  const appBaseUrl = options.appBaseUrl ?? DEFAULT_APP_BASE_URL;
  const username = options.username ?? DEFAULT_USERNAME;
  const password = options.password ?? DEFAULT_PASSWORD;

  // Step 1: Hit /auth/login to initiate the auth flow and get redirected to Keycloak
  const loginStart = await request.get(`${appBaseUrl}/auth/login`);
  if (loginStart.status() >= 400) {
    const snippet = await safeSnippet(loginStart);
    throw new Error(`Auth login failed (${loginStart.status()}): ${snippet}`);
  }
  const keycloakLoginUrl = loginStart.url();

  // Step 2: Fetch the Keycloak login page HTML to extract the login form
  const keycloakLoginPage = loginStart;
  const loginHtml = await keycloakLoginPage.text();

  // Step 3: Parse form action URL and hidden fields from the Keycloak login page
  const formAction = resolveFormAction(loginHtml, keycloakLoginUrl);
  const hiddenFields = readHiddenFields(loginHtml);

  // Step 4: Build form parameters with pre-filled hidden fields, username, password, and credentialId
  const formParams = new URLSearchParams();
  Object.entries(hiddenFields).forEach(([key, value]) => formParams.set(key, value));
  formParams.set('username', username);
  formParams.set('password', password);
  if (!formParams.has('credentialId')) {
    formParams.set('credentialId', '');
  }

  // Step 5: POST the login form to Keycloak with credentials
  const loginResponse = await request.fetch(formAction, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: formParams.toString(),
  });

  if (loginResponse.status() >= 400) {
    throw new Error(`Keycloak login failed with status ${loginResponse.status()}.`);
  }

  // Step 6: Validate the session by calling /api/me to ensure authentication succeeded
  const meResponse = await request.get(`${appBaseUrl}/api/me`);
  if (meResponse.status() >= 400) {
    throw new Error('Unable to confirm authenticated session via /api/me.');
  }

  // Step 7: Extract all cookies (including connect.sid) from the request context
  const storageState = await request.storageState();
  const hasConnectSid = storageState.cookies.some((cookie) => cookie.name === 'connect.sid');
  if (!hasConnectSid) {
    throw new Error('connect.sid cookie not found after login flow.');
  }

  // Step 8: Add all cookies to the browser context so subsequent page navigations are authenticated
  await context.addCookies(storageState.cookies);
}

/**
 * Extracts the form action URL from the Keycloak login page HTML.
 * If the action is relative, resolves it against the Keycloak login page URL.
 */
function resolveFormAction(html: string, fallbackUrl: string): string {
  // Parse the form HTML to find the action attribute
  const match = html.match(/<form[^>]*action="([^"]+)"/i);
  if (!match) {
    throw new Error('Unable to find Keycloak login form action.');
  }
  const action = match[1];
  // If action is relative, convert to absolute URL using the Keycloak page URL
  return action.startsWith('http') ? action : new URL(action, fallbackUrl).toString();
}

/**
 * Extracts all hidden form fields from the Keycloak login page HTML.
 * These fields are needed to maintain CSRF protection and auth state during form submission.
 */
function readHiddenFields(html: string): Record<string, string> {
  const hiddenFields: Record<string, string> = {};
  // Use regex to find all <input type="hidden" name="X" value="Y" /> elements
  const regex = /<input[^>]*type="hidden"[^>]*name="([^"]+)"[^>]*value="([^"]*)"/gi;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    hiddenFields[match[1]] = match[2];
  }
  return hiddenFields;
}

/**
 * Safely extracts a small text snippet from a response for error logging.
 * Useful for debugging when responses contain HTML or other large payloads.
 */
async function safeSnippet(response: APIResponse): Promise<string> {
  try {
    // Extract first 200 chars and collapse whitespace for readability
    const text = await response.text();
    return text.slice(0, 200).replace(/\s+/g, ' ');
  } catch {
    // If response body cannot be read, return placeholder
    return '<no-body>';
  }
}
