# 📦 Playwright — Testresult

> **Source:** [playwright.dev/docs/api/class-testresult](https://playwright.dev/docs/api/class-testresult)

---

## TestResultA result of a single TestCase run

annotations​ Added in: v1.52 testResult.annotations The list of annotations applicable to the current test. Includes: annotations defined on the test or suite via test() and test.describe(); annotations implicitly added by methods test.skip(), test.fixme() and test.fail(); annotations appended to testInfo.annotations during the test execution. Annotations are available during test execution through testInfo.annotations. Learn more about test annotations

testResult.annotations Type Array<Object> type string Annotation type, for example 'skip' or 'fail'. description string (optional) Optional description. location Location (optional)

## Optional location in the source where the annotation is added. attachments

Added in: v1.10 testResult.attachments The list of files or buffers attached during the test execution through testInfo.attachments

testResult.attachments Type Array<Object> name string Attachment name. contentType string Content type of this attachment to properly present in the report, for example 'application/json' or 'image/png'. path string (optional) Optional path on the filesystem to the attached file. body

## Buffer (optional) Optional attachment body used instead of a file. duration

Added in: v1.10 testResult.duration

## Running time in milliseconds

testResult.duration Type number error

Added in: v1.10 testResult.error First error thrown during test execution, if any. This is equal to the first element in test

## Result.errors

testResult.error Type TestError errors

Added in: v1.10 testResult.errors Errors thrown during the test execution

testResult.errors Type Array<TestError> parallel

## Index

Added in: v1.30 testResult.parallelIndex The index of the worker between 0 and workers - 1. It is guaranteed that workers running at the same time have a different parallel

## Index

testResult.parallelIndex Type number retry

Added in: v1.10 testResult.retry When test is retried multiple times, each retry attempt is given a sequential number.

## Learn more about test retries

testResult.retry Type number startTime

Added in: v1.10 testResult.startTime Start time of this particular test run.

## Usage testResult.startTime Type Date status

Added in: v1.10 testResult.status The status of this test result. See also testCase.expectedStatus

testResult.status Type "passed" | "failed" | "timedOut" | "skipped" | "interrupted" stderr​ Added in: v1.10 testResult.stderr Anything written to the standard error during the test run

testResult.stderr Type Array<string | Buffer> stdout​ Added in: v1.10 testResult.stdout Anything written to the standard output during the test run

testResult.stdout Type Array<string | Buffer> steps​ Added in: v1.10 testResult.steps List of steps inside this test run

testResult.steps Type Array<TestStep> worker

## Index

Added in: v1.10 testResult.workerIndex Index of the worker where the test was run. If the test was not run a single time, for example when the user interrupted testing, the only result will have a workerIndex equal to -1. Learn more about parallelism and sharding with Playwright Test

testResult.workerIndex Type number
