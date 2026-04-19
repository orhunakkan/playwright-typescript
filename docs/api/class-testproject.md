# 📦 Playwright — TestProject

> **Source:** [playwright.dev/docs/api/class-testproject](https://playwright.dev/docs/api/class-testproject)

---

**TestProject** supports running multiple test projects at the same time. This is useful for running tests in multiple configurations. For example, consider running tests against multiple browsers.

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
});
```

## Properties

### `testProject.dependencies` — Added in: v1.31

List of project names that this project depends on. Playwright Test will run all dependent projects first, and then run this project.

**Type:** `Array<string>`

### `testProject.expect` — Added in: v1.10

Configuration for the `expect` assertion library. See `testConfig.expect` for more details.

**Type:** `Object`

- `toHaveScreenshot` `Object` (optional) — Configuration for `expect(page).toHaveScreenshot()`.
  - `animations` `"allow" | "disabled"` (optional) — See `animations` in `page.screenshot()`. Defaults to `"disabled"`.
  - `caret` `"hide" | "initial"` (optional) — See `caret` in `page.screenshot()`. Defaults to `"hide"`.
  - `comparator` `string` (optional) — A custom comparator function.
  - `maxDiffPixelRatio` `number` (optional) — An acceptable ratio of pixels that are different to the total amount of pixels. Between `0` and `1`, default is configurable with `TestConfig.expect`.
  - `maxDiffPixels` `number` (optional) — An acceptable amount of pixels that could be different. Default is configurable with `TestConfig.expect`.
  - `pathTemplate` `string` (optional) — Template for screenshot path. Overrides `snapshotPathTemplate` for this assertion.
  - `scale` `"css" | "device"` (optional) — See `scale` in `page.screenshot()`. Defaults to `"css"`.
  - `stylePath` `string | Array<string>` (optional) — An array of stylesheet paths to apply when taking screenshots.
  - `threshold` `number` (optional) — Configures the acceptable perceived color difference in the YIQ color space between the same pixel in compared images. Default is configurable with `TestConfig.expect`.
- `toMatchAriaSnapshot` `Object` (optional) — Configuration for `expect(locator).toMatchAriaSnapshot()`.
  - `pathTemplate` `string` (optional) — Template for snapshot path.
- `toMatchSnapshot` `Object` (optional) — Configuration for `expect(value).toMatchSnapshot()`.
  - `comparator` `string` (optional) — A custom comparator function.
  - `maxDiffPixelRatio` `number` (optional) — An acceptable ratio of pixels that are different.
  - `maxDiffPixels` `number` (optional) — An acceptable amount of pixels that could be different.
  - `pathTemplate` `string` (optional) — Template for snapshot path.
  - `threshold` `number` (optional) — Configures the acceptable perceived color difference.
- `toPass` `Object` (optional) — Configuration for `expect(value).toPass()`.
  - `intervals` `Array<number>` (optional) — Probe intervals for the `expect(value).toPass()` assertion.
  - `timeout` `number` (optional) — Maximum time for the `toPass()` assertion to pass. Defaults to `testConfig.expect.timeout`.

### `testProject.fullyParallel` — Added in: v1.20

Playwright Test runs tests in parallel. In order to achieve that, it runs several worker processes that run at the same time. By default, **test files** are run in parallel. Tests in a single file are run in order, in the same worker process. You can configure entire test project to concurrently run all tests in all files using this option.

**Type:** `boolean`

### `testProject.grep` — Added in: v1.10

Filter to only run tests with a title matching one of the patterns. By default, run all tests. For example, passing `--grep=usage` on the command line would only run tests whose title contains the word "usage". Use regular expressions or pass an array of regular expressions to match multiple titles.

**Type:** `RegExp | Array<RegExp>`

### `testProject.grepInvert` — Added in: v1.10

Filter to only run tests with a title **not** matching one of the patterns. This is the opposite of `testProject.grep`. Also available globally and per-project as `grepInvert` in the config.

**Type:** `RegExp | Array<RegExp>`

### `testProject.ignoreSnapshots` — Added in: v1.26

Whether to skip snapshot expectations, such as `expect(value).toMatchSnapshot()` and `await expect(page).toHaveScreenshot()`.

**Type:** `boolean`

### `testProject.metadata` — Added in: v1.10

Arbitrary metadata that will be serialized and sent to reporters.

**Type:** `any`

### `testProject.name` — Added in: v1.10

Project name is visible in the report and during test execution. Use `testConfig.name` to set this option for all projects.

**Type:** `string`

### `testProject.outputDir` — Added in: v1.10

The output directory for files created during test execution. Each test run gets its own directory so they cannot conflict. Defaults to `<package.json-directory>/test-results`.

**Type:** `string`

### `testProject.repeatEach` — Added in: v1.10

The number of times to repeat each test, useful for debugging flaky tests.

**Type:** `number`

### `testProject.respectGitIgnore` — Added in: v1.43

Whether to skip entries from `.gitignore` when searching for test files.

**Type:** `boolean`

### `testProject.retries` — Added in: v1.10

The maximum number of retry attempts given to failed tests. Learn more about test retries. Use `test.describe.configure()` to change the number of retries for a specific file or a group of tests. Use `testConfig.retries` to change this option for all projects.

**Type:** `number`

### `testProject.snapshotDir` — Added in: v1.10

The base directory, relative to the config file, for snapshot files created with `toMatchSnapshot`. Defaults to `testProject.testDir`. The directory for each test can be accessed by `testInfo.snapshotDir` and `testInfo.snapshotPath()`.

**Type:** `string`

### `testProject.snapshotPathTemplate` — Added in: v1.28

This option configures a template controlling the location of snapshots generated by `expect(page).toHaveScreenshot()`, `expect(locator).toMatchAriaSnapshot()`, and `expect(value).toMatchSnapshot()`.

**Type:** `string`

Supported tokens:

| Token            | Description                                                 |
| ---------------- | ----------------------------------------------------------- |
| `{arg}`          | Relative snapshot path without extension                    |
| `{ext}`          | Snapshot extension (with leading dot)                       |
| `{platform}`     | The value of `process.platform`                             |
| `{projectName}`  | Project's file-system-sanitized name                        |
| `{snapshotDir}`  | Project's `testProject.snapshotDir`                         |
| `{testDir}`      | Project's `testProject.testDir`                             |
| `{testFileDir}`  | Directories in relative path from `testDir` to test file    |
| `{testFileName}` | Test file name with extension                               |
| `{testFilePath}` | Relative path from `testDir` to test file                   |
| `{testName}`     | File-system-sanitized test title including parent describes |

### `testProject.teardown` — Added in: v1.34

Name of a project that needs to run after this and all dependent projects have finished. Teardown is useful to clean up any resources acquired by this project.

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: /global.setup\.ts/,
      teardown: 'teardown',
    },
    {
      name: 'teardown',
      testMatch: /global.teardown\.ts/,
    },
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
      dependencies: ['setup'],
    },
  ],
});
```

**Type:** `string`

### `testProject.testDir` — Added in: v1.10

Directory that will be recursively scanned for test files. Defaults to the directory of the configuration file. Use `testConfig.testDir` to change this option for all projects.

**Type:** `string`

### `testProject.testIgnore` — Added in: v1.10

Files matching one of these patterns are not executed as test files. Matching is performed against the absolute file path. Strings are treated as glob patterns. Use `testConfig.testIgnore` to change this option for all projects.

**Type:** `string | RegExp | Array<string | RegExp>`

### `testProject.testMatch` — Added in: v1.10

Only the files matching one of these patterns are executed as test files. Matching is performed against the absolute file path. By default, Playwright looks for files matching `**/*.@(spec|test).?(c|m)[jt]s?(x)`. Use `testConfig.testMatch` to change this option for all projects.

**Type:** `string | RegExp | Array<string | RegExp>`

### `testProject.timeout` — Added in: v1.10

Timeout for each test in milliseconds. Defaults to 30 seconds. Each test can configure its own timeout with `test.setTimeout()`. Use `testConfig.timeout` to change this option for all projects.

**Type:** `number`

### `testProject.use` — Added in: v1.10

Options for all tests in this project, for example `testOptions.browserName`. Learn more about configuration and see available options.

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'Chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
```

**Type:** `TestOptions`

### `testProject.workers` — Added in: v1.52

The maximum number of concurrent worker processes to use for parallelizing tests from this project. Can also be set as a percentage of logical CPU cores, e.g. `'50%'`. By default, there is no per-project limit. See `testConfig.workers` for the total worker limit.

**Type:** `number | string`
