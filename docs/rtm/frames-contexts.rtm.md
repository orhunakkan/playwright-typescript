# Requirements Traceability Matrix — Frames & Contexts

| Field      | Value                                                          |
| ---------- | --------------------------------------------------------------- |
| JIRA Story | [TAB1-20](https://orhunakkan.atlassian.net/browse/TAB1-20)     |
| Lab URL    | https://stagecraftlabs.com/practice/frames-contexts             |
| Spec file  | tests/frames-contexts/frames-contexts.spec.ts                   |
| POM file   | pages/frames-contexts.page.ts                                   |
| Last run   | 2026-07-12 — 14 / 14 passed (Desktop Chrome, post-fix)          |
| Generated  | 2026-07-12                                                      |

---

## Coverage by Acceptance Criterion

| Req    | Acceptance Criterion                                                                              | Test Case                                                                                          | Type | Result |
| ------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---- | ------ |
| AC-1   | `page.frameLocator('iframe[title="Counter frame"]')` scopes locator calls inside the counter iframe | positive: frameLocator resolves the counter value inside the frame                                   | P    | ✅     |
| AC-1-N | A page-level locator does not find the counter value element inside the frame                       | negative/AC-1a: a page-level locator does not find the counter value element                         | N    | ✅     |
| AC-2   | Clicking increment multiple times updates the displayed count correctly                              | positive: clicking increment 3 times raises the count from 0 to 3                                    | P    | ✅     |
| AC-2-B | Changing the step size then incrementing raises the count by exactly the new step                   | boundary/AC-2a: changing the step size to 5 then incrementing once raises the count by exactly 5      | B    | ✅     |
| AC-2-N | Clicking decrement below 0 produces a negative count (no floor clamp)                                | negative/AC-2b: clicking decrement below 0 produces a negative count (no floor clamp)                 | N    | ✅     |
| AC-3   | The Challenge 2 form is filled and submitted using frame-scoped locators                             | positive: valid credentials show the signed-in message                                               | P    | ✅     |
| AC-3-N | Submitting the in-frame login form with an empty username shows the required-field message           | negative/AC-3a: an empty username shows the "Username required" message                              | N    | ✅     |
| AC-4   | A second BrowserContext does not share cookies or localStorage with the first                        | positive: a second context does not see a localStorage value written in the first                    | P    | ✅     |
| AC-4-B | A value is confirmed present in the first context and explicitly absent in the second                | boundary/AC-4a: a cookie set in the first context is confirmed present there and absent in the second | B    | ✅     |
| AC-5   | The suite demonstrates the conceptual distinction between an iframe and a browser context             | positive: the counter iframe is a child frame within the same page and context, not an isolated context | P | ✅  |
| AC-5-N | A second BrowserContext is a distinct object, not reachable as a frame of the first page               | negative/AC-5a: a second BrowserContext is a distinct object whose pages are not frames of the first page | N | ✅ |
| AXE    | No critical axe-core violations at initial load                                                      | no violations at initial load                                                                        | A11y | ✅     |
| AXE    | No critical axe-core violations with Challenge 2 selected                                            | no violations with Challenge 2 selected                                                              | A11y | ✅     |
| REQ-NF1| Initial page load must meet its performance budget                                                   | initial page load completes within budget                                                            | Perf | ✅     |

---

## Defects

| ID      | Severity | Summary                                                                              | Found by                | JIRA                                                        | Status |
| ------- | -------- | --------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------------------- | ------ |
| TAB1-50 | Serious  | CSP blocked both lab iframes (`data:` URI framing denied by `default-src 'self'`)      | local test run, all ACs  | [TAB1-50](https://orhunakkan.atlassian.net/browse/TAB1-50) | Done   |
| TAB1-51 | Serious  | Insufficient color contrast on the Challenge 1/2 tab buttons (WCAG 2 AA)               | axe scan                 | [TAB1-51](https://orhunakkan.atlassian.net/browse/TAB1-51) | Done   |

---

## Traceability Summary

- **ACs covered:** 5 / 5 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5)
- **Non-functional covered:** 2 / 2 (AXE across 2 states · Performance budget)
- **Test cases:** 14 (P:6 · N:5 · B:2 · A11y:2 · Perf:1) on Desktop Chrome; full 4-browser total pending CI
- **API coverage:** all JIRA-listed APIs exercised — `page.frameLocator` (AC-1/AC-2/AC-3), `BrowserContext`/`browser.newContext()` (AC-4/AC-5), `context.newPage()` (AC-4/AC-5)
- **Root-cause note:** both iframes on this lab are served via `data:` URIs; the site's CSP (`default-src 'self'`, no `frame-src`) initially blocked framing of `data:` content in every browser (TAB1-50), and the Challenge tab buttons initially failed WCAG AA contrast (TAB1-51) — both fixed and re-verified 2026-07-12
- **Open defects:** 0 (TAB1-50 and TAB1-51 fixed and verified 2026-07-12, 14/14 tests passing on Desktop Chrome)
- **Exit criteria met:** ✅ — all ACs covered, 0 non-flaky failures, a11y clean across 2 states, local pass on Desktop Chrome
