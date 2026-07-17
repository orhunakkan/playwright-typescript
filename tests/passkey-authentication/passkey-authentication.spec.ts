import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-60 — Passkey Authentication

const URL = '/practice/passkey-authentication';
const DASHBOARD_URL = '/practice/passkey-authentication/dashboard';

const CHROMIUM_ONLY_REASON =
  'WebAuthn ceremony setup needs a CDP virtual authenticator — newCDPSession/WebAuthn domain are Chromium-only ' +
  '(verified: throws on Firefox/WebKit, same limitation documented in tests/touch-gestures/touch-gestures.spec.ts).';

test.describe('Passkey Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // AC-1 (TAB1-60): Tests attach a CDP virtual authenticator via `page.context().newCDPSession(page)`
  // and `WebAuthn.addVirtualAuthenticator({ hasResidentKey: true, hasUserVerification: true, ... })`
  // before clicking "Register passkey"
  test.describe('AC-1 — CDP virtual authenticator setup precedes registration', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', CHROMIUM_ONLY_REASON);

    test('positive: registration succeeds once a fully-configured virtual authenticator is attached', async ({ page, passkeyAuthenticationPage }) => {
      await passkeyAuthenticationPage.addVirtualAuthenticator();
      await passkeyAuthenticationPage.registerButton.click();
      await expect(passkeyAuthenticationPage.ceremonyErrorAlert).toBeHidden();
      await expect(passkeyAuthenticationPage.noPasskeyMessage).toBeHidden();
    });

    // Reproduces the app's real ceremony-failure state deterministically: an authenticator
    // missing hasResidentKey/hasUserVerification (rather than "no authenticator at all", which
    // hangs indefinitely waiting on a native prompt that never resolves headlessly).
    test('negative: an authenticator missing hasResidentKey/hasUserVerification fails the ceremony', async ({ page, passkeyAuthenticationPage }) => {
      await passkeyAuthenticationPage.addVirtualAuthenticator({ hasResidentKey: false, hasUserVerification: false });
      await passkeyAuthenticationPage.registerButton.click();
      await expect(passkeyAuthenticationPage.ceremonyErrorAlert).toBeVisible();
      await expect(passkeyAuthenticationPage.ceremonyErrorAlert).toHaveText(
        'Passkey registration failed. Make sure a virtual authenticator is attached.',
      );
    });
  });

  // AC-2 (TAB1-60): Tests register a passkey and assert the browser navigates to the dashboard
  // showing the registered user's name
  test.describe('AC-2 — registration and sign-in reach the dashboard with the registered user', () => {
    test('positive: register then sign in navigates to dashboard showing Alice Chen', async ({ page, passkeyAuthenticationPage, browserName }) => {
      test.skip(browserName !== 'chromium', CHROMIUM_ONLY_REASON);
      await passkeyAuthenticationPage.addVirtualAuthenticator();
      await passkeyAuthenticationPage.registerButton.click();
      await expect(passkeyAuthenticationPage.ceremonyErrorAlert).toBeHidden();
      await passkeyAuthenticationPage.signInButton.click();
      await expect(page).toHaveURL(/\/practice\/passkey-authentication\/dashboard$/);
      await expect(passkeyAuthenticationPage.dashboardHeading).toBeVisible();
      await expect(passkeyAuthenticationPage.welcomeMessage).toContainText('Alice Chen');
      await expect(passkeyAuthenticationPage.usernameValue).toHaveText('alice');
    });

    test('negative: dashboard is not visible before the registration ceremony completes', async ({ passkeyAuthenticationPage }) => {
      await expect(passkeyAuthenticationPage.dashboardHeading).toBeHidden();
      await expect(passkeyAuthenticationPage.welcomeMessage).toBeHidden();
    });
  });

  // AC-3 (TAB1-60): Tests sign out and assert the app returns to the registration screen
  test.describe('AC-3 — sign out returns to the registration screen', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', CHROMIUM_ONLY_REASON);

    test('positive: signing out from the dashboard returns to the registration screen', async ({ page, passkeyAuthenticationPage }) => {
      await passkeyAuthenticationPage.addVirtualAuthenticator();
      await passkeyAuthenticationPage.registerButton.click();
      await passkeyAuthenticationPage.signInButton.click();
      await expect(page).toHaveURL(/\/practice\/passkey-authentication\/dashboard$/);
      await passkeyAuthenticationPage.signOutButton.click();
      await expect(page).toHaveURL(/\/practice\/passkey-authentication$/);
      await expect(passkeyAuthenticationPage.registrationHeading).toBeVisible();
    });

    test('negative: reloading after sign out does not restore the dashboard', async ({ page, passkeyAuthenticationPage }) => {
      await passkeyAuthenticationPage.addVirtualAuthenticator();
      await passkeyAuthenticationPage.registerButton.click();
      await passkeyAuthenticationPage.signInButton.click();
      await expect(page).toHaveURL(/\/practice\/passkey-authentication\/dashboard$/);
      await passkeyAuthenticationPage.signOutButton.click();
      await expect(page).toHaveURL(/\/practice\/passkey-authentication$/);
      await page.reload();
      await expect(page).toHaveURL(/\/practice\/passkey-authentication$/);
      await expect(passkeyAuthenticationPage.dashboardHeading).toBeHidden();
    });
  });

  // AC-4 (TAB1-60): Tests navigate directly to the dashboard URL without an active session and
  // assert the unauthenticated guard behavior
  // No CDP/authenticator needed — runs cross-browser.
  test.describe('AC-4 — unauthenticated direct navigation to the dashboard is guarded', () => {
    test('positive: navigating to the dashboard URL without a session redirects to the registration screen', async ({
      page,
      passkeyAuthenticationPage,
    }) => {
      await page.goto(DASHBOARD_URL);
      await expect(page).toHaveURL(/\/practice\/passkey-authentication$/);
      await expect(passkeyAuthenticationPage.registrationHeading).toBeVisible();
    });

    test('negative: dashboard content is not exposed after the guard redirect', async ({ page, passkeyAuthenticationPage }) => {
      await page.goto(DASHBOARD_URL);
      await expect(passkeyAuthenticationPage.dashboardHeading).toBeHidden();
      await expect(passkeyAuthenticationPage.signOutButton).toBeHidden();
    });
  });

  // AC-5 (TAB1-60): Tests assert on the CDP `WebAuthn.credentialAdded` event firing after a
  // successful `navigator.credentials.create()` call
  test.describe('AC-5 — CDP WebAuthn.credentialAdded event fires on successful registration', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', CHROMIUM_ONLY_REASON);

    test('positive: credentialAdded fires with the registered credential after registration', async ({ page, passkeyAuthenticationPage }) => {
      const { client } = await passkeyAuthenticationPage.addVirtualAuthenticator();
      const credentialAdded = new Promise<{ credential: { rpId?: string; userName?: string } }>((resolve) => {
        client.on('WebAuthn.credentialAdded', resolve);
      });
      await passkeyAuthenticationPage.registerButton.click();
      const event = await credentialAdded;
      expect(event.credential.rpId).toBe('stagecraftlabs.com');
      expect(event.credential.userName).toBe('alice');
    });

    test('negative: credentialAdded does not fire when the ceremony fails', async ({ page, passkeyAuthenticationPage }) => {
      const { client } = await passkeyAuthenticationPage.addVirtualAuthenticator({ hasResidentKey: false, hasUserVerification: false });
      const events: unknown[] = [];
      client.on('WebAuthn.credentialAdded', (event) => events.push(event));
      await passkeyAuthenticationPage.registerButton.click();
      await expect(passkeyAuthenticationPage.ceremonyErrorAlert).toBeVisible();
      expect(events).toHaveLength(0);
    });
  });

  // AC-6 (TAB1-60): Tests document why this ceremony requires no plaintext password, contrasting
  // it with the Fake Auth lab's username/password fixture.
  //
  // Unlike the Fake Auth lab (tests/fake-auth/fake-auth.spec.ts AC-1/AC-2), which submits a
  // plaintext username/password pair to the server on every sign-in, a passkey ceremony never
  // transmits a shared secret. `navigator.credentials.create()` generates an asymmetric keypair
  // inside the authenticator; the private key never leaves it. Only a public key (at
  // registration) and a signed, origin-bound assertion (at sign-in) cross the wire — there is no
  // plaintext credential to guess, brute-force, phish, or intercept in transit or at rest. Those
  // security properties come from asymmetric cryptography plus the browser's strict RP-ID/origin
  // binding — the same binding whose misconfiguration (a hardcoded `rpId: "localhost"`) caused
  // every registration to fail with `SecurityError` in production until it was fixed (TAB1-65).
  // This AC has no runtime assertion; it is satisfied by this documentation.

  // Accessibility — scan load + error + dashboard states (Phase 5)
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on registration screen load', async ({ page }) => {
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations while the ceremony error alert is displayed', async ({ page, passkeyAuthenticationPage, browserName }) => {
      test.skip(browserName !== 'chromium', CHROMIUM_ONLY_REASON);
      await passkeyAuthenticationPage.addVirtualAuthenticator({ hasResidentKey: false, hasUserVerification: false });
      await passkeyAuthenticationPage.registerButton.click();
      await expect(passkeyAuthenticationPage.ceremonyErrorAlert).toBeVisible();
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations on the dashboard (authenticated state)', async ({ page, passkeyAuthenticationPage, browserName }) => {
      test.skip(browserName !== 'chromium', CHROMIUM_ONLY_REASON);
      await passkeyAuthenticationPage.addVirtualAuthenticator();
      await passkeyAuthenticationPage.registerButton.click();
      await passkeyAuthenticationPage.signInButton.click();
      await expect(page).toHaveURL(/\/practice\/passkey-authentication\/dashboard$/);
      expect((await scanWcag(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach
// warm load. No CDP/authenticator needed — runs cross-browser.
test.describe('performance @performance', () => {
  test('initial registration screen load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
