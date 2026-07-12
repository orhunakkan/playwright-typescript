# Test Plan: Multi-Tab

**JIRA Story:** [TAB1-31](https://orhunakkan.atlassian.net/browse/TAB1-31)
**Lab URL:** https://stagecraftlabs.com/practice/multi-tab
**Date:** 2026-07-11
**Author:** Orhun Akkan

---

## 1. Scope

### In Scope

- `context.waitForEvent("page")` registered before the "Open dashboard in new tab" click, capturing the new page and asserting a heading inside it
- Closing the new tab after assertions and confirming `context.pages()` returns exactly one page
- `page.waitForEvent("popup")` capturing a popup window as a distinct event from the new-tab `page` event, with an assertion on popup content
- Cross-tab `localStorage` (key `multi-tab:shared`): write in a new tab, read back from the main page after switching focus
- An `afterEach` hook that closes every extra page opened during a test, preventing state leakage into subsequent tests in the same context
- Negative/boundary coverage for the race condition avoided by listener-before-click ordering, exact page count after cleanup, and exact key/value round-trip
- Accessibility scan of the main page (load state)
- Performance budget for the new-tab-open-and-read flow

### Out of Scope

- Visual/layout regression of the new tab or popup window
- Cross-context (multiple browser contexts) storage isolation — this lab covers cross-tab within one context only
- Authentication or session state

---

## 2. Test Objectives

| #   | Objective                                                                                                    |
| --- | ------------------------------------------------------------------------------------------------------------- |
| 1   | `context.waitForEvent("page")` set up before the triggering click reliably captures the new tab               |
| 2   | The new tab is interactable and closing it leaves exactly one page in the context                             |
| 3   | `page.waitForEvent("popup")` captures a popup as a mechanism distinct from the `page` context event            |
| 4   | A `localStorage` write in a new tab is readable from the main page after switching back                        |
| 5   | Extra pages are closed after every test so no state leaks into the next test                                  |

---

## 3. Browser Matrix

| Browser         | Playwright Project | Priority |
| --------------- | ------------------- | -------- |
| Chromium        | Desktop Chrome      | P1       |
| Firefox         | Desktop Firefox     | P1       |
| WebKit (Safari) | Desktop Safari      | P2       |
| Edge            | Desktop Edge        | P2       |

Source: `playwright.config.ts` — 4 desktop projects configured.

---

## 4. Environments

| Environment | Base URL                   |
| ----------- | --------------------------- |
| Default     | https://stagecraftlabs.com  |
| QA          | `.env.qa` → `BASE_URL`      |
| UAT         | `.env.uat` → `BASE_URL`     |

---

## 5. Risk Table

| Risk                                                                                       | Priority | Mitigation                                                                                    |
| --------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `waitForEvent("page")` registered after the click misses the event (race condition)          | P1       | Always call `context.waitForEvent("page")` and the triggering click together via `Promise.all` |
| A leftover extra page from a prior test leaks into the next test's assertions                | P1       | `afterEach` hook closes every page beyond the original main page                                |
| Popup and new-tab events are conflated, asserting the wrong page object                       | P1       | Use distinct triggers/locators for popup vs. new-tab flows and assert page counts per flow      |
| `localStorage` write in a background tab isn't flushed/visible when the main page re-reads it | P2       | Bring the main page to front and re-read post-write; assert with `page.evaluate`                |
| WebKit popup/tab timing differs from Chromium, causing flaky waits                             | P2       | Use Playwright's built-in `waitForEvent` (auto-waiting) instead of fixed timeouts               |

---

## 6. Entry Criteria

- `https://stagecraftlabs.com/practice/multi-tab` is reachable and returns HTTP 200
- The lab page exposes controls to open a new tab and a popup window
- `test-results/` output directory is writable

## 7. Exit Criteria

- All 5 ACs covered by at least one positive test case
- Each AC has at least one negative or boundary test where applicable
- Axe scan passes on the main page load state
- Performance test asserts the new-tab-open-and-read flow completes within budget
- All tests pass locally on Desktop Chrome
- CI run passes across all 4 configured browsers (gates story → Done)

---

## 8. Test Case Summary

| AC     | Test Cases                                                                                          | Types         |
| ------ | ------------------------------------------------------------------------------------------------------- | ------------- |
| AC-1   | `context.waitForEvent("page")` set up before click captures the new tab; heading is asserted             | Positive      |
| AC-1-N | Listener-before-click ordering is required — asserting the pattern avoids the missed-event race          | Negative      |
| AC-1-B | New tab heading text matches exactly                                                                      | Boundary      |
| AC-2   | New tab is interacted with, then closed after assertions                                                  | Positive      |
| AC-2-B | After closing the new tab, `context.pages()` has exactly 1 page                                           | Boundary      |
| AC-3   | `page.waitForEvent("popup")` captures the popup distinctly from the new-tab event; popup content asserted | Positive      |
| AC-3-B | Popup page object is distinct from the new-tab page object                                                | Boundary      |
| AC-4   | `localStorage` write (`multi-tab:shared`) in a new tab is readable from the main page after switching     | Positive      |
| AC-4-N | Key is absent on the main page before the write                                                           | Negative      |
| AC-4-B | Exact key/value round-trip after switching back                                                           | Boundary      |
| AC-5   | `afterEach` closes all extra pages, leaving a clean context for the next test                             | Positive      |
| A11Y   | Axe WCAG 2.1 AA scan on the main page at load                                                             | Accessibility |
| PERF   | New-tab-open-and-read flow completes within budget                                                        | Performance   |
