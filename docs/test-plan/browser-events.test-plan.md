# Test Plan: Browser Events

**JIRA Story:** [TAB1-17](https://orhunakkan.atlassian.net/browse/TAB1-17)  
**Lab URL:** https://stagecraftlabs.com/practice/browser-events  
**Date:** 2026-06-18  
**Author:** Orhun Akkan

---

## 1. Scope

### In Scope

- `page.on("dialog")` handler registration timing: must be registered before the triggering click
- Alert dialog: trigger and dismiss; assert post-dismiss page state
- Confirm dialog: accept in one test, dismiss in another; assert distinct outcomes on the page
- Prompt dialog: supply a return string via handler; assert the page displays exactly that string
- Prompt dialog: empty string and special-character variants
- File upload via `locator.setInputFiles()` on a hidden input without triggering the OS file picker
- Download via `page.waitForEvent("download")`; assert `suggestedFilename === "sample.txt"`
- Navigation via "Navigate to home" link using `page.waitForURL()` / `page.waitForNavigation()`
- Accessibility scans in load, post-dialog, post-upload, and post-download states
- Performance budget (page load < 3 s)

### Out of Scope

- Real OS-level file picker interactions
- Actual file content validation after download (only filename is in scope)
- Authentication or session state
- Backend persistence of uploaded files

---

## 2. Test Objectives

| #   | Objective                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------ |
| 1   | Handler registered before click intercepts each dialog type (alert, confirm, prompt) without timing errors         |
| 2   | Accepting a confirm dialog shows an "accepted" outcome; dismissing shows a different (dismissed) outcome           |
| 3   | Returning a specific string to a prompt handler causes exactly that string to appear on the page                   |
| 4   | `setInputFiles()` silently sets the file on a hidden input; no OS dialog appears; filename visible in the UI       |
| 5   | `page.waitForEvent("download")` captures the event; `download.suggestedFilename()` equals `"sample.txt"` exactly   |
| 6   | `page.waitForURL()` after clicking the navigation link awaits the full transition before any URL assertion is made |

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

| Risk                                                                | Priority | Mitigation                                                                       |
| ------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------- |
| Dialog handler registered after click causes unhandled dialog crash | P1       | Always use `Promise.all([page.waitForEvent("dialog"), locator.click()])` pattern |
| Download event missed if `waitForEvent` is awaited after the click  | P1       | Use `Promise.all([page.waitForEvent("download"), locator.click()])` pattern      |
| `suggestedFilename` differs across browsers for the same download   | P2       | Assert exact `"sample.txt"` — fail loudly if it changes                          |
| `setInputFiles` not supported on non-`<input type="file">` elements | P2       | Verify element type in POM; test expects a real hidden file input                |
| Navigation timing varies across browsers for `waitForURL`           | P2       | Use a URL regex or exact path rather than a full URL with origin                 |
| Special characters in prompt return string encoded by the browser   | P3       | Assert innerText (already decoded) rather than raw HTML                          |

---

## 6. Entry Criteria

- `https://stagecraftlabs.com/practice/browser-events` is reachable and returns HTTP 200
- All four dialog trigger buttons are visible before any test step
- All configured browser environments are available

## 7. Exit Criteria

- All 6 ACs covered by at least one positive test case
- Each AC has at least one negative or boundary test
- Axe scan passes in load, post-dialog, post-upload, and post-download states
- Performance test asserts load < 3 s
- All tests pass locally on Desktop Chrome
- CI run passes across all 4 configured browsers (gates story → Done)

---

## 8. Test Case Summary

| AC     | Test Cases                                                                                             | Types              |
| ------ | ------------------------------------------------------------------------------------------------------ | ------------------ |
| AC-1   | Handler registered before alert click accepts dialog; page shows alert-dismissed confirmation          | Positive           |
| AC-1-B | Each dialog type (alert, confirm, prompt) exercised individually                                       | Boundary           |
| AC-2   | Accept confirm → page shows "accepted" message; dismiss confirm → page shows "dismissed" message       | Positive, Negative |
| AC-3   | Return "Hello Playwright" to prompt → page displays exactly "Hello Playwright"                         | Positive           |
| AC-3-B | Return `""` to prompt → page shows defined empty/default state; return `"<>&"` → verbatim in innerText | Boundary           |
| AC-4   | `setInputFiles()` sets a real `.txt` file on hidden input; filename appears in page without OS picker  | Positive           |
| AC-4-B | `setInputFiles([])` clears the selection; filename indicator is absent                                 | Boundary           |
| AC-5   | `waitForEvent("download")` captures download; `suggestedFilename()` === `"sample.txt"`                 | Positive           |
| AC-5-B | Filename must match `"sample.txt"` case-sensitively (not `"Sample.txt"` etc.)                          | Boundary           |
| AC-6   | `waitForURL()` after "Navigate to home" click; final URL matches home path                             | Positive           |
| AC-6-B | URL assertion runs only after navigation settles (not before)                                          | Boundary           |
| A11Y   | Axe WCAG 2.1 AA: load, post-confirm-accept, post-file-upload, post-download                            | Accessibility      |
| PERF   | Page load < 3 s via `PerformanceNavigationTiming`                                                      | Performance        |
