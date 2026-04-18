# 📦 Playwright — Teststepinfo

> **Source:** [playwright.dev/docs/api/class-teststepinfo](https://playwright.dev/docs/api/class-teststepinfo)

---

## TestStepInfoTestStepInfo contains information about currently running test step. It is passed as an argument to the step function. TestStepInfo provides utilities to control test step execution. import { test, expect } from '@playwright/test';test('basic test', async ({ page, browserName }) => { await test.step('check some behavior', async step => { step.skip(browserName === 'webkit', 'The feature is not available in WebKit'); // ... rest of the step code });}); Methods

attach​ Added in: v1.51 testStepInfo.attach Attach a value or a file from disk to the current test step. Some reporters show test step attachments. Either path or body must be specified, but not both. Calling this method will attribute the attachment to the step, as opposed to testInfo.attach() which stores all attachments at the test level. For example, you can attach a screenshot to the test step: import { test, expect } from '@playwright/test';test('basic test', async ({ page }) => { await page.goto('https://playwright.dev'); await test.step('check page rendering', async step => { const screenshot = await page.screenshot(); await step.attach('screenshot', { body: screenshot, contentType: 'image/png' }); });}); Or you can attach files returned by your APIs: import { test, expect } from '@playwright/test';import { download } from './my-custom-helpers';test('basic test', async ({}) => { await test.step('check download behavior', async step => { const tmpPath = await download('a'); await step.attach('downloaded', { path: tmpPath }); });}); notetestStepInfo.attach() automatically takes care of copying attached files to a location that is accessible to reporters. You can safely remove the attachment after awaiting the attach call

await testStepInfo.attach(name);await testStepInfo.attach(name, options); Arguments name string# Attachment name. The name will also be sanitized and used as the prefix of file name when saving to disk. options Object (optional) body string | Buffer (optional)# Attachment body. Mutually exclusive with path. contentType string (optional)# Content type of this attachment to properly present in the report, for example 'application/json' or 'image/png'. If omitted, content type is inferred based on the path, or defaults to text/plain for string attachments and application/octet-stream for Buffer attachments. path string (optional)# Path on the filesystem to the attached file. Mutually exclusive with body

Promise<void># skip()​ Added in: v1.51 testStepInfo.skip() Abort the currently running step and mark it as skipped. Useful for steps that are currently failing and planned for a near-term fix

import { test, expect } from '@playwright/test';test('my test', async ({ page }) => { await test.step('check expectations', async step => { step.skip(); // step body below will not run // ... });}); skip(condition)​ Added in: v1.51 testStepInfo.skip(condition) Conditionally abort the currently running step and mark it as skipped with an optional description. Useful for steps that should not be executed in some cases

import { test, expect } from '@playwright/test';test('my test', async ({ page, isMobile }) => { await test.step('check desktop expectations', async step => { step.skip(isMobile, 'not present in the mobile layout'); // step body below will not run // ... });}); Arguments condition boolean# A skip condition. Test step is skipped when the condition is true. description string (optional)#

## Optional description that will be reflected in a test report

title

## Path

Added in: v1.55 testStepInfo.titlePath The full title path starting with the test file name, including the step titles. See also testInfo.titlePath

testStepInfo.titlePath Type Array<string>
