# Test Plan: Debugging & Reporting

**JIRA Story:** [TAB1-19](https://orhunakkan.atlassian.net/browse/TAB1-19)  
**Lab URL:** https://stagecraftlabs.com/practice/debugging-reporting  
**Date:** 2026-06-19  
**Author:** Orhun Akkan

---

## 1. Scope

### In Scope

- `test.describe.configure({ retries: 2 })` — flaky button fails on clicks 3, 6, 9; retry count visible in HTML report
- `on-first-retry` tracing: trace file saved after a retry-triggered failure; failure action identifiable in trace viewer
- Per-assertion custom timeout (≥ 2 000 ms) for the slow operation; assertion passes where global default would time out
- `screenshot: "only-on-failure"` — screenshot file created in `test-results/` after a forced failure; absent on pass
- `testInfo.attach()` — screenshot and/or page HTML attached at a named step; attachment visible in HTML report
- Uptime counter resilient assertion via regex/`toContain` (not exact text); stable as counter increments
- Negative: exact-text assertion on uptime counter is flaky/wrong
- Boundary: custom timeout at exactly 2 000 ms; flaky button click count at 3, 6, 9
- Accessibility scans at load state and post-failure state
- Performance budget (page load < 3 s)

### Out of Scope

- CI-level HTML report visual inspection (CI-gated; not run locally)
- Trace viewer UI (CLI-level trace file existence is the testable boundary)
- Video artifact validation
- Authentication or session state

---

## 2. Test Objectives

| #   | Objective                                                                                                       |
| --- | --------------------------------------------------------------------------------------------------------------- |
| 1   | `retries: 2` at describe level causes the flaky button to ultimately pass after retries; retry count is visible |
| 2   | `on-first-retry` tracing produces a `.zip` trace file in `test-results/` after the first retry fires            |
| 3   | Custom `timeout` option on the slow-operation assertion (≥ 2 000 ms) lets the assertion pass                    |
| 4   | `screenshot: "only-on-failure"` produces a `.png` in `test-results/` when a test fails; none on pass            |
| 5   | `testInfo.attach()` adds named attachments (screenshot, HTML) accessible in the HTML report artifact            |
| 6   | Regex/`toContain` matcher for the uptime counter remains stable across multiple counter increments              |

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

| Risk                                                                       | Priority | Mitigation                                                                  |
| -------------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| Global config `retries: 0` locally overrides describe-level retries        | P1       | Use `test.describe.configure({ retries: 2 })` to override at describe scope |
| Trace not saved if `on-first-retry` is set but no retry fires              | P1       | Design test to intentionally trigger a retry via the flaky button           |
| Custom timeout lower than slow operation (< 2 000 ms) causes flaky failure | P1       | Set timeout to exactly 2 000 ms in the test; document intent                |
| Screenshot path differs across OS/runner; `test-results/` not predictable  | P2       | Use `testInfo.outputPath()` for deterministic path lookup                   |
| `testInfo.attach()` attachment absent if test runner changes artifact dir  | P2       | Assert attachment via `testInfo.attachments` array count/name in the test   |
| Uptime counter element may not be present at page load in some browsers    | P2       | Wait for counter element to be visible before asserting                     |
| Exact uptime value changes between `waitFor` and `expect` call             | P1       | Use `toContainText` with pattern or regex — never exact numeric text        |
| Trace file `.zip` size 0 bytes if trace start/stop not properly scoped     | P3       | Assert `fs.statSync(tracePath).size > 0` after retrieval                    |

---

## 6. Entry Criteria

- `https://stagecraftlabs.com/practice/debugging-reporting` is reachable and returns HTTP 200
- Flaky button, slow operation trigger, uptime counter, and screenshot trigger elements are visible
- `test-results/` output directory is writable
- All configured browser environments are available

## 7. Exit Criteria

- All 6 ACs covered by at least one positive test case
- Each AC has at least one negative or boundary test
- Axe scan passes in load and post-failure states
- Performance test asserts load < 3 s
- All tests pass locally on Desktop Chrome
- CI run passes across all 4 configured browsers (gates story → Done)

---

## 8. Test Case Summary

| AC     | Test Cases                                                                                           | Types         |
| ------ | ---------------------------------------------------------------------------------------------------- | ------------- |
| AC-1   | Flaky button with `retries: 2` ultimately passes after retry; retry count observed in report         | Positive      |
| AC-1-N | Without retries (`retries: 0`) the flaky button fails permanently on click 3                         | Negative      |
| AC-1-B | Click counts exactly at 3, 6, 9 trigger failure; clicks 1-2, 4-5, 7-8 pass                           | Boundary      |
| AC-2   | `on-first-retry` tracing produces a `.zip` trace file after retry fires                              | Positive      |
| AC-2-N | No trace file exists when test passes on first attempt (no retry triggered)                          | Negative      |
| AC-2-B | Trace file is non-empty (size > 0 bytes)                                                             | Boundary      |
| AC-3   | Custom timeout (2 000 ms) on slow operation assertion — test passes                                  | Positive      |
| AC-3-N | Default timeout (< 2 000 ms) on same assertion — expect timeout error                                | Negative      |
| AC-3-B | Timeout set to exactly 2 000 ms passes at the boundary                                               | Boundary      |
| AC-4   | `screenshot: "only-on-failure"` — screenshot `.png` exists in `test-results/` after a forced failure | Positive      |
| AC-4-N | No screenshot file when the test passes (screenshot: only-on-failure respected)                      | Negative      |
| AC-4-B | Screenshot file size > 0 bytes (non-empty image)                                                     | Boundary      |
| AC-5   | `testInfo.attach()` with a screenshot and named step — attachment present in `testInfo.attachments`  | Positive      |
| AC-5-B | Multiple attachments (screenshot + HTML) both appear in `testInfo.attachments`                       | Boundary      |
| AC-6   | Uptime counter regex/`toContain` matcher passes across two successive counter reads                  | Positive      |
| AC-6-N | Exact-text assertion on uptime counter fails as value increments                                     | Negative      |
| AC-6-B | Regex pattern matches any valid uptime string format (e.g. `/\d+s/` or `/uptime/i`)                  | Boundary      |
| A11Y   | Axe WCAG 2.1 AA scan: load state and post-failure-trigger state                                      | Accessibility |
| PERF   | Page load < 3 s via `PerformanceNavigationTiming`                                                    | Performance   |
