# Test Plan: Book Catalog

**JIRA Story:** [TAB1-67](https://orhunakkan.atlassian.net/browse/TAB1-67)
**Lab URL:** https://stagecraftlabs.com/practice/book-catalog
**Date:** 2026-07-24
**Author:** Orhun Akkan

---

## 1. Scope

### In Scope

- Authors tab: auto-run SELECT on load, literal SQL text display, no sign-in required
- Search (Authors by name, Books by title) via "Run Query", including a SQL-injection-style
  literal-substring probe (`' OR '1'='1' --`) followed by a normal search to prove app/data health
- Dropdown filtering: Country (Authors), Genre (Books), Genre + Author country (Catalog)
- Catalog (JOIN) tab: JOIN SQL text display, filtering by author country narrows joined rows
- Sort by every available column per tab, ascending/descending toggle, order asserted dynamically
- Pagination (Next/Prev) after a filtered Run Query, including last/first page boundary
- "Reset catalog data" button + confirm dialog (accept restores seeded state; dismiss leaves
  data untouched) — deterministic seed is 12 authors / 30 books
- Accessibility (axe, all states) and a performance budget

### Out of Scope

- Authentication (lab requires none — explicitly session/auth-independent)
- Any dependency on the retired Audit Log & Search lab or the Fake Auth lab's session/events
- Backend schema/migration validation — tests exercise the API surface only

---

## 2. Test Objectives

| #   | Objective                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------- |
| 1   | Authors tab auto-runs its SELECT on load with no sign-in, shows seeded rows and the literal SQL executed    |
| 2   | Searching Authors by name / Books by title after "Run Query" filters the count and matches the search term |
| 3   | Country/Genre dropdown filters constrain every returned row to the selected value                           |
| 4   | Catalog tab's JOIN SQL is displayed; filtering by author country narrows the joined result correctly        |
| 5   | Sorting by each column and toggling direction reorders rows, asserted without hardcoded expected values     |
| 6   | Paginating with Next/Prev after a filtered Run Query changes row content; boundaries disable the right button |
| 7   | A SQL-injection-style search string is treated as a safe literal substring (0 rows, no crash); app recovers  |
| 8   | "Reset catalog data" + confirm dialog: accept restores the 12/30 seeded state; dismiss leaves data unchanged |

---

## 3. Browser Matrix

| Browser | Playwright Project | Priority |
| ------- | ------------------- | -------- |
| Edge    | Desktop Edge         | P1       |

Source: `playwright.config.ts` — 4 desktop projects are configured for the suite overall, but
Book Catalog is scoped to **Desktop Edge only** via `testIgnore` on the other 3 projects. Reason:
this lab's backend is one real, shared, persistent Azure SQL database with no per-session
isolation. CI runs all 4 browser projects as separate, truly parallel jobs — confirmed directly
that running this spec against multiple projects simultaneously causes cross-job races on the
shared Reset/reseed endpoint (observed corrupted counts, e.g. "24 total" = 2×12 duplicated rows).
Same class of decision as the existing Service Workers → Desktop Safari exclusion (TAB1-53).

---

## 4. Environments

| Environment | Base URL                   |
| ------------ | --------------------------- |
| Default      | https://stagecraftlabs.com |

Source: `.env` → `BASE_URL=https://stagecraftlabs.com`

---

## 5. Dataset & API Reference (observed 2026-07-24)

- Seeded fixture: **12 authors**, **30 books** (`pageSize=10` → Authors 2 pages, Books/Catalog 3 pages)
- Endpoints: `GET /api/book-catalog/authors`, `GET /api/book-catalog/books`,
  `GET /api/book-catalog/catalog`, `POST /api/book-catalog/reseed`
  (query params: `page`, `pageSize`, `sort`, `direction`, `search`, `country`/`genre`)
- Response shape: `{ items[], page, pageSize, total, hasMore, sql }` — `sql` is the literal
  executed SQL text also rendered in the UI under "Query executed"
- No-results text is tab-specific: "No authors match this query." / "No books match this query."
  / "No catalog entries match this query."
- SQL injection probe `' OR '1'='1' --` is safely parameterized: UI renders the escaped literal
  (`LIKE '%'' OR ''1''=''1'' --%'`) and returns 0 rows — confirmed safe, not exploitable

---

## 6. Risk Table

| Risk                                                                                          | Priority | Mitigation                                                                                                     |
| ---------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| Azure SQL serverless cold start returns a transient 503 on the first request after idle        | P1       | Observed directly during locator mapping (503 then 200 on retry); rely on `expect.poll` / generous timeouts and the config's existing `retries: 1` rather than treating a single 503 as a defect |
| Backend is a real, shared, persistent DB — concurrent test workers/projects can race each other on Reset | P1       | Confirmed directly (corrupted counts under 4-way parallel runs). Fixed at the config level: `playwright.config.ts` scopes Book Catalog to Desktop Edge only via `testIgnore`, so no two CI jobs touch the shared backend concurrently. `test.describe.configure({ mode: 'serial' })` additionally keeps this spec's own tests from racing each other within that one project |
| Sort toggle button label is dynamic (Ascending ↑ / Descending ↓)                               | P2       | Locate by role + regex on both states, not a fixed string                                                       |
| Row order assertions must not hardcode data that a future reseed could change                  | P2       | Assert order via pairwise comparison of the actual returned values (e.g. birth years / ratings), not literal names |
| Confirm dialog (`window.confirm`) blocks the page until handled                                | P2       | Register `page.on('dialog')` / `page.once('dialog', ...)` before the triggering click                           |

---

## 7. Entry Criteria

- `https://stagecraftlabs.com/practice/book-catalog` is reachable and returns HTTP 200
- Authors tab loads seeded rows (after accounting for a possible one-time cold-start retry)
- All configured browser environments are available

## 8. Exit Criteria

- All 8 ACs covered by at least one positive test case
- Each AC has at least one negative or boundary test
- Axe scan passes in load, search-results, no-results, and reset-confirm-dialog states
- Performance test asserts load within budget
- All tests pass locally on Desktop Chrome
- CI run passes across all 4 configured browsers (gates story → Done)

## 9. Deliverables

`tests/book-catalog/book-catalog.spec.ts` · `pages/book-catalog.page.ts` ·
`docs/rtm/book-catalog.rtm.md` · this plan · CI run

## 10. Test Case Summary

| AC   | Test Cases                                                                                              | Types                        |
| ---- | ----------------------------------------------------------------------------------------------------------- | ----------------------------- |
| AC-1 | Authors tab shows 12 seeded rows + literal SELECT SQL on load; no sign-in performed                          | Positive                      |
| AC-2 | Search "Austen"/"Solitude"-style terms narrows count and matches term; empty/no-match search                 | Positive, Negative, Boundary  |
| AC-3 | Country/Genre dropdown filter — every row matches; "All" clears the filter                                   | Positive, Negative             |
| AC-4 | Catalog JOIN SQL displayed; author-country filter narrows joined rows; no-match combo → 0 rows               | Positive, Negative             |
| AC-5 | Sort each column asc/desc — order asserted via pairwise comparison, not hardcoded                            | Positive, Boundary             |
| AC-6 | Paginate Next/Prev after filtered Run Query — content changes; Next disabled on last page, Prev on first     | Positive, Boundary             |
| AC-7 | SQL-injection-style search → 0 rows, no crash; normal search afterward still works                            | Positive, Security             |
| AC-8 | Reset + accept → 12/30 seeded state restored; Reset + dismiss → data unchanged                               | Positive, Negative              |
| A11Y | Axe WCAG 2.x: load, search results, no-results, error, reset-confirm-dialog states                          | Accessibility                  |
| PERF | Initial load within budget via `PerformanceNavigationTiming`                                                 | Performance                    |
