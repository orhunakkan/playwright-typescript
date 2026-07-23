# Requirements Traceability Matrix — Touch & Mobile Gestures

| Field      | Value                                                                                                      |
| ---------- | ---------------------------------------------------------------------------------------------------------- |
| JIRA Story | [TAB1-41](https://orhunakkan.atlassian.net/browse/TAB1-41)                                                 |
| Lab URL    | https://stagecraftlabs.com/practice/touch-gestures                                                         |
| Spec file  | tests/touch-gestures/touch-gestures.spec.ts                                                                |
| POM file   | pages/touch-gestures.page.ts                                                                               |
| Last run   | 2026-07-14 — 60 / 60 passed, 12 skipped (Chrome · Firefox · Edge · Safari) — CI verified after TAB1-59 fix |
| Generated  | 2026-07-14                                                                                                 |

---

## Coverage by Acceptance Criterion

| Req     | Acceptance Criterion                                                                        | Test Case                                                                            | Type | Result                              |
| ------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---- | ----------------------------------- |
| AC-1    | locator.tap() on "Tap target" increments the touch-only tap counter                         | boundary: counter starts at 0 before any tap                                         | B    | ✅                                  |
| AC-1    |                                                                                             | positive: a single tap increments the counter to 1                                   | P    | ✅                                  |
| AC-1    |                                                                                             | positive: three sequential taps accumulate to 3                                      | P    | ✅                                  |
| AC-2    | locator.click() on the same button does not increment the counter                           | negative: a mouse click leaves the counter at 0                                      | N    | ✅                                  |
| AC-2    |                                                                                             | negative: repeated clicks still leave the counter unchanged                          | N    | ✅                                  |
| AC-2    |                                                                                             | positive contrast: a tap after clicks still increments by exactly 1                  | P    | ✅                                  |
| AC-3    | Horizontal touch swipe advances the active slide indicator (Chromium-only — see note below) | positive: a swipe advances from Slide 1 to Slide 2 and updates the indicator         | P    | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| AC-3    |                                                                                             | negative: an insufficient/short swipe does not advance the slide                     | N    | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| AC-3    |                                                                                             | boundary: swiping forward from the last slide is clamped, not wrapped                | B    | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| AC-4    | Correct slide content visible after swipe, via semantic locator                             | positive: the correct slide content is visible after the swipe (semantic locator)    | P    | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| AC-5    | devices["iPhone 15"] context reports touch-capable navigator.maxTouchPoints (Chromium-only) | positive: an iPhone 15 context reports a touch-capable maxTouchPoints                | P    | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| AC-5a   | Default (non-emulated) context contrasts as non-touch-capable                               | negative: the default context reports maxTouchPoints of 0                            | N    | ✅                                  |
| AC-5a   |                                                                                             | negative: the page's own Inspect Touch Points widget reflects 0 on a default context | N    | ✅                                  |
| AXE     | The page must have no critical/serious axe-core violations in every rendered state          | no violations on initial load                                                        | A11y | ✅                                  |
| AXE     |                                                                                             | no violations after a tap updates the counter                                        | A11y | ✅                                  |
| AXE     |                                                                                             | no violations after a swipe advances the carousel (Chromium-only)                    | A11y | ✅ (Chrome/Edge) ⏭ (Firefox/Safari) |
| REQ-NF1 | The page must meet its performance budget (load + key interaction)                          | initial touch-gestures page load is within budget                                    | Perf | ✅                                  |
| REQ-NF1 |                                                                                             | a tap-triggered counter update completes within budget                               | Perf | ✅                                  |

**Note on Chromium-only scope (AC-3/AC-4/AC-5 + post-swipe a11y):** Playwright exposes no cross-browser
swipe/drag primitive (`touchscreen` only has `.tap()`); a real swipe requires a raw CDP
`Input.dispatchTouchEvent` sequence, and `newCDPSession` throws on Firefox/WebKit (verified).
Similarly, `navigator.maxTouchPoints` only reflects `hasTouch` emulation on Chromium — Firefox and
WebKit report `0` regardless (verified empirically). These tests are intentionally scoped to
Desktop Chrome + Desktop Edge via `test.skip(({ browserName }) => browserName !== 'chromium', ...)`.

---

## Defects

| ID      | Type          | Summary                                                                                                                                   | Severity | Found by                                | JIRA                                                       | Status                                           |
| ------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------ |
| TAB1-59 | Accessibility | `color-contrast`: Slide 2 "Swipe" text (`text-white` bold on `bg-emerald-500`, 2.47:1) fails WCAG 2 AA (3:1 required for large/bold text) | Serious  | axe-core, Desktop Chrome + Desktop Edge | [TAB1-59](https://orhunakkan.atlassian.net/browse/TAB1-59) | ✅ Fixed & closed — verified live, 60/60 passing |

---

## Traceability Summary

- **ACs covered:** 5 / 5 + 1 contrast sub-requirement (AC-1 · AC-2 · AC-3 · AC-4 · AC-5 · AC-5a) — AC-3/AC-4/AC-5 verified on Chromium engines (Desktop Chrome, Desktop Edge); Firefox/Safari intentionally skipped per a verified Playwright/browser-engine limitation (see note above)
- **Non-functional covered:** 4 / 4 (AXE load state · AXE post-tap state · AXE post-swipe state · performance budget)
- **Test cases:** 17 tests defined; 60 executions across 4 browsers (17×4 minus the 8 tests scoped Chromium-only ×2 skipped browsers = 12 skipped) — 60 passed, 0 failed
- **Every POM element asserted by ≥1 case:** ✅ (`tapTargetButton`/`tapCount` in AC-1/AC-2, `carouselRegion`/`activeSlide`/`slideIndicators`/`nextSlideButton` in AC-3/AC-4, `inspectTouchPointsButton`/`touchInfoResult` in AC-5a)
- **Real defect found and fixed during this run:** TAB1-59 — a genuine WCAG AA color-contrast failure in the deployed app's Slide 2 background (same category and root-cause pattern as TAB1-57/TAB1-58 in earlier labs), found, filed, fixed upstream, deployed, verified live, and confirmed via a clean CI re-run (60/60).
- **Open defects:** 0
- **Exit criteria met:** ✅ — all P1+P2 requirements covered, 0 non-flaky failures, a11y clean across all 3 states, green across all 4 browsers in CI.
