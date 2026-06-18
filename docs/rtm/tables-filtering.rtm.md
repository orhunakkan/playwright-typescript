# Requirements Traceability Matrix — Tables & Filtering (TAB1-16)

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| JIRA story   | [TAB1-16](https://orhunakkan.atlassian.net/browse/TAB1-16) |
| Spec         | `tests/tables-filtering/tables-filtering.spec.ts`          |
| POM          | `pages/tables-filtering.page.ts`                           |
| Test plan    | `docs/test-plan/tables-filtering.test-plan.md`             |
| Local run    | 122 / 124 passing (93 non-Firefox; 2 Firefox env flakes)   |
| Open defects | 0                                                          |

---

## Requirement → Test Case Map

| Req ID | Requirement                                                                                                  | Priority | Test Case(s)                                                                                | Status  |
| ------ | ------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------- | ------- |
| AC-1   | Count visible rows before any filter using `locator.count()`                                                 | P1       | `AC-1 — positive: 7 rows visible on page 1 before any filter`                               | ✅ Pass |
| AC-1   | Status element reports total employee count                                                                  | P1       | `AC-1 — positive: status element reports total employee count`                              | ✅ Pass |
| AC-1-B | Row count decreases after a search filter is applied                                                         | P1       | `AC-1 — boundary: row count decreases after a search filter is applied`                     | ✅ Pass |
| AC-1-B | Clearing search restores original row count                                                                  | P2       | `AC-1 — boundary: clearing search restores original row count`                              | ✅ Pass |
| AC-2   | Typing in search field narrows visible rows; every visible row contains the search term (checked via filter) | P1       | `AC-2 — positive: typing a name shows only matching rows via filter check`                  | ✅ Pass |
| AC-2   | Search result row contains the expected employee name                                                        | P1       | `AC-2 — positive: search result row contains the expected employee name`                    | ✅ Pass |
| AC-2-N | Searching a non-existent name yields zero employee rows                                                      | P1       | `AC-2 — negative: searching a non-existent name yields zero rows`                           | ✅ Pass |
| AC-2-B | Empty search string restores full row list                                                                   | P2       | `AC-2 — boundary: empty search string shows all rows`                                       | ✅ Pass |
| AC-2-B | Single-character search narrows the list without error                                                       | P3       | `AC-2 — boundary: single-character search narrows the list without error`                   | ✅ Pass |
| AC-3   | Applying search + Department dropdown shows only rows matching both criteria                                 | P1       | `AC-3 — positive: search + department dropdown shows only rows matching both criteria`      | ✅ Pass |
| AC-3-N | Employee matching search but not department is hidden                                                        | P1       | `AC-3 — negative: employee matching search but not department is hidden`                    | ✅ Pass |
| AC-3-N | Employee matching department but not search is hidden                                                        | P1       | `AC-3 — negative: employee matching department but not search is hidden`                    | ✅ Pass |
| AC-3-B | Department "All" + search acts as search-only filter                                                         | P2       | `AC-3 — boundary: Department "All" with a search term acts as search-only filter`           | ✅ Pass |
| AC-4   | Default sort is ascending by name — first row is Alice Chen                                                  | P1       | `AC-4 — positive: default sort is ascending by name — first row is Alice Chen`              | ✅ Pass |
| AC-4   | Clicking name sort switches to descending — first row becomes Wendy Hall                                     | P1       | `AC-4 — positive: clicking name sort switches to descending — first row becomes Wendy Hall` | ✅ Pass |
| AC-4   | After descending sort, last page last row is Alice Chen                                                      | P1       | `AC-4 — positive: after descending sort, last page last row is Alice Chen`                  | ✅ Pass |
| AC-4-N | Sort direction reverses on second click — returns to ascending                                               | P2       | `AC-4 — negative: sort direction reverses on second click — returns to ascending`           | ✅ Pass |
| AC-5   | Clicking page 2 updates row content (first row becomes Hank Patel)                                           | P1       | `AC-5 — positive: clicking page 2 updates row content`                                      | ✅ Pass |
| AC-5   | Page indicator reflects the active page ("Page 2 of 4")                                                      | P1       | `AC-5 — positive: page indicator reflects the active page`                                  | ✅ Pass |
| AC-5   | Previous button is disabled on page 1                                                                        | P1       | `AC-5 — positive: Previous button is disabled on page 1`                                    | ✅ Pass |
| AC-5   | Next button navigates forward one page                                                                       | P1       | `AC-5 — positive: Next button navigates forward one page`                                   | ✅ Pass |
| AC-5-B | Last page (4) shows fewer rows than a full page (< 7)                                                        | P2       | `AC-5 — boundary: last page (page 4) shows fewer rows than full page`                       | ✅ Pass |
| AC-5-B | Navigating back to page 1 restores original rows                                                             | P2       | `AC-5 — boundary: navigating back to page 1 restores original rows`                         | ✅ Pass |
| AC-6   | Action button scoped to Carol Davis row opens that row's menu                                                | P1       | `AC-6 — positive: action button scoped to Carol Davis row opens that row menu`              | ✅ Pass |
| AC-6   | Action menu contains Edit and Remove items                                                                   | P1       | `AC-6 — positive: action menu contains Edit and Remove items`                               | ✅ Pass |
| AC-6-N | Clicking Carol Davis action button does not open Bob Smith menu                                              | P1       | `AC-6 — negative: clicking Carol Davis action button does not open Bob Smith menu`          | ✅ Pass |
| AC-6-N | Action button for page-2 employee is not present on page 1                                                   | P2       | `AC-6 — negative: action button for non-visible employee (page 2) is not present on page 1` | ✅ Pass |
| A11Y-1 | No WCAG 2.1 AA violations on initial page load                                                               | P1       | `accessibility — no violations on initial page load`                                        | ✅ Pass |
| A11Y-2 | No WCAG 2.1 AA violations after search filter applied                                                        | P1       | `accessibility — no violations after search filter applied`                                 | ✅ Pass |
| A11Y-3 | No WCAG 2.1 AA violations after department filter applied                                                    | P2       | `accessibility — no violations after department filter applied`                             | ✅ Pass |
| PERF-1 | Page load within 3 s budget (DOMContentLoaded + load < 3000 ms)                                              | P2       | `performance @performance — initial load is within 3 s budget`                              | ✅ Pass |

---

## Defects

| ID  | Summary          | Severity | Status | Blocks In Review? |
| --- | ---------------- | -------- | ------ | ----------------- |
| —   | No defects filed | —        | —      | No                |

---

## Notes

- `tableBodyRows` POM locator uses `filter({ has: page.locator('td button') })` to exclude the "No employees match your filters." no-results row, which renders as a single `<td>` with no buttons.
- Firefox worker occasionally throws `NS_ERROR_ABORT` on `page.goto` (infrastructure flake, not a product defect). Both affected Firefox tests pass on retry.
- All 6 JIRA ACs covered; CI run across Desktop Chrome / Firefox / Edge / Safari required to gate story → Done.
