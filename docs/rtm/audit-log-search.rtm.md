# Requirements Traceability Matrix — Audit Log & Search

| Field      | Value                                                                      |
| ---------- | -------------------------------------------------------------------------- |
| JIRA Story | [TAB1-67](https://orhunakkan.atlassian.net/browse/TAB1-67)                 |
| Lab URL    | https://stagecraftlabs.com/practice/audit-log-search                       |
| Spec file  | tests/audit-log-search/audit-log-search.spec.ts                            |
| POM file   | pages/audit-log-search.page.ts                                             |
| Last run   | 2026-07-24 — 36 / 36 passed (Chrome · Firefox · Edge · Safari) — local run |
| Generated  | 2026-07-24                                                                 |

---

## Coverage by Acceptance Criterion

| Req     | Acceptance Criterion                                                                                  | Test Case                                                                         | Type | Result |
| ------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---- | ------ |
| AC-1    | Unauthenticated visitors are told to sign in; non-admin users are told they lack admin access         | negative: unauthenticated and non-admin users receive distinct access messages    | N    | ✅     |
| AC-2    | Admin reseeding restores the known fixture total, page count, and first-page result count             | positive: admin reseeding restores the known entry and page totals                | P    | ✅     |
| AC-3    | Next and Prev paginate results; Next is disabled on the final page                                    | positive: Next and Prev change results and the last page disables Next            | P/B  | ✅     |
| AC-4    | Username search returns the correct seeded count and matching rows                                    | positive: searching bob returns only bob rows with the seeded total               | P    | ✅     |
| AC-5    | Date-range filtering exposes accessible empty and populated states                                    | positive: date filters expose accessible empty and populated result states        | P/B  | ✅     |
| AC-6    | SQL-injection-style input is treated as literal search text and a normal search continues to work     | negative: SQL-injection-style input returns no rows and normal search still works | N    | ✅     |
| AC-7    | A successful login creates an immediately queryable persistent audit event                            | positive: a fresh alice login is immediately queryable after reseeding            | P    | ✅     |
| AXE     | The audit lab must have no axe-core violations in unauthenticated, populated, and empty-result states | no violations on unauthenticated, populated, and empty-result states              | A11y | ✅     |
| REQ-NF1 | The audit lab must meet its initial-load performance budget                                           | initial audit-log page load is within budget                                      | Perf | ✅     |

**AC-7 implementation note:** the service deliberately exposes only the fixed `alice` and `bob`
learning fixtures—there is no registration or user-provisioning contract. The serial suite reseeds
the shared audit table, signs out/in as `alice`, and asserts that the `alice` query grows beyond
its known seeded baseline. This validates persistence without inferring a new backend attack surface.

---

## Defects

| ID  | Severity | Summary          | Found by | JIRA | Status |
| --- | -------- | ---------------- | -------- | ---- | ------ |
| —   | —        | No defects found | —        | —    | —      |

---

## Traceability Summary

- **ACs covered:** 7 / 7 (AC-1 · AC-2 · AC-3 · AC-4 · AC-5 · AC-6 · AC-7)
- **Non-functional covered:** 2 / 2 (axe multi-state · performance budget)
- **Test cases:** 9 × 4 browsers = **36 planned executions**
- **Fixed-fixture strategy:** ✅ serial, reseed-backed; no account-provisioning endpoint is assumed
- **Open defects:** 0
- **Exit criteria:** local all-browser gate passed; awaiting CI confirmation.
