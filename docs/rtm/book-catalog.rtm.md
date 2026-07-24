# Requirements Traceability Matrix — Book Catalog (TAB1-67)

| Field        | Value                                                              |
| ------------ | ------------------------------------------------------------------ |
| JIRA story   | [TAB1-67](https://orhunakkan.atlassian.net/browse/TAB1-67)         |
| Spec         | `tests/book-catalog/book-catalog.spec.ts`                          |
| POM          | `pages/book-catalog.page.ts`                                       |
| Test plan    | `docs/test-plan/book-catalog.test-plan.md`                         |
| Local run    | 35 / 35 passing (Desktop Edge — the only project this lab runs on) |
| Open defects | 0                                                                  |

---

## Requirement → Test Case Map

| Req ID | Requirement                                                                        | Priority | Test Case(s)                                                                                          | Status  |
| ------ | ---------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------- | ------- |
| AC-1   | Authors tab auto-runs its SELECT on load, no sign-in required, seeded rows shown   | P1       | `AC-1 — positive: seeded author rows and total are visible without clicking Run Query`                | ✅ Pass |
| AC-1   | Literal SELECT SQL executed is displayed                                           | P1       | `AC-1 — positive: the literal SELECT SQL executed is displayed`                                       | ✅ Pass |
| AC-1-N | No sign-in/authentication control anywhere on the page                             | P2       | `AC-1 — negative: no sign-in or authentication control is present anywhere on the page`               | ✅ Pass |
| AC-2   | Searching Authors by name filters count and matches the term                       | P1       | `AC-2 — positive: searching Authors by name filters the count and matches the term`                   | ✅ Pass |
| AC-2   | Searching Books by title filters count and matches the term                        | P1       | `AC-2 — positive: searching Books by title filters the count and matches the term`                    | ✅ Pass |
| AC-2-N | A name with no matches shows the Authors no-results message                        | P2       | `AC-2 — negative: a name with no matches shows the Authors no-results message`                        | ✅ Pass |
| AC-2-B | Clearing the search after a filter restores the full result set                    | P2       | `AC-2 — boundary: clearing the search after a filter restores the full result set`                    | ✅ Pass |
| AC-3   | Authors Country dropdown filter — every row matches                                | P1       | `AC-3 — positive: Authors filtered by Country shows only rows matching that country`                  | ✅ Pass |
| AC-3   | Books Genre dropdown filter — every row matches                                    | P1       | `AC-3 — positive: Books filtered by Genre shows only rows matching that genre`                        | ✅ Pass |
| AC-3-N | Switching the filter back to "All" clears it and restores the full result set      | P2       | `AC-3 — negative: switching the filter back to "All" clears it and restores the full result set`      | ✅ Pass |
| AC-4   | Catalog tab SQL text shows a JOIN between Books and Authors                        | P1       | `AC-4 — positive: displayed SQL text shows a JOIN between Books and Authors`                          | ✅ Pass |
| AC-4   | Filtering by author country narrows the joined result to that country only         | P1       | `AC-4 — positive: filtering by author country narrows the joined result to that country only`         | ✅ Pass |
| AC-4-N | A genre + country combination with no matches shows the catalog no-results message | P2       | `AC-4 — negative: a genre + country combination with no matches shows the catalog no-results message` | ✅ Pass |
| AC-5   | Authors sorted ascending by Name / Birth year                                      | P1       | `AC-5 — positive: Authors sorted ascending by Name` / `... by Birth year`                             | ✅ Pass |
| AC-5   | Books sorted ascending by Title / Published year / Rating                          | P1       | `AC-5 — positive: Books sorted ascending by Title` / `... Published year` / `... Rating`              | ✅ Pass |
| AC-5   | Catalog sorted ascending by Title / Published year / Rating                        | P1       | `AC-5 — positive: Catalog sorted ascending by Title` / `... Published year` / `... Rating`            | ✅ Pass |
| AC-5-B | Toggling the direction button reverses the sort order                              | P2       | `AC-5 — boundary: toggling the direction button reverses the sort order`                              | ✅ Pass |
| AC-6   | Next navigates forward and changes row content; indicator updates                  | P1       | `AC-6 — positive: Next navigates forward and changes row content; indicator updates`                  | ✅ Pass |
| AC-6   | Prev navigates back and restores the original first row                            | P1       | `AC-6 — positive: Prev navigates back and restores the original first row`                            | ✅ Pass |
| AC-6-B | Prev disabled on first page, Next disabled on last page                            | P2       | `AC-6 — boundary: Prev is disabled on the first page, Next is disabled on the last page`              | ✅ Pass |
| AC-6   | Pagination reflects a filtered Run Query, not just the unfiltered set              | P1       | `AC-6 — positive: pagination reflects a filtered Run Query, not just the unfiltered set`              | ✅ Pass |
| AC-7   | SQL-injection-style search returns zero rows with no error state                   | P1       | `AC-7 — positive: injection-style search returns zero rows with no error state`                       | ✅ Pass |
| AC-7   | A normal search afterward still returns correct results (data/app unaffected)      | P1       | `AC-7 — positive: a normal search afterward still returns correct results (data/app unaffected)`      | ✅ Pass |
| AC-8   | Accepting the dialog resets both tables to the seeded state (12 authors, 30 books) | P1       | `AC-8 — positive: accepting the dialog resets both tables to the seeded state (12 authors, 30 books)` | ✅ Pass |
| AC-8-N | Dismissing the dialog leaves the currently displayed data unchanged                | P1       | `AC-8 — negative: dismissing the dialog leaves the currently displayed data unchanged`                | ✅ Pass |
| A11Y-1 | No WCAG 2.x violations on initial page load (Authors tab)                          | P1       | `accessibility — no violations on initial page load (Authors tab)`                                    | ✅ Pass |
| A11Y-2 | No WCAG 2.x violations after a search returns results                              | P1       | `accessibility — no violations after a search returns results`                                        | ✅ Pass |
| A11Y-3 | No WCAG 2.x violations in the no-results state                                     | P2       | `accessibility — no violations in the no-results state`                                               | ✅ Pass |
| A11Y-4 | No WCAG 2.x violations on the Catalog (JOIN) tab                                   | P2       | `accessibility — no violations on the Catalog (JOIN) tab`                                             | ✅ Pass |
| PERF-1 | Initial load within budget (DOMContentLoaded < 8 s, load < 15 s)                   | P2       | `performance @performance — initial load is within budget`                                            | ✅ Pass |

---

## Defects

| ID  | Summary          | Severity | Status | Blocks In Review? |
| --- | ---------------- | -------- | ------ | ----------------- |
| —   | No defects filed | —        | —      | No                |

---

## Notes

- **Browser scope decision (not a defect):** Book Catalog is backed by one real, shared,
  persistent Azure SQL database with no per-session isolation. Confirmed directly that running
  this spec against all 4 browser projects simultaneously (as CI's parallel matrix jobs would)
  causes cross-job races on the shared Reset/reseed endpoint — observed corrupted row counts
  (e.g. "24 total" = 2×12 duplicated rows) that had nothing to do with the test logic itself
  (all 35 tests pass cleanly when only one project runs). Fixed at the config level:
  `playwright.config.ts` scopes this lab to **Desktop Edge only** via `testIgnore` on the other
  3 projects — the same class of decision as the existing Service Workers → Desktop Safari
  exclusion (TAB1-53). The other 3 projects report "0 tests" for this lab, which the existing
  CI workflow already treats as a no-op success.
- The backend's serverless compute can cold-start-503 on first contact after idle (observed
  directly while mapping this lab). `reseedCatalog()` in the spec polls via `expect.poll` past
  a transient 503 before each test, both working around the cold start and guaranteeing the
  deterministic 12-author/30-book seed state AC-8 depends on.
- All 8 JIRA ACs covered, including the SQL-injection safety probe (AC-7) as a security-tagged
  case. CI run on Desktop Edge required to gate story → Done.
