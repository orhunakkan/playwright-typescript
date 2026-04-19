# 📦 Playwright — TestConfig

> **Source:** [playwright.dev/docs/api/class-testconfig](https://playwright.dev/docs/api/class-testconfig)

---

**TestConfig** is the object returned from `defineConfig()`. It represents the full resolved Playwright configuration. You usually do not need to interact with this class directly; see the config guide for more details.

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30000,
  reporter: 'html',
  use: {
    browserName: 'chromium',
  },
});
```

## Properties

### `testConfig.build` — Added in: v1.50

Playwright transpiler configuration.

**Type:** `Object`

- `env` `Object<string, string>` (optional) — Environment variables to be set for the transpiler.
- `command` `string` (optional) — The command to run instead of Node.js standard compilation pipeline. The command should accept a list of source files via stdin and output a `sourcemap-sources` JSON on stdout.
- `cwd` `string` (optional) — Current working directory of the build command.
- `stdio` `"pipe" | "inherit"` (optional) — Defaults to `'pipe'`.

### `testConfig.captureGitInfo` — Added in: v1.51

Playwright Test includes git information in the test results when running inside a git repository. This information is used by some reporters to display test results in a more informative way.

**Type:** `Object`

- `git` `boolean` — Whether to capture git information.

### `testConfig.expect` — Added in: v1.10

Configuration for the `expect` assertion library.

**Type:** `Object`

- `timeout` `number` (optional) — Default timeout for async `expect` matchers in milliseconds. Defaults to `5000`.
- `toHaveScreenshot` `Object` (optional) — Configuration for `expect(page).toHaveScreenshot()`.
  - `animations` `"allow" | "disabled"` (optional) — See `animations` in `page.screenshot()`. Defaults to `"disabled"`.
  - `caret` `"hide" | "initial"` (optional) — See `caret` in `page.screenshot()`. Defaults to `"hide"`.
  - `comparator` `string` (optional) — A custom comparator function.
  - `maxDiffPixelRatio` `number` (optional) — An acceptable ratio of pixels that are different to the total amount of pixels. Between `0` and `1`.
  - `maxDiffPixels` `number` (optional) — An acceptable amount of pixels that could be different.
  - `pathTemplate` `string` (optional) — Template controlling where screenshots are stored.
  - `scale` `"css" | "device"` (optional) — See `scale` in `page.screenshot()`. Defaults to `"css"`.
  - `stylePath` `string | Array<string>` (optional) — Stylesheet paths to apply when taking screenshots.
  - `threshold` `number` (optional) — Configures the acceptable perceived color difference in the YIQ color space.
- `toMatchAriaSnapshot` `Object` (optional) — Configuration for `expect(locator).toMatchAriaSnapshot()`.
  - `pathTemplate` `string` (optional) — Template for snapshot path.
- `toMatchSnapshot` `Object` (optional) — Configuration for `expect(value).toMatchSnapshot()`.
  - `comparator` `string` (optional) — A custom comparator function.
  - `maxDiffPixelRatio` `number` (optional) — An acceptable ratio of pixels that are different.
  - `maxDiffPixels` `number` (optional) — An acceptable amount of pixels that could be different.
  - `pathTemplate` `string` (optional) — Template for snapshot path.
  - `threshold` `number` (optional) — Configures the acceptable perceived color difference.
- `toPass` `Object` (optional) — Configuration for `expect(value).toPass()`.
  - `intervals` `Array<number>` (optional) — Probe intervals for `toPass()`.
  - `timeout` `number` (optional) — Maximum time for the `toPass()` assertion to pass.

### `testConfig.failOnFlakyTests` — Added in: v1.51

Whether to fail the test run if any flaky tests are detected. A test is considered flaky when it passes on retry after previously failing. Defaults to `false`.

**Type:** `boolean`

### `testConfig.forbidOnly` — Added in: v1.10

Whether to exit with an error if any tests or groups are marked as `test.only`. Useful on CI. Defaults to `false`.

**Type:** `boolean`

### `testConfig.fullyParallel` — Added in: v1.20

Playwright Test runs tests in parallel. In order to achieve that, it runs several worker processes that run at the same time. By default, **test files** are run in parallel. Tests in a single file are run in order, in the same worker process. You can configure entire test suite to concurrently run all tests in all files using this option.

**Type:** `boolean`

### `testConfig.globalSetup` — Added in: v1.10

Path to the global setup file. This file will be required and run before all the tests. It must export a single function. See also `testConfig.globalTeardown`.

**Type:** `string`

### `testConfig.globalTeardown` — Added in: v1.10

Path to the global teardown file. This file will be required and run after all the tests. It must export a single function. See also `testConfig.globalSetup`.

**Type:** `string`

### `testConfig.globalTimeout` — Added in: v1.10

Maximum time in milliseconds the whole test suite can run. Zero means no limit. Defaults to `0`.

**Type:** `number`

### `testConfig.grep` — Added in: v1.10

Filter to only run tests with a title matching one of the patterns. For example, passing `--grep=usage` on the command line would only run tests whose title includes `"usage"`.

**Type:** `RegExp | Array<RegExp>`

### `testConfig.grepInvert` — Added in: v1.10

Filter to only run tests with a title **not** matching one of the patterns. This is the opposite of `testConfig.grep`.

**Type:** `RegExp | Array<RegExp>`

### `testConfig.ignoreSnapshots` — Added in: v1.26

Whether to skip snapshot expectations, such as `expect(value).toMatchSnapshot()` and `await expect(page).toHaveScreenshot()`. Defaults to `false`.

**Type:** `boolean`

### `testConfig.maxFailures` — Added in: v1.10

The maximum number of test failures for the whole test suite run. After reaching this number, testing will stop and exit with an error. Setting to zero (default) disables this behavior.

**Type:** `number`

### `testConfig.metadata` — Added in: v1.10

Any JSON-serializable metadata that will be put directly to the test report.

**Type:** `any`

### `testConfig.name` — Added in: v1.10

Config name is visible in the report.

**Type:** `string`

### `testConfig.outputDir` — Added in: v1.10

The output directory for files created during test execution. Each test run gets its own directory so they cannot conflict. Defaults to `<package.json-directory>/test-results`.

**Type:** `string`

### `testConfig.preserveOutput` — Added in: v1.10

Whether to preserve test output in the `testConfig.outputDir`. Defaults to `'always'`.

- `'always'` — Preserve output for all tests.
- `'never'` — Do not preserve output for any tests.
- `'failures-only'` — Only preserve output for failed tests.

**Type:** `"always" | "never" | "failures-only"`

### `testConfig.projects` — Added in: v1.10

Playwright Test supports running multiple test projects at the same time. See `TestProject` for more information.

**Type:** `Array<TestProject>`

### `testConfig.quiet` — Added in: v1.10

Whether to suppress stdout and stderr from the tests. Defaults to `false`.

**Type:** `boolean`

### `testConfig.repeatEach` — Added in: v1.10

The number of times to repeat each test, useful for debugging flaky tests. Defaults to `0`.

**Type:** `number`

### `testConfig.reportSlowTests` — Added in: v1.10

Whether to report slow test files. Pass `null` to disable this feature.

**Type:** `Object | null`

- `max` `number` — The maximum number of slow test files to report. Defaults to `5`.
- `threshold` `number` — Test duration in milliseconds that is considered slow. Defaults to `15000`.

### `testConfig.reporter` — Added in: v1.10

The list of reporters to use. Each reporter can be:

- A built-in reporter name like `'html'`, `'dot'`, `'line'`, `'json'`, `'junit'`.
- A module name like `'allure-playwright'`.
- A relative path to a custom reporter, e.g. `'./my-reporter.ts'`.

Each reporter can optionally receive options as a second argument.

**Type:** `string | Array<[string, Object?]> | Object`

### `testConfig.respectGitIgnore` — Added in: v1.43

Whether to use `.gitignore` file when searching for test files. Defaults to `true`.

**Type:** `boolean`

### `testConfig.retries` — Added in: v1.10

The maximum number of retry attempts given to failed tests. Learn more about test retries. Defaults to `0`.

**Type:** `number`

### `testConfig.shard` — Added in: v1.10

Shard tests and execute only the selected shard. Specify in the one-based form like `{ total: 5, current: 2 }`. Learn about parallelism and sharding.

**Type:** `Object | null`

- `current` `number` — The index of the shard to execute, one-based.
- `total` `number` — The total number of shards.

### `testConfig.snapshotPathTemplate` — Added in: v1.26

This option configures a template controlling location of snapshots generated by `expect(page).toHaveScreenshot()`, `expect(locator).toMatchAriaSnapshot()`, and `expect(value).toMatchSnapshot()`.

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

### `testConfig.tag` — Added in: v1.43

Allows filtering tests by tags. Accepts a tag name or a list of tag names. Only tests with at least one of the specified tags will run.

**Type:** `string | Array<string>`

### `testConfig.testDir` — Added in: v1.10

Directory that will be recursively scanned for test files. Defaults to the directory of the configuration file.

**Type:** `string`

### `testConfig.testIgnore` — Added in: v1.10

Files matching one of these patterns are not executed as test files. Matching is performed against the absolute file path. Strings are treated as glob patterns.

**Type:** `string | RegExp | Array<string | RegExp>`

### `testConfig.testMatch` — Added in: v1.10

Only the files matching one of these patterns are executed as test files. Matching is performed against the absolute file path. By default, Playwright looks for files matching `**/*.@(spec|test).?(c|m)[jt]s?(x)`.

**Type:** `string | RegExp | Array<string | RegExp>`

### `testConfig.timeout` — Added in: v1.10

Timeout for each test in milliseconds. Defaults to `30000` (30 seconds).

**Type:** `number`

### `testConfig.tsconfig` — Added in: v1.26

Path to a custom tsconfig file to use when importing TypeScript test files, hooks, fixtures, and page objects. Useful when the `tsconfig.json` in the project is not suitable for test code.

**Type:** `string`

### `testConfig.updateSnapshots` — Added in: v1.10

Whether to update expected snapshots with the actual results produced by the test run. Defaults to `'missing'`.

- `'all'` — All snapshots are updated.
- `'changed'` — Snapshots that do not match are updated.
- `'missing'` — Missing snapshots are created, existing ones are kept.
- `'none'` — No snapshots are updated.

**Type:** `"all" | "changed" | "missing" | "none"`

### `testConfig.updateSourceMethod` — Added in: v1.50

The method to use for updating snapshot sources when `--update-snapshots` is used. Defaults to `'overwrite'`.

- `'3way'` — Use 3-way merge to update snapshots.
- `'overwrite'` — Overwrite existing source code with new expected value.
- `'patch'` — Generate a patch file with the diff.

**Type:** `"3way" | "overwrite" | "patch"`

### `testConfig.use` — Added in: v1.10

Global options for all tests, for example `testOptions.browserName`. Learn more about configuration and see available options.

**Type:** `TestOptions`

### `testConfig.webServer` — Added in: v1.10

Launch a development web server (or multiple) during the tests. See `testConfig.webServer` for more details.

**Type:** `Object | Array<Object>`

- `command` `string` — Shell command to start. For example `npm run start`.
- `url` `string` (optional) — The URL of your HTTP server. Playwright Test will wait for the URL to respond with a 200, 201, 202, 206, or 301/302/303/307/308 redirect before running the tests. Mutually exclusive with `port`.
- `port` `number` (optional) — The port that your HTTP server is expected to appear on. Mutually exclusive with `url`.
- `reuseExistingServer` `boolean` (optional) — If `true`, Playwright Test will reuse an existing server on the `url` when available. If no server is running on that `url`, it will run the command to start a new server. Defaults to `true` in CI environments, and `false` otherwise.
- `cwd` `string` (optional) — Current working directory of the spawned process, default is the directory of the configuration file.
- `env` `Object<string, string>` (optional) — Environment variables to set for the command.
- `stdout` `"pipe" | "ignore"` (optional) — Whether to pipe the stdout of the command to the process stdout. Defaults to `'ignore'`.
- `stderr` `"pipe" | "ignore"` (optional) — Whether to pipe the stderr of the command to the process stderr. Defaults to `'pipe'`.
- `timeout` `number` (optional) — How long to wait for the server to start in milliseconds. Defaults to `60000`.
- `gracefulShutdown` `Object` (optional) — How to gracefully shut down the server.

### `testConfig.workers` — Added in: v1.10

The maximum number of concurrent worker processes to use for parallelizing tests. Can also be set as a percentage of logical CPU cores, e.g. `'50%'`. Playwright Test uses worker processes to run tests. There is always at least one worker process, but more can be used to speed up test execution.

Defaults to one half of the number of logical CPU cores. Learn more about parallelism and sharding with Playwright Test.

**Type:** `number | string`

### `testConfig.snapshotDir` — Added in: v1.10 (Deprecated)

> **Note:** Use `testConfig.snapshotPathTemplate` to configure snapshot paths. This property is deprecated.

The base directory, relative to the config file, for snapshot files created with `toMatchSnapshot`. Defaults to `testConfig.testDir`.

**Type:** `string`
