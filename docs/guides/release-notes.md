# 📰 Playwright — Release Notes

> **Source:** [playwright.dev/docs/release-notes](https://playwright.dev/docs/release-notes)

---

## Version 1.59

### Screencast

New `page.screencast` API provides a unified interface for capturing page content with:

- Screencast recordings
- Action annotations
- Visual overlays
- Real-time frame capture
- Agentic video receipts

**Screencast recording** — record video with precise start/stop control, as an alternative to the `recordVideo` option:

```ts
await page.screencast.start({ path: 'video.webm' });
// ... perform actions ...
await page.screencast.stop();
```

**Action annotations** — enable built-in visual annotations that highlight interacted elements and display action titles during recording:

```ts
await page.screencast.showActions({ position: 'top-right' });
```

`screencast.showActions()` accepts `position` (`'top-left'`, `'top'`, `'top-right'`, `'bottom-left'`, `'bottom'`, `'bottom-right'`), `duration` (ms per annotation), and `fontSize` (px). Returns a disposable to stop showing actions.

Action annotations can also be enabled in test fixtures via the `video` option:

```ts
// playwright.config.ts
export default defineConfig({
  use: {
    video: {
      mode: 'on',
      show: {
        actions: { position: 'top-left' },
        test: { position: 'top-right' },
      },
    },
  },
});
```

**Visual overlays** — add chapter titles and custom HTML overlays on top of the page for richer narration:

```ts
await page.screencast.showChapter('Adding TODOs', {
  description: 'Type and press enter for each TODO',
  duration: 1000,
});
await page.screencast.showOverlay('<div style="color: red">Recording</div>');
```

**Real-time frame capture** — stream JPEG-encoded frames for custom processing like thumbnails, live previews, AI vision, and more:

```ts
await page.screencast.start({
  onFrame: ({ data }) => sendToVisionModel(data),
  size: { width: 800, height: 600 },
});
```

**Agentic video receipts** — coding agents can produce video evidence of their work:

```ts
await page.screencast.start({ path: 'receipt.webm' });
await page.screencast.showActions({ position: 'top-right' });
await page.screencast.showChapter('Verifying checkout flow', {
  description: 'Added coupon code support per ticket #1234',
});
// Agent performs the verification steps...
await page.locator('#coupon').fill('SAVE20');
await page.locator('#apply-coupon').click();
await expect(page.locator('.discount')).toContainText('20%');
await page.screencast.showChapter('Done', {
  description: 'Coupon applied, discount reflected in total',
});
await page.screencast.stop();
```

### Interoperability

New `browser.bind()` API makes a launched browser available for `playwright-cli`, `@playwright/mcp`, and other clients to connect to.

**Bind a browser** — start a browser and bind it so others can connect:

```ts
const { endpoint } = await browser.bind('my-session', {
  workspaceDir: '/my/project',
});
```

**Connect from playwright-cli** — connect to the running browser from your favorite coding agent:

```bash
playwright-cli attach my-session
playwright-cli -s my-session snapshot
```

**Connect from @playwright/mcp** — or point your MCP server to the running browser:

```bash
@playwright/mcp --endpoint=my-session
```

**Connect from a Playwright client** — use API to connect to the browser. Multiple clients at a time are supported:

```ts
const browser = await chromium.connect(endpoint);
```

Pass `host` and `port` options to bind over WebSocket instead of a named pipe:

```ts
const { endpoint } = await browser.bind('my-session', {
  host: 'localhost',
  port: 0,
});
// endpoint is a ws:// URL
```

Call `browser.unbind()` to stop accepting new connections.

### Observability

Run `playwright-cli show` to open the Dashboard that lists all the bound browsers, their statuses, and allows interacting with them:

- See what your agent is doing on the background browsers
- Click into the sessions for manual interventions
- Open DevTools to inspect pages from the background browsers

`playwright-cli` binds all of its browsers automatically, so you can see what your agents are doing. Pass `PLAYWRIGHT_DASHBOARD=1` env variable to see all `@playwright/test` browsers in the dashboard.

### CLI debugger for agents

Coding agents can now run `npx playwright test --debug=cli` to attach and debug tests over `playwright-cli` — perfect for automatically fixing tests in agentic workflows:

```bash
$ npx playwright test --debug=cli
### Debugging Instructions
- Run "playwright-cli attach tw-87b59e" to attach to this test
$ playwright-cli attach tw-87b59e
### Session `tw-87b59e` created, attached to `tw-87b59e`.
Run commands with: playwright-cli --session=tw-87b59e <command>
### Paused
- Navigate to "/" at output/tests/example.spec.ts:4
$ playwright-cli --session tw-87b59e step-over
### Page
- Page URL: https://playwright.dev/
- Page Title: Fast and reliable end-to-end testing for modern web apps | Playwright
### Paused
- Expect "toHaveTitle" at output/tests/example.spec.ts:7
```

### CLI trace analysis for agents

Coding agents can run `npx playwright trace` to explore Playwright Trace and understand failing or flaky tests from the command line:

```bash
$ npx playwright trace open test-results/example-has-title-chromium/trace.zip
Title: example.spec.ts:3 › has title
$ npx playwright trace actions --grep="expect"
 # Time   Action                                                         Duration
──── ─────────── ───────────────────────────────────────────────────── ────────
 9.  0:00.859   Expect "toHaveTitle"                                       5.1s ✗
$ npx playwright trace action 9
Expect "toHaveTitle"
Error: expect(page).toHaveTitle(expected) failed
Expected pattern: /Wrong Title/
Received string:  "Fast and reliable end-to-end testing for modern web apps | Playwright"
Timeout: 5000ms
Snapshots available: before, after
usage: npx playwright trace snapshot 9 --name <before|after>
$ npx playwright trace snapshot 9 --name after
### Page
- Page Title: Fast and reliable end-to-end testing for modern web apps | Playwright
$ npx playwright trace close
```

### `await using`

Many APIs now return async disposables, enabling the `await using` syntax for automatic cleanup:

```ts
await using page = await context.newPage();
{
  await using route = await page.route('**/*', (route) => route.continue());
  await using script = await page.addInitScript('console.log("init script here")');
  await page.goto('https://playwright.dev');
  // do something
}
// route and init script have been removed at this point
```

### Snapshots and Locators

- Method `page.ariaSnapshot()` to capture the aria snapshot of the page — equivalent to `page.locator('body').ariaSnapshot()`.
- Options `depth` and `mode` in `locator.ariaSnapshot()`.
- Method `locator.normalize()` converts a locator to follow best practices like test ids and aria roles.
- Method `page.pickLocator()` enters an interactive mode where hovering over elements highlights them and shows the corresponding locator. Click an element to get its Locator back. Use `page.cancelPickLocator()` to cancel.

### New APIs

**Screencast**

- `page.screencast` provides video recording, real-time frame streaming, and overlay management.
- Methods `screencast.start()` and `screencast.stop()` for recording and frame capture.
- Methods `screencast.showActions()` and `screencast.hideActions()` for action annotations.
- Methods `screencast.showChapter()` and `screencast.showOverlay()` for visual overlays.
- Methods `screencast.showOverlays()` and `screencast.hideOverlays()` for overlay visibility control.

**Storage, Console and Errors**

- Method `browserContext.setStorageState()` clears existing cookies, local storage, and IndexedDB for all origins and sets a new storage state — no need to create a new context.
- Methods `page.clearConsoleMessages()` and `page.clearPageErrors()` to clear stored messages and errors.
- Option `filter` in `page.consoleMessages()` and `page.pageErrors()` controls which messages are returned.
- Method `consoleMessage.timestamp()`.

**Miscellaneous**

- `browserContext.debugger` provides programmatic control over the Playwright debugger.
- Method `browserContext.isClosed()`.
- Method `request.existingResponse()` returns the response without waiting.
- Method `response.httpVersion()` returns the HTTP version used by the response.
- Events `cdpSession.on('event')` and `cdpSession.on('close')` for CDP sessions.
- Option `live` in `tracing.start()` for real-time trace updates.
- Option `artifactsDir` in `browserType.launch()` to configure the artifacts directory.

### Other improvements

- UI Mode has an option to only show tests affected by source changes.
- UI Mode and Trace Viewer have improved action filtering.
- HTML Reporter shows the list of runs from the same worker.
- HTML Reporter allows filtering test steps for quick search.
- New trace mode `'retain-on-failure-and-retries'` records a trace for each test run and retains all traces when an attempt fails.

### Breaking Changes

- Removed macOS 14 support for WebKit. We recommend upgrading your macOS version, or keeping an older Playwright version.
- Removed `@playwright/experimental-ct-svelte` package.

### Browser Versions

- Chromium 147.0.7727.15
- Mozilla Firefox 148.0.2
- WebKit 26.4

This version was also tested against the following stable channels: Google Chrome 146, Microsoft Edge 146.

---

## Version 1.58

### Timeline

If you're using merged reports, the HTML report Speedboard tab now shows the Timeline.

### UI Mode and Trace Viewer Improvements

- New `'system'` theme option follows your OS dark/light mode preference.
- Search functionality (Cmd/Ctrl+F) is now available in code editors.
- Network details panel has been reorganized for better usability.
- JSON responses are now automatically formatted for readability.

### Miscellaneous

- `browserType.connectOverCDP()` now accepts an `isLocal` option. When set to `true`, it tells Playwright that it runs on the same host as the CDP server, enabling file system optimizations.

### Breaking Changes

- Removed `_react` and `_vue` selectors. See locators guide for alternatives.
- Removed `:light` selector engine suffix. Use standard CSS selectors instead.
- Option `devtools` from `browserType.launch()` has been removed. Use `args: ['--auto-open-devtools-for-tabs']` instead.
- Removed macOS 13 support for WebKit. We recommend to upgrade your macOS version, or keep using an older Playwright version.

### Browser Versions

- Chromium 145.0.7632.6
- Mozilla Firefox 146.0.1
- WebKit 26.0

This version was also tested against the following stable channels: Google Chrome 144, Microsoft Edge 144.

---

## Version 1.57

### Speedboard

In HTML reporter, there's a new tab called "Speedboard". It shows you all your executed tests sorted by slowness, and can help you understand where your test suite is taking longer than expected.

### Chrome for Testing

Playwright now runs on Chrome for Testing builds rather than Chromium. Headed mode uses `chrome`; headless mode uses `chrome-headless-shell`. Existing tests should continue to pass after upgrading to v1.57.

On Arm64 Linux, Playwright continues to use Chromium.

### Waiting for webserver output

`testConfig.webServer` added a `wait` field. Pass a regular expression, and Playwright will wait until the webserver logs match it.

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  webServer: {
    command: 'npm run start',
    wait: { stdout: /Listening on port (?<my_server_port>\d+)/ },
  },
});
```

If you include a named capture group into the expression, then Playwright will provide the capture group contents via environment variables:

```ts
import { test, expect } from '@playwright/test';
test.use({ baseURL: `http://localhost:${process.env.MY_SERVER_PORT ?? 3000}` });
test('homepage', async ({ page }) => {
  await page.goto('/');
});
```

### Breaking Change

After 3 years of being deprecated, `page.accessibility` was removed from the API. Please use other libraries such as Axe if you need to test page accessibility.

### New APIs

- New property `testConfig.tag` adds a tag to all tests in this run. This is useful when using `merge-reports`.
- `worker.on('console')` event is emitted when JavaScript within the worker calls one of console API methods.
- `locator.description()` returns locator description previously set with `locator.describe()`, and `locator.toString()` now uses the description when available.
- New option `steps` in `locator.click()` and `locator.dragTo()` that configures the number of `mousemove` events emitted while moving the mouse pointer to the target element.
- Network requests issued by Service Workers are now reported and can be routed through the `BrowserContext`, only in Chromium.

### Browser Versions

- Chromium 143.0.7499.4
- Mozilla Firefox 144.0.2
- WebKit 26.0

---

## Version 1.56

### Playwright Test Agents

Introducing Playwright Test Agents, three custom agent definitions designed to guide LLMs through the core process of building a Playwright test:

- planner explores the app and produces a Markdown test plan
- generator transforms the Markdown plan into the Playwright Test files
- healer executes the test suite and automatically repairs failing tests

Run `npx playwright init-agents` with your client of choice to generate the latest agent definitions:

```bash
# Visual Studio Code
npx playwright init-agents --loop=vscode

# Claude Code
npx playwright init-agents --loop=claude

# opencode
npx playwright init-agents --loop=opencode
```

### New APIs

- New methods `page.consoleMessages()` and `page.pageErrors()` for retrieving the most recent console messages from the page.
- New method `page.requests()` for retrieving the most recent network requests from the page.
- Added `--test-list` and `--test-list-invert` to allow manual specification of specific tests from a file.

### Breaking Changes

- Event `browserContext.on('backgroundpage')` has been deprecated and will not be emitted.
- Method `browserContext.backgroundPages()` will return an empty list.

### Browser Versions

- Chromium 141.0.7390.37
- Mozilla Firefox 142.0.1
- WebKit 26.0

---

## Version 1.55

### New APIs

- New property `testStepInfo.titlePath` returns the full title path starting from the test file, including test and step titles.

### Codegen

Codegen can now generate automatic `toBeVisible()` assertions for common UI interactions. This feature can be enabled in the Codegen settings UI.

### Breaking Changes

- Dropped support for Chromium extension manifest v2.

### Browser Versions

- Chromium 140.0.7339.16
- Mozilla Firefox 141.0
- WebKit 26.0

---

## Version 1.54

### Highlights

- New cookie property `partitionKey` in `browserContext.cookies()` and `browserContext.addCookies()`. This property allows to save and restore partitioned cookies.
- New option `noSnippets` to disable code snippets in the html report:

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  reporter: [['html', { noSnippets: true }]],
});
```

- New property `location` in test annotations. It shows where the annotation like `test.skip` or `test.fixme` was added.

### Command Line

- New option `--user-data-dir` in multiple commands:

```bash
npx playwright codegen --user-data-dir=./user-data
```

- Option `-gv` has been removed from the `npx playwright test` command. Use `--grep-invert` instead.
- `npx playwright open` does not open the test recorder anymore. Use `npx playwright codegen` instead.

### Browser Versions

- Chromium 139.0.7258.5
- Mozilla Firefox 140.0.2
- WebKit 26.0

---

## Version 1.53

### Trace Viewer and HTML Reporter Updates

- New option in `'html'` reporter to set the title of a specific test run:

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  reporter: [['html', { title: 'Custom test run #1028' }]],
});
```

### Miscellaneous

- New option `kind` in `testInfo.snapshotPath()` controls which snapshot path template is used.
- New method `locator.describe()` to describe a locator. Used for trace viewer and reports:

```ts
const button = page.getByTestId('btn-sub').describe('Subscribe button');
await button.click();
```

- `npx playwright install --list` will now list all installed browsers, versions and locations.

### Browser Versions

- Chromium 138.0.7204.4
- Mozilla Firefox 139.0
- WebKit 18.5

---

## Version 1.52

### Highlights

New method `expect(locator).toContainClass()` to ergonomically assert individual class names on the element:

```ts
await expect(page.getByRole('listitem', { name: 'Ship v1.52' })).toContainClass('done');
```

Aria Snapshots got two new properties: `/children` for strict matching and `/url` for links:

```ts
await expect(locator).toMatchAriaSnapshot(`
  - list
  - /children: equal
  - listitem: Feature A
  - listitem:
    - link "Feature B":
      - /url: "https://playwright.dev"`);
```

### Test Runner

- New property `testProject.workers` allows to specify the number of concurrent worker processes to use for a test project.
- New `testConfig.failOnFlakyTests` option to fail the test run if any flaky tests are detected.
- New property `testResult.annotations` contains annotations for each test retry.

### Browser Versions

- Chromium 136.0.7103.25
- Mozilla Firefox 137.0
- WebKit 18.4

---

## Version 1.51

### StorageState for indexedDB

New option `indexedDB` for `browserContext.storageState()` allows to save and restore IndexedDB contents:

```ts
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';
import path from 'path';
const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/');
  // ... perform authentication steps ...
  // make sure to save indexedDB
  await page.context().storageState({ path: authFile, indexedDB: true });
});
```

### Copy as prompt

New "Copy prompt" button on errors in the HTML report, trace viewer and UI mode. Click to copy a pre-filled LLM prompt that contains the error message and useful context for fixing the error.

### Filter visible elements

New option `visible` for `locator.filter()` allows matching only visible elements:

```ts
test('some test', async ({ page }) => {
  // Ignore invisible todo items.
  const todoItems = page.getByTestId('todo-item').filter({ visible: true });
  // Check there are exactly 3 visible ones.
  await expect(todoItems).toHaveCount(3);
});
```

### Git information in HTML report

Set option `testConfig.captureGitInfo` to capture git information into `testConfig.metadata`:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  captureGitInfo: { commit: true, diff: true },
});
```

### Test Step improvements

A new `TestStepInfo` object is now available in test steps:

```ts
test('some test', async ({ page, isMobile }) => {
  // Note the new "step" argument:
  await test.step('here is my step', async (step) => {
    step.skip(isMobile, 'not relevant on mobile layouts');
    // ...
    await step.attach('my attachment', { body: 'some text' });
    // ...
  });
});
```

### Browser Versions

- Chromium 134.0.6998.35
- Mozilla Firefox 135.0
- WebKit 18.4

---

## Version 1.50

### Test runner

New option `timeout` allows specifying a maximum run time for an individual test step:

```ts
test('some test', async ({ page }) => {
  await test.step(
    'a step',
    async () => {
      // This step can time out separately from the test
    },
    { timeout: 1000 }
  );
});
```

New method `test.step.skip()` to disable execution of a test step:

```ts
test('some test', async ({ page }) => {
  await test.step('before running step', async () => {
    // Normal step
  });
  await test.step.skip('not yet ready', async () => {
    // This step is skipped
  });
  await test.step('after running step', async () => {
    // This step still runs even though the previous one was skipped
  });
});
```

Expanded `expect(locator).toMatchAriaSnapshot()` to allow storing of aria snapshots in separate YAML files.

Added method `expect(locator).toHaveAccessibleErrorMessage()` to assert the Locator points to an element with a given aria `errormessage`.

### Browser Versions

- Chromium 133.0.6943.16
- Mozilla Firefox 134.0
- WebKit 18.2

---

## Version 1.49

### Aria snapshots

New assertion `expect(locator).toMatchAriaSnapshot()` verifies page structure by comparing to an expected accessibility tree, represented as YAML:

```ts
await page.goto('https://playwright.dev');
await expect(page.locator('body')).toMatchAriaSnapshot(`
  - banner:
    - heading /Playwright enables reliable/ [level=1]
    - link "Get started"
    - link "Star microsoft/playwright on GitHub"
  - main:
    - img "Browsers (Chromium, Firefox, WebKit)"
    - heading "Any browser • Any platform • One API"`);
```

### Test runner

- New option `testConfig.tsconfig` allows to specify a single tsconfig to be used for all tests.
- New method `test.fail.only()` to focus on a failing test.
- Options `testConfig.globalSetup` and `testConfig.globalTeardown` now support multiple setups/teardowns.
- New value `'on-first-failure'` for `testOptions.screenshot`.

### Breaking: chrome and msedge channels switch to new headless mode

This change affects you if you're using one of the following channels in your `playwright.config.ts`: `chrome`, `chrome-dev`, `chrome-beta`, `chrome-canary`, `msedge`, `msedge-dev`, `msedge-beta`, or `msedge-canary`.

### Browser Versions

- Chromium 131.0.6778.33
- Mozilla Firefox 132.0
- WebKit 18.2

---

## Version 1.48

### WebSocket routing

New methods `page.routeWebSocket()` and `browserContext.routeWebSocket()` allow to intercept, modify and mock WebSocket connections:

```ts
await page.routeWebSocket('/ws', (ws) => {
  ws.onMessage((message) => {
    if (message === 'request') ws.send('response');
  });
});
```

### Browser Versions

- Chromium 130.0.6723.19
- Mozilla Firefox 130.0
- WebKit 18.0

---

## Version 1.47

### Network Tab improvements

The Network tab in the UI mode and trace viewer has several improvements: filtering by asset type and URL, better display of query string parameters, preview of font assets.

### `--tsconfig` CLI option

```bash
# Pass a specific tsconfig
npx playwright test --tsconfig tsconfig.test.json
```

### `APIRequestContext` now accepts `URLSearchParams` and string as query parameters

```ts
test('query params', async ({ request }) => {
  const searchParams = new URLSearchParams();
  searchParams.set('userId', 1);
  const response = await request.get(
    'https://jsonplaceholder.typicode.com/posts',
    { params: searchParams } // or as a string: 'userId=1'
  );
  // ...
});
```

### Browser Versions

- Chromium 129.0.6668.29
- Mozilla Firefox 130.0
- WebKit 18.0

---

## Version 1.46

### TLS Client Certificates

Playwright now allows you to supply client-side certificates:

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: {
    clientCertificates: [
      {
        origin: 'https://example.com',
        certPath: './cert.pem',
        keyPath: './key.pem',
        passphrase: 'mysecretpassword',
      },
    ],
  },
});
```

### `--only-changed` CLI option

```bash
# Only run test files with uncommitted changes
npx playwright test --only-changed

# Only run test files changed relative to the "main" branch
npx playwright test --only-changed=main
```

### Component Testing: New `router` fixture

```ts
import { handlers } from '@src/mocks/handlers';

test.beforeEach(async ({ router }) => {
  // install common handlers before each test
  await router.use(...handlers);
});

test('example test', async ({ mount }) => {
  // test as usual, your handlers are active
  // ...
});
```

### Browser Versions

- Chromium 128.0.6613.18
- Mozilla Firefox 128.0
- WebKit 18.0

---

## Version 1.45

### Clock

Utilizing the new Clock API allows to manipulate and control time within tests:

```ts
// Initialize clock and let the page load naturally.
await page.clock.install({ time: new Date('2024-02-02T08:00:00') });
await page.goto('http://localhost:3333');
// Pretend that the user closed the laptop lid and opened it again at 10am,
// Pause the time once reached that point.
await page.clock.pauseAt(new Date('2024-02-02T10:00:00'));
// Assert the page state.
await expect(page.getByTestId('current-time')).toHaveText('2/2/2024, 10:00:00 AM');
// Close the laptop lid again and open it at 10:30am.
await page.clock.fastForward('30:00');
await expect(page.getByTestId('current-time')).toHaveText('2/2/2024, 10:30:00 AM');
```

### Test runner

- New CLI option `--fail-on-flaky-tests` that sets exit code to 1 upon any flaky tests.
- New environment variable `PLAYWRIGHT_FORCE_TTY` controls whether built-in reporters assume a live terminal.

```bash
# Avoid TTY features that output ANSI control sequences
PLAYWRIGHT_FORCE_TTY=0 npx playwright test
# Enable TTY features, assuming a terminal width 80
PLAYWRIGHT_FORCE_TTY=80 npx playwright test
```

### Browser Versions

- Chromium 127.0.6533.5
- Mozilla Firefox 127.0
- WebKit 17.4

---

## Version 1.44

### New APIs

```ts
const locator = page.getByRole('button');
await expect(locator).toHaveAccessibleName('Submit');
await expect(locator).toHaveAccessibleDescription('Upload a photo');

const locator2 = page.getByTestId('save-button');
await expect(locator2).toHaveRole('button');
```

New `page.removeLocatorHandler()` method for removing previously added locator handlers.

```ts
const locator = page.getByText('This interstitial covers the button');
await page.addLocatorHandler(
  locator,
  async (overlay) => {
    await overlay.locator('#close').click();
  },
  { times: 3, noWaitAfter: true }
);
// Run your tests that can be interrupted by the overlay.
// ...
await page.removeLocatorHandler(locator);
```

### Browser Versions

- Chromium 124.0.6367.8
- Mozilla Firefox 124.0
- WebKit 17.4

---

## Version 1.43

### New APIs

Method `browserContext.clearCookies()` now supports filters:

```ts
// Clear all cookies.
await context.clearCookies();
// New: clear cookies with a particular name.
await context.clearCookies({ name: 'session-id' });
// New: clear cookies for a particular domain.
await context.clearCookies({ domain: 'my-origin.com' });
```

New mode `retain-on-first-failure` for `testOptions.trace`:

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: { trace: 'retain-on-first-failure' },
});
```

New method `locator.contentFrame()` converts a Locator object to a FrameLocator:

```ts
const locator = page.locator('iframe[name="embedded"]');
// ...
const frameLocator = locator.contentFrame();
await frameLocator.getByRole('button').click();
```

New method `frameLocator.owner()` converts a FrameLocator object to a Locator:

```ts
const frameLocator = page.frameLocator('iframe[name="embedded"]');
// ...
const locator = frameLocator.owner();
await expect(locator).toBeVisible();
```

### Browser Versions

- Chromium 123.0.6312.4
- Mozilla Firefox 123.0
- WebKit 17.4

---

## Version 1.42

### New APIs

New method `page.addLocatorHandler()` registers a callback that will be invoked when specified element becomes visible and may block Playwright actions:

```ts
// Setup the handler.
await page.addLocatorHandler(page.getByRole('heading', { name: 'Hej! You are in control of your cookies.' }), async () => {
  await page.getByRole('button', { name: 'Accept all' }).click();
});
// Write the test as usual.
await page.goto('https://www.ikea.com/');
await page.getByRole('link', { name: 'Collection of blue and white' }).click();
await expect(page.getByRole('heading', { name: 'Light and easy' })).toBeVisible();
```

New syntax for adding tags to the tests:

```ts
test(
  'test customer login',
  {
    tag: ['@fast', '@login'],
  },
  async ({ page }) => {
    // ...
  }
);
```

New syntax for test annotations:

```ts
test(
  'test full report',
  {
    annotation: [
      { type: 'issue', description: 'https://github.com/microsoft/playwright/issues/23180' },
      { type: 'docs', description: 'https://playwright.dev/docs/test-annotations#tag-tests' },
    ],
  },
  async ({ page }) => {
    // ...
  }
);
```

### Browser Versions

- Chromium 122.0.6261.18 (updated per stable)
- Mozilla Firefox 123.0
- WebKit 17.4

---

## Version 1.41

### New APIs

- New method `page.unrouteAll()` removes all routes registered by `page.route()` and `page.routeFromHAR()`.
- New method `browserContext.unrouteAll()` removes all routes registered by `browserContext.route()` and `browserContext.routeFromHAR()`.
- New options `style` in `page.screenshot()` and `locator.screenshot()` to add custom CSS to the page before taking a screenshot.

### Browser Versions

- Chromium 121.0.6167.57
- Mozilla Firefox 121.0
- WebKit 17.4

---

## Version 1.40

### Test Generator Update

New tools to generate assertions:

- "Assert visibility" tool generates `expect(locator).toBeVisible()`.
- "Assert value" tool generates `expect(locator).toHaveValue()`.
- "Assert text" tool generates `expect(locator).toContainText()`.

```ts
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.getByRole('link', { name: 'Get started' }).click();
  await expect(page.getByLabel('Breadcrumbs').getByRole('list')).toContainText('Installation');
  await expect(page.getByLabel('Search')).toBeVisible();
  await page.getByLabel('Search').click();
  await page.getByPlaceholder('Search docs').fill('locator');
  await expect(page.getByPlaceholder('Search docs')).toHaveValue('locator');
});
```

### Browser Versions

- Chromium 120.0.6099.28
- Mozilla Firefox 119.0
- WebKit 17.4

---

## Version 1.39

### Add custom matchers to your `expect`

```ts
// test.spec.ts
import { expect as baseExpect } from '@playwright/test';

export const expect = baseExpect.extend({
  async toHaveAmount(locator: Locator, expected: number, options?: { timeout?: number }) {
    // ... see documentation for how to write matchers.
  },
});

test('pass', async ({ page }) => {
  await expect(page.getByTestId('cart')).toHaveAmount(5);
});
```

### Merge test fixtures

```ts
// fixtures.ts
import { mergeTests } from '@playwright/test';
import { test as dbTest } from 'database-test-utils';
import { test as a11yTest } from 'a11y-test-utils';

export const test = mergeTests(dbTest, a11yTest);
```

```ts
// test.spec.ts
import { test } from './fixtures';

test('passes', async ({ database, page, a11y }) => {
  // use database and a11y fixtures.
});
```

### Merge custom `expect` matchers

```ts
// fixtures.ts
import { mergeTests, mergeExpects } from '@playwright/test';
import { test as dbTest, expect as dbExpect } from 'database-test-utils';
import { test as a11yTest, expect as a11yExpect } from 'a11y-test-utils';

export const test = mergeTests(dbTest, a11yTest);
export const expect = mergeExpects(dbExpect, a11yExpect);
```

### Hide implementation details: box test steps

```ts
async function login(page) {
  await test.step(
    'login',
    async () => {
      // ...
    },
    { box: true }
  ); // Note the "box" option here.
}
```

### Browser Versions

- Chromium 119.0.6045.9
- Mozilla Firefox 118.0.1
- WebKit 17.4

---

## Version 1.38

### UI Mode Updates

- Zoom into time range.
- Network panel redesign.

### New APIs

- `browserContext.on('weberror')`
- `locator.pressSequentially()`
- The `reporter.onEnd()` now reports `startTime` and total run duration.

### Deprecations

The following methods were deprecated: `page.type()`, `frame.type()`, `locator.type()` and `elementHandle.type()`. Please use `locator.fill()` instead. Use `locator.pressSequentially()` only if there is special keyboard handling on the page.

### Browser Versions

- Chromium 117.0.5938.62
- Mozilla Firefox 117.0
- WebKit 17.0

---

## Version 1.37

### New `npx playwright merge-reports` tool

```bash
npx playwright merge-reports --reporter html ./all-blob-reports
```

Using `merge-reports` requires adding a `"blob"` reporter to the config when running on CI:

```ts
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  reporter: process.env.CI ? 'blob' : 'html',
});
```

### Debian 12 Bookworm Support

Playwright now supports Debian 12 Bookworm on both x86_64 and arm64 for Chromium, Firefox and WebKit.

### Browser Versions

- Chromium 116.0.5845.82
- Mozilla Firefox 115.0
- WebKit 17.0

---

## Version 1.36

Summer maintenance release.

### Browser Versions

- Chromium 115.0.5790.75
- Mozilla Firefox 115.0
- WebKit 17.0

---

## Version 1.35

### Highlights

- UI mode is now available in VSCode Playwright extension via a new "Show trace viewer" button.
- New option `maskColor` for screenshot methods to change default masking color:

```ts
await page.goto('https://playwright.dev');
await expect(page).toHaveScreenshot({
  mask: [page.locator('img')],
  maskColor: '#00FF00', // green
});
```

- New `uninstall` CLI command:

```bash
$ npx playwright uninstall # remove browsers installed by this installation
$ npx playwright uninstall --all # remove all ever-installed Playwright browsers
```

- Both UI mode and trace viewer can now be opened in a browser tab:

```bash
$ npx playwright test --ui-port 0 # open UI mode in a tab on a random port
$ npx playwright show-trace --port 0 # open trace viewer in tab on a random port
```

### Breaking changes

`playwright-core` binary got renamed from `playwright` to `playwright-core`:

```bash
$ npx playwright-core install # the new way to install browsers when using playwright-core
```

### Browser Versions

- Chromium 115.0.5790.13
- Mozilla Firefox 113.0
- WebKit 16.4

---

## Version 1.34

### Highlights

- UI Mode now shows steps, fixtures and attachments.
- New property `testProject.teardown` to specify a project that needs to run after this and all dependent projects have finished:

```ts
// playwright.config.ts
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
    {
      name: 'firefox',
      use: devices['Desktop Firefox'],
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: devices['Desktop Safari'],
      dependencies: ['setup'],
    },
  ],
});
```

New method `expect.configure` to create pre-configured `expect` instance:

```ts
const slowExpect = expect.configure({ timeout: 10000 });
await slowExpect(locator).toHaveText('Submit');
// Always do soft assertions.
const softExpect = expect.configure({ soft: true });
```

New `locator.and()` to create a locator that matches both locators:

```ts
const button = page.getByRole('button').and(page.getByTitle('Subscribe'));
```

### Browser Versions

- Chromium 114.0.5735.26
- Mozilla Firefox 113.0
- WebKit 16.4

---

## Version 1.33

### Locators Update

Use `locator.or()` to create a locator that matches either of the two locators:

```ts
const newEmail = page.getByRole('button', { name: 'New email' });
const dialog = page.getByText('Confirm security settings');
await expect(newEmail.or(dialog)).toBeVisible();
if (await dialog.isVisible()) await page.getByRole('button', { name: 'Dismiss' }).click();
await newEmail.click();
```

Use new options `hasNot` and `hasNotText` in `locator.filter()`:

```ts
const rowLocator = page.locator('tr');
await rowLocator
  .filter({ hasNotText: 'text in column 1' })
  .filter({ hasNot: page.getByRole('button', { name: 'column 2 button' }) })
  .screenshot();
```

### Browser Versions

- Chromium 113.0.5672.53
- Mozilla Firefox 112.0
- WebKit 16.4

---

## Version 1.32

### Introducing UI Mode (preview)

New UI Mode lets you explore, run and debug tests. Comes with a built-in watch mode:

```bash
npx playwright test --ui
```

### Browser Versions

- Chromium 112.0.5615.29
- Mozilla Firefox 111.0
- WebKit 16.4

---

## Version 1.31

### New APIs

New property `testProject.dependencies` to configure dependencies between projects:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: /global.setup\.ts/,
    },
    {
      name: 'chromium',
      use: devices['Desktop Chrome'],
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: devices['Desktop Firefox'],
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: devices['Desktop Safari'],
      dependencies: ['setup'],
    },
  ],
});
```

New assertion `expect(locator).toBeInViewport()`:

```ts
const button = page.getByRole('button');
// Make sure at least some part of element intersects viewport.
await expect(button).toBeInViewport();
// Make sure element is fully outside of viewport.
await expect(button).not.toBeInViewport();
// Make sure that at least half of the element intersects viewport.
await expect(button).toBeInViewport({ ratio: 0.5 });
```

### Browser Versions

- Chromium 111.0.5563.19
- Mozilla Firefox 109.0
- WebKit 16.4

---

## Version 1.30

### Browser Versions

- Chromium 110.0.5481.38
- Mozilla Firefox 108.0.2
- WebKit 16.4

---

## Version 1.29

### New APIs

New method `route.fetch()` and new option `json` for `route.fulfill()`:

```ts
await page.route('**/api/settings', async (route) => {
  // Fetch original settings.
  const response = await route.fetch();
  // Force settings theme to a predefined value.
  const json = await response.json();
  json.theme = 'Solorized';
  // Fulfill with modified data.
  await route.fulfill({ json });
});
```

New method `locator.all()` to iterate over all matching elements:

```ts
// Check all checkboxes!
const checkboxes = page.getByRole('checkbox');
for (const checkbox of await checkboxes.all()) await checkbox.check();
```

Retry blocks of code until all assertions pass:

```ts
await expect(async () => {
  const response = await page.request.get('https://api.example.com');
  await expect(response).toBeOK();
}).toPass();
```

Automatically capture full page screenshot on test failure:

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: {
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
  },
});
```

### Browser Versions

- Chromium 109.0.5414.46
- Mozilla Firefox 107.0
- WebKit 16.4

---

## Version 1.28

### Playwright Tools

- Record at Cursor in VSCode.
- Live Locators in VSCode.
- Live Locators in CodeGen.
- Codegen and Trace Viewer Dark Theme.

### Test Runner

Configure retries and test timeout for a file or a test with `test.describe.configure()`:

```ts
// Each test in the file will be retried twice and have a timeout of 20 seconds.
test.describe.configure({ retries: 2, timeout: 20_000 });
test('runs first', async ({ page }) => {});
test('runs second', async ({ page }) => {});
```

### Browser Versions

- Chromium 108.0.5359.29
- Mozilla Firefox 106.0
- WebKit 16.4

---

## Version 1.27

### Locators

New locator methods: `page.getByText()`, `page.getByRole()`, `page.getByLabel()`, `page.getByTestId()`, `page.getByPlaceholder()`, `page.getByAltText()`, `page.getByTitle()`:

```ts
await page.getByLabel('User Name').fill('John');
await page.getByLabel('Password').fill('secret-password');
await page.getByRole('button', { name: 'Sign in' }).click();
await expect(page.getByText('Welcome, John!')).toBeVisible();
```

### Browser Versions

- Chromium 107.0.5304.18
- Mozilla Firefox 105.0.1
- WebKit 16.0

---

## Version 1.26

### Assertions

- New option `enabled` for `expect(locator).toBeEnabled()`.
- `expect(locator).toHaveText()` now pierces open shadow roots.
- New option `editable` for `expect(locator).toBeEditable()`.
- New option `visible` for `expect(locator).toBeVisible()`.

### Browser Versions

- Chromium 106.0.5249.30
- Mozilla Firefox 104.0
- WebKit 16.0

---

## Version 1.25

### VSCode Extension

- Watch your tests running live & keep devtools open.
- Pick selector.
- Record new test from current page state.

### Test Runner

`test.step()` now returns the value of the step function:

```ts
test('should work', async ({ page }) => {
  const pageTitle = await test.step('get title', async () => {
    await page.goto('https://playwright.dev');
    return await page.title();
  });
  console.log(pageTitle);
});
```

Enable tracing via CLI flag:

```bash
npx playwright test --trace=on
```

### Browser Versions

- Chromium 105.0.5195.19
- Mozilla Firefox 103.0
- WebKit 16.0

---

## Version 1.24

### Multiple Web Servers in `playwright.config.ts`

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  webServer: [
    {
      command: 'npm run start',
      url: 'http://127.0.0.1:3000',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run backend',
      url: 'http://127.0.0.1:3333',
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ],
  use: {
    baseURL: 'http://localhost:3000/',
  },
});
```

### Anonymous Describe

```ts
test.describe(() => {
  test.use({ colorScheme: 'dark' });
  test('one', async ({ page }) => {
    // ...
  });
  test('two', async ({ page }) => {
    // ...
  });
});
```

### Browser Versions

- Chromium 103.0.5060.53 (updated per stable)
- Mozilla Firefox 102.0
- WebKit 16.0

---

## Version 1.23

### Network Replay

Record network traffic into a HAR file:

```bash
npx playwright open --save-har=github.har.zip https://github.com/microsoft
```

Or record HAR programmatically:

```ts
const context = await browser.newContext({ recordHar: { path: 'github.har.zip' } });
// ... do stuff ...
await context.close();
```

Serve matching responses from the HAR file:

```ts
await context.routeFromHAR('github.har.zip');
```

### Advanced Routing

```ts
// Remove a header from all requests.
test.beforeEach(async ({ page }) => {
  await page.route('**/*', async (route) => {
    const headers = await route.request().allHeaders();
    delete headers['if-none-match'];
    await route.fallback({ headers });
  });
});
test('should work', async ({ page }) => {
  await page.route('**/*', async (route) => {
    if (route.request().resourceType() === 'image') await route.abort();
    else await route.fallback();
  });
});
```

### Browser Versions

- Chromium 102.0.5005.40 (updated per stable)
- Mozilla Firefox 100.0
- WebKit 16.0

---

## Version 1.22

### Highlights

Component Testing (preview):

```ts
// App.spec.tsx
import { test, expect } from '@playwright/experimental-ct-react';
import App from './App';

// Let's test component in a dark scheme!
test.use({ colorScheme: 'dark' });
test('should render', async ({ mount }) => {
  const component = await mount(<App></App>);
  // As with any Playwright test, assert locator text.
  await expect(component).toContainText('React');
  // Or do a screenshot
  await expect(component).toHaveScreenshot();
  // Or use any Playwright method
  await component.click();
});
```

New `locator.filter()` API:

```ts
const buttons = page.locator('role=button');
// ...
const submitButton = buttons.filter({ hasText: 'Submit' });
await submitButton.click();
```

### Browser Versions

- Chromium 101.0.4951.26 (updated per stable)
- Mozilla Firefox 99.0
- WebKit 15.4

---

## Version 1.21

### Highlights

- New role selectors for selecting elements by ARIA role, attributes and accessible name.
- New `scale` option in `page.screenshot()` for smaller sized screenshots.
- New `caret` option in `page.screenshot()` to control text caret. Defaults to `"hide"`.

```ts
await expect
  .poll(async () => {
    const response = await page.request.get('https://api.example.com');
    return response.status();
  })
  .toBe(200);
```

### Browser Versions

- Chromium 101.0.4921.0
- Mozilla Firefox 97.0.1
- WebKit 15.4

---

## Version 1.20

### Highlights

- New options for `page.screenshot()`, `locator.screenshot()` and `elementHandle.screenshot()`:
  - Option `animations: "disabled"` rewinds all CSS animations and transitions to a consistent state.
  - Option `mask: Locator[]` masks given elements, overlaying them with pink `#FF00FF` boxes.
- `expect().toMatchSnapshot()` now supports anonymous snapshots:

```ts
expect('Web is Awesome <3').toMatchSnapshot();
```

- New `maxDiffPixels` and `maxDiffPixelRatio` options for fine-grained screenshot comparison:

```ts
expect(await page.screenshot()).toMatchSnapshot({
  maxDiffPixels: 27, // allow no more than 27 different pixels.
});
```

- Playwright Test now adds `testConfig.fullyParallel` mode.
- `testProject.grep` and `testProject.grepInvert` are now configurable per project.

### Browser Versions

- Chromium 101.0.4921.0
- Mozilla Firefox 97.0.1
- WebKit 15.4

---

## Version 1.19

### Playwright Test Update

Playwright Test v1.19 now supports soft assertions:

```ts
// Make a few checks that will not stop the test when failed...
await expect.soft(page.locator('#status')).toHaveText('Success');
await expect.soft(page.locator('#eta')).toHaveText('1 day');
// ... and continue the test to check more things.
await page.locator('#next-page').click();
await expect.soft(page.locator('#title')).toHaveText('Make another order');
```

You can now specify a custom expect message as a second argument:

```ts
await expect(page.locator('text=Name'), 'should be logged in').toBeVisible();
```

`test.describe.configure()` allows running tests in a single file in parallel.

### Other Updates

- Locator now supports a `has` option:

```ts
await page.locator('article', { has: page.locator('.highlight') }).click();
```

### Browser Versions

- Chromium 100.0.4863.0
- Mozilla Firefox 96.0.1
- WebKit 15.4

---

## Version 1.18

### Locator Improvements

- `locator.dragTo()`
- `expect(locator).toBeChecked({ checked })`
- Each locator can now be optionally filtered by the text it contains:

```ts
await page.locator('li', { hasText: 'my item' }).locator('button').click();
```

### Testing API improvements

- `expect(response).toBeOK()`
- `testInfo.attach()`
- `test.info()`

### Create Playwright

```bash
# Run from your project's root directory
npm init playwright@latest
# Or create a new project
npm init playwright@latest new-project
```

### Browser Versions

- Chromium 99.0.4812.0
- Mozilla Firefox 95.0
- WebKit 15.4

---

## Version 1.17

### Frame Locators

```ts
const locator = page.frameLocator('#my-iframe').locator('text=Submit');
await locator.click();
```

### Trace Viewer Update

- Playwright Trace Viewer is now available online at `https://trace.playwright.dev`.
- Playwright Test traces now include sources by default.
- Trace Viewer now shows test name.
- New trace metadata tab with browser details.
- Snapshots now have URL bar.

### Ubuntu ARM64 support

Playwright now supports Ubuntu 20.04 ARM64. You can now run Playwright tests inside Docker on Apple M1 and on Raspberry Pi.

### Browser Versions

- Chromium 98.0.4758.0 (updated per stable)
- Mozilla Firefox 94.0
- WebKit 15.4

---

## Version 1.16

### API Testing

```ts
import { test, expect } from '@playwright/test';

test('context fetch', async ({ page }) => {
  // Do a GET request on behalf of page
  const response = await page.request.get('http://example.com/foo.json');
  // ...
});
```

Or use the `request` fixture for stand-alone requests:

```ts
import { test, expect } from '@playwright/test';

test('context fetch', async ({ request }) => {
  const response = await request.get('http://example.com/foo.json');
  // ...
});
```

### Response Interception

```ts
import { test, expect } from '@playwright/test';
import jimp from 'jimp'; // image processing library

test('response interception', async ({ page }) => {
  await page.route('**/*.jpeg', async (route) => {
    const response = await page._request.fetch(route.request());
    const image = await jimp.read(await response.body());
    await image.blur(5);
    await route.fulfill({
      response,
      body: await image.getBufferAsync('image/jpeg'),
    });
  });
  const response = await page.goto('https://playwright.dev');
  expect(response.status()).toBe(200);
});
```

### New HTML reporter

```bash
$ npx playwright test --reporter=html
```

### `locator.waitFor`

```ts
import { test, expect } from '@playwright/test';

test('context fetch', async ({ page }) => {
  const completeness = page.locator('text=Success');
  await completeness.waitFor();
  expect(await page.screenshot()).toMatchSnapshot('screen.png');
});
```

### Browser Versions

- Chromium 97.0.4666.0
- Mozilla Firefox 93.0
- WebKit 15.4

---

## Version 1.15

### Mouse Wheel

```ts
await page.mouse.wheel(0, 10);
```

### New Headers API

New methods: `request.allHeaders()`, `request.headersArray()`, `request.headerValue()`, `response.allHeaders()`, `response.headersArray()`, `response.headerValue()`, `response.headerValues()`.

### Forced-Colors emulation

It is now possible to emulate the `forced-colors` CSS media feature by passing it in `browser.newContext()` or calling `page.emulateMedia()`.

### New APIs

- `page.route()` accepts new `times` option.
- `page.setChecked()` and `locator.setChecked()` were introduced.
- `request.sizes()` Returns resource size information.
- `tracing.startChunk()` and `tracing.stopChunk()`.

### `test.describe.parallel()`

```ts
test.describe.parallel('group', () => {
  test('runs in parallel 1', async ({ page }) => {});
  test('runs in parallel 2', async ({ page }) => {});
});
```

### `--debug` CLI flag

```bash
npx playwright test --debug
```

### Browser Versions

- Chromium 96.0.4641.0
- Mozilla Firefox 92.0
- WebKit 15.0

---

## Version 1.14

### New "strict" mode

```ts
// This will throw if you have more than one button!
await page.click('button', { strict: true });
```

### New Locators API

```ts
const locator = page.locator('button');
await locator.click();
```

### Experimental React and Vue selector engines

```ts
await page.locator('_react=SubmitButton[enabled=true]').click();
await page.locator('_vue=submit-button[enabled=true]').click();
```

### New `nth` and `visible` selector engines

```ts
// select the first button among all buttons
await button.click('button >> nth=0');
// or if you are using locators, you can use first(), nth() and last()
await page.locator('button').first().click();
// click a visible button
await button.click('button >> visible=true');
```

### Web-First Assertions

```ts
await expect(page.locator('.status')).toHaveText('Submitted');
```

### Serial mode with `describe.serial`

```ts
test.describe.serial('group', () => {
  test('runs first', async ({ page }) => {
    /* ... */
  });
  test('runs second', async ({ page }) => {
    /* ... */
  });
});
```

### Steps API with `test.step`

```ts
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await test.step('Log in', async () => {
    // ...
  });
  await test.step('news feed', async () => {
    // ...
  });
});
```

### Launch web server before running tests

```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  webServer: {
    command: 'npm run start', // command to launch
    url: 'http://127.0.0.1:3000', // url to await for
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Browser Versions

- Chromium 94.0.4595.0
- Mozilla Firefox 91.0
- WebKit 15.0

---

## Version 1.13

### Playwright Test

- Introducing Reporter API.
- New `baseURL` fixture to support relative paths in tests.

### Playwright

- Programmatic drag-and-drop support via `page.dragAndDrop()` API.
- Enhanced HAR with body sizes for requests and responses.

### Browser Versions

- Chromium 93.0.4576.0
- Mozilla Firefox 90.0
- WebKit 14.2

---

## Version 1.12

### Introducing Playwright Test

```ts
import { test, expect } from '@playwright/test';

test('basic test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  const name = await page.innerText('.navbar__title');
  expect(name).toBe('Playwright');
});
```

```bash
npx playwright test
```

### Introducing Playwright Trace Viewer

Traces are recorded using the `browserContext.tracing` API:

```ts
const browser = await chromium.launch();
const context = await browser.newContext();
// Start tracing before creating / navigating a page.
await context.tracing.start({ screenshots: true, snapshots: true });
const page = await context.newPage();
await page.goto('https://playwright.dev');
// Stop tracing and export it into a zip archive.
await context.tracing.stop({ path: 'trace.zip' });
```

```bash
npx playwright show-trace trace.zip
```

### Browser Versions

- Chromium 93.0.4530.0
- Mozilla Firefox 89.0
- WebKit 14.2

---

## Version 1.11

New video: Playwright: A New Test Automation Framework for the Modern Web.

### New APIs

- Support for async predicates across the API.
- New emulation devices: Galaxy S8, Galaxy S9+, Galaxy Tab S4, Pixel 3, Pixel 4.
- `page.waitForURL()` to await navigations to URL.
- `video.delete()` and `video.saveAs()`.
- `screen` option in `browser.newContext()`.

### Browser Versions

- Chromium 92.0.4498.0
- Mozilla Firefox 89.0b6
- WebKit 14.2

---

## Version 1.10

Playwright for Java v1.10 is now stable! Run Playwright against Google Chrome and Microsoft Edge stable channels with the new `channels` API.

### Browser Versions

- Chromium 90.0.4430.0
- Mozilla Firefox 87.0b10
- WebKit 14.2

---

## Version 1.9

Playwright Inspector is a new GUI tool to author and debug your tests.

- Line-by-line debugging of your Playwright scripts.
- Author new scripts by recording user actions.
- Generate element selectors by hovering over elements.
- Set the `PWDEBUG=1` environment variable to launch the Inspector.
- Pause script execution with `page.pause()` in headed mode.

New `has-text` pseudo-class for CSS selectors. `:has-text("example")` matches any element containing "example" somewhere inside.

### Browser Versions

- Chromium 90.0.4421.0
- Mozilla Firefox 86.0b10
- WebKit 14.1

---

## Version 1.8

- Selecting elements based on layout with `:left-of()`, `:right-of()`, `:above()` and `:below()`.
- Playwright now includes command line interface, former `playwright-cli`.
- `page.selectOption()` now waits for the options to be present.
- New methods to assert element state like `page.isEditable()`.

### Browser Versions

- Chromium 90.0.4392.0
- Mozilla Firefox 85.0b5
- WebKit 14.1

---

## Version 1.7

- New Java SDK: Playwright for Java is now on par with JavaScript, Python and .NET bindings.
- Browser storage API: New convenience APIs to save and load browser storage state (cookies, local storage):

```ts
// Save storage state
browserContext.storageState()
// Restore storage state
storageState option in browser.newContext() and browser.newPage()
```

- New CSS selectors: Playwright 1.7 introduces new CSS extensions.
- New website: The docs website at playwright.dev has been updated and is now built with Docusaurus.
- Support for Apple Silicon: Playwright browser binaries for WebKit and Chromium are now built for Apple Silicon.

### Browser Versions

- Chromium 89.0.4344.0
- Mozilla Firefox 84.0b9
- WebKit 14.1
