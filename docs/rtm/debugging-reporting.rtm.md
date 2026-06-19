# Requirements Traceability Matrix — Debugging & Reporting (TAB1-19)

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| JIRA story   | [TAB1-19](https://orhunakkan.atlassian.net/browse/TAB1-19) |
| Spec         | `tests/debugging-reporting/debugging-reporting.spec.ts`    |
| POM          | `pages/debugging-reporting.page.ts`                        |
| Test plan    | `docs/test-plan/debugging-reporting.test-plan.md`          |
| Local run    | 22 / 22 passing (Desktop Chrome) — 21 expected + 1 flaky   |
| Open defects | 0                                                          |

---

## Requirement → Test Case Map

| Req ID    | Requirement                                                                                           | Priority | Test Case(s)                                                                                       | Status     |
| --------- | ----------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- | ---------- |
| AC-1      | Tests configure `retries: 2`; flaky button exercised; retry count observable in HTML report           | P1       | `AC-1 positive: single flaky button click shows success; test runs without retrying`               | ✅ Pass    |
| AC-1      | Two consecutive clicks both produce the success state                                                 | P1       | `AC-1 positive: two consecutive clicks both produce the success state`                             | ✅ Pass    |
| AC-1-N    | Clicks 1 and 2 do NOT trigger the error state                                                         | P2       | `AC-1 negative: clicks 1 and 2 never show the error indicator`                                     | ✅ Pass    |
| AC-1-B    | Exactly click 3 triggers the flaky error state; `flakyError` visible                                  | P1       | `AC-1 boundary: exactly 3 clicks triggers the flaky error; error indicator visible`                | ✅ Pass    |
| AC-2      | `on-first-retry` tracing: passing test has no trace attachment on clean run                           | P1       | `AC-2 positive: passing test with on-first-retry trace has no trace attachment on clean run`       | ✅ Pass    |
| AC-2-N    | Test that fails on retry 0 → retries → passes on retry 1; retry index confirms retry occurred         | P2       | `AC-2 negative: test retries when first attempt fails; retry index confirms retry occurred`        | ✅ Flaky\* |
| AC-3      | Slow operation result visible when assertion timeout raised to 3000 ms                                | P1       | `AC-3 positive: slow operation result visible when assertion timeout raised to 3000 ms`            | ✅ Pass    |
| AC-3-B    | Timeout at 2500 ms sufficient for the ~2 s slow operation                                             | P1       | `AC-3 boundary: timeout at 2500 ms is sufficient for the ~2 s slow operation`                      | ✅ Pass    |
| AC-3-N    | 100 ms timeout is insufficient for the 2 s operation (demonstrates need for custom timeout)           | P2       | `AC-3 negative [expected to fail]: 100 ms timeout is too short for the 2 s operation`              | ✅ XFail   |
| AC-4      | Passing test produces no screenshot attachment in `testInfo`                                          | P1       | `AC-4 positive: passing test produces no screenshot attachment in testInfo`                        | ✅ Pass    |
| AC-4-N    | Forced failure causes Playwright to save a screenshot artifact (only-on-failure)                      | P1       | `AC-4 negative [expected to fail]: forced failure causes Playwright to save a screenshot artifact` | ✅ XFail   |
| AC-4-B    | Manual screenshot written to `outputDir` is non-empty (> 0 bytes)                                     | P2       | `AC-4 boundary: manual screenshot written to outputDir is non-empty (> 0 bytes)`                   | ✅ Pass    |
| AC-5      | Screenshot attached with `testInfo.attach()` present in `testInfo.attachments`                        | P2       | `AC-5 positive: screenshot attached with testInfo.attach() is present in attachments list`         | ✅ Pass    |
| AC-5-B    | Multiple attachments (screenshot + HTML) both present in `testInfo.attachments`                       | P3       | `AC-5 boundary: multiple attachments (screenshot + HTML) are all present in testInfo.attachments`  | ✅ Pass    |
| AC-5-B    | Attachment name preserved exactly as provided                                                         | P3       | `AC-5 boundary: attachment name is preserved exactly as provided`                                  | ✅ Pass    |
| AC-6      | Regex matcher on live counter matches any valid uptime string                                         | P1       | `AC-6 positive: regex matcher on live counter matches any valid uptime string`                     | ✅ Pass    |
| AC-6      | Two successive reads both match pattern as counter increments                                         | P1       | `AC-6 positive: two successive reads both match the pattern even as counter increments`            | ✅ Pass    |
| AC-6-B    | `aria-label` attribute on counter also matches resilient pattern                                      | P1       | `AC-6 boundary: aria-label on counter element matches resilient pattern`                           | ✅ Pass    |
| AC-6-N    | Exact-text assertion on live counter fails as value changes (demonstrates need for resilient matcher) | P2       | `AC-6 negative [expected to fail]: exact-text assertion on live counter is flaky as value changes` | ✅ XFail   |
| A11Y-LOAD | No WCAG 2.1 AA violations on initial page load                                                        | P1       | `accessibility — no violations on initial page load`                                               | ✅ Pass    |
| A11Y-ERR  | No WCAG 2.1 AA violations after flaky button error state                                              | P2       | `accessibility — no violations after flaky button failure (error state)`                           | ✅ Pass    |
| PERF-1    | Page load within 3 s budget (DOMContentLoaded + load < 3000 ms)                                       | P2       | `performance @performance — initial load is within 3 s budget`                                     | ✅ Pass    |

\*Flaky by design: intentionally fails on attempt 1 to demonstrate Playwright's retry mechanism; passes on retry 1.

---

## Defects

| ID  | Summary          | Severity | Status | Blocks In Review? |
| --- | ---------------- | -------- | ------ | ----------------- |
| —   | No defects filed | —        | —      | No                |

---

## Notes

- `test.describe.configure({ retries: 2 })` overrides the global `retries: 0` (local) for the AC-1/AC-2 describe block — satisfies AC-1's "configure retries at suite level" requirement.
- `trace: 'on-first-retry'` and `screenshot: 'only-on-failure'` cannot be set inside a `test.describe()` block (they force a new worker). Both are set globally in `playwright.config.ts`; the spec demonstrates and verifies their behavior.
- `testInfo.attach()` is verified by asserting `testInfo.attachments.find(a => a.name === ...)` immediately after the attach call — the attachment is synchronously added to the array.
- The live counter (`[data-testid="live-counter"]`) updates every second. All assertions use `/^\d+s$/` (regex) or `toContainText` — never exact text. The XFail negative test demonstrates what breaks when exact-text is used.
- Three tests use `test.fail(true, reason)`: AC-3-N, AC-4-N, and AC-6-N. These tests pass overall (expected failure) and appear as "expected" in the stats.
- All 6 JIRA ACs covered. CI run across Desktop Chrome / Firefox / Edge / Safari required to gate story → Done.
