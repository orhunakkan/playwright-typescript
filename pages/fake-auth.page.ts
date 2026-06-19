import { Page, Locator } from '@playwright/test';

export class FakeAuthPage {
  // ── Login — Inputs ────────────────────────────────────────────────────
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;

  // ── Login — Buttons ───────────────────────────────────────────────────
  readonly signInButton: Locator;

  // ── Login — Validation Messages ───────────────────────────────────────
  readonly loginErrorMessage: Locator;

  // ── Login — Form (used to assert we are on the login page) ────────────
  readonly loginForm: Locator;

  // ── Dashboard — Headings & Status ─────────────────────────────────────
  readonly dashboardHeading: Locator;
  // authenticatedStatus has no ARIA role or id — it is a CSS badge (<span>)
  readonly authenticatedStatus: Locator;
  readonly welcomeMessage: Locator;

  // ── Dashboard — Buttons ───────────────────────────────────────────────
  readonly signOutButton: Locator;

  constructor(page: Page) {
    // ── Login — Inputs ──────────────────────────────────────────────────
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');

    // ── Login — Buttons ─────────────────────────────────────────────────
    this.signInButton = page.getByRole('button', { name: 'Sign in' });

    // ── Login — Validation Messages ──────────────────────────────────────
    this.loginErrorMessage = page.getByRole('alert');

    // ── Login — Form ─────────────────────────────────────────────────────
    this.loginForm = page.getByRole('form', { name: 'Login form' });

    // ── Dashboard — Headings & Status ────────────────────────────────────
    this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
    this.authenticatedStatus = page.getByText('Authenticated', { exact: true });
    this.welcomeMessage = page.getByText(/Welcome back,/);

    // ── Dashboard — Buttons ──────────────────────────────────────────────
    this.signOutButton = page.getByRole('button', { name: 'Sign out' });
  }
}
