# Test Plan — WebSocket Interception (TAB1-26)

| Field      | Value                                                       |
| ---------- | ----------------------------------------------------------- |
| JIRA Story | [TAB1-26](https://orhunakkan.atlassian.net/browse/TAB1-26)  |
| Lab URL    | https://stagecraftlabs.com/practice/websocket-interception  |
| Spec file  | tests/websocket-interception/websocket-interception.spec.ts |
| POM file   | pages/websocket-interception.page.ts                        |
| Generated  | 2026-07-12                                                  |

---

## 1. Scope

**In scope:**

- `page.routeWebSocket()` registered before clicking Connect; status indicator transitions
  "connecting" → "connected"
- Challenge 1 (full mock): intercept the URL without touching the real server, push a fabricated
  message from the handler, assert it renders in the chat log
- Challenge 2 (selective forward): connect to the real server, forward most frames untouched,
  rewrite "ticker" messages before they reach the page
- Challenge 3 (block frames): allow the connection, block outgoing frames containing "block",
  assert the server never echoes them back
- Outgoing client message interception — assert the intercepted frame content matches what was
  typed in the input field
- Test isolation — no WebSocket message bleed between tests (stub/reset per test)
- Accessibility scanning across connection states: disconnected, connecting, connected, message-received
- Performance budget: initial page load

**Out of scope:**

- Real backend WebSocket server reliability / load characteristics (server itself, not this UI)
- Reconnection/retry backoff behavior beyond the single connect flow described in the ACs
- Multi-client / multi-tab chat synchronization
- Message persistence across page reloads

---

## 2. Test Types

| Type                  | Applied                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| Functional (positive) | ✅                                                                     |
| Functional (negative) | ✅ (unblocked substrings, non-ticker passthrough, empty input)         |
| Boundary value        | ✅ (substring match for "block", ticker vs. non-ticker classification) |
| Data-driven           | ✅ (message content table: normal / ticker / block-containing)         |
| Accessibility (axe)   | ✅ (disconnected + connecting + connected + message states)            |
| Non-functional (perf) | ✅ (Navigation Timing budget)                                          |
| Cross-browser         | ✅ (4 browsers)                                                        |
| Mobile / responsive   | ❌ (out of scope)                                                      |

---

## 3. Environments & Data

| Field        | Value                                                                                |
| ------------ | ------------------------------------------------------------------------------------ |
| Target env   | Staging (stagecraftlabs.com)                                                         |
| BASE_URL     | `https://stagecraftlabs.com` (`.env`)                                                |
| WS control   | `page.routeWebSocket()`, `WebSocketRoute.send()`, `WebSocketRoute.onMessage()`       |
| Real backend | Lab requires a live backend WebSocket endpoint (per JIRA: "Requires backend")        |
| Test data    | Fixed message tables (normal text, "ticker"-prefixed, "block"-containing) — no faker |

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

| Area / Requirement                                                           | Likelihood | Impact | Risk | Priority |
| ---------------------------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| `routeWebSocket()` registered pre-Connect; status "connecting" → "connected" | H          | H      | H    | P1       |
| Challenge 1 — full mock intercept + fabricated message in chat log           | H          | H      | H    | P1       |
| Challenge 2 — selective forward + ticker message rewrite                     | H          | H      | H    | P1       |
| Challenge 3 — block frames containing "block", never echoed                  | H          | H      | H    | P1       |
| Outgoing client message content matches typed input                          | H          | H      | H    | P1       |
| Test isolation — no message bleed between tests                              | M          | H      | H    | P1       |
| Non-ticker messages pass through unmodified (Challenge 2 negative)           | M          | M      | M    | P2       |
| Non-"block" messages still forwarded/echoed (Challenge 3 negative)           | M          | M      | M    | P2       |
| Substring boundary — "blocked"/"unblock" also blocked                        | M          | M      | M    | P2       |
| Empty/whitespace input handling                                              | L          | M      | M    | P2       |
| Accessibility — all connection/message states                                | L          | M      | L    | P2       |
| Performance budget                                                           | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- [ ] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/websocket-interception`
- [ ] `BASE_URL` configured in `.env` (✅)
- [ ] POM exists: `pages/websocket-interception.page.ts` (generated in Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 + P2 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-26
- [ ] Accessibility: 0 critical/serious violations (or tracked with a defect id) in all states
- [ ] Green across all 4 configured browsers in CI
- [ ] RTM generated and up to date: `docs/rtm/websocket-interception.rtm.md`

---

## 8. Deliverables

| Artifact  | Path                                                        | Status  |
| --------- | ----------------------------------------------------------- | ------- |
| Test Plan | docs/test-plan/websocket-interception.test-plan.md          | ✅ done |
| POM       | pages/websocket-interception.page.ts                        | pending |
| Spec file | tests/websocket-interception/websocket-interception.spec.ts | pending |
| RTM       | docs/rtm/websocket-interception.rtm.md                      | pending |
| CI run    | GitHub Actions                                              | pending |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
