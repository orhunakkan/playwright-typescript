---
feature: contact-form
phase: requirements
status: approved # draft | approved | complete
updated: 2026-10-18
source: inferred # provided | inferred (inferred = drafted by exploring the app; needs human confirmation)
---

# Requirements: contact-form

<!--
Phase 1 (stlc-analyst). One "### AC-<n>: <title>" heading per testable acceptance criterion, each
followed by a "risk: high | medium | low" line. IDs are stable once the plan is approved: never
renumber, only append. Replace every {{placeholder}} before setting status to approved.
-->

## User stories

- As a visitor who is not signed in, I want to send the shop a message with my name and email so
  that I can ask a question without creating an account.
- As a signed-in customer, I want to send a message without retyping my name and email so that I
  can contact the shop quickly and find my message later in my account.
- As the shop, I want incomplete or malformed messages rejected in the form so that every message
  I receive can be answered.

## Acceptance criteria

### AC-1: Contact page is reachable from the main navigation

risk: medium

Given any page, when the user clicks "Contact" in the main menu (`data-test="nav-contact"`), then
the URL is `/contact`, the page title is "Contact Us - Practice Software Testing - Toolshop - v5.0"
and a level-3 heading "Contact" is shown.

### AC-2: Signed-out form shows all contact fields

risk: medium

Given a signed-out user on `/contact`, then the form shows: "First name" (`first-name`), "Last
name" (`last-name`), "Email address" (`email`), a "Subject" select (`subject`) with exactly the
options "Customer service", "Webmaster", "Return", "Payments", "Warranty" and "Status of my order",
a "Message *" textarea (`message`), an "Attachment" control and a "Send" button
(`contact-submit`). No subject is pre-selected.

### AC-3: Signed-out user sends a valid message

risk: high

Given a signed-out user on `/contact`, when they fill First name, Last name, a valid Email
address, choose a Subject, enter a Message of at least 50 characters and click "Send", then a
`POST /messages` request returns 200 and the form is replaced by the alert "Thanks for your
message! We will contact you shortly."

### AC-4: Empty signed-out submit shows a required error per field and sends nothing

risk: high

Given a signed-out user on `/contact` with an empty form, when they click "Send", then the alerts
"First name is required", "Last name is required", "Email is required", "Subject is required" and
"Message is required" are shown under their fields, and no `POST /messages` request is sent.

### AC-5: Invalid email format is rejected

risk: medium

Given a signed-out user, when the Email address is "not-an-email" and they click "Send", then the
alert "Email format is invalid" is shown under the email field and no message is sent. When the
email is then changed to a valid address, the email alert disappears.

### AC-6: Message must be at least 50 characters

risk: medium

Given the contact form, when the Message has 49 characters and the field loses focus (or "Send" is
clicked), then the alert "Message must be minimal 50 characters" is shown; when the Message has
exactly 50 characters and the field loses focus, no message alert is shown.

### AC-7: Signed-in form greets the user and hides name and email

risk: medium

Given a signed-in user on `/contact`, then the text "Hello <first name> <last name>, please fill
out this form to submit your message." is shown, the First name, Last name and Email address
fields are not shown, and the Subject, Message, Attachment and "Send" controls are shown.

### AC-8: Empty signed-in submit only requires subject and message

risk: medium

Given a signed-in user on `/contact` with an empty form, when they click "Send", then only the
alerts "Subject is required" and "Message is required" are shown, and no `POST /messages` request
is sent.

### AC-9: Signed-in user sends a valid message

risk: high

Given a signed-in user on `/contact`, when they choose a Subject, enter a Message of at least 50
characters and click "Send", then a `POST /messages` request returns 200 and the form is replaced
by the alert "Thanks for your message! We will contact you shortly."

### AC-10: Signed-in user's message appears in their account messages

risk: medium

Given a signed-in user who has sent a message with subject "Customer service", when they open
`/account/messages`, then a row shows Subject "customer-service", the Message text (truncated to
its first 50 characters followed by "..."), Status "NEW", the send date-time
(`YYYY-MM-DD HH:MM:SS`) and a "Details" link to `/account/messages/<id>`.

### AC-11: Send-message API honours the contract

risk: high

`POST /messages` (operationId `sendMessage`) with a valid `ContactRequest` body (`name`, `email`,
`subject`, `message`; `subject` and `message` required) returns 200 with a JSON body matching the
contract's `AddContactMessageResponse` schema (`success: boolean`).

### AC-12: Attachment rules are stated on the form

risk: low

Given the contact form (signed in or out), then the Attachment control shows the hint "Only files
with the txt extension are allowed, and files must be 0kb."

## Ambiguities and questions

- **Message maximum length.** The contract sets `message.maxLength` to 250, but the UI accepted a
  251-character message with no error. The form was not submitted, so the server's behaviour is
  unknown. Should the UI enforce 250, and what should the user see?
- **First "Send" click ignored while focus is in Message (signed in).** After filling Message and
  clicking "Send" straight away, no `POST /messages` was sent and nothing was shown; a second click
  sent the message. Is this a defect, or a side effect of on-blur validation? It needs triage
  before any test depends on single-click submit.
- **Attachment behaviour was not explored.** The browser tooling could not upload files. What
  should happen for a non-`.txt` file or a non-empty file, and when is
  `POST /messages/{messageId}/attach-file` called? AC-12 covers only the hint text.
- **Contract and UI disagree on required fields.** In the contract `name` is optional and `email`
  is "Required when not authenticated". The signed-out UI requires both First name and Last name.
  How are they combined into `name` (maxLength 120)? Are the 120 (name/subject) and 256 (email)
  limits meant to be enforced in the UI?
- **Validation timing.** Errors appeared only after "Send" was clicked. After that, the email
  error updated as the user typed, but the message error updated only on blur. Is that intended?
- **Console errors when signed out.** The signed-out contact page logs 401 errors for
  `GET /users/me`. Are these expected?
- **Signed-out messages are not visible after sending.** There is no observable record beyond the
  confirmation alert. Is the confirmation the only expected outcome?

## Assumptions

- Requirements were inferred from the live app on 2026-10-18 (Toolshop v5.0, build 2026-10-11)
  and from `contracts/openapi.json`. They need product-owner confirmation.
- Signed-in tests use the per-run user (`AUTH_FILE`, or `workerUser` for tests that send
  messages). Seeded accounts are never used. Submissions use neutral test data such as "QA" /
  "Tester" and an `@example.com` address.
- The stored subject is the slug of the chosen option (for example "Customer service" becomes
  "customer-service"), as observed for one subject. The other subjects are assumed to follow the
  same pattern.
- Mobile layouts behave the same as desktop. Mobile was not explored.
- Account message listing beyond showing the new message (details page, replies, status changes)
  belongs to a separate feature.
