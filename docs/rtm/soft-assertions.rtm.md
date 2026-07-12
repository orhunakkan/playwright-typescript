# Requirements Traceability Matrix — Soft Assertions & Test Steps

| Field      | Value                                                          |
| ---------- | -------------------------------------------------------------- |
| JIRA Story | [TAB1-39](https://orhunakkan.atlassian.net/browse/TAB1-39)     |
| Lab URL    | https://stagecraftlabs.com/practice/soft-assertions            |
| Spec file  | tests/soft-assertions/soft-assertions.spec.ts                  |
| POM file   | pages/soft-assertions.page.ts                                  |
| Last run   | 2026-07-11 — 36 / 36 passed (Chrome · Firefox · Edge · Safari) |
| Generated  | 2026-07-11                                                     |

---

## Coverage by Acceptance Criterion

| Req     | Acceptance Criterion                                                                                                                     | Test Case                                                                                | Type | Result |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---- | ------ |
| AC-1    | Tests use `expect.soft` for each of the four profile dashboard widget assertions so a failure in one does not abort the remaining checks | positive: all four widgets pass with zero soft-assertion failures                        | P    | ✅     |
| AC-1    |                                                                                                                                          | negative/AC-6: an intentional soft failure on one widget does not abort remaining checks | N    | ✅     |
| AC-2    | Tests use `expect.poll` to keep re-reading the Activity Score widget until it reaches the expected value after its short timer           | positive: expect.poll reaches the expected Activity Score value within a bounded timeout | P    | ✅     |
| AC-2    |                                                                                                                                          | negative: expect.poll fails fast (bounded timeout) when the expected value never appears | N    | ✅     |
| AC-3    | Tests use `expect(locator).toPass({ timeout: 3000 })` on the animated Account Status badge to retry until it settles                     | positive/boundary: toPass({ timeout: 3000 }) retries until the badge settles on "active" | B    | ✅     |
| AC-4    | Tests wrap each widget check in `test.step("Check <widget name>", ...)`; step names visible in HTML report/trace viewer                  | (covered structurally in AC-1 positive test — 4 uniquely named steps asserted)           | P    | ✅     |
| AC-5    | Tests add `test.info().annotations.push({ type: "issue", description: "..." })` inside a step; annotation appears in HTML report         | positive: issue annotation pushed inside a step appears in testInfo.annotations          | P    | ✅     |
| AC-6    | Tests run with ≥1 intentional soft-assertion failure and confirm all soft failures are reported together after test completion           | negative/AC-6: an intentional soft failure on one widget does not abort remaining checks | N    | ✅     |
| AXE     | The page must have no critical axe-core violations in every rendered state                                                               | no violations at initial load (widgets mid-settle)                                       | A11y | ✅     |
| AXE     |                                                                                                                                          | no violations once all widgets have settled                                              | A11y | ✅     |
| REQ-NF1 | The full widget-check flow (poll + toPass waits) must meet its performance budget                                                        | full widget-check flow (poll + toPass) completes within budget                           | Perf | ✅     |

---

## Defects

| ID  | Severity | Summary          | Found by | JIRA | Status |
| --- | -------- | ---------------- | -------- | ---- | ------ |
| —   | —        | No defects found | —        | —    | —      |

---

## Traceability Summary

- **ACs covered:** 6 / 6 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5 · AC-6)
- **Non-functional covered:** 2 / 2 (AXE multi-state · Performance budget)
- **Test cases:** 9 (P:4 · N:2 · B:1 · A11y:2 · Perf:1... AC-6/AC-1-N counted once) × 4 browsers = **36 total**
- **Intentional-failure AC (AC-6) verified via `test.fail()`:** the test is expected to end failed (soft assertion collects the error), so the suite exit code stays green while still proving soft-failure behavior
- **Open defects:** 0
- **Exit criteria met:** ✅ — all P1+P2 requirements covered, 0 non-flaky failures, a11y clean across 2 states, 4 browsers green locally
