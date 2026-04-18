# 📰 Playwright — Release Notes

> **Source:** [playwright.dev/docs/release-notes](https://playwright.dev/docs/release-notes)

---

## Release notesVersion 1.59

🎬

## Screencast

New page.screencast API provides a unified interface for capturing page content with: Screencast recordings Action annotations Visual overlays Real-time frame capture Agentic video receipts Screencast recording — record video with precise start/stop control, as an alternative to the recordVideo option: await page.screencast.start({ path: 'video.webm' });// ... perform actions ...await page.screencast.stop(); Action annotations — enable built-in visual annotations that highlight interacted elements and display action titles during recording: await page.screencast.showActions({ position: 'top-right' }); screencast.showActions() accepts position ('top-left', 'top', 'top-right', 'bottom-left', 'bottom', 'bottom-right'), duration (ms per annotation), and fontSize (px). Returns a disposable to stop showing actions. Action annotations can also be enabled in test fixtures via the video option: // playwright.config.tsexport default defineConfig({ use: { video: { mode: 'on', show: { actions: { position: 'top-left' }, test: { position: 'top-right' }, }, }, },}); Visual overlays — add chapter titles and custom HTML overlays on top of the page for richer narration: await page.screencast.showChapter('Adding TODOs', { description: 'Type and press enter for each TODO', duration: 1000,});await page.screencast.showOverlay('<div style="color: red">Recording</div>'); Real-time frame capture — stream JPEG-encoded frames for custom processing like thumbnails, live previews, AI vision, and more: await page.screencast.start({ onFrame: ({ data }) => sendToVisionModel(data), size: { width: 800, height: 600 },}); Agentic video receipts — coding agents can produce video evidence of their work. After completing a task, an agent can record a walkthrough video with rich annotations for human review: await page.screencast.start({ path: 'receipt.webm' });await page.screencast.showActions({ position: 'top-right' });await page.screencast.showChapter('Verifying checkout flow', { description: 'Added coupon code support per ticket #1234',});// Agent performs the verification steps...await page.locator('#coupon').fill('SAVE20');await page.locator('#apply-coupon').click();await expect(page.locator('.discount')).toContainText('20%');await page.screencast.showChapter('Done', { description: 'Coupon applied, discount reflected in total',});await page.screencast.stop(); The resulting video serves as a receipt: chapter titles provide context, action annotations highlight each interaction, and the visual walkthrough is faster to review than text logs. 🔗

## Interoperability

New browser.bind() API makes a launched browser available for playwright-cli, @playwright/mcp, and other clients to connect to. Bind a browser — start a browser and bind it so others can connect: const { endpoint } = await browser.bind('my-session', { workspaceDir: '/my/project',}); Connect from playwright-cli — connect to the running browser from your favorite coding agent. playwright-cli attach my-sessionplaywright-cli -s my-session snapshot Connect from @playwright/mcp — or point your MCP server to the running browser. @playwright/mcp --endpoint=my-session Connect from a Playwright client — use API to connect to the browser. Multiple clients at a time are supported! const browser = await chromium.connect(endpoint); Pass host and port options to bind over WebSocket instead of a named pipe: const { endpoint } = await browser.bind('my-session', { host: 'localhost', port: 0,});// endpoint is a ws:// URL Call browser.unbind() to stop accepting new connections. 📊

## Observability

Run playwright-cli show to open the Dashboard that lists all the bound browsers, their statuses, and allows interacting with them: See what your agent is doing on the background browsers Click into the sessions for manual interventions Open DevTools to inspect pages from the background browsers. playwright-cli binds all of its browsers automatically, so you can see what your agents are doing. Pass PLAYWRIGHT_DASHBOARD=1 env variable to see all @playwright/test browsers in the dashboard. 🐛

## CLI debugger for agents

Coding agents can now run npx playwright test --debug=cli to attach and debug tests over playwright-cli — perfect for automatically fixing tests in agentic workflows: $ npx playwright test --debug=cli### Debugging Instructions- Run "playwright-cli attach tw-87b59e" to attach to this test$ playwright-cli attach tw-87b59e### Session `tw-87b59e` created, attached to `tw-87b59e`.Run commands with: playwright-cli --session=tw-87b59e <command>### Paused- Navigate to "/" at output/tests/example.spec.ts:4$ playwright-cli --session tw-87b59e step-over### Page- Page URL: https://playwright.dev/- Page Title: Fast and reliable end-to-end testing for modern web apps | Playwright### Paused- Expect "toHaveTitle" at output/tests/example.spec.ts:7 📋

## CLI trace analysis for agents

Coding agents can run npx playwright trace to explore Playwright Trace and understand failing or flaky tests from the command line: $ npx playwright trace open test-results/example-has-title-chromium/trace.zip Title: example.spec.ts:3 › has title$ npx playwright trace actions --grep="expect" # Time Action Duration ──── ───────── ─────────────────────────────────────────────────────── ──────── 9. 0:00.859 Expect "toHaveTitle" 5.1s ✗$ npx playwright trace action 9 Expect "toHaveTitle" Error: expect(page).toHaveTitle(expected) failed Expected pattern: /Wrong Title/ Received string: "Fast and reliable end-to-end testing for modern web apps | Playwright" Timeout: 5000ms Snapshots available: before, after usage: npx playwright trace snapshot 9 --name <before|after>$ npx playwright trace snapshot 9 --name after### Page- Page Title: Fast and reliable end-to-end testing for modern web apps | Playwright$ npx playwright trace close ♻️ await using​ Many APIs now return async disposables, enabling the await using syntax for automatic cleanup: await using page = await context.newPage();{ await using route = await page.route('\*_/_', route => route.continue()); await using script = await page.addInitScript('console.log("init script here")'); await page.goto('https://playwright.dev'); // do something}// route and init script have been removed at this point 🔍

## Snapshots and Locators

Method page.ariaSnapshot() to capture the aria snapshot of the page — equivalent to page.locator('body').ariaSnapshot(). Options depth and mode in locator.ariaSnapshot(). Method locator.normalize() converts a locator to follow best practices like test ids and aria roles. Method page.pickLocator() enters an interactive mode where hovering over elements highlights them and shows the corresponding locator. Click an element to get its

## Locator back. Use page.cancelPickLocator() to cancel. New APIs

## Screencast

page.screencast provides video recording, real-time frame streaming, and overlay management. Methods screencast.start() and screencast.stop() for recording and frame capture. Methods screencast.showActions() and screencast.hideActions() for action annotations. Methods screencast.showChapter() and screencast.showOverlay() for visual overlays. Methods screencast.showOverlays() and screencast.hide

## Overlays() for overlay visibility control. Storage, Console and Errors

Method browserContext.setStorageState() clears existing cookies, local storage, and IndexedDB for all origins and sets a new storage state — no need to create a new context. Methods page.clearConsoleMessages() and page.clearPageErrors() to clear stored messages and errors. Option filter in page.consoleMessages() and page.pageErrors() controls which messages are returned.

## Method consoleMessage.timestamp(). Miscellaneous

browserContext.debugger provides programmatic control over the Playwright debugger. Method browserContext.isClosed(). Method request.existingResponse() returns the response without waiting. Method response.httpVersion() returns the HTTP version used by the response. Events cdpSession.on('event') and cdpSession.on('close') for CDP sessions. Option live in tracing.start() for real-time trace updates. Option artifactsDir in browserType.launch() to configure the artifacts directory. 🛠️

## Other improvements

UI Mode has an option to only show tests affected by source changes. UI Mode and Trace Viewer have improved action filtering. HTML Reporter shows the list of runs from the same worker. HTML Reporter allows filtering test steps for quick search. New trace mode 'retain-on-failure-and-retries' records a trace for each test run and retains all traces when an attempt fails — great for comparing a passing trace with a failing one from a flaky test. Breaking Changes ⚠️​ Removed macOS 14 support for WebKit. We recommend upgrading your macOS version, or keeping an older Playwright version. Removed @playwright/experimental-ct-svelte package.

## Browser Versions

Chromium 147.0.7727.15 Mozilla Firefox 148.0.2 WebKit 26.4 This version was also tested against the following stable channels:

## Google Chrome 146 Microsoft Edge 146 Version 1.58

## Timeline

If you're using merged reports, the HTML report

## Speedboard tab now shows the Timeline: UI Mode and Trace Viewer Improvements

New 'system' theme option follows your OS dark/light mode preference Search functionality (Cmd/Ctrl+F) is now available in code editors Network details panel has been reorganized for better usability JSON responses are now automatically formatted for readability Thanks to @cpAdm for contributing these improvements!

## Miscellaneous

browserType.connectOverCDP() now accepts an isLocal option. When set to true, it tells Playwright that it runs on the same host as the CDP server, enabling file system optimizations. Breaking Changes ⚠️​ Removed \_react and \_vue selectors. See locators guide for alternatives. Removed :light selector engine suffix. Use standard CSS selectors instead. Option devtools from browserType.launch() has been removed. Use args: ['--auto-open-devtools-for-tabs'] instead. Removed macOS 13 support for WebKit. We recommend to upgrade your mac

## OS version, or keep using an older Playwright version. Browser Versions

Chromium 145.0.7632.6 Mozilla Firefox 146.0.1 WebKit 26.0 This version was also tested against the following stable channels:

## Google Chrome 144 Microsoft Edge 144 Version 1.57

## Speedboard

In HTML reporter, there's a new tab we call "Speedboard": It shows you all your executed tests sorted by slowness, and can help you understand where your test suite is taking longer than expected. Take a look at yours - maybe you'll find some tests that are spending a longer time waiting than they should!

## Chrome for Testing

Playwright now runs on Chrome for Testing builds rather than Chromium. Headed mode uses chrome; headless mode uses chrome-headless-shell. Existing tests should continue to pass after upgrading to v1.57. We're expecting no functional changes to come from this switch. The biggest change is the new icon and title in your toolbar. If you still see an unexpected behaviour change, please file an issue. On

## Arm64 Linux, Playwright continues to use Chromium. Waiting for webserver output

testConfig.webServer added a wait field. Pass a regular expression, and Playwright will wait until the webserver logs match it. import { defineConfig } from '@playwright/test';export default defineConfig({ webServer: { command: 'npm run start', wait: { stdout: /Listening on port (?<my_server_port>\d+)/ }, },}); If you include a named capture group into the expression, then Playwright will provide the capture group contents via environment variables: import { test, expect } from '@playwright/test';test.use({ baseURL: `http://localhost:${process.env.MY_SERVER_PORT ?? 3000}` });test('homepage', async ({ page }) => { await page.goto('/');}); This is not just useful for capturing varying ports of dev servers. You can also use it to wait for readiness of a service that doesn't expose an HTTP readiness check, but instead prints a readiness message to stdout or stderr.

## Breaking Change

After 3 years of being deprecated, we removed page.accessibility from our API. Please use other libraries such as Axe if you need to test page accessibility.

## See our Node.js guide for integration with Axe. New APIs

New property testConfig.tag adds a tag to all tests in this run. This is useful when using merge-reports. worker.on('console') event is emitted when JavaScript within the worker calls one of console API methods, e.g. console.log or console.dir. worker.waitForEvent() can be used to wait for it. locator.description() returns locator description previously set with locator.describe(), and locator.toString() now uses the description when available. New option steps in locator.click() and locator.dragTo() that configures the number of mousemove events emitted while moving the mouse pointer to the target element. Network requests issued by Service Workers are now reported and can be routed through the BrowserContext, only in Chromium. You can opt out using the PLAYWRIGHT*DISABLE_SERVICE_WORKER_NETWORK environment variable. Console messages from Service Workers are dispatched through worker.on('console'). You can opt out of this using the PLAYWRIGHT_DISABLE_SERVICE_WORKER*

## CONSOLE environment variable. Miscellaneous

Playwright docker images switched from

## Node.js v22 to Node.js v24 LTS. Browser Versions

## Chromium 143.0.7499.4 Mozilla Firefox 144.0.2 WebKit 26.0 Version 1.56

## Playwright Test Agents

Introducing Playwright Test Agents, three custom agent definitions designed to guide LLMs through the core process of building a Playwright test: 🎭 planner explores the app and produces a Markdown test plan 🎭 generator transforms the Markdown plan into the Playwright Test files 🎭 healer executes the test suite and automatically repairs failing tests Run npx playwright init-agents with your client of choice to generate the latest agent definitions: # Generate agent files for each agentic loop# Visual Studio Codenpx playwright init-agents --loop=vscode# Claude Codenpx playwright init-agents --loop=claude# opencodenpx playwright init-agents --loop=opencode

## Learn more about Playwright Test Agents New APIs

New methods page.consoleMessages() and page.pageErrors() for retrieving the most recent console messages from the page New method page.requests() for retrieving the most recent network requests from the page Added --test-list and --test-list-invert to allow manual specification of specific tests from a file

## UI Mode and HTML Reporter

Added option to 'html' reporter to disable the "Copy prompt" button Added option to 'html' reporter and UI Mode to merge files, collapsing test and describe blocks into a single unified list Added option to UI Mode mirroring the --update-snapshots options

## Added option to UI Mode to run only a single worker at a time Breaking Changes

Event browserContext.on('backgroundpage') has been deprecated and will not be emitted.

## Method browserContext.backgroundPages() will return an empty list Miscellaneous

Aria snapshots render and compare input placeholder Added environment variable PLAYWRIGHT_TEST to Playwright worker processes to allow discriminating on testing status

## Browser Versions

## Chromium 141.0.7390.37 Mozilla Firefox 142.0.1 WebKit 26.0 Version 1.55

## New APIs

New Property testStepInfo.titlePath Returns the full title path starting from the test file, including test and step titles.

## Codegen

Automatic toBeVisible() assertions: Codegen can now generate automatic toBeVisible() assertions for common UI interactions.

## This feature can be enabled in the Codegen settings UI. Breaking Changes

⚠️

## Dropped support for Chromium extension manifest v2. Miscellaneous

## Added support for Debian 13 "Trixie". Browser Versions

Chromium 140.0.7339.16 Mozilla Firefox 141.0 WebKit 26.0 This version was also tested against the following stable channels:

## Google Chrome 139 Microsoft Edge 139 Version 1.54

## Highlights

New cookie property partitionKey in browserContext.cookies() and browserContext.addCookies(). This property allows to save and restore partitioned cookies. See CHIPS MDN article for more information. Note that browsers have different support and defaults for cookie partitioning. New option noSnippets to disable code snippets in the html report. import { defineConfig } from '@playwright/test';export default defineConfig({ reporter: [['html', { noSnippets: true }]]}); New property location in test annotations, for example in testResult.annotations and testInfo.annotations. It shows where the annotation like test.skip or test.fixme was added.

## Command Line

New option --user-data-dir in multiple commands. You can specify the same user data dir to reuse browsing state, like authentication, between sessions. npx playwright codegen --user-data-dir=./user-data Option -gv has been removed from the npx playwright test command. Use --grep-invert instead. npx playwright open does not open the test recorder anymore.

## Use npx playwright codegen instead. Miscellaneous

Support for Node.js 16 has been removed. Support for Node.js 18 has been deprecated, and will be removed in the future.

## Browser Versions

Chromium 139.0.7258.5 Mozilla Firefox 140.0.2 WebKit 26.0 This version was also tested against the following stable channels:

## Google Chrome 140 Microsoft Edge 140 Version 1.53

## Trace Viewer and HTML Reporter Updates

New Steps in Trace Viewer and HTML reporter: New option in 'html' reporter to set the title of a specific test run: import { defineConfig } from '@playwright/test';export default defineConfig({ reporter: [['html', { title: 'Custom test run #1028' }]]});

## Miscellaneous

New option kind in testInfo.snapshotPath() controls which snapshot path template is used. New method locator.describe() to describe a locator. Used for trace viewer and reports. const button = page.getByTestId('btn-sub').describe('Subscribe button');await button.click(); npx playwright install --list will now list all installed browsers, versions and locations.

## Browser Versions

Chromium 138.0.7204.4 Mozilla Firefox 139.0 WebKit 18.5 This version was also tested against the following stable channels:

## Google Chrome 137 Microsoft Edge 137 Version 1.52

## Highlights

New method expect(locator).toContainClass() to ergonomically assert individual class names on the element. await expect(page.getByRole('listitem', { name: 'Ship v1.52' })).toContainClass('done'); Aria Snapshots got two new properties: /children for strict matching and /url for links. await expect(locator).toMatchAriaSnapshot(` - list - /children: equal - listitem: Feature A - listitem: - link "Feature B": - /url: "https://playwright.dev"`);

## Test Runner

New property testProject.workers allows to specify the number of concurrent worker processes to use for a test project. The global limit of property testConfig.workers still applies. New testConfig.failOnFlakyTests option to fail the test run if any flaky tests are detected, similarly to --fail-on-flaky-tests. This is useful for CI/CD environments where you want to ensure that all tests are stable before deploying. New property test

## Result.annotations contains annotations for each test retry. Miscellaneous

New option maxRedirects in apiRequest.newContext() to control the maximum number of redirects. HTML reporter now supports NOT filtering via !@my-tag or !my-file.spec.ts or !p:my-project.

## Breaking Changes

Glob URL patterns in methods like page.route() do not support ? and [] anymore. We recommend using regular expressions instead. Method route.continue() does not allow to override the Cookie header anymore. If a Cookie header is provided, it will be ignored, and the cookie will be loaded from the browser's cookie store. To set custom cookies, use browserContext.addCookies(). macOS 13 is now deprecated and will no longer receive WebKit updates. Please upgrade to a more recent macOS version to continue benefiting from the latest

## WebKit improvements. Browser Versions

Chromium 136.0.7103.25 Mozilla Firefox 137.0 WebKit 18.4 This version was also tested against the following stable channels:

## Google Chrome 135 Microsoft Edge 135 Version 1.51

## StorageState for indexedDB

New option indexedDB for browserContext.storageState() allows to save and restore IndexedDB contents. Useful when your application uses IndexedDB API to store authentication tokens, like Firebase Authentication. Here is an example following the authentication guide: tests/auth.setup.tsimport { test as setup, expect } from '@playwright/test';import path from 'path';const authFile = path.join(\_\_dirname, '../playwright/.auth/user.json');setup('authenticate', async ({ page }) => { await page.goto('/'); // ... perform authentication steps ... // make sure to save indexedDB await page.context().storageState({ path: authFile, indexedDB: true });});

## Copy as prompt

New "Copy prompt" button on errors in the HTML report, trace viewer and UI mode. Click to copy a pre-filled LLM prompt that contains the error message and useful context for fixing the error.

## Filter visible elements

New option visible for locator.filter() allows matching only visible elements. example.spec.tstest('some test', async ({ page }) => { // Ignore invisible todo items. const todoItems = page.getByTestId('todo-item').filter({ visible: true }); // Check there are exactly 3 visible ones. await expect(todoItems).toHaveCount(3);});

## Git information in HTML report

Set option testConfig.captureGitInfo to capture git information into testConfig.metadata. playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ captureGitInfo: { commit: true, diff: true }});

## HTML report will show this information when available: Test Step improvements

A new TestStepInfo object is now available in test steps. You can add step attachments or skip the step under some conditions. test('some test', async ({ page, isMobile }) => { // Note the new "step" argument: await test.step('here is my step', async step => { step.skip(isMobile, 'not relevant on mobile layouts'); // ... await step.attach('my attachment', { body: 'some text' }); // ... });});

## Miscellaneous

New option contrast for methods page.emulateMedia() and browser.newContext() allows to emulate the prefers-contrast media feature. New option failOnStatusCode makes all fetch requests made through the APIRequestContext throw on response codes other than 2xx and 3xx.

## Assertion expect(page).toHaveURL() now supports a predicate. Browser Versions

Chromium 134.0.6998.35 Mozilla Firefox 135.0 WebKit 18.4 This version was also tested against the following stable channels:

## Google Chrome 133 Microsoft Edge 133 Version 1.50

## Test runner

New option timeout allows specifying a maximum run time for an individual test step. A timed-out step will fail the execution of the test. test('some test', async ({ page }) => { await test.step('a step', async () => { // This step can time out separately from the test }, { timeout: 1000 });}); New method test.step.skip() to disable execution of a test step. test('some test', async ({ page }) => { await test.step('before running step', async () => { // Normal step }); await test.step.skip('not yet ready', async () => { // This step is skipped }); await test.step('after running step', async () => { // This step still runs even though the previous one was skipped });}); Expanded expect(locator).toMatchAriaSnapshot() to allow storing of aria snapshots in separate YAML files. Added method expect(locator).toHaveAccessibleErrorMessage() to assert the Locator points to an element with a given aria errormessage. Option testConfig.updateSnapshots added the configuration enum changed. changed updates only the snapshots that have changed, whereas all now updates all snapshots, regardless of whether there are any differences. New option testConfig.updateSourceMethod defines the way source code is updated when testConfig.updateSnapshots is configured. Added overwrite and 3-way modes that write the changes into source code, on top of existing patch mode that creates a patch file. npx playwright test --update-snapshots=changed --update-source-method=3way Option testConfig.webServer added a gracefulShutdown field for specifying a process kill signal other than the default SIGKILL. Exposed testStep.attachments from the reporter API to allow retrieval of all attachments created by that step. New option pathTemplate for toHaveScreenshot and to

## MatchAriaSnapshot assertions in the testConfig.expect configuration. UI updates

Updated default HTML reporter to improve display of attachments. New button in Codegen for picking elements to produce aria snapshots. Additional details (such as keys pressed) are now displayed alongside action API calls in traces. Display of canvas content in traces is error-prone. Display is now disabled by default, and can be enabled via the Display canvas content UI setting.

## Call and Network panels now display additional time information. Breaking

expect(locator).toBeEditable() and locator.isEditable() now throw if the target element is not <input>, <select>, or a number of other editable elements. Option testConfig.updateSnapshots now updates all snapshots when set to all, rather than only the failed/changed snapshots. Use the new enum changed to keep the old functionality of only updating the changed snapshots.

## Browser Versions

Chromium 133.0.6943.16 Mozilla Firefox 134.0 WebKit 18.2 This version was also tested against the following stable channels:

## Google Chrome 132 Microsoft Edge 132 Version 1.49

## Aria snapshots

New assertion expect(locator).toMatchAriaSnapshot() verifies page structure by comparing to an expected accessibility tree, represented as YAML. await page.goto('https://playwright.dev');await expect(page.locator('body')).toMatchAriaSnapshot(` - banner: - heading /Playwright enables reliable/ [level=1] - link "Get started" - link "Star microsoft/playwright on GitHub" - main: - img "Browsers (Chromium, Firefox, WebKit)" - heading "Any browser • Any platform • One API"`); You can generate this assertion with Test Generator and update the expected snapshot with --update-snapshots command line flag.

## Learn more in the aria snapshots guide. Test runner

New option testConfig.tsconfig allows to specify a single tsconfig to be used for all tests. New method test.fail.only() to focus on a failing test. Options testConfig.globalSetup and testConfig.globalTeardown now support multiple setups/teardowns. New value 'on-first-failure' for testOptions.screenshot. Added "previous" and "next" buttons to the HTML report to quickly switch between test cases. New properties testInfoError.cause and testError.cause mirroring

## Error.cause. Breaking: chrome and msedge channels switch to new headless mode

This change affects you if you're using one of the following channels in your playwright.config.ts: chrome, chrome-dev, chrome-beta, or chrome-canary msedge, msedge-dev, msedge-beta, or msedge-canary

## What do I need to do?

After updating to Playwright v1.49, run your test suite. If it still passes, you're good to go. If not, you will probably need to update your snapshots, and adapt some of your test code around PDF viewers and extensions. See issue #33566 for more details.

## Other breaking changes

There will be no more updates for WebKit on Ubuntu 20.04 and Debian 11. We recommend updating your OS to a later version. Package @playwright/experimental-ct-vue2 will no longer be updated. Package @playwright/experimental-ct-solid will no longer be updated.

## Try new Chromium headless

You can opt into the new headless mode by using 'chromium' channel. As official Chrome documentation puts it: New Headless on the other hand is the real Chrome browser, and is thus more authentic, reliable, and offers more features. This makes it more suitable for high-accuracy end-to-end web app testing or browser extension testing. See issue #33566 for the list of possible breakages you could encounter and more details on Chromium headless. Please file an issue if you see any problems after opting in. import { defineConfig, devices } from '@playwright/test';export default defineConfig({ projects: [ { name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chromium' }, }, ],});

## Miscellaneous

<canvas> elements inside a snapshot now draw a preview. New method tracing.group() to visually group actions in the trace. Playwright docker images switched from

## Node.js v20 to Node.js v22 LTS. Browser Versions

Chromium 131.0.6778.33 Mozilla Firefox 132.0 WebKit 18.2 This version was also tested against the following stable channels:

## Google Chrome 130 Microsoft Edge 130 Version 1.48

## WebSocket routing

New methods page.routeWebSocket() and browserContext.routeWebSocket() allow to intercept, modify and mock WebSocket connections initiated in the page. Below is a simple example that mocks WebSocket communication by responding to a "request" with a "response". await page.routeWebSocket('/ws', ws => { ws.onMessage(message => { if (message === 'request') ws.send('response'); });});

## See WebSocketRoute for more details. UI updates

New "copy" buttons for annotations and test location in the HTML report. Route method calls like route.fulfill() are not shown in the report and trace viewer anymore. You can see which network requests were routed in the network tab instead. New "Copy as c

## URL" and "Copy as fetch" buttons for requests in the network tab. Miscellaneous

Option form and similar ones now accept FormData. New method page.requestGC() may help detect memory leaks. New option location to pass custom step location. Requests made by APIRequestContext now record detailed timing and security information in the

## HAR. Browser Versions

Chromium 130.0.6723.19 Mozilla Firefox 130.0 WebKit 18.0 This version was also tested against the following stable channels:

## Google Chrome 129 Microsoft Edge 129 Version 1.47

## Network Tab improvements

The Network tab in the UI mode and trace viewer has several nice improvements: filtering by asset type and URL better display of query string parameters preview of font assets --tsconfig

## CLI option

By default, Playwright will look up the closest tsconfig for each imported file using a heuristic. You can now specify a single tsconfig file in the command line, and Playwright will use it for all imported files, not only test files: # Pass a specific tsconfignpx playwright test --tsconfig tsconfig.test.json

## APIRequestContext now accepts URLSearchParams and string as query parameters

You can now pass URLSearchParams and string as query parameters to APIRequestContext: test('query params', async ({ request }) => { const searchParams = new URLSearchParams(); searchParams.set('userId', 1); const response = await request.get( 'https://jsonplaceholder.typicode.com/posts', { params: searchParams // or as a string: 'userId=1' } ); // ...});

## Miscellaneous

The mcr.microsoft.com/playwright:v1.47.0 now serves a Playwright image based on Ubuntu 24.04 Noble. To use the 22.04 jammy-based image, please use mcr.microsoft.com/playwright:v1.47.0-jammy instead. New options behavior, behavior and behavior to wait for ongoing listeners to complete. TLS client certificates can now be passed from memory by passing clientCertificates.cert and clientCertificates.key as buffers instead of file paths. Attachments with a text/html content type can now be opened in a new tab in the HTML report. This is useful for including third-party reports or other HTML content in the Playwright test report and distributing it to your team. noWaitAfter option in locator.selectOption() was deprecated. We've seen reports of WebGL in Webkit misbehaving on GitHub Actions macos-13.

## We recommend upgrading GitHub Actions to macos-14. Browser Versions

Chromium 129.0.6668.29 Mozilla Firefox 130.0 WebKit 18.0 This version was also tested against the following stable channels:

## Google Chrome 128 Microsoft Edge 128 Version 1.46

## TLS Client Certificates

Playwright now allows you to supply client-side certificates, so that server can verify them, as specified by TLS Client Authentication. The following snippet sets up a client certificate for https://example.com: import { defineConfig } from '@playwright/test';export default defineConfig({ // ... use: { clientCertificates: [{ origin: 'https://example.com', certPath: './cert.pem', keyPath: './key.pem', passphrase: 'mysecretpassword', }], }, // ...}); You can also provide client certificates to a particular test project or as a parameter of browser.new

## Context() and apiRequest.newContext(). --only-changed cli option

New CLI option --only-changed will only run test files that have been changed since the last git commit or from a specific git "ref". This will also run all test files that import any changed files. # Only run test files with uncommitted changesnpx playwright test --only-changed# Only run test files changed relative to the "main" branchnpx playwright test --only-changed=main

## Component Testing: New router fixture

This release introduces an experimental router fixture to intercept and handle network requests in component testing. There are two ways to use the router fixture: Call router.route(url, handler) that behaves similarly to page.route(). Call router.use(handlers) and pass MSW library request handlers to it. Here is an example of reusing your existing MSW handlers in the test. import { handlers } from '@src/mocks/handlers';test.beforeEach(async ({ router }) => { // install common handlers before each test await router.use(...handlers);});test('example test', async ({ mount }) => { // test as usual, your handlers are active // ...});

## This fixture is only available in component tests. UI Mode / Trace Viewer Updates

Test annotations are now shown in UI mode. Content of text attachments is now rendered inline in the attachments pane. New setting to show/hide routing actions like route.continue(). Request method and status are shown in the network details tab. New button to copy source file location to clipboard.

## Metadata pane now displays the baseURL. Miscellaneous

New maxRetries option in apiRequestContext.fetch() which retries on the ECONNRESET network error. New option to box a fixture to minimize the fixture exposure in test reports and error messages. New option to provide a custom fixture title to be used in test reports and error messages.

## Browser Versions

Chromium 128.0.6613.18 Mozilla Firefox 128.0 WebKit 18.0 This version was also tested against the following stable channels:

## Google Chrome 127 Microsoft Edge 127 Version 1.45

## Clock

Utilizing the new Clock API allows to manipulate and control time within tests to verify time-related behavior. This API covers many common scenarios, including: testing with predefined time; keeping consistent time and timers; monitoring inactivity; ticking through time manually. // Initialize clock and let the page load naturally.await page.clock.install({ time: new Date('2024-02-02T08:00:00') });await page.goto('http://localhost:3333');// Pretend that the user closed the laptop lid and opened it again at 10am,// Pause the time once reached that point.await page.clock.pauseAt(new Date('2024-02-02T10:00:00'));// Assert the page state.await expect(page.getByTestId('current-time')).toHaveText('2/2/2024, 10:00:00 AM');// Close the laptop lid again and open it at 10:30am.await page.clock.fastForward('30:00');await expect(page.getByTestId('current-time')).toHaveText('2/2/2024, 10:30:00 AM');

## See the clock guide for more details. Test runner

New CLI option --fail-on-flaky-tests that sets exit code to 1 upon any flaky tests. Note that by default, the test runner exits with code 0 when all failed tests recovered upon a retry. With this option, the test run will fail in such case. New environment variable PLAYWRIGHT_FORCE_TTY controls whether built-in list, line and dot reporters assume a live terminal. For example, this could be useful to disable tty behavior when your CI environment does not handle ANSI control sequences well. Alternatively, you can enable tty behavior even when to live terminal is present, if you plan to post-process the output and handle control sequences. # Avoid TTY features that output ANSI control sequencesPLAYWRIGHT_FORCE_TTY=0 npx playwright test# Enable TTY features, assuming a terminal width 80PLAYWRIGHT_FORCE_TTY=80 npx playwright test New options testConfig.respectGitIgnore and testProject.respectGitIgnore control whether files matching .gitignore patterns are excluded when searching for tests. New property timeout is now available for custom expect matchers. This property takes into account playwright.config.ts and expect.configure(). import { expect as baseExpect } from '@playwright/test';export const expect = baseExpect.extend({ async toHaveAmount(locator: Locator, expected: number, options?: { timeout?: number }) { // When no timeout option is specified, use the config timeout. const timeout = options?.timeout ?? this.timeout; // ... implement the assertion ... },});

## Miscellaneous

Method locator.setInputFiles() now supports uploading a directory for <input type=file webkitdirectory> elements. await page.getByLabel('Upload directory').setInputFiles(path.join(\_\_dirname, 'mydir')); Multiple methods like locator.click() or locator.press() now support a ControlOrMeta modifier key. This key maps to Meta on macOS and maps to Control on Windows and Linux. // Press the common keyboard shortcut Control+S or Meta+S to trigger a "Save" operation.await page.keyboard.press('ControlOrMeta+S'); New property httpCredentials.send in apiRequest.newContext() that allows to either always send the Authorization header or only send it in response to 401 Unauthorized. New option reason in apiRequestContext.dispose() that will be included in the error message of ongoing operations interrupted by the context disposal. New option host in browserType.launchServer() allows to accept websocket connections on a specific address instead of unspecified 0.0.0.0. Playwright now supports Chromium, Firefox and WebKit on Ubuntu 24.04. v1.45 is the last release to receive WebKit update for macOS 12

## Monterey. Please update macOS to keep using the latest WebKit. Browser Versions

Chromium 127.0.6533.5 Mozilla Firefox 127.0 WebKit 17.4 This version was also tested against the following stable channels:

## Google Chrome 126 Microsoft Edge 126 Version 1.44

## New APIs

Accessibility assertions expect(locator).toHaveAccessibleName() checks if the element has the specified accessible name: const locator = page.getByRole('button');await expect(locator).toHaveAccessibleName('Submit'); expect(locator).toHaveAccessibleDescription() checks if the element has the specified accessible description: const locator = page.getByRole('button');await expect(locator).toHaveAccessibleDescription('Upload a photo'); expect(locator).toHaveRole() checks if the element has the specified ARIA role: const locator = page.getByTestId('save-button');await expect(locator).toHaveRole('button'); Locator handler After executing the handler added with page.addLocatorHandler(), Playwright will now wait until the overlay that triggered the handler is not visible anymore. You can opt-out of this behavior with the new noWaitAfter option. You can use new times option in page.addLocatorHandler() to specify maximum number of times the handler should be run. The handler in page.addLocatorHandler() now accepts the locator as argument. New page.removeLocatorHandler() method for removing previously added locator handlers. const locator = page.getByText('This interstitial covers the button');await page.addLocatorHandler(locator, async overlay => { await overlay.locator('#close').click();}, { times: 3, noWaitAfter: true });// Run your tests that can be interrupted by the overlay.// ...await page.removeLocatorHandler(locator); Miscellaneous options multipart option in apiRequestContext.fetch() now accepts FormData and supports repeating fields with the same name. const formData = new FormData();formData.append('file', new File(['let x = 2024;'], 'f1.js', { type: 'text/javascript' }));formData.append('file', new File(['hello'], 'f2.txt', { type: 'text/plain' }));context.request.post('https://example.com/uploadFiles', { multipart: formData}); expect(callback).toPass({ intervals }) can now be configured by expect.toPass.intervals option globally in testConfig.expect or per project in testProject.expect. expect(page).toHaveURL(url) now supports ignoreCase option. testProject.ignoreSnapshots allows to configure per project whether to skip screenshot expectations. Reporter API New method suite.entries() returns child test suites and test cases in their declaration order. suite.type and testCase.type can be used to tell apart test cases and suites in the list. Blob reporter now allows overriding report file path with a single option outputFile. The same option can also be specified as PLAYWRIGHT_BLOB_OUTPUT_FILE environment variable that might be more convenient on CI/CD. JUnit reporter now supports includeProjectInTestName option. Command line --last-failed CLI option to for running only tests that failed in the previous run. First run all tests: $ npx playwright testRunning 103 tests using 5 workers...2 failed [chromium] › my-test.spec.ts:8:5 › two ───────────────────────────────────────────────────────── [chromium] › my-test.spec.ts:13:5 › three ──────────────────────────────────────────────────────101 passed (30.0s) Now fix the failing tests and run Playwright again with --last-failed option: $ npx playwright test --last-failed

## Running 2 tests using 2 workers 2 passed (1.2s) Browser Versions

Chromium 125.0.6422.14 Mozilla Firefox 125.0.1 WebKit 17.4 This version was also tested against the following stable channels:

## Google Chrome 124 Microsoft Edge 124 Version 1.43

## New APIs

Method browserContext.clearCookies() now supports filters to remove only some cookies. // Clear all cookies.await context.clearCookies();// New: clear cookies with a particular name.await context.clearCookies({ name: 'session-id' });// New: clear cookies for a particular domain.await context.clearCookies({ domain: 'my-origin.com' }); New mode retain-on-first-failure for testOptions.trace. In this mode, trace is recorded for the first run of each test, but not for retires. When test run fails, the trace file is retained, otherwise it is removed. import { defineConfig } from '@playwright/test';export default defineConfig({ use: { trace: 'retain-on-first-failure', },}); New property testInfo.tags exposes test tags during test execution. test('example', async ({ page }) => { console.log(test.info().tags);}); New method locator.contentFrame() converts a Locator object to a FrameLocator. This can be useful when you have a Locator object obtained somewhere, and later on would like to interact with the content inside the frame. const locator = page.locator('iframe[name="embedded"]');// ...const frameLocator = locator.contentFrame();await frameLocator.getByRole('button').click(); New method frameLocator.owner() converts a FrameLocator object to a Locator. This can be useful when you have a FrameLocator object obtained somewhere, and later on would like to interact with the iframe element. const frameLocator = page.frameLocator('iframe[name="embedded"]');// ...const locator = frameLocator.owner();await expect(locator).toBeVisible();

## UI Mode Updates

See tags in the test list. Filter by tags by typing @fast or clicking on the tag itself. New shortcuts: "F5" to run tests. "Shift F5" to stop running tests. "Ctrl `" to toggle test output.

## Browser Versions

Chromium 124.0.6367.8 Mozilla Firefox 124.0 WebKit 17.4 This version was also tested against the following stable channels:

## Google Chrome 123 Microsoft Edge 123 Version 1.42

## New APIs

New method page.addLocatorHandler() registers a callback that will be invoked when specified element becomes visible and may block Playwright actions. The callback can get rid of the overlay. Here is an example that closes a cookie dialog when it appears: // Setup the handler.await page.addLocatorHandler( page.getByRole('heading', { name: 'Hej! You are in control of your cookies.' }), async () => { await page.getByRole('button', { name: 'Accept all' }).click(); });// Write the test as usual.await page.goto('https://www.ikea.com/');await page.getByRole('link', { name: 'Collection of blue and white' }).click();await expect(page.getByRole('heading', { name: 'Light and easy' })).toBeVisible(); expect(callback).toPass() timeout can now be configured by expect.toPass.timeout option globally or in project config electronApplication.on('console') event is emitted when Electron main process calls console API methods. electronApp.on('console', async msg => { const values = []; for (const arg of msg.args()) values.push(await arg.jsonValue()); console.log(...values);});await electronApp.evaluate(() => console.log('hello', 5, { foo: 'bar' })); New syntax for adding tags to the tests (@-tokens in the test title are still supported): test('test customer login', { tag: ['@fast', '@login'],}, async ({ page }) => { // ...}); Use --grep command line option to run only tests with certain tags. npx playwright test --grep @fast --project command line flag now supports '*' wildcard: npx playwright test --project='*mobile\*' New syntax for test annotations: test('test full report', { annotation: [ { type: 'issue', description: 'https://github.com/microsoft/playwright/issues/23180' }, { type: 'docs', description: 'https://playwright.dev/docs/test-annotations#tag-tests' }, ],}, async ({ page }) => { // ...}); page.pdf() accepts two new options tagged and outline.

## Announcements

⚠️

## Ubuntu 18 is not supported anymore. Browser Versions

Chromium 123.0.6312.4 Mozilla Firefox 123.0 WebKit 17.4 This version was also tested against the following stable channels:

## Google Chrome 122 Microsoft Edge 123 Version 1.41

## New APIs

New method page.unrouteAll() removes all routes registered by page.route() and page.routeFromHAR(). Optionally allows to wait for ongoing routes to finish, or ignore any errors from them. New method browserContext.unrouteAll() removes all routes registered by browserContext.route() and browserContext.routeFromHAR(). Optionally allows to wait for ongoing routes to finish, or ignore any errors from them. New options style in page.screenshot() and style in locator.screenshot() to add custom CSS to the page before taking a screenshot. New option stylePath for methods expect(page).toHaveScreenshot() and expect(locator).toHaveScreenshot() to apply a custom stylesheet while making the screenshot. New fileName option for

## Blob reporter, to specify the name of the report to be created. Browser Versions

Chromium 121.0.6167.57 Mozilla Firefox 121.0 WebKit 17.4 This version was also tested against the following stable channels:

## Google Chrome 120 Microsoft Edge 120 Version 1.40

## Test Generator Update

New tools to generate assertions: "Assert visibility" tool generates expect(locator).toBeVisible(). "Assert value" tool generates expect(locator).toHaveValue(). "Assert text" tool generates expect(locator).toContainText(). Here is an example of a generated test with assertions: import { test, expect } from '@playwright/test';test('test', async ({ page }) => { await page.goto('https://playwright.dev/'); await page.getByRole('link', { name: 'Get started' }).click(); await expect(page.getByLabel('Breadcrumbs').getByRole('list')).toContainText('Installation'); await expect(page.getByLabel('Search')).toBeVisible(); await page.getByLabel('Search').click(); await page.getByPlaceholder('Search docs').fill('locator'); await expect(page.getByPlaceholder('Search docs')).toHaveValue('locator');});

## New APIs

Options reason in page.close(), reason in browserContext.close() and reason in browser.close(). Close reason is reported for all operations interrupted by the closure.

## Option firefoxUserPrefs in browserType.launchPersistentContext(). Other Changes

Methods download.path() and download.createReadStream() throw an error for failed and cancelled downloads.

## Playwright docker image now comes with Node.js v20. Browser Versions

Chromium 120.0.6099.28 Mozilla Firefox 119.0 WebKit 17.4 This version was also tested against the following stable channels:

## Google Chrome 119 Microsoft Edge 119 Version 1.39

## Add custom matchers to your expect

You can extend Playwright assertions by providing custom matchers. These matchers will be available on the expect object. test.spec.tsimport { expect as baseExpect } from '@playwright/test';export const expect = baseExpect.extend({ async toHaveAmount(locator: Locator, expected: number, options?: { timeout?: number }) { // ... see documentation for how to write matchers. },});test('pass', async ({ page }) => { await expect(page.getByTestId('cart')).toHaveAmount(5);});

## See the documentation for a full example. Merge test fixtures

You can now merge test fixtures from multiple files or modules: fixtures.tsimport { mergeTests } from '@playwright/test';import { test as dbTest } from 'database-test-utils';import { test as a11yTest } from 'a11y-test-utils';export const test = mergeTests(dbTest, a11yTest); test.spec.tsimport { test } from './fixtures';test('passes', async ({ database, page, a11y }) => { // use database and a11y fixtures.});

## Merge custom expect matchers

You can now merge custom expect matchers from multiple files or modules: fixtures.tsimport { mergeTests, mergeExpects } from '@playwright/test';import { test as dbTest, expect as dbExpect } from 'database-test-utils';import { test as a11yTest, expect as a11yExpect } from 'a11y-test-utils';export const test = mergeTests(dbTest, a11yTest);export const expect = mergeExpects(dbExpect, a11yExpect); test.spec.tsimport { test, expect } from './fixtures';test('passes', async ({ page, database }) => { await expect(database).toHaveDatabaseUser('admin'); await expect(page).toPassA11yAudit();});

## Hide implementation details: box test steps

You can mark a test.step() as "boxed" so that errors inside it point to the step call site. async function login(page) { await test.step('login', async () => { // ... }, { box: true }); // Note the "box" option here.} Error: Timed out 5000ms waiting for expect(locator).toBeVisible() ... error details omitted ... 14 | await page.goto('https://github.com/login');> 15 | await login(page); | ^ 16 | });

## See test.step() documentation for a full example. New APIs

expect(locator).to

## HaveAttribute() Browser Versions

Chromium 119.0.6045.9 Mozilla Firefox 118.0.1 WebKit 17.4 This version was also tested against the following stable channels:

## Google Chrome 118 Microsoft Edge 118 Version 1.38

## UI Mode Updates

## Zoom into time range. Network panel redesign. New APIs

browserContext.on('weberror') locator.pressSequentially()

## The reporter.onEnd() now reports startTime and total run duration. Deprecations

The following methods were deprecated: page.type(), frame.type(), locator.type() and elementHandle.type(). Please use locator.fill() instead which is much faster. Use locator.pressSequentially() only if there is a special keyboard handling on the page, and you need to press keys one-by-one.

## Breaking Changes: Playwright no longer downloads browsers automatically

Note: If you are using @playwright/test package, this change does not affect you. Playwright recommends to use @playwright/test package and download browsers via npx playwright install command. If you are following this recommendation, nothing has changed for you. However, up to v1.38, installing the playwright package instead of @playwright/test did automatically download browsers. This is no longer the case, and we recommend to explicitly download browsers via npx playwright install command. v1.37 and earlier playwright package was downloading browsers during npm install, while @playwright/test was not. v1.38 and later playwright and @playwright/test packages do not download browsers during npm install. Recommended migration Run npx playwright install to download browsers after npm install. For example, in your CI configuration: - run: npm ci- run: npx playwright install --with-deps Alternative migration option - not recommended Add @playwright/browser-chromium, @playwright/browser-firefox and @playwright/browser-webkit as a dependency. These packages download respective browsers during npm install. Make sure you keep the version of all playwright packages in sync: // package.json{ "devDependencies": { "playwright": "1.38.0", "@playwright/browser-chromium": "1.38.0", "@playwright/browser-firefox": "1.38.0", "@playwright/browser-webkit": "1.38.0" }}

## Browser Versions

Chromium 117.0.5938.62 Mozilla Firefox 117.0 WebKit 17.0 This version was also tested against the following stable channels:

## Google Chrome 116 Microsoft Edge 116 Version 1.37

## New npx playwright merge-reports tool

If you run tests on multiple shards, you can now merge all reports in a single HTML report (or any other report) using the new merge-reports CLI tool. Using merge-reports tool requires the following steps: Adding a new "blob" reporter to the config when running on CI: playwright.config.tsexport default defineConfig({ testDir: './tests', reporter: process.env.CI ? 'blob' : 'html',}); The "blob" reporter will produce ".zip" files that contain all the information about the test run. Copying all "blob" reports in a single shared location and running npx playwright merge-reports: npx playwright merge-reports --reporter html ./all-blob-reports Read more in our documentation. 📚

## Debian 12 Bookworm Support

Playwright now supports Debian 12 Bookworm on both x86_64 and arm64 for Chromium, Firefox and WebKit. Let us know if you encounter any issues! Linux support looks like this: Ubuntu 20.04Ubuntu 22.04Debian 11Debian 12Chromium✅✅✅✅WebKit✅✅✅✅Firefox✅✅✅✅

## UI Mode Updates

UI Mode now respects project dependencies. You can control which dependencies to respect by checking/unchecking them in a projects list.

## Console logs from the test are now displayed in the Console tab. Browser Versions

Chromium 116.0.5845.82 Mozilla Firefox 115.0 WebKit 17.0 This version was also tested against the following stable channels:

## Google Chrome 115 Microsoft Edge 115 Version 1.36

🏝️

## Summer maintenance release. Browser Versions

Chromium 115.0.5790.75 Mozilla Firefox 115.0 WebKit 17.0 This version was also tested against the following stable channels:

## Google Chrome 114 Microsoft Edge 114 Version 1.35

## Highlights

UI mode is now available in VSCode Playwright extension via a new "Show trace viewer" button: UI mode and trace viewer mark network requests handled with page.route() and browserContext.route() handlers, as well as those issued via the API testing: New option maskColor for methods page.screenshot(), locator.screenshot(), expect(page).toHaveScreenshot() and expect(locator).toHaveScreenshot() to change default masking color: await page.goto('https://playwright.dev');await expect(page).toHaveScreenshot({ mask: [page.locator('img')], maskColor: '#00FF00', // green}); New uninstall CLI command to uninstall browser binaries: $ npx playwright uninstall # remove browsers installed by this installation$ npx playwright uninstall --all # remove all ever-install Playwright browsers Both UI mode and trace viewer now could be opened in a browser tab: $ npx playwright test --ui-port 0 # open UI mode in a tab on a random port$ npx playwright show-trace --port 0 # open trace viewer in tab on a random port ⚠️

## Breaking changes

playwright-core binary got renamed from playwright to playwright-core. So if you use playwright-core CLI, make sure to update the name: $ npx playwright-core install # the new way to install browsers when using playwright-core This change does not affect @playwright/test and playwright package users.

## Browser Versions

Chromium 115.0.5790.13 Mozilla Firefox 113.0 WebKit 16.4 This version was also tested against the following stable channels:

## Google Chrome 114 Microsoft Edge 114 Version 1.34

## Highlights

UI Mode now shows steps, fixtures and attachments: New property testProject.teardown to specify a project that needs to run after this and all dependent projects have finished. Teardown is useful to cleanup any resources acquired by this project. A common pattern would be a setup dependency with a corresponding teardown: playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ projects: [ { name: 'setup', testMatch: /global.setup\.ts/, teardown: 'teardown', }, { name: 'teardown', testMatch: /global.teardown\.ts/, }, { name: 'chromium', use: devices['Desktop Chrome'], dependencies: ['setup'], }, { name: 'firefox', use: devices['Desktop Firefox'], dependencies: ['setup'], }, { name: 'webkit', use: devices['Desktop Safari'], dependencies: ['setup'], }, ],}); New method expect.configure to create pre-configured expect instance with its own defaults such as timeout and soft. const slowExpect = expect.configure({ timeout: 10000 });await slowExpect(locator).toHaveText('Submit');// Always do soft assertions.const softExpect = expect.configure({ soft: true }); New options stderr and stdout in testConfig.webServer to configure output handling: playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ // Run your local dev server before starting the tests webServer: { command: 'npm run start', url: 'http://127.0.0.1:3000', reuseExistingServer: !process.env.CI, stdout: 'pipe', stderr: 'pipe', },}); New locator.and() to create a locator that matches both locators. const button = page.getByRole('button').and(page.getByTitle('Subscribe')); New events browserContext.on('console') and browserContext.on('dialog') to subscribe to any dialogs and console messages from any page from the given browser context. Use the new methods consoleMessage.page() and dialog.page() to pin-point event source. ⚠️

## Breaking changes

npx playwright test no longer works if you install both playwright and @playwright/test. There's no need to install both, since you can always import browser automation APIs from @playwright/test directly: automation.tsimport { chromium, firefox, webkit } from '@playwright/test';/_ ... _/ Node.js 14 is no longer supported since it reached its end-of-life on

## April 30, 2023. Browser Versions

Chromium 114.0.5735.26 Mozilla Firefox 113.0 WebKit 16.4 This version was also tested against the following stable channels:

## Google Chrome 113 Microsoft Edge 113 Version 1.33

## Locators Update

Use locator.or() to create a locator that matches either of the two locators. Consider a scenario where you'd like to click on a "New email" button, but sometimes a security settings dialog shows up instead. In this case, you can wait for either a "New email" button, or a dialog and act accordingly: const newEmail = page.getByRole('button', { name: 'New email' });const dialog = page.getByText('Confirm security settings');await expect(newEmail.or(dialog)).toBeVisible();if (await dialog.isVisible()) await page.getByRole('button', { name: 'Dismiss' }).click();await newEmail.click(); Use new options hasNot and hasNotText in locator.filter() to find elements that do not match certain conditions. const rowLocator = page.locator('tr');await rowLocator .filter({ hasNotText: 'text in column 1' }) .filter({ hasNot: page.getByRole('button', { name: 'column 2 button' }) }) .screenshot(); Use new web-first assertion expect(locator).toBeAttached() to ensure that the element is present in the page's DOM. Do not confuse with the expect(locator).to

## BeVisible() that ensures that element is both attached & visible. New APIs

locator.or() New option hasNot in locator.filter() New option hasNotText in locator.filter() expect(locator).toBeAttached() New option timeout in route.fetch() reporter.onExit() ⚠️

## Breaking change

The mcr.microsoft.com/playwright:v1.33.0 now serves a Playwright image based on Ubuntu Jammy. To use the focal-based image, please use mcr.microsoft.com/playwright:v1.33.0-focal instead.

## Browser Versions

Chromium 113.0.5672.53 Mozilla Firefox 112.0 WebKit 16.4 This version was also tested against the following stable channels:

## Google Chrome 112 Microsoft Edge 112 Version 1.32

## Introducing UI Mode (preview)

New UI Mode lets you explore, run and debug tests. Comes with a built-in watch mode.

## Engage with a new flag --ui: npx playwright test --ui New APIs

New options updateMode and updateContent in page.routeFromHAR() and browserContext.routeFromHAR(). Chaining existing locator objects, see locator docs for details. New property testInfo.testId. New option name in method tracing.startChunk(). ⚠️

## Breaking change in component tests

Note: component tests only, does not affect end-to-end tests. @playwright/experimental-ct-react now supports React 18 only. If you're running component tests with React 16 or 17, please replace @playwright/experimental-ct-react with @playwright/experimental-ct-react17.

## Browser Versions

Chromium 112.0.5615.29 Mozilla Firefox 111.0 WebKit 16.4 This version was also tested against the following stable channels:

## Google Chrome 111 Microsoft Edge 111 Version 1.31

## New APIs

New property testProject.dependencies to configure dependencies between projects. Using dependencies allows global setup to produce traces and other artifacts, see the setup steps in the test report and more. playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ projects: [ { name: 'setup', testMatch: /global.setup\.ts/, }, { name: 'chromium', use: devices['Desktop Chrome'], dependencies: ['setup'], }, { name: 'firefox', use: devices['Desktop Firefox'], dependencies: ['setup'], }, { name: 'webkit', use: devices['Desktop Safari'], dependencies: ['setup'], }, ],}); New assertion expect(locator).toBeInViewport() ensures that locator points to an element that intersects viewport, according to the intersection observer API. const button = page.getByRole('button');// Make sure at least some part of element intersects viewport.await expect(button).toBeInViewport();// Make sure element is fully outside of viewport.await expect(button).not.toBeInViewport();// Make sure that at least half of the element intersects viewport.await expect(button).toBeInViewport({ ratio: 0.5 });

## Miscellaneous

DOM snapshots in trace viewer can be now opened in a separate window. New method defineConfig to be used in playwright.config. New option maxRedirects for method route.fetch(). Playwright now supports Debian 11 arm64. Official docker images now include Node 18 instead of Node 16. ⚠️

## Breaking change in component tests

Note: component tests only, does not affect end-to-end tests. playwright-ct.config configuration file for component testing now requires calling defineConfig. // Beforeimport { type PlaywrightTestConfig, devices } from '@playwright/experimental-ct-react';const config: PlaywrightTestConfig = { // ... config goes here ...};export default config; Replace config variable definition with defineConfig call: // Afterimport { defineConfig, devices } from '@playwright/experimental-ct-react';export default defineConfig({ // ... config goes here ...});

## Browser Versions

Chromium 111.0.5563.19 Mozilla Firefox 109.0 WebKit 16.4 This version was also tested against the following stable channels:

## Google Chrome 110 Microsoft Edge 110 Version 1.30

## Browser Versions

Chromium 110.0.5481.38 Mozilla Firefox 108.0.2 WebKit 16.4 This version was also tested against the following stable channels:

## Google Chrome 109 Microsoft Edge 109 Version 1.29

## New APIs

New method route.fetch() and new option json for route.fulfill(): await page.route('\*\*/api/settings', async route => { // Fetch original settings. const response = await route.fetch(); // Force settings theme to a predefined value. const json = await response.json(); json.theme = 'Solorized'; // Fulfill with modified data. await route.fulfill({ json });}); New method locator.all() to iterate over all matching elements: // Check all checkboxes!const checkboxes = page.getByRole('checkbox');for (const checkbox of await checkboxes.all()) await checkbox.check(); locator.selectOption() matches now by value or label: <select multiple> <option value="red">Red</option> <option value="green">Green</option> <option value="blue">Blue</option></select> await element.selectOption('Red'); Retry blocks of code until all assertions pass: await expect(async () => { const response = await page.request.get('https://api.example.com'); await expect(response).toBeOK();}).toPass(); Read more in our documentation. Automatically capture full page screenshot on test failure: playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ use: { screenshot: { mode: 'only-on-failure', fullPage: true, } }});

## Miscellaneous

Playwright Test now respects jsconfig.json. New options args and proxy for androidDevice.launchBrowser(). Option postData in method route.continue() now supports

## Serializable values. Browser Versions

Chromium 109.0.5414.46 Mozilla Firefox 107.0 WebKit 16.4 This version was also tested against the following stable channels:

## Google Chrome 108 Microsoft Edge 108 Version 1.28

## Playwright Tools

Record at Cursor in VSCode. You can run the test, position the cursor at the end of the test and continue generating the test. Live Locators in VSCode. You can hover and edit locators in VSCode to get them highlighted in the opened browser. Live Locators in CodeGen. Generate a locator for any element on the page using "Explore" tool. Codegen and Trace Viewer

## Dark Theme. Automatically picked up from operating system settings. Test Runner

Configure retries and test timeout for a file or a test with test.describe.configure(). // Each test in the file will be retried twice and have a timeout of 20 seconds.test.describe.configure({ retries: 2, timeout: 20_000 });test('runs first', async ({ page }) => {});test('runs second', async ({ page }) => {}); Use testProject.snapshotPathTemplate and testConfig.snapshotPathTemplate to configure a template controlling location of snapshots generated by expect(page).toHaveScreenshot() and expect(value).toMatchSnapshot(). playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ testDir: './tests', snapshotPathTemplate: '{testDir}/**screenshots**/{testFilePath}/{arg}{ext}',});

## New APIs

locator.blur() locator.clear() android.launch

## Server() and android.connect() androidDevice.on('close') Browser Versions

Chromium 108.0.5359.29 Mozilla Firefox 106.0 WebKit 16.4 This version was also tested against the following stable channels:

## Google Chrome 107 Microsoft Edge 107 Version 1.27

## Locators

With these new APIs writing locators is a joy: page.getByText() to locate by text content. page.getByRole() to locate by ARIA role, ARIA attributes and accessible name. page.getByLabel() to locate a form control by associated label's text. page.getByTestId() to locate an element based on its data-testid attribute (other attribute can be configured). page.getByPlaceholder() to locate an input by placeholder. page.getByAltText() to locate an element, usually image, by its text alternative. page.getByTitle() to locate an element by its title. await page.getByLabel('User Name').fill('John');await page.getByLabel('Password').fill('secret-password');await page.getByRole('button', { name: 'Sign in' }).click();await expect(page.getByText('Welcome, John!')).toBeVisible(); All the same methods are also available on

## Locator, FrameLocator and Frame classes. Other highlights

workers option in the playwright.config.ts now accepts a percentage string to use some of the available CPUs. You can also pass it in the command line: npx playwright test --workers=20% New options host and port for the html reporter. import { defineConfig } from '@playwright/test';export default defineConfig({ reporter: [['html', { host: 'localhost', port: '9223' }]],}); New field FullConfig.configFile is available to test reporters, specifying the path to the config file if any. As announced in v1.25, Ubuntu 18 will not be supported as of Dec 2022. In addition to that, there will be no WebKit updates on

## Ubuntu 18 starting from the next Playwright release. Behavior Changes

expect(locator).toHaveAttribute() with an empty value does not match missing attribute anymore. For example, the following snippet will succeed when button does not have a disabled attribute. await expect(page.getByRole('button')).toHaveAttribute('disabled', ''); Command line options --grep and --grep-invert previously incorrectly ignored grep and grepInvert options specified in the config.

## Now all of them are applied together. Browser Versions

Chromium 107.0.5304.18 Mozilla Firefox 105.0.1 WebKit 16.0 This version was also tested against the following stable channels:

## Google Chrome 106 Microsoft Edge 106 Version 1.26

## Assertions

New option enabled for expect(locator).toBeEnabled(). expect(locator).toHaveText() now pierces open shadow roots. New option editable for expect(locator).toBeEditable().

## New option visible for expect(locator).toBeVisible(). Other highlights

New option maxRedirects for apiRequestContext.get() and others to limit redirect count. New command-line flag --pass-with-no-tests that allows the test suite to pass when no files are found. New command-line flag --ignore-snapshots to skip snapshot expectations, such as expect(value).to

## MatchSnapshot() and expect(page).toHaveScreenshot(). Behavior Change

A bunch of Playwright APIs already support the waitUntil: 'domcontentloaded' option. For example: await page.goto('https://playwright.dev', { waitUntil: 'domcontentloaded',}); Prior to 1.26, this would wait for all iframes to fire the DOMContentLoaded event. To align with web specification, the 'domcontentloaded' value only waits for the target frame to fire the 'DOMContent

## Loaded' event. Use waitUntil: 'load' to wait for all iframes. Browser Versions

Chromium 106.0.5249.30 Mozilla Firefox 104.0 WebKit 16.0 This version was also tested against the following stable channels:

## Google Chrome 105 Microsoft Edge 105 Version 1.25

## VSCode Extension

Watch your tests running live & keep devtools open.

## Pick selector. Record new test from current page state. Test Runner

test.step() now returns the value of the step function: test('should work', async ({ page }) => { const pageTitle = await test.step('get title', async () => { await page.goto('https://playwright.dev'); return await page.title(); }); console.log(pageTitle);}); Added test.describe.fixme(). New 'interrupted' test status. Enable tracing via CLI flag: npx playwright test --trace=on.

## Announcements

🎁 We now ship Ubuntu 22.04 Jammy Jellyfish docker image: mcr.microsoft.com/playwright:v1.34.0-jammy. 🪦 This is the last release with macOS 10.15 support (deprecated as of 1.21). 🪦 This is the last release with Node.js 12 support, we recommend upgrading to Node.js LTS (16). ⚠️ Ubuntu 18 is now deprecated and will not be supported as of

## Dec 2022. Browser Versions

Chromium 105.0.5195.19 Mozilla Firefox 103.0 WebKit 16.0 This version was also tested against the following stable channels:

## Google Chrome 104 Microsoft Edge 104 Version 1.24

🌍

## Multiple Web Servers in playwright.config.ts

Launch multiple web servers, databases, or other processes by passing an array of configurations: playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ webServer: [ { command: 'npm run start', url: 'http://127.0.0.1:3000', timeout: 120 * 1000, reuseExistingServer: !process.env.CI, }, { command: 'npm run backend', url: 'http://127.0.0.1:3333', timeout: 120 * 1000, reuseExistingServer: !process.env.CI, } ], use: { baseURL: 'http://localhost:3000/', },}); 🐂

## Debian 11 Bullseye Support

Playwright now supports Debian 11 Bullseye on x86_64 for Chromium, Firefox and WebKit. Let us know if you encounter any issues! Linux support looks like this: | | Ubuntu 20.04 | Ubuntu 22.04 | Debian 11 | :--- | :---: | :---: | :---: | :---: | | Chromium | ✅ | ✅ | ✅ | | WebKit | ✅ | ✅ | ✅ | | Firefox | ✅ | ✅ | ✅ | 🕵️

## Anonymous Describe

It is now possible to call test.describe() to create suites without a title. This is useful for giving a group of tests a common option with test.use(). test.describe(() => { test.use({ colorScheme: 'dark' }); test('one', async ({ page }) => { // ... }); test('two', async ({ page }) => { // ... });}); 🧩

## Component Tests Update

Playwright 1.24 Component Tests introduce beforeMount and afterMount hooks. Use these to configure your app for tests. For example, this could be used to setup App router in Vue.js: src/component.spec.tsimport { test } from '@playwright/experimental-ct-vue';import { Component } from './mycomponent';test('should work', async ({ mount }) => { const component = await mount(Component, { hooksConfig: { /_ anything to configure your app _/ } });}); playwright/index.tsimport { router } from '../router';import { beforeMount } from '@playwright/experimental-ct-vue/hooks';beforeMount(async ({ app, hooksConfig }) => { app.use(router);}); A similar configuration in Next.js would look like this: src/component.spec.jsximport { test } from '@playwright/experimental-ct-react';import { Component } from './mycomponent';test('should work', async ({ mount }) => { const component = await mount(<Component></Component>, { // Pass mock value from test into `beforeMount`. hooksConfig: { router: { query: { page: 1, per_page: 10 }, asPath: '/posts' } } });}); playwright/index.jsimport router from 'next/router';import { beforeMount } from '@playwright/experimental-ct-react/hooks';beforeMount(async ({ hooksConfig }) => { // Before mount, redefine useRouter to return mock value from test. router.useRouter = () => hooksConfig.router;});

## Version 1.23

## Network Replay

Now you can record network traffic into a HAR file and re-use this traffic in your tests. To record network into HAR file: npx playwright open --save-har=github.har.zip https://github.com/microsoft Alternatively, you can record HAR programmatically: const context = await browser.newContext({ recordHar: { path: 'github.har.zip' }});// ... do stuff ...await context.close(); Use the new methods page.routeFromHAR() or browserContext.routeFromHAR() to serve matching responses from the HAR file: await context.routeFromHAR('github.har.zip');

## Read more in our documentation. Advanced Routing

You can now use route.fallback() to defer routing to other handlers. Consider the following example: // Remove a header from all requests.test.beforeEach(async ({ page }) => { await page.route('**/\*', async route => { const headers = await route.request().allHeaders(); delete headers['if-none-match']; await route.fallback({ headers }); });});test('should work', async ({ page }) => { await page.route('**/\*', async route => { if (route.request().resourceType() === 'image') await route.abort(); else await route.fallback(); });}); Note that the new methods page.routeFromHAR() and browserContext.routeFromHAR() also participate in routing and could be deferred to.

## Web-First Assertions Update

New method expect(locator).toHaveValues() that asserts all selected values of <select multiple> element. Methods expect(locator).toContainText() and expect(locator).to

## HaveText() now accept ignoreCase option. Component Tests Update

Support for Vue2 via the @playwright/experimental-ct-vue2 package. Support for component tests for create-react-app with components in .js files.

## Read more about component testing with Playwright. Miscellaneous

If there's a service worker that's in your way, you can now easily disable it with a new context option serviceWorkers: playwright.config.tsexport default { use: { serviceWorkers: 'block', }}; Using .zip path for recordHar context option automatically zips the resulting HAR: const context = await browser.newContext({ recordHar: { path: 'github.har.zip', }}); If you intend to edit HAR by hand, consider using the "minimal" HAR recording mode that only records information that is essential for replaying: const context = await browser.newContext({ recordHar: { path: 'github.har', mode: 'minimal', }}); Playwright now runs on Ubuntu 22 amd64 and Ubuntu 22 arm64. We also publish new docker image mcr.microsoft.com/playwright:v1.34.0-jammy. ⚠️ Breaking Changes ⚠️​ WebServer is now considered "ready" if request to the specified url has any of the following

## HTTP status codes: 200-299 300-399 (new) 400, 401, 402, 403 (new) Version 1.22

## Highlights

Components Testing (preview) Playwright Test can now test your React or Vue.js components. You can use all the features of Playwright Test (such as parallelization, emulation & debugging) while running components in real browsers. Here is what a typical component test looks like: App.spec.tsximport { test, expect } from '@playwright/experimental-ct-react';import App from './App';// Let's test component in a dark scheme!test.use({ colorScheme: 'dark' });test('should render', async ({ mount }) => { const component = await mount(<App></App>); // As with any Playwright test, assert locator text. await expect(component).toContainText('React'); // Or do a screenshot 🚀 await expect(component).toHaveScreenshot(); // Or use any Playwright method await component.click();}); Read more in our documentation. Role selectors that allow selecting elements by their ARIA role, ARIA attributes and accessible name. // Click a button with accessible name "log in"await page.locator('role=button[name="log in"]').click(); Read more in our documentation. New locator.filter() API to filter an existing locator const buttons = page.locator('role=button');// ...const submitButton = buttons.filter({ hasText: 'Submit' });await submitButton.click(); New web-first assertions expect(page).toHaveScreenshot() and expect(locator).toHaveScreenshot() that wait for screenshot stabilization and enhances test reliability. The new assertions has screenshot-specific defaults, such as: disables animations uses CSS scale option await page.goto('https://playwright.dev');await expect(page).toHaveScreenshot(); The new expect(page).toHaveScreenshot() saves screenshots at the same location as expect(value).to

## MatchSnapshot(). Version 1.21

## Highlights

New role selectors that allow selecting elements by their ARIA role, ARIA attributes and accessible name. // Click a button with accessible name "log in"await page.locator('role=button[name="log in"]').click(); Read more in our documentation. New scale option in page.screenshot() for smaller sized screenshots. New caret option in page.screenshot() to control text caret. Defaults to "hide". New method expect.poll to wait for an arbitrary condition: // Poll the method until it returns an expected result.await expect.poll(async () => { const response = await page.request.get('https://api.example.com'); return response.status();}).toBe(200); expect.poll supports most synchronous matchers, like .to

## Be(), .toContain(), etc. Read more in our documentation. Behavior Changes

ESM support when running TypeScript tests is now enabled by default. The PLAYWRIGHT_EXPERIMENTAL_TS_ESM env variable is no longer required. The mcr.microsoft.com/playwright docker image no longer contains Python. Please use mcr.microsoft.com/playwright/python as a Playwright-ready docker image with pre-installed Python. Playwright now supports large file uploads (100s of

## MBs) via locator.setInputFiles() API. Browser Versions

Chromium 101.0.4951.26 Mozilla Firefox 98.0.2 WebKit 15.4 This version was also tested against the following stable channels:

## Google Chrome 100 Microsoft Edge 100 Version 1.20

## Highlights

New options for methods page.screenshot(), locator.screenshot() and elementHandle.screenshot(): Option animations: "disabled" rewinds all CSS animations and transitions to a consistent state Option mask: Locator[] masks given elements, overlaying them with pink #FF00FF boxes. expect().toMatchSnapshot() now supports anonymous snapshots: when snapshot name is missing, Playwright Test will generate one automatically: expect('Web is Awesome <3').toMatchSnapshot(); New maxDiffPixels and maxDiffPixelRatio options for fine-grained screenshot comparison using expect().toMatchSnapshot(): expect(await page.screenshot()).toMatchSnapshot({ maxDiffPixels: 27, // allow no more than 27 different pixels.}); It is most convenient to specify maxDiffPixels or maxDiffPixelRatio once in testConfig.expect. Playwright Test now adds testConfig.fullyParallel mode. By default, Playwright Test parallelizes between files. In fully parallel mode, tests inside a single file are also run in parallel. You can also use --fully-parallel command line flag. playwright.config.tsexport default { fullyParallel: true,}; testProject.grep and testProject.grepInvert are now configurable per project. For example, you can now configure smoke tests project using grep: playwright.config.tsexport default { projects: [ { name: 'smoke tests', grep: /@smoke/, }, ],}; Trace Viewer now shows API testing requests. locator.highlight() visually reveals element(s) for easier debugging.

## Announcements

We now ship a designated Python docker image mcr.microsoft.com/playwright/python. Please switch over to it if you use Python. This is the last release that includes Python inside our javascript mcr.microsoft.com/playwright docker image. v1.20 is the last release to receive WebKit update for macOS 10.15 Catalina. Please update macOS to keep using latest & greatest WebKit!

## Browser Versions

Chromium 101.0.4921.0 Mozilla Firefox 97.0.1 WebKit 15.4 This version was also tested against the following stable channels:

## Google Chrome 99 Microsoft Edge 99 Version 1.19

## Playwright Test Update

Playwright Test v1.19 now supports soft assertions. Failed soft assertions do not terminate test execution, but mark the test as failed. // Make a few checks that will not stop the test when failed...await expect.soft(page.locator('#status')).toHaveText('Success');await expect.soft(page.locator('#eta')).toHaveText('1 day');// ... and continue the test to check more things.await page.locator('#next-page').click();await expect.soft(page.locator('#title')).toHaveText('Make another order'); Read more in our documentation You can now specify a custom expect message as a second argument to the expect and expect.soft functions, for example: await expect(page.locator('text=Name'), 'should be logged in').toBeVisible(); The error would look like this: Error: should be logged in Call log: - expect.toBeVisible with timeout 5000ms - waiting for "getByText('Name')" 2 | 3 | test('example test', async({ page }) => { > 4 | await expect(page.locator('text=Name'), 'should be logged in').toBeVisible(); | ^ 5 | }); 6 | Read more in our documentation By default, tests in a single file are run in order. If you have many independent tests in a single file, you can now run them in parallel with test.describe.configure().

## Other Updates

Locator now supports a has option that makes sure it contains another locator inside: await page.locator('article', { has: page.locator('.highlight'),}).click(); Read more in locator documentation New locator.page() page.screenshot() and locator.screenshot() now automatically hide blinking caret Playwright Codegen now generates locators and frame locators New option url in testConfig.webServer to ensure your web server is ready before running the tests New testInfo.errors and testResult.errors that contain all failed assertions and soft assertions.

## Potentially breaking change in Playwright Test Global Setup

It is unlikely that this change will affect you, no action is required if your tests keep running as they did. We've noticed that in rare cases, the set of tests to be executed was configured in the global setup by means of the environment variables. We also noticed some applications that were post processing the reporters' output in the global teardown.

## If you are doing one of the two, learn more Browser Versions

Chromium 100.0.4863.0 Mozilla Firefox 96.0.1 WebKit 15.4 This version was also tested against the following stable channels:

## Google Chrome 98 Microsoft Edge 98 Version 1.18

## Locator Improvements

locator.dragTo() expect(locator).toBeChecked({ checked }) Each locator can now be optionally filtered by the text it contains: await page.locator('li', { hasText: 'my item' }).locator('button').click();

## Read more in locator documentation Testing API improvements

expect(response).to

## BeOK() testInfo.attach() test.info() Improved TypeScript Support

Playwright Test now respects tsconfig.json's baseUrl and paths, so you can use aliases There is a new environment variable PW_EXPERIMENTAL_TS_ESM that allows importing ESM modules in your TS code, without the need for the compile step. Don't forget the .js suffix when you are importing your esm modules. Run your tests as follows: npm i --save-dev @playwright/test@1.18.0-rc1PW_EXPERIMENTAL_TS_ESM=1 npx playwright test

## Create Playwright

The npm init playwright command is now generally available for your use: # Run from your project's root directorynpm init playwright@latest# Or create a new projectnpm init playwright@latest new-project This will create a Playwright Test configuration file, optionally add examples, a

## GitHub Action workflow and a first test example.spec.ts. New APIs & changes

new testCase.repeatEachIndex API accept

## Downloads option now defaults to true Breaking change: custom config options

Custom config options are a convenient way to parametrize projects with different values. Learn more in this guide. Previously, any fixture introduced through test.extend() could be overridden in the testProject.use config section. For example, // WRONG: THIS SNIPPET DOES NOT WORK SINCE v1.18.// fixtures.jsconst test = base.extend({ myParameter: 'default',});// playwright.config.jsmodule.exports = { use: { myParameter: 'value', },}; The proper way to make a fixture parametrized in the config file is to specify option: true when defining the fixture. For example, // CORRECT: THIS SNIPPET WORKS SINCE v1.18.// fixtures.jsconst test = base.extend({ // Fixtures marked as "option: true" will get a value specified in the config, // or fallback to the default value. myParameter: ['default', { option: true }],});// playwright.config.jsmodule.exports = { use: { myParameter: 'value', },};

## Browser Versions

Chromium 99.0.4812.0 Mozilla Firefox 95.0 WebKit 15.4 This version was also tested against the following stable channels:

## Google Chrome 97 Microsoft Edge 97 Version 1.17

## Frame Locators

Playwright 1.17 introduces frame locators - a locator to the iframe on the page. Frame locators capture the logic sufficient to retrieve the iframe and then locate elements in that iframe. Frame locators are strict by default, will wait for iframe to appear and can be used in Web-First assertions. Frame locators can be created with either page.frameLocator() or locator.frameLocator() method. const locator = page.frameLocator('#my-iframe').locator('text=Submit');await locator.click();

## Read more at our documentation. Trace Viewer Update

Playwright Trace Viewer is now available online at https://trace.playwright.dev! Just drag-and-drop your trace.zip file to inspect its contents. NOTE: trace files are not uploaded anywhere; trace.playwright.dev is a progressive web application that processes traces locally. Playwright Test traces now include sources by default (these could be turned off with tracing option) Trace Viewer now shows test name New trace metadata tab with browser details

## Snapshots now have URL bar HTML Report Update

HTML report now supports dynamic filtering Report is now a single static HTML file that could be sent by e-mail or as a slack attachment.

## Ubuntu ARM64 support + more

Playwright now supports Ubuntu 20.04 ARM64. You can now run Playwright tests inside Docker on Apple M1 and on Raspberry Pi. You can now use Playwright to install stable version of

## Edge on Linux: npx playwright install msedge New APIs

Tracing now supports a 'title' option Page navigations support a new 'commit' waiting option HTML reporter got new configuration options testConfig.snapshotDir option testInfo.parallelIndex testInfo.titlePath testOptions.trace has new options expect.to

## MatchSnapshot supports subdirectories reporter.printsToStdio() Version 1.16

🎭

## Playwright Test

## API Testing

Playwright 1.16 introduces new API Testing that lets you send requests to the server directly from Node.js! Now you can: test your server API prepare server side state before visiting the web application in a test validate server side post-conditions after running some actions in the browser To do a request on behalf of Playwright's Page, use new page.request API: import { test, expect } from '@playwright/test';test('context fetch', async ({ page }) => { // Do a GET request on behalf of page const response = await page.request.get('http://example.com/foo.json'); // ...}); To do a stand-alone request from node.js to an API endpoint, use new request fixture: import { test, expect } from '@playwright/test';test('context fetch', async ({ request }) => { // Do a GET request on behalf of page const response = await request.get('http://example.com/foo.json'); // ...});

## Read more about it in our API testing guide. Response Interception

It is now possible to do response interception by combining API Testing with request interception. For example, we can blur all the images on the page: import { test, expect } from '@playwright/test';import jimp from 'jimp'; // image processing librarytest('response interception', async ({ page }) => { await page.route('\*_/_.jpeg', async route => { const response = await page.\_request.fetch(route.request()); const image = await jimp.read(await response.body()); await image.blur(5); await route.fulfill({ response, body: await image.getBufferAsync('image/jpeg'), }); }); const response = await page.goto('https://playwright.dev'); expect(response.status()).toBe(200);});

## Read more about response interception. New HTML reporter

Try it out new HTML reporter with either --reporter=html or a reporter entry in playwright.config.ts file: $ npx playwright test --reporter=html The HTML reporter has all the information about tests and their failures, including surfacing trace and image artifacts. Read more about our reporters. 🎭

## Playwright Library

locator.wait

## For

Wait for a locator to resolve to a single element with a given state. Defaults to the state: 'visible'. Comes especially handy when working with lists: import { test, expect } from '@playwright/test';test('context fetch', async ({ page }) => { const completeness = page.locator('text=Success'); await completeness.waitFor(); expect(await page.screenshot()).toMatchSnapshot('screen.png');});

## Read more about locator.waitFor(). Docker support for Arm64

Playwright Docker image is now published for Arm64 so it can be used on Apple Silicon. Read more about Docker integration. 🎭

## Playwright Trace Viewer

web-first assertions inside trace viewer run trace viewer with npx playwright show-trace and drop trace files to the trace viewer PWA API testing is integrated with trace viewer better visual attribution of action targets

## Read more about Trace Viewer. Browser Versions

Chromium 97.0.4666.0 Mozilla Firefox 93.0 WebKit 15.4 This version of Playwright was also tested against the following stable channels:

## Google Chrome 94 Microsoft Edge 94 Version 1.15

🎭

## Playwright Library

🖱️

## Mouse Wheel

By using mouse.wheel() you are now able to scroll vertically or horizontally. 📜

## New Headers API

Previously it was not possible to get multiple header values of a response. This is now possible and additional helper functions are available: request.allHeaders() request.headersArray() request.headerValue() response.allHeaders() response.headersArray() response.headerValue() response.headerValues() 🌈

## Forced-Colors emulation

Its now possible to emulate the forced-colors CSS media feature by passing it in the browser.new

## Context() or calling page.emulateMedia(). New APIs

page.route() accepts new times option to specify how many times this route should be matched. page.setChecked() and locator.setChecked() were introduced to set the checked state of a checkbox. request.sizes() Returns resource size information for given http request. tracing.startChunk() - Start a new trace chunk. tracing.stopChunk() - Stops a new trace chunk. 🎭

## Playwright Test

🤝 test.parallel() run tests in the same file in parallel​ test.describe.parallel('group', () => { test('runs in parallel 1', async ({ page }) => { }); test('runs in parallel 2', async ({ page }) => { });}); By default, tests in a single file are run in order. If you have many independent tests in a single file, you can now run them in parallel with test.describe.parallel(title, callback). 🛠

## Add --debug CLI flag

By using npx playwright test --debug it will enable the

## Playwright Inspector for you to debug your tests. Browser Versions

## Chromium 96.0.4641.0 Mozilla Firefox 92.0 WebKit 15.0 Version 1.14

🎭

## Playwright Library

⚡️

## New "strict" mode

Selector ambiguity is a common problem in automation testing. "strict" mode ensures that your selector points to a single element and throws otherwise. Pass strict: true into your action calls to opt in. // This will throw if you have more than one button!await page.click('button', { strict: true }); 📍

## New Locators API

Locator represents a view to the element(s) on the page. It captures the logic sufficient to retrieve the element at any given moment. The difference between the Locator and ElementHandle is that the latter points to a particular element, while Locator captures the logic of how to retrieve that element. Also, locators are "strict" by default! const locator = page.locator('button');await locator.click(); Learn more in the documentation. 🧩

## Experimental React and Vue selector engines

React and Vue selectors allow selecting elements by its component name and/or property values. The syntax is very similar to attribute selectors and supports all attribute selector operators. await page.locator('\_react=SubmitButton[enabled=true]').click();await page.locator('\_vue=submit-button[enabled=true]').click(); Learn more in the react selectors documentation and the vue selectors documentation. ✨

## New nth and visible selector engines

nth selector engine is equivalent to the :nth-match pseudo class, but could be combined with other selector engines. visible selector engine is equivalent to the :visible pseudo class, but could be combined with other selector engines. // select the first button among all buttonsawait button.click('button >> nth=0');// or if you are using locators, you can use first(), nth() and last()await page.locator('button').first().click();// click a visible buttonawait button.click('button >> visible=true'); 🎭

## Playwright Test

✅

## Web-First Assertions

expect now supports lots of new web-first assertions. Consider the following example: await expect(page.locator('.status')).toHaveText('Submitted'); Playwright Test will be re-testing the node with the selector .status until fetched Node has the "Submitted" text. It will be re-fetching the node and checking it over and over, until the condition is met or until the timeout is reached. You can either pass this timeout or configure it once via the testProject.expect value in test config. By default, the timeout for assertions is not set, so it'll wait forever, until the whole test times out. List of all new assertions: expect(locator).toBeChecked() expect(locator).toBeDisabled() expect(locator).toBeEditable() expect(locator).toBeEmpty() expect(locator).toBeEnabled() expect(locator).toBeFocused() expect(locator).toBeHidden() expect(locator).toBeVisible() expect(locator).toContainText(text, options?) expect(locator).toHaveAttribute(name, value) expect(locator).toHaveClass(expected) expect(locator).toHaveCount(count) expect(locator).toHaveCSS(name, value) expect(locator).toHaveId(id) expect(locator).toHaveJSProperty(name, value) expect(locator).toHaveText(expected, options) expect(page).toHaveTitle(title) expect(page).toHaveURL(url) expect(locator).toHaveValue(value) ⛓

## Serial mode with describe.serial

Declares a group of tests that should always be run serially. If one of the tests fails, all subsequent tests are skipped. All tests in a group are retried together. test.describe.serial('group', () => { test('runs first', async ({ page }) => { /_ ... _/ }); test('runs second', async ({ page }) => { /_ ... _/ });}); Learn more in the documentation. 🐾

## Steps API with test.step

Split long tests into multiple steps using test.step() API: import { test, expect } from '@playwright/test';test('test', async ({ page }) => { await test.step('Log in', async () => { // ... }); await test.step('news feed', async () => { // ... });}); Step information is exposed in reporters API. 🌎

## Launch web server before running tests

To launch a server during the tests, use the webServer option in the configuration file. The server will wait for a given url to be available before running the tests, and the url will be passed over to Playwright as a baseURL when creating a context. playwright.config.tsimport { defineConfig } from '@playwright/test';export default defineConfig({ webServer: { command: 'npm run start', // command to launch url: 'http://127.0.0.1:3000', // url to await for timeout: 120 \* 1000, reuseExistingServer: !process.env.CI, },});

## Learn more in the documentation. Browser Versions

## Chromium 94.0.4595.0 Mozilla Firefox 91.0 WebKit 15.0 Version 1.13

## Playwright Test

⚡️ Introducing Reporter API which is already used to create an Allure Playwright reporter. ⛺️

## New baseURL fixture to support relative paths in tests. Playwright

🖖 Programmatic drag-and-drop support via the page.dragAndDrop() API. 🔎 Enhanced HAR with body sizes for requests and responses.

## Use via recordHar option in browser.newContext(). Tools

Playwright Trace Viewer now shows parameters, returned values and console.log() calls. Playwright

## Inspector can generate Playwright Test tests. New and Overhauled Guides

Intro Authentication Chrome Extensions Playwright Test Annotations

## Playwright Test Configuration Playwright Test Fixtures Browser Versions

## Chromium 93.0.4576.0 Mozilla Firefox 90.0 WebKit 14.2 New Playwright APIs

new baseURL option in browser.newContext() and browser.newPage() response.securityDetails() and response.serverAddr() page.dragAndDrop() and frame.dragAndDrop() download.cancel() page.inputValue(), frame.inputValue() and elementHandle.inputValue() new force option in page.fill(), frame.fill(), and elementHandle.fill() new force option in page.select

## Option(), frame.selectOption(), and elementHandle.selectOption() Version 1.12

⚡️

## Introducing Playwright Test

Playwright Test is a new test runner built from scratch by Playwright team specifically to accommodate end-to-end testing needs: Run tests across all browsers. Execute tests in parallel. Enjoy context isolation and sensible defaults out of the box. Capture videos, screenshots and other artifacts on failure. Integrate your POMs as extensible fixtures. Installation: npm i -D @playwright/test Simple test tests/foo.spec.ts: import { test, expect } from '@playwright/test';test('basic test', async ({ page }) => { await page.goto('https://playwright.dev/'); const name = await page.innerText('.navbar\_\_title'); expect(name).toBe('Playwright');}); Running: npx playwright test 👉 Read more in Playwright Test documentation. 🧟‍♂️

## Introducing Playwright Trace Viewer

Playwright Trace Viewer is a new GUI tool that helps exploring recorded Playwright traces after the script ran. Playwright traces let you examine: page DOM before and after each Playwright action page rendering before and after each Playwright action browser network during script execution Traces are recorded using the new browserContext.tracing API: const browser = await chromium.launch();const context = await browser.newContext();// Start tracing before creating / navigating a page.await context.tracing.start({ screenshots: true, snapshots: true });const page = await context.newPage();await page.goto('https://playwright.dev');// Stop tracing and export it into a zip archive.await context.tracing.stop({ path: 'trace.zip' }); Traces are examined later with the Playwright CLI: npx playwright show-trace trace.zip That will open the following GUI: 👉

## Read more in trace viewer documentation. Browser Versions

Chromium 93.0.4530.0 Mozilla Firefox 89.0 WebKit 14.2 This version of Playwright was also tested against the following stable channels:

## Google Chrome 91 Microsoft Edge 91 New APIs

reducedMotion option in page.emulateMedia(), browserType.launchPersistentContext(), browser.newContext() and browser.newPage() browserContext.on('request') browserContext.on('requestfailed') browserContext.on('requestfinished') browserContext.on('response') tracesDir option in browserType.launch() and browserType.launchPersistentContext() new browser

## Context.tracing API namespace new download.page() method Version 1.11

🎥 New video: Playwright: A New Test Automation Framework for the Modern Web (slides) We talked about Playwright Showed engineering work behind the scenes Did live demos with new features ✨ Special thanks to applitools for hosting the event and inviting us!

## Browser Versions

## Chromium 92.0.4498.0 Mozilla Firefox 89.0b6 WebKit 14.2 New APIs

support for async predicates across the API in methods such as page.waitForRequest() and others new emulation devices: Galaxy S8, Galaxy S9+, Galaxy Tab S4, Pixel 3, Pixel 4 new methods: page.waitForURL() to await navigations to URL video.delete() and video.saveAs() to manage screen recording new options: screen option in the browser.newContext() method to emulate window.screen dimensions position option in page.check() and page.uncheck() methods trial option to dry-run actions in page.check(), page.uncheck(), page.click(), page.dblclick(), page.hover() and page.tap()

## Version 1.10

Playwright for Java v1.10 is now stable! Run Playwright against Google Chrome and Microsoft Edge stable channels with the new channels

## API. Chromium screenshots are fast on Mac & Windows. Bundled Browser Versions

Chromium 90.0.4430.0 Mozilla Firefox 87.0b10 WebKit 14.2 This version of Playwright was also tested against the following stable channels:

## Google Chrome 89 Microsoft Edge 89 New APIs

browserType.launch() now accepts the new 'channel' option.

## Read more in our documentation. Version 1.9

Playwright Inspector is a new GUI tool to author and debug your tests. Line-by-line debugging of your Playwright scripts, with play, pause and step-through. Author new scripts by recording user actions. Generate element selectors for your script by hovering over elements. Set the PWDEBUG=1 environment variable to launch the Inspector Pause script execution with page.pause() in headed mode. Pausing the page launches Playwright Inspector for debugging. New has-text pseudo-class for CSS selectors. :has-text("example") matches any element containing "example" somewhere inside, possibly in a child or a descendant element. See more examples. Page dialogs are now auto-dismissed during execution, unless a listener for dialog event is configured. Learn more about this. Playwright for Python is now stable with an idiomatic snake case

## API and pre-built Docker image to run tests in CI/CD. Browser Versions

## Chromium 90.0.4421.0 Mozilla Firefox 86.0b10 WebKit 14.1 New APIs

page.pause().

## Version 1.8

Selecting elements based on layout with :left-of(), :right-of(), :above() and :below(). Playwright now includes command line interface, former playwright-cli. npx playwright --help page.selectOption() now waits for the options to be present.

## New methods to assert element state like page.isEditable(). New APIs

elementHandle.isChecked(). elementHandle.isDisabled(). elementHandle.isEditable(). elementHandle.isEnabled(). elementHandle.isHidden(). elementHandle.isVisible(). page.isChecked(). page.isDisabled(). page.isEditable(). page.isEnabled(). page.isHidden(). page.isVisible().

## New option 'editable' in elementHandle.waitForElementState(). Browser Versions

## Chromium 90.0.4392.0 Mozilla Firefox 85.0b5 WebKit 14.1 Version 1.7

New Java SDK: Playwright for Java is now on par with JavaScript, Python and .NET bindings. Browser storage API: New convenience APIs to save and load browser storage state (cookies, local storage) to simplify automation scenarios with authentication. New CSS selectors: We heard your feedback for more flexible selectors and have revamped the selectors implementation. Playwright 1.7 introduces new CSS extensions and there's more coming soon. New website: The docs website at playwright.dev has been updated and is now built with Docusaurus. Support for Apple Silicon: Playwright browser binaries for

## WebKit and Chromium are now built for Apple Silicon. New APIs

browserContext.storageState() to get current state for later reuse. storageState option in browser.new

## Context() and browser.newPage() to setup browser context state. Browser Versions

Chromium 89.0.4344.0 Mozilla Firefox 84.0b9 WebKit 14.1
