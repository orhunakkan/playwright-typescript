# Test Plan — Media & Locale Emulation (TAB1-34)

| Field      | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| JIRA Story | [TAB1-34](https://orhunakkan.atlassian.net/browse/TAB1-34) |
| Lab URL    | https://stagecraftlabs.com/practice/media-locale           |
| Spec file  | tests/media-locale/media-locale.spec.ts                    |
| POM file   | pages/media-locale.page.ts                                 |
| Generated  | 2026-07-13                                                 |

---

## 1. Scope

**In scope:**

- `page.emulateMedia({ colorScheme: 'dark' })` and assertion that the colour-scheme label updates
  to "Dark"
- `page.emulateMedia({ colorScheme: 'light' })` and assertion that the label returns to "Light"
- `page.emulateMedia({ reducedMotion: 'reduce' })` and assertion that the motion panel shows
  "Reduced" (plus the `no-preference` counterpart as the negative/reset case)
- `page.emulateMedia({ media: 'print' })` and assertion that the `@media print` banner becomes
  visible (plus reverting to `media: 'screen'` making it hidden again)
- A new browser context created with `{ locale: 'de-DE', timezoneId: 'Europe/Berlin' }`, asserting
  the date renders in German format and currency renders with a euro (€) symbol
- Confirming locale formatting is driven by `Intl.DateTimeFormat`/`Intl.NumberFormat` against the
  context locale (verified by comparing the rendered string against a same-locale `Intl` value
  computed in the test, and by using a second locale/timezone combination as a contrast case) —
  not a hardcoded string in the component
- Accessibility scan across load, dark-mode, and print-media states
- Performance budget on initial page load

**Out of scope:**

- Any additional locales beyond the AC-specified `de-DE`/`Europe/Berlin` pairing and one contrast
  locale used only to prove `Intl`-driven (not hardcoded) formatting
- Visual/pixel-level screenshot comparison of dark mode or print layout (no AC calls for a
  screenshot diff here; covered functionally via label/visibility assertions instead)

---

## 2. Test Types

| Type                  | Applied                                                                 |
| --------------------- | ----------------------------------------------------------------------- |
| Functional (positive) | ✅                                                                      |
| Functional (negative) | ✅ (reverting colorScheme/reducedMotion/media back to defaults)         |
| Boundary value        | ✅ (locale/timezone pairing switch; print-media visibility toggle edge) |
| Data-driven           | ✅ (colorScheme dark/light table; locale/timezone table)                |
| Accessibility (axe)   | ✅ (load, dark-mode, print-media states)                                |
| Non-functional (perf) | ✅ (Navigation Timing budget)                                           |
| Cross-browser         | ✅ (4 browsers)                                                         |
| Mobile / responsive   | ❌ (out of scope — no AC coverage)                                      |

---

## 3. Environments & Data

| Field      | Value                                                                  |
| ---------- | ---------------------------------------------------------------------- |
| Target env | Staging (stagecraftlabs.com)                                           |
| BASE_URL   | `https://stagecraftlabs.com` (`.env`)                                  |
| Test data  | Locale/timezone pairs: `de-DE`/`Europe/Berlin` (AC-required),          |
|            | `en-US`/`America/New_York` (contrast case for the `Intl`-driven check) |

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

| Area / Requirement                                                     | Likelihood | Impact | Risk | Priority |
| ---------------------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| AC-1: `colorScheme: 'dark'` updates the label to "Dark"                | H          | H      | H    | P1       |
| AC-2: `colorScheme: 'light'` returns the label to "Light"              | H          | H      | H    | P1       |
| AC-3: `reducedMotion: 'reduce'` shows "Reduced" on the motion panel    | H          | H      | H    | P1       |
| AC-4: `media: 'print'` reveals the `@media print` banner               | H          | H      | H    | P1       |
| AC-5: `de-DE`/`Europe/Berlin` context renders German date + € currency | H          | H      | H    | P1       |
| AC-6: locale formatting is `Intl`-driven, not hardcoded                | M          | H      | H    | P1       |
| Accessibility — load / dark-mode / print states                        | L          | M      | L    | P2       |
| Performance budget                                                     | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- [ ] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/media-locale`
- [ ] `BASE_URL` configured in `.env` (✅)
- [ ] POM exists: `pages/media-locale.page.ts` (generated in Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-34
- [ ] Accessibility: 0 critical/serious violations (or tracked with a defect id)
- [ ] Green across all 4 browsers in CI, or any divergence triaged appropriately
- [ ] RTM generated and up to date: `docs/rtm/media-locale.rtm.md`

---

## 8. Deliverables

| Artifact  | Path                                     | Status  |
| --------- | ---------------------------------------- | ------- |
| Test Plan | docs/test-plan/media-locale.test-plan.md | ✅ done |
| POM       | pages/media-locale.page.ts               | pending |
| Spec file | tests/media-locale/media-locale.spec.ts  | pending |
| RTM       | docs/rtm/media-locale.rtm.md             | pending |
| CI run    | GitHub Actions                           | pending |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
