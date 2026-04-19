# 📦 Playwright — TestError

> **Source:** [playwright.dev/docs/api/class-testerror](https://playwright.dev/docs/api/class-testerror)

---

**TestError** contains information about an error thrown during test execution.

## Properties

### `testError.cause` — Added in: v1.49

Error cause. Set when there is a cause for the error. Will be `undefined` if there is no cause or if the cause is not an instance of `Error`.

**Type:** `TestError`

### `testError.location` — Added in: v1.30

Error location in the source code.

**Type:** `Location`

### `testError.message` — Added in: v1.10

Error message. Set when `Error` (or its subclass) has been thrown.

**Type:** `string`

### `testError.snippet` — Added in: v1.33

Source code snippet with highlighted error.

**Type:** `string`

### `testError.stack` — Added in: v1.10

Error stack. Set when `Error` (or its subclass) has been thrown.

**Type:** `string`

### `testError.value` — Added in: v1.10

The value that was thrown. Set when anything except the `Error` (or its subclass) has been thrown.

**Type:** `string`
