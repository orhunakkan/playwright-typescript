# 📦 Playwright — TestStep

> **Source:** [playwright.dev/docs/api/class-teststep](https://playwright.dev/docs/api/class-teststep)

---

## Overview

**TestStep** represents a step in the `TestRun`.

## Methods

### `testStep.titlePath()` — Added in: v1.10

Returns a list of titles from the root down to this step.

```ts
testStep.titlePath();
```

**Returns:** `Array<string>`

---

## Properties

### `testStep.annotations` — Added in: v1.51

The list of annotations applicable to the current step.

**Type:** `Array<Object>`

- `type` `string` — Annotation type, for example `'skip'` or `'fail'`.
- `description` `string` (optional) — Optional description.
- `location` `Location` (optional) — Optional location in the source where the annotation is added.

---

### `testStep.attachments` — Added in: v1.50

The list of files or buffers attached to the current step.

**Type:** `Array<Object>`

- `name` `string` — Attachment name.
- `contentType` `string` — Content type of this attachment to properly present in the report, for example `'application/json'` or `'image/png'`.
- `path` `string` (optional) — Optional path on the filesystem to the attached file.
- `body` `Buffer` (optional) — Optional attachment body used instead of a file.

---

### `testStep.category` — Added in: v1.10

Step category to differentiate steps with different origins and verbosity. Built-in categories are:

- `expect` for `expect()` calls.
- `fixture` for fixture setup/teardown.
- `hook` for `beforeAll`, `beforeEach`, `afterEach`, `afterAll` hooks.
- `pw:api` for Playwright API calls.
- `test.step` for `test.step()` calls.
- `test.attach` for `testInfo.attach()` calls.

**Type:** `string`

---

### `testStep.duration` — Added in: v1.10

Running time in milliseconds.

**Type:** `number`

---

### `testStep.error` — Added in: v1.10

Error thrown during the step execution, if any.

**Type:** `TestError`

---

### `testStep.location` — Added in: v1.10

Optional location in the source where the step is defined.

**Type:** `Location`

---

### `testStep.parent` — Added in: v1.10

Parent step, if any.

**Type:** `TestStep`

---

### `testStep.startTime` — Added in: v1.10

Start time of this particular test step.

**Type:** `Date`

---

### `testStep.steps` — Added in: v1.10

List of steps inside this step.

**Type:** `Array<TestStep>`

---

### `testStep.title` — Added in: v1.10

User-visible title of the step.

**Type:** `string`
