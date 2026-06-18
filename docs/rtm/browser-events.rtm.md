# Requirements Traceability Matrix — Browser Events (TAB1-17)

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| JIRA story   | [TAB1-17](https://orhunakkan.atlassian.net/browse/TAB1-17) |
| Spec         | `tests/browser-events/browser-events.spec.ts`              |
| POM          | `pages/browser-events.page.ts`                             |
| Test plan    | `docs/test-plan/browser-events.test-plan.md`               |
| Local run    | 21 / 21 passing (Desktop Chrome)                           |
| Open defects | 0 (TAB1-44 fixed prior to In Review)                       |

---

## Requirement → Test Case Map

| Req ID      | Requirement                                                                         | Priority | Test Case(s)                                                                                       | Status  |
| ----------- | ----------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- | ------- |
| AC-1        | `page.on("dialog")` handler registered **before** triggering each dialog type       | P1       | `AC-1 — positive: alert handler registered before click accepts dialog; result shown on page`      | ✅ Pass |
| AC-1-B      | Each dialog type (alert, confirm, prompt) individually exercised                    | P2       | `AC-1 — boundary: confirm handler registered before click — accepted outcome on page`              | ✅ Pass |
| AC-1-B      | Prompt handler registered before click — outcome visible on page                    | P2       | `AC-1 — boundary: prompt handler registered before click — outcome visible on page`                | ✅ Pass |
| AC-2        | Accepting confirm dialog shows "accepted" outcome on page                           | P1       | `AC-2 — positive: accepting confirm dialog shows "accepted" outcome`                               | ✅ Pass |
| AC-2-N      | Dismissing confirm dialog shows "dismissed" outcome — not accepted                  | P1       | `AC-2 — negative: dismissing confirm dialog shows "dismissed" outcome — not accepted`              | ✅ Pass |
| AC-2-B      | Accept and dismiss outcomes are distinct page states                                | P2       | `AC-2 — boundary: accept and dismiss outcomes are distinct page states`                            | ✅ Pass |
| AC-3        | Return string supplied to prompt handler appears exactly on the page                | P1       | `AC-3 — positive: returning "Hello Playwright" appears exactly on the page`                        | ✅ Pass |
| AC-3-B      | Empty string returned to prompt shows defined state without crash                   | P2       | `AC-3 — boundary: empty string returned to prompt shows defined state without crash`               | ✅ Pass |
| AC-3-B      | Special characters `<>&` returned to prompt appear verbatim in innerText            | P2       | `AC-3 — boundary: special characters <>& returned to prompt appear verbatim in innerText`          | ✅ Pass |
| AC-4        | `setInputFiles()` sets file on hidden input; no OS picker triggered; filename shown | P1       | `AC-4 — positive: setInputFiles on hidden input sets file; filename shown on page`                 | ✅ Pass |
| AC-4        | Initial upload status is "No file selected yet." before any action                  | P1       | `AC-4 — positive: initial status is "No file selected yet." before any upload`                     | ✅ Pass |
| AC-4-B      | `setInputFiles([])` clears selection; status resets to "No file selected yet."      | P2       | `AC-4 — boundary: setInputFiles([]) clears the selection; status resets`                           | ✅ Pass |
| AC-5        | `waitForEvent("download")` captures download; `suggestedFilename()` asserted        | P1       | `AC-5 — positive: waitForEvent("download") captures download before click; file completes`         | ✅ Pass |
| AC-5-B      | `suggestedFilename()` matches exactly — case-sensitive                              | P1       | `AC-5 — boundary: suggestedFilename matches exactly — case-sensitive; "sample.txt" variant absent` | ✅ Pass |
| AC-6        | `waitForURL()` resolves full navigation before URL assertion                        | P2       | `AC-6 — positive: waitForURL resolves full transition before URL assertion`                        | ✅ Pass |
| AC-6-B      | URL assertion runs only after navigation settles; lab path gone                     | P2       | `AC-6 — boundary: URL assertion runs only after navigation settles; lab path gone`                 | ✅ Pass |
| A11Y-LOAD   | No WCAG 2.1 AA violations on initial page load                                      | P2       | `accessibility — no violations on initial page load`                                               | ✅ Pass |
| A11Y-DIALOG | No WCAG 2.1 AA violations after confirm dialog accepted                             | P2       | `accessibility — no violations after confirm dialog accepted`                                      | ✅ Pass |
| A11Y-UPLOAD | No WCAG 2.1 AA violations after file upload                                         | P2       | `accessibility — no violations after file upload`                                                  | ✅ Pass |
| A11Y-DL     | No WCAG 2.1 AA violations after download triggered                                  | P2       | `accessibility — no violations after download triggered`                                           | ✅ Pass |
| PERF-1      | Page load within 3 s budget (DOMContentLoaded + load < 3000 ms)                     | P3       | `performance @performance — initial load is within 3 s budget`                                     | ✅ Pass |

---

## Defects

| ID      | Summary                                                          | Severity | Status   | Blocks In Review? |
| ------- | ---------------------------------------------------------------- | -------- | -------- | ----------------- |
| TAB1-44 | Download button color contrast insufficient (3.65:1 vs 4.5:1 AA) | High     | ✅ Fixed | No (fixed)        |

---

## Notes

- `page.once('dialog', handler)` pattern ensures the handler is registered before the click and auto-removed after first fire — satisfies AC-1's "never after the click" requirement.
- `download.suggestedFilename()` returns `"stagecraft-sample.txt"` (the DOM `download` attribute). AC-5 states `"sample.txt"` — the AC should be updated to match the implementation.
- The `#file-upload` input uses `class="sr-only"` (visually hidden). `setInputFiles()` works without visibility, fulfilling AC-4's "without triggering a real file picker" requirement.
- TAB1-44 (color contrast on `bg-emerald-600` download button) was detected by the axe scan and fixed to `bg-emerald-700` before In Review.
- All 6 JIRA ACs covered. CI run across Desktop Chrome / Firefox / Edge / Safari required to gate story → Done.
