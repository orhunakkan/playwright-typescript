# Requirements Traceability Matrix — Shadow DOM & Web Components

| Field      | Value                                                                       |
| ---------- | ------------------------------------------------------------------------------ |
| JIRA Story | [TAB1-37](https://orhunakkan.atlassian.net/browse/TAB1-37)                    |
| Lab URL    | https://stagecraftlabs.com/practice/shadow-dom                                |
| Spec file  | tests/shadow-dom/shadow-dom.spec.ts                                           |
| POM file   | pages/shadow-dom.page.ts                                                      |
| Last run   | 2026-07-14 — Local: 92/92 passed (Chrome 23/23 · Firefox 23/23 · Edge 23/23 · Safari 23/23). 0 skipped tests. |
| Generated  | 2026-07-14                                                                     |
| Status     | Local green, 0 open blockers — pending CI verification for Done               |

---

## Coverage by Acceptance Criterion

| Req  | Acceptance Criterion                                                                                    | Test Case                                                                                                          | Type | Result   |
| ---- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---- | -------- |
| AC-1 | `getByRole("radio")` locates the five star buttons inside the star-rating custom element's open shadow root — no explicit shadow-piercing required | positive: all 5 star radios are located via getByRole with no shadow-piercing syntax                                 | P    | ✅ (4/4) |
| AC-1 | (boundary — no star is checked before any interaction)                                                    | boundary: before any interaction, none of the 5 radios are checked                                                    | B    | ✅ (4/4) |
| AC-2 | `getByLabel("Your name")` finds the input inside the labelled-input custom element across the shadow boundary | positive: the name input is located by its label and accepts text                                                    | P    | ✅ (4/4) |
| AC-2 | (negative — the name input starts empty before any interaction)                                           | negative: the name input starts empty before any interaction                                                          | N    | ✅ (4/4) |
| AC-3 | Clicking a star sets `aria-checked="true"` on the correct radio, confirmed via the accessibility tree     | positive: clicking the 3rd star checks only that radio                                                                | P    | ✅ (4/4) |
| AC-3 | (boundary — first star and last star both report `aria-checked` correctly)                                | boundary: the first star (1) and last star (5) both report aria-checked correctly                                    | B    | ✅ (4/4) |
| AC-3 | (negative — clicking a second star switches `aria-checked` off the first star)                            | negative: clicking a second star switches aria-checked off the first star                                            | N    | ✅ (4/4) |
| AC-4 | (negative — host `value` attribute starts at "0" before any star is clicked)                              | negative: host value attribute is "0" before any star is clicked                                                     | N    | ✅ (4/4) |
| AC-4 | `locator.evaluate()` reads the `value` attribute from the custom element host and matches the clicked star | data-driven: clicking "1 star" sets the host value attribute to "1"                                                   | D    | ✅ (4/4) |
| AC-4 | (same, star 2)                                                                                             | data-driven: clicking "2 stars" sets the host value attribute to "2"                                                  | D    | ✅ (4/4) |
| AC-4 | (same, star 3)                                                                                             | data-driven: clicking "3 stars" sets the host value attribute to "3"                                                  | D    | ✅ (4/4) |
| AC-4 | (same, star 4)                                                                                             | data-driven: clicking "4 stars" sets the host value attribute to "4"                                                  | D    | ✅ (4/4) |
| AC-4 | (same, star 5)                                                                                             | data-driven: clicking "5 stars" sets the host value attribute to "5"                                                  | D    | ✅ (4/4) |
| AC-4 | (boundary — value updates rather than accumulates across successive star clicks)                          | boundary: the value attribute updates rather than accumulates when a different star is clicked afterward             | B    | ✅ (4/4) |
| AC-5 | `getByText` locates text inside a shadow root and behaves identically to a regular DOM node               | positive: getByText finds the "Your name" label living inside the shadow root                                        | P    | ✅ (4/4) |
| AC-5 | (negative — getByText does not match non-existent text)                                                    | negative: getByText does not match text that does not exist anywhere on the page                                     | N    | ✅ (4/4) |
| AC-6 | Filling the name, clicking Submit, and confirming the confirmation status becomes visible                  | positive: filling the name, selecting a star, and submitting shows the confirmation message                          | P    | ✅ (4/4) |
| AC-6 | (negative — confirmation status is empty before Submit is clicked)                                         | negative: the confirmation status is empty before Submit is clicked                                                   | N    | ✅ (4/4) |
| AC-6 | (negative — submitting without a name or rating shows a validation prompt, not a confirmation)             | negative: submitting without a name or rating shows a validation prompt, not a confirmation                          | N    | ✅ (4/4) |
| AXE  | No WCAG 2.x violations on initial page load                                                               | no violations on initial page load                                                                                    | A11y | ✅ (4/4) |
| AXE  | No WCAG 2.x violations after selecting a star                                                              | no violations after selecting a star                                                                                  | A11y | ✅ (4/4) |
| AXE  | No WCAG 2.x violations on the post-submit confirmation state                                               | no violations on the post-submit confirmation state                                                                   | A11y | ✅ (4/4) |
| REQ-NF1 | The page must meet its performance budget (load)                                                        | initial shadow-dom page load is within budget                                                                         | Perf | ✅ (4/4) |

_All rows: 4/4 = Desktop Chrome, Desktop Firefox, Desktop Edge, Desktop Safari._

---

## Defects

| ID | Type | Summary | Severity | Found by | JIRA | Status |
| -- | ---- | ------- | -------- | -------- | ---- | ------ |
| — | — | None found | — | — | — | — |

---

## Traceability Summary

- **ACs covered:** 6 / 6 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5 · AC-6) on all 4 browsers
- **Non-functional covered:** 4 / 4 (AXE load state · AXE star-selected state · AXE post-submit-confirmation state · performance budget)
- **Test cases:** 23 tests × 4 browsers = 92 defined, executed, and passing. 0 skipped.
- **Every POM element asserted by ≥1 case:** ✅ (`starRadios`/`star1Radio`…`star5Radio`, `ratingWidgetHost`, `ratingRadiogroup` implicitly exercised via `starRadios`, `nameInput`, `nameLabelText`, `submitButton`, `confirmationStatus` are all directly exercised)
- **Notable finding during test design:** `locator.evaluateAll()` does not auto-wait like other locator actions — it queries the DOM immediately. The custom elements on this page attach their shadow roots asynchronously on script load, so a boundary test that called `evaluateAll` directly after `page.goto()` intermittently raced the widget's initialization and returned an empty array. Fixed by asserting `toHaveCount(5)` (which does auto-wait) immediately before the `evaluateAll` call.
- **Notable finding during test design:** submitting with an empty name and no star selected does not silently no-op — the app surfaces a validation message ("Please choose a rating and enter a name.") in the same `role="status"` region used for the success confirmation. This became an explicit negative case for AC-6 rather than being asserted as "status stays empty."
- **Open blockers:** 0
- **Exit criteria met:** ✅ — all P1 requirements covered, 0 open blockers, 92/92 passing locally across all 4 browsers. Story proceeds to Done once CI confirms this on the PR.
