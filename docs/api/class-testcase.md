# 📦 Playwright — TestCase

> **Source:** [playwright.dev/docs/api/class-testcase](https://playwright.dev/docs/api/class-testcase)

---

## Overview

**TestCase** corresponds to every `test()` call in a test file. When a single `test()` is running in multiple projects or repeated multiple times, it will have multiple **TestCase** objects in corresponding projects' suites.

## Methods

### `testCase.ok()` — Added in: v1.10

Whether the test is considered running fine. Non-ok tests fail the test run with a non-zero exit code.

```ts
testCase.ok();
```

**Returns:** `boolean`

---

### `testCase.outcome()` — Added in: v1.10

Testing outcome for this test. Note that outcome is not the same as `testResult.status`:

- Test that is expected to fail and actually fails is `'expected'`.
- Test that passes on a second retry is `'flaky'`.

```ts
testCase.outcome();
```

**Returns:** `"skipped" | "expected" | "unexpected" | "flaky"`

---

### `testCase.titlePath()` — Added in: v1.10

Returns a list of titles from the root down to this test.

```ts
testCase.titlePath();
```

**Returns:** `Array<string>`

---

## Properties

### `testCase.annotations` — Added in: v1.10

`testResult.annotations` of the last test run.

**Type:** `Array<Object>`

- `type` `string` — Annotation type, for example `'skip'` or `'fail'`.
- `description` `string` (optional) — Optional description.
- `location` `Location` (optional) — Optional location in the source where the annotation is added.

---

### `testCase.expectedStatus` — Added in: v1.10

Expected test status. Tests marked as `test.skip()` or `test.fixme()` are expected to be `'skipped'`. Tests marked as `test.fail()` are expected to be `'failed'`. Other tests are expected to be `'passed'`. See also `testResult.status` for the actual status.

**Type:** `"passed" | "failed" | "timedOut" | "skipped" | "interrupted"`

---

### `testCase.id` — Added in: v1.25

A test ID that is computed based on the test file name, test title and project name. The ID is unique within a Playwright session.

**Type:** `string`

---

### `testCase.location` — Added in: v1.10

Location in the source where the test is defined.

**Type:** `Location`

---

### `testCase.parent` — Added in: v1.10

Suite this test case belongs to.

**Type:** `Suite`

---

### `testCase.repeatEachIndex` — Added in: v1.10

Contains the repeat index when running in "repeat each" mode. This mode is enabled by passing `--repeat-each` to the command line.

**Type:** `number`

---

### `testCase.results` — Added in: v1.10

Results for each run of this test.

**Type:** `Array<TestResult>`

---

### `testCase.retries` — Added in: v1.10

The maximum number of retries given to this test in the configuration. Learn more about test retries.

**Type:** `number`

---

### `testCase.tags` — Added in: v1.42

The list of tags defined on the test or suite via `test()` or `test.describe()`, as well as `@`-tokens extracted from test and suite titles. Learn more about test tags.

**Type:** `Array<string>`

---

### `testCase.timeout` — Added in: v1.10

The timeout given to the test. Affected by `testConfig.timeout`, `testProject.timeout`, `test.setTimeout()`, `test.slow()` and `testInfo.setTimeout()`.

**Type:** `number`

---

### `testCase.title` — Added in: v1.10

Test title as passed to the `test()` call.

**Type:** `string`

---

### `testCase.type` — Added in: v1.44

Returns `"test"`. Useful for detecting test cases in `suite.entries()`.

**Type:** `"test"`
