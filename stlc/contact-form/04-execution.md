---
feature: contact-form
phase: execution
status: complete # draft | approved | complete. complete = every failure is triaged.
updated: 2026-10-19
---

# Execution: contact-form

## Run

<!-- generated:start -->

<!-- prettier-ignore-start -->
Results: `reports/results.json` (2026-10-19T05:41:22.902Z), `reports/results-visual.json` (2026-10-19T03:49:16.725Z) · env `default https://practicesoftwaretesting.com` · 30.1 s

| project | passed | failed | flaky | skipped | known defect |
| ------- | ------ | ------ | ----- | ------- | ------------ |
| a11y | 6 | 2 | 0 | 0 | 0 |
| api | 0 | 4 | 0 | 0 | 0 |
| chromium | 23 | 1 | 0 | 0 | 0 |

### Needs triage

| test | project | status | TC | AC | error |
| --- | --- | --- | --- | --- | --- |
| tests/a11y/contact-form/TC-019-min-length-alert.spec.ts:13 | a11y | failed | TC-019 | AC-6 | Error: expect(locator).toContainText(expected) failed |
| tests/a11y/contact-form/TC-029-account-messages.spec.ts:12 | a11y | failed | TC-029 | AC-10 | Error: expect(received).toEqual(expected) // deep equality |
| tests/api/contact-form/TC-009-anonymous-send-ui-body.spec.ts:13 | api | failed | TC-009 | AC-3 | Error: expect(received).toHaveProperty(path, value) |
| tests/api/contact-form/TC-026-authenticated-send.spec.ts:14 | api | failed | TC-026 | AC-9 | Error: expect(received).toHaveProperty(path, value) |
| tests/api/contact-form/TC-028-get-messages-lists-new-message.spec.ts:9 | api | failed | TC-028 | AC-10 | Error: expect(received).toMatchContract(expected) |
| tests/api/contact-form/TC-030-send-response-body.spec.ts:13 | api | failed | TC-030 | AC-11 | Error: expect(received).toBe(expected) // Object.is equality |
| tests/e2e/contact-form/TC-016-message-49-blur.spec.ts:6 | chromium | failed | TC-016 | AC-6 | Error: expect(locator).toContainText(expected) failed |
<!-- prettier-ignore-end -->

<!-- generated:end -->

## Triage

<!--
Phases 6-7 (stlc-triager). One row per failed or flaky test listed in the run block.
verdict: product | test | environment | flaky. product and flaky need a DEF id (npm run stlc:defect).
test = the "file:line" from the run block.
-->

| test                                                                   | verdict | DEF     | note                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------------------------------------------------- | ------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| tests/a11y/contact-form/TC-019-min-length-alert.spec.ts:13             | product | DEF-001 | Same root cause as TC-016: after fill and Tab, the textarea is `ng-invalid ng-touched ng-dirty` but no `message-error` renders, so the state to scan is never reached. Marked `test.fail()` with DEF-001. While it is open, the minimum-length alert state has no a11y scan.                                                            |
| tests/a11y/contact-form/TC-029-account-messages.spec.ts:12             | product | DEF-004 | axe `color-contrast` (serious) on `.badge` "NEW": #fff on #0dcaf0 is 1.95:1, and 4.5:1 is required. The pair was added to `KNOWN` with DEF-004 and an `issue` annotation. Nothing else was found.                                                                                                                                       |
| tests/api/contact-form/TC-009-anonymous-send-ui-body.spec.ts:13        | product | DEF-002 | 200 and `toMatchContract` pass. The body is the stored message (id, status NEW, created_at), with no `success`. Split: 200 + contract stays a normal test; the `success: true` check is a `test.fail()` test with DEF-002.                                                                                                              |
| tests/api/contact-form/TC-026-authenticated-send.spec.ts:14            | product | DEF-002 | Same as TC-009, signed in: the body also carries `user_id`, still no `success`. Split the same way.                                                                                                                                                                                                                                     |
| tests/api/contact-form/TC-028-get-messages-lists-new-message.spec.ts:9 | product | DEF-003 | The GET item has `name: null, email: null` for a message sent without them, but the contract says `string`. The listing itself (subject, NEW, created_at) is correct. Split: the listing checks stay a normal test; `toMatchContract('GET', '/messages')` is a `test.fail()` test with DEF-003.                                         |
| tests/api/contact-form/TC-030-send-response-body.spec.ts:13            | product | DEF-002 | `typeof success` is `undefined`; 200, JSON content type and the contract check pass. Split: those three stay a normal test; the `success` boolean/true checks are a `test.fail()` test with DEF-002.                                                                                                                                    |
| tests/e2e/contact-form/TC-016-message-49-blur.spec.ts:6                | product | DEF-001 | 49 characters plus Tab: the control is `ng-invalid ng-touched ng-dirty` (trace DOM snapshot), but `message-error` never renders. It renders only after Send (TC-018 passes). Same on retry. The test checks only this behaviour, so it is marked `test.fail()` with DEF-001. AC-6 was inferred: the PO should confirm the blur trigger. |
