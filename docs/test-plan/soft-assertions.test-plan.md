# Test Plan: Soft Assertions & Test Steps

**JIRA Story:** [TAB1-39](https://orhunakkan.atlassian.net/browse/TAB1-39)
**Lab URL:** https://stagecraftlabs.com/practice/soft-assertions
**Date:** 2026-07-11
**Author:** Orhun Akkan

---

## 1. Scope

### In Scope

- `expect.soft` across all four profile dashboard widgets (Activity Score, Account Status, Profile, Notifications) — a failure in one does not abort the remaining checks
- `expect.poll` on the Activity Score widget, re-reading until it reaches its expected value after a short timer
- `expect(locator).toPass({ timeout: 3000 })` on the animated Account Status badge, retrying the assertion block until the badge settles
- `test.step("Check <widget name>", ...)` wrapping each widget check; step names verified via `testInfo` step data
- `test.info().annotations.push({ type: "issue", description: "..." })` inside a step; annotation verified via `testInfo.annotations`
- A test run with ≥1 intentional soft-assertion failure that still executes and reports every widget check, with overall test status `failed`
- Negative/boundary coverage for polling timeouts and the toPass retry boundary
- Accessibility scans across load, mid-poll, and settled states
- Performance budget for the full widget-check flow

### Out of Scope

- Visual inspection of the HTML report UI (CI-gated; step/annotation presence is verified via `testInfo` in-test, not by rendering the report)
- Trace viewer UI rendering (trace file existence, not visual trace inspection)
- Authentication or session state

---

## 2. Test Objectives

| #   | Objective                                                                                                  |
| --- | ------------------------------------------------------------------------------------------------------------------- |
| 1   | `expect.soft` on all 4 widgets collects every failure instead of aborting on the first                              |
| 2   | `expect.poll` re-reads the Activity Score widget until it reaches its expected value within a bounded timeout       |
| 3   | `expect(locator).toPass({ timeout: 3000 })` retries the Account Status badge assertion block until it settles       |
| 4   | Each widget check is wrapped in a named `test.step`, and step names are recorded in the test result               |
| 5   | `test.info().annotations.push(...)` inside a step records an `issue` annotation visible on the test result        |
| 6   | A run with an intentional soft-assertion failure still checks every widget and reports `failed` only at test end  |

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

| Risk                                                                                          | Priority | Mitigation                                                                                   |
| ----------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------- |
| A hard (non-soft) assertion on one widget aborts the test before other widgets are checked      | P1       | Use `expect.soft` exclusively for the 4 widget checks; hard-assert only outside the loop      |
| `expect.poll` default interval/timeout too short for the widget's timer to fire                 | P1       | Set an explicit `{ timeout, intervals }` on `expect.poll` sized to the widget's known timer   |
| `toPass({ timeout: 3000 })` races the badge animation and asserts on an intermediate frame       | P1       | Assert the final settled value inside the `toPass` callback, not an intermediate one          |
| Step names collide or are generic, making trace/report step attribution ambiguous               | P2       | Name each step `Check <widget name>` verbatim per AC-4                                        |
| Annotation pushed outside the step body is not attributed to that step in the report             | P2       | Push the annotation from inside the `test.step` callback                                      |
| Soft assertion failures are miscounted if `test.info().errors` isn't inspected post-run          | P2       | Assert `testInfo.status === 'failed'` and `testInfo.errors.length` at test end via a fixture/hook |
| Polling never converges if the widget's timer is disabled/flaky in CI                            | P3       | Bound `expect.poll` with an explicit timeout so the test fails fast instead of hanging         |

---

## 6. Entry Criteria

- `https://stagecraftlabs.com/practice/soft-assertions` is reachable and returns HTTP 200
- All four dashboard widgets (Activity Score, Account Status, Profile, Notifications) are visible
- `test-results/` output directory is writable

## 7. Exit Criteria

- All 6 ACs covered by at least one positive test case
- Each AC has at least one negative or boundary test where applicable
- Axe scan passes across load, mid-poll, and settled states
- Performance test asserts the full widget-check flow completes within budget
- All tests pass locally on Desktop Chrome
- CI run passes across all 4 configured browsers (gates story → Done)

---

## 8. Test Case Summary

| AC     | Test Cases                                                                                          | Types         |
| ------ | ------------------------------------------------------------------------------------------------------- | ------------- |
| AC-1   | `expect.soft` runs across all 4 widgets; a failing widget doesn't stop remaining checks                 | Positive      |
| AC-1-N | With an intentional soft failure, subsequent widget steps still execute (verified by step count)        | Negative      |
| AC-1-B | All 4 widgets pass — soft assertions collect zero failures when the dashboard is healthy                 | Boundary      |
| AC-2   | `expect.poll` re-reads Activity Score until it reaches the expected value after its timer                | Positive      |
| AC-2-N | `expect.poll` bounded timeout fails fast if the value never reaches expectation                          | Negative      |
| AC-2-B | Polled value is read as stale/incorrect immediately before the timer elapses, then correct after         | Boundary      |
| AC-3   | `expect(locator).toPass({ timeout: 3000 })` retries the Account Status badge until it settles            | Positive      |
| AC-3-B | `toPass` boundary at exactly 3000ms — badge must settle within the window                                 | Boundary      |
| AC-4   | Each widget check wrapped in `test.step("Check <widget name>", ...)`; step titles recorded              | Positive      |
| AC-4-B | Step names are unique per widget (no duplicate/generic titles)                                            | Boundary      |
| AC-5   | `test.info().annotations.push({ type: "issue", description })` inside a step is present on the result    | Positive      |
| AC-6   | Intentional soft-assertion failure — test still checks all widgets, reports `failed` only at test end    | Positive      |
| AC-6-N | Overall test status is `failed` (soft failures are not silently swallowed)                                | Negative      |
| A11Y   | Axe WCAG 2.1 AA scan: load state, mid-poll state, and settled state                                       | Accessibility |
| PERF   | Full widget-check flow (poll + toPass waits) completes within budget                                      | Performance   |
