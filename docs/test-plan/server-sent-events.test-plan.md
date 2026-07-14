# Test Plan — Server-Sent Events (TAB1-38)

| Field      | Value                                                       |
| ---------- | ------------------------------------------------------------ |
| JIRA Story | [TAB1-38](https://orhunakkan.atlassian.net/browse/TAB1-38)  |
| Lab URL    | https://stagecraftlabs.com/practice/server-sent-events       |
| Spec file  | tests/server-sent-events/server-sent-events.spec.ts          |
| POM file   | pages/server-sent-events.page.ts                              |
| Generated  | 2026-07-14                                                    |

---

## 1. Scope

**In scope:**

- Clicking "Start Stream" opens an `EventSource` connection to `/api/sse`; `expect.poll` waits
  until at least 3 entries are visible in the "SSE event log" region
- Each SSE event type (info, warn, error, system) renders with its corresponding colour badge
  text in the log
- `page.waitForResponse` captures the `/api/sse` response and asserts `Content-Type:
  text/event-stream`
- `page.route("/api/sse", ...)` stubs a hand-crafted 2–3 event SSE payload; exactly those
  entries — and no others — appear in the log (deterministic, no live backend)
- Clicking "Stop Stream" halts further log growth (verified against a stubbed stream for
  determinism, since the live backend streams too fast/non-deterministically to reliably catch
  mid-stream)
- Start/Stop button enabled/disabled state transitions
- Test isolation — no leaked open SSE connection between tests
- Accessibility scanning across states: idle (pre-stream), streaming/populated log, stopped
- Performance budget: initial page load

**Out of scope:**

- Real backend SSE server reliability / load characteristics (server itself, not this UI)
- Reconnection/retry behavior beyond the single start/stop flow described in the ACs
- Multi-tab or multi-client stream synchronization
- Log persistence across page reloads

---

## 2. Test Types

| Type                  | Applied                                                              |
| ---------------------- | --------------------------------------------------------------------- |
| Functional (positive)  | ✅                                                                    |
| Functional (negative)  | ✅ (empty pre-stream state, no extra/duplicate entries, exact badge match) |
| Boundary value         | ✅ (2 vs. 3 stubbed events, ≥3 entries threshold)                     |
| Data-driven            | ✅ (event type → badge colour/text table: info/warn/error/system)    |
| Accessibility (axe)    | ✅ (idle + streaming + stopped states)                                |
| Non-functional (perf)  | ✅ (Navigation Timing budget)                                         |
| Cross-browser          | ✅ (4 browsers)                                                       |
| Mobile / responsive    | ❌ (out of scope)                                                     |

---

## 3. Environments & Data

| Field           | Value                                                                                  |
| ---------------- | --------------------------------------------------------------------------------------- |
| Target env      | Staging (stagecraftlabs.com)                                                            |
| BASE_URL        | `https://stagecraftlabs.com` (`.env`)                                                   |
| SSE control     | `page.route("/api/sse", ...)`, `route.fulfill()` with a hand-crafted `text/event-stream` body |
| Real backend    | Lab requires a live backend SSE endpoint (per JIRA: "Requires backend") for AC-1/AC-3   |
| Test data       | Fixed hand-crafted SSE payloads (2–3 events, mixed types) — no faker                    |

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

| Area / Requirement                                                          | Likelihood | Impact | Risk | Priority |
| ----------------------------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| `expect.poll` waits until ≥3 entries visible after Start Stream               | H          | H      | H    | P1       |
| Event type → badge colour/text mapping (info/warn/error)                      | H          | H      | H    | P1       |
| `waitForResponse` + `Content-Type: text/event-stream` assertion               | H          | H      | H    | P1       |
| `page.route()` stub delivers exactly the stubbed entries, no more             | H          | H      | H    | P1       |
| Stop Stream halts log growth                                                  | H          | H      | H    | P1       |
| Test isolation — no leaked SSE connection between tests                       | M          | H      | H    | P1       |
| Empty pre-stream state (no entries, "No events yet" message)                  | M          | M      | M    | P2       |
| Button enabled/disabled transitions (Start ↔ Stop)                            | M          | M      | M    | P2       |
| Boundary — 2-event vs. 3-event stub payload                                   | L          | M      | M    | P2       |
| system-type badge rendering (connecting/complete)                             | L          | M      | L    | P2       |
| Accessibility — idle/streaming/stopped states                                 | L          | M      | L    | P2       |
| Performance budget                                                            | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- [ ] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/server-sent-events`
- [ ] `BASE_URL` configured in `.env` (✅)
- [ ] POM exists: `pages/server-sent-events.page.ts` (generated in Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 + P2 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-38
- [ ] Accessibility: 0 critical/serious violations (or tracked with a defect id) in all states
- [ ] Green across all 4 configured browsers in CI
- [ ] RTM generated and up to date: `docs/rtm/server-sent-events.rtm.md`

---

## 8. Deliverables

| Artifact   | Path                                                    | Status  |
| ---------- | -------------------------------------------------------- | ------- |
| Test Plan  | docs/test-plan/server-sent-events.test-plan.md            | ✅ done |
| POM        | pages/server-sent-events.page.ts                           | pending |
| Spec file  | tests/server-sent-events/server-sent-events.spec.ts        | pending |
| RTM        | docs/rtm/server-sent-events.rtm.md                         | pending |
| CI run     | GitHub Actions                                              | pending |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
