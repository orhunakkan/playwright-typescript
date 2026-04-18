# 📦 Playwright — TestInfo

> **Source:** [playwright.dev/docs/api/class-testinfo](https://playwright.dev/docs/api/class-testinfo)

---

## Overview

**TestInfo** contains information about currently running tests. It is accessible to tests and hooks through built-in `testInfo` fixture. `TestInfo` provides utilities to control test execution: attach files, update test timeout, determine which project the test is running in, and so on.

```ts
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }, testInfo) => {
  expect(testInfo.title).toBe('basic test');
  await page.screenshot({ path: testInfo.outputPath('screenshot.png') });
});
```

## Methods

### `testInfo.attach(name, options?)` — Added in: v1.10

Attach a value or a file from disk to the current test. Some reporters show test attachments. Either `path` or `body` must be specified, but not both.

**Returns:** `Promise<void>`

| Parameter             | Type                          | Description                                                                                                |
| --------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `name`                | `string`                      | Attachment name.                                                                                           |
| `options.body`        | `string \| Buffer` (optional) | Attachment body. Mutually exclusive with `path`.                                                           |
| `options.contentType` | `string` (optional)           | Content type of this attachment to properly present in the report. Defaults to `application/octet-stream`. |
| `options.path`        | `string` (optional)           | Path on the filesystem to the attached file. Mutually exclusive with `body`.                               |

---

### `testInfo.fail()` — Added in: v1.10

Marks the currently running test as "should fail". Playwright Test runs this test and ensures that it is actually failing. This is useful for documentation purposes to acknowledge that some functionality is broken until it is fixed.

---

### `testInfo.fail(condition, description?)` — Added in: v1.10

Conditionally mark the currently running test as "should fail" with an optional description.

| Parameter     | Type                | Description                                                   |
| ------------- | ------------------- | ------------------------------------------------------------- |
| `condition`   | `boolean`           | Test is marked as "should fail" when the condition is `true`. |
| `description` | `string` (optional) | Optional description that will be reflected in a test report. |

---

### `testInfo.fixme()` — Added in: v1.10

Marks the currently running test as "fixme". The test will be skipped, but the intention is to fix it. This is functionally equivalent to `testInfo.skip()`.

---

### `testInfo.fixme(condition, description?)` — Added in: v1.10

Conditionally mark the currently running test as "fixme" with an optional description.

| Parameter     | Type                | Description                                                   |
| ------------- | ------------------- | ------------------------------------------------------------- |
| `condition`   | `boolean`           | Test is marked as "fixme" when the condition is `true`.       |
| `description` | `string` (optional) | Optional description that will be reflected in a test report. |

---

### `testInfo.outputPath(...pathSegments)` — Added in: v1.10

Returns a path inside the `testInfo.outputDir` where the test can safely put a temporary file. Guarantees that tests running in parallel will not interfere with each other.

```ts
test('example test', async ({}, testInfo) => {
  const file = testInfo.outputPath('dir', 'temporary-file.txt');
  await fs.promises.writeFile(file, 'Put some data here', 'utf8');
});
```

**Returns:** `string`

| Parameter         | Type            | Description                                               |
| ----------------- | --------------- | --------------------------------------------------------- |
| `...pathSegments` | `Array<string>` | Path segments to append at the end of the resulting path. |

---

### `testInfo.setTimeout(timeout)` — Added in: v1.10

Changes the timeout for the currently running test. Zero means no timeout.

**Returns:** `void`

| Parameter | Type     | Description              |
| --------- | -------- | ------------------------ |
| `timeout` | `number` | Timeout in milliseconds. |

---

### `testInfo.skip()` — Added in: v1.10

Unconditionally skips the currently running test. The test will be skipped and its annotations will say "skipped".

---

### `testInfo.skip(condition, description?)` — Added in: v1.10

Conditionally skips the currently running test with an optional description.

| Parameter     | Type                | Description                                                   |
| ------------- | ------------------- | ------------------------------------------------------------- |
| `condition`   | `boolean`           | Test is skipped when the condition is `true`.                 |
| `description` | `string` (optional) | Optional description that will be reflected in a test report. |

---

### `testInfo.slow()` — Added in: v1.10

Marks the currently running test as "slow", giving it triple the default timeout.

---

### `testInfo.slow(condition, description?)` — Added in: v1.10

Conditionally marks the currently running test as "slow" with an optional description.

| Parameter     | Type                | Description                                                   |
| ------------- | ------------------- | ------------------------------------------------------------- |
| `condition`   | `boolean`           | Test is marked as "slow" when the condition is `true`.        |
| `description` | `string` (optional) | Optional description that will be reflected in a test report. |

---

### `testInfo.snapshotPath(...name, options?)` — Added in: v1.10

Returns a path to a snapshot file with the given `name`. Learn more about snapshots.

**Returns:** `string`

| Parameter      | Type                                              | Description                                     |
| -------------- | ------------------------------------------------- | ----------------------------------------------- |
| `...name`      | `Array<string>`                                   | Snapshot name.                                  |
| `options.kind` | `"snapshot" \| "screenshot" \| "aria"` (optional) | The kind of snapshot. Defaults to `"snapshot"`. |

## Properties

### `testInfo.annotations` — Added in: v1.10

The list of annotations applicable to the current test. Includes annotations from the test, annotations from all `test.describe()` groups the test belongs to and file-level annotations for the test file.

**Type:** `Array<Object>`

- `type` `string` — Annotation type.
- `description` `string` (optional) — Annotation description.
- `location` `Location` (optional) — Annotation location.

---

### `testInfo.attachments` — Added in: v1.10

The list of files or buffers attached to the current test. Some reporters show test attachments. See `testInfo.attach()` to add attachments.

**Type:** `Array<Object>`

- `name` `string` — Attachment name.
- `contentType` `string` — Content type of this attachment to properly present in the report.
- `path` `string` (optional) — Optional path on the filesystem to the attached file.
- `body` `Buffer` (optional) — Optional attachment body used instead of a file.

---

### `testInfo.column` — Added in: v1.10

Column number where the currently running test is declared.

**Type:** `number`

---

### `testInfo.config` — Added in: v1.10

Processed configuration from the configuration file.

**Type:** `FullConfig`

---

### `testInfo.duration` — Added in: v1.10

The number of milliseconds the test took to finish. Always zero before the test finishes, either successfully or not. Can be used in `afterEach` hook.

**Type:** `number`

---

### `testInfo.error` — Added in: v1.10

First error thrown during test execution, if any. This is equal to the first element in `testInfo.errors`.

**Type:** `TestInfoError`

---

### `testInfo.errors` — Added in: v1.10

Errors thrown during test execution, if any.

**Type:** `Array<TestInfoError>`

---

### `testInfo.expectedStatus` — Added in: v1.10

Expected status for the currently running test. This is usually `'passed'`, except for a few cases:

- `'skipped'` for skipped tests, e.g. with `test.skip()`.
- `'failed'` for tests marked as failing, e.g. with `test.fail()`.

Expected status is compared with `testInfo.status` in the end of the test to determine whether the test passed.

**Type:** `"passed" | "failed" | "timedOut" | "skipped" | "interrupted"`

---

### `testInfo.file` — Added in: v1.10

Absolute path to a file where the currently running test is declared.

**Type:** `string`

---

### `testInfo.fn` — Added in: v1.10

Test function as passed to `test(title, testFunction)`.

**Type:** `function`

---

### `testInfo.line` — Added in: v1.10

Line number where the currently running test is declared.

**Type:** `number`

---

### `testInfo.outputDir` — Added in: v1.10

Absolute path to the output directory for this specific test run. Each test run gets its own directory so they cannot conflict.

**Type:** `string`

---

### `testInfo.parallelIndex` — Added in: v1.10

The index of the worker between `0` and `workers - 1`. It is guaranteed that workers running at the same time have a different `parallelIndex`. Use this to distinguish between multiple workers running at the same time.

**Type:** `number`

---

### `testInfo.project` — Added in: v1.10

Processed project configuration that this test belongs to.

**Type:** `FullProject`

---

### `testInfo.repeatEachIndex` — Added in: v1.10

Specifies a unique repeat index when test was run multiple times via `--repeat-each` option.

**Type:** `number`

---

### `testInfo.retry` — Added in: v1.10

Specifies the retry number when test is retried after a failure. The first test run has `testInfo.retry` equal to zero, the first retry has it equal to one, and so on. Learn more about retries.

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({}, testInfo) => {
  // You can access testInfo.retry in any hook or fixture.
  if (testInfo.retry > 0) {
    console.log(`Retrying!`);
  }
});
```

**Type:** `number`

---

### `testInfo.snapshotDir` — Added in: v1.10

> **Note:** Use `testInfo.snapshotPath()` instead. This property does not account for `testProject.snapshotPathTemplate` option.

Absolute path to the snapshot output directory for the current test. Each test suite gets its own directory so they cannot conflict.

**Type:** `string`

---

### `testInfo.snapshotSuffix` — Added in: v1.10

> **Note:** Use `testConfig.snapshotPathTemplate` to configure snapshot paths. This property is deprecated and will be removed in the future.

Suffix used to differentiate snapshots between multiple test configurations. For example, if snapshots depend on the platform, you can set `testInfo.snapshotSuffix` equal to `process.platform`. In this case `expect(value).toMatchSnapshot(snapshotName)` will use different snapshots depending on the platform.

**Type:** `string`

---

### `testInfo.status` — Added in: v1.10

Actual status for the currently running test. Available after the test has finished in `afterEach` hook and fixtures.

Status is usually compared with `testInfo.expectedStatus`:

```ts
import { test, expect } from '@playwright/test';

test.afterEach(async ({}, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    console.log(`${testInfo.title} did not run as expected!`);
  }
});
```

**Type:** `"passed" | "failed" | "timedOut" | "skipped" | "interrupted"`

---

### `testInfo.tags` — Added in: v1.43

Tags that apply to the test. Learn more about test tags.

> **Note:** Any changes made to `testInfo.tags` during the test run are not visible to test reporters.

**Type:** `Array<string>`

---

### `testInfo.testId` — Added in: v1.32

Unique identifier of the current test. This is different from `testCase.id`.

**Type:** `string`

---

### `testInfo.timeout` — Added in: v1.10

Timeout in milliseconds for the currently running test. Zero means no timeout. Learn more about test timeouts.

To change timeout for the test, use `testInfo.setTimeout()`:

```ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({}, testInfo) => {
  // Extend timeout for all tests running this hook by 30 seconds.
  testInfo.setTimeout(testInfo.timeout + 30000);
});
```

**Type:** `number`

---

### `testInfo.title` — Added in: v1.10

The title of the currently running test as passed to `test(title, testFunction)`.

**Type:** `string`

---

### `testInfo.titlePath` — Added in: v1.10

The full title path starting with the project.

**Type:** `Array<string>`

---

### `testInfo.workerIndex` — Added in: v1.10

The unique index of the worker process that is running the test. Also available as `process.env.TEST_WORKER_INDEX`. Learn more about parallelism and sharding with Playwright Test.

**Type:** `number`
