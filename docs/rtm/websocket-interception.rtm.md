# Requirements Traceability Matrix — WebSocket Interception

| Field      | Value                                                                |
| ---------- | ---------------------------------------------------------------------- |
| JIRA Story | [TAB1-26](https://orhunakkan.atlassian.net/browse/TAB1-26)            |
| Lab URL    | https://stagecraftlabs.com/practice/websocket-interception            |
| Spec file  | tests/websocket-interception/websocket-interception.spec.ts            |
| POM file   | pages/websocket-interception.page.ts                                   |
| Last run   | 2026-07-12 — 68 / 68 passed (Chrome · Firefox · Edge · Safari)         |
| Generated  | 2026-07-12                                                              |

---

## Coverage by Acceptance Criterion

| Req  | Acceptance Criterion                                                                                        | Test Case                                                                        | Type | Result |
| ---- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---- | ------ |
| AC-1 | Tests register a `page.routeWebSocket()` handler before clicking Connect and assert the status indicator transitions "connecting" → "connected" | positive: status transitions connecting -> connected after Connect is clicked        | P    | ✅     |
| AC-1 |                                                                                                                  | negative: status remains "disconnected" before Connect is clicked                    | N    | ✅     |
| AC-2 | (Challenge 1 — full mock) intercept the URL without connecting to the real server, push a fabricated message from the handler, assert it appears in the chat log | positive: a handler-pushed message renders in the chat log                           | P    | ✅     |
| AC-2 |                                                                                                                  | negative: the real server's welcome text never appears when fully mocked             | N    | ✅     |
| AC-3 | (Challenge 2 — selective forward) connect to the real server, forward most messages, modify "ticker" messages before they reach the page | positive: a "ticker" server message is rewritten before reaching the page            | P    | ✅     |
| AC-3 |                                                                                                                  | negative: non-ticker server messages are forwarded unmodified                        | N    | ✅     |
| AC-4 | (Challenge 3 — block frames) let the connection succeed but block outgoing messages containing "block"; assert the server never echoes them back | positive: a message containing "block" is never echoed back by the server            | P    | ✅     |
| AC-4 |                                                                                                                  | negative: a message that does not contain "block" is still forwarded and echoed      | N    | ✅     |
| AC-4 |                                                                                                                  | boundary: a message containing "block" as a substring (e.g. "unblock") is also blocked | B    | ✅     |
| AC-5 | Tests intercept an outgoing client message and assert its content matches what was typed in the input field    | positive: the message captured by onMessage exactly matches what was typed           | P    | ✅     |
| AC-5 |                                                                                                                  | negative: an empty input keeps Send disabled, so no client message is ever intercepted | N    | ✅     |
| AC-6 | Tests are isolated — WebSocket stubs prevent message bleed between tests                                        | positive (test A): a fabricated message is sent under this test's isolated stub      | P    | ✅     |
| AC-6 |                                                                                                                  | positive (test B): a fresh test never sees the previous test's fabricated message    | P    | ✅     |
| AXE  | The page must have no critical axe-core violations in every rendered state                                       | no violations on initial page load (disconnected)                                    | A11y | ✅     |
| AXE  |                                                                                                                  | no violations while the connection is pending ("connecting")                         | A11y | ✅     |
| AXE  |                                                                                                                  | no violations once connected with messages in the log                                | A11y | ✅     |
| REQ-NF1 | The page must meet its performance budget (load + key interaction)                                           | initial websocket-interception page load is within budget                            | Perf | ✅     |

---

## Defects

| ID  | Severity | Summary          | Found by | JIRA | Status |
| --- | -------- | ---------------- | -------- | ---- | ------ |
| —   | —        | No defects found | —        | —    | —      |

---

## Traceability Summary

- **ACs covered:** 6 / 6 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5 · AC-6)
- **Non-functional covered:** 2 / 2 (AXE multi-state · Performance budget)
- **Test cases:** 17 (P:8 · N:5 · B:1 · A11y:3 · Perf:1) × 4 browsers = **68 total**
- **Every POM element asserted by ≥1 case:** ✅ (`connectButton`/`statusIndicator` in AC-1, `messageLog` in AC-2/3/4/6/AXE, `messageInput`/`sendButton` in AC-4/5, `disconnectButton` in AC-1 negative)
- **Notable finding during test design:** the lab's guidance text says `ws://localhost:3001/ws`, but the deployed site actually opens `wss://stagecraftlabs.com/ws` — confirmed by instrumenting the `WebSocket` constructor on the live page before writing the spec; the POM/spec use the real observed URL, not the doc text
- **Notable finding during test design:** the "you: `<msg>`" chat line is added client-side optimistically the instant Send is clicked, independent of whether the server ever receives the frame — AC-4's block-frame tests assert on the absent `echo: <msg>` line specifically, not on the "you:" line, since the latter would pass even when a message never reached the server
- **Open defects:** 0
- **Exit criteria met:** ✅ — all P1+P2 requirements covered, 0 non-flaky failures, a11y clean across 3 states, 4 browsers green locally
