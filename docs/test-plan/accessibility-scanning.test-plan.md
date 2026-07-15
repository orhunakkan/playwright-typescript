# Test Plan — Accessibility Scanning (TAB1-35)

| Field      | Value                                                       |
| ---------- | ----------------------------------------------------------- |
| JIRA Story | [TAB1-35](https://orhunakkan.atlassian.net/browse/TAB1-35)  |
| Lab URL    | https://stagecraftlabs.com/practice/accessibility-scanning  |
| Spec file  | tests/accessibility-scanning/accessibility-scanning.spec.ts |
| POM file   | pages/accessibility-scanning.page.ts                        |
| Generated  | 2026-07-14                                                  |

---

## 1. Scope

**In scope:**

- `AxeBuilder({ page }).analyze()` run against the default (broken) Settings Form state, asserting
  `results.violations.length > 0`
- Logging `id`, `impact`, and `nodes` for each violation found on the broken state, to produce a
  diagnosable failure message
- Toggling the "Show accessible controls" checkbox to the accessible state, re-running `.analyze()`,
  and asserting `results.violations` is an empty array
- `.include("#form-region")` scoping the scan to the Settings Form section only, verified against
  both the broken and accessible states
- `.withTags(["wcag2a", "wcag2aa"])` filtering the scan to WCAG 2.x rules only, confirmed by
  checking every returned violation's `tags` array contains at least one of the two filter tags
- The two concrete violations the broken state injects — a decorative `<img>` with no `alt`
  (rule: `image-alt`), and a low-contrast Submit button (`rgb(170,170,170)` on white, rule:
  `color-contrast`) — used as boundary/negative evidence that the scan actually detects real issues
  rather than trivially passing. (The name input's placeholder-only "label" is _not_ one of these —
  axe's `label` rule accepts a placeholder as a valid accessible name, confirmed empirically.)
- Toggling back from accessible → broken is used as a boundary case to confirm the state (and thus
  the violation set) is reversible, not a one-way reset
- Accessibility scan (meta) across load state and both toggle states; a `@performance` budget test
  on initial page load

**Out of scope:**

- Manual/assistive-technology review (screen reader walkthroughs, keyboard-only navigation audits) —
  explicitly called out by the lab's own guidance as outside what axe-core can catch
- Any WCAG rule sets beyond `wcag2a`/`wcag2aa` (e.g. `wcag21aa`, `best-practice`) — no AC calls for
  them
- Visual/pixel-level regression of the contrast fix (covered functionally via the axe `color-contrast`
  rule instead of a screenshot diff)

---

## 2. Test Types

| Type                  | Applied                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------- |
| Functional (positive) | ✅                                                                                       |
| Functional (negative) | ✅ (accessible-state scan returns zero violations; tag filter excludes non-WCAG2 rules)  |
| Boundary value        | ✅ (broken → accessible → broken reversibility; scoped vs. full-page scan)               |
| Data-driven           | ✅ (violation-id/impact table for the two known broken-state violations)                 |
| Accessibility (axe)   | ✅ (this lab's ACs _are_ the axe-core scan itself, across load/broken/accessible states) |
| Non-functional (perf) | ✅ (Navigation Timing budget)                                                            |
| Cross-browser         | ✅ (4 browsers)                                                                          |
| Mobile / responsive   | ❌ (out of scope — no AC coverage)                                                       |

---

## 3. Environments & Data

| Field      | Value                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Target env | Staging (stagecraftlabs.com)                                                                                                                                                                                                    |
| BASE_URL   | `https://stagecraftlabs.com` (`.env`)                                                                                                                                                                                           |
| Test data  | Known broken-state violation ids: `image-alt`, `color-contrast` (informational — assertions target `results.violations` shape/count/tags, not solely a hardcoded id allowlist, so the scan still catches regressions/additions) |

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

| Area / Requirement                                                                   | Likelihood | Impact | Risk | Priority |
| ------------------------------------------------------------------------------------ | ---------- | ------ | ---- | -------- |
| AC-1: broken-state scan reports `results.violations.length > 0`                      | H          | H      | H    | P1       |
| AC-2: violation `id`/`impact`/`nodes` are logged for diagnosis                       | M          | M      | M    | P2       |
| AC-3: accessible-state scan reports `results.violations` as empty                    | H          | H      | H    | P1       |
| AC-4: `.include("#form-region")` correctly scopes the scan                           | M          | H      | H    | P1       |
| AC-5: `.withTags(["wcag2a","wcag2aa"])` filters to WCAG 2.x rules only               | M          | M      | M    | P2       |
| Accessibility — load / broken / accessible states (meta a11y scan of the lab itself) | L          | M      | L    | P2       |
| Performance budget                                                                   | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- [ ] Requirements extracted and prioritized (✅ Step 1 done)
- [ ] App URL reachable: `https://stagecraftlabs.com/practice/accessibility-scanning`
- [ ] `BASE_URL` configured in `.env` (✅)
- [ ] `@axe-core/playwright` dependency present in `package.json` (✅ already installed)
- [ ] POM exists: `pages/accessibility-scanning.page.ts` (✅ generated in Step 3)

---

## 7. Exit Criteria

- [ ] 100% of P1 requirements have passing automated cases
- [ ] 0 open non-flaky defects of severity ≥ High linked to TAB1-35
- [ ] Accessible-state scan confirms 0 axe violations (or any residual is tracked with a defect id)
- [ ] Green across all 4 browsers in CI, or any divergence triaged appropriately
- [ ] RTM generated and up to date: `docs/rtm/accessibility-scanning.rtm.md`

---

## 8. Deliverables

| Artifact  | Path                                                        | Status  |
| --------- | ----------------------------------------------------------- | ------- |
| Test Plan | docs/test-plan/accessibility-scanning.test-plan.md          | ✅ done |
| POM       | pages/accessibility-scanning.page.ts                        | ✅ done |
| Spec file | tests/accessibility-scanning/accessibility-scanning.spec.ts | pending |
| RTM       | docs/rtm/accessibility-scanning.rtm.md                      | pending |
| CI run    | GitHub Actions                                              | pending |

---

## 9. Schedule / Effort (lightweight)

```
requirements → test plan → POM (locator-mapper) → spec (test-case-generator)
  → run (Playwright CLI) → triage → RTM → In Review → CI → Done
```
