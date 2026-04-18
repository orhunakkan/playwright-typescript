# 📦 Playwright — Reporter

> **Source:** [playwright.dev/docs/api/class-reporter](https://playwright.dev/docs/api/class-reporter)

---

**Reporter** is the interface test runner notifies about various events during test execution. All methods of the reporter are optional. You can create a custom reporter by implementing a class with some of the reporter methods. Make sure to export this class as default.

```ts
import type { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

class MyReporter implements Reporter {
  constructor(options: { customOption?: string } = {}) {
    console.log(`my-awesome-reporter setup with customOption set to ${options.customOption}`);
  }

  onBegin(config: FullConfig, suite: Suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests`);
  }

  onTestBegin(test: TestCase) {
    console.log(`Starting test ${test.title}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    console.log(`Finished test ${test.title}: ${result.status}`);
  }

  onEnd(result: FullResult) {
    console.log(`Finished the run: ${result.status}`);
  }
}

export default MyReporter;
```

Use this reporter with `testConfig.reporter`:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  reporter: [['./my-awesome-reporter.ts', { customOption: 'some value' }]],
});
```

Typical order of reporter calls:

1. `reporter.onBegin()` — called once with a root suite containing all other suites and tests.
2. `reporter.onTestBegin()` — called for each test run.
3. `reporter.onStepBegin()` and `reporter.onStepEnd()` — called for each executed step inside the test.
4. `reporter.onTestEnd()` — called when test run has finished.
5. `reporter.onEnd()` — called once after all tests that should run had finished.
6. `reporter.onExit()` — called immediately before the test runner exits.

Additionally, `reporter.onStdOut()` and `reporter.onStdErr()` are called when standard output is produced in the worker process, and `reporter.onError()` is called when something went wrong outside of the test execution.

> **Note:** If your custom reporter does not print anything to the terminal, implement `reporter.printsToStdio()` and return `false`.

---

## Methods

## Methods

### `reporter.onBegin(config, suite)` — Added in: v1.10

Called once before running tests. All tests have been already discovered and put into a hierarchy of `Suite`s.

```ts
reporter.onBegin(config, suite);
```

**Arguments:**

| Parameter | Type         | Description                                                      |
| --------- | ------------ | ---------------------------------------------------------------- |
| `config`  | `FullConfig` | Resolved configuration.                                          |
| `suite`   | `Suite`      | The root suite that contains all projects, files and test cases. |

---

### `reporter.onEnd(result)` — Added in: v1.10

Called after all tests have been run, or testing has been interrupted. Note that this method may return a `Promise` and Playwright Test will await it. Reporter is allowed to override the status and hence affect the exit code of the test runner.

```ts
await reporter.onEnd(result);
```

**Arguments:**

| Parameter          | Type                                                  | Description                        |
| ------------------ | ----------------------------------------------------- | ---------------------------------- |
| `result.status`    | `"passed" \| "failed" \| "timedout" \| "interrupted"` | Test run status.                   |
| `result.startTime` | `Date`                                                | Test run start wall time.          |
| `result.duration`  | `number`                                              | Test run duration in milliseconds. |

**Returns:** `Promise<Object>` — optional `{ status?: "passed" | "failed" | "timedout" | "interrupted" }`

---

### `reporter.onError(error)` — Added in: v1.10

Called on some global error, for example unhandled exception in the worker process.

```ts
reporter.onError(error);
```

**Arguments:**

| Parameter | Type        | Description |
| --------- | ----------- | ----------- |
| `error`   | `TestError` | The error.  |

---

### `reporter.onExit()` — Added in: v1.33

Called immediately before test runner exits. At this point all the reporters have received the `reporter.onEnd()` signal, so all the reports should be built. You can run the code that uploads the reports in this hook.

```ts
await reporter.onExit();
```

**Returns:** `Promise<void>`

---

### `reporter.onStdErr(chunk, test, result)` — Added in: v1.10

Called when something has been written to the standard error in the worker process.

```ts
reporter.onStdErr(chunk, test, result);
```

**Arguments:**

| Parameter | Type                 | Description                                                 |
| --------- | -------------------- | ----------------------------------------------------------- |
| `chunk`   | `string \| Buffer`   | Output chunk.                                               |
| `test`    | `void \| TestCase`   | Test that was running. May be `void` if no test is running. |
| `result`  | `void \| TestResult` | Result of the test run, populated while the test runs.      |

---

### `reporter.onStdOut(chunk, test, result)` — Added in: v1.10

Called when something has been written to the standard output in the worker process.

```ts
reporter.onStdOut(chunk, test, result);
```

**Arguments:**

| Parameter | Type                 | Description                                                 |
| --------- | -------------------- | ----------------------------------------------------------- |
| `chunk`   | `string \| Buffer`   | Output chunk.                                               |
| `test`    | `void \| TestCase`   | Test that was running. May be `void` if no test is running. |
| `result`  | `void \| TestResult` | Result of the test run, populated while the test runs.      |

---

### `reporter.onStepBegin(test, result, step)` — Added in: v1.10

Called when a test step started in the worker process.

```ts
reporter.onStepBegin(test, result, step);
```

**Arguments:**

| Parameter | Type         | Description                                            |
| --------- | ------------ | ------------------------------------------------------ |
| `test`    | `TestCase`   | Test that the step belongs to.                         |
| `result`  | `TestResult` | Result of the test run, populated while the test runs. |
| `step`    | `TestStep`   | Test step instance that has started.                   |

---

### `reporter.onStepEnd(test, result, step)` — Added in: v1.10

Called when a test step finished in the worker process.

```ts
reporter.onStepEnd(test, result, step);
```

**Arguments:**

| Parameter | Type         | Description                           |
| --------- | ------------ | ------------------------------------- |
| `test`    | `TestCase`   | Test that the step belongs to.        |
| `result`  | `TestResult` | Result of the test run.               |
| `step`    | `TestStep`   | Test step instance that has finished. |

---

### `reporter.onTestBegin(test, result)` — Added in: v1.10

Called after a test has been started in the worker process.

```ts
reporter.onTestBegin(test, result);
```

**Arguments:**

| Parameter | Type         | Description                                            |
| --------- | ------------ | ------------------------------------------------------ |
| `test`    | `TestCase`   | Test that has been started.                            |
| `result`  | `TestResult` | Result of the test run, populated while the test runs. |

---

### `reporter.onTestEnd(test, result)` — Added in: v1.10

Called after a test has been finished in the worker process.

```ts
reporter.onTestEnd(test, result);
```

**Arguments:**

| Parameter | Type         | Description                  |
| --------- | ------------ | ---------------------------- |
| `test`    | `TestCase`   | Test that has been finished. |
| `result`  | `TestResult` | Result of the test run.      |

---

### `reporter.printsToStdio()` — Added in: v1.10

Whether this reporter uses stdio for reporting. When it does not, Playwright Test could add some output to enhance user experience. If your reporter does not print to the terminal, it is strongly recommended to return `false`.

```ts
reporter.printsToStdio();
```

**Returns:** `boolean`
