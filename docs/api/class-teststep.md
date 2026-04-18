# 📦 Playwright — Teststep

> **Source:** [playwright.dev/docs/api/class-teststep](https://playwright.dev/docs/api/class-teststep)

---

## TestStepRepresents a step in the [TestRun]

title

## Path

Added in: v1.10 testStep.titlePath Returns a list of step titles from the root step down to this step

testStep.titlePath(); Returns Array<string>#

## Properties

annotations​ Added in: v1.51 testStep.annotations The list of annotations applicable to the current test step

testStep.annotations Type Array<Object> type string Annotation type, for example 'skip'. description string (optional) Optional description. location Location (optional)

## Optional location in the source where the annotation is added. attachments

Added in: v1.50 testStep.attachments The list of files or buffers attached in the step execution through testInfo.attach()

testStep.attachments Type Array<Object> name string Attachment name. contentType string Content type of this attachment to properly present in the report, for example 'application/json' or 'image/png'. path string (optional) Optional path on the filesystem to the attached file. body

## Buffer (optional) Optional attachment body used instead of a file. category

Added in: v1.10 testStep.category Step category to differentiate steps with different origin and verbosity. Built-in categories are: expect for expect calls fixture for fixtures setup and teardown hook for hooks initialization and teardown pw:api for Playwright API calls. test.step for test.step API calls. test.attach for test

## Info.attach API calls

testStep.category Type string duration

Added in: v1.10 testStep.duration

## Running time in milliseconds

testStep.duration Type number error

Added in: v1.10 testStep.error Error thrown during the step execution, if any.

## Usage testStep.error Type TestError location

Added in: v1.10 testStep.location Optional location in the source where the step is defined.

## Usage testStep.location Type Location parent

Added in: v1.10 test

## Step.parent Parent step, if any

testStep.parent Type TestStep startTime

Added in: v1.10 testStep.startTime

## Start time of this particular test step

testStep.startTime Type Date steps

Added in: v1.10 testStep.steps List of steps inside this step

testStep.steps Type Array<TestStep> title​ Added in: v1.10 testStep.title User-friendly test step title

testStep.title Type string
