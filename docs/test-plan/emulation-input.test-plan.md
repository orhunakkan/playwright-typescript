# Test Plan — Emulation & Input (TAB1-18)

## 1. Scope

**In scope:**

- Command palette keyboard control (Control+K open, ArrowUp/Down navigate, Enter select, Escape dismiss)
- Hover tooltip behaviour (visible on hover, hidden on initial load and mouse-out)
- Viewport emulation via `page.setViewportSize()` — desktop vs mobile (stacked) layout
- Mouse wheel scrolling via `page.mouse.wheel()` and conditional "Scroll to top" button visibility
- Accessibility in all key states: page load, palette open, tooltip visible, mobile layout
- Performance budget: initial page load timing

**Out of scope:**

- Backend logic or API responses behind palette commands
- Touch/gesture events (tap, swipe) — tested in TAB1-41
- i18n / locale-specific layout differences
- Load or stress testing

---

## 2. Test Types

| Type                                | Applies                                           |
| ----------------------------------- | ------------------------------------------------- |
| Functional — positive               | ✅                                                |
| Functional — negative               | ✅                                                |
| Functional — boundary               | ✅                                                |
| Data-driven                         | ✅ (viewport widths, scroll amounts)              |
| Accessibility (axe, multi-state)    | ✅                                                |
| Non-functional — performance budget | ✅                                                |
| Cross-browser                       | ✅                                                |
| Mobile-specific (Gap #10)           | ✅ — `test.use({ ...devices['iPhone 14'] })` stub |

---

## 3. Environments & Data

| Environment | BASE_URL                                      |
| ----------- | --------------------------------------------- |
| Default     | `https://stagecraftlabs.com` (`.env`)         |
| QA          | `https://qa-stagecraftlabs.com` (`.env.qa`)   |
| UAT         | `https://uat-stagecraftlabs.com` (`.env.uat`) |

**Target for this run:** Default (`https://stagecraftlabs.com/practice/emulation-input`)

**Test data strategy:**

- Viewport widths: fixed table — `{ width: 1280, label: 'desktop' }`, `{ width: 375, label: 'mobile' }`, breakpoint boundary pair
- Scroll amounts: fixed — small (10px), threshold-crossing, and zero
- Command items: derived from live page inspection via Playwright MCP
- No auth or seed data required — lab is a self-contained practice page

---

## 4. Browser / Device Matrix

| Project         | Device / Browser                  |
| --------------- | --------------------------------- |
| Desktop Chrome  | Chromium, desktop viewport        |
| Desktop Firefox | Firefox, desktop viewport         |
| Desktop Edge    | Chromium (Edge), desktop viewport |
| Desktop Safari  | WebKit, desktop viewport          |

**Gap #10 mobile stub** — `test.use({ ...devices['iPhone 14'] })` for viewport/mobile tests where relevant.

---

## 5. Risk Assessment & Priority

| Area / Requirement                             | Likelihood | Impact | Risk | Priority |
| ---------------------------------------------- | ---------- | ------ | ---- | -------- |
| Keyboard shortcut palette open / close         | M          | H      | H    | P1       |
| Arrow key palette navigation + Enter select    | M          | H      | H    | P1       |
| Escape dismiss                                 | L          | M      | M    | P1       |
| Hover tooltip visibility                       | L          | M      | M    | P1       |
| Viewport resize layout switch                  | M          | H      | H    | P1       |
| Mouse wheel scroll + button appearance         | M          | H      | H    | P1       |
| Negative: palette not visible before Control+K | L          | M      | M    | P2       |
| Negative: tooltip not visible before hover     | L          | M      | M    | P2       |
| Boundary: mobile breakpoint edge               | M          | M      | M    | P2       |
| Boundary: scroll threshold                     | M          | M      | M    | P2       |
| Accessibility — all states                     | M          | H      | H    | P1       |
| Performance budget                             | L          | L      | L    | P2       |

---

## 6. Entry Criteria

- Requirements extracted and prioritised (Step 1 ✅)
- POM generated for the lab (`pages/emulation-input.page.ts`)
- App URL reachable: `https://stagecraftlabs.com/practice/emulation-input`
- `BASE_URL` configured in `.env`
- `@axe-core/playwright` and `@faker-js/faker` present in `package.json` ✅

---

## 7. Exit Criteria

- 100% of P1 + P2 requirements have passing automated cases
- 0 open non-flaky defects of severity ≥ High linked to TAB1-18
- Accessibility: 0 critical/serious axe violations across all tested states (or tracked with a defect id)
- Green across all 4 browser projects in CI
- RTM generated and up to date (`docs/rtm/emulation-input.rtm.md`)

---

## 8. Deliverables

| Artifact              | Path                                            |
| --------------------- | ----------------------------------------------- |
| Page Object Model     | `pages/emulation-input.page.ts`                 |
| Spec file             | `tests/emulation-input/emulation-input.spec.ts` |
| RTM                   | `docs/rtm/emulation-input.rtm.md`               |
| Test Plan (this file) | `docs/test-plan/emulation-input.test-plan.md`   |
| CI run                | GitHub Actions (post-push)                      |

---

## 9. Schedule / Effort

1. Requirements extracted ✅
2. Test Plan written ✅ (this step)
3. POM generated via `locator-mapper` — Step 3
4. Fixture registered — Step 3.5
5. JIRA marked In Progress — Step 4
6. Spec generated via `test-case-generator` — Step 5
7. Tests run locally — Step 6
8. Failures triaged — Step 7
9. RTM generated — Step 8
10. JIRA transitioned In Review — Step 8
