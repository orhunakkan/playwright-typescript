# Requirements Traceability Matrix — Emulation & Input (TAB1-18)

| Field        | Value                                                            |
| ------------ | ---------------------------------------------------------------- |
| JIRA story   | [TAB1-18](https://orhunakkan.atlassian.net/browse/TAB1-18)       |
| Spec         | `tests/emulation-input/emulation-input.spec.ts`                  |
| POM          | `pages/emulation-input.page.ts`                                  |
| Test plan    | `docs/test-plan/emulation-input.test-plan.md`                    |
| Local run    | 104 / 104 passing (Chrome · Firefox · Edge · Safari + iPhone 14) |
| Open defects | 0                                                                |

---

## Requirement → Test Case Map

| Req ID    | Requirement                                                                                           | Priority | Test Case(s)                                                                                               | Status  |
| --------- | ----------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- | ------- |
| AC-1      | Tests open the command palette using `page.keyboard.press("Control+K")` and assert it becomes visible | P1       | `AC-1 — positive: Control+K opens the command palette`                                                     | ✅ Pass |
| AC-1-N    | Command palette is not visible on initial page load                                                   | P1       | `AC-1 — negative: command palette is not visible on initial page load`                                     | ✅ Pass |
| AC-2      | Navigate palette items with arrow keys; confirm selection with Enter; correct name in result area     | P1       | `AC-2 — positive: ArrowDown then Enter selects second command and shows result`                            | ✅ Pass |
| AC-2-N    | Result status element absent before any command is executed (`role="status"` injected dynamically)    | P2       | `AC-2 — negative: result status element is absent before any command is executed`                          | ✅ Pass |
| AC-2-B1   | ArrowUp from first item keeps first item selected (no wrap or crash)                                  | P2       | `AC-2 — boundary: ArrowUp from first item keeps first item selected`                                       | ✅ Pass |
| AC-2-B2   | ArrowDown from last item stays on last or wraps without error                                         | P2       | `AC-2 — boundary: ArrowDown from last item stays on last or wraps without error`                           | ✅ Pass |
| AC-3      | Tests dismiss the palette with Escape and assert it is no longer visible                              | P1       | `AC-3 — positive: Escape closes the open palette`                                                          | ✅ Pass |
| AC-3-N    | Escape when palette is already closed causes no visible error                                         | P2       | `AC-3 — negative: Escape when palette is closed causes no visible error`                                   | ✅ Pass |
| AC-4      | Tests trigger hover tooltip using `locator.hover()` / `page.mouse.move()` and assert tooltip visible  | P1       | `AC-4 — positive: hovering the trigger shows the tooltip`                                                  | ✅ Pass |
| AC-4-N1   | Tooltip is not visible on initial page load                                                           | P1       | `AC-4 — negative: tooltip is not visible on initial page load`                                             | ✅ Pass |
| AC-4-N2   | Tooltip disappears after moving mouse away                                                            | P2       | `AC-4 — negative: tooltip disappears after moving mouse away`                                              | ✅ Pass |
| AC-5      | Tests resize viewport to narrow mobile width using `page.setViewportSize()` and assert mobile layout  | P1       | `AC-5 — positive: 375px viewport shows mobile (stacked) layout`                                            | ✅ Pass |
| AC-5-N    | Desktop viewport (1280px) shows side-by-side layout                                                   | P1       | `AC-5 — negative: desktop viewport (1280px) shows side-by-side layout`                                     | ✅ Pass |
| AC-5-DD1  | Data-driven: desktop (1280px) → side-by-side layout                                                   | P2       | `AC-5 — data-driven: desktop (1280px) → desktop (side-by-side)`                                            | ✅ Pass |
| AC-5-DD2  | Data-driven: mobile (375px) → stacked layout                                                          | P2       | `AC-5 — data-driven: mobile (375px) → mobile (stacked)`                                                    | ✅ Pass |
| AC-5-DD3  | Data-driven: tablet-wide (768px) → side-by-side layout                                                | P2       | `AC-5 — data-driven: tablet-wide (768px) → desktop (side-by-side)`                                         | ✅ Pass |
| AC-5-M    | iPhone 14 device emulation shows mobile (stacked) layout (Gap #10)                                    | P2       | `AC-5 — iPhone 14 device emulation (Gap #10) — positive: iPhone 14 viewport shows mobile (stacked) layout` | ✅ Pass |
| AC-6      | Tests use `page.mouse.wheel()` to scroll container; "Scroll to top" button appears after scrolling    | P1       | `AC-6 — positive: scrolling the container reveals the Scroll to top button`                                | ✅ Pass |
| AC-6-N    | "Scroll to top" button not visible on initial load                                                    | P1       | `AC-6 — negative: Scroll to top button is not visible on initial load`                                     | ✅ Pass |
| AC-6-B1   | Minimal scroll (10px) does not reveal the button                                                      | P2       | `AC-6 — boundary: minimal (10px) scroll — button stays hidden`                                             | ✅ Pass |
| AC-6-B2   | Sufficient scroll (500px) reveals the button                                                          | P2       | `AC-6 — boundary: sufficient (500px) scroll — button appears`                                              | ✅ Pass |
| A11Y-LOAD | No WCAG 2.1 AA violations on initial page load                                                        | P2       | `accessibility — no violations on initial page load`                                                       | ✅ Pass |
| A11Y-PAL  | No WCAG 2.1 AA violations while command palette is open                                               | P2       | `accessibility — no violations while command palette is open`                                              | ✅ Pass |
| A11Y-TIP  | No WCAG 2.1 AA violations while hover tooltip is visible                                              | P2       | `accessibility — no violations while hover tooltip is visible`                                             | ✅ Pass |
| A11Y-MOB  | No WCAG 2.1 AA violations in mobile layout (375px viewport)                                           | P2       | `accessibility — no violations in mobile layout (375px viewport)`                                          | ✅ Pass |
| PERF-1    | Initial load within budget (DOMContentLoaded < 6 s, load < 12 s)                                      | P3       | `performance @performance — initial load is within budget`                                                 | ✅ Pass |

---

## Defects

| ID      | Summary                                                                                                 | Severity | Status   | Blocks In Review? |
| ------- | ------------------------------------------------------------------------------------------------------- | -------- | -------- | ----------------- |
| TAB1-45 | Command palette `<ul role="listbox">` missing `tabindex="0"` — `scrollable-region-focusable` WCAG 2.1.1 | High     | ✅ Fixed | No (fixed)        |

---

## Notes

- Both "Mobile layout (stacked)" and "Wide layout (side-by-side)" labels are always in the DOM simultaneously. CSS controls visibility via viewport media queries. AC-5 tests use `.toBeVisible()` / `.not.toBeVisible()` — not text assertion.
- `role="status"` (aria-live) is dynamically injected into the DOM only after the first command execution. AC-2-N uses `toHaveCount(0)` rather than `toBeEmpty()` since the element is absent, not empty.
- `Control+K` keyboard focus: `beforeEach` clicks the `h1` heading (non-link) to give the page keyboard focus before dispatching shortcuts. `body.click({ position: {x:10,y:10} })` was clicking the Stagecraft logo link, causing navigation.
- Gap #10 (mobile device emulation): `test.use({ viewport, userAgent })` from `devices['iPhone 14']`. `defaultBrowserType` excluded — it forces a new worker in a describe block.
- All 6 JIRA ACs covered. CI run across Desktop Chrome / Firefox / Edge / Safari required to gate story → Done.
