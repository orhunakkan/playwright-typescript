# Requirements Traceability Matrix — Accessible Locators (TAB1-15)

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| JIRA story   | [TAB1-15](https://orhunakkan.atlassian.net/browse/TAB1-15) |
| Spec         | `tests/accessible-locators/accessible-locators.spec.ts`    |
| POM          | `pages/accessible-locators.page.ts`                        |
| Test plan    | `docs/test-plan/accessible-locators.test-plan.md`          |
| Local run    | 37 / 37 passing (Desktop Chrome)                           |
| Open defects | 0                                                          |

---

## Requirement → Test Case Map

| Req ID | Requirement                                                                                                        | Priority | Test Case(s)                                                                                                     | Status  |
| ------ | ------------------------------------------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------- | ------- |
| AC-1   | Tests locate elements exclusively via `getByRole`, `getByLabel`, `getByAltText`, `getByText` — no CSS/testId/XPath | P1       | `AC-1 — positive: page heading is reachable via getByRole`                                                       | ✅ Pass |
| AC-1   | Search input reachable via `getByLabel`                                                                            | P1       | `AC-1 — positive: search input is reachable via getByLabel`                                                      | ✅ Pass |
| AC-1   | Genre filter reachable via `getByLabel`                                                                            | P1       | `AC-1 — positive: genre filter is reachable via getByLabel`                                                      | ✅ Pass |
| AC-1   | Book cards exposed as `article` landmarks                                                                          | P1       | `AC-1 — positive: each book card is represented as an article landmark`                                          | ✅ Pass |
| AC-1   | Status element reachable via `getByRole('status')`                                                                 | P1       | `AC-1 — positive: books count status element is reachable via getByRole status`                                  | ✅ Pass |
| AC-1-N | No CSS selector, data-testid, or XPath in any locator                                                              | P1       | `AC-1 — negative: no assertion relies on CSS selectors, test IDs, or XPath`                                      | ✅ Pass |
| AC-2   | Assert only on "Available" books using `locator.filter` — no hardcoded row indices                                 | P1       | `AC-2 — positive: can isolate Available books without hardcoding indices`                                        | ✅ Pass |
| AC-2   | Every card in Available subset actually contains "Available"                                                       | P1       | `AC-2 — positive: every card in the Available subset contains the text "Available"`                              | ✅ Pass |
| AC-2-N | Checked-out books excluded from Available filter                                                                   | P2       | `AC-2 — negative: checked-out books are excluded from the Available filter`                                      | ✅ Pass |
| AC-2-B | Empty Available set handled gracefully (count ≥ 0)                                                                 | P2       | `AC-2 — boundary: Available filter returns empty set gracefully when no books are available`                     | ✅ Pass |
| AC-3   | Click genre filter button; assert all visible books match selected genre                                           | P1       | `AC-3 — positive: selecting a genre shows only books of that genre`                                              | ✅ Pass |
| AC-3-N | After genre filter, books of other genres are absent                                                               | P2       | `AC-3 — negative: books of other genres are absent after genre filter applied`                                   | ✅ Pass |
| AC-3-B | Selecting "All" restores full book list                                                                            | P2       | `AC-3 — boundary: selecting All restores the full book list`                                                     | ✅ Pass |
| AC-3-B | Genre with single book returns exactly one card                                                                    | P2       | `AC-3 — boundary: genre with a single book returns exactly one card`                                             | ✅ Pass |
| AC-4   | Locate book cover image by alt text via `getByAltText`; assert `toBeVisible`                                       | P1       | `AC-4 — positive: Clean Code cover located by alt text and is visible`                                           | ✅ Pass |
| AC-4   | The Pragmatic Programmer cover visible via `getByAltText`                                                          | P1       | `AC-4 — positive: The Pragmatic Programmer cover located by alt text and is visible`                             | ✅ Pass |
| AC-4   | Design Patterns cover visible via `getByAltText`                                                                   | P1       | `AC-4 — positive: Design Patterns cover located by alt text and is visible`                                      | ✅ Pass |
| AC-4   | Refactoring cover visible via `getByAltText`                                                                       | P1       | `AC-4 — positive: Refactoring cover located by alt text and is visible`                                          | ✅ Pass |
| AC-4   | All six book covers visible via `getByAltText`                                                                     | P1       | `AC-4 — positive: all six book covers are visible via getByAltText`                                              | ✅ Pass |
| AC-4-N | `getByAltText` with wrong alt text returns no element                                                              | P2       | `AC-4 — negative: getByAltText with incorrect alt text returns no visible element`                               | ✅ Pass |
| AC-4-B | All covers have non-empty alt text (verified by `getByAltText` resolution)                                         | P3       | `AC-4 — boundary: all book cover images have non-empty alt text`                                                 | ✅ Pass |
| AC-5   | Scope button clicks to a specific book card using chained locators                                                 | P1       | `AC-5 — positive: Add to wishlist on Clean Code card is visible and enabled`                                     | ✅ Pass |
| AC-5   | Pragmatic Programmer card button independently accessible                                                          | P1       | `AC-5 — positive: Add to wishlist on The Pragmatic Programmer card is visible and enabled`                       | ✅ Pass |
| AC-5   | Clicking Clean Code button does not affect Pragmatic Programmer card                                               | P1       | `AC-5 — positive: clicking Add to wishlist on Clean Code does not click the Pragmatic Programmer card button`    | ✅ Pass |
| AC-5-B | Each of the six book cards exposes its own Add to wishlist button independently                                    | P2       | `AC-5 — boundary: each book card exposes its own Add to wishlist button independently`                           | ✅ Pass |
| AC-5-N | View details link scoped to Clean Code does not resolve to Pragmatic Programmer                                    | P2       | `AC-5 — negative: View details link scoped to Clean Code card does not resolve to the Pragmatic Programmer card` | ✅ Pass |
| AC-6   | Search input filters displayed book list                                                                           | P1       | `AC-6 — positive: searching a known book title shows only matching cards`                                        | ✅ Pass |
| AC-6   | Result count updates after search                                                                                  | P1       | `AC-6 — positive: result count updates after search`                                                             | ✅ Pass |
| AC-6-N | Non-matching search → empty results                                                                                | P2       | `AC-6 — negative: searching a non-existent title yields an empty book list`                                      | ✅ Pass |
| AC-6-N | Status reflects 0 results ("No books found.") on no-match search                                                   | P2       | `AC-6 — negative: result count reflects 0 matching books for a no-match search`                                  | ✅ Pass |
| AC-6-B | Clearing search restores full book list                                                                            | P2       | `AC-6 — boundary: clearing search restores the full book list`                                                   | ✅ Pass |
| AC-6-B | Single character search narrows list without error                                                                 | P2       | `AC-6 — boundary: single character search narrows the list without error`                                        | ✅ Pass |
| AC-6-B | Search with leading/trailing spaces handled gracefully                                                             | P2       | `AC-6 — boundary: search with leading and trailing spaces is handled gracefully`                                 | ✅ Pass |
| A11Y-1 | No WCAG 2.1 AA violations on initial page load                                                                     | P2       | `a11y — no violations on initial page load`                                                                      | ✅ Pass |
| A11Y-1 | No WCAG 2.1 AA violations in genre-filtered state                                                                  | P2       | `a11y — no violations in genre-filtered state`                                                                   | ✅ Pass |
| A11Y-1 | No WCAG 2.1 AA violations in search-results state                                                                  | P2       | `a11y — no violations in search-results state`                                                                   | ✅ Pass |
| PERF-1 | Page load within 3 s budget (DOMContentLoaded + load < 3000 ms)                                                    | P2       | `performance @performance — initial load is within 3 s budget`                                                   | ✅ Pass |

---

## Defects

| ID      | Summary                                                                             | Severity | Status  | Blocks In Review?                                                                |
| ------- | ----------------------------------------------------------------------------------- | -------- | ------- | -------------------------------------------------------------------------------- |
| TAB1-43 | [A11Y] Insufficient color contrast on "Checked out" badge — 4.36:1 (requires 4.5:1) | Serious  | ✅ Done | Fixed — `filterKnown` exclusion removed from tests; all 3 axe states pass clean. |

---

## Coverage Summary

| AC        | Requirement                        | Positive | Negative | Boundary | Status |
| --------- | ---------------------------------- | -------- | -------- | -------- | ------ |
| AC-1      | Semantic-only locators             | 5        | 1        | 0        | ✅     |
| AC-2      | Available books via locator.filter | 2        | 1        | 1        | ✅     |
| AC-3      | Genre filter                       | 1        | 1        | 2        | ✅     |
| AC-4      | Book cover via getByAltText        | 5        | 1        | 1        | ✅     |
| AC-5      | Chained card-scoped locators       | 3        | 1        | 1        | ✅     |
| AC-6      | Search input filtering             | 2        | 2        | 3        | ✅     |
| A11Y      | Accessibility (3 states)           | 3        | —        | —        | ✅     |
| PERF      | Performance budget                 | 1        | —        | —        | ✅     |
| **Total** |                                    | **22**   | **7**    | **8**    | ✅ 37  |
