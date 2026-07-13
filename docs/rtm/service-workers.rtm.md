# Requirements Traceability Matrix — Service Workers

| Field      | Value                                                             |
| ---------- | -------------------------------------------------------------------- |
| JIRA Story | [TAB1-28](https://orhunakkan.atlassian.net/browse/TAB1-28)          |
| Lab URL    | https://stagecraftlabs.com/practice/service-workers                 |
| Spec file  | tests/service-workers/service-workers.spec.ts                       |
| POM file   | pages/service-workers.page.ts                                       |
| Last run   | 2026-07-12 — 54 / 56 passed (Chrome 14/14 · Firefox 14/14 · Edge 14/14 · Safari 12/14, flaky 2–4 failures across repeated runs). No tests skipped. |
| Generated  | 2026-07-12                                                           |
| Status     | ⚠️ NOT Done — 2 open blockers (TAB1-52, TAB1-53). Story held at In Review. |

---

## Coverage by Acceptance Criterion

| Req  | Acceptance Criterion                                                                                                         | Test Case                                                                                             | Type  | Result |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----- | ------ |
| AC-1 | Register the service worker via the button, fetch items, assert the response source is from the SW cache (stale)                  | positive: after registering the service worker, fetched items are served from its cache (stale)         | P     | ✅ (4/4 browsers) |
| AC-1 |                                                                                                                                      | negative (control): without registering the service worker, fetched items are served fresh from the network | N | ✅ (4/4 browsers) |
| AC-2 | Create a browser context with `serviceWorkers: "block"` and verify `page.route()` can intercept `/api/sw-items`                    | positive: serviceWorkers: "block" lets page.route() intercept /api/sw-items                              | P     | ✅ (4/4 browsers) |
| AC-2 | (negative control, doubles with AC-5)                                                                                               | negative (control): serviceWorkers: "block" while online still fetches normally from the network         | N     | ✅ (4/4 browsers) |
| AC-3 | Without SW blocking, confirm `page.route()` does not intercept a request the active SW handles first                               | positive: with the service worker active (not blocked), page.route() does not intercept — the SW claims the request first | P | ✅ (4/4 browsers) |
| AC-3 |                                                                                                                                      | negative (control): with no service worker registered, page.route() does intercept the same request      | N     | ✅ (4/4 browsers) |
| AC-4 | `context.setOffline(true)` with an active service worker shows cached/stale data                                                   | positive: context.setOffline(true) with an active service worker still shows cached/stale data           | P     | ✅ Chrome/Firefox/Edge — ❌ **Safari (TAB1-53, not skipped)** |
| AC-4 | (boundary — cache must be populated before going offline)                                                                          | boundary: going offline before ever registering the service worker leaves no cache to serve, so the fetch fails | B | ✅ Chrome/Firefox/Edge — ⚠️ **Safari flaky (TAB1-53, not skipped)** |
| AC-5 | `context.setOffline(true)` with the service worker blocked shows a network error state                                            | positive: serviceWorkers: "block" + context.setOffline(true) shows a network error state                 | P     | ✅ Chrome/Firefox/Edge — ⚠️ **Safari flaky (TAB1-53, not skipped)** |
| AC-6 | Caching-strategy tests leave the SW active and are structurally separated from route()-interception tests                          | Enforced by spec structure: `Caching strategy — service worker left active (AC-1, AC-4)` vs. `page.route() interception — service worker blocked via context option (AC-2, AC-3, AC-5)` describe blocks | — | ✅ |
| AXE  | The page must have no critical/serious axe-core violations in every rendered state (color-contrast excluded — TAB1-52)             | no violations on initial page load                                                                        | A11y  | ✅ (4/4 browsers) |
| AXE  |                                                                                                                                      | no violations once items are rendered from the service worker cache                                       | A11y  | ✅ (4/4 browsers) |
| AXE  |                                                                                                                                      | no violations once items are rendered from the network                                                    | A11y  | ✅ (4/4 browsers) |
| AXE  |                                                                                                                                      | no violations in the offline network-error state                                                          | A11y  | ✅ Chrome/Firefox/Edge — ❌/⚠️ **Safari flaky (TAB1-53, not skipped)** |
| REQ-NF1 | The page must meet its performance budget (load + key interaction)                                                              | initial service-workers page load is within budget                                                        | Perf  | ✅ (4/4 browsers) |

---

## Defects / Blockers (both open — story held at In Review, not Done)

| ID       | Type            | Summary                                                                                         | Fixable in app source? | JIRA     | Status |
| -------- | --------------- | ------------------------------------------------------------------------------------------------- | ----------------------- | -------- | ------ |
| TAB1-52  | App defect (a11y, Serious) | Insufficient color contrast on "Service worker registered" status text — 3.5:1 (needs 4.5:1) | **Yes** — darken the text color | [TAB1-52](https://orhunakkan.atlassian.net/browse/TAB1-52) | Open |
| TAB1-53  | Test-tooling blocker | Playwright WebKit `context.setOffline()` prevents an active service worker from ever responding, confirmed with a raw `fetch()` call (no app/test code involved) | **No** — Playwright/WebKit driver limitation; needs upgrade or a scope decision | [TAB1-53](https://orhunakkan.atlassian.net/browse/TAB1-53) | Open |

---

## Why 4 tests are red/flaky on Safari — and why they are NOT skipped

`context.setOffline(true)` in Playwright's WebKit browser prevents *any* request — including ones
an already-registered, active service worker would normally intercept and answer from its own
cache — from ever completing. Confirmed directly with a raw `fetch()` call from the page (bypassing
all app and test code):

```js
// navigator.serviceWorker.controller is truthy at this point — the SW does control the page
await context.setOffline(true);
await page.evaluate(() => fetch('/api/sw-items').then(r => r.json()).catch(e => e.message));
// -> "Load failed" (immediate failure; the SW never gets a chance to respond)
```

Chromium and Firefox both correctly let the active SW answer from cache while offline; only WebKit
fails. Timing/hydration races were ruled out (`networkidle` waits before and after registration,
multi-second propagation delays, reloading the page to guarantee the SW controls it) — none of it
changes the outcome. Repeated runs (`--repeat-each=3`) show the 4 affected tests fail or flake in
2 of 3 to 3 of 3 runs, every time.

Per team policy, these tests are **not** wrapped in `test.skip()`. They run for real on every CI
pass and are expected to be red/flaky specifically on the `Desktop Safari` project until TAB1-53 is
resolved (Playwright upgrade, upstream fix, or an explicit scope decision to descope WebKit from
this AC — not something this pipeline decides unilaterally).

---

## Traceability Summary

- **ACs covered:** 6 / 6 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5 · AC-6) on Chrome, Firefox, Edge. AC-4/AC-5 not reliably coverable on Safari due to TAB1-53.
- **Non-functional covered:** 2 / 2 (AXE multi-state · Performance budget) on Chrome, Firefox, Edge
- **Test cases:** 14 tests × 4 browsers = 56 defined and executed (0 skipped). Latest run: 54 passed, 2 failed (both Safari, both traced to TAB1-53); repeated runs show 2–4 Safari failures depending on timing (flaky, not deterministic)
- **Every POM element asserted by ≥1 case:** ✅ (`registerButton`/`registrationStatus` in AC-1/AC-3, `fetchItemsButton`/`fetchedItems`/`itemSourceBadge` in AC-1/AC-2/AC-3/AC-4/AC-5, `errorRegion` in AC-4 boundary/AC-5/a11y)
- **Notable finding during test design:** the "source" badge text ("cache" / "network" / "route") is rendered directly from the JSON response's `source` field — confirmed by mocking a `page.route()` response with `source: "route"` and observing that exact literal text rendered, which made AC-2/AC-3 assertions straightforward
- **Notable finding during test design:** exact fetch-failure error text differs per browser (Chromium "Failed to fetch", Firefox "NetworkError when attempting to fetch resource.") — AC-5/boundary assertions check `errorRegion` visibility and non-empty content rather than pinning browser-specific wording
- **Open blockers:** 2 (TAB1-52 — app defect, source-fixable; TAB1-53 — test-tooling limitation, not source-fixable)
- **Exit criteria met:** ❌ — NOT met. Two open blockers linked to the story. Story held at **In Review**, not Done, until both are resolved or a scope decision is made on TAB1-53.
