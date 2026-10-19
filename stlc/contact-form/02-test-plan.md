---
feature: contact-form
phase: test-plan
status: approved # draft | approved | complete. Only a human sets approved.
updated: 2026-10-18
---

# Test plan: contact-form

<!--
Phase 2 (stlc-strategist). Choose test types per AC from its risk: not every AC needs every type.
This file is the human gate: test design does not start until a person sets status: approved.
-->

## Scope

- The `/contact` page: reaching it from the main navigation (AC-1), the signed-out form (AC-2) and
  the signed-in form (AC-7), and the attachment hint text (AC-12).
- Sending a message signed out (AC-3) and signed in (AC-9), end to end in the browser and directly
  against `POST /messages`. The API requests repeat the body the UI actually sends.
- Client-side validation: required fields signed out (AC-4) and signed in (AC-8), email format
  (AC-5) and the 50-character message minimum at 49/50 characters (AC-6). Negative UI tests assert
  that no `POST /messages` request leaves the browser.
- A signed-in user's message showing in `/account/messages` (AC-10), checked in the UI and through
  `GET /messages`.
- `POST /messages` contract conformance for a valid send (AC-11).
- WCAG 2.2 AA scans of every form state a user meets: the signed-out form, its required-field
  errors, the email-format error, the message-length error, the success alert, the signed-in form,
  its required-field errors, and `/account/messages`.

## Out of scope

- **Server-side validation of `POST /messages`** (missing `subject` or `message`, `message` over
  250 characters, the `name`/`email` limits, and which status a rejected body gets). This is pending
  answers to 01's open questions on message maximum length and required fields. 01 states only the
  valid-send behaviour (AC-11), so writing negative or boundary API cases now would invent
  requirements. Add ACs once the product owner answers.
- **UI enforcement of the 250-character message maximum and the 120/256 name and email limits.**
  These are pending the same open questions: 01 records that the UI accepted 251 characters and the
  intended behaviour is unknown.
- **Attachment upload and `POST /messages/{messageId}/attach-file`.** Upload behaviour was never
  explored, and its rules (non-`.txt` files, non-empty files) are open questions in 01. Only the
  hint text (AC-12) is tested.
- **Message details, replies and status changes** (`/account/messages/<id>`,
  `POST /messages/{messageId}/reply`, `PUT /messages/{messageId}/status`). 01 assigns them to a
  separate feature. AC-10 checks only that the "Details" link points to the right URL.
- **Admin-side handling of received messages.** It needs an admin account, and the seeded admin is
  shared and must not be used.
- **The 401 console errors for `GET /users/me` on the signed-out page.** This is an open question
  in 01, not an AC. Tests must not fail on console errors until it is answered.
- **Performance.** `/contact` is a light page with a single form, not a core purchase journey, and
  no AC states a load-time requirement. The page-load budget suite stays on the home page and
  catalogue journeys.
- **Visual baselines.** No AC is about layout. The page has two auth variants plus validation
  states, so it would need several baselines, and each one needs human approval. AC-2 and AC-7
  already assert every control by role and label.

## Coverage

<!-- One row per AC in 01-requirements.md. Mark "x" for each test type that AC needs. -->

| AC    | e2e | api | a11y | perf | visual |
| ----- | --- | --- | ---- | ---- | ------ |
| AC-1  | x   |     |      |      |        |
| AC-2  | x   |     | x    |      |        |
| AC-3  | x   | x   | x    |      |        |
| AC-4  | x   |     | x    |      |        |
| AC-5  | x   |     | x    |      |        |
| AC-6  | x   |     | x    |      |        |
| AC-7  | x   |     | x    |      |        |
| AC-8  | x   |     | x    |      |        |
| AC-9  | x   | x   |      |      |        |
| AC-10 | x   | x   | x    |      |        |
| AC-11 |     | x   |      |      |        |
| AC-12 | x   |     |      |      |        |

Notes on the choices:

- **api on AC-3 and AC-9:** an anonymous `POST /messages` (AC-3) and an authenticated one (AC-9).
  Each returns 200, matches the contract (`toMatchContract('POST', '/messages')`) and returns
  `success: true`. The request body must copy the one the UI actually sends, which is captured
  from the browser during design. Fields are not invented from the schema.
- **api on AC-10:** `GET /messages` as the test's own user lists the new message. This separates a
  storage failure from a listing-page failure.
- **AC-11 is api only.** It covers contract conformance of a valid send. The UI send paths are
  covered by AC-3 and AC-9. Rejection cases are out of scope (see above).
- **a11y:** one scan per distinct UI state, as listed in Scope. Nobody has verified that the error
  states share markup (signed-in errors render without the name/email fields), so each one is
  scanned.

## Environments

- Target: `ENV` unset (default `.env`). The pilot values are
  `BASE_URL=https://practicesoftwaretesting.com` and `API_URL=https://api.practicesoftwaretesting.com`.
  Optionally, run with `ENV=with-bugs` (`https://with-bugs.practicesoftwaretesting.com` and
  `https://api-with-bugs.practicesoftwaretesting.com`) to confirm the tests catch planted defects.
  That run is not an exit requirement.
- Projects: `setup` runs first (per-run user and `AUTH_FILE`). Then e2e runs on `chromium`,
  `firefox`, `webkit`, `mobile-chrome` and `mobile-safari`, and `api` and `a11y` (Desktop Chrome)
  run alongside. `perf` and `visual` are not run for this feature.

## Risks

- **Shared public target: every send writes real data.** Every passing AC-3, AC-9, AC-10 and
  AC-11 test creates a message on a public site. The e2e sends happen once per browser project, so
  5 times. `retries: 1` in `playwright.config.ts` can double a real send when a test fails after
  submitting. Mitigation:
  - Keep happy-path sends to one per AC per project.
  - Use neutral content: "QA" / "Tester", an `@example.com` address, and a message that says it
    is an automated test.
  - The AC-3 a11y scan of the success alert fakes the `POST /messages` response in the browser
    (`page.route`) instead of sending a real message.
  - The AC-10 message is created through the API, once per test.
  - Negative UI tests send nothing by design.
- **Rate limiting or bot protection on the API.** A burst of `POST /messages` from 5 parallel
  projects may get 429 responses or a challenge. Mitigation:
  - Keep sends to the minimum above.
  - Run `npm run env:check` before execution.
  - Triage a 429 or challenge as `env`, never as a product defect.
  - Never retry in a loop to get past it.
- **Users and sessions.** Seeded accounts are never used, because other traffic locks them.
  - Read-only signed-in UI tests (AC-7, AC-8, AC-12 signed in, and their a11y scans) use
    `AUTH_FILE`.
  - AC-10 needs its own user, because it reads back that user's messages. The `workerUser`
    fixture provides only an API token, not a browser session. The build therefore needs a small
    harness helper that signs a page in as a given user, for example by injecting `workerUser`'s
    token. Adding it is a harness change: ask first.
  - AC-9 e2e does not read anything back, so it may use the shared run user (`AUTH_FILE`) instead.
  - API tests authenticate with `workerUser`'s token.
- **First "Send" click may be ignored (01 ambiguity).** 01 observed this signed in, but it may also
  affect signed-out AC-3, because both forms validate the message on blur. AC-3 and AC-9 e2e must
  click "Send" once, as a user would, and must not add a blur or a second click to make the test
  pass. If a test fails that way, the triager decides whether it is a product defect (DEF plus the
  known-defect pattern) or a test issue. The AC-3 and AC-9 api tests still verify the endpoint
  independently.
- **Mobile was not explored.** Mitigation: run e2e on both mobile projects anyway, and model what a
  mobile user does (in AC-1, open the main menu first when it is collapsed). Differences found are
  triaged, never skipped.
- **Design notes** (for the designer to turn into test cases):
  - **AC-1:** assert the URL, the heading and that the title contains "Contact Us". Do not assert
    the exact "v5.0" title text, which differs between targets and releases.
  - **AC-5:** fill every other field validly, so the email rule is the only thing blocking the
    send. Then also cover the second clause: the email alert disappears once the address is valid.
  - **AC-6:** cover both triggers that 01 names: blur (49 characters shows the alert, 50 does not)
    and clicking "Send" with 49 characters.
  - **"No `POST /messages` is sent" (AC-4, AC-5, AC-6, AC-8):** attach a request listener before
    clicking "Send", wait for the alerts to be visible (validation is client-side and synchronous),
    then assert the listener saw no `POST /messages`. Never wait on a timeout.
  - **AC-10:**
    - Create the message through the API as the test's own user, not by sending it through the
      UI.
    - The message must be longer than 50 characters, so the truncation to 50 plus "..." is
      observable.
    - Put a unique marker inside the first 50 characters, so the row can be found among other
      rows.
    - Assert only the date-time format `YYYY-MM-DD HH:MM:SS`, not its value.
    - Before relying on `GET /messages`, verify in design that it returns only the calling user's
      messages.

## Exit criteria

<!-- Keys: ac-coverage-min (%), open-critical-max (count), flaky-rate-max (%). Defaults shown. -->

- ac-coverage-min: 100%
- open-critical-max: 0
- flaky-rate-max: 2%
