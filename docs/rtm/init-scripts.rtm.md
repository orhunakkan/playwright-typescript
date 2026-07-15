# Requirements Traceability Matrix — Init Scripts & Seeding

| Field      | Value                                                          |
| ---------- | -------------------------------------------------------------- |
| JIRA Story | [TAB1-40](https://orhunakkan.atlassian.net/browse/TAB1-40)     |
| Lab URL    | https://stagecraftlabs.com/practice/init-scripts               |
| Spec file  | tests/init-scripts/init-scripts.spec.ts                        |
| POM file   | pages/init-scripts.page.ts                                     |
| Last run   | 2026-07-14 — 68 / 68 passed (Chrome · Firefox · Edge · Safari) |
| Generated  | 2026-07-14                                                     |

---

## Coverage by Acceptance Criterion

| Req     | Acceptance Criterion                                                                                               | Test Case                                                                               | Type | Result |
| ------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ---- | ------ |
| AC-1    | page.addInitScript injects window.**FLAGS** before navigation; feature flag banner visible                         | positive: betaFeature true renders the beta feature banner                              | P    | ✅     |
| AC-1    |                                                                                                                    | negative: no init script means no flags — banner absent, empty state shown              | N    | ✅     |
| AC-1    |                                                                                                                    | boundary: betaFeature false does not render the banner — flag-driven, not always-on     | B    | ✅     |
| AC-2    | Math.random stubbed via addInitScript to always return 0.42; Lucky Number widget displays 42                       | positive: stubbing Math.random to 0.42 before navigation renders 42                     | P    | ✅     |
| AC-2    |                                                                                                                    | negative: stubbing Math.random after goto does not change the already-rendered value    | N    | ✅     |
| AC-2    |                                                                                                                    | boundary: the addInitScript stub survives a reload of the same page                     | B    | ✅     |
| AC-3    | page.addInitScript seeds localStorage.onboarded=true before navigation; onboarding modal not present after load    | positive: seeding onboarded=true before navigation suppresses the modal                 | P    | ✅     |
| AC-3    |                                                                                                                    | negative: without a seed, the onboarding modal is present on load                       | N    | ✅     |
| AC-3    |                                                                                                                    | boundary: onboarded="false" does not suppress the modal — exact "true" match required   | B    | ✅     |
| AC-4    | context.addInitScript localStorage seed persists to a fresh page opened from the same context                      | positive: a second fresh page from the same seeded context has the modal suppressed     | P    | ✅     |
| AC-4    |                                                                                                                    | negative: a fresh page from a different, unseeded context still shows the modal         | N    | ✅     |
| AC-5    | Setting localStorage after page.goto does not suppress the onboarding modal — init scripts must run pre-navigation | positive: a late (post-goto) localStorage write does not hide an already-rendered modal | P    | ✅     |
| AC-5    |                                                                                                                    | boundary: the status widget still reads Pending despite the late write                  | B    | ✅     |
| AXE     | The page must have no critical/serious axe-core violations in every rendered state                                 | no violations on initial load with the onboarding modal open                            | A11y | ✅     |
| AXE     |                                                                                                                    | no violations on the fully seeded success state (flags + stub + suppressed modal)       | A11y | ✅     |
| AXE     |                                                                                                                    | no violations after dismissing the modal via user interaction                           | A11y | ✅     |
| REQ-NF1 | The page must meet its performance budget (load + key interaction)                                                 | initial init-scripts page load is within budget                                         | Perf | ✅     |

---

## Defects

| ID      | Type          | Summary                                                                                                                    | Severity | Found by                 | JIRA                                                       | Status                                           |
| ------- | ------------- | -------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------ | ---------------------------------------------------------- | ------------------------------------------------ |
| TAB1-58 | Accessibility | `color-contrast`: "Complete" onboarding status text (`text-emerald-600` on white, 3.65:1) fails WCAG 2 AA (4.5:1 required) | Serious  | axe-core, all 4 browsers | [TAB1-58](https://orhunakkan.atlassian.net/browse/TAB1-58) | ✅ Fixed & closed — verified live, 68/68 passing |

---

## Traceability Summary

- **ACs covered:** 5 / 5 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5) on all 4 browsers
- **Non-functional covered:** 4 / 4 (AXE load state · AXE seeded/success state · AXE dismissed state · performance budget)
- **Test cases:** 17 tests × 4 browsers = 68 defined, executed, and passing. 0 skipped.
- **Every POM element asserted by ≥1 case:** ✅ (`betaFeatureBanner`/`betaFeatureEmptyState` in AC-1, `luckyNumber` in AC-2, `onboardingModal`/`onboardingStatus`/`onboardingDismissButton` across AC-3/4/5 and accessibility)
- **Real defect found and fixed during this run:** TAB1-58 — a genuine WCAG AA color-contrast failure in the deployed app (same root cause as TAB1-57), found, filed, fixed upstream, deployed, verified live, and confirmed via a clean re-run (68/68).
- **Notable finding during test design:** one authored test (AC-5 boundary — late localStorage write) initially raced ahead of the app's own mount-time read of `localStorage`, since `page.goto()`'s default wait resolves before hydration reliably settles. Fixed by synchronizing on the status widget's initial rendered text before performing the late write, matching the pattern already used elsewhere in this repo (e.g. `accessibility-scanning.spec.ts`'s `waitForLoadState('networkidle')` note).
- **Open defects:** 0
- **Exit criteria met:** ✅ — all P1+P2 requirements covered, 0 non-flaky failures, a11y clean across all 3 states, 4 browsers green locally
