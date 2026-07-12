# Requirements Traceability Matrix — Storage State

| Field      | Value                                                                |
| ---------- | ---------------------------------------------------------------------- |
| JIRA Story | [TAB1-23](https://orhunakkan.atlassian.net/browse/TAB1-23)            |
| Lab URL    | https://stagecraftlabs.com/practice/storage-state                     |
| Spec file  | tests/storage-state/storage-state.spec.ts                              |
| POM file   | pages/storage-state.page.ts                                            |
| Last run   | 2026-07-12 — 80 / 80 passed (Chrome · Firefox · Edge · Safari)         |
| Generated  | 2026-07-12                                                              |

---

## Coverage by Acceptance Criterion

| Req  | Acceptance Criterion                                                                                                                   | Test Case                                                                                          | Type | Result |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---- | ------ |
| AC-1 | Tests log in via the UI as alice and call `context.storageState({ path })` to save the session to a file                              | positive: after UI login, context.storageState() writes a file to disk                                | P    | ✅     |
| AC-1 |                                                                                                                                          | boundary: saved state file contains the session cookie that authenticates the user                    | B    | ✅     |
| AC-1 |                                                                                                                                          | negative: storageState() from a context that never logged in has no session cookie                    | N    | ✅     |
| AC-2 | Tests load the saved state with `browser.newContext({ storageState })`, navigate to the profile page, and assert the correct user — no login step | positive: new context loaded from storage state shows the correct user with no login step             | P    | ✅     |
| AC-2 |                                                                                                                                          | negative: loading from a nonexistent storage state file rejects                                       | N    | ✅     |
| AC-2 |                                                                                                                                          | boundary: context restored from storage state does not show the unauthenticated block                 | B    | ✅     |
| AC-3 | Tests create two separate storage state files (admin role and regular user role) and assert role-specific UI differences               | positive: admin context sees the Admin panel; user context does not                                    | P    | ✅     |
| AC-3 |                                                                                                                                          | negative: user context never exposes admin-only stats                                                  | N    | ✅     |
| AC-3 |                                                                                                                                          | boundary: role badge text differs between the admin and user contexts                                  | B    | ✅     |
| AC-4 | Tests authenticate as each user using the `request` fixture (no browser) and capture their storage state file                          | positive: request.post to the login API authenticates alice and request.storageState() captures session | P    | ✅     |
| AC-4 |                                                                                                                                          | positive: state captured via the request fixture authenticates a real browser context                  | P    | ✅     |
| AC-4 |                                                                                                                                          | negative: request-based login with invalid credentials returns 401 and sets no session                 | N    | ✅     |
| AC-4 |                                                                                                                                          | boundary: request-based auth for bob captures a session distinct from alice                             | B    | ✅     |
| AC-5 | Tests verify that a fresh context loaded from a storage state file skips the login form entirely and lands on the authenticated view    | positive: context loaded from storage state lands directly on the authenticated view                    | P    | ✅     |
| AC-5 |                                                                                                                                          | negative: a fresh context with no storage state shows the unauthenticated block                         | N    | ✅     |
| AC-5 |                                                                                                                                          | boundary: authenticated session persists across a page reload in the same context                       | B    | ✅     |
| AXE  | The page must have no critical axe-core violations in every rendered state                                                             | no violations on unauthenticated storage-state page                                                     | A11y | ✅     |
| AXE  |                                                                                                                                          | no violations on admin-authenticated view                                                                | A11y | ✅     |
| AXE  |                                                                                                                                          | no violations on user-authenticated view                                                                 | A11y | ✅     |
| REQ-NF1 | The page must meet its performance budget (load + key interaction)                                                                  | initial storage-state page load is within budget                                                         | Perf | ✅     |

---

## Defects

| ID  | Severity | Summary          | Found by | JIRA | Status |
| --- | -------- | ---------------- | -------- | ---- | ------ |
| —   | —        | No defects found | —        | —    | —      |

---

## Traceability Summary

- **ACs covered:** 5 / 5 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5)
- **Non-functional covered:** 2 / 2 (AXE multi-state · Performance budget)
- **Test cases:** 20 (P:6 · N:5 · B:6 · A11y:3 · Perf:1) × 4 browsers = **80 total**
- **Every POM element asserted by ≥1 case:** ✅ (`profileCard`/`displayName`/`userRole` across AC-2/3/5, `adminPanel`/`totalUsers`/`pendingReviews` in AC-3, `notAuthenticated` in AC-2/5)
- **Framework gaps addressed:** Gap #1 (storageState via UI login) — AC-1/2/5; multi-role isolated contexts — AC-3; browser-free `request` fixture auth capture — AC-4
- **Open defects:** 0
- **Exit criteria met:** ✅ — all P1+P2 requirements covered, 0 non-flaky failures, a11y clean across 3 states, 4 browsers green locally
