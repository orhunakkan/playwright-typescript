# Test Plan — Passkey Authentication (TAB1-60)

## 1. Scope

In scope: CDP virtual authenticator setup (`newCDPSession` + `WebAuthn.addVirtualAuthenticator`),
passkey registration ceremony (`navigator.credentials.create()`), post-registration dashboard
state, sign-out flow, unauthenticated route guard on the dashboard URL, `WebAuthn.credentialAdded`
CDP event assertion, and documentation of the passwordless ceremony vs. the Fake Auth lab's
username/password fixture.

Out of scope: `navigator.credentials.get()` sign-in-with-an-existing-passkey ceremony (not covered
by the story's ACs), physical/OS-level authenticator prompts, cross-device passkey sync, backend
credential storage/persistence testing, non-CDP (real hardware key) authenticator flows.

## 2. Test types

Functional (positive / negative / boundary) ✅ · Accessibility (axe, all states) ✅ ·
Non-functional (performance budget) ✅ · Cross-browser ⚠️ **Chromium-only** (see §4).

## 3. Environments & data

Target env: production Stagecraft Labs instance, `BASE_URL` sourced from `.env` /
`.env.<ENV>` (see `playwright.config.ts` dotenv loading; default `.env.example` value
`https://stagecraftlabs.com`). No seed data required — each test creates its own virtual
authenticator + passkey per test run (isolated browser context), so no faker-based valid-value
generation is needed beyond the registered display name if the app requires one.

## 4. Browser / device matrix

From `playwright.config.ts` `projects[]`: Desktop Chrome, Desktop Firefox, Desktop Edge,
Desktop Safari.

**Constraint:** `context.newCDPSession()` and the CDP `WebAuthn` domain are Chromium-only —
Firefox (Gecko) and WebKit (Safari) do not implement the Chrome DevTools Protocol. Only the
tests that attach a virtual authenticator (AC-1, AC-2 positive, AC-3, AC-5, and the dashboard/
error-state a11y scans) are scoped to Chromium-engine projects (Desktop Chrome + Desktop Edge —
Playwright reports `browserName: 'chromium'` for both) via a per-describe
`test.skip(({ browserName }) => browserName !== 'chromium', reason)` guard — the same pattern
already used in `tests/touch-gestures/touch-gestures.spec.ts` for its CDP-only swipe tests.
Tests that don't need an authenticator (AC-2 negative, AC-4 unauthenticated guard, initial-load
a11y scan, performance budget) run on all 4 browsers.

## 5. Risk assessment & priority

| Area / Requirement                                          | Likelihood | Impact | Risk | Priority |
| ----------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| REQ-01 CDP virtual authenticator setup                      | L          | H      | M    | P1       |
| REQ-02 Passkey registration → dashboard w/ user name        | M          | H      | H    | P1       |
| REQ-03 Sign out → returns to registration screen            | L          | H      | M    | P1       |
| REQ-04 Unauthenticated dashboard guard                      | M          | H      | H    | P1       |
| REQ-05 `credentialAdded` CDP event fires                    | L          | M      | L    | P1       |
| REQ-01a No authenticator → ceremony can't complete headless | L          | M      | L    | P2       |
| REQ-02a Dashboard/name not visible pre-registration         | L          | M      | L    | P2       |
| REQ-03a Reload/back after sign-out doesn't restore session  | M          | H      | H    | P2       |
| REQ-05a Cancelled creation → no `credentialAdded` event     | L          | L      | L    | P3       |
| REQ-06 Passwordless-vs-Fake-Auth documentation              | L          | L      | L    | P3       |
| REQ-NF1 Performance budget                                  | L          | M      | L    | P2       |
| REQ-A11Y Accessibility, all states                          | M          | H      | H    | P1       |

## 6. Entry criteria

- Requirements extracted and prioritized (requirement-extractor done — Step 1)
- POM exists for the lab (locator-mapper done — Step 3)
- App URL reachable; `BASE_URL` configured
- Chrome DevTools MCP available to confirm interactive selectors + event wiring during POM build

## 7. Exit criteria

- 100% of P1 + P2 requirements have passing automated cases on the browsers they target
  (CDP-dependent cases: Desktop Chrome + Desktop Edge; browser-agnostic cases: all 4 browsers)
- 0 open non-flaky defects of severity ≥ High linked to TAB1-60
- Accessibility: 0 critical/serious violations (or tracked + accepted with a defect id)
- Green in CI across all 4 browsers, with CDP-dependent tests skipped (not failed) on
  Firefox/Safari via the documented `test.skip(({ browserName }) => ...)` guard
- RTM generated and up to date

## 8. Deliverables

`tests/passkey-authentication/passkey-authentication.spec.ts` · `pages/passkey-authentication.page.ts` ·
RTM (`docs/rtm/passkey-authentication.rtm.md`) · this plan · CI run

## 9. Schedule / effort (lightweight)

Requirements → this plan → POM (locator-mapper) → fixture registration → spec
(test-case-generator) → local run → triage → PR → CI → RTM confirmation → JIRA review/done
