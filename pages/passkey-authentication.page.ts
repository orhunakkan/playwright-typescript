import { Page, Locator, CDPSession } from '@playwright/test';

export class PasskeyAuthenticationPage {
  private readonly page: Page;

  // ── Registration — Headings & Status ────────────────────────────────────
  readonly registrationHeading: Locator;
  readonly noPasskeyMessage: Locator;

  // ── Registration — Buttons ───────────────────────────────────────────────
  readonly registerButton: Locator;
  readonly signInButton: Locator;

  // ── Registration — Validation Messages ───────────────────────────────────
  // Shared by both the registration and sign-in ceremonies (same role="alert"
  // element/position); text differs — "Passkey registration failed..." vs.
  // "Passkey sign-in failed..." — both suffixed "Make sure a virtual
  // authenticator is attached." even when the real cause is a misconfigured
  // authenticator (e.g. missing hasResidentKey/hasUserVerification), not a
  // missing one.
  readonly ceremonyErrorAlert: Locator;

  // ── Dashboard — Headings & Status ────────────────────────────────────────
  readonly dashboardHeading: Locator;
  readonly passkeyVerifiedBadge: Locator;
  readonly welcomeMessage: Locator;

  // ── Dashboard — Data ──────────────────────────────────────────────────────
  // usernameValue/userIdValue are <dd> siblings of a <dt> label with no ARIA
  // role/id relationship — the dt/dl structure is the only semantic anchor.
  readonly usernameValue: Locator;
  readonly userIdValue: Locator;

  // ── Dashboard — Buttons ───────────────────────────────────────────────────
  readonly signOutButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // ── Registration — Headings & Status ─────────────────────────────────
    this.registrationHeading = page.getByRole('heading', { name: /^Passkey for/ });
    this.noPasskeyMessage = page.getByText('No passkey registered yet.');

    // ── Registration — Buttons ────────────────────────────────────────────
    this.registerButton = page.getByRole('button', { name: 'Register passkey' });
    this.signInButton = page.getByRole('button', { name: 'Sign in with passkey' });

    // ── Registration — Validation Messages ────────────────────────────────
    this.ceremonyErrorAlert = page.getByRole('alert');

    // ── Dashboard — Headings & Status ─────────────────────────────────────
    this.dashboardHeading = page.getByRole('heading', { name: 'Dashboard' });
    this.passkeyVerifiedBadge = page.getByText('Passkey verified', { exact: true });
    this.welcomeMessage = page.getByText(/Welcome back,/);

    // ── Dashboard — Data ────────────────────────────────────────────────────
    this.usernameValue = page.locator('dt', { hasText: 'Username' }).locator('xpath=following-sibling::dd[1]');
    this.userIdValue = page.locator('dt', { hasText: 'User ID' }).locator('xpath=following-sibling::dd[1]');

    // ── Dashboard — Buttons ────────────────────────────────────────────────
    this.signOutButton = page.getByRole('button', { name: 'Sign out' });
  }

  // Attaches a CDP-backed virtual WebAuthn authenticator to the test's page/context (AC-1). Each
  // Playwright test runs in its own browser context, so one authenticator per test is safe even
  // though Chrome only allows one "internal" authenticator per environment. Defaults to a fully
  // spec-compliant authenticator (hasResidentKey + hasUserVerification); pass overrides to
  // reproduce the app's ceremony-failure state for negative cases. Chromium-only (CDP).
  async addVirtualAuthenticator(
    options: { hasResidentKey?: boolean; hasUserVerification?: boolean } = {},
  ): Promise<{ client: CDPSession; authenticatorId: string }> {
    const client = await this.page.context().newCDPSession(this.page);
    await client.send('WebAuthn.enable');
    const { authenticatorId } = await client.send('WebAuthn.addVirtualAuthenticator', {
      options: {
        protocol: 'ctap2',
        transport: 'internal',
        hasResidentKey: options.hasResidentKey ?? true,
        hasUserVerification: options.hasUserVerification ?? true,
        isUserVerified: true,
      },
    });
    return { client, authenticatorId };
  }
}
