# Test Plan — Audit Log & Search (TAB1-67)

## 1. Scope

In scope: admin authorization messages; reseeding and seeded counts; pagination; username and date-range filters; SQL-injection-style literal search handling; and durable login-event persistence for the fixed fixture identities.

Out of scope: Azure SQL implementation details, database load testing, and any backend APIs not exposed by the Audit Log & Search UI.

## 2. Test types

Functional tests cover positive, negative, boundary, and data-driven cases. Accessibility scans cover initial, authorization-error, empty-result, populated-result, and post-reseed states. A tagged performance test covers initial page load. All cases run cross-browser.

## 3. Environments & data

The live target is supplied by `BASE_URL` in `.env` (with optional `.env.<ENV>` override). Tests use the documented fixed `alice` admin and `bob` non-admin accounts, plus fixed date/search values for deterministic filtering. The application intentionally exposes no account-provisioning endpoint; `test.describe.configure({ mode: 'serial' })` protects the shared mutable audit fixture while each specification reseeds its known baseline.

## 4. Browser / device matrix

| Project         |
| --------------- |
| Desktop Chrome  |
| Desktop Firefox |
| Desktop Edge    |
| Desktop Safari  |

## 5. Risk assessment & priority

| Area / Requirement                               | Likelihood | Impact | Risk | Priority |
| ------------------------------------------------ | ---------- | ------ | ---- | -------- |
| Admin authorization and access messaging         | M          | H      | H    | P1       |
| Reseed action and seeded count/page total        | M          | H      | H    | P1       |
| Pagination and final-page boundary               | M          | H      | H    | P1       |
| Username filtering and returned-row correctness  | M          | H      | H    | P1       |
| Date-range empty and populated states            | M          | H      | H    | P1       |
| SQL-injection-style search is treated literally  | M          | H      | H    | P1       |
| Fixed-user login event is persistently queryable | M          | H      | H    | P1       |
| Invalid/blank filters and disabled controls      | M          | M      | M    | P2       |
| Accessibility in all rendered states             | M          | H      | H    | P1       |
| Initial-load performance budget                  | M          | M      | M    | P2       |

## 6. Entry criteria

- TAB1-67 requirements are extracted and prioritized.
- The Audit Log & Search URL is reachable with `BASE_URL` configured.
- The POM, fixture, and required test data are available.

## 7. Exit criteria

- All P1 and P2 requirements have passing automated coverage.
- No open non-flaky High-or-higher defect is linked to TAB1-67.
- No critical or serious axe violations remain, or each is tracked and accepted.
- CI is green for all four desktop-browser projects.
- The RTM is current.

## 8. Deliverables

- `pages/audit-log-search.page.ts`
- `tests/audit-log-search/audit-log-search.spec.ts`
- `docs/rtm/audit-log-search.rtm.md`
- This test plan
- Lab-scoped GitHub Actions run and open PR

## 9. Schedule / effort

Requirements → test plan → locator audit/POM → fixture → spec → local execution/triage → RTM → PR → CI verification → JIRA closure.
