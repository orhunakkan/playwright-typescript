# Requirements Traceability Matrix — Server-Sent Events

| Field      | Value                                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------------- |
| JIRA Story | [TAB1-38](https://orhunakkan.atlassian.net/browse/TAB1-38)                                                    |
| Lab URL    | https://stagecraftlabs.com/practice/server-sent-events                                                        |
| Spec file  | tests/server-sent-events/server-sent-events.spec.ts                                                           |
| POM file   | pages/server-sent-events.page.ts                                                                              |
| Last run   | 2026-07-14 — Local: 68/68 passed (Chrome 17/17 · Firefox 17/17 · Edge 17/17 · Safari 17/17). 0 skipped tests. |
| Generated  | 2026-07-14                                                                                                    |
| Status     | Local green, 0 open blockers — pending CI verification for Done                                               |

---

## Coverage by Acceptance Criterion

| Req     | Acceptance Criterion                                                                                          | Test Case                                                                                                | Type | Result   |
| ------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---- | -------- |
| AC-1    | Clicking "Start Stream" and using `expect.poll` to wait until at least 3 entries are visible in the Event Log | positive: clicking Start Stream eventually produces at least 3 log entries                               | P    | ✅ (4/4) |
| AC-1    | (negative — before Start Stream is clicked, the log is empty)                                                 | negative: before Start Stream is clicked, the log shows the empty state with 0 entries                   | N    | ✅ (4/4) |
| AC-2    | Each SSE event type renders its corresponding colour badge text in the log                                    | data-driven: a "info" event renders the "info" badge in the log                                          | D    | ✅ (4/4) |
| AC-2    | (same, warn)                                                                                                  | data-driven: a "warn" event renders the "warn" badge in the log                                          | D    | ✅ (4/4) |
| AC-2    | (same, error)                                                                                                 | data-driven: a "error" event renders the "error" badge in the log                                        | D    | ✅ (4/4) |
| AC-2    | (boundary — system entries use a distinct 4th badge style, not info/warn/error)                               | boundary: the two system entries (connecting/complete) use the system badge, not info/warn/error         | B    | ✅ (4/4) |
| AC-3    | `page.waitForResponse` captures the `/api/sse` response and confirms `Content-Type: text/event-stream`        | positive: the captured /api/sse response has Content-Type text/event-stream                              | P    | ✅ (4/4) |
| AC-4    | `page.route()` stubs a hand-crafted SSE payload; exactly those entries — and no others — appear               | positive: a stubbed 2-event payload renders exactly those 2 entries plus the 2 system markers, no others | P    | ✅ (4/4) |
| AC-4    | (boundary — a 3-event stub payload also matches exactly)                                                      | boundary: a stubbed 3-event payload renders exactly those 3 entries plus the 2 system markers, no others | B    | ✅ (4/4) |
| AC-4    | (negative — entries from a prior stub do not leak into a differently-stubbed run)                             | negative: entries from a previous stub do not bleed into a differently-stubbed run                       | N    | ✅ (4/4) |
| AC-5    | Clicking "Stop Stream" halts further log growth                                                               | positive: clicking Stop Stream shortly after Start halts further log growth                              | P    | ✅ (4/4) |
| AC-5    | (negative — Start re-enables and Stop disables after stopping)                                                | negative: Start Stream re-enables and Stop Stream disables after stopping                                | N    | ✅ (4/4) |
| AC-5    | (boundary — button states before any stream begins)                                                           | boundary: Stop Stream is disabled and Start Stream is enabled before any stream begins                   | B    | ✅ (4/4) |
| AXE     | No WCAG 2.x violations on initial page load (idle, pre-stream)                                                | no violations on initial page load (idle, pre-stream)                                                    | A11y | ✅ (4/4) |
| AXE     | No WCAG 2.x violations with a populated event log (streaming/complete state)                                  | no violations with a populated event log (streaming/complete state)                                      | A11y | ✅ (4/4) |
| AXE     | No WCAG 2.x violations after Stop Stream is clicked                                                           | no violations after Stop Stream is clicked                                                               | A11y | ✅ (4/4) |
| REQ-NF1 | The page must meet its performance budget (load)                                                              | initial server-sent-events page load is within budget                                                    | Perf | ✅ (4/4) |

_All rows: 4/4 = Desktop Chrome, Desktop Firefox, Desktop Edge, Desktop Safari._

---

## Defects

| ID      | Type          | Summary                                                                                                                   | Severity | Found by                 | JIRA                                                       | Status                                                                   |
| ------- | ------------- | ------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| TAB1-57 | Accessibility | `color-contrast`: "✓ Stream complete" status text (`text-emerald-600` on white, 3.65:1) failed WCAG 2 AA (4.5:1 required) | Serious  | axe-core, all 4 browsers | [TAB1-57](https://orhunakkan.atlassian.net/browse/TAB1-57) | ✅ Fixed & closed (`text-emerald-700`, commit `2b5e6ea` in `stagecraft`) |

---

## Traceability Summary

- **ACs covered:** 5 / 5 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5) on all 4 browsers
- **Non-functional covered:** 4 / 4 (AXE idle state · AXE populated state · AXE stopped state · performance budget)
- **Test cases:** 17 tests × 4 browsers = 68 defined, executed, and passing. 0 skipped.
- **Every POM element asserted by ≥1 case:** ✅ (`startStreamButton`, `stopStreamButton`, `eventLogEmptyMessage`, `eventLogEntries`, `logEntry()`, `infoBadges`/`warnBadges`/`errorBadges`/`systemBadges` are all directly exercised)
- **Notable finding during test design:** the real backend streams its 11 log events + 2 system markers far faster in this environment than the documented "every 600 ms" — clicking Stop Stream after waiting for the `expect.poll` 3-entry threshold (AC-1's own condition) frequently raced the stream to completion, making the AC-5 "stops growing" assertion vacuously true against an already-finished log. Fixed by clicking Stop immediately after Start (no intermediate wait), which Playwright's auto-waiting click still handles safely since Stop Stream is enabled the instant the connection opens.
- **Notable finding during test design:** the "Connecting to stream…" and "Stream complete." system log entries are synthesized client-side (on `EventSource` open and on receiving a server `event: done`), not part of the `/api/sse` payload itself — confirmed by inspecting the raw SSE wire format directly. `page.route()` stubs therefore only need to supply `event: log` entries plus a terminating `event: done` to reproduce the full log shape, including both system markers.
- **Real defect found and fixed during this run:** TAB1-57 — a genuine WCAG AA color-contrast failure in the deployed app, not a test issue. Fixed upstream in the `stagecraft` source (commit `2b5e6ea`), deployed, verified live, and confirmed via a clean re-run (68/68).
- **Open blockers:** 0
- **Exit criteria met:** ✅ — all P1 requirements covered, 0 open blockers, 68/68 passing locally across all 4 browsers. Story proceeds to Done once CI confirms this on the PR.
