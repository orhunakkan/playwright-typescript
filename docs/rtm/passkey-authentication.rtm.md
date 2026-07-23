# Requirements Traceability Matrix — Passkey Authentication

| Field      | Value                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------- |
| JIRA Story | [TAB1-60](https://orhunakkan.atlassian.net/browse/TAB1-60)                                         |
| Lab URL    | https://stagecraftlabs.com/practice/passkey-authentication                                         |
| Spec file  | tests/passkey-authentication/passkey-authentication.spec.ts                                        |
| POM file   | pages/passkey-authentication.page.ts                                                               |
| Last run   | 2026-07-16 — 38 / 38 passed, 18 skipped (Chrome · Firefox · Edge · Safari) — local run, pending CI |
| Generated  | 2026-07-16                                                                                         |

---

## Coverage by Acceptance Criterion

| Req     | Acceptance Criterion                                                                                   | Test Case                                                                                        | Type | Result                              |
| ------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ---- | ----------------------------------- |
| AC-1    | Attach a CDP virtual authenticator before clicking "Register passkey" (Chromium-only — see note below) | positive: registration succeeds once a fully-configured virtual authenticator is attached        | P    | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| AC-1a   | Authenticator misconfiguration (missing hasResidentKey/hasUserVerification) fails the ceremony         | negative: an authenticator missing hasResidentKey/hasUserVerification fails the ceremony         | N    | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| AC-2    | Register then sign in navigates to the dashboard showing the registered user's name (Chromium-only)    | positive: register then sign in navigates to dashboard showing Alice Chen                        | P    | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| AC-2a   | Dashboard/user name not visible before the registration ceremony completes                             | negative: dashboard is not visible before the registration ceremony completes                    | N    | ✅ (all 4 browsers)                 |
| AC-3    | Sign out returns to the registration screen (Chromium-only)                                            | positive: signing out from the dashboard returns to the registration screen                      | P    | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| AC-3a   | Reload after sign-out does not restore the dashboard                                                   | negative: reloading after sign out does not restore the dashboard                                | N    | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| AC-4    | Direct navigation to the dashboard URL without a session is guarded                                    | positive: navigating to the dashboard URL without a session redirects to the registration screen | P    | ✅ (all 4 browsers)                 |
| AC-4a   | No dashboard content exposed after the guard redirect                                                  | negative: dashboard content is not exposed after the guard redirect                              | N    | ✅ (all 4 browsers)                 |
| AC-5    | CDP `WebAuthn.credentialAdded` fires after a successful registration (Chromium-only)                   | positive: credentialAdded fires with the registered credential after registration                | P    | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| AC-5a   | `credentialAdded` does not fire when the ceremony fails                                                | negative: credentialAdded does not fire when the ceremony fails                                  | N    | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| AC-6    | Documents why the passkey ceremony needs no plaintext password, vs. Fake Auth's fixture                | doc-only comment block above the accessibility describe (no runtime assertion)                   | Doc  | ✅ (present in spec)                |
| AXE     | The page must have no critical/serious axe-core violations in every rendered state                     | no violations on registration screen load                                                        | A11y | ✅ (all 4 browsers)                 |
| AXE     |                                                                                                        | no violations while the ceremony error alert is displayed                                        | A11y | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| AXE     |                                                                                                        | no violations on the dashboard (authenticated state)                                             | A11y | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| REQ-NF1 | The page must meet its performance budget (load + key interaction)                                     | initial registration screen load is within budget                                                | Perf | ✅ (all 4 browsers)                 |

**Note on Chromium-only scope (AC-1/AC-1a/AC-2/AC-3/AC-3a/AC-5/AC-5a + error/dashboard-state a11y):**
`context.newCDPSession()` and the CDP `WebAuthn` domain (used to attach the virtual authenticator
required by AC-1) are Chromium-only — Firefox (Gecko) and WebKit (Safari) do not implement the
Chrome DevTools Protocol (verified: throws on Firefox/WebKit). These tests are intentionally
scoped to Desktop Chrome + Desktop Edge via `test.skip(({ browserName }) => browserName !== 'chromium', ...)`,
the same pattern already used in `tests/touch-gestures/touch-gestures.spec.ts`. AC-2a, AC-4, AC-4a,
the initial-load a11y scan, and the performance budget need no authenticator and run on all 4
browsers.

---

## Defects

| ID      | Type  | Summary                                                                                                                                                                                                                                              | Severity | Found by                                                                    | JIRA                                                       | Status                                                                                                                          |
| ------- | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| TAB1-65 | Logic | `/api/passkey/register/challenge` returned hardcoded `rpId: "localhost"` instead of the live host, causing every `navigator.credentials.create()` call to fail with `SecurityError` on `stagecraftlabs.com` — blocked all registration-dependent ACs | High     | Manual reproduction during locator-mapping (Step 3), before spec generation | [TAB1-65](https://orhunakkan.atlassian.net/browse/TAB1-65) | ✅ Fixed & closed — verified live (rpId now resolves to `stagecraftlabs.com`, full ceremony completes, `credentialAdded` fires) |

---

## Traceability Summary

- **ACs covered:** 6 / 6 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5 · AC-6) + 5 derived negative/boundary sub-requirements (AC-1a · AC-2a · AC-3a · AC-4a · AC-5a) — AC-1/AC-1a/AC-2/AC-3/AC-3a/AC-5/AC-5a verified on Chromium engines (Desktop Chrome, Desktop Edge); Firefox/Safari intentionally skipped per a verified Playwright/CDP limitation (see note above). AC-6 is a documentation-only requirement satisfied by an in-spec comment block, not a runtime assertion.
- **Non-functional covered:** 4 / 4 (AXE load state · AXE error state · AXE dashboard state · performance budget)
- **Test cases:** 14 tests defined; 56 executions across 4 browsers (38 passed, 18 skipped, 0 failed) — skips are the documented Chromium-only scope, not gaps.
- **Every POM element asserted by ≥1 case:** ✅ (`registerButton`/`signInButton`/`ceremonyErrorAlert`/`noPasskeyMessage` in AC-1/AC-1a, `dashboardHeading`/`welcomeMessage`/`usernameValue`/`registrationHeading` in AC-2/AC-2a, `signOutButton` in AC-3/AC-3a, `passkeyVerifiedBadge`/`userIdValue` in the dashboard a11y scan)
- **Real defect found and fixed during this run:** TAB1-65 — a genuine production WebAuthn RP-ID misconfiguration that broke passkey registration for every real user on `stagecraftlabs.com`, found during locator-mapping (before any test code was written), filed, fixed upstream, deployed, and verified live before spec generation resumed.
- **Open defects:** 0
- **Exit criteria met:** ✅ — all P1+P2 requirements covered, 0 non-flaky failures, a11y clean across all reachable states, green locally across all 4 browsers (Chromium-scoped tests skip cleanly on Firefox/Safari). Pending: CI confirmation (Step 10-11).
