# Requirements Traceability Matrix — ARIA Snapshots

| Field      | Value                                                          |
| ---------- | -------------------------------------------------------------- |
| JIRA Story | [TAB1-22](https://orhunakkan.atlassian.net/browse/TAB1-22)     |
| Lab URL    | https://stagecraftlabs.com/practice/aria-snapshots             |
| Spec file  | tests/aria-snapshots/aria-snapshots.spec.ts                    |
| POM file   | pages/aria-snapshots.page.ts                                   |
| Last run   | 2026-07-12 — 76 / 76 passed (Chrome · Firefox · Edge · Safari) |
| Generated  | 2026-07-12                                                     |

---

## Coverage by Acceptance Criterion

| Req     | Acceptance Criterion                                                                          | Test Case                                                                                               | Type | Result |
| ------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ---- | ------ |
| AC-1    | ARIA snapshot of the fully-collapsed accordion matches (or generates) the file-based baseline | positive: ARIA snapshot of the fully-collapsed accordion matches (or generates) the baseline            | P    | ✅     |
| AC-1-N  | An inline template with an extra phantom section does not match the collapsed accordion       | negative/AC-1a: an inline template with an extra phantom section does not match the collapsed accordion | N    | ✅     |
| AC-2    | Expanding one section adds a region child node for its content in the tree                    | positive: expanding one section adds a region child for its content                                     | P    | ✅     |
| AC-2-N  | Re-collapsing the expanded section removes the region child node again                        | negative/AC-2a: re-collapsing the section removes the region child node again                           | N    | ✅     |
| AC-2-B  | Only the target section's subtree gains children; sibling sections stay collapsed             | boundary/AC-2b: only the target section gains a child; sibling sections remain collapsed                | B    | ✅     |
| AC-3    | `/children: equal` accepts a template listing exactly the actual child set                    | positive: /children: equal accepts a template listing exactly the actual child set                      | P    | ✅     |
| AC-3-N  | `/children: equal` rejects a template with a missing node                                     | negative/AC-3a: /children: equal rejects a template with a missing node                                 | N    | ✅     |
| AC-3-N  | `/children: equal` rejects a template with an extra node                                      | negative/AC-3b: /children: equal rejects a template with an extra node                                  | N    | ✅     |
| AC-4    | `aria-current="step"` moves to step 2 after Next and back to step 1 after Back                | positive: aria-current moves to step 2 after Next and back to step 1 after Back                         | P    | ✅     |
| AC-4-N  | A non-current step button carries no `aria-current` attribute                                 | negative/AC-4a: a non-current step button carries no aria-current attribute                             | N    | ✅     |
| AC-4-B  | A direct step-jump click sets `aria-current` on the target step only                          | boundary/AC-4b: a direct step-jump click sets aria-current on the target step only                      | B    | ✅     |
| AC-5    | A regex partial-match pattern matches the active step form name while structure is strict     | positive: a regex pattern matches the active step form name while the rest of the structure is strict   | P    | ✅     |
| AC-5-N  | The same template fails to match once the form advances to a different step                   | negative/AC-5a: the same template fails to match once the form advances to a different step             | N    | ✅     |
| AC-6    | Before/after ARIA snapshots of the live region reflect the accordion toggle                   | positive: before/after ARIA snapshots of the live region reflect the accordion toggle                   | P    | ✅     |
| AC-6-N  | The live announcement region content is unchanged with no toggle action performed             | negative/AC-6a: the live announcement region content is unchanged with no toggle action performed       | N    | ✅     |
| AXE     | No critical axe-core violations at initial load                                               | no violations at initial load                                                                           | A11y | ✅     |
| AXE     | No critical axe-core violations with an accordion section expanded                            | no violations with an accordion section expanded                                                        | A11y | ✅     |
| AXE     | No critical axe-core violations after navigating the wizard to a later step                   | no violations after navigating the wizard to a later step                                               | A11y | ✅     |
| REQ-NF1 | Initial page load must meet its performance budget                                            | initial page load completes within budget                                                               | Perf | ✅     |

---

## Defects

| ID      | Severity | Summary                                                                                         | Found by                         | JIRA                                                       | Status |
| ------- | -------- | ----------------------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------- | ------ |
| TAB1-48 | Serious  | Active-step wizard button color contrast insufficient (3.86:1 vs 4.5:1 WCAG AA, indigo styling) | axe scan, all browsers           | [TAB1-48](https://orhunakkan.atlassian.net/browse/TAB1-48) | Done   |
| TAB1-49 | Serious  | Completed-step wizard button color contrast insufficient (emerald styling)                      | axe scan, initially Firefox-only | [TAB1-49](https://orhunakkan.atlassian.net/browse/TAB1-49) | Done   |

---

## Traceability Summary

- **ACs covered:** 6 / 6 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5 · AC-6)
- **Non-functional covered:** 2 / 2 (AXE across 3 states · Performance budget)
- **Test cases:** 19 (P:6 · N:6 · B:2 · A11y:3 · Perf:1) × 4 browsers = **76 total**
- **API coverage:** all JIRA-listed APIs exercised — `expect(locator).toMatchAriaSnapshot()` (file-based baseline, AC-1), inline templates with `/children: equal` (AC-3), and accessibility-tree structural assertions throughout
- **Known engine quirk:** the wizard's per-step panel is a `<div role="form">`, not a real `<form>` tag — `page.locator('form')` never matches it; the POM uses `getByRole('form')` instead
- **Test-timing fix:** the wizard step buttons run a 150ms CSS color transition on click; the axe scan after "Next" now waits for the current-step button's computed background color to stabilize before scanning, avoiding false contrast violations from sampling an in-flight blended color (root cause of the apparent TAB1-48/TAB1-49 flakiness during triage)
- **Open defects:** 0 (TAB1-48 and TAB1-49 fixed and verified 2026-07-12, 20/20 repeated runs each across all 4 browsers)
- **Exit criteria met:** ✅ — all P1+P2 requirements covered, 0 non-flaky failures, a11y clean across 3 states, 4 browsers green locally
