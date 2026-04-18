# 💻 Playwright — Test CLI

> **Source:** [playwright.dev/docs/test-cli](https://playwright.dev/docs/test-cli)

---

## Command linePlaywright provides a powerful command line interface for running tests, generating code, debugging, and more. The most up to date list of commands and arguments available on the CLI can always be retrieved via npx playwright --help. Essential Commands

## Run Tests

## Run your Playwright tests. Read more about running tests. Syntax

npx playwright test [options] [test-filter...]

## Examples

# Run all testsnpx playwright test# Run a single test filenpx playwright test tests/todo-page.spec.ts# Run a set of test filesnpx playwright test tests/todo-page/ tests/landing-page/# Run tests at a specific linenpx playwright test my-spec.ts:42# Run tests by titlenpx playwright test -g "add a todo item"# Run tests in headed browsersnpx playwright test --headed# Run tests for a specific projectnpx playwright test --project=chromium# Get helpnpx playwright test --help Disable parallelization npx playwright test --workers=1 Run in debug mode with Playwright Inspector npx playwright test --debug

## Run tests in interactive UI mode npx playwright test --ui Common Options

OptionDescription--debugRun tests with Playwright Inspector. Shortcut for PWDEBUG=1 environment variable and --timeout=0 --max-failures=1 --headed --workers=1 options.--headedRun tests in headed browsers (default: headless).-g <grep> or --grep <grep>Only run tests matching this regular expression (default: "._").--project <project-name...>Only run tests from the specified list of projects, supports '_' wildcard (default: run all projects).--uiRun tests in interactive UI mode.-j <workers> or --workers <workers>Number of concurrent workers or percentage of logical CPU cores, use 1 to run in a single worker (default: 50%).

## All Options

OptionDescriptionNon-option argumentsEach argument is treated as a regular expression matched against the full test file path. Only tests from files matching the pattern will be executed. Special symbols like $ or _ should be escaped with \. In many shells/terminals you may need to quote the arguments.-c <file> or --config <file>Configuration file, or a test directory with optional "playwright.config.{m,c}?{js,ts}". Defaults to playwright.config.ts or playwright.config.js in the current directory.--debugRun tests with Playwright Inspector. Shortcut for PWDEBUG=1 environment variable and --timeout=0 --max-failures=1 --headed --workers=1 options.--fail-on-flaky-testsFail if any test is flagged as flaky (default: false).--forbid-onlyFail if test.only is called (default: false). Useful on CI.--fully-parallelRun all tests in parallel (default: false).--global-timeout <timeout>Maximum time this test suite can run in milliseconds (default: unlimited).-g <grep> or --grep <grep>Only run tests matching this regular expression (default: "._").--grep-invert <grep>Only run tests that do not match this regular expression.--headedRun tests in headed browsers (default: headless).--ignore-snapshotsIgnore screenshot and snapshot expectations.-j <workers> or --workers <workers>Number of concurrent workers or percentage of logical CPU cores, use 1 to run in a single worker (default: 50%).--last-failedOnly re-run the failures.--listCollect all the tests and report them, but do not run.--max-failures <N> or -xStop after the first N failures. Passing -x stops after the first failure.--no-depsDo not run project dependencies.--output <dir>Folder for output artifacts (default: "test-results").--only-changed [ref]Only run test files that have been changed between 'HEAD' and 'ref'. Defaults to running all uncommitted changes. Only supports Git.--pass-with-no-testsMakes test run succeed even if no tests were found.--project <project-name...>Only run tests from the specified list of projects, supports '\*' wildcard (default: run all projects).--quietSuppress stdio.--repeat-each <N>Run each test N times (default: 1).--reporter <reporter>Reporter to use, comma-separated, can be "dot", "line", "list", or others (default: "list"). You can also pass a path to a custom reporter file.--retries <retries>Maximum retry count for flaky tests, zero for no retries (default: no retries).--shard <shard>Shard tests and execute only the selected shard, specified in the form "current/all", 1-based, e.g., "3/5".--test-list <file>Path to a file containing a list of tests to run. See test list for details.--test-list-invert <file>Path to a file containing a list of tests to skip. See test list for details.--timeout <timeout>Specify test timeout threshold in milliseconds, zero for unlimited (default: 30 seconds).--trace <mode>Force tracing mode, can be on, off, on-first-retry, on-all-retries, retain-on-failure, retain-on-first-failure, retain-on-failure-and-retries.--tsconfig <path>Path to a single tsconfig applicable to all imported files (default: look up tsconfig for each imported file separately).--uiRun tests in interactive UI mode.--ui-host <host>Host to serve UI on; specifying this option opens UI in a browser tab.--ui-port <port>Port to serve UI on, 0 for any free port; specifying this option opens UI in a browser tab.-u or --update-snapshots [mode]Update snapshots with actual results. Possible values are "all", "changed", "missing", and "none". Running tests without the flag defaults to "missing"; running tests with the flag but without a value defaults to "changed".--update-source-method [mode]Update snapshots with actual results. Possible values are "patch" (default), "3way" and "overwrite". "Patch" creates a unified diff file that can be used to update the source code later. "3way" generates merge conflict markers in source code. "Overwrite" overwrites the source code with the new snapshot values.-x

## Stop after the first failure. Test list

Options --test-list and --test-list-invert accept a path to a test list file. This file should list tests in the format similar to the output produced in --list mode. # This is a test list file.# It can include comments and empty lines.# Run ALL tests in a file:path/to/example.spec.ts# Run all tests in a file for a specific project:[chromium] › path/to/example.spec.ts# Run all tests in a specific group/suite:path/to/example.spec.ts › suite name# Run all tests in a nested group:path/to/example.spec.ts › outer suite › inner suite# Fully qualified test with a project:[chromium] › path/to/example.spec.ts:3:9 › suite › nested suite › example test# This test is included for all projects:path/to/example.spec.ts:3:9 › example test# Use "›" or ">" as a separator:[firefox] > example.spec.ts > suite > nested suite > example test# Line/column numbers are completely ignored, you can omit them.# Three entries below refer to the same test:example.spec.ts › example testexample.spec.ts:15 › example testexample.spec.ts:42:42 › example test

## Show Report

Display

## HTML report from previous test run. Read more about the HTML reporter. Syntax

npx playwright show-report [report] [options]

## Examples

# Show latest test reportnpx playwright show-report# Show a specific reportnpx playwright show-report playwright-report/#

## Show report on custom portnpx playwright show-report --port 8080 Options

OptionDescription--host <host>Host to serve report on (default: localhost)--port <port>

## Port to serve report on (default: 9323) Install Browsers

Install browsers required by

## Playwright. Read more about Playwright's browser support. Syntax

npx playwright install [options] [browser...]npx playwright install-deps [options] [browser...]npx playwright uninstall

## Examples

# Install all browsersnpx playwright install# Install only Chromiumnpx playwright install chromium# Install specific browsersnpx playwright install chromium webkit# Install browsers with dependenciesnpx playwright install --with-deps

## Install Options

OptionDescription--forceForce reinstall of stable browser channels--with-depsInstall browser system dependencies--dry-runDon't perform installation, just print information--only-shellOnly install chromium-headless-shell instead of full

## Chromium--no-shellDon't install chromium-headless-shell Install Deps Options

OptionDescription--dry-run

## Don't perform installation, just print information Generation & Debugging Tools

## Code Generation

Record actions and generate tests for multiple languages.

## Read more about Codegen. Syntax

npx playwright codegen [options] [url]

## Examples

# Start recording with interactive UInpx playwright codegen# Record on specific sitenpx playwright codegen https://playwright.dev# Generate Python codenpx playwright codegen --target=python

## Options

OptionDescription-b, --browser <name>Browser to use: chromium, firefox, or webkit (default: chromium)-o, --output <file>Output file for the generated script--target <language>Language to use: javascript, playwright-test, python, etc.--test-id-attribute <attr>

## Attribute to use for test IDs Trace Viewer

## Analyze and view test traces for debugging. Read more about Trace Viewer. Syntax

npx playwright show-trace [options] [trace]

## Examples

# Open trace viewer without a specific trace (can load traces via UI)npx playwright show-trace# View a trace filenpx playwright show-trace trace.zip#

## View trace from directorynpx playwright show-trace trace/ Options

OptionDescription-b, --browser <name>Browser to use: chromium, firefox, or webkit (default: chromium)-h, --host <host>Host to serve trace on-p, --port <port>

## Port to serve trace on Specialized Commands

## Merge Reports

## Read blob reports and combine them. Read more about merge-reports. Syntax

npx playwright merge-reports [options] <blob dir>

## Examples

#

## Combine test reportsnpx playwright merge-reports ./reports Options

OptionDescription-c, --config <file>Configuration file. Can be used to specify additional configuration for the output report--reporter <reporter>Reporter to use, comma-separated, can be "list", "line", "dot", "json", "junit", "null", "github", "html", "blob" (default: "list")

## Clear Cache

## Clear all Playwright caches. Syntax

npx playwright clear-cache
