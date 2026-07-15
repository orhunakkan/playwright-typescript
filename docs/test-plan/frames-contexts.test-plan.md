# Test Plan: Frames & Contexts

**JIRA Story:** [TAB1-20](https://orhunakkan.atlassian.net/browse/TAB1-20)
**Lab URL:** https://stagecraftlabs.com/practice/frames-contexts
**Date:** 2026-07-12
**Author:** Orhun Akkan

---

## 1. Scope

### In Scope

- Scoping all locator calls inside the Challenge 1 counter iframe via
  `page.frameLocator('iframe[title="Counter frame"]')`, and proving a plain page-level locator
  cannot reach elements inside it
- Clicking the increment/decrement/reset buttons inside the counter iframe multiple times,
  including with a non-default step size, and asserting the displayed count
- Filling and submitting the Challenge 2 login form using frame-scoped locators
  (`page.frameLocator('iframe[title="Login frame"]')`), including the empty-username negative path
- Opening a second `BrowserContext` from the same browser and proving it does not share cookies or
  localStorage written by the first context
- A dedicated pair of test scenarios that separately demonstrate the iframe-scoping mechanism
  (Challenge 1/2) versus the browser-context-isolation mechanism (AC-4), to make the conceptual
  distinction explicit in the suite's structure
- Accessibility scan across load and post-interaction states
- Performance budget on initial page load

### Out of Scope

- Manually editing DevTools to inspect frame boundaries (guidance is exploratory, not a codified
  assertion)
- Dark mode toggle and "Mark complete" button — unrelated to frame/context isolation

---

## 2. Test Objectives

| #   | Objective                                                                                                                   |
| --- | --------------------------------------------------------------------------------------------------------------------------- |
| 1   | `page.frameLocator()` scopes locators inside the counter iframe; a page-level locator cannot reach the same element         |
| 2   | Clicking the increment button (default and custom step size) updates the in-frame counter correctly                         |
| 3   | The in-frame login form can be filled and submitted using frame-scoped locators, including the required-field negative path |
| 4   | A second `BrowserContext` does not share cookies or localStorage with the first context                                     |
| 5   | The suite structurally demonstrates the difference between frame-scoping and context isolation as two distinct mechanisms   |

---

## 3. Browser Matrix

| Browser         | Playwright Project | Priority |
| --------------- | ------------------ | -------- |
| Chromium        | Desktop Chrome     | P1       |
| Firefox         | Desktop Firefox    | P1       |
| WebKit (Safari) | Desktop Safari     | P2       |
| Edge            | Desktop Edge       | P2       |

Source: `playwright.config.ts` — 4 desktop projects configured.

---

## 4. Environments

| Environment | Base URL                   |
| ----------- | -------------------------- |
| Default     | https://stagecraftlabs.com |
| QA          | `.env.qa` → `BASE_URL`     |
| UAT         | `.env.uat` → `BASE_URL`    |

---

## 5. Risk Table

| Risk                                                                                                                                                                                                                                                                                                                                                                                                                      | Priority | Mitigation                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Both lab iframes (`Counter frame`, `Login frame`) use `data:` URIs as `src`. The site's CSP (`default-src 'self'`, no `frame-src` override) blocks framing of `data:` content in every browser** — confirmed via a live CSP console error ("Framing '' violates ... default-src 'self'") and the frame rendering "This content is blocked." This makes AC-1/AC-2/AC-3 unachievable against the current production site. | P1       | Write tests exactly per the ACs using correct `frameLocator` scoping (locators derived from the frame's decoded source); let them run and fail against the real defect; file & link a Bug per `test-triage` Phase 4b rather than skip or work around it |
| Frame content, once blocked, may leave `iframe.contentWindow` in a cross-origin/opaque state, making some diagnostic assertions (e.g. `frame.url()`) unreliable                                                                                                                                                                                                                                                           | P2       | Assert via the frame-scoped locators' visibility/timeout behavior, not `contentWindow` internals                                                                                                                                                        |
| Context-isolation tests (AC-4) create a second `BrowserContext` — must be explicitly closed or it leaks between tests                                                                                                                                                                                                                                                                                                     | P1       | `test.afterEach` closes any extra context opened during the test, verified via an explicit count assertion                                                                                                                                              |
| No pre-existing cookies/storage on the lab page to observe isolation against — the test must write its own marker value in context A before asserting its absence in context B                                                                                                                                                                                                                                            | P2       | Use `context.addCookies()` / `page.evaluate(() => localStorage.setItem(...))` to write a known marker, then assert absence in the second context                                                                                                        |

---

## 6. Entry Criteria

- `https://stagecraftlabs.com/practice/frames-contexts` is reachable and returns HTTP 200
- The lab exposes both the Challenge 1 (counter iframe) and Challenge 2 (login iframe) tabs
- `test-results/` output directory is writable

## 7. Exit Criteria

- All 5 ACs covered by at least one test case
- Each AC has at least one negative or boundary test where applicable
- Axe scan passes across load and post-interaction states
- Performance test asserts initial load completes within budget
- AC-4/AC-5 (context isolation) pass locally on Desktop Chrome
- AC-1/AC-2/AC-3 (iframe-scoped) are correctly written per spec; if they fail due to the CSP defect
  above, that failure is triaged, filed as a linked Bug, and does **not** block story progress to
  `In Review` — but blocks `Done` until resolved or the defect is otherwise closed
- CI run passes across all 4 configured browsers for whichever tests are not blocked by the open
  defect (gates story → Done)

---

## 8. Test Case Summary

| AC     | Test Cases                                                                                                                                                     | Types         |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| AC-1   | `page.frameLocator` scopes to the counter iframe; the counter value is read through it                                                                         | Positive      |
| AC-1-N | A page-level locator for the counter value does not find the element (frame isolation is real)                                                                 | Negative      |
| AC-2   | Clicking increment 3 times with the default step raises the count from 0 to 3                                                                                  | Positive      |
| AC-2-B | Changing the step size to 5 then incrementing once raises the count by exactly 5                                                                               | Boundary      |
| AC-2-N | Clicking decrement below 0 produces a negative count (no floor clamp)                                                                                          | Negative      |
| AC-3   | Filling and submitting the in-frame login form with valid credentials shows the signed-in message                                                              | Positive      |
| AC-3-N | Submitting the in-frame login form with an empty username shows the "Username required" message                                                                | Negative      |
| AC-4   | A second browser context does not see a cookie/localStorage value written in the first context                                                                 | Positive      |
| AC-4-B | The value is confirmed present in the first context and explicitly absent (not just different) in the second                                                   | Boundary      |
| AC-5   | Test suite structure separately demonstrates iframe-scoping (Challenge 1/2 describe blocks) and context isolation (AC-4 describe block) as distinct mechanisms | Positive      |
| A11Y   | Axe WCAG 2.1 AA scan at initial load and with Challenge 2 selected                                                                                             | Accessibility |
| PERF   | Initial page load completes within budget                                                                                                                      | Performance   |
