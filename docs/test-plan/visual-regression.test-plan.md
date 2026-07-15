# Test Plan — Visual Regression (TAB1-29)

| Field      | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| JIRA Story | [TAB1-29](https://orhunakkan.atlassian.net/browse/TAB1-29) |
| Lab URL    | https://stagecraftlabs.com/practice/visual-regression      |
| Spec file  | tests/visual-regression/visual-regression.spec.ts          |
| POM file   | pages/visual-regression.page.ts                            |
| Generated  | 2026-07-12                                                 |

---

## 1. Scope

**In scope:**

- Full-page baseline via `expect(page).toHaveScreenshot()`, confirming the baseline file is
  written on first run
- Locator-scoped screenshot of the Button Variants section (`data-testid="button-showcase"`),
  covering Primary, Secondary, Danger, Ghost, and Disabled states in one composed shot
- Locator-scoped screenshot of the Color Palette section (`data-testid="color-palette"`),
  covering all 6 swatches
- `mask` option on `[data-testid="dynamic-timestamp"]` to exclude the 3 live timestamps inside
  Metric Cards from the comparison
- Intentionally mutating a button's background color via `page.evaluate` (DevTools-equivalent)
  and asserting the resulting comparison fails with a pixel diff
- `maxDiffPixels` / `maxDiffPixelRatio` threshold behavior: a tight threshold fails on an
  intentional visual change; a generous threshold tolerates it
- Accessibility scan on initial load
- Performance budget on initial page load

**Out of scope:**

- The Bar Chart and "Visual vs ARIA snapshot" sections (not named in any AC)
- Cross-run baseline persistence across CI's Linux runners vs local Windows rendering — baseline
  PNGs are platform-sensitive (font/anti-aliasing); this is a known limitation of visual testing
  and is called out under Risks below, not solved by this spec
- Visual diffing of the dark-mode variant (no AC coverage)

---

## 2. Test Types

| Type                  | Applied                                                            |
| --------------------- | ------------------------------------------------------------------ |
| Functional (positive) | ✅                                                                 |
| Functional (negative) | ✅ (intentional visual break must fail; tight threshold must fail) |
| Boundary value        | ✅ (maxDiffPixels/maxDiffPixelRatio threshold edges)               |
| Data-driven           | ✅ (5 button variants asserted in one masked/scoped shot)          |
| Accessibility (axe)   | ✅ (initial load)                                                  |
| Non-functional (perf) | ✅ (Navigation Timing budget)                                      |
| Cross-browser         | ✅ (4 browsers)                                                    |
| Mobile / responsive   | ❌ (out of scope)                                                  |

---

## 3. Environments & Data

| Field        | Value                                                                           |
| ------------ | ------------------------------------------------------------------------------- |
| Target env   | Staging (stagecraftlabs.com)                                                    |
| BASE_URL     | `https://stagecraftlabs.com` (`.env`)                                           |
| Snapshot dir | `fixtures/reference-snapshots` (`playwright.config.ts` — no `{platform}` token) |
| Test data    | Static demo content: 5 buttons, 6 color swatches, 3 metric cards                |

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

| Area / Requirement                                                                  | Likelihood | Impact | Risk | Priority |
| ----------------------------------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| AC-1: full-page baseline created on first run                                       | H          | H      | H    | P1       |
| AC-2: Button Variants scoped shot matches baseline (5 states)                       | H          | H      | H    | P1       |
| AC-3: Color Palette scoped shot matches baseline (6 swatches)                       | H          | H      | H    | P1       |
| AC-4: `mask` excludes the live timestamp from Metric Cards comparison               | H          | H      | H    | P1       |
| AC-5: intentional color mutation produces a failing pixel diff                      | H          | H      | H    | P1       |
| AC-6: `maxDiffPixels`/`maxDiffPixelRatio` threshold governs pass/fail               | M          | M      | M    | P2       |
| Cross-platform snapshot drift: baselines generated on the CI runner OS vs local dev | H          | M      | M    | P2       |
| Accessibility — initial load                                                        | L          | M      | L    | P2       |
| Performance budget                                                                  | L          | L      | L    | P2       |

**Cross-platform risk note:** `expect(...).toHaveScreenshot()` baselines are pixel-exact and OS/
font-rendering-sensitive. Locally-generated (Windows) baselines are committed alongside the spec;
GitHub Actions CI runs on Linux runners, so first-time CI comparisons may show anti-aliasing-level
diffs even with no real regression. `maxDiffPixelRatio` is used on the composed baseline tests
(AC-1/2/3/4) specifically to absorb that class of noise; if CI still diverges beyond the
threshold, that is an **Environment** failure per `test-triage`, not a product defect — see
Step 12a of the pipeline for the resolution path (regenerate baselines from a CI run, not local).

---

## 6. Entry Criteria

- [ ] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/visual-regression`
- [ ] `BASE_URL` configured in `.env` (✅)
- [ ] POM exists: `pages/visual-regression.page.ts` (generated in Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 + P2 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-29
- [ ] Accessibility: 0 critical/serious violations (or tracked with a defect id)
- [ ] Green across all 4 browsers in CI, or any divergence triaged as Environment (cross-platform
      snapshot drift) rather than left unexplained
- [ ] RTM generated and up to date: `docs/rtm/visual-regression.rtm.md`

---

## 8. Deliverables

| Artifact  | Path                                              | Status  |
| --------- | ------------------------------------------------- | ------- |
| Test Plan | docs/test-plan/visual-regression.test-plan.md     | ✅ done |
| POM       | pages/visual-regression.page.ts                   | ✅ done |
| Spec file | tests/visual-regression/visual-regression.spec.ts | pending |
| RTM       | docs/rtm/visual-regression.rtm.md                 | pending |
| CI run    | GitHub Actions                                    | pending |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
