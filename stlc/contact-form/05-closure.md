---
feature: contact-form
phase: closure
status: complete # draft | approved | complete
updated: 2026-10-19
---

# Closure: contact-form

## Summary

This smoke run tested the contact-form feature (the `/contact` page, the signed-in variant, `/account/messages` and `POST`/`GET /messages`) against env `default https://practicesoftwaretesting.com`. 32 test cases covered all 12 ACs: e2e on chromium, API contract checks, and WCAG 2.2 AA a11y scans. To save time, the user had several steps skipped. The signed-in planner run in phase 3 was skipped, and the phase-5 e2e tests were written directly by stlc-author instead of the Playwright generator. Only the chromium, api and a11y projects ran (firefox, webkit, mobile-chrome and mobile-safari did not), and the matrix shows phase-6 results from before triage, because the known-defect splits were not re-run. The outcome: AC coverage is 100% (12/12) and the flaky rate is 0% (0/36). Four defects are open: 0 critical, 2 major (DEF-001, DEF-002) and 2 minor (DEF-003, DEF-004). **Exit criteria: MET**.

## Traceability and exit criteria

<!-- generated:start -->

<!-- prettier-ignore-start -->
Results: `reports/results.json` (2026-10-19T05:41:22.902Z), `reports/results-visual.json` (2026-10-19T03:49:16.725Z) · env `default https://practicesoftwaretesting.com`

### Exit criteria

| criterion | target | actual | result |
| --------- | ------ | ------ | ------ |
| AC coverage | ≥ 100% | 100% (12/12) | pass |
| open critical defects | ≤ 0 | 0 | pass |
| flaky rate | ≤ 2% | 0% (0/36) | pass |

**Exit criteria: MET**

### Acceptance criteria

| AC | title | risk | status |
| -- | ----- | ---- | ------ |
| AC-1 | Contact page is reachable from the main navigation | medium | covered |
| AC-2 | Signed-out form shows all contact fields | medium | covered |
| AC-3 | Signed-out user sends a valid message | high | covered |
| AC-4 | Empty signed-out submit shows a required error per field and sends nothing | high | covered |
| AC-5 | Invalid email format is rejected | medium | covered |
| AC-6 | Message must be at least 50 characters | medium | covered |
| AC-7 | Signed-in form greets the user and hides name and email | medium | covered |
| AC-8 | Empty signed-in submit only requires subject and message | medium | covered |
| AC-9 | Signed-in user sends a valid message | high | covered |
| AC-10 | Signed-in user's message appears in their account messages | medium | covered |
| AC-11 | Send-message API honours the contract | high | covered |
| AC-12 | Attachment rules are stated on the form | low | covered |

### Traceability

| AC | TC | type | test | a11y | api | chromium | defect |
| -- | -- | ---- | ---- | --- | --- | --- | ------ |
| AC-1 | TC-001 | e2e | tests/e2e/contact-form/TC-001-contact-from-home.spec.ts:13 | — | — | pass |  |
| AC-1 | TC-002 | e2e | tests/e2e/contact-form/TC-002-contact-from-other-page.spec.ts:13 | — | — | pass |  |
| AC-1 | TC-003 | e2e | tests/e2e/contact-form/TC-003-collapsed-mobile-menu.spec.ts:17 | — | — | pass |  |
| AC-2 | TC-004 | e2e | tests/e2e/contact-form/TC-004-signed-out-form-fields.spec.ts:6 | — | — | pass |  |
| AC-2 | TC-005 | e2e | tests/e2e/contact-form/TC-005-subject-options.spec.ts:15 | — | — | pass |  |
| AC-2 | TC-006 | a11y | tests/a11y/contact-form/TC-006-signed-out-form-loaded.spec.ts:10 | pass | — | — |  |
| AC-3 | TC-007 | e2e | tests/e2e/contact-form/TC-007-send-valid-message.spec.ts:13 | — | — | pass |  |
| AC-3 | TC-008 | e2e | tests/e2e/contact-form/TC-008-send-50-char-message.spec.ts:12 | — | — | pass |  |
| AC-3 | TC-009 | api | tests/api/contact-form/TC-009-anonymous-send-ui-body.spec.ts:13 | — | FAIL | — | DEF-002 |
| AC-3 | TC-010 | a11y | tests/a11y/contact-form/TC-010-thanks-alert.spec.ts:20 | pass | — | — |  |
| AC-4 | TC-011 | e2e | tests/e2e/contact-form/TC-011-empty-form-required-alerts.spec.ts:12 | — | — | pass |  |
| AC-4 | TC-012 | e2e | tests/e2e/contact-form/TC-012-single-empty-field.spec.ts:30 | — | — | pass |  |
| AC-4 | TC-013 | a11y | tests/a11y/contact-form/TC-013-required-alerts.spec.ts:18 | pass | — | — |  |
| AC-5 | TC-014 | e2e | tests/e2e/contact-form/TC-014-invalid-email.spec.ts:6 | — | — | pass |  |
| AC-5 | TC-015 | a11y | tests/a11y/contact-form/TC-015-email-format-alert.spec.ts:10 | pass | — | — |  |
| AC-6 | TC-016 | e2e | tests/e2e/contact-form/TC-016-message-49-blur.spec.ts:6 | — | — | FAIL | DEF-001 |
| AC-6 | TC-017 | e2e | tests/e2e/contact-form/TC-017-message-50-blur.spec.ts:6 | — | — | pass |  |
| AC-6 | TC-018 | e2e | tests/e2e/contact-form/TC-018-message-49-send.spec.ts:7 | — | — | pass |  |
| AC-6 | TC-019 | a11y | tests/a11y/contact-form/TC-019-min-length-alert.spec.ts:13 | FAIL | — | — | DEF-001 |
| AC-7 | TC-020 | e2e | tests/e2e/contact-form/TC-020-signed-in-greeting.spec.ts:9 | — | — | pass |  |
| AC-7 | TC-021 | a11y | tests/a11y/contact-form/TC-021-signed-in-form-loaded.spec.ts:15 | pass | — | — |  |
| AC-8 | TC-022 | e2e | tests/e2e/contact-form/TC-022-signed-in-empty-submit.spec.ts:9 | — | — | pass |  |
| AC-8 | TC-023 | a11y | tests/a11y/contact-form/TC-023-signed-in-required-alerts.spec.ts:15 | pass | — | — |  |
| AC-9 | TC-024 | e2e | tests/e2e/contact-form/TC-024-signed-in-send.spec.ts:11 | — | — | pass |  |
| AC-9 | TC-025 | e2e | tests/e2e/contact-form/TC-025-signed-in-send-50-chars.spec.ts:10 | — | — | pass |  |
| AC-9 | TC-026 | api | tests/api/contact-form/TC-026-authenticated-send.spec.ts:14 | — | FAIL | — | DEF-002 |
| AC-10 | TC-027 | e2e | tests/e2e/contact-form/TC-027-account-messages-row.spec.ts:8 | — | — | pass |  |
| AC-10 | TC-028 | api | tests/api/contact-form/TC-028-get-messages-lists-new-message.spec.ts:9 | — | FAIL | — | DEF-003 |
| AC-10 | TC-029 | a11y | tests/a11y/contact-form/TC-029-account-messages.spec.ts:12 | FAIL | — | — | DEF-004 |
| AC-11 | TC-030 | api | tests/api/contact-form/TC-030-send-response-body.spec.ts:13 | — | FAIL | — | DEF-002 |
| AC-12 | TC-031 | e2e | tests/e2e/contact-form/TC-031-attachment-hint.spec.ts:4 | — | — | pass |  |
| AC-12 | TC-032 | e2e | tests/e2e/contact-form/TC-032-signed-in-attachment-hint.spec.ts:9 | — | — | pass |  |

Cell values: pass · FAIL · flaky (passed on retry) · known (expected failure, linked defect) · skip · — (not run in that project)
<!-- prettier-ignore-end -->

<!-- generated:end -->

## Lessons and recommendations

- Fix or schedule open **major** DEF-001 (AC-6): the 49-character Message shows no minimum-length alert on blur, only after Send. Ask the PO to confirm the blur trigger, because AC-6 was inferred. While it is open, the alert state has no a11y scan (TC-019 is `test.fail()`).
- Resolve open **major** DEF-002 (AC-3, AC-9, AC-11): `POST /messages` returns the stored message, not `{ success }`. Decide whether the product or the contract is wrong. If it is the contract, mark `success` required or replace the schema, so that `toMatchContract` catches the gap and TC-009/026/030 don't need a separate check.
- Resolve open **minor** DEF-003 (AC-10): `GET /messages` returns `name`/`email` as `null` where the contract says `string`. Make them nullable in the contract or fill them on the server.
- Resolve open **minor** DEF-004 (AC-10): the "NEW" badge on `/account/messages` has 1.95:1 contrast (4.5:1 required). Remove its `KNOWN` entry from TC-029 once it is fixed.
- Re-run the known-defect splits (TC-009, TC-016, TC-019, TC-026, TC-028, TC-030) and TC-029's `KNOWN` filter, then rerun `stlc:trace`. The matrix still shows these as FAIL from the pre-triage run, not `known`, so the split tests and the `withoutKnown` filter are unverified.
- Run the e2e projects 02 plans that did not run (firefox, webkit, mobile-chrome, mobile-safari) before treating the feature as closed across browsers. TC-003 (collapsed mobile menu) has only chromium evidence so far.
- User decision needed: the triager's splits add one real send per api TC (TC-009, TC-026, TC-028, TC-030), which goes over 02's one-send-per-case budget on the shared target. Approve the extra sends, or restructure the splits so that one send serves both tests.
- Process deviations to avoid next time: run the signed-in Playwright planner in phase 3 (the signed-in TCs were designed from 01 and 02 alone), and use the Playwright generator in phase 5 rather than parallel stlc-author runs, so that the full pipeline gets exercised.
- Framework: 04/05 headers still name a stale `reports/results-visual.json` (03:49:16Z) from an earlier run, although no visual tests were in scope. Make trace and run-summary ignore result files older than the run, or files with no tests for the feature. The run fixed four framework bugs, each with a regression test: the planner now runs per seed, MCP sessions use `test-results-mcp/`, the closure check uses `git hash-object` so it sees untracked files, and ANSI codes are stripped from 04's error column. It also added the `signInAs` helper.
