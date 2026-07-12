# Requirements Traceability Matrix — Clock & Timers

| Field      | Value                                                                |
| ---------- | ---------------------------------------------------------------------- |
| JIRA Story | [TAB1-25](https://orhunakkan.atlassian.net/browse/TAB1-25)            |
| Lab URL    | https://stagecraftlabs.com/practice/clock-timers                      |
| Spec file  | tests/clock-timers/clock-timers.spec.ts                                |
| POM file   | pages/clock-timers.page.ts                                             |
| Last run   | 2026-07-12 — 76 / 76 passed (Chrome · Firefox · Edge · Safari)         |
| Generated  | 2026-07-12                                                              |

---

## Coverage by Acceptance Criterion

| Req  | Acceptance Criterion                                                                                                     | Test Case                                                                                    | Type | Result |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---- | ------ |
| AC-1 | Tests install the fake clock with `page.clock.install()` before navigation and advance it programmatically with `clock.tick()` | positive: clock installed before navigation allows deterministic tick() advancement             | P    | ✅     |
| AC-1 |                                                                                                                              | boundary: tick(0) leaves the countdown display unchanged                                        | B    | ✅     |
| AC-2 | Tests start the 60 s countdown timer, advance the clock with `clock.tick(60_000)`, and assert the "Time's up!" message appears | positive: tick(60_000) shows "Time's up!" with no real waiting                                  | P    | ✅     |
| AC-2 |                                                                                                                              | negative: "Time's up!" is absent before the countdown completes                                 | N    | ✅     |
| AC-2 |                                                                                                                              | boundary: at 59_900ms elapsed (still 1s remaining), "Time's up!" has not appeared yet            | B    | ✅     |
| AC-3 | Tests start a session and advance the clock by 5 s using `clock.tick(5000)` to trigger the session expiry toast with the correct countdown | positive: tick(5000) shows the expiry toast with the correct countdown                          | P    | ✅     |
| AC-3 |                                                                                                                              | negative: expiry toast is absent before the 5s threshold                                        | N    | ✅     |
| AC-3 |                                                                                                                              | boundary: at 4_999ms elapsed, the toast has not yet appeared                                    | B    | ✅     |
| AC-4 | Tests use `clock.fastForward(30_000)` to trigger one auto-refresh polling cycle and assert the "Refresh #" counter increments | positive: fastForward(30_000) triggers exactly one refresh cycle                                | P    | ✅     |
| AC-4 |                                                                                                                              | boundary: fast-forwarding less than the poll interval does not increment the counter             | B    | ✅     |
| AC-4 |                                                                                                                              | boundary: fast-forwarding exactly one interval increments by exactly 1                          | B    | ✅     |
| AC-5 | Tests advance the clock in small increments and assert intermediate countdown values at each step                          | positive: countdown reflects the correct remaining time at each intermediate tick (6-step table) | D    | ✅     |
| AC-6 | Tests use `clock.setFixedTime(date)` before navigation to pin "today" and assert the date display shows exactly that date   | positive: setFixedTime(date) before navigation pins the date display to that date                | P    | ✅     |
| AC-6 |                                                                                                                              | boundary: a day-boundary fixed time (23:59:59) still renders the correct calendar date           | B    | ✅     |
| AXE  | The page must have no critical axe-core violations in every rendered state                                                  | no violations on initial page load                                                              | A11y | ✅     |
| AXE  |                                                                                                                              | no violations while the countdown is active                                                     | A11y | ✅     |
| AXE  |                                                                                                                              | no violations on the expired ("Time's up!") state                                                | A11y | ✅     |
| AXE  |                                                                                                                              | no violations after an auto-refresh cycle                                                       | A11y | ✅     |
| REQ-NF1 | The page must meet its performance budget (load + key interaction)                                                       | initial clock-timers page load is within budget                                                 | Perf | ✅     |

---

## Defects

| ID  | Severity | Summary          | Found by | JIRA | Status |
| --- | -------- | ---------------- | -------- | ---- | ------ |
| —   | —        | No defects found | —        | —    | —      |

---

## Traceability Summary

- **ACs covered:** 6 / 6 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5 · AC-6)
- **Non-functional covered:** 2 / 2 (AXE multi-state · Performance budget)
- **Test cases:** 19 (P:5 · N:2 · B:7 · D:1 · A11y:4 · Perf:1) × 4 browsers = **76 total**
- **Every POM element asserted by ≥1 case:** ✅ (`countdownDisplay`/`countdownStartButton`/`countdownPauseButton` in AC-1/2/5, `timesUpMessage` in AC-2 + AXE, `startSessionButton`/`expiryToast`/`expiryCountdown` in AC-3, `refreshCount` in AC-4 + AXE, `currentDate` in AC-6)
- **Notable finding during test design:** the app's ARIA `alert` role on the "Time's up!" element has no accessible name (name-from-author-only per the ARIA spec) — the POM locator scopes by region + role instead of `getByRole('alert', { name })`, which would silently never match
- **Open defects:** 0
- **Exit criteria met:** ✅ — all P1+P2 requirements covered, 0 non-flaky failures, a11y clean across 4 states, 4 browsers green locally
