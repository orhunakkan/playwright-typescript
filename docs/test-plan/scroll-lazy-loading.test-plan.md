# Test Plan: Scroll & Lazy Loading

**JIRA Story:** [TAB1-33](https://orhunakkan.atlassian.net/browse/TAB1-33)
**Lab URL:** https://stagecraftlabs.com/practice/scroll-lazy-loading
**Date:** 2026-07-12
**Author:** Orhun Akkan

---

## 1. Scope

### In Scope

- Asserting the first 8 activity feed items are visible immediately after initial page load
- Scrolling the sentinel element into view to trigger the `IntersectionObserver` and confirming
  page-2 items (`data-item-id="9"`..`"16"`) appear in the DOM
- Repeated scroll-to-sentinel cycles until the `data-testid="end-marker"` ("You're all caught up")
  becomes visible, confirming all 6 pages (42 items total) have been fetched
- `locator.scrollIntoViewIfNeeded()` on a specific loaded item (e.g. item #30) plus
  `expect(locator).toBeInViewport()`
- `page.route("/api/feed*", ...)` stubbing the paginated endpoint with controlled fixture data and
  asserting only the stubbed items render
- Negative/boundary coverage: no premature page-2 items before scroll, end marker absent while
  pages remain, an out-of-range item locator resolving to zero elements, stubbed empty/single-item
  pages, real network data not leaking through an active stub
- Accessibility scan across load, mid-scroll, and end-of-feed states
- Performance budget for initial load and for a single lazy-load fetch cycle

### Out of Scope

- The "Jump to Item" widget's internal behavior — the JIRA ACs and lab guidance specify using
  `locator.scrollIntoViewIfNeeded()` directly in test code, not driving the on-page Jump control
- Virtualized/windowed rendering (the lab keeps all fetched items in the DOM; nothing is unmounted)
- Backend pagination implementation details beyond the documented `/api/feed` contract

---

## 2. Test Objectives

| #   | Objective                                                                                      |
| --- | ---------------------------------------------------------------------------------------------- |
| 1   | The initial fetch renders exactly the first 8 feed items without requiring any scroll          |
| 2   | Scrolling the sentinel into view triggers the `IntersectionObserver` and fetches the next page |
| 3   | Repeated scrolling exhausts all pages and surfaces the "all caught up" end marker              |
| 4   | A specific loaded item can be brought into the viewport via `scrollIntoViewIfNeeded()`         |
| 5   | `page.route` can fully stub the feed endpoint so tests are independent of the real backend     |

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
| QA          | `.env.qa` → `BASE_URL`     |
| UAT         | `.env.uat` → `BASE_URL`    |

---

## 5. Risk Table

| Risk                                                                                                                                          | Priority | Mitigation                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `IntersectionObserver` requires the sentinel to actually enter the viewport, not merely exist in the DOM                                      | P1       | Use `locator.scrollIntoViewIfNeeded()`/`scrollIntoView()` on the sentinel and await the resulting network fetch before asserting |
| The sentinel element is replaced by the end-marker once `hasMore` is false — a cached sentinel locator goes stale                             | P1       | Re-query the sentinel/end-marker each scroll iteration rather than caching a single locator reference                            |
| Stubbing `/api/feed*` must intercept every page request, not just the first, or real data leaks through after the stub's fixture is exhausted | P1       | Register the route stub before navigation and have the handler serve deterministically for any requested page                    |
| Item #30 requires 4 pages to be loaded before its locator resolves                                                                            | P2       | Loop scroll-to-sentinel until `data-item-id="30"` locator count is 1 before asserting viewport                                   |
| Total item count (42) is a fixture-data assumption that could change if seed data is regenerated                                              | P2       | Assert against `hasMore`/end-marker visibility rather than hardcoding the total wherever possible                                |

---

## 6. Entry Criteria

- `https://stagecraftlabs.com/practice/scroll-lazy-loading` is reachable and returns HTTP 200
- The lab exposes an activity feed list, a scroll sentinel, and an end-of-feed marker
- `/api/feed` endpoint responds with `{ items, page, pageSize, total, hasMore }`
- `test-results/` output directory is writable

## 7. Exit Criteria

- All 5 ACs covered by at least one positive test case
- Each AC has at least one negative or boundary test where applicable
- Axe scan passes across load, mid-scroll, and end-of-feed states
- Performance tests assert initial load and a single lazy-load fetch complete within budget
- All tests pass locally on Desktop Chrome
- CI run passes across all 4 configured browsers (gates story → Done)

---

## 8. Test Case Summary

| AC     | Test Cases                                                                                | Types         |
| ------ | ----------------------------------------------------------------------------------------- | ------------- |
| AC-1   | First 8 activity feed items are visible after initial page load                           | Positive      |
| AC-1-N | No 9th (page-2) item is present before any scroll occurs                                  | Negative      |
| AC-1-B | Exactly item #8 is visible and item #9 is absent pre-scroll                               | Boundary      |
| AC-2   | Scrolling the sentinel into view triggers the observer and page-2 items appear in the DOM | Positive      |
| AC-2-B | Item #9 (first page-2 item) appears immediately once the sentinel intersects              | Boundary      |
| AC-3   | Repeated scrolling until the end marker is visible confirms all pages fetched             | Positive      |
| AC-3-N | The end marker is not visible while pages remain unfetched                                | Negative      |
| AC-4   | `scrollIntoViewIfNeeded()` brings item #30 into view; `toBeInViewport()` passes           | Positive      |
| AC-4-N | A locator for an item beyond the total count resolves to zero elements                    | Negative      |
| AC-5   | `page.route("/api/feed*")` stub renders only the stubbed items                            | Positive      |
| AC-5-N | Real/unstubbed items do not leak through while the route stub is active                   | Negative      |
| AC-5-B | A stubbed empty page and a stubbed single-item page both render correctly                 | Boundary      |
| A11Y   | Axe WCAG 2.1 AA scan across load, mid-scroll, and end-of-feed states                      | Accessibility |
| PERF   | Initial load and a single lazy-load fetch cycle complete within budget                    | Performance   |
