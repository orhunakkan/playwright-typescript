# Requirements Traceability Matrix — Accessibility Scanning

| Field      | Value                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| JIRA Story | [TAB1-35](https://orhunakkan.atlassian.net/browse/TAB1-35)                                                    |
| Lab URL    | https://stagecraftlabs.com/practice/accessibility-scanning                                                    |
| Spec file  | tests/accessibility-scanning/accessibility-scanning.spec.ts                                                   |
| POM file   | pages/accessibility-scanning.page.ts                                                                          |
| Last run   | 2026-07-14 — Local: 48/48 passed (Chrome 12/12 · Firefox 12/12 · Edge 12/12 · Safari 12/12). 0 skipped tests. |
| Generated  | 2026-07-14                                                                                                    |
| Status     | Local green, 0 open blockers — pending CI verification for Done                                               |

---

## Coverage by Acceptance Criterion

| Req     | Acceptance Criterion                                                                              | Test Case                                                                                                              | Type | Result   |
| ------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---- | -------- |
| AC-1    | `AxeBuilder({ page }).analyze()` on the broken form state reports `results.violations.length > 0` | positive: results.violations.length is greater than 0 on the default (broken) state                                    | P    | ✅ (4/4) |
| AC-1    | (data-driven — both known broken-state rule ids are present)                                      | data-driven: each known broken-state rule id is present among the reported violations                                  | D    | ✅ (4/4) |
| AC-2    | Each violation's `id`, `impact`, and `nodes` are logged for diagnosis                             | positive: every reported violation exposes id, impact, and a non-empty nodes array                                     | P    | ✅ (4/4) |
| AC-3    | Toggling to the accessible state and re-scanning reports `results.violations` as an empty array   | positive: results.violations is an empty array after toggling "Show accessible controls"                               | P    | ✅ (4/4) |
| AC-3    | (boundary — toggling back to broken reproduces violations, proving reversibility)                 | boundary: toggling back to the broken state reproduces violations, proving the state is reversible not a one-way reset | B    | ✅ (4/4) |
| AC-4    | `.include("#form-region")` scopes the scan to only the Settings Form section                      | positive: scoped scan on the broken state reports exactly the violations that live inside #form-region                 | P    | ✅ (4/4) |
| AC-4    | (negative — scoped scan on the accessible state also reports zero violations)                     | negative: scoped scan on the accessible state reports zero violations, matching the full-page scan                     | N    | ✅ (4/4) |
| AC-5    | `.withTags(["wcag2a", "wcag2aa"])` filters the scan to WCAG 2.x rules only                        | positive: every reported violation carries at least one of the wcag2a/wcag2aa tags                                     | P    | ✅ (4/4) |
| AC-5    | (boundary — an unmatched tag filter reports zero violations even though the page is broken)       | boundary: an unmatched tag filter reports zero violations even though the page is broken                               | B    | ✅ (4/4) |
| AXE     | No WCAG 2.x violations in the page chrome (outside the intentionally broken form) on initial load | no violations on initial load outside #form-region                                                                     | A11y | ✅ (4/4) |
| AXE     | No WCAG 2.x violations in the page chrome with accessible controls toggled on                     | no violations with accessible controls toggled on, outside #form-region                                                | A11y | ✅ (4/4) |
| REQ-NF1 | The page must meet its performance budget (load)                                                  | initial accessibility-scanning page load is within budget                                                              | Perf | ✅ (4/4) |

_All rows: 4/4 = Desktop Chrome, Desktop Firefox, Desktop Edge, Desktop Safari._

---

## Defects

| ID  | Type | Summary    | Severity | Found by | JIRA | Status |
| --- | ---- | ---------- | -------- | -------- | ---- | ------ |
| —   | —    | None found | —        | —        | —    | —      |

---

## Traceability Summary

- **ACs covered:** 5 / 5 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5) on all 4 browsers
- **Non-functional covered:** 3 / 3 (chrome-only AXE load · chrome-only AXE accessible-state · performance budget)
- **Test cases:** 12 tests × 4 browsers = 48 defined, executed, and passing. 0 skipped.
- **Every POM element asserted by ≥1 case:** ✅ (`accessibleControlsCheckbox`/`violationStatusBadge` in AC-3; `formRegion`/`nameInput`/`emailInput`/`submitFormButton`/`decorativeImage` exercised indirectly via the axe scans they inform)
- **Notable finding during test design:** the broken state's placeholder-only "Your name" field does **not** trigger axe's `label` rule — axe accepts a placeholder as a valid accessible name for that specific check (still poor UX, just not what this rule catches). The two real, reliably-reported violations are `image-alt` (decorative `<img>` with no `alt` attribute) and `color-contrast` (Submit button text at `rgb(170,170,170)` on white). This was discovered empirically after an initial 3-violation assumption failed in the first local run.
- **Notable finding during test design:** the broken-state violation set is timing-sensitive against a pre-hydration DOM snapshot — scanning immediately after `page.goto()` intermittently reported an unrelated `page-has-heading-one` false-flag and sometimes missed `color-contrast`/`image-alt` entirely. Adding `page.waitForLoadState('networkidle')` before every scan made the violation set deterministic across 5 consecutive runs before it was adopted into the spec.
- **Open blockers:** 0
- **Exit criteria met:** ✅ — all P1 requirements covered, 0 open blockers, chrome-only a11y clean on all 4 browsers, 48/48 passing locally. Story proceeds to Done once CI confirms this on the PR.
