# Test Plan — Clock & Timers (TAB1-25)

| Field      | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| JIRA Story | [TAB1-25](https://orhunakkan.atlassian.net/browse/TAB1-25) |
| Lab URL    | https://stagecraftlabs.com/practice/clock-timers           |
| Spec file  | tests/clock-timers/clock-timers.spec.ts                    |
| POM file   | pages/clock-timers.page.ts                                 |
| Generated  | 2026-07-12                                                 |

---

## 1. Scope

**In scope:**

- `page.clock.install()` before navigation, advancing time deterministically with `clock.tick()`
- 60s countdown timer: `clock.tick(60_000)` → "Time's up!" message appears, with no real waiting
- Session-expiry toast: `clock.tick(5000)` triggers the toast with the correct countdown text
- Auto-refresh polling: `clock.fastForward(30_000)` triggers exactly one refresh cycle, "Refresh #" counter increments by 1
- Intermediate countdown values verified at each small tick increment (UI updates correctly mid-countdown, not just at the end)
- `clock.setFixedTime(date)` before navigation pins "today"; date-display component renders exactly that date, including a day-boundary edge case
- Accessibility scanning across clock-related states: initial, countdown-active, expired, refreshed
- Performance budget: initial page load

**Out of scope:**

- Real (non-faked) timer behavior / real-wall-clock waiting-based tests
- Server-side clock/session behavior beyond what the client displays
- Timezone-conversion correctness beyond the single day-boundary boundary case
- Load testing or concurrent-session timer handling at scale

---

## 2. Test Types

| Type                  | Applied                                                      |
| --------------------- | ------------------------------------------------------------ |
| Functional (positive) | ✅                                                           |
| Functional (negative) | ✅                                                           |
| Boundary value        | ✅ (tick just-under vs. exactly-at trigger thresholds)       |
| Data-driven           | ✅ (small-increment tick table for intermediate countdown)   |
| Accessibility (axe)   | ✅ (initial + countdown-active + expired + refreshed states) |
| Non-functional (perf) | ✅ (Navigation Timing budget)                                |
| Cross-browser         | ✅ (4 browsers)                                              |
| Mobile / responsive   | ❌ (out of scope)                                            |

---

## 3. Environments & Data

| Field         | Value                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------- |
| Target env    | Staging (stagecraftlabs.com)                                                                  |
| BASE_URL      | `https://stagecraftlabs.com` (`.env`)                                                         |
| Clock control | `page.clock.install()`, `clock.tick(ms)`, `clock.fastForward(ms)`, `clock.setFixedTime(date)` |
| Fixed dates   | Fixed ISO date(s) chosen for `setFixedTime` (incl. one at `23:59:59` day boundary)            |
| Test data     | Fixed tick-increment tables (deterministic; no faker — timing values are prescribed)          |

---

## 4. Browser / Device Matrix

| Browser         | Project name    |
| --------------- | --------------- |
| Desktop Chrome  | Desktop Chrome  |
| Desktop Firefox | Desktop Firefox |
| Desktop Edge    | Desktop Edge    |
| Desktop Safari  | Desktop Safari  |

_(Source: `playwright.config.ts` projects[])_

---

## 5. Risk Assessment & Priority

| Area / Requirement                                                     | Likelihood | Impact | Risk | Priority |
| ---------------------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| `page.clock.install()` + `clock.tick()` deterministic time control     | H          | H      | H    | P1       |
| 60s countdown → "Time's up!" via `clock.tick(60_000)`                  | H          | H      | H    | P1       |
| Session expiry toast at `clock.tick(5000)` with correct countdown text | H          | H      | H    | P1       |
| `clock.fastForward(30_000)` triggers exactly one refresh cycle         | H          | H      | H    | P1       |
| Intermediate countdown values update correctly at each tick            | M          | M      | M    | P1       |
| `clock.setFixedTime(date)` pins "today" exactly                        | H          | H      | H    | P1       |
| "Time's up!" / toast absent before their trigger threshold             | M          | H      | H    | P2       |
| Boundary: N-1ms vs. exactly-Nms trigger thresholds                     | M          | M      | M    | P2       |
| Fast-forwarding less than the poll interval does not over-increment    | M          | M      | M    | P2       |
| Day-boundary fixed date renders the correct calendar date              | L          | M      | M    | P2       |
| Accessibility — initial / countdown-active / expired / refreshed       | L          | M      | L    | P2       |
| Performance budget                                                     | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- [ ] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/clock-timers`
- [ ] `BASE_URL` configured in `.env` (✅)
- [ ] POM exists: `pages/clock-timers.page.ts` (generated in Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 + P2 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-25
- [ ] Accessibility: 0 critical/serious violations (or tracked with a defect id) in all four states
- [ ] Green across all 4 configured browsers in CI
- [ ] RTM generated and up to date: `docs/rtm/clock-timers.rtm.md`

---

## 8. Deliverables

| Artifact  | Path                                     | Status  |
| --------- | ---------------------------------------- | ------- |
| Test Plan | docs/test-plan/clock-timers.test-plan.md | ✅ done |
| POM       | pages/clock-timers.page.ts               | pending |
| Spec file | tests/clock-timers/clock-timers.spec.ts  | pending |
| RTM       | docs/rtm/clock-timers.rtm.md             | pending |
| CI run    | GitHub Actions                           | pending |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
