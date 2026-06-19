# Requirements Traceability Matrix — Fake Auth

| Field      | Value                                                          |
| ---------- | -------------------------------------------------------------- |
| JIRA Story | [TAB1-21](https://orhunakkan.atlassian.net/browse/TAB1-21)     |
| Lab URL    | https://stagecraftlabs.com/practice/fake-auth                  |
| Spec file  | tests/fake-auth/fake-auth.spec.ts                              |
| POM file   | pages/fake-auth.page.ts                                        |
| Last run   | 2026-06-19 — 72 / 72 passed (Chrome · Firefox · Edge · Safari) |
| Generated  | 2026-06-19                                                     |

---

## Coverage by Acceptance Criterion

| Req     | Acceptance Criterion                                                                                                                                        | Test Case                                                                                 | Type | Result |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---- | ------ |
| AC-1    | Tests submit the login form with wrong credentials and assert the inline error message appears without relying on CSS classes                               | negative: wrong username and wrong password shows role=alert error                        | D    | ✅     |
| AC-1    |                                                                                                                                                             | negative: valid username, wrong password shows role=alert error                           | D    | ✅     |
| AC-1    |                                                                                                                                                             | negative: wrong username, valid password shows role=alert error                           | D    | ✅     |
| AC-1    |                                                                                                                                                             | boundary: Sign in button is disabled when both fields are empty                           | B    | ✅     |
| AC-1    |                                                                                                                                                             | boundary: Sign in button enables once both username and password are filled               | B    | ✅     |
| AC-2    | Tests submit with valid credentials (alice / password123) and assert the browser navigates to the dashboard URL using `toHaveURL`                           | positive: alice/password123 navigates to dashboard and shows welcome message              | P    | ✅     |
| AC-2    |                                                                                                                                                             | positive: bob/letmein also navigates to dashboard URL                                     | P    | ✅     |
| AC-2    |                                                                                                                                                             | negative: valid username with wrong password stays on login and shows error               | N    | ✅     |
| AC-3    | Tests navigate directly to the dashboard URL without logging in first and assert the app redirects to the login page                                        | positive: navigating to dashboard URL without auth redirects to login page                | P    | ✅     |
| AC-3    |                                                                                                                                                             | negative: dashboard content is not visible after redirect to login                        | N    | ✅     |
| AC-4    | Tests log in, click logout, assert the user is returned to the login page, and confirm the dashboard URL is no longer accessible                            | positive: login then sign out returns to login page                                       | P    | ✅     |
| AC-4    |                                                                                                                                                             | negative: after sign out, direct navigation to dashboard redirects back to login          | N    | ✅     |
| AC-5    | Tests demonstrate using `context.storageState()` to serialize session state so subsequent tests can start pre-logged-in without repeating the UI login flow | positive: login and serialize session state to file with context.storageState()           | P    | ✅     |
| AC-5    |                                                                                                                                                             | positive: new browser context loaded with storageState reaches dashboard without UI login | P    | ✅     |
| AXE     | The page must have no critical axe-core violations in every rendered state                                                                                  | no violations on login page load                                                          | A11y | ✅     |
| AXE     |                                                                                                                                                             | no violations while login error message is displayed                                      | A11y | ✅     |
| AXE     |                                                                                                                                                             | no violations on dashboard (authenticated state)                                          | A11y | ✅     |
| REQ-NF1 | The page must meet its performance budget (load + key interaction)                                                                                          | initial login page load is within budget                                                  | Perf | ✅     |

---

## Defects

| ID  | Severity | Summary          | Found by | JIRA | Status |
| --- | -------- | ---------------- | -------- | ---- | ------ |
| —   | —        | No defects found | —        | —    | —      |

---

## Traceability Summary

- **ACs covered:** 5 / 5 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5)
- **Non-functional covered:** 2 / 2 (AXE multi-state · Performance budget)
- **Test cases:** 18 (P:6 · N:5 · B:2 · D:3 · A11y:3 · Perf:1) × 4 browsers = **72 total**
- **Every POM error locator asserted by ≥1 negative case:** ✅ (`loginErrorMessage` asserted in AC-1 × 3 and AC-2 negative)
- **Framework gap addressed:** Gap #1 (storageState) — fully implemented in AC-5 (`test.describe.serial`)
- **Open defects:** 0
- **Exit criteria met:** ✅ — all P1+P2 requirements covered, 0 non-flaky failures, a11y clean across 3 states, 4 browsers green locally
