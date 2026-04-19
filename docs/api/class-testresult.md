# 📦 Playwright — TestResult

> **Source:** [playwright.dev/docs/api/class-testresult](https://playwright.dev/docs/api/class-testresult)

---

**TestResult** is a result of a single `TestCase` run.

## Properties

### `testResult.annotations` — Added in: v1.52

Annotations collected during the test run.

**Type:** `Array<Object>`

- `type` `string` — Annotation type, for example `'skip'` or `'fail'`.
- `description` `string` (optional) — Optional description.
- `location` `Location` (optional) — Optional location in the source where the annotation is added.

### `testResult.attachments` — Added in: v1.10

The list of files or buffers attached to the test result. Some reporters show test attachments.

**Type:** `Array<Object>`

- `name` `string` — Attachment name.
- `contentType` `string` — Content type of this attachment to properly present in the report, for example `'application/json'` or `'image/png'`.
- `path` `string` (optional) — Optional path on the filesystem to the attached file.
- `body` `Buffer` (optional) — Optional attachment body used instead of a file.

### `testResult.duration` — Added in: v1.10

Running time in milliseconds.

**Type:** `number`

### `testResult.error` — Added in: v1.10

First error thrown during test execution, if any.

**Type:** `TestError`

### `testResult.errors` — Added in: v1.10

Errors thrown during test execution, if any.

**Type:** `Array<TestError>`

### `testResult.parallelIndex` — Added in: v1.30

The index of the worker between `0` and `workers - 1`. It is guaranteed that workers running at the same time have a different `parallelIndex`. This is useful to distinguish resources used by different workers, e.g. can be used as index for a port in the server.

**Type:** `number`

### `testResult.retry` — Added in: v1.10

When test is retried multiple times, each retry attempt is given a sequential number. See `testConfig.retries` to configure the number of retries.

**Type:** `number`

### `testResult.startTime` — Added in: v1.10

Start time of this particular test run.

**Type:** `Date`

### `testResult.status` — Added in: v1.10

Actual test result. See also `testCase.expectedStatus`.

**Type:** `"passed" | "failed" | "timedOut" | "skipped" | "interrupted"`

### `testResult.stderr` — Added in: v1.10

Anything written to the standard error during the test run.

**Type:** `Array<string | Buffer>`

### `testResult.stdout` — Added in: v1.10

Anything written to the standard output during the test run.

**Type:** `Array<string | Buffer>`

### `testResult.steps` — Added in: v1.10

List of steps inside this test run.

**Type:** `Array<TestStep>`

### `testResult.workerIndex` — Added in: v1.10

Index of the worker where the test was run. If the test was not run a single time (e.g. due to test retries), it is still a single `workerIndex`.

**Type:** `number`
