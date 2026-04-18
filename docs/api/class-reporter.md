# 📦 Playwright — Reporter

> **Source:** [playwright.dev/docs/api/class-reporter](https://playwright.dev/docs/api/class-reporter)

---

## ReporterTest runner notifies the reporter about various events during test execution. All methods of the reporter are optional. You can create a custom reporter by implementing a class with some of the reporter methods. Make sure to export this class as default. TypeScriptJavaScriptmy-awesome-reporter.tsimport type { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult} from '@playwright/test/reporter';class MyReporter implements Reporter { constructor(options: { customOption?: string } = {}) { console.log(`my-awesome-reporter setup with customOption set to ${options.customOption}`); } onBegin(config: FullConfig, suite: Suite) { console.log(`Starting the run with ${suite.allTests().length} tests`); } onTestBegin(test: TestCase) { console.log(`Starting test ${test.title}`); } onTestEnd(test: TestCase, result: TestResult) { console.log(`Finished test ${test.title}: ${result.status}`); } onEnd(result: FullResult) { console.log(`Finished the run: ${result.status}`); }}export default MyReporter;my-awesome-reporter.js// @ts-check/\*_ @implements {import('@playwright/test/reporter').Reporter} _/class MyReporter { constructor(options) { console.log(`my-awesome-reporter setup with customOption set to ${options.customOption}`); } onBegin(config, suite) { console.log(`Starting the run with ${suite.allTests().length} tests`); } onTestBegin(test) { console.log(`Starting test ${test.title}`); } onTestEnd(test, result) { console.log(`Finished test ${test.title}: ${result.status}`); } onEnd(result) { console.log(`Finished the run: ${result.status}`); }}module.exports = MyReporter; Now use this reporter with testConfig.reporter. Learn more about using reporters. playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ reporter: [['./my-awesome-reporter.ts', { customOption: 'some value' }]],}); Here is a typical order of reporter calls: reporter.onBegin() is called once with a root suite that contains all other suites and tests. Learn more about suites hierarchy. reporter.onTestBegin() is called for each test run. It is given a TestCase that is executed, and a TestResult that is almost empty. Test result will be populated while the test runs (for example, with steps and stdio) and will get final status once the test finishes. reporter.onStepBegin() and reporter.onStepEnd() are called for each executed step inside the test. When steps are executed, test run has not finished yet. reporter.onTestEnd() is called when test run has finished. By this time, TestResult is complete and you can use testResult.status, testResult.error and more. reporter.onEnd() is called once after all tests that should run had finished. reporter.onExit() is called immediately before the test runner exits. Additionally, reporter.onStdOut() and reporter.onStdErr() are called when standard output is produced in the worker process, possibly during a test execution, and reporter.onError() is called when something went wrong outside of the test execution. If your custom reporter does not print anything to the terminal, implement reporter.printsToStdio() and return false. This way, Playwright will use one of the standard terminal reporters in addition to your custom reporter to enhance user experience. Reporter errors Playwright will swallow any errors thrown in your custom reporter methods. If you need to detect or fail on reporter errors, you must wrap and handle them yourself. Merged report API notes When merging multiple blob reports via merge-reports CLI command, the same Reporter API is called to produce final reports and all existing reporters should work without any changes. There some subtle differences though which might affect some custom reporters. Projects from different shards are always kept as separate TestProject objects. E.g. if project 'Desktop Chrome' was sharded across 5 machines then there will be 5 instances of projects with the same name in the config passed to reporter.onBegin()

on

## Begin

Added in: v1.10 reporter.onBegin Called once before running tests. All tests have been already discovered and put into a hierarchy of Suites

reporter.onBegin(config, suite); Arguments config FullConfig# Resolved configuration. suite Suite#

## The root suite that contains all projects, files and test cases. onEnd

Added in: v1.10 reporter.onEnd Called after all tests have been run, or testing has been interrupted. Note that this method may return a Promise and Playwright Test will await it. Reporter is allowed to override the status and hence affect the exit code of the test runner

await reporter.onEnd(result); Arguments result Object# status "passed" | "failed" | "timedout" | "interrupted" Test run status. startTime Date Test run start wall time. duration number Test run duration in milliseconds. Result of the full test run, status can be one of: 'passed' - Everything went as expected. 'failed' - Any test has failed. 'timedout' - The testConfig.globalTimeout has been reached. 'interrupted' - Interrupted by the user

Promise<Object># status "passed" | "failed" | "timedout" | "interrupted" (optional) on

## Error

Added in: v1.10 reporter.onError Called on some global error, for example unhandled exception in the worker process

reporter.onError(error); Arguments error TestError#

## The error. onExit

Added in: v1.33 reporter.onExit Called immediately before test runner exists. At this point all the reporters have received the reporter.onEnd() signal, so all the reports should be build. You can run the code that uploads the reports in this hook

await reporter.onExit(); Returns Promise<void># on

## StdErr

Added in: v1.10 reporter.onStdErr Called when something has been written to the standard error in the worker process

reporter.onStdErr(chunk, test, result); Arguments chunk string | Buffer# Output chunk. test void | TestCase# Test that was running. Note that output may happen when no test is running, in which case this will be void. result void | TestResult#

## Result of the test run, this object gets populated while the test runs. onStdOut

Added in: v1.10 reporter.onStdOut Called when something has been written to the standard output in the worker process

reporter.onStdOut(chunk, test, result); Arguments chunk string | Buffer# Output chunk. test void | TestCase# Test that was running. Note that output may happen when no test is running, in which case this will be void. result void | TestResult# Result of the test run, this object gets populated while the test runs. on

## StepBegin

Added in: v1.10 reporter.onStepBegin Called when a test step started in the worker process

reporter.onStepBegin(test, result, step); Arguments test TestCase# Test that the step belongs to. result TestResult# Result of the test run, this object gets populated while the test runs. step TestStep#

## Test step instance that has started. onStepEnd

Added in: v1.10 reporter.onStepEnd Called when a test step finished in the worker process

reporter.onStepEnd(test, result, step); Arguments test TestCase# Test that the step belongs to. result TestResult# Result of the test run. step TestStep#

## Test step instance that has finished. onTestBegin

Added in: v1.10 reporter.onTestBegin Called after a test has been started in the worker process

reporter.onTestBegin(test, result); Arguments test TestCase# Test that has been started. result TestResult#

## Result of the test run, this object gets populated while the test runs. onTestEnd

Added in: v1.10 reporter.onTestEnd Called after a test has been finished in the worker process

reporter.onTestEnd(test, result); Arguments test TestCase# Test that has been finished. result TestResult#

## Result of the test run. printsToStdio

Added in: v1.10 reporter.printsToStdio Whether this reporter uses stdio for reporting. When it does not, Playwright Test could add some output to enhance user experience. If your reporter does not print to the terminal, it is strongly recommended to return false

reporter.printsToStdio(); Returns boolean#
