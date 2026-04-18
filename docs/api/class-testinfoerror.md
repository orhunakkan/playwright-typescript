# 📦 Playwright — TestInfoError

> **Source:** [playwright.dev/docs/api/class-testinfoerror](https://playwright.dev/docs/api/class-testinfoerror)

---

**TestInfoError** contains information about an error thrown during test execution.

## Properties

### `testInfoError.cause` — Added in: v1.49

Error cause. Set when there is a cause for the error. Will be `undefined` if there is no cause or if the cause is not an instance of `Error`.

**Type:** `TestInfoError`

---

### `testInfoError.message` — Added in: v1.10

Error message. Set when `Error` (or its subclass) has been thrown.

**Type:** `string`

---

### `testInfoError.stack` — Added in: v1.10

Error stack. Set when `Error` (or its subclass) has been thrown.

**Type:** `string`

---

### `testInfoError.value` — Added in: v1.10

The value that was thrown. Set when anything except the `Error` (or its subclass) has been thrown.

**Type:** `string`
