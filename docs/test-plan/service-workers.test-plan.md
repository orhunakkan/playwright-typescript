# Test Plan — Service Workers (TAB1-28)

| Field      | Value                                                  |
| ---------- | ------------------------------------------------------- |
| JIRA Story | [TAB1-28](https://orhunakkan.atlassian.net/browse/TAB1-28) |
| Lab URL    | https://stagecraftlabs.com/practice/service-workers    |
| Spec file  | tests/service-workers/service-workers.spec.ts          |
| POM file   | pages/service-workers.page.ts                          |
| Generated  | 2026-07-12                                               |

---

## 1. Scope

**In scope:**

- Registering the service worker via the UI button and confirming its status message
- Fetching `/api/sw-items` with the SW active and asserting the response source is `cache`
  (stale mock data), not `network`
- Fetching `/api/sw-items` with no SW registered and asserting the response source is `network`
  (fresh data) — the control case that proves the source assertion methodology is valid
- `browser.newContext({ serviceWorkers: 'block' })` + `page.route()` intercepting
  `/api/sw-items` as expected
- Default context (SW active, not blocked) + `page.route()` **not** intercepting — the active
  SW claims the request before Playwright's routing layer sees it
- Default context with **no SW registered** + `page.route()` **does** intercept — isolates that
  it is specifically the active SW pre-empting routing, not some other mechanism
- `context.setOffline(true)` with an active SW — UI shows cached/stale data (SW serves from its
  own cache, unaffected by the network being down)
- `context.setOffline(true)` with the SW blocked — UI shows a network error state
  (`role="alert"`, "Failed to fetch")
- Test suite structure: caching-strategy tests (SW active) are organized in a separate
  `test.describe()` from route-interception tests (SW blocked), per AC-6
- Accessibility scanning across states: initial load, cache-sourced items rendered,
  network-sourced items rendered, and the offline error state
- Performance budget: initial page load

**Out of scope:**

- Real backend `/api/sw-items` reliability / load characteristics (server itself, not this UI)
- Service worker lifecycle edge cases beyond register/fetch (update, skipWaiting, multiple tabs)
- Cache eviction or storage-quota behavior of the SW's own cache implementation

---

## 2. Test Types

| Type                   | Applied                                                                |
| ----------------------- | ------------------------------------------------------------------------ |
| Functional (positive)   | ✅                                                                       |
| Functional (negative)   | ✅ (unregistered-SW control, non-offline control, no-route control)      |
| Boundary value          | ✅ (SW-registration-before-offline sequencing)                           |
| Data-driven             | ❌ (fixed 3-item response shape; no parametrizable input space)          |
| Accessibility (axe)     | ✅ (initial load + cache-sourced + network-sourced + offline-error)      |
| Non-functional (perf)   | ✅ (Navigation Timing budget)                                            |
| Cross-browser           | ✅ (3 browsers — Desktop Safari excluded, TAB1-53)                       |
| Mobile / responsive     | ❌ (out of scope)                                                        |

---

## 3. Environments & Data

| Field        | Value                                                                             |
| ------------- | ------------------------------------------------------------------------------------ |
| Target env   | Staging (stagecraftlabs.com)                                                       |
| BASE_URL     | `https://stagecraftlabs.com` (`.env`)                                              |
| SW control   | `navigator.serviceWorker` (via UI button), `browser.newContext({ serviceWorkers })` |
| Real backend | Lab requires a live backend for `/api/sw-items` (per JIRA: "Requires backend")     |
| Test data    | Fixed response shapes observed live: cache → `Cached Widget/Gadget/Doohickey (stale)`; network → `Fresh Widget/Gadget/Doohickey` |

---

## 4. Browser / Device Matrix

| Browser         | Project name    | Included for this lab? |
| ---------------- | ----------------- | ----------------------- |
| Desktop Chrome  | Desktop Chrome   | ✅ |
| Desktop Firefox | Desktop Firefox  | ✅ |
| Desktop Edge    | Desktop Edge     | ✅ |
| Desktop Safari  | Desktop Safari   | ❌ excluded — see below |

_(Source: `playwright.config.ts` projects[])_

**Desktop Safari exclusion (TAB1-53):** Playwright's WebKit driver blocks an active service
worker from ever responding once `context.setOffline(true)` is set — confirmed with a raw
`fetch()` call, no app or test code involved. Not fixable in this app's source. This is an
explicit, approved team scope decision (not a silent skip): `playwright.config.ts` sets
`testIgnore: '**/service-workers/**'` on the `Desktop Safari` project only, so no test in this
spec ever runs on Safari, and CI does not report it as failed, flaky, or skipped for this lab. All
other labs in the repo keep full 4-browser coverage. This scope reduction applies to this lab
only and should be revisited if Playwright resolves the underlying WebKit limitation.

---

## 5. Risk Assessment & Priority

| Area / Requirement                                                             | Likelihood | Impact | Risk | Priority |
| ---------------------------------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| AC-1: registering SW + fetch shows `cache`-sourced stale data                      | H          | H      | H    | P1       |
| AC-2: `serviceWorkers: 'block'` + `page.route()` intercepts `/api/sw-items`        | H          | H      | H    | P1       |
| AC-3: active (unblocked) SW pre-empts `page.route()`                               | H          | H      | H    | P1       |
| AC-3 control: no SW registered, `page.route()` does intercept                      | H          | H      | H    | P1       |
| AC-4: `setOffline(true)` + active SW shows cached/stale data                       | H          | H      | H    | P1       |
| AC-5: `setOffline(true)` + blocked SW shows network error state                    | H          | H      | H    | P1       |
| AC-1 control: no SW registered, fetch shows `network`-sourced fresh data           | M          | M      | M    | P2       |
| AC-4 boundary: SW must be registered before going offline for cache to be populated | M          | M      | M    | P2       |
| AC-5 control: blocked SW while online still fetches normally                       | M          | M      | M    | P2       |
| AC-6: caching-strategy tests structurally separated from route-interception tests  | M          | L      | L    | P2       |
| Accessibility — all 4 UI states                                                    | L          | M      | L    | P2       |
| Performance budget                                                                 | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- [ ] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/service-workers`
- [ ] `BASE_URL` configured in `.env` (✅)
- [ ] POM exists: `pages/service-workers.page.ts` (generated in Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 + P2 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-28
- [ ] Accessibility: 0 critical/serious violations (or tracked with a defect id) in all states
- [ ] Green across all 3 in-scope browsers in CI (Desktop Safari excluded — TAB1-53)
- [ ] RTM generated and up to date: `docs/rtm/service-workers.rtm.md`

---

## 8. Deliverables

| Artifact   | Path                                              | Status  |
| ---------- | ---------------------------------------------------- | ------- |
| Test Plan  | docs/test-plan/service-workers.test-plan.md          | ✅ done |
| POM        | pages/service-workers.page.ts                        | pending |
| Spec file  | tests/service-workers/service-workers.spec.ts        | pending |
| RTM        | docs/rtm/service-workers.rtm.md                      | pending |
| CI run     | GitHub Actions                                        | pending |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
