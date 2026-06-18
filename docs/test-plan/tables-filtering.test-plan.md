# Test Plan: Tables & Filtering

**JIRA Story:** [TAB1-16](https://orhunakkan.atlassian.net/browse/TAB1-16)  
**Lab URL:** https://stagecraftlabs.com/practice/tables-filtering  
**Date:** 2026-06-18  
**Author:** Orhun Akkan

---

## 1. Scope

### In Scope

- Initial visible row count using `locator.count()`
- Search-field filtering with per-row content verification via `locator.filter()`
- Combined search + Department dropdown filtering (intersection assertion)
- Sortable column header: ascending/descending toggle with first/last row assertions
- Pagination: page navigation and active page indicator update
- Row-scoped action button click via `getByRole('row').filter()` without position-based selectors
- Accessibility scans in load, search-filtered, and post-department-filter states
- Performance budget (page load < 3 s)

### Out of Scope

- Action menu item functionality beyond opening (Edit / Remove actions)
- Authentication or session persistence
- Backend API or data persistence validation

---

## 2. Test Objectives

| #   | Objective                                                                                            |
| --- | ---------------------------------------------------------------------------------------------------- |
| 1   | `locator.count()` returns 7 visible rows on page 1 (23 total employees) before any filter            |
| 2   | Typing in the search field narrows visible rows; every visible row contains the search term          |
| 3   | Applying search + Department dropdown together shows only rows matching both criteria                |
| 4   | Clicking a sortable column header re-orders rows; first and last rows match expected sort values     |
| 5   | Clicking a page number navigates to that page; row content changes; correct page indicator is active |
| 6   | Clicking an action button scoped to a named row opens that row's menu without relying on row index   |

---

## 3. Browser Matrix

| Browser         | Playwright Project | Priority |
| --------------- | ------------------ | -------- |
| Chromium        | Desktop Chrome     | P1       |
| Firefox         | Desktop Firefox    | P1       |
| WebKit (Safari) | Desktop Safari     | P2       |
| Edge            | Desktop Edge       | P2       |

Source: `playwright.config.ts` — 4 desktop projects configured.

---

## 4. Environments

| Environment | Base URL                   |
| ----------- | -------------------------- |
| Default     | https://stagecraftlabs.com |

Source: `.env` → `BASE_URL=https://stagecraftlabs.com`

---

## 5. Dataset Reference (observed 2026-06-18)

| Page | Employees (Name — Department — Status)                                                                                                       |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | Alice Chen (Eng), Bob Smith (Design), Carol Davis (Eng), David Lee (Product), Eva Martinez (Eng), Frank Wilson (Sales), Grace Kim (Design)   |
| 2    | Hank Patel (Eng), Iris Johnson (HR), Jack Brown (Product), Karen White (Eng), Leo Garcia (Sales), Mia Thompson (Design), Noah Anderson (Eng) |
| 3    | Olivia Taylor (HR), Paul Harris (Eng), Quinn Moore (Product), Rachel Clark (Sales), Sam Lewis (Eng), Tina Robinson (Design), Uma Scott (Eng) |
| 4    | Victor Young (Sales), Wendy Hall (HR)                                                                                                        |

Total: **23 employees**, **4 pages** (7 per page except last: 2 rows).

Name sort: ascending → Alice Chen first, Wendy Hall last; descending → Wendy Hall first, Alice Chen last.

---

## 6. Risk Table

| Risk                                                 | Priority | Mitigation                                                                       |
| ---------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| Row count changes if dataset is modified server-side | P1       | Assert count equals the known total (23); if it changes, test fails deliberately |
| Sort aria-label changes across sort states           | P1       | Regex `/Sort by name/` — matches regardless of ascending/descending suffix       |
| Search case-sensitivity                              | P2       | Use mixed-case search terms matching known names exactly                         |
| Pagination active button class varies by browser/CSS | P2       | Assert page indicator text ("Page 2 of 4"), not CSS class                        |
| Action menu z-index obscures rows during axe scan    | P3       | Close menu (Escape key) before running axe                                       |

---

## 7. Entry Criteria

- `https://stagecraftlabs.com/practice/tables-filtering` is reachable and returns HTTP 200
- Table loads with at least 1 data row before any test step
- All configured browser environments are available

## 8. Exit Criteria

- All 6 ACs covered by at least one positive test case
- Each AC has at least one negative or boundary test
- Axe scan passes in load, search-filtered, and department-filtered states
- Performance test asserts load < 3 s
- All tests pass locally on Desktop Chrome
- CI run passes across all 4 configured browsers (gates story → Done)

---

## 9. Test Case Summary

| AC   | Test Cases                                                                                        | Types              |
| ---- | ------------------------------------------------------------------------------------------------- | ------------------ |
| AC-1 | Count 7 visible rows on load; count decreases after search filter                                 | Positive, Boundary |
| AC-2 | Search "Chen" → 1 row, row contains "Chen"; empty search → all 7 rows restored                    | Positive, Boundary |
| AC-3 | Search "Noah" + Dept "Engineering" → 1 row; Dept "All" + search yields search-only result         | Positive, Negative |
| AC-4 | Default sort ascending → first row "Alice Chen"; click sort → descending → first row "Wendy Hall" | Positive, Negative |
| AC-5 | Click page 2 → indicator "Page 2 of 4", first row "Hank Patel"; page 4 → 2 rows (boundary)        | Positive, Boundary |
| AC-6 | Click action for "Carol Davis" row → "Carol Davis actions" menu visible; Bob Smith menu absent    | Positive, Negative |
| A11Y | Axe WCAG 2.1 AA: load state, post-search, post-department-filter                                  | Accessibility      |
| PERF | Page load < 3 s via `PerformanceNavigationTiming`                                                 | Performance        |
