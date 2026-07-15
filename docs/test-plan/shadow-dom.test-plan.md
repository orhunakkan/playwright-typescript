# Test Plan — Shadow DOM & Web Components (TAB1-37)

| Field      | Value                                                      |
| ---------- | ---------------------------------------------------------- |
| JIRA Story | [TAB1-37](https://orhunakkan.atlassian.net/browse/TAB1-37) |
| Lab URL    | https://stagecraftlabs.com/practice/shadow-dom             |
| Spec file  | tests/shadow-dom/shadow-dom.spec.ts                        |
| POM file   | pages/shadow-dom.page.ts                                   |
| Generated  | 2026-07-14                                                 |

---

## 1. Scope

**In scope:**

- `getByRole("radio")` locates the five star buttons inside the star-rating custom element's
  open shadow root with no explicit shadow-piercing required (REQ-01)
- Negative/boundary: only one radio has `aria-checked="true"` at a time; clicking a second star
  switches the checked state off the first star and onto the new one (REQ-01a)
- `getByLabel("Your name")` finds the input inside the labelled-input custom element across the
  shadow boundary (REQ-02)
- Negative: the name input starts empty/unfilled before any interaction (REQ-02a)
- Clicking a star sets the correct radio's `aria-checked="true"`, confirmed via the accessibility
  tree rather than internal implementation details (REQ-03)
- Boundary: first star (1) and last star (5) both correctly report `aria-checked="true"` when
  clicked, exercising both ends of the 5-star range (REQ-03a)
- `locator.evaluate()` reads the `value` attribute off the custom element host and it matches the
  number of the clicked star (REQ-04)
- Boundary: host `value` attribute reflects star 1 and star 5 correctly, and updates (not
  accumulates) when a different star is clicked afterward (REQ-04a)
- `getByText` locates text inside a shadow root and behaves identically to locating text in a
  regular DOM node (REQ-05)
- Negative: `getByText` does not match text that does not exist inside the shadow root (REQ-05a)
- Filling the name input inside the shadow root, clicking Submit, and asserting the confirmation
  status becomes visible (REQ-06)
- Negative: confirmation status is not visible before Submit is clicked (REQ-06a)
- Accessibility scan (meta) across load, star-selected, and post-submit-confirmation states; a
  `@performance` budget test on initial page load

**Out of scope:**

- Closed shadow roots — the ACs and lab only describe open shadow roots (`getByRole`,
  `getByLabel`, `getByText` all rely on Playwright's open-shadow piercing)
- Any custom element beyond the star-rating widget and the labelled-input/submit widget named in
  the ACs
- Manual shadow-piercing techniques (`page.$eval` with `>>>` or similar) — the ACs explicitly
  call out that _no_ explicit shadow-piercing is required, so tests must not use it either

---

## 2. Test Types

| Type                  | Applied                                                                            |
| --------------------- | ---------------------------------------------------------------------------------- |
| Functional (positive) | ✅                                                                                 |
| Functional (negative) | ✅ (unfilled name, no confirmation before submit, non-existent text)               |
| Boundary value        | ✅ (star 1 / star 5 edges, single-checked-radio invariant, value not accumulating) |
| Data-driven           | ✅ (per-star click → aria-checked + host value table, stars 1–5)                   |
| Accessibility (axe)   | ✅ (load / star-selected / post-submit states)                                     |
| Non-functional (perf) | ✅ (Navigation Timing budget)                                                      |
| Cross-browser         | ✅ (4 browsers)                                                                    |
| Mobile / responsive   | ❌ (out of scope — no AC coverage)                                                 |

---

## 3. Environments & Data

| Field      | Value                                                                                                                                                                                              |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Target env | Staging (stagecraftlabs.com)                                                                                                                                                                       |
| BASE_URL   | `https://stagecraftlabs.com` (`.env`)                                                                                                                                                              |
| Test data  | Faker-generated name string for the labelled-input submission; fixed star-index table (1–5) for rating selection — no invalid/boundary format data needed since the widget is a fixed 5-star scale |

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
| REQ-01: `getByRole("radio")` locates the 5 stars in the open shadow root            | H          | H      | H    | P1       |
| REQ-01a: exactly one radio checked at a time, switches correctly                    | M          | H      | H    | P1       |
| REQ-02: `getByLabel("Your name")` finds the input across the shadow boundary        | H          | H      | H    | P1       |
| REQ-02a: name input starts empty                                                    | L          | L      | L    | P3       |
| REQ-03: clicking a star sets `aria-checked="true"` on the correct radio             | H          | H      | H    | P1       |
| REQ-03a: boundary — star 1 and star 5 both report correctly                         | M          | M      | M    | P2       |
| REQ-04: `locator.evaluate()` reads host `value` attribute matching the clicked star | H          | H      | H    | P1       |
| REQ-04a: boundary — value reflects star 1/5, updates rather than accumulates        | M          | M      | M    | P2       |
| REQ-05: `getByText` behaves identically inside a shadow root vs. regular DOM        | H          | M      | M    | P1       |
| REQ-05a: `getByText` does not match non-existent text                               | L          | L      | L    | P3       |
| REQ-06: fill name, click Submit, confirmation status becomes visible                | H          | H      | H    | P1       |
| REQ-06a: confirmation not visible before Submit                                     | M          | M      | M    | P2       |
| Accessibility — load / star-selected / post-submit states                           | L          | M      | L    | P2       |
| Performance budget                                                                  | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- [x] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/shadow-dom`
- [x] `BASE_URL` configured in `.env`
- [ ] POM exists: `pages/shadow-dom.page.ts` (pending Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-37
- [ ] Star 1 and star 5 boundary cases both confirmed correct (`aria-checked` + host `value`)
- [ ] Green across all 4 browsers in CI, or any divergence triaged appropriately
- [ ] RTM generated and up to date: `docs/rtm/shadow-dom.rtm.md`

---

## 8. Deliverables

| Artifact  | Path                                   | Status  |
| --------- | -------------------------------------- | ------- |
| Test Plan | docs/test-plan/shadow-dom.test-plan.md | ✅ done |
| POM       | pages/shadow-dom.page.ts               | pending |
| Spec file | tests/shadow-dom/shadow-dom.spec.ts    | pending |
| RTM       | docs/rtm/shadow-dom.rtm.md             | pending |
| CI run    | GitHub Actions                         | pending |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
