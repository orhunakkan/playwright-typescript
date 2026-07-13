# Requirements Traceability Matrix — Geolocation & Permissions

| Field      | Value                                                                          |
| ---------- | --------------------------------------------------------------------------------- |
| JIRA Story | [TAB1-32](https://orhunakkan.atlassian.net/browse/TAB1-32)                       |
| Lab URL    | https://stagecraftlabs.com/practice/geolocation-permissions                       |
| Spec file  | tests/geolocation-permissions/geolocation-permissions.spec.ts                     |
| POM file   | pages/geolocation-permissions.page.ts                                             |
| Last run   | 2026-07-13 (local) — 62 passed / 0 failed / 18 skipped (Chrome · Firefox · Edge · Safari) |
| Generated  | 2026-07-13                                                                         |

---

## Coverage by Acceptance Criterion

| Req  | Acceptance Criterion                                                                                                     | Test Case                                                                                       | Type | Result |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ---- | ------ |
| AC-1 | Tests call `context.grantPermissions(["geolocation"])` and `context.setGeolocation({...})` before clicking "Find Cafés Near Me" and assert the café list appears asynchronously | positive: granted geolocation with valid coordinates renders the café list and matching coords       | P    | ✅     |
| AC-1 |                                                                                                                            | negative: permission granted but geolocation explicitly nulled surfaces an error, not a café list (Chrome/Firefox only) | N    | ✅     |
| AC-1 |                                                                                                                            | boundary: extreme coordinates (north pole / antimeridian) still resolve without crashing            | B    | ✅     |
| AC-1 |                                                                                                                            | boundary: origin coordinates (0,0) still resolve without crashing                                    | B    | ✅     |
| AC-2 | Tests run without granting geolocation permission (default blocked in Playwright) and assert the `role="alert"` error appears | positive: clicking without a grant shows a visible, non-empty alert (Chrome/Edge/Safari only — see note) | P    | ✅     |
| AC-2 |                                                                                                                            | negative: the café list never renders when geolocation is blocked                                    | N    | ✅     |
| AC-2 |                                                                                                                            | boundary: Find Cafés Near Me stays visible/enabled after the error, allowing a retry                  | B    | ✅     |
| AC-3 | Tests grant both `"clipboard-read"` and `"clipboard-write"` in a single `context.grantPermissions()` call before the clipboard panel interaction | positive: granting both scopes in one call lets Copy then Paste complete end to end (Chromium only)  | P    | ✅     |
| AC-3 |                                                                                                                            | negative: without clipboard-read, Paste shows the read-blocked alert instead of the URL (Chromium only) | N    | ✅     |
| AC-3 |                                                                                                                            | boundary: clipboard-write without any grant — Chromium blocks it, Firefox/WebKit allow the user gesture | B    | ✅     |
| AC-4 | Tests click "Copy Share Link", assert the success status appears, click "Paste", and assert the pasted URL is visible in the read-only input | positive: full copy-then-paste flow shows both success statuses and the correct pasted URL (Chromium only) | P    | ✅     |
| AC-4 |                                                                                                                            | negative: the pasted URL input is not present before Paste is clicked (Chromium only)                 | N    | ✅     |
| AC-4 |                                                                                                                            | boundary: the pasted URL input is read-only and cannot be edited (Chromium only)                      | B    | ✅     |
| AC-5 | Tests call `context.clearPermissions()` after each permission-sensitive test to prevent grants leaking into subsequent tests | positive: a granted+resolved geolocation call clears cleanly and does not leak into the next test    | P    | ✅     |
| AC-5 |                                                                                                                            | negative: the same context, reused without re-granting, is blocked again after clearPermissions() (Chrome/Edge/Safari only) | N    | ✅     |
| AXE  | The page must have no critical/serious axe-core violations in every rendered state                                          | no violations on initial page load                                                                   | A11y | ✅     |
| AXE  |                                                                                                                            | no violations on the geolocation-blocked error state (Chrome/Edge/Safari only)                        | A11y | ✅     |
| AXE  |                                                                                                                            | no violations on the geolocation-success café list state                                             | A11y | ✅     |
| AXE  |                                                                                                                            | no violations on the clipboard copy+paste success state (Chromium only)                              | A11y | ✅ (TAB1-55 fixed) |
| REQ-NF1 | The page must meet its performance budget (load + key interaction)                                                    | initial geolocation-permissions page load is within budget                                            | Perf | ✅     |

**Cross-engine notes (verified via manual diagnostic, not test defects):**
- Firefox does not auto-deny an ungranted geolocation permission in Playwright (hangs instead of erroring) — AC-2's 3 tests, the AC-5 negative test, and the geo-blocked a11y test are scoped to Chrome/Edge/Safari.
- WebKit resolves a nulled geolocation instead of erroring — AC-1's negative test is scoped to Chrome/Firefox.
- `clipboard-read`/`clipboard-write` are Chromium-only grantable permissions in Playwright (Firefox/WebKit throw "Unknown permission") — AC-3's positive/negative and all of AC-4 are scoped to Chromium; AC-3's boundary test branches its assertion per engine instead of skipping, since the underlying behavior (blocked vs. allowed) is real and worth asserting on both.

---

## Defects

| ID       | Severity | Summary                                                                 | Found by                          | JIRA     | Status |
| -------- | -------- | ------------------------------------------------------------------------- | ---------------------------------- | -------- | ------ |
| TAB1-55  | Serious  | Insufficient color contrast (3.65:1, needs 4.5:1) on "Pasted successfully." status text (`text-emerald-600` on white) | axe-core `color-contrast`, Desktop Chrome & Desktop Edge | [TAB1-55](https://orhunakkan.atlassian.net/browse/TAB1-55) | Done — fixed & verified |

---

## Traceability Summary

- **ACs covered:** 5 / 5 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5)
- **Non-functional covered:** 2 / 2 (AXE multi-state · Performance budget)
- **Test cases:** 20 unique cases (P:6 · N:5 · B:6 · A11y:4 · Perf:1); 62 executed instances across 4 browsers after cross-engine scoping (62 passed, 0 failed, 18 skipped)
- **Every POM element asserted by ≥1 case:** ✅
- **Open defects:** 0 (TAB1-55 fixed and verified — was an app-level accessibility bug, not a test defect)
- **Exit criteria met:** ✅ — all P1+P2 requirements covered, 0 non-flaky failures, 0 open defects, green across all 4 browsers locally.
