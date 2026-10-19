# Contact form UI test plan (signed out)

## Application Overview

UI scenarios for the Toolshop /contact page, signed out, for AC-1, AC-2, AC-3, AC-4, AC-5, AC-6 and AC-12. Explored live on chromium with seed tests/e2e/seed.spec.ts. All tests are signed out (no storageState, no sign-in, no seeded accounts). Tags per test: @REQ-contact-form, @AC-n, @TC-nnn. describe blocks per AC; titles start with positive:/negative:/boundary:.

## Exploration findings (verified live)

Locators on /contact (all exist as data-test; label/role equivalents verified):

- First name: getByTestId('first-name') / getByLabel('First name'); placeholder "Your first name *"
- Last name: getByTestId('last-name') / getByLabel('Last name')
- Email address: getByTestId('email') / getByLabel('Email address')
- Subject: getByTestId('subject') / getByLabel('Subject') (select; selectOption({label:'Webmaster'}) or value 'webmaster')
- Message: getByTestId('message') / getByLabel('Message *') (textarea)
- Attachment: input type=file, data-test="attachment", id=attachment, accept=".txt"; role name "Attachment" is a button in the a11y tree: getByTestId('attachment') or getByRole('button',{name:'Attachment'}) (prefer test id)
- Attachment hint: text "Only files with the txt extension are allowed, and files must be 0kb." ("txt" in a strong element); use getByText(/Only files with the txt extension are allowed, and files must be 0kb\./) or a locator scoped to the attachment group
- Send: getByTestId('contact-submit') (an input element; accessible role button named "Send": getByRole('button',{name:'Send'}))
- Field alerts: getByRole('alert') works (class "alert alert-danger"); test ids: first-name-error, last-name-error, email-error, subject-error, message-error (ids first_name_alert, last_name_alert, email_alert, subject_alert, message_alert). Success alert is "alert alert-success", also role alert, text has surrounding whitespace so use toContainText / getByText not exact whitespace.
- Main menu: getByTestId('nav-contact'), menubar "Main menu", link "Contact". Heading: getByRole('heading',{level:3,name:'Contact'}).
- Page title on /contact: "Contact Us - Practice Software Testing - Toolshop - v5.0" (assert toHaveTitle(/Contact Us/) only).

Observations:

1. Subject select has a 7th, empty placeholder option "Select a subject *" (value ""), selected by default. The six real options are exactly Customer service, Webmaster, Return, Payments, Warranty, Status of my order (values customer-service, webmaster, return, payments, warranty, status-of-order). AC-2 "exactly six options / no subject pre-selected" must be asserted as: the six real options, in order, after the placeholder; select value is "" initially. Do not assert option count equals 6 without excluding the placeholder; flag to the human that AC-2 wording omits the placeholder.
2. Mobile: at 390px width the main menu is collapsed; nav-contact is hidden (isVisible false). Toggle button: getByRole('button',{name:'Toggle navigation'}) (class navbar-toggler, aria-expanded false). Clicking it makes nav-contact visible. In AC-1 open the menu first only when the toggler is visible (isMobile / toggler visible), e.g. check toggler visibility, not project name.
3. Empty submit with one click showed all five required alerts at once, order First name, Last name, Email, Subject, Message; no POST /messages seen.
4. Invalid email "not-an-email" with other fields valid: single click showed "Email format is invalid" and no POST. Changing email to a valid address removed the email alert immediately (on input, no blur needed in this run).
5. Message length: 49 chars + blur showed "Message must be minimal 50 characters"; 50 chars + blur showed no alert. The alert reappeared when changed back to 49 and blurred. Clicking Send with 49 chars (other fields invalid email in the run) also showed the message alert, no POST.
6. Single click on Send in the valid case was NOT ignored: one click sent exactly one POST and showed the success alert. No blur or second click was needed. Nothing to record as a defect.
7. Console shows 401 errors for GET /users/me when signed out; this is expected noise, do not fail tests on console errors.
8. Success state: form is replaced (contact-submit no longer visible), the h3 "Contact" remains, the alert reads "Thanks for your message! We will contact you shortly."

Valid send performed once during exploration (neutral data) to capture the contract. POST https://api.practicesoftwaretesting.com/messages, content-type application/json, status 200.
Exact request JSON body:
{"name":"QA Tester","subject":"webmaster","message":"This is an automated test message from a QA test run. Please ignore it.","email":"qa.tester@example.com"}
Note: first and last name are merged into a single "name" field "First Last"; subject is the option value, not the label.
Response 200 body (reuse for API contract): {"name":"QA Tester","subject":"webmaster","message":"...","email":"qa.tester@example.com","status":"NEW","id":"<ulid>","created_at":"YYYY-MM-DD HH:mm:ss"}

Common technique for "no POST /messages":

- Before clicking Send: const posts: string[] = []; page.on('request', r => { if (r.method() === 'POST' && r.url().endsWith('/messages')) posts.push(r.url()); });
- Click Send once, await expect of the expected alert(s) (web-first), then expect(posts).toHaveLength(0). No waitForTimeout, no networkidle.

Valid-data constants for specs: first "QA", last "Tester", email "qa.tester@example.com", subject "Webmaster", message "This is an automated test message from a QA test run. Please ignore it." (70 chars). 49/50-char messages: 'x'.repeat(49) / 'x'.repeat(50) (or realistic text built to length).

Mobile: for every spec, if the main menu toggler is visible, open it before using nav-contact; other tests navigate directly with page.goto('/contact') (baseURL) so they are unaffected.

## Test Scenarios

### 1. AC-1 Contact page reachable from main navigation

**Seed:** `tests/e2e/seed.spec.ts`

#### 1.1. positive: clicking Contact in the main menu opens the contact page

**File:** `tests/e2e/contact-form/nav-to-contact.spec.ts`

**Steps:**

1. Go to / (home page). If the Toggle navigation button is visible (mobile width), click it first. - expect: nav-contact link is visible
2. Click getByTestId('nav-contact') - expect: URL matches /contact$/ - expect: Page title contains "Contact Us" (regex, not exact v5.0) - expect: Heading level 3 named "Contact" is visible

#### 1.2. positive: Contact link works from a non-home page

**File:** `tests/e2e/contact-form/nav-from-other-page.spec.ts`

**Steps:**

1. Go to /auth/login (a public page other than home); open the menu first if collapsed; click nav-contact - expect: URL is /contact - expect: Heading level 3 "Contact" visible - expect: Title contains "Contact Us"

#### 1.3. boundary: main menu collapsed at mobile width needs the toggler (mobile only)

**File:** `tests/e2e/contact-form/nav-menu-collapsed.spec.ts`

**Steps:**

1. Go to /. If the Toggle navigation button is visible, assert nav-contact is hidden, click the toggler - expect: nav-contact hidden before toggling and visible after (only asserted when toggler is visible; desktop just asserts nav-contact visible)

### 2. AC-2 Signed-out form shows all contact fields

**Seed:** `tests/e2e/seed.spec.ts`

#### 2.1. positive: signed-out form shows all fields and the Send button

**File:** `tests/e2e/contact-form/form-fields.spec.ts`

**Steps:**

1. Go to /contact signed out - expect: First name, Last name, Email address fields visible, editable and empty (by test id and label) - expect: Message * textarea visible and empty - expect: Attachment input (data-test attachment) present - expect: Send button (contact-submit) visible and enabled - expect: No field alerts are shown on load

#### 2.2. positive: Subject offers exactly the six subjects and none is selected

**File:** `tests/e2e/contact-form/subject-options.spec.ts`

**Steps:**

1. Go to /contact; read the options of getByTestId('subject') - expect: Select value is "" (placeholder "Select a subject *" shown, no real subject selected) - expect: Real options in order: Customer service, Webmaster, Return, Payments, Warranty, Status of my order (exclude the empty placeholder when asserting; total DOM options is 7)

#### 2.3. negative: no name or email fields are prefilled for a signed-out user

**File:** `tests/e2e/contact-form/fields-not-prefilled.spec.ts`

**Steps:**

1. Go to /contact signed out - expect: First name, Last name, Email address inputs all have value "" - expect: Subject value is ""

### 3. AC-3 Signed-out user sends a valid message

**Seed:** `tests/e2e/seed.spec.ts`

#### 3.1. positive: valid message is sent and the form is replaced by the thanks alert

**File:** `tests/e2e/contact-form/send-valid-message.spec.ts`

**Steps:**

1. Go to /contact. Fill First name "QA", Last name "Tester", Email "qa.tester@example.com", select Subject "Webmaster", fill Message with the 70-char automated-test text - expect: No field alerts present
2. Start page.waitForResponse for POST */messages, then click Send exactly once (no blur, no second click) - expect: Response status is 200 - expect: Request JSON body equals {name:"QA Tester",subject:"webmaster",message:<text>,email:"qa.tester@example.com"} - expect: Alert contains "Thanks for your message! We will contact you shortly." - expect: contact-submit and the form fields are no longer visible - expect: Heading "Contact" still visible

#### 3.2. boundary: message of exactly 50 characters is accepted and sent

**File:** `tests/e2e/contact-form/send-message-50-chars.spec.ts`

**Steps:**

1. Fill all fields validly with a Message of exactly 50 characters; click Send once - expect: POST /messages returns 200 - expect: Thanks alert shown

#### 3.3. negative: valid send writes real data, so run at most once per test run (guardrail)

**File:** `tests/e2e/contact-form/send-valid-message.spec.ts`

**Steps:**

1. Note for authors: only the two tests above send a valid message; every other scenario must assert no POST /messages is sent - expect: Total valid sends per run is 2 at most, with neutral data and an @example.com address

### 4. AC-4 Empty submit shows required errors and sends nothing

**Seed:** `tests/e2e/seed.spec.ts`

#### 4.1. negative: empty form shows a required alert under every field and sends nothing

**File:** `tests/e2e/contact-form/empty-submit.spec.ts`

**Steps:**

1. Go to /contact; register page.on('request') collecting POST requests to /messages; click Send once with an empty form - expect: Alerts visible: "First name is required", "Last name is required", "Email is required", "Subject is required", "Message is required" (via first-name-error, last-name-error, email-error, subject-error, message-error test ids) - expect: Each alert is within its own field group - expect: getByRole('alert') count is 5 - expect: After the alerts are shown, collected POST /messages list is empty - expect: Form remains visible; no thanks alert

#### 4.2. negative: each single missing field shows only its own required alert

**File:** `tests/e2e/contact-form/single-missing-field.spec.ts`

**Steps:**

1. For each field in turn (first name, last name, email, subject, message): fill the other four validly, click Send, with the request listener registered - expect: Only that field's required alert shown (other four alerts absent) - expect: No POST /messages seen after the alert is shown (parameterize; never reach a valid state)

#### 4.3. boundary: whitespace-only values are treated as empty (observe)

**File:** `tests/e2e/contact-form/whitespace-only.spec.ts`

**Steps:**

1. Fill First name with spaces and leave the rest empty; click Send with listener - expect: Record the observed behavior; assert only that no POST /messages is sent. If whitespace is accepted as valid by the form, mark as a candidate defect for triage rather than weakening the assertion

#### 4.4. positive: required alerts clear when the fields are filled

**File:** `tests/e2e/contact-form/required-alerts-clear.spec.ts`

**Steps:**

1. Click Send on an empty form, then fill First name - expect: "First name is required" disappears while the other four remain

### 5. AC-5 Invalid email format is rejected

**Seed:** `tests/e2e/seed.spec.ts`

#### 5.1. negative: invalid email shows the format alert and nothing is sent, then clears when fixed

**File:** `tests/e2e/contact-form/invalid-email.spec.ts`

**Steps:**

1. Go to /contact; register request listener. Fill First name "QA", Last name "Tester", Subject "Webmaster", a valid 50+ char Message, and Email "not-an-email"; click Send once - expect: Alert "Email format is invalid" visible (email-error) - expect: No other alerts shown (email is the only blocker) - expect: After the alert, no POST /messages collected - expect: No thanks alert
2. Fill Email with "qa.tester@example.com" (do NOT click Send, to avoid a real send) - expect: Email alert is no longer visible (it cleared on input in exploration; if only on blur, blur the field)

#### 5.2. negative: several malformed emails are rejected (parameterized)

**File:** `tests/e2e/contact-form/invalid-email-variants.spec.ts`

**Steps:**

1. For each of "plainaddress", "missing@domain", "@no-local.com", "two@@example.com", "spaces in@example.com": fill the other fields validly, set the email, click Send with listener - expect: "Email format is invalid" shown for each (record any variant that is accepted, e.g. missing@domain, as an observation for triage; if accepted the test must not end up sending a real message, so do not include variants whose acceptance would trigger a send; limit to variants verified rejected) - expect: No POST /messages

#### 5.3. boundary: empty email shows required, not the format alert

**File:** `tests/e2e/contact-form/email-empty-vs-invalid.spec.ts`

**Steps:**

1. Fill every field validly except Email left empty; click Send with listener - expect: "Email is required" shown and "Email format is invalid" not shown - expect: No POST /messages

### 6. AC-6 Message must be at least 50 characters

**Seed:** `tests/e2e/seed.spec.ts`

#### 6.1. boundary: 49 characters on blur shows the minimum-length alert

**File:** `tests/e2e/contact-form/message-49-blur.spec.ts`

**Steps:**

1. Go to /contact; click into Message and fill 49 characters; move focus away (blur, e.g. getByTestId('message').blur()) - expect: Alert "Message must be minimal 50 characters" visible (message-error)

#### 6.2. boundary: 50 characters on blur shows no message alert

**File:** `tests/e2e/contact-form/message-50-blur.spec.ts`

**Steps:**

1. Fill Message with exactly 50 characters then blur - expect: No message-error alert present - expect: No 'Message is required' alert either

#### 6.3. negative: 49 characters and clicking Send shows the alert and sends nothing

**File:** `tests/e2e/contact-form/message-49-send.spec.ts`

**Steps:**

1. Register request listener. Fill First name, Last name, Email validly, choose Subject, fill Message with 49 characters (no blur); click Send once - expect: Alert "Message must be minimal 50 characters" visible - expect: Other fields show no alerts - expect: No POST /messages collected after the alert appears

#### 6.4. boundary: fixing 49 to 50 characters clears the alert

**File:** `tests/e2e/contact-form/message-49-to-50.spec.ts`

**Steps:**

1. Fill 49 chars, blur, see alert; then fill 50 chars and blur - expect: Alert disappears after the 50th character (observed: clears on blur/input)

#### 6.5. negative: empty message shows required (not minimum length)

**File:** `tests/e2e/contact-form/message-empty-vs-short.spec.ts`

**Steps:**

1. Focus Message and blur with no input - expect: "Message is required" shown, "Message must be minimal 50 characters" not shown

#### 6.6. boundary: 51 characters is accepted (no alert) and 1 character shows the alert

**File:** `tests/e2e/contact-form/message-1-and-51.spec.ts`

**Steps:**

1. Fill 1 char, blur; then fill 51 chars, blur - expect: Min-length alert shown for 1 char; not shown for 51 chars

### 7. AC-12 Attachment rules are stated on the form

**Seed:** `tests/e2e/seed.spec.ts`

#### 7.1. positive: attachment hint states the txt and 0kb rules

**File:** `tests/e2e/contact-form/attachment-hint.spec.ts`

**Steps:**

1. Go to /contact signed out and locate the Attachment group - expect: Label "Attachment" visible - expect: Text "Only files with the txt extension are allowed, and files must be 0kb." visible - expect: "txt" is emphasized (strong element)

#### 7.2. positive: attachment control accepts only .txt files by attribute

**File:** `tests/e2e/contact-form/attachment-accept.spec.ts`

**Steps:**

1. Inspect getByTestId('attachment') - expect: type=file with accept=".txt" attribute - expect: Hint is visible without any interaction and remains visible after choosing a file or an alert appearing

#### 7.3. negative: hint is present even when the form has validation errors

**File:** `tests/e2e/contact-form/attachment-hint-after-errors.spec.ts`

**Steps:**

1. Click Send on empty form (with request listener) and wait for the alerts - expect: Attachment hint still visible and unchanged - expect: No attachment alert appears (attachment is optional) - expect: No POST /messages
