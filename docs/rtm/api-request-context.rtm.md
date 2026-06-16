# Requirements Traceability Matrix — API Request Context

| Field      | Value                                                               |
| ---------- | ------------------------------------------------------------------- |
| JIRA Story | [TAB1-24](https://orhunakkan.atlassian.net/browse/TAB1-24)          |
| Lab URL    | https://stagecraftlabs.com/practice/api-request-context             |
| Spec       | `tests/api-request-context/api-request-context.spec.ts`             |
| POM        | `pages/api-request-context.page.ts`                                 |
| Last run   | 2026-06-12 — 72 / 72 passed (Desktop Chrome, Firefox, Edge, Safari) |
| Generated  | 2026-06-12                                                          |

---

## Coverage by Acceptance Criterion

| Req              | Acceptance Criterion                                                                            | Test Case                                                                    | Type | Result |
| ---------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---- | ------ |
| AC-1             | Tests use the `request` fixture to call GET /api/tasks and assert status 200 + non-empty array  | positive: status is 200 and body is an array                                 | P    | ✅     |
| AC-1             |                                                                                                 | positive: response body items conform to expected shape { id, title }        | P    | ✅     |
| AC-1 (REQ-01a/b) | Derived — GET returns 200 even if no tasks seeded by current test                               | negative: 200 status returned regardless of whether tasks exist              | N    | ✅     |
| AC-2             | Tests use `request.post()` in a `beforeEach` hook to seed a known task                          | positive: seeded task is visible in the task list UI after page load         | P    | ✅     |
| AC-2 (REQ-02a)   | Derived — POST with missing title returns 4xx                                                   | negative: POST with missing title returns 4xx                                | N    | ✅     |
| AC-3             | Tests use `request.delete()` in an `afterEach` hook to clean up                                 | positive: DELETE returns 200/204 and task absent from subsequent GET         | P    | ✅     |
| AC-3 (REQ-03a)   | Derived — DELETE non-existent id returns 404                                                    | negative: DELETE with non-existent id returns 404                            | N    | ✅     |
| AC-4             | Browser-free test: POST → PUT → DELETE via `request` fixture only                               | positive: create → update → delete verifies full lifecycle without a browser | P    | ✅     |
| AC-4 (REQ-04a)   | Derived — PUT to non-existent id returns 404                                                    | negative: PUT to non-existent task id returns 404                            | N    | ✅     |
| AC-4 (REQ-04b)   | Derived — PUT with empty title returns 4xx                                                      | boundary: PUT with empty title returns 4xx                                   | B    | ✅     |
| AC-5             | Tests assert full API contract: status codes + body shape                                       | positive: POST returns 201 with body shape { id, title }                     | P    | ✅     |
| AC-5             |                                                                                                 | positive: PUT returns 200 with updated body shape                            | P    | ✅     |
| AC-5 (REQ-05a)   | Derived — POST invalid body returns 4xx (data-driven: missing field, empty string, wrong field) | negative: POST with missing title field returns 4xx                          | D    | ✅     |
| AC-5 (REQ-05a)   |                                                                                                 | negative: POST with empty title string returns 4xx                           | D    | ✅     |
| AC-5 (REQ-05a)   |                                                                                                 | negative: POST with wrong field name returns 4xx                             | D    | ✅     |
| AC-5 (REQ-05b)   | Derived — POST with extra unknown field does not 500                                            | negative: POST with extra unknown field does not return 500                  | N    | ✅     |
| REQ-A11Y         | No critical axe violations on page load                                                         | no violations on initial page load                                           | A11y | ✅     |
| REQ-NF1          | Page load within performance budget (domContentLoaded < 6 s, load < 12 s)                       | initial load is within budget                                                | Perf | ✅     |

---

## Defects

| ID    | Severity | Summary                                                                                                                                                                              | Found by                                                    | JIRA    | Status |
| ----- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | ------- | ------ |
| DEF-1 | Serious  | `<code>` inline elements (`#71717a` on `#f4f4f5`, 12px) had contrast ratio 4.39:1, below WCAG 2 AA 4.5:1. Caught by Firefox axe; Chrome rounded to passing. Fixed by app — CI green. | accessibility: no violations on initial page load (Firefox) | TAB1-24 | Fixed  |

---

## Traceability Summary

- ACs covered: 5 / 5
- Test cases: 18 per browser × 4 browsers = 72 total (P:7 N:7 B:1 D:3 A11y:1 Perf:1) — note: data-driven table emits 3 separate N tests
- Every POM locator relevant to assertions used: `taskItems` asserted in AC-2 UI test ✅
- Open defects: 0 (DEF-1 fixed — `<code>` element contrast resolved by app, CI green)
