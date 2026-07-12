# Requirements Traceability Matrix — Scroll & Lazy Loading

| Field      | Value                                                          |
| ---------- | --------------------------------------------------------------- |
| JIRA Story | [TAB1-33](https://orhunakkan.atlassian.net/browse/TAB1-33)     |
| Lab URL    | https://stagecraftlabs.com/practice/scroll-lazy-loading        |
| Spec file  | tests/scroll-lazy-loading/scroll-lazy-loading.spec.ts           |
| POM file   | pages/scroll-lazy-loading.page.ts                               |
| Last run   | 2026-07-12 — 72 / 72 passed (Chrome · Firefox · Edge · Safari) |
| Generated  | 2026-07-12                                                      |

---

## Coverage by Acceptance Criterion

| Req    | Acceptance Criterion                                                                       | Test Case                                                                                          | Type | Result |
| ------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---- | ------ |
| AC-1   | The first 8 activity feed items are visible after the initial page load                     | positive: the first 8 activity feed items are visible after initial page load                          | P    | ✅     |
| AC-1-N | No page-2 item is present before any scroll occurs                                          | negative/AC-1a: no page-2 item is present before any scroll occurs                                     | N    | ✅     |
| AC-1-B | Exactly item #8 is visible and item #9 is absent pre-scroll                                 | boundary/AC-1b: exactly item #8 is visible and item #9 is absent pre-scroll                            | B    | ✅     |
| AC-2   | Scrolling the sentinel into view triggers the observer; page-2 items appear in the DOM       | positive: scrolling to the sentinel triggers the observer and page-2 items appear in the DOM           | P    | ✅     |
| AC-2-B | Item #9 (first page-2 item) appears immediately once the sentinel intersects                | boundary/AC-2a: item #9 appears immediately once the sentinel intersects                               | B    | ✅     |
| AC-3   | Repeated scrolling until the end marker is visible confirms all pages fetched               | positive: repeated scrolling until the end marker is visible confirms all pages fetched                | P    | ✅     |
| AC-3-N | The end marker is not visible while pages remain unfetched                                   | negative/AC-3a: the end marker is not visible while pages remain unfetched                              | N    | ✅     |
| AC-4   | `scrollIntoViewIfNeeded()` brings item #30 into view; `toBeInViewport()` passes             | positive: scrollIntoViewIfNeeded() brings item #30 into view and toBeInViewport() passes               | P    | ✅     |
| AC-4-N | A locator for an item beyond the total count resolves to zero elements                      | negative/AC-4a: a locator for an item beyond the total count resolves to zero elements                 | N    | ✅     |
| AC-5   | `page.route("/api/feed*")` stub renders only the stubbed items                              | positive: stubbed feed data renders only the stubbed items                                             | P    | ✅     |
| AC-5-N | Real unstubbed items do not leak through while the route stub is active                     | negative/AC-5a: real unstubbed items do not leak through while the route stub is active                | N    | ✅     |
| AC-5-B | A stubbed empty page renders zero items and the end marker directly                          | boundary/AC-5b: a stubbed empty page renders zero items and the end marker directly                    | B    | ✅     |
| AC-5-B | A stubbed single-item page renders exactly that one item                                    | boundary/AC-5c: a stubbed single-item page renders exactly that one item                               | B    | ✅     |
| AXE    | No critical axe-core violations at initial load                                             | no violations at initial load                                                                          | A11y | ✅     |
| AXE    | No critical axe-core violations mid-scroll (after fetching page 2)                           | no violations mid-scroll (after fetching page 2)                                                       | A11y | ✅     |
| AXE    | No critical axe-core violations at end-of-feed (all pages fetched)                          | no violations at end-of-feed (all pages fetched)                                                       | A11y | ✅     |
| REQ-NF1 | Initial feed load must meet its performance budget                                          | initial feed load completes within budget                                                              | Perf | ✅     |
| REQ-NF2 | A single lazy-load fetch cycle must meet its performance budget                             | a single lazy-load fetch cycle completes within budget                                                 | Perf | ✅     |

---

## Defects

| ID       | Severity | Summary                                                                | Found by                    | JIRA                                                          | Status |
| -------- | -------- | ------------------------------------------------------------------------ | ---------------------------- | -------------------------------------------------------------- | ------ |
| TAB1-47  | Serious  | End-of-feed marker color contrast 3.5:1 vs 4.5:1 WCAG AA (`text-emerald-600` on `#fafafa`) | axe scan, all 4 browsers | [TAB1-47](https://orhunakkan.atlassian.net/browse/TAB1-47)     | Closed |

---

## Traceability Summary

- **ACs covered:** 5 / 5 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5)
- **Non-functional covered:** 2 / 2 (AXE across 3 states · Performance budget)
- **Test cases:** 18 (P:5 · N:4 · B:4 · A11y:3 · Perf:2) × 4 browsers = **72 total**
- **API coverage:** all 3 JIRA-listed APIs exercised — `locator.scrollIntoViewIfNeeded()` + `expect(locator).toBeInViewport()` (AC-4), `page.route()` (AC-5)
- **Known engine quirk:** the sentinel `<div>` is recreated by React on every fetch, which races Playwright's locator-based actionability checks ("element is not attached to the DOM"); tests trigger the scroll via the sentinel's native `scrollIntoView()` in `page.evaluate()` instead of a locator action
- **Open defects:** 0 (TAB1-47 fixed and verified 2026-07-12)
- **Exit criteria met:** ✅ — all P1+P2 requirements covered, 0 non-flaky failures, a11y clean across 3 states, 4 browsers green locally
