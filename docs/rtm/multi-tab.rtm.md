# Requirements Traceability Matrix — Multi-Tab

| Field      | Value                                                          |
| ---------- | -------------------------------------------------------------- |
| JIRA Story | [TAB1-31](https://orhunakkan.atlassian.net/browse/TAB1-31)     |
| Lab URL    | https://stagecraftlabs.com/practice/multi-tab                  |
| Spec file  | tests/multi-tab/multi-tab.spec.ts                              |
| POM file   | pages/multi-tab.page.ts                                        |
| Last run   | 2026-07-11 — 36 / 36 passed (Chrome · Firefox · Edge · Safari) |
| Generated  | 2026-07-11                                                     |

---

## Coverage by Acceptance Criterion

| Req     | Acceptance Criterion                                                                                                        | Test Case                                                                                                   | Type | Result |
| ------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---- | ------ |
| AC-1    | Tests set up `context.waitForEvent("page")` before clicking "Open dashboard in new tab" and assert a heading in the new tab | positive: waitForEvent("page") set up before the click captures the new tab; heading is asserted            | P    | ✅     |
| AC-1-B  |                                                                                                                             | (exact heading text asserted via `toHaveText`, not just visibility)                                         | B    | ✅     |
| AC-2    | Tests interact with the new tab and close it after assertions, verifying no extra pages remain open in the context          | positive: interacting with the new tab updates its own counter independently                                | P    | ✅     |
| AC-2-B  |                                                                                                                             | boundary/AC-2: after closing the new tab, context.pages() returns exactly the original page                 | B    | ✅     |
| AC-3    | Tests use `page.waitForEvent("popup")` to capture the popup window and assert content inside it                             | positive: popup event captures the popup; content inside the popup is asserted                              | P    | ✅     |
| AC-3-B  | Popup event is distinct from the new-tab page event                                                                         | boundary: the popup page object is distinct from a new tab opened via the context "page" event              | B    | ✅     |
| AC-4    | Tests write to `localStorage` (key `multi-tab:shared`) in a new tab and assert the value is readable from the main page     | positive/boundary: a write in the new tab is readable on the main page after switching back                 | P/B  | ✅     |
| AC-4-N  | Value is absent before the write                                                                                            | negative: the shared value is absent on the main page before any tab writes it                              | N    | ✅     |
| AC-5    | Tests close all extra pages after each test to prevent state leaking into subsequent tests in the same context              | afterEach hook (applies to every test): closes extra pages and asserts `context.pages()` has exactly 1 page | P    | ✅     |
| AXE     | The main page must have no critical axe-core violations at load                                                             | no violations at initial load                                                                               | A11y | ✅     |
| REQ-NF1 | The new-tab-open-and-read flow must meet its performance budget                                                             | opening a new tab, capturing it, and reading its heading completes within budget                            | Perf | ✅     |

---

## Defects

| ID  | Severity | Summary          | Found by | JIRA | Status |
| --- | -------- | ---------------- | -------- | ---- | ------ |
| —   | —        | No defects found | —        | —    | —      |

---

## Traceability Summary

- **ACs covered:** 5 / 5 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5)
- **Non-functional covered:** 2 / 2 (AXE load state · Performance budget)
- **Test cases:** 9 (P:5 · N:2 · B:2 · A11y:1 · Perf:1) × 4 browsers = **36 total**
- **AC-5 enforcement:** implemented as a shared `afterEach` hook (closes extra pages + asserts `context.pages()` length) rather than a single dedicated test, since it must hold for every test in the file, not just one
- **Open defects:** 0
- **Exit criteria met:** ✅ — all P1+P2 requirements covered, 0 non-flaky failures, a11y clean at load, 4 browsers green locally
