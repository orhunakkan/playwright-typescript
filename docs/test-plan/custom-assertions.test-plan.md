# Test Plan — Custom Assertions & Matcher Composition (TAB1-64)

## 1. Scope

In scope: authoring a custom Playwright matcher `toBeAValidPrice` via `expect.extend()` that
awaits `locator.textContent()` and validates a positive currency amount; verifying the matcher's
`{ pass, message }` failure output is distinct from the default `toHaveText` diff; authoring a
second matcher `toHaveOrderStatus(expected)` that asserts against the `data-status` attribute
rather than visible badge text; combining matchers from two separate modules into one `expect`
via `mergeExpects()` and using both in a single spec; exploring `mergeTests()` to combine
fixtures from two modules and confirming compositional parity with `mergeExpects()`.

Out of scope: server-side price/status validation logic, i18n/currency-locale formatting beyond
a single currency format, load/performance testing beyond the standard budget check, matcher
behavior under `expect.soft()` (not required by the ACs).

## 2. Test types

Functional (positive / negative / boundary / data-driven) — applies.
Accessibility (axe, all states) — applies.
Non-functional (performance budget) — applies.
Cross-browser — applies (matcher logic runs in Node against locator values, not browser-specific
APIs, so no browser-skip is expected unless live testing proves otherwise).

## 3. Environments & data

Target env: production lab site, `BASE_URL=https://stagecraftlabs.com` (from `.env`).
Test data strategy: fixed table of valid/invalid price strings (currency symbol, thousands
separators, zero, negative, non-numeric) for the `toBeAValidPrice` boundary/negative cases;
fixed table of order-status values (matching/mismatching, case variants, whitespace) for
`toHaveOrderStatus`. No faker data — matcher inputs are read from live DOM text/attributes, not
generated. No auth/seed needs — the lab requires no login.

## 4. Browser / device matrix

Desktop Chrome · Desktop Firefox · Desktop Edge · Desktop Safari (from `playwright.config.ts`
`projects[]`).

## 5. Risk assessment & priority

| Area / Requirement                                            | Likelihood | Impact | Risk | Priority |
| ------------------------------------------------------------- | ---------- | ------ | ---- | -------- |
| `toBeAValidPrice` passes for valid positive currency text     | M          | H      | H    | P1       |
| `toBeAValidPrice` fails for invalid/negative/zero/non-numeric | M          | H      | H    | P1       |
| Custom failure message differs from default `toHaveText`      | L          | M      | M    | P2       |
| `toHaveOrderStatus` asserts `data-status`, not badge text     | M          | H      | H    | P1       |
| `toHaveOrderStatus` negative/case/whitespace handling         | M          | M      | M    | P2       |
| `mergeExpects()` combines two matcher modules correctly       | M          | H      | H    | P1       |
| `mergeTests()` fixture composition mirrors `mergeExpects()`   | L          | M      | M    | P2       |
| Accessibility — all rendered states                           | L          | H      | M    | P1       |
| Performance budget                                            | L          | M      | L    | P2       |

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

`tests/custom-assertions/custom-assertions.spec.ts` · POM (`pages/custom-assertions.page.ts`) ·
custom matcher modules · RTM (`docs/rtm/custom-assertions.rtm.md`) · this plan · CI run

## 9. Schedule / effort (lightweight)

requirements → plan → POM → spec → local run → triage → PR/CI → RTM refresh → review → done
