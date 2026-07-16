# Test Plan — Web Storage & Partitioned Cookies (TAB1-61)

## 1. Scope

In scope: `localStorage` persistence of a theme toggle across `page.reload()` within the same
browser context; `sessionStorage` isolation of a draft note between the original page and a page
opened via `context.newPage()`; `context.addCookies()` with a `partitionKey` to unlock a
partitioned-cookie widget both pre-navigation and mid-test (via the "Re-check cookie" affordance,
no reload); `context.cookies()` read-back and value assertion; `context.clearCookies()` removing
the partitioned cookie while leaving `localStorage`/`sessionStorage` untouched, and identifying
the correct API (`page.evaluate(() => localStorage.clear())` / `sessionStorage.clear()`) for
clearing storage instead.

Out of scope: real cross-site/third-party cookie partitioning against an actual second origin
(the lab simulates partition scoping via `partitionKey` on a single origin — no second domain is
stood up); `storageState()` file serialization (covered by TAB1-23 Storage State); cookie
expiry/`Max-Age` behavior; IndexedDB or other storage APIs not exposed by this lab.

## 2. Test types

Functional (positive / negative / boundary) ✅ · Accessibility (axe, all states) ✅ ·
Non-functional (performance budget) ✅ · Cross-browser ✅ (4 browsers — `context.addCookies` /
`context.cookies` / `context.clearCookies` and Web Storage APIs are all browser-agnostic
Playwright context APIs, no CDP dependency).

## 3. Environments & data

Target env: production Stagecraft Labs instance, `BASE_URL` sourced from `.env` / `.env.<ENV>`
(see `playwright.config.ts` dotenv loading; default `https://stagecraftlabs.com`). No seed data
required — each test sets its own cookie/storage values per isolated browser context. The
partitioned cookie name/value (`widget_partitioned`) and `partitionKey` come from the story's ACs;
no faker-based generation needed since the widget checks an exact cookie identity, not arbitrary
valid input.

## 4. Browser / device matrix

From `playwright.config.ts` `projects[]`: Desktop Chrome, Desktop Firefox, Desktop Edge,
Desktop Safari. No engine-specific constraints — all APIs exercised (`context.addCookies`,
`context.cookies`, `context.clearCookies`, `context.newPage`, `localStorage`, `sessionStorage`)
are standard Playwright/Web APIs supported uniformly across all four projects.

## 5. Risk assessment & priority

| Area / Requirement                                                                     | Likelihood | Impact | Risk | Priority |
| -------------------------------------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| REQ-01 Theme toggle persists via `localStorage` across `page.reload()`                 | M          | H      | H    | P1       |
| REQ-02 Draft note in `sessionStorage` absent on a `context.newPage()` tab              | M          | H      | H    | P1       |
| REQ-03 `context.addCookies` w/ `partitionKey` pre-nav unlocks widget                   | M          | H      | H    | P1       |
| REQ-04 No cookie → locked; mid-test `addCookies` + "Re-check cookie" unlocks           | M          | H      | H    | P1       |
| REQ-01a New context does not see another context's `localStorage` value                | L          | M      | L    | P2       |
| REQ-01b Default/unset theme before any toggle                                          | L          | L      | L    | P3       |
| REQ-02a Draft note DOES survive a reload of the same tab (per-tab, not per-reload)     | M          | M      | M    | P2       |
| REQ-03a Missing/incorrect `partitionKey` keeps widget locked                           | M          | H      | H    | P2       |
| REQ-04a Locked state is stable across repeated "Re-check cookie" clicks with no cookie | L          | M      | L    | P2       |
| REQ-05 `context.cookies()` read-back includes `widget_partitioned` w/ expected value   | M          | M      | M    | P2       |
| REQ-05a `context.cookies()` in an unrelated fresh context excludes the cookie          | L          | M      | L    | P3       |
| REQ-06 `context.clearCookies()` removes cookie, leaves Web Storage intact              | M          | H      | H    | P2       |
| REQ-06a Post-`clearCookies()` widget re-locks / re-check fails                         | L          | M      | L    | P3       |
| REQ-NF1 Performance budget                                                             | L          | M      | L    | P2       |
| REQ-A11Y Accessibility, all states                                                     | M          | H      | H    | P1       |

## 6. Entry criteria

- Requirements extracted and prioritized (requirement-extractor done — Step 1)
- POM exists for the lab (locator-mapper done — Step 3)
- App URL reachable: `https://stagecraftlabs.com/practice/client-storage-partitioning`
- `BASE_URL` configured in `.env`

## 7. Exit criteria

- 100% of P1 + P2 requirements have passing automated cases across all 4 browsers
- 0 open non-flaky defects of severity ≥ High linked to TAB1-61
- Accessibility: 0 critical/serious violations (or tracked + accepted with a defect id)
- Green across all 4 configured browsers in CI
- RTM generated and up to date: `docs/rtm/client-storage-partitioning.rtm.md`

## 8. Deliverables

`tests/client-storage-partitioning/client-storage-partitioning.spec.ts` ·
`pages/client-storage-partitioning.page.ts` · RTM
(`docs/rtm/client-storage-partitioning.rtm.md`) · this plan · CI run

## 9. Schedule / effort (lightweight)

Requirements → this plan → POM (locator-mapper) → fixture registration → spec
(test-case-generator) → local run → triage → PR → CI → RTM confirmation → JIRA review/done
