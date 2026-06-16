# Requirements Traceability Matrix — Async UI (TAB1-14)

| Field        | Value                                                                 |
| ------------ | --------------------------------------------------------------------- |
| JIRA story   | [TAB1-14](https://orhunakkan.atlassian.net/browse/TAB1-14)            |
| Spec         | `tests/async-ui/async-ui.spec.ts`                                     |
| POM          | `pages/async-ui.page.ts`                                              |
| Test plan    | `docs/test-plan/async-ui.test-plan.md`                                |
| Local run    | 108 / 108 passing (Desktop Chrome, Firefox, Edge, Safari)             |
| Open defects | 1 non-blocking (TAB1-42 — color-contrast, Serious, excluded in tests) |

---

## Requirement → Test Case Map

| Req ID | Requirement                                                                                                  | Priority | Test Case(s)                                                                                         | Status                                     |
| ------ | ------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| AC-1   | Tests assert loading skeleton visible immediately after triggering load, disappears once content replaces it | P1       | `AC-1 — positive: skeleton visible immediately after Load articles click, then replaced by articles` | ✅ Pass                                    |
| AC-1a  | _(neg)_ Skeleton NOT visible before load triggered                                                           | P2       | `AC-1 — negative: loading indicator absent before any load is triggered`                             | ✅ Pass                                    |
| AC-1b  | _(boundary)_ Skeleton disappears within declared load timeout — no sleep                                     | P2       | `AC-1 — boundary: skeleton gone and articles visible within the declared load timeout (no sleep)`    | ✅ Pass                                    |
| AC-2   | Tests assert delayed news articles appear using `waitFor`/`toBeVisible` — no `waitForTimeout`                | P1       | `AC-2 — positive: all four articles appear after clicking Load articles`                             | ✅ Pass                                    |
| AC-2   | Article headings non-empty after load                                                                        | P1       | `AC-2 — positive: article headings contain non-empty text after load`                                | ✅ Pass                                    |
| AC-2a  | _(neg)_ Articles absent before Load articles clicked                                                         | P2       | `AC-2 — negative: articles absent before Load articles is clicked`                                   | ✅ Pass                                    |
| AC-2b  | _(boundary)_ Assertion fired at/near ~1.5 s delay — not premature                                            | P2       | `AC-2 — boundary: first article visible at/near the ~1.5 s delay (not a premature assertion)`        | ✅ Pass                                    |
| AC-3   | Tests use `expect.poll()` to assert auto-updating stock ticker until target value reached                    | P1       | `AC-3 — positive: expect.poll() detects a price change from the initial value`                       | ✅ Pass                                    |
| AC-3a  | _(neg)_ Ticker value changes after ≥ 2 s                                                                     | P2       | `AC-3 — negative: ticker value does not stay at its initial value after ≥ 2 s`                       | ✅ Pass                                    |
| AC-3b  | _(boundary)_ Every polled price matches `$NNN.NN` format                                                     | P2       | `AC-3 — boundary: every polled price value matches the $NNN.NN format`                               | ✅ Pass                                    |
| AC-3   | Last-updated timestamp visible                                                                               | P2       | `AC-3 — positive: last-updated timestamp is visible in the ticker`                                   | ✅ Pass                                    |
| AC-4   | Tests handle error state from "Load with error" button and assert error message visible                      | P1       | `AC-4 — positive: clicking "Load with error" shows the error alert`                                  | ✅ Pass                                    |
| AC-4a  | _(neg)_ Error alert absent before trigger                                                                    | P2       | `AC-4 — negative: error alert absent before "Load with error" is clicked`                            | ✅ Pass                                    |
| AC-4b  | _(boundary)_ Error appears within expected async timeout                                                     | P2       | `AC-4 — boundary: error alert appears within the expected async settling timeout`                    | ✅ Pass                                    |
| AC-4   | Retry button actionable in error state                                                                       | P1       | `AC-4 — positive: Retry button inside the error alert is visible and enabled`                        | ✅ Pass                                    |
| AC-4   | Retry recovers articles successfully                                                                         | P1       | `AC-4 — positive: clicking Retry after an error loads articles successfully`                         | ✅ Pass                                    |
| AC-5   | Tests capture transient toast and assert text before auto-dismissal                                          | P1       | `AC-5 — positive: toast appears after trigger and text is asserted before auto-dismissal`            | ✅ Pass                                    |
| AC-5b  | _(boundary)_ Toast text captured within 800 ms window                                                        | P1       | `AC-5 — boundary: toast text captured within the 800 ms visibility window`                           | ✅ Pass                                    |
| AC-5a  | _(neg)_ Toast not visible after dismissal                                                                    | P1       | `AC-5 — negative (AC-5a): toast not visible after the Dismiss button is clicked`                     | ✅ Pass                                    |
| AC-5   | Trigger button disabled while toast visible                                                                  | P1       | `AC-5 — positive: Trigger notification button is disabled while toast is displayed`                  | ✅ Pass                                    |
| AC-5   | Dismiss button closes toast                                                                                  | P1       | `AC-5 — positive: Dismiss button closes the toast before auto-dismissal`                             | ✅ Pass                                    |
| A11Y-1 | Initial load — no WCAG 2.1 AA violations                                                                     | P2       | `a11y — no violations on initial page load`                                                          | ✅ Pass (color-contrast excluded: TAB1-42) |
| A11Y-1 | Skeleton state — no WCAG 2.1 AA violations                                                                   | P2       | `a11y — no violations during loading skeleton state`                                                 | ✅ Pass (color-contrast excluded: TAB1-42) |
| A11Y-1 | Loaded state — no WCAG 2.1 AA violations                                                                     | P2       | `a11y — no violations in loaded/success state`                                                       | ✅ Pass (color-contrast excluded: TAB1-42) |
| A11Y-1 | Error state — no WCAG 2.1 AA violations                                                                      | P2       | `a11y — no violations in error state`                                                                | ✅ Pass (color-contrast excluded: TAB1-42) |
| A11Y-1 | Toast-visible state — no WCAG 2.1 AA violations                                                              | P2       | `a11y — no violations while toast is visible`                                                        | ✅ Pass (color-contrast excluded: TAB1-42) |
| PERF-1 | Page load ≤ budget (DOMContentLoaded < 6000 ms, load < 12000 ms)                                             | P2       | `performance @performance — initial load is within budget`                                           | ✅ Pass                                    |

---

## Defects

| ID      | Summary                                                                           | Severity | Status | Blocks In Review?                                                                                                              |
| ------- | --------------------------------------------------------------------------------- | -------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| TAB1-42 | [A11Y] Insufficient color contrast on `<code>` elements — 4.39:1 (requires 4.5:1) | Serious  | Open   | No — excluded in tests; does not block In Review. Must be fixed before Done if policy treats Serious a11y as release-blocking. |

---

## Coverage Summary

| AC                      | Positive | Negative | Boundary | Status |
| ----------------------- | -------- | -------- | -------- | ------ |
| AC-1 Skeleton lifecycle | 1        | 1        | 1        | ✅     |
| AC-2 Delayed articles   | 2        | 1        | 1        | ✅     |
| AC-3 Ticker poll        | 2        | 1        | 1        | ✅     |
| AC-4 Error state        | 3        | 1        | 1        | ✅     |
| AC-5 Toast              | 3        | 1        | 1        | ✅     |
| A11Y-1 All states       | 5        | —        | —        | ✅     |
| PERF-1 Load budget      | 1        | —        | —        | ✅     |
| **Total**               | **17**   | **6**    | **5**    | **27** |

---

## AC Traceability (JIRA ACs → spec coverage)

- ✅ AC-1: Skeleton visible immediately → replaced by articles
- ✅ AC-2: Articles via `waitFor`/`toBeVisible` — zero `waitForTimeout` calls
- ✅ AC-3: `expect.poll()` on 2 s ticker
- ✅ AC-4: Error state via "Load with error"
- ✅ AC-5: Transient toast captured before dismissal
- ✅ AC-6 (implied): All final assertions run after async operation fully settled — no premature evaluation (verified by boundary tests in AC-1 and AC-2 measuring elapsed time)
