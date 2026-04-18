# 📦 Playwright — Testcase

> **Source:** [playwright.dev/docs/api/class-testcase](https://playwright.dev/docs/api/class-testcase)

---

## TestCaseTestCase corresponds to every test() call in a test file. When a single test() is running in multiple projects or repeated multiple times, it will have multiple TestCase objects in corresponding projects' suites

ok​ Added in: v1.10 testCase.ok Whether the test is considered running fine. Non-ok tests fail the test run with non-zero exit code

testCase.ok(); Returns boolean# outcome​ Added in: v1.10 testCase.outcome Testing outcome for this test. Note that outcome is not the same as testResult.status: Test that is expected to fail and actually fails is 'expected'. Test that passes on a second retry is 'flaky'

testCase.outcome(); Returns "skipped" | "expected" | "unexpected" | "flaky"# title

## Path

Added in: v1.10 testCase.titlePath Returns a list of titles from the root down to this test

testCase.titlePath(); Returns Array<string>#

## Properties

annotations​ Added in: v1.10 testCase.annotations testResult.annotations of the last test run

testCase.annotations Type Array<Object> type string Annotation type, for example 'skip' or 'fail'. description string (optional) Optional description. location Location (optional)

## Optional location in the source where the annotation is added. expectedStatus

Added in: v1.10 testCase.expectedStatus Expected test status. Tests marked as test.skip() or test.fixme() are expected to be 'skipped'. Tests marked as test.fail() are expected to be 'failed'. Other tests are expected to be 'passed'. See also testResult.status for the actual status

testCase.expectedStatus Type "passed" | "failed" | "timedOut" | "skipped" | "interrupted" id​ Added in: v1.25 testCase.id A test ID that is computed based on the test file name, test title and project name. The

## ID is unique within Playwright session

testCase.id Type string location

Added in: v1.10 testCase.location Location in the source where the test is defined.

## Usage testCase.location Type Location parent

Added in: v1.10 testCase.parent

## Suite this test case belongs to

testCase.parent Type Suite repeatEachIndex

Added in: v1.10 testCase.repeatEachIndex Contains the repeat index when running in "repeat each" mode. This mode is enabled by passing --repeat-each to the command line.

## Usage testCase.repeatEachIndex Type number results

Added in: v1.10 testCase.results Results for each run of this test

testCase.results Type Array<TestResult> retries​ Added in: v1.10 testCase.retries The maximum number of retries given to this test in the configuration.

## Learn more about test retries

testCase.retries Type number tags

Added in: v1.42 testCase.tags The list of tags defined on the test or suite via test() or test.describe(), as well as @-tokens extracted from test and suite titles. Learn more about test tags

testCase.tags Type Array<string> timeout​ Added in: v1.10 testCase.timeout The timeout given to the test. Affected by testConfig.timeout, testProject.timeout, test.setTimeout(), test.slow() and test

## Info.setTimeout()

testCase.timeout Type number title

Added in: v1.10 testCase.title

## Test title as passed to the test() call

testCase.title Type string type

Added in: v1.44 testCase.type Returns "test". Useful for detecting test cases in suite.entries()

testCase.type Type "test"
