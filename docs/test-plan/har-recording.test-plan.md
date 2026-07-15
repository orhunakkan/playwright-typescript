# Test Plan — HAR Recording (TAB1-27)

| Field      | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| JIRA Story | [TAB1-27](https://orhunakkan.atlassian.net/browse/TAB1-27) |
| Lab URL    | https://stagecraftlabs.com/practice/har-recording          |
| Spec file  | tests/har-recording/har-recording.spec.ts                  |
| POM file   | pages/har-recording.page.ts                                |
| Generated  | 2026-07-12                                                 |

---

## 1. Scope

**In scope:**

- Recording a HAR via `page.routeFromHAR("products.har", { update: true })` before navigating;
  verifying the file is written to disk (flushed on `context.close()`)
- Replaying a recorded HAR (no `{ update }`) and asserting the product list renders all 10
  products from the recorded data with no live server involved (default `notFound: 'abort'`)
- Combining HAR replay with `page.route()` to override the `GET /api/products` endpoint with a
  mock response, confirming last-registered-route precedence over the HAR while all other
  requests (page shell, CSS, static assets) still come from the HAR
- "In stock" / "Out of stock" badge text correctness per product, matched against the actual
  recorded data (data-driven across all 10 products)
- HAR replay correctly serving `GET /api/products`, confirmed by the "10 products loaded" status
  text, including after a manual "Reload products" re-fetch within a replayed test
- Accessibility scanning of the replayed page (load state)
- Performance budget on initial page load

**Out of scope:**

- Live-backend reliability/latency characteristics of `/api/products` (the server itself)
- `tracing.startHar` / `tracing.stopHar` (JIRA description lists these as covered APIs, but no
  AC exercises them — the lab's guidance and workflow steps only describe `page.routeFromHAR`)
- HAR content mutation/edit tooling (`updateContent`, `updateMode`) beyond the default `update: true`
- Long-term HAR fixture staleness (re-recording cadence) beyond a one-time recording

---

## 2. Test Types

| Type                  | Applied                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| Functional (positive) | ✅                                                                        |
| Functional (negative) | ✅ (no live network call during replay; unmodified endpoints stay on HAR) |
| Boundary value        | ✅ (exactly 10 product cards, not more/fewer)                             |
| Data-driven           | ✅ (all 10 products × expected stock badge text)                          |
| Accessibility (axe)   | ✅ (replayed page load state)                                             |
| Non-functional (perf) | ✅ (Navigation Timing budget)                                             |
| Cross-browser         | ✅ (4 browsers)                                                           |
| Mobile / responsive   | ❌ (out of scope)                                                         |

---

## 3. Environments & Data

| Field        | Value                                                                                                                                                                                                                                              |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Target env   | Staging (stagecraftlabs.com)                                                                                                                                                                                                                       |
| BASE_URL     | `https://stagecraftlabs.com` (`.env`)                                                                                                                                                                                                              |
| HAR control  | `page.routeFromHAR()`, `context.routeFromHAR()`, `page.route()`                                                                                                                                                                                    |
| Real backend | Lab requires a live backend for the one-time recording (per JIRA: "Requires backend")                                                                                                                                                              |
| HAR fixture  | `fixtures/har/har-recording/products.har` — recorded once against the live `/api/products` endpoint (10 products: 7 in stock, 3 out of stock — 4K Monitor, Webcam 1080p, LED Desk Lamp) and committed to source control per the lab's own guidance |
| Test data    | Fixed product table (id, name, expected stock text) sourced from the recorded HAR — no faker                                                                                                                                                       |

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

| Area / Requirement                                                             | Likelihood | Impact | Risk | Priority |
| ------------------------------------------------------------------------------ | ---------- | ------ | ---- | -------- |
| HAR recording via `routeFromHAR({ update: true })` creates a file on disk      | H          | H      | H    | P1       |
| HAR replay renders all 10 recorded products with no live server                | H          | H      | H    | P1       |
| `page.route()` override wins for the overridden endpoint over the HAR          | H          | H      | H    | P1       |
| Badge text ("In stock"/"Out of stock") matches recorded data, all 10 products  | H          | H      | H    | P1       |
| Replay serves `GET /api/products`, confirmed by "10 products loaded"           | H          | H      | H    | P1       |
| Unmodified requests still served from HAR when only one endpoint is overridden | M          | H      | H    | P1       |
| Replay truly offline — default `notFound: 'abort'` never reaches live origin   | M          | H      | H    | P1       |
| Re-fetch ("Reload products") within a replayed test still reads from HAR       | M          | M      | M    | P2       |
| Accessibility — replayed page load state                                       | L          | M      | L    | P2       |
| Performance budget                                                             | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- [ ] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/har-recording`
- [ ] `BASE_URL` configured in `.env` (✅)
- [ ] HAR fixture recorded and committed: `fixtures/har/har-recording/products.har` (✅)
- [ ] POM exists: `pages/har-recording.page.ts` (generated in Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 + P2 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-27
- [ ] Accessibility: 0 critical/serious violations (or tracked with a defect id)
- [ ] Green across all 4 configured browsers in CI
- [ ] RTM generated and up to date: `docs/rtm/har-recording.rtm.md`

---

## 8. Deliverables

| Artifact    | Path                                      | Status  |
| ----------- | ----------------------------------------- | ------- |
| Test Plan   | docs/test-plan/har-recording.test-plan.md | ✅ done |
| HAR fixture | fixtures/har/har-recording/products.har   | ✅ done |
| POM         | pages/har-recording.page.ts               | pending |
| Spec file   | tests/har-recording/har-recording.spec.ts | pending |
| RTM         | docs/rtm/har-recording.rtm.md             | pending |
| CI run      | GitHub Actions                            | pending |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → HAR fixture recording → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
