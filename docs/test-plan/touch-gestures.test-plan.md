# Test Plan — Touch & Mobile Gestures (TAB1-41)

| Field      | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| JIRA Story | [TAB1-41](https://orhunakkan.atlassian.net/browse/TAB1-41) |
| Lab URL    | https://stagecraftlabs.com/practice/touch-gestures         |
| Spec file  | tests/touch-gestures/touch-gestures.spec.ts                |
| POM file   | pages/touch-gestures.page.ts                               |
| Generated  | 2026-07-14                                                 |

---

## 1. Scope

**In scope:**

- `locator.tap()` on the "Tap target" button incrementing a touch-only tap counter
- `locator.click()` on the same button _not_ incrementing the tap counter (touch vs. mouse distinction)
- Horizontal touch swipe on the carousel via `page.touchscreen` / synthesized pointer events, advancing the active slide indicator
- Asserting the correct slide's content is visible after the swipe, via a semantic locator
- Boundary behavior when swiping forward from the last slide (clamp/wrap)
- A short/insufficient swipe not advancing the slide
- Launching a browser context configured as `devices["iPhone 15"]` and confirming `navigator.maxTouchPoints` reflects a touch-capable device via `page.evaluate`
- Contrast: a default (non-touch-emulated) context showing non-touch `maxTouchPoints`/`hasTouch`
- Accessibility scanning across load, post-tap, and post-swipe states
- Performance budget for touch/swipe-triggered UI updates

**Out of scope:**

- Native mobile app gesture testing (this lab is browser-based touch emulation only)
- Multi-touch / pinch-zoom gestures — not exercised by this lab's UI
- Non-touch drag-and-drop (covered by the separate Drag & Drop lab, TAB1-30)
- Real physical device testing — emulated touch via Playwright's `devices` descriptors and `touchscreen` API only

---

## 2. Test Types

| Type                  | Applied                                        |
| --------------------- | ---------------------------------------------- |
| Functional (positive) | ✅                                             |
| Functional (negative) | ✅                                             |
| Boundary value        | ✅                                             |
| Data-driven           | ❌ (fixed gesture sequences, not a data table) |
| Accessibility (axe)   | ✅ (load + post-tap + post-swipe states)       |
| Non-functional (perf) | ✅ (gesture-triggered UI update budget)        |
| Cross-browser         | ✅ (4 browsers)                                |
| Mobile / responsive   | ✅ (`devices["iPhone 15"]` context)            |

---

## 3. Environments & Data

| Field      | Value                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------- |
| Target env | Staging (stagecraftlabs.com)                                                             |
| BASE_URL   | `https://stagecraftlabs.com` (`.env`)                                                    |
| Lab path   | `/practice/touch-gestures`                                                               |
| Device     | `devices["iPhone 15"]` (Playwright device descriptor) for the touch-capability context   |
| Test data  | Fixed gesture sequences (tap counts, swipe distance/direction) — deterministic, no faker |

---

## 4. Browser / Device Matrix

Derived from `playwright.config.ts`: `Desktop Chrome`, `Desktop Firefox`, `Desktop Edge`, `Desktop Safari`.
The `devices["iPhone 15"]` context (AC-5) is launched as an ad-hoc context _within_ each of these
projects (not a separate CI project), since `hasTouch`/`maxTouchPoints` emulation works
independent of the host project's browser engine.

---

## 5. Risk Assessment & Priority

| Area / Requirement                                                    | Likelihood | Impact | Risk | Priority |
| --------------------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| `locator.tap()` increments the tap counter                            | H          | H      | H    | P1       |
| Counter starts at 0 before any tap (boundary)                         | M          | M      | M    | P2       |
| Multiple sequential taps accumulate correctly                         | M          | M      | M    | P2       |
| `locator.click()` does not increment the tap counter                  | H          | H      | H    | P1       |
| Repeated clicks leave the counter unchanged (negative)                | M          | M      | M    | P2       |
| Horizontal touch swipe advances the active slide indicator            | H          | H      | H    | P1       |
| Swipe forward from the last slide — clamp/wrap boundary               | M          | M      | M    | P2       |
| Insufficient/short swipe does not advance the slide (negative)        | L          | M      | L    | P3       |
| Correct slide content visible after swipe (semantic locator)          | H          | H      | H    | P1       |
| `devices["iPhone 15"]` context reports touch-capable `maxTouchPoints` | H          | H      | H    | P1       |
| Default context contrasts as non-touch-capable                        | M          | M      | M    | P2       |
| Accessibility — load / post-tap / post-swipe states                   | L          | M      | L    | P2       |
| Performance budget on gesture-triggered UI updates                    | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- [ ] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/touch-gestures`
- [ ] `BASE_URL` configured in `.env` (✅)
- [ ] POM exists: `pages/touch-gestures.page.ts` (generated in Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 + P2 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-41
- [ ] Accessibility: 0 critical/serious violations (or tracked with a defect id) in all three states
- [ ] Green across all 4 configured browsers in CI
- [ ] RTM generated and up to date: `docs/rtm/touch-gestures.rtm.md`

---

## 8. Deliverables

| Artifact  | Path                                        | Status  |
| --------- | ------------------------------------------- | ------- |
| Test Plan | docs/test-plan/touch-gestures.test-plan.md  | ✅ done |
| POM       | pages/touch-gestures.page.ts                | pending |
| Spec file | tests/touch-gestures/touch-gestures.spec.ts | pending |
| RTM       | docs/rtm/touch-gestures.rtm.md              | pending |
| CI run    | GitHub Actions                              | pending |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
