# Requirements Traceability Matrix — Locator Handlers

| Field      | Value                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| JIRA Story | [TAB1-36](https://orhunakkan.atlassian.net/browse/TAB1-36)                                                    |
| Lab URL    | https://stagecraftlabs.com/practice/locator-handlers                                                          |
| Spec file  | tests/locator-handlers/locator-handlers.spec.ts                                                               |
| POM file   | pages/locator-handlers.page.ts                                                                                |
| Last run   | 2026-07-14 — Local: 48/48 passed (Chrome 12/12 · Firefox 12/12 · Edge 12/12 · Safari 12/12). 0 skipped tests. |
| Generated  | 2026-07-14                                                                                                    |
| Status     | Local green, 0 open blockers — pending CI verification for Done                                               |

---

## Coverage by Acceptance Criterion

| Req     | Acceptance Criterion                                                                                                                               | Test Case                                                                                                            | Type | Result   |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---- | -------- |
| AC-1    | `page.addLocatorHandler()` for the cookie-consent banner (role="dialog"), registered before navigating, auto-dismisses without manual intervention | positive: handler registered before navigation dismisses the Cookie Consent dialog automatically                     | P    | ✅ (4/4) |
| AC-1    | (negative — with no handler registered, the banner remains visible and blocks progress)                                                            | negative: with no handler registered, the Cookie Consent dialog remains visible and blocks interaction underneath it | N    | ✅ (4/4) |
| AC-2    | "Force overlays every step" enabled; complete all three checkout steps despite an overlay on every Next click                                      | positive: registering handlers for both overlay roles lets all three steps advance without manual dismissal          | P    | ✅ (4/4) |
| AC-2    | (negative — with overlays forced and no handlers registered, a step fails to advance)                                                              | negative: with "Force overlays every step" on and no handlers registered, a step fails to advance                    | N    | ✅ (4/4) |
| AC-3    | `page.removeLocatorHandler(locator)` called after step 2 — the overlay then blocks further progress out of step 3 without a registered handler     | positive: handler active through step 2, then removed, leaves step 3 blocked by the overlay                          | P    | ✅ (4/4) |
| AC-4    | A handler registered with `{ times: 1 }` fires exactly once; subsequent overlay occurrences are left unhandled                                     | boundary: dismissal count is exactly 1 across repeated overlay occurrences, not 0 and not more than 1                | B    | ✅ (4/4) |
| AC-5    | A handler scoped to role="dialog" only ever receives role="dialog" overlays                                                                        | positive: a handler scoped to role="dialog" only ever receives dialog-role overlays                                  | P    | ✅ (4/4) |
| AC-5    | (negative — a role="dialog" handler does not fire for the role="alertdialog" session survey, which then blocks progress)                           | negative: a handler scoped to role="dialog" does not fire for the role="alertdialog" session survey                  | N    | ✅ (4/4) |
| AXE     | No WCAG 2.x violations on initial page load                                                                                                        | no violations on initial page load                                                                                   | A11y | ✅ (4/4) |
| AXE     | No WCAG 2.x violations while an overlay dialog is visible                                                                                          | no violations while an overlay dialog is visible                                                                     | A11y | ✅ (4/4) |
| AXE     | No WCAG 2.x violations after dismissing an overlay and advancing to the next step                                                                  | no violations after dismissing an overlay and advancing to the next step                                             | A11y | ✅ (4/4) |
| REQ-NF1 | The page must meet its performance budget (load)                                                                                                   | initial locator-handlers page load is within budget                                                                  | Perf | ✅ (4/4) |

_All rows: 4/4 = Desktop Chrome, Desktop Firefox, Desktop Edge, Desktop Safari._

---

## Defects

| ID  | Type | Summary    | Severity | Found by | JIRA | Status |
| --- | ---- | ---------- | -------- | -------- | ---- | ------ |
| —   | —    | None found | —        | —        | —    | —      |

---

## Traceability Summary

- **ACs covered:** 5 / 5 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5) on all 4 browsers
- **Non-functional covered:** 4 / 4 (AXE load state · AXE overlay-visible state · AXE post-dismiss state · performance budget)
- **Test cases:** 12 tests × 4 browsers = 48 defined, executed, and passing. 0 skipped.
- **Every POM element asserted by ≥1 case:** ✅ (`forceOverlaysCheckbox`, `nextButton`/`placeOrderButton`, `stepIndicator`, `orderConfirmedStatus`, and all three overlay dialogs + their dismiss buttons are exercised directly; `anyDialog`/`anyAlertDialog` drive the role-distinction cases in AC-2/AC-4/AC-5)
- **Notable finding during test design:** the app's blocking mechanic is _sequential_, not immediate — a click that reveals an overlay always succeeds (the overlay renders as a result of the click), and it is the _following_ click on the next transition control that gets intercepted by the still-open backdrop (`<div class="fixed inset-0 z-50 ... bg-black/40">`). Early drafts of AC-3/AC-4/AC-5's negative cases assumed the revealing click itself would be blocked and failed until the assertions were moved one click later to match this behavior.
- **Notable finding during test design:** the three overlay types cycle in a fixed, deterministic order tied to which checkout transition triggers them — Cart→Shipping always surfaces the newsletter promo (`role="dialog"`), Shipping→Payment always surfaces the session survey (`role="alertdialog"`), and Payment→Confirmation always surfaces the Cookie Consent dialog (`role="dialog"`) — confirmed by repeated live runs before being encoded into the spec and POM.
- **Open blockers:** 0
- **Exit criteria met:** ✅ — all P1 requirements covered, 0 open blockers, 48/48 passing locally across all 4 browsers. Story proceeds to Done once CI confirms this on the PR.
