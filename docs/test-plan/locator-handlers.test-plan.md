# Test Plan — Locator Handlers (TAB1-36)

| Field      | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| JIRA Story | [TAB1-36](https://orhunakkan.atlassian.net/browse/TAB1-36) |
| Lab URL    | https://stagecraftlabs.com/practice/locator-handlers       |
| Spec file  | tests/locator-handlers/locator-handlers.spec.ts            |
| POM file   | pages/locator-handlers.page.ts                             |
| Generated  | 2026-07-14                                                 |

---

## 1. Scope

**In scope:**

- `page.addLocatorHandler()` registered for the cookie-consent banner (`role="dialog"`) before
  navigation, confirming the banner auto-dismisses with no manual interaction (REQ-01)
- Negative case: no handler registered → the cookie-consent banner remains visible and blocks
  interaction with elements underneath it (REQ-01a)
- "Force overlays every step" enabled end-to-end across all three checkout steps
  (Cart → Shipping → Payment → Confirmation), asserting each `Next` click advances despite a
  fresh overlay each time, with a handler registered (REQ-02)
- Negative case: same forced-overlay flow with no handler registered → at least one step fails to
  advance because the overlay blocks the `Next` click (REQ-02a)
- `page.removeLocatorHandler(locator)` called after step 2 completes; step 3 is then blocked by
  the overlay because no handler is active anymore (REQ-03)
- A handler registered with `{ times: 1 }` fires exactly once; subsequent overlay occurrences in
  the same flow are left unhandled and block interaction (REQ-04)
- Boundary: dismissal count assertion is exactly 1, not 0 and not >1, across repeated overlay
  occurrences (REQ-04a)
- Locator targeting precision: `role="dialog"` (cookie banner) vs. `role="alertdialog"` (session
  survey) — a handler scoped to one must not fire for the other (REQ-05, REQ-05a)
- Accessibility scan (meta) across load, overlay-visible, and post-dismiss states; a
  `@performance` budget test on initial page load

**Out of scope:**

- Any overlay type beyond the cookie-consent banner (`role="dialog"`) and session survey
  (`role="alertdialog"`) — no other overlay is named in the ACs
- Persistence of handler registration across navigations/reloads — not called out by any AC
- Checkout business logic beyond step advancement (e.g. cart totals, payment validation) — this
  lab's ACs are scoped to overlay handling, not checkout correctness

---

## 2. Test Types

| Type                  | Applied                                                                         |
| --------------------- | ------------------------------------------------------------------------------- |
| Functional (positive) | ✅                                                                              |
| Functional (negative) | ✅ (no-handler blocked cases; cross-role non-firing; post-removal blocking)     |
| Boundary value        | ✅ (`{ times: 1 }` fires exactly once — not 0, not >1)                          |
| Data-driven           | ✅ (per-step advancement table across Cart → Shipping → Payment → Confirmation) |
| Accessibility (axe)   | ✅ (load / overlay-visible / post-dismiss states)                               |
| Non-functional (perf) | ✅ (Navigation Timing budget)                                                   |
| Cross-browser         | ✅ (4 browsers)                                                                 |
| Mobile / responsive   | ❌ (out of scope — no AC coverage)                                              |

---

## 3. Environments & Data

| Field      | Value                                                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Target env | Staging (stagecraftlabs.com)                                                                                                                   |
| BASE_URL   | `https://stagecraftlabs.com` (`.env`)                                                                                                          |
| Test data  | No form/faker data required — overlay role selectors (`dialog`,`alertdialog`) and the "Force overlays every step" toggle state drive scenarios |

---

## 4. Browser / Device Matrix

| Browser         | Project name    | Included for this lab? |
| --------------- | --------------- | ---------------------- |
| Desktop Chrome  | Desktop Chrome  | ✅                     |
| Desktop Firefox | Desktop Firefox | ✅                     |
| Desktop Edge    | Desktop Edge    | ✅                     |
| Desktop Safari  | Desktop Safari  | ✅                     |

_(Source: `playwright.config.ts` projects[])_

---

## 5. Risk Assessment & Priority

| Area / Requirement                                                                 | Likelihood | Impact | Risk | Priority |
| ---------------------------------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| REQ-01: cookie-consent handler auto-dismisses before interaction                   | H          | H      | H    | P1       |
| REQ-01a: no handler → banner remains and blocks interaction                        | M          | M      | M    | P2       |
| REQ-02: forced overlays on every step, all 3 steps advance with handler registered | H          | H      | H    | P1       |
| REQ-02a: forced overlays, no handler → a step fails to advance                     | M          | H      | H    | P2       |
| REQ-03: handler removed after step 2 → step 3 blocked                              | H          | H      | H    | P1       |
| REQ-04: `{ times: 1 }` fires exactly once                                          | H          | H      | H    | P1       |
| REQ-04a: dismissal count boundary (exactly 1)                                      | M          | M      | M    | P2       |
| REQ-05 / REQ-05a: `dialog` vs `alertdialog` targeting precision                    | M          | H      | H    | P1       |
| Accessibility — load / overlay / post-dismiss states                               | L          | M      | L    | P2       |
| Performance budget                                                                 | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- [ ] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/locator-handlers`
- [ ] `BASE_URL` configured in `.env` (✅)
- [ ] POM exists: `pages/locator-handlers.page.ts` (pending Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-36
- [ ] `{ times: 1 }` boundary case confirms exactly one dismissal, no more
- [ ] Green across all 4 browsers in CI, or any divergence triaged appropriately
- [ ] RTM generated and up to date: `docs/rtm/locator-handlers.rtm.md`

---

## 8. Deliverables

| Artifact  | Path                                            | Status  |
| --------- | ----------------------------------------------- | ------- |
| Test Plan | docs/test-plan/locator-handlers.test-plan.md    | ✅ done |
| POM       | pages/locator-handlers.page.ts                  | pending |
| Spec file | tests/locator-handlers/locator-handlers.spec.ts | pending |
| RTM       | docs/rtm/locator-handlers.rtm.md                | pending |
| CI run    | GitHub Actions                                  | pending |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
