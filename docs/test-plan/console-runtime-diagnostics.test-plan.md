# Test Plan — Console & Runtime Diagnostics (TAB1-62)

## 1. Scope

In scope: capturing console messages (`page.on('console')`) across info/warning/error levels;
capturing uncaught synchronous errors and unhandled promise rejections (`page.on('pageerror')`);
capturing outgoing requests for a missing-resource fetch (`page.on('request')` /
`page.waitForRequest()`); documenting whether the installed Playwright version exposes any
page-level historical accessor for these events versus manual array collection via listeners.

Out of scope: server-side logging/observability, network payload/body assertions beyond request
capture, non-Chromium DevTools Protocol behavior, load/performance testing beyond the standard
budget check.

## 2. Test types

Functional (positive / negative / boundary / data-driven) — applies.
Accessibility (axe, all states) — applies.
Non-functional (performance budget) — applies.
Cross-browser — applies (event APIs under test are standard Playwright `Page` events, not
CDP-only, so no browser-skip is expected unless live testing proves otherwise).

## 3. Environments & data

Target env: production lab site, `BASE_URL=https://stagecraftlabs.com` (from `.env`).
Test data strategy: no form data — the lab is interaction/event-driven (buttons trigger console
logs, an uncaught error, a promise rejection, and a missing-resource fetch). No faker data needed;
assertions are on captured event payloads (message text/type, error message, request URL).
No auth/seed needs — the lab requires no login.

## 4. Browser / device matrix

Desktop Chrome · Desktop Firefox · Desktop Edge · Desktop Safari (from `playwright.config.ts`
`projects[]`).

## 5. Risk assessment & priority

| Area / Requirement                                    | Likelihood | Impact | Risk | Priority |
| ------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| Console listener captures info/warning/error correctly   | M          | H      | H    | P1       |
| pageerror captures synchronous uncaught throw             | M          | H      | H    | P1       |
| pageerror parity (or documented gap) for promise rejection| H          | M      | H    | P1       |
| Request listener captures missing-resource fetch          | M          | H      | H    | P1       |
| Page-level historical accessor vs manual collection check | L          | L      | L    | P2       |
| Accessibility — all rendered states                       | L          | H      | M    | P1       |
| Performance budget                                         | L          | M      | L    | P2       |

## 6. Entry criteria

- Requirements extracted and prioritized (requirement-extractor done)
- POM exists for the lab (locator-mapper done)
- App URL reachable; `BASE_URL` configured

## 7. Exit criteria

- 100% of P1 + P2 requirements have passing automated cases
- 0 open non-flaky defects of severity ≥ High linked to the story
- Accessibility: 0 critical/serious violations (or tracked + accepted with a defect id)
- Green across the full browser matrix in CI
- RTM generated and up to date

## 8. Deliverables

`tests/console-runtime-diagnostics/console-runtime-diagnostics.spec.ts` · POM
(`pages/console-runtime-diagnostics.page.ts`) · RTM
(`docs/rtm/console-runtime-diagnostics.rtm.md`) · this plan · CI run

## 9. Schedule / effort (lightweight)

requirements → plan → POM → spec → local run → triage → PR/CI → RTM refresh → review → done
