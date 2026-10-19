---
feature: contact-form
phase: test-cases
status: approved # draft | approved | complete
updated: 2026-10-19
---

# Test cases: contact-form

<!--
Phase 3 (Playwright planner for UI, stlc-designer for the other types). Every AC × type marked in
02-test-plan.md needs at least one row. Titles start with positive:, negative: or boundary:.
Generated tests carry the tags @REQ-contact-form @AC-<n> @TC-<nnn> of their row.
-->

> **Deviation for this run (decided by the user):** the signed-in planner run was skipped, so there
> is no `ui-scenarios-signed-in.md`. The signed-in e2e cases (TC-020, TC-022, TC-024, TC-025,
> TC-027, TC-032) are designed from 01, whose ACs came from a phase-1 exploration of the live
> signed-in page, and from 02. Their seed is `tests/e2e/seed-signed-in.spec.ts`. The signed-in
> `POST /messages` body was not captured from the browser; TC-024 records it, and TC-026 must be
> checked against it.

| TC     | AC    | type | title                                                                                             | priority |
| ------ | ----- | ---- | ------------------------------------------------------------------------------------------------- | -------- |
| TC-001 | AC-1  | e2e  | positive: Contact in the main menu opens the contact page from the home page                      | medium   |
| TC-002 | AC-1  | e2e  | positive: Contact in the main menu opens the contact page from another page                       | medium   |
| TC-003 | AC-1  | e2e  | boundary: collapsed mobile menu is opened before Contact is reachable                             | medium   |
| TC-004 | AC-2  | e2e  | positive: signed-out form shows every contact field and the Send button                           | medium   |
| TC-005 | AC-2  | e2e  | positive: Subject offers exactly the six subjects and none is selected                            | medium   |
| TC-006 | AC-2  | a11y | positive: signed-out contact form as loaded                                                       | medium   |
| TC-007 | AC-3  | e2e  | positive: valid signed-out message is sent with one Send click and the thanks alert replaces form | high     |
| TC-008 | AC-3  | e2e  | boundary: signed-out message of exactly 50 characters is accepted and sent (response faked)       | high     |
| TC-009 | AC-3  | api  | positive: anonymous POST /messages with the UI's body returns 200 and matches the contract        | high     |
| TC-010 | AC-3  | a11y | positive: thanks alert after a signed-out send (response faked)                                   | high     |
| TC-011 | AC-4  | e2e  | negative: empty form shows a required alert under every field and sends nothing                   | high     |
| TC-012 | AC-4  | e2e  | negative: each single empty field shows only its own required alert and sends nothing             | high     |
| TC-013 | AC-4  | a11y | negative: signed-out form showing all five required alerts                                        | high     |
| TC-014 | AC-5  | e2e  | negative: invalid email shows the format alert, sends nothing, and the alert clears when fixed    | medium   |
| TC-015 | AC-5  | a11y | negative: signed-out form showing the email-format alert                                          | medium   |
| TC-016 | AC-6  | e2e  | boundary: 49-character message shows the minimum-length alert on blur                             | medium   |
| TC-017 | AC-6  | e2e  | boundary: 50-character message shows no message alert on blur                                     | medium   |
| TC-018 | AC-6  | e2e  | negative: 49-character message and Send shows the minimum-length alert and sends nothing          | medium   |
| TC-019 | AC-6  | a11y | negative: signed-out form showing the minimum-length alert                                        | medium   |
| TC-020 | AC-7  | e2e  | positive: signed-in form greets the user by name and hides the name and email fields              | medium   |
| TC-021 | AC-7  | a11y | positive: signed-in contact form as loaded                                                        | medium   |
| TC-022 | AC-8  | e2e  | negative: empty signed-in submit shows only the Subject and Message alerts and sends nothing      | medium   |
| TC-023 | AC-8  | a11y | negative: signed-in form showing the two required alerts                                          | medium   |
| TC-024 | AC-9  | e2e  | positive: valid signed-in message is sent with one Send click and the thanks alert replaces form  | high     |
| TC-025 | AC-9  | e2e  | boundary: signed-in message of exactly 50 characters is accepted and sent (response faked)        | high     |
| TC-026 | AC-9  | api  | positive: authenticated POST /messages returns 200 and matches the contract                       | high     |
| TC-027 | AC-10 | e2e  | positive: message sent through the API appears in the sender's account messages                   | medium   |
| TC-028 | AC-10 | api  | positive: GET /messages as the sender lists the new message                                       | medium   |
| TC-029 | AC-10 | a11y | positive: account messages page listing the user's message                                        | medium   |
| TC-030 | AC-11 | api  | positive: valid ContactRequest returns 200 with an AddContactMessageResponse body                 | high     |
| TC-031 | AC-12 | e2e  | positive: signed-out form states the attachment rules                                             | low      |
| TC-032 | AC-12 | e2e  | positive: signed-in form states the attachment rules                                              | low      |

## Shared data and techniques

- **Valid data (signed out):** First name "QA", Last name "Tester", Email
  "qa.tester@example.com", Subject "Webmaster" (value `webmaster`), Message
  "This is an automated test message from a QA test run. Please ignore it." (71 characters).
- **Length data:** 50 characters "Automated QA test message. Please ignore this one."; 49
  characters: the same text without the final ".".
- **Subject values** are slugs of the labels: `customer-service`, `webmaster`, `return`,
  `payments`, `warranty`, `status-of-order`. The select also has an empty placeholder option
  "Select a subject \*" (value `""`), selected by default; it is not one of AC-2's six subjects.
- **Locators** (verified in `ui-scenarios.md`): `first-name`, `last-name`, `email`, `subject`,
  `message`, `attachment`, `contact-submit` test ids (or their labels); alerts `first-name-error`,
  `last-name-error`, `email-error`, `subject-error`, `message-error`; the thanks alert is
  `role=alert` and has surrounding whitespace, so use `toContainText`.
- **"No `POST /messages` is sent"** (TC-011, TC-012, TC-014, TC-018, TC-022 and their a11y
  states): before clicking "Send", `page.route('**/messages', …)` records every `POST` and fulfils
  it with a fake 200 (any other method continues). This keeps a product bug from writing a real
  message on the shared target. Click "Send" once, wait for the expected alerts (web-first), then
  assert the recorded list is empty. Never wait on a timeout.
- **Faked send** (TC-008, TC-010, TC-025): `page.route('**/messages', …)` fulfils the `POST` with
  200 and the body shape the live API returned to the UI:
  `{"name":…,"subject":…,"message":…,"email":…,"status":"NEW","id":"01TESTFAKE","created_at":"2026-10-19 10:00:00"}`.
  The test asserts on the intercepted request, so the request still has to leave the form.
- **Real sends per run** (02 Risks: one per AC per project): TC-007 and TC-024 once per e2e
  project (5 each); TC-027 arranges one message through the API per e2e project (5); TC-009,
  TC-026, TC-028 and TC-030 once each in `api`; TC-029 once in `a11y`. Every other case sends
  nothing. All content is neutral and uses `@example.com` addresses.
- **Single click:** every send clicks "Send" exactly once, with no extra blur or second click (02
  Risks). A send that needs a second click is triaged, not worked around.
- **Console errors:** the signed-out page logs 401s for `GET /users/me`; no case fails on console
  errors (02 Out of scope).
- **a11y scans:** `scanWcag(page, testInfo)` filtered with `withoutKnown(…, KNOWN)` must equal
  `[]`, on Desktop Chrome. Real findings go into `KNOWN` with a DEF, per the known-defect pattern.

## TC-001

- **Preconditions:** signed out, seed `tests/e2e/seed.spec.ts`. No user.
- **Steps:**
  1. Go to `/`.
  2. If the "Toggle navigation" button is visible (collapsed menu), click it.
  3. Click "Contact" (`nav-contact`).
- **Expected results (AC-1):** URL ends with `/contact`; the page title contains "Contact Us"
  (not the exact "v5.0" text, per 02 design notes); a level-3 heading "Contact" is visible.
- **By type (e2e):** `ui-scenarios.md`, scenario 1.1 "positive: clicking Contact in the main menu
  opens the contact page". Runs on all five e2e projects.

## TC-002

- **Preconditions:** signed out, seed `tests/e2e/seed.spec.ts`. No user.
- **Steps:**
  1. Go to `/auth/login`.
  2. If the "Toggle navigation" button is visible, click it.
  3. Click "Contact" (`nav-contact`).
- **Expected results (AC-1, "Given any page"):** URL ends with `/contact`; title contains
  "Contact Us"; a level-3 heading "Contact" is visible.
- **By type (e2e):** `ui-scenarios.md`, scenario 1.2 "positive: Contact link works from a non-home
  page".

## TC-003

- **Preconditions:** signed out, seed `tests/e2e/seed.spec.ts`. No user.
- **Steps:**
  1. Go to `/`.
  2. When the "Toggle navigation" button is visible (mobile projects): assert `nav-contact` is
     hidden, click the toggler, then assert `nav-contact` is visible. Otherwise (desktop): assert
     `nav-contact` is visible without any toggling.
  3. Click "Contact".
- **Expected results (AC-1):** the Contact link is reachable in both layouts; URL ends with
  `/contact` and the level-3 heading "Contact" is visible. Branch on the toggler's visibility,
  never on the project name, and skip no project.
- **By type (e2e):** `ui-scenarios.md`, scenario 1.3 "boundary: main menu collapsed at mobile width
  needs the toggler (mobile only)".

## TC-004

- **Preconditions:** signed out, seed `tests/e2e/seed.spec.ts`. No user.
- **Steps:** go to `/contact`.
- **Expected results (AC-2):**
  - "First name", "Last name" and "Email address" inputs are visible, editable and empty.
  - The "Subject" select is visible.
  - The "Message \*" textarea is visible and empty.
  - The "Attachment" control (`attachment`) is present.
  - "Send" (`contact-submit`) is visible and enabled.
  - No field alert is shown on load.
- **By type (e2e):** `ui-scenarios.md`, scenario 2.1 "positive: signed-out form shows all fields
  and the Send button" (2.3's empty-value checks are folded into this case).

## TC-005

- **Preconditions:** signed out, seed `tests/e2e/seed.spec.ts`. No user.
- **Steps:** go to `/contact` and read the options of the Subject select.
- **Expected results (AC-2):**
  - The select's value is `""`: the placeholder "Select a subject \*" is shown and no subject is
    pre-selected.
  - The options with a non-empty value are exactly, in order: "Customer service", "Webmaster",
    "Return", "Payments", "Warranty", "Status of my order". The placeholder is excluded from this
    comparison; do not assert a total count of 6.
- **By type (e2e):** `ui-scenarios.md`, scenario 2.2 "positive: Subject offers exactly the six
  subjects and none is selected".

## TC-006

- **Preconditions:** signed out. No user.
- **Steps:** go to `/contact`; wait until `contact-submit` is visible; scan.
- **Expected results (AC-2):** no WCAG 2.2 AA violations beyond `KNOWN`.
- **By type (a11y):** state to scan: the signed-out contact form as loaded, nothing filled, no
  alerts.

## TC-007

- **Preconditions:** signed out, seed `tests/e2e/seed.spec.ts`. No user (anonymous send). Real
  send: one per e2e project.
- **Steps:**
  1. Go to `/contact`; fill the valid signed-out data (Subject "Webmaster").
  2. Start waiting for the `POST /messages` response, then click "Send" exactly once.
- **Expected results (AC-3):**
  - The `POST /messages` response status is 200.
  - Its request JSON body equals
    `{"name":"QA Tester","subject":"webmaster","message":"This is an automated test message from a QA test run. Please ignore it.","email":"qa.tester@example.com"}`.
  - An alert contains "Thanks for your message! We will contact you shortly."
  - The form is replaced: `contact-submit` and the name, email, subject and message fields are no
    longer visible. The level-3 heading "Contact" remains.
- **By type (e2e):** `ui-scenarios.md`, scenario 3.1 "positive: valid message is sent and the form
  is replaced by the thanks alert".

## TC-008

- **Preconditions:** signed out, seed `tests/e2e/seed.spec.ts`. No user. No real send: the
  `POST /messages` is fulfilled by `page.route` (faked send).
- **Steps:**
  1. Go to `/contact`; install the faked-send route.
  2. Fill the valid signed-out data, but with the 50-character message.
  3. Click "Send" once.
- **Expected results (AC-3, boundary of "at least 50 characters"):**
  - Exactly one `POST /messages` is intercepted, and its body's `message` is the 50-character
    text.
  - No message alert is shown, and an alert contains "Thanks for your message! We will contact
    you shortly."
- **By type (e2e):** `ui-scenarios.md`, scenario 3.2 "boundary: message of exactly 50 characters
  is accepted and sent", changed to fake the response, because a second real send per project
  would break 02's send budget.

## TC-009

- **Preconditions:** no UI. `api` fixture, no authentication (anonymous send). Real send: one.
- **Steps:** `POST /messages` with the body the UI sends (TC-007):
  `{"name":"QA Tester","subject":"webmaster","message":"This is an automated test message from a QA test run. Please ignore it.","email":"qa.tester@example.com"}`.
- **Expected results (AC-3, AC-11):**
  - Status 200.
  - `expect(response).toMatchContract('POST', '/messages')` passes.
  - The body has `success: true`, as 02 states.
- **By type (api):** `POST /messages` (path template `/messages`), expected 200, response matches
  the contract's `AddContactMessageResponse`. Note: the live response the UI saw had no `success`
  field: it echoed the message with `status`, `id` and `created_at`. If the `success` check fails,
  triage it as a contract mismatch; never drop the assertion.

## TC-010

- **Preconditions:** signed out. No user. No real send: faked send (02 Risks).
- **Steps:** go to `/contact`; install the faked-send route; fill the valid signed-out data;
  click "Send" once; wait for the thanks alert; scan.
- **Expected results (AC-3):** no WCAG 2.2 AA violations beyond `KNOWN`, with the alert "Thanks for
  your message! We will contact you shortly." visible.
- **By type (a11y):** state to scan: the success state of `/contact`, with the form replaced by
  the thanks alert.

## TC-011

- **Preconditions:** signed out, seed `tests/e2e/seed.spec.ts`. No user.
- **Steps:**
  1. Go to `/contact`; install the "no POST" recording route.
  2. Click "Send" once with the form empty.
- **Expected results (AC-4):**
  - Alerts are visible: "First name is required" (`first-name-error`), "Last name is required"
    (`last-name-error`), "Email is required" (`email-error`), "Subject is required"
    (`subject-error`) and "Message is required" (`message-error`), each in its own field's group.
  - Once they are visible, no `POST /messages` has been recorded.
  - The form is still shown, and there is no thanks alert.
- **By type (e2e):** `ui-scenarios.md`, scenario 4.1 "negative: empty form shows a required alert
  under every field and sends nothing".

## TC-012

- **Preconditions:** signed out, seed `tests/e2e/seed.spec.ts`. No user.
- **Steps:** parameterized over First name, Last name, Email address, Subject (left on the
  placeholder) and Message, one test per field, all tagged `@TC-012`. For each:
  1. Go to `/contact`; install the "no POST" recording route.
  2. Fill the other four fields with valid data; leave this one empty.
  3. Click "Send" once.
- **Expected results (AC-4):** only that field's "… is required" alert is visible, and the other
  four alerts are absent. No `POST /messages` is recorded after the alert is visible.
- **By type (e2e):** `ui-scenarios.md`, scenario 4.2 "negative: each single missing field shows
  only its own required alert".

## TC-013

- **Preconditions:** signed out. No user.
- **Steps:** go to `/contact`; install the "no POST" recording route; click "Send" on the empty
  form; wait until all five required alerts are visible; scan.
- **Expected results (AC-4):** no WCAG 2.2 AA violations beyond `KNOWN`.
- **By type (a11y):** state to scan: the signed-out form showing the five required-field alerts.

## TC-014

- **Preconditions:** signed out, seed `tests/e2e/seed.spec.ts`. No user.
- **Steps:**
  1. Go to `/contact`; install the "no POST" recording route.
  2. Fill First name "QA", Last name "Tester", Subject "Webmaster", the 71-character message, and
     Email "not-an-email". Click "Send" once.
  3. Change Email to "qa.tester@example.com". Do not click "Send" again.
- **Expected results (AC-5):**
  - After step 2, the alert "Email format is invalid" (`email-error`) is visible, and no other
    field alert is shown, so the email is the only blocker (02 design notes). No `POST /messages`
    is recorded, and there is no thanks alert.
  - After step 3, the email alert is no longer visible. It cleared on input in exploration; if the
    product clears it only on blur, blur the field, as a user moving on would.
- **By type (e2e):** `ui-scenarios.md`, scenario 5.1 "negative: invalid email shows the format
  alert and nothing is sent, then clears when fixed".

## TC-015

- **Preconditions:** signed out. No user.
- **Steps:** go to `/contact`; install the "no POST" recording route; fill the valid data with
  Email "not-an-email"; click "Send"; wait for "Email format is invalid"; scan.
- **Expected results (AC-5):** no WCAG 2.2 AA violations beyond `KNOWN`.
- **By type (a11y):** state to scan: the signed-out form showing the email-format alert.

## TC-016

- **Preconditions:** signed out, seed `tests/e2e/seed.spec.ts`. No user.
- **Steps:** go to `/contact`; fill Message with the 49-character text; move focus out of the field
  (blur).
- **Expected results (AC-6):** the alert "Message must be minimal 50 characters" (`message-error`)
  is visible.
- **By type (e2e):** `ui-scenarios.md`, scenario 6.1 "boundary: 49 characters on blur shows the
  minimum-length alert".

## TC-017

- **Preconditions:** signed out, seed `tests/e2e/seed.spec.ts`. No user.
- **Steps:** go to `/contact`; fill Message with the 50-character text; blur.
- **Expected results (AC-6):** `message-error` is not shown: neither "Message must be minimal 50
  characters" nor "Message is required".
- **By type (e2e):** `ui-scenarios.md`, scenario 6.2 "boundary: 50 characters on blur shows no
  message alert".

## TC-018

- **Preconditions:** signed out, seed `tests/e2e/seed.spec.ts`. No user.
- **Steps:**
  1. Go to `/contact`; install the "no POST" recording route.
  2. Fill First name, Last name, Email and Subject validly, and Message with the 49-character
     text (no blur).
  3. Click "Send" once.
- **Expected results (AC-6, the "Send is clicked" trigger):** "Message must be minimal 50
  characters" is visible; no other field shows an alert; no `POST /messages` is recorded after the
  alert is visible.
- **By type (e2e):** `ui-scenarios.md`, scenario 6.3 "negative: 49 characters and clicking Send
  shows the alert and sends nothing" (here with every other field valid, so the length rule is the
  only blocker).

## TC-019

- **Preconditions:** signed out. No user.
- **Steps:** go to `/contact`; fill Message with the 49-character text; blur; wait for "Message
  must be minimal 50 characters"; scan.
- **Expected results (AC-6):** no WCAG 2.2 AA violations beyond `KNOWN`.
- **By type (a11y):** state to scan: the signed-out form showing the message minimum-length alert.

## TC-020

- **Preconditions:** signed in, seed `tests/e2e/seed-signed-in.spec.ts`,
  `storageState: AUTH_FILE` (read-only).
- **Steps:** go to `/contact`.
- **Expected results (AC-7):**
  - The text "Hello Apf Tester, please fill out this form to submit your message." is shown
    (built from `TEST_USER_NAME`).
  - The First name, Last name and Email address fields are not shown.
  - Subject, "Message \*", Attachment and "Send" are visible.
- **By type (e2e):** scenario: none (signed-in planner run skipped; from 01).

## TC-021

- **Preconditions:** signed in, `storageState: AUTH_FILE`.
- **Steps:** go to `/contact`; wait for the greeting and `contact-submit`; scan.
- **Expected results (AC-7):** no WCAG 2.2 AA violations beyond `KNOWN`.
- **By type (a11y):** state to scan: the signed-in contact form as loaded.

## TC-022

- **Preconditions:** signed in, seed `tests/e2e/seed-signed-in.spec.ts`,
  `storageState: AUTH_FILE`.
- **Steps:**
  1. Go to `/contact`; install the "no POST" recording route.
  2. Click "Send" once with the form empty.
- **Expected results (AC-8):**
  - "Subject is required" and "Message is required" are visible.
  - No other alert is shown: the page shows exactly these two alerts, with no first-name,
    last-name or email alert.
  - No `POST /messages` is recorded after the alerts are visible.
- **By type (e2e):** scenario: none (signed-in planner run skipped; from 01).

## TC-023

- **Preconditions:** signed in, `storageState: AUTH_FILE`.
- **Steps:** go to `/contact`; install the "no POST" recording route; click "Send" on the empty
  form; wait for both required alerts; scan.
- **Expected results (AC-8):** no WCAG 2.2 AA violations beyond `KNOWN`.
- **By type (a11y):** state to scan: the signed-in form showing the Subject and Message required
  alerts.

## TC-024

- **Preconditions:** signed in, seed `tests/e2e/seed-signed-in.spec.ts`,
  `storageState: AUTH_FILE` (02 allows the shared run user, since nothing is read back). Real
  send: one per e2e project.
- **Steps:**
  1. Go to `/contact`; choose Subject "Customer service"; fill the 71-character message.
  2. Start waiting for the `POST /messages` response, then click "Send" exactly once.
- **Expected results (AC-9):**
  - The `POST /messages` response status is 200.
  - The request body's `subject` is `customer-service` and its `message` is the text entered.
    Attach the full request body to the report: it is the signed-in body that TC-026 must copy.
  - An alert contains "Thanks for your message! We will contact you shortly.", and the form is
    replaced (`contact-submit` no longer visible).
  - 01 recorded a first click being ignored signed in. Do not add a blur or a second click; if
    the single click sends nothing, the test fails and is triaged.
- **By type (e2e):** scenario: none (signed-in planner run skipped; from 01).

## TC-025

- **Preconditions:** signed in, seed `tests/e2e/seed-signed-in.spec.ts`,
  `storageState: AUTH_FILE`. No real send: faked send.
- **Steps:** go to `/contact`; install the faked-send route; choose Subject "Customer service";
  fill the 50-character message; click "Send" once.
- **Expected results (AC-9, boundary of "at least 50 characters"):** exactly one `POST /messages`
  is intercepted, and its body's `message` is the 50-character text; no message alert is shown;
  an alert contains "Thanks for your message! We will contact you shortly."
- **By type (e2e):** scenario: none (signed-in planner run skipped; from 01).

## TC-026

- **Preconditions:** no UI. `workerUser`, authenticated with
  `Authorization: Bearer <workerUser.token>`. Real send: one.
- **Steps:** `POST /messages` with the signed-in UI body. Until TC-024 has captured it, the
  expected shape is `{"subject":"customer-service","message":"This is an automated test message from a QA test run. Please ignore it."}`:
  the signed-in form has no name or email fields. The author must confirm this against TC-024's
  captured body and copy it exactly; fields are never invented from the schema (02).
- **Expected results (AC-9, AC-11):**
  - Status 200.
  - `expect(response).toMatchContract('POST', '/messages')` passes.
  - The body has `success: true`, with the same `success` caveat as TC-009.
- **By type (api):** `POST /messages`, expected 200, response matches `AddContactMessageResponse`.

## TC-027

- **Preconditions:** signed in as `workerUser` (02: AC-10 needs its own user), seed
  `tests/e2e/seed-signed-in.spec.ts` for the page structure. The page is signed in with the
  harness helper 02 calls for, which injects `workerUser`'s token. Adding that helper is a harness
  change: ask first. Real send: one per e2e project, through the API.
- **Steps:**
  1. Through `api` with `workerUser`'s bearer token, `POST /messages` with Subject
     `customer-service` and the message `QA <marker> automated test message for the account list. Please ignore.`,
     where `<marker>` is unique per test (for example `apf-` plus 8 hex characters), so it falls
     inside the first 50 characters. Expect status 200.
  2. Through `GET /messages` as the same user, find the new message's `id` by its `message`.
  3. Go to `/account/messages`.
- **Expected results (AC-10):** the row whose message contains the marker shows:
  - Subject "customer-service".
  - Message: the first 50 characters of the sent text followed by "...".
  - Status "NEW".
  - A send date-time matching `^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$`. Assert the format only,
    not the value.
  - A "Details" link whose href ends with `/account/messages/<id>`.
- **By type (e2e):** scenario: none (signed-in planner run skipped; from 01).

## TC-028

- **Preconditions:** no UI. `workerUser`, bearer token. Real send: one.
- **Steps:**
  1. `POST /messages` as `workerUser` with Subject `customer-service` and a message carrying a
     unique marker, as in TC-027. Expect status 200.
  2. `GET /messages` as `workerUser`.
- **Expected results (AC-10):**
  - The GET status is 200.
  - `expect(response).toMatchContract('GET', '/messages')` passes.
  - `data` contains exactly one entry whose `message` equals the sent text, with
    `subject: "customer-service"` and `status: "NEW"`, and a `created_at` matching
    `YYYY-MM-DD HH:MM:SS`.
- **By type (api):** `GET /messages` (path template `/messages`), expected 200, response matches
  the contract's `PaginatedContactMessageResponse`. The contract says a `user` "retrieves only
  related messages". 02 asked to verify this live during design, but that was not done (see the
  hand-back), so the case relies on the unique marker rather than on the list containing only
  this user's rows.

## TC-029

- **Preconditions:** signed in as `workerUser` through the same harness helper as TC-027. Real
  send: one, through the API.
- **Steps:** arrange one message through the API as in TC-027, step 1; go to `/account/messages`;
  wait until the row with the marker is visible; scan.
- **Expected results (AC-10):** no WCAG 2.2 AA violations beyond `KNOWN`.
- **By type (a11y):** state to scan: `/account/messages` listing at least one message, the
  user's own.

## TC-030

- **Preconditions:** no UI. `api` fixture, anonymous, so the body carries all four
  `ContactRequest` fields. Real send: one.
- **Steps:** `POST /messages` with a valid `ContactRequest` in the UI's signed-out shape:
  `{"name":"QA Tester","subject":"webmaster","message":"This is an automated test message from a QA test run. Please ignore it.","email":"qa.tester@example.com"}`.
- **Expected results (AC-11):**
  - Status 200.
  - The `Content-Type` is JSON.
  - `expect(response).toMatchContract('POST', '/messages')` passes.
  - `success` is a boolean and is `true`. The `AddContactMessageResponse` schema lists `success`
    but does not mark it required, so the contract matcher alone does not prove it is present;
    this assertion does. A missing `success` is triaged (contract or product), never removed.
- **By type (api):** `POST /messages` (operationId `sendMessage`), expected 200, response matches
  `AddContactMessageResponse`.

## TC-031

- **Preconditions:** signed out, seed `tests/e2e/seed.spec.ts`. No user.
- **Steps:** go to `/contact`.
- **Expected results (AC-12):** the "Attachment" label is visible, and the hint "Only files with
  the txt extension are allowed, and files must be 0kb." is visible next to the attachment control.
- **By type (e2e):** `ui-scenarios.md`, scenario 7.1 "positive: attachment hint states the txt
  and 0kb rules".

## TC-032

- **Preconditions:** signed in, seed `tests/e2e/seed-signed-in.spec.ts`,
  `storageState: AUTH_FILE`.
- **Steps:** go to `/contact`.
- **Expected results (AC-12, signed in):** the "Attachment" label is visible, and the hint "Only
  files with the txt extension are allowed, and files must be 0kb." is visible.
- **By type (e2e):** scenario: none (signed-in planner run skipped; from 01).
