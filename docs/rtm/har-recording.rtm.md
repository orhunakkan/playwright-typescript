# Requirements Traceability Matrix — HAR Recording

| Field      | Value                                                                |
| ---------- | ---------------------------------------------------------------------- |
| JIRA Story | [TAB1-27](https://orhunakkan.atlassian.net/browse/TAB1-27)            |
| Lab URL    | https://stagecraftlabs.com/practice/har-recording                     |
| Spec file  | tests/har-recording/har-recording.spec.ts                              |
| POM file   | pages/har-recording.page.ts                                            |
| HAR fixture| fixtures/har/har-recording/products.har                                |
| Last run   | 2026-07-12 — 84 / 84 passed (Chrome · Firefox · Edge · Safari)         |
| Generated  | 2026-07-12                                                              |

---

## Coverage by Acceptance Criterion

| Req  | Acceptance Criterion                                                                                        | Test Case                                                                        | Type | Result |
| ---- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---- | ------ |
| AC-1 | Tests record a HAR by passing `{ update: true }` to `page.routeFromHAR()` before navigating and verify the HAR file is created on disk | positive: routeFromHAR({ update: true }) + context.close() creates the HAR file on disk | P    | ✅     |
| AC-1 |                                                                                                                  | negative: the file does not exist until the recording context is closed              | N    | ✅     |
| AC-2 | Tests replay the recorded HAR in a second test (without `{ update }`) and assert the product list renders all 10 products from the recorded data without a live server | positive: replaying the HAR renders all 10 recorded products with no live network call | P    | ✅     |
| AC-2 |                                                                                                                  | negative: default notFound "abort" blocks any URL not present in the HAR, proving replay never falls back to the network | N    | ✅     |
| AC-3 | Tests combine HAR replay with `page.route()` to override a single endpoint with a mock response while all other requests are served from the HAR | positive: a page.route() override for /api/products wins over the HAR-recorded response | P    | ✅     |
| AC-3 |                                                                                                                  | negative: without registering an override, replaying the same HAR still serves the original 10 products | N    | ✅     |
| AC-4 | Tests assert the correct "In stock" and "Out of stock" badge text appears for products as recorded in the HAR  | data: all 10 recorded products × expected stock badge text                           | D    | ✅     |
| AC-5 | Tests verify the HAR replay correctly serves the `GET /api/products` endpoint, confirmed by the "10 products loaded" status | positive: initial replayed load shows "10 products loaded"                           | P    | ✅     |
| AC-5 |                                                                                                                  | positive: clicking "Reload products" re-fetches and still shows "10 products loaded" from the HAR | P    | ✅     |
| AXE  | The page must have no critical axe-core violations in every rendered state                                       | no violations on initial page load (live)                                            | A11y | ✅     |
| AXE  |                                                                                                                  | no violations when the page is rendered entirely from a replayed HAR                 | A11y | ✅     |
| REQ-NF1 | The page must meet its performance budget (load + key interaction)                                           | initial har-recording page load is within budget                                     | Perf | ✅     |

---

## Defects

| ID  | Severity | Summary          | Found by | JIRA | Status |
| --- | -------- | ---------------- | -------- | ---- | ------ |
| —   | —        | No defects found | —        | —    | —      |

---

## Traceability Summary

- **ACs covered:** 5 / 5 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5)
- **Non-functional covered:** 2 / 2 (AXE multi-state · Performance budget)
- **Test cases:** 21 (P:5 · N:3 · D:10 · A11y:2 · Perf:1) × 4 browsers = **84 total**
- **Every POM element asserted by ≥1 case:** ✅ (`reloadProductsButton` in AC-5, `statusRegion` in AC-1/2/3/5/AXE, `errorRegion` unused by any AC — kept for completeness/future error-state coverage per network-api's precedent, not asserted since no AC requires it, `productCards`/`productCard()`/`stockBadge()` in AC-2/3/4)
- **Notable finding during test design:** `context.setOffline(true)` combined with `routeFromHAR()` blocks navigation at a lower network layer than route interception in Firefox and WebKit (`NS_ERROR_OFFLINE`), even though it works in Chromium — the "no live server" claim in AC-2 is instead proven cross-browser by `routeFromHAR()`'s default `notFound: 'abort'` behavior alone (a negative test confirms navigation to a URL absent from the HAR is rejected outright, never falling back to the network)
- **Notable finding during test design:** `role="status"` only derives its accessible *name* from an explicit `aria-label` per the ARIA spec, not from text content — the product-count `<span role="status">` has no `aria-label`, so `getByRole('status', { name: ... })` matches zero elements even though the correct text is present; the POM instead scopes `statusRegion` to `span[role="status"]` to disambiguate it from the transient loading `<div role="status" aria-label="Loading products">` that briefly coexists during a Reload-triggered refetch
- **Notable finding during test design:** the HAR fixture (`fixtures/har/har-recording/products.har`) was recorded once against the live `/api/products` endpoint and committed to source control, per the lab's own guidance ("HAR files can be committed to source control as test fixtures") — AC-1's tests record to a fresh temp-directory HAR on every run instead of overwriting the committed fixture, keeping the replay tests (AC-2 through AC-5) deterministic regardless of local test execution
- **Open defects:** 0
- **Exit criteria met:** ✅ — all P1+P2 requirements covered, 0 non-flaky failures, a11y clean across 2 states, 4 browsers green locally
