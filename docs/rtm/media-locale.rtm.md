# Requirements Traceability Matrix — Media & Locale Emulation

| Field      | Value                                                                       |
| ---------- | ------------------------------------------------------------------------------ |
| JIRA Story | [TAB1-34](https://orhunakkan.atlassian.net/browse/TAB1-34)                    |
| Lab URL    | https://stagecraftlabs.com/practice/media-locale                              |
| Spec file  | tests/media-locale/media-locale.spec.ts                                       |
| POM file   | pages/media-locale.page.ts                                                    |
| Last run   | 2026-07-13 — Local: 68/68 passed (Chrome 17/17 · Firefox 17/17 · Edge 17/17 · Safari 17/17), stable across 2 consecutive runs on the previously-failing case. 0 skipped tests. |
| Generated  | 2026-07-13                                                                     |
| Status     | Local green, 0 open blockers (TAB1-56 resolved/verified fixed) — pending CI verification for Done |

---

## Coverage by Acceptance Criterion

| Req  | Acceptance Criterion                                                                              | Test Case                                                                                                    | Type  | Result |
| ---- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| AC-1 | `page.emulateMedia({ colorScheme: "dark" })` updates the colour-scheme label to "Dark"                 | positive: emulateMedia({ colorScheme: "dark" }) updates the label to "Dark"                                       | P     | ✅ (4/4) |
| AC-2 | `page.emulateMedia({ colorScheme: "light" })` returns the label to "Light"                             | positive: emulateMedia({ colorScheme: "light" }) updates the label to "Light"                                     | P     | ✅ (4/4) |
| AC-1/AC-2 | (boundary — dark ↔ light flips both ways on the same page)                                        | boundary: switching from dark back to light flips the label both ways within the same page                        | B     | ✅ (4/4) |
| AC-3 | `page.emulateMedia({ reducedMotion: "reduce" })` shows "Reduced" on the motion panel                    | positive: emulateMedia({ reducedMotion: "reduce" }) shows "Reduced" on the motion panel                            | P     | ✅ (4/4) |
| AC-3 | (negative — reset to "no-preference" returns "Motion on")                                              | negative: switching to "no-preference" returns the label to "Motion on"                                            | N     | ✅ (4/4) |
| AC-4 | `page.emulateMedia({ media: "print" })` reveals the `@media print` banner                              | positive: emulateMedia({ media: "print" }) reveals the print banner                                                | P     | ✅ (4/4) |
| AC-4 | (negative — banner absent under default "screen" media)                                                | negative: the print banner is absent under the default "screen" media                                              | N     | ✅ (4/4) |
| AC-4 | (boundary — reverting to "screen" removes the banner again)                                            | boundary: reverting to "screen" media removes the print banner again                                               | B     | ✅ (4/4) |
| AC-5 | Context `{ locale: "de-DE", timezoneId: "Europe/Berlin" }` renders German date + € currency             | positive: date renders in de-DE format and currency shows the euro symbol                                          | P/D   | ✅ (4/4) |
| AC-5 | (data-driven contrast — en-US/America/New_York pairing renders its own format, still € currency)       | positive: date renders in en-US format and currency shows the euro symbol                                          | D     | ✅ (4/4) |
| AC-6 | Locale formatting is driven by `Intl.DateTimeFormat`/`Intl.NumberFormat`, not hardcoded (de-DE)         | positive: rendered date/currency match Intl.DateTimeFormat/Intl.NumberFormat computed for de-DE                    | P     | ✅ (4/4) |
| AC-6 | (same proof for en-US)                                                                                  | positive: rendered date/currency match Intl.DateTimeFormat/Intl.NumberFormat computed for en-US                    | P     | ✅ (4/4) |
| AC-6 | (boundary — the two locales must render differently from each other)                                   | boundary: the two locales render the date and currency differently from each other, ruling out a hardcoded string  | B     | ✅ (4/4) |
| AXE  | No critical/serious axe-core violations on initial load                                                | no violations on initial page load                                                                                 | A11y  | ✅ (4/4) |
| AXE  | No critical/serious axe-core violations under dark colour-scheme emulation                             | no violations under dark colour-scheme emulation                                                                   | A11y  | ✅ (4/4 — Safari fixed via TAB1-56) |
| AXE  | No critical/serious axe-core violations under print media emulation                                    | no violations under print media emulation                                                                          | A11y  | ✅ (4/4) |
| REQ-NF1 | The page must meet its performance budget (load)                                                     | initial media-locale page load is within budget                                                                    | Perf  | ✅ (4/4) |

_All rows: 4/4 = Desktop Chrome, Desktop Firefox, Desktop Edge, Desktop Safari._

---

## Defects

| ID       | Type          | Summary                                                                                              | Severity | Found by      | JIRA     | Status |
| -------- | ------------- | ---------------------------------------------------------------------------------------------------- | -------- | -------------- | -------- | ------ |
| TAB1-56  | Accessibility | Shared header logo + "← All labs" links fail WCAG AA color-contrast (1.29:1, 3.09:1) under dark colour-scheme emulation on Desktop Safari (WebKit) only | High     | axe-core (`color-contrast`) | [TAB1-56](https://orhunakkan.atlassian.net/browse/TAB1-56) | **Closed** — verified fixed 2026-07-13 |

---

## Traceability Summary

- **ACs covered:** 6 / 6 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5 · AC-6) on all 4 browsers
- **Non-functional covered:** 3 / 3 (AXE load · AXE dark-mode · AXE print · Performance budget — 4 non-functional checks total)
- **Test cases:** 17 tests × 4 browsers = 68 defined, executed, and passing. 0 skipped.
- **Every POM element asserted by ≥1 case:** ✅ (`colorSchemeLabel` in AC-1/AC-2, `motionLabel` in AC-3, `printBanner` in AC-4, `localeDate`/`localeCurrency` in AC-5/AC-6)
- **Notable finding during test design:** the print banner (`data-testid="print-banner"`) is not merely CSS-hidden — it does not exist in the DOM at all until a real `page.emulateMedia({ media: "print" })` flips `window.matchMedia('print').matches` and the app's own listener renders it, the same matchMedia-driven pattern used for colour scheme and reduced motion (confirmed by probing the live DOM under real print emulation before writing the POM).
- **Notable finding during test design:** the rendered currency always uses the EUR currency code regardless of locale (`€1,234.56` for en-US, `1.234,56 €` for de-DE) — only the number/date formatting conventions change with locale, not the currency itself. This made a clean AC-6 proof possible: compute the expected string via `Intl.DateTimeFormat`/`Intl.NumberFormat` for each locale in the test itself and assert an exact match, plus assert the two locales differ from each other.
- **Defect found and resolved during this run:** TAB1-56 — a genuine WebKit-only WCAG AA color-contrast violation in the shared header under dark mode, filed, fixed app-side, and verified closed within this pipeline run (see Defects table above).
- **Open blockers:** 0
- **Exit criteria met:** ✅ — all P1 requirements covered, 0 open blockers, a11y clean on all 4 browsers (including the previously-failing Safari case), 68/68 passing locally across 2 consecutive runs on the fixed case. Story proceeds to Done once CI confirms this on the PR.
