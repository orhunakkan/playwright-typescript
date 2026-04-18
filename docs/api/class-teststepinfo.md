# 📦 Playwright — TestStepInfo

> **Source:** [playwright.dev/docs/api/class-teststepinfo](https://playwright.dev/docs/api/class-teststepinfo)

---

## Overview

**TestStepInfo** contains information about the currently running test step. It is passed as an argument to the step function. **TestStepInfo** provides utilities to control test step execution.

## Methods

### `testStepInfo.attach()` — Added in: v1.51

Attach a value or a file from disk to the current test step. Some reporters show step attachments. Must be called during the step execution (can be async).

```ts
testStepInfo.attach(name);
testStepInfo.attach(name, options);
```

**Arguments:**

- `name` `string` — Attachment name. The name will also be sanitized and used as the prefix of file name when saving to disk.
- `options` `Object` (optional)
  - `body` `string | Buffer` (optional) — Attachment body. Mutually exclusive with `path`.
  - `contentType` `string` (optional) — Content type of this attachment to properly present in the report, for example `'application/json'` or `'image/png'`. If omitted, content type is inferred based on the `path`, or defaults to `text/plain` for string attachments and `application/octet-stream` for Buffer attachments.
  - `path` `string` (optional) — Path on the filesystem to the attached file. Mutually exclusive with `body`.

**Returns:** `Promise<void>`

> **Note:** `testStepInfo.attach()` works the same way as `testInfo.attach()`.

---

### `testStepInfo.skip()` — Added in: v1.51

Unconditionally skip the currently running step. Step is immediately aborted.

```ts
testStepInfo.skip();
```

---

### `testStepInfo.skip(condition)` — Added in: v1.51

Conditionally skip the currently running step with an optional description.

```ts
testStepInfo.skip(condition);
testStepInfo.skip(condition, description);
```

**Arguments:**

- `condition` `boolean` — A skip condition. Step is skipped when the condition is `true`.
- `description` `string` (optional) — Optional description that will be reflected in a test report.

---

## Properties

### `testStepInfo.titlePath` — Added in: v1.55

Returns a list of titles from the root down to this step.

**Type:** `Array<string>`
