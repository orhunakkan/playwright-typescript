# 📊 Playwright — Reporters

> **Source:** [playwright.dev/docs/test-reporters](https://playwright.dev/docs/test-reporters)

---

## Introduction

Playwright Test comes with a few built-in reporters for different needs and ability to provide custom reporters. The easiest way to try out built-in reporters is to pass `--reporter` command line option.

```bash
npx playwright test --reporter=line
```

For more control, you can specify reporters programmatically in the configuration file.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: 'line',
});
```

---

## Multiple reporters

You can use multiple reporters at the same time. For example you can use `'list'` for nice terminal output and `'json'` to get a comprehensive json file with the test results.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['list'], ['json', { outputFile: 'test-results.json' }]],
});
```

---

## Reporters on CI

You can use different reporters locally and on CI. For example, using concise `'dot'` reporter avoids too much output. This is the default on CI.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Concise 'dot' for CI, default 'list' when running locally
  reporter: process.env.CI ? 'dot' : 'list',
});
```

---

## Built-in reporters

All built-in reporters show detailed information about failures, and mostly differ in verbosity for successful runs.

### List reporter

List reporter is default (except on CI where the dot reporter is default). It prints a line for each test being run.

```bash
npx playwright test --reporter=list
```

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: 'list',
});
```

Example output:

```text
npx playwright test --reporter=list
Running 124 tests using 6 workers

  1 ✓ should access error in env (438ms)
  2 ✓ handle long test names (515ms)
  3 ✗ 1) render expected (691ms)
  4 ✓ should timeout (932ms)
  5   should repeat each:
  6 ✓ should respect enclosing .gitignore (569ms)
  7   should teardown env after timeout:
  8   should respect excluded tests:
  9 ✓ should handle env beforeEach error (638ms)
 10   should respect enclosing .gitignore:
```

You can opt into the step rendering via passing the following config option:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['list', { printSteps: true }]],
});
```

List report supports the following configuration options and environment variables:

| Env Variable                  | Reporter Config Option | Description                                             | Default                             |
| ----------------------------- | ---------------------- | ------------------------------------------------------- | ----------------------------------- |
| `PLAYWRIGHT_LIST_PRINT_STEPS` | `printSteps`           | Whether to print each step on its own line.             | `false`                             |
| `PLAYWRIGHT_FORCE_TTY`        | —                      | Whether to produce output suitable for a live terminal. | `true` when terminal is in TTY mode |
| `FORCE_COLOR`                 | —                      | Whether to produce colored output.                      | `true` when terminal is in TTY mode |

### Line reporter

Line reporter is more concise than the list reporter. It uses a single line to report last finished test, and prints failures when they occur. Line reporter is useful for large test suites where it shows the progress but does not spam the output by listing all the tests.

```bash
npx playwright test --reporter=line
```

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: 'line',
});
```

Example output:

```text
npx playwright test --reporter=line
Running 124 tests using 6 workers

  1) dot-reporter.spec.ts:20:1 › render expected ===================================================

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: 1
    Received: 0

[23/124] gitignore.spec.ts - should respect nested .gitignore
```

### Dot reporter

Dot reporter is very concise - it only produces a single character per successful test run. It is the default on CI and useful where you don't want a lot of output.

```bash
npx playwright test --reporter=dot
```

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: 'dot',
});
```

Example output:

```text
npx playwright test --reporter=dot
Running 124 tests using 6 workers

·····F·············································
```

| Character | Description                               |
| --------- | ----------------------------------------- |
| `·`       | Passed                                    |
| `F`       | Failed                                    |
| `×`       | Failed or timed out - and will be retried |
| `±`       | Passed on retry (flaky)                   |
| `T`       | Timed out                                 |
| `°`       | Skipped                                   |

### HTML reporter

HTML reporter produces a self-contained folder that contains report for the test run that can be served as a web page.

```bash
npx playwright test --reporter=html
```

By default, HTML report is opened automatically if some of the tests failed. You can control this behavior via the `open` property in the Playwright config or the `PLAYWRIGHT_HTML_OPEN` environmental variable. The possible values for that property are `always`, `never` and `on-failure` (default). You can also configure host and port that are used to serve the HTML report.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['html', { open: 'never' }]],
});
```

By default, report is written into the `playwright-report` folder in the current working directory. One can override that location using the `PLAYWRIGHT_HTML_OUTPUT_DIR` environment variable or a reporter configuration.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['html', { outputFolder: 'my-report' }]],
});
```

If you are uploading attachments from a data folder to another location, you can use `attachmentsBaseURL` option to let html report know where to look for them.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['html', { attachmentsBaseURL: 'https://external-storage.com/' }]],
});
```

A quick way of opening the last test run report is:

```bash
npx playwright show-report
```

Or if there is a custom folder name:

```bash
npx playwright show-report my-report
```

HTML report supports the following configuration options and environment variables:

| Env Variable                           | Reporter Config Option | Description                                                           | Default                      |
| -------------------------------------- | ---------------------- | --------------------------------------------------------------------- | ---------------------------- |
| `PLAYWRIGHT_HTML_TITLE`                | `title`                | A title to display in the generated report.                           | No title                     |
| `PLAYWRIGHT_HTML_OUTPUT_DIR`           | `outputFolder`         | Directory to save the report to.                                      | `playwright-report`          |
| `PLAYWRIGHT_HTML_OPEN`                 | `open`                 | When to open the html report: `'always'`, `'never'` or `'on-failure'` | `'on-failure'`               |
| `PLAYWRIGHT_HTML_HOST`                 | `host`                 | Hostname to serve the report on.                                      | `localhost`                  |
| `PLAYWRIGHT_HTML_PORT`                 | `port`                 | Port to serve the report on.                                          | `9323` or any available port |
| `PLAYWRIGHT_HTML_ATTACHMENTS_BASE_URL` | `attachmentsBaseURL`   | Separate location where attachments are uploaded.                     | `data/`                      |
| `PLAYWRIGHT_HTML_NO_COPY_PROMPT`       | `noCopyPrompt`         | If true, disable rendering of the Copy prompt for errors.             | `false`                      |
| `PLAYWRIGHT_HTML_NO_SNIPPETS`          | `noSnippets`           | If true, disable rendering code snippets in the action log.           | `false`                      |
| `PLAYWRIGHT_HTML_DO_NOT_INLINE_ASSETS` | `doNotInlineAssets`    | If true, write JS/CSS/data as separate files instead of inline.       | `false`                      |

### Blob reporter

Blob reports contain all the details about the test run and can be used later to produce any other report. Their primary function is to facilitate the merging of reports from sharded tests.

```bash
npx playwright test --reporter=blob
```

By default, the report is written into the `blob-report` directory. The report file name looks like `report-<hash>.zip` or `report-<hash>-<shard_number>.zip` when sharding is used.

**When sharding (no options needed):**

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: 'blob',
});
```

**When running tests in different environments:**

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: 'blob',
  tag: process.env.CI_ENVIRONMENT_NAME, // for example "@APIv2" or "@linux"
});
```

Blob report supports following configuration options and environment variables:

| Env Variable                  | Reporter Config Option | Description                                                                           | Default                                      |
| ----------------------------- | ---------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------- |
| `PLAYWRIGHT_BLOB_OUTPUT_DIR`  | `outputDir`            | Directory to save the output. Existing content is deleted before writing.             | `blob-report`                                |
| `PLAYWRIGHT_BLOB_OUTPUT_NAME` | `fileName`             | Report file name.                                                                     | `report-<project>-<hash>-<shard_number>.zip` |
| `PLAYWRIGHT_BLOB_OUTPUT_FILE` | `outputFile`           | Full path to the output file. If defined, `outputDir` and `fileName` will be ignored. | `undefined`                                  |

### JSON reporter

JSON reporter produces an object with all information about the test run. Most likely you want to write the JSON to a file. When running with `--reporter=json`, use `PLAYWRIGHT_JSON_OUTPUT_NAME` environment variable:

```bash
PLAYWRIGHT_JSON_OUTPUT_NAME=results.json npx playwright test --reporter=json
```

In configuration file, pass options directly:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['json', { outputFile: 'results.json' }]],
});
```

JSON report supports following configuration options and environment variables:

| Env Variable                  | Reporter Config Option | Description                                                             | Default                   |
| ----------------------------- | ---------------------- | ----------------------------------------------------------------------- | ------------------------- |
| `PLAYWRIGHT_JSON_OUTPUT_DIR`  | —                      | Directory to save the output file. Ignored if output file is specified. | `cwd` or config directory |
| `PLAYWRIGHT_JSON_OUTPUT_NAME` | `outputFile`           | Base file name for the output, relative to the output dir.              | Printed to stdout         |
| `PLAYWRIGHT_JSON_OUTPUT_FILE` | `outputFile`           | Full path to the output file.                                           | Printed to stdout         |

### JUnit reporter

JUnit reporter produces a JUnit-style xml report. When running with `--reporter=junit`, use `PLAYWRIGHT_JUNIT_OUTPUT_NAME` environment variable:

```bash
PLAYWRIGHT_JUNIT_OUTPUT_NAME=results.xml npx playwright test --reporter=junit
```

In configuration file, pass options directly:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['junit', { outputFile: 'results.xml' }]],
});
```

JUnit report supports following configuration options and environment variables:

| Env Variable                                    | Reporter Config Option      | Description                                                                 | Default                   |
| ----------------------------------------------- | --------------------------- | --------------------------------------------------------------------------- | ------------------------- |
| `PLAYWRIGHT_JUNIT_OUTPUT_DIR`                   | —                           | Directory to save the output file. Ignored if output file is not specified. | `cwd` or config directory |
| `PLAYWRIGHT_JUNIT_OUTPUT_NAME`                  | `outputFile`                | Base file name for the output, relative to the output dir.                  | Printed to stdout         |
| `PLAYWRIGHT_JUNIT_OUTPUT_FILE`                  | `outputFile`                | Full path to the output file.                                               | Printed to stdout         |
| `PLAYWRIGHT_JUNIT_STRIP_ANSI`                   | `stripANSIControlSequences` | Whether to remove ANSI control sequences from the text.                     | Output text added as is   |
| `PLAYWRIGHT_JUNIT_INCLUDE_PROJECT_IN_TEST_NAME` | `includeProjectInTestName`  | Whether to include Playwright project name in every test case.              | Not included              |
| `PLAYWRIGHT_JUNIT_SUITE_ID`                     | —                           | Value of the `id` attribute on the root `<testsuites/>` entry.              | Empty string              |
| `PLAYWRIGHT_JUNIT_SUITE_NAME`                   | —                           | Value of the `name` attribute on the root `<testsuites/>` entry.            | Empty string              |

### GitHub Actions annotations

You can use the built in `github` reporter to get automatic failure annotations when running in GitHub actions. Note that all other reporters work on GitHub Actions as well, but do not provide annotations. Also, it is not recommended to use this annotation type if running your tests with a matrix strategy as the stack trace failures will multiply and obscure the GitHub file view.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // 'github' for GitHub Actions CI to generate annotations, plus a concise 'dot'
  // default 'list' when running locally
  reporter: process.env.CI ? 'github' : 'list',
});
```

---

## Custom reporters

You can create a custom reporter by implementing a class with some of the reporter methods. Learn more about the Reporter API.

```ts
// my-awesome-reporter.ts
import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';

class MyReporter implements Reporter {
  onBegin(config: FullConfig, suite: Suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests`);
  }

  onTestBegin(test: TestCase, result: TestResult) {
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

Now use this reporter with `testConfig.reporter`.

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: './my-awesome-reporter.ts',
});
```

Or just pass the reporter file path as `--reporter` command line option:

```bash
npx playwright test --reporter="./myreporter/my-awesome-reporter.ts"
```

Here's a short list of open source reporter implementations that you can take a look at when writing your own reporter:

- Allure Reporter
- Github Actions Reporter
- Mail Reporter
- ReportPortal
- Monocart

---

## 🗂️ Quick Reference

| Reporter | Best for                   | Command             |
| -------- | -------------------------- | ------------------- |
| `list`   | Local development          | `--reporter=list`   |
| `line`   | Large suites               | `--reporter=line`   |
| `dot`    | CI minimal output          | `--reporter=dot`    |
| `html`   | Full visual report         | `--reporter=html`   |
| `blob`   | Shard merging              | `--reporter=blob`   |
| `json`   | Machine-readable output    | `--reporter=json`   |
| `junit`  | CI XML integration         | `--reporter=junit`  |
| `github` | GitHub Actions annotations | `--reporter=github` |
