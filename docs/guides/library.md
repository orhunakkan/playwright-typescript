# 📚 Playwright — Library

> **Source:** [playwright.dev/docs/library](https://playwright.dev/docs/library)

---

## Introduction

Playwright Library provides unified APIs for launching and interacting with browsers, while Playwright Test provides all this plus a fully managed end-to-end Test Runner and experience. Under most circumstances, for end-to-end testing, you'll want to use `@playwright/test` (Playwright Test), and not `playwright` (Playwright Library) directly. To get started with Playwright Test, follow the Getting Started Guide.

## Differences when using library

## Library Example

The following is an example of using the Playwright Library directly to launch Chromium, go to a page, and check its title:

```ts
import { chromium, devices } from 'playwright';
import assert from 'node:assert';

(async () => {
  // Setup
  const browser = await chromium.launch();
  const context = await browser.newContext(devices['iPhone 11']);
  const page = await context.newPage();
  // The actual interesting bit
  await context.route('**.jpg', (route) => route.abort());
  await page.goto('https://example.com/');
  assert((await page.title()) === 'Example Domain'); // 👎 not a Web First assertion
  // Teardown
  await context.close();
  await browser.close();
})();
```

Run it with `node my-script.js`.

## Test Example

A test to achieve similar behavior would look like:

```ts
import { expect, test, devices } from '@playwright/test';

test.use(devices['iPhone 11']);

test('should be titled', async ({ page, context }) => {
  await context.route('**.jpg', (route) => route.abort());
  await page.goto('https://example.com/');
  await expect(page).toHaveTitle('Example');
});
```

Run it with `npx playwright test`.

## Key Differences

The key differences to note are as follows:

| Aspect           | Library                                                                                                                                                 | Test                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Installation     | `npm install playwright`                                                                                                                                | `npm init playwright@latest` — note `install` vs. `init`                                                                       |
| Install browsers | Install `@playwright/browser-chromium`, `@playwright/browser-firefox`, and/or `@playwright/browser-webkit`                                              | `npx playwright install` or `npx playwright install chromium` for a single one                                                 |
| Import from      | `playwright`                                                                                                                                            | `@playwright/test`                                                                                                             |
| Initialization   | Explicitly: pick a browser, launch with `browserType.launch()`, create context with `browser.newContext()`, create page with `browserContext.newPage()` | An isolated page and context are provided to each test out-of-the-box. No explicit creation; lazy-initialized when referenced. |
| Assertions       | No built-in Web-First Assertions                                                                                                                        | Web-First assertions like `expect(page).toHaveTitle()`, `expect(page).toHaveScreenshot()` which auto-wait and retry            |
| Timeouts         | Defaults to 30s for most operations                                                                                                                     | Most operations don't time out, but every test has a timeout (30s by default)                                                  |
| Cleanup          | Explicitly close context and browser                                                                                                                    | No explicit close; Test Runner handles it                                                                                      |
| Running          | Run as a node script, possibly with compilation                                                                                                         | Use `npx playwright test`; Test Runner handles compilation                                                                     |

In addition to the above, Playwright Test as a full-featured Test Runner includes: Configuration Matrix and Projects, Parallelization, Web-First Assertions, Reporting, Retries, Easily Enabled Tracing, and more.

## Usage

Use npm or Yarn to install Playwright library in your Node.js project. See system requirements.

```bash
npm i -D playwright
```

You will also need to install browsers — either manually or by adding a package that will do it for you automatically.

```bash
# Download the Chromium, Firefox and WebKit browser
npx playwright install chromium firefox webkit
# Alternatively, add packages that will download a browser upon npm install
npm i -D @playwright/browser-chromium @playwright/browser-firefox @playwright/browser-webkit
```

See managing browsers for more options. Once installed, you can import Playwright in a Node.js script and launch any of the 3 browsers (chromium, firefox and webkit).

```js
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  // Create pages, interact with UI elements, assert values
  await browser.close();
})();
```

Playwright APIs are asynchronous and return Promise objects. Our code examples use the async/await pattern to ease readability. The code is wrapped in an unnamed async arrow function which is invoking itself.

```js
(async () => {
  // Start of async arrow function
  // Function code
  // ...
})(); // End of the function and () to invoke itself
```

## First script

In our first script, we will navigate to https://playwright.dev/ and take a screenshot in WebKit.

```js
const { webkit } = require('playwright');

(async () => {
  const browser = await webkit.launch();
  const page = await browser.newPage();
  await page.goto('https://playwright.dev/');
  await page.screenshot({ path: `example.png` });
  await browser.close();
})();
```

By default, Playwright runs the browsers in headless mode. To see the browser UI, pass the `headless: false` flag while launching the browser. You can also use `slowMo` to slow down execution. Learn more in the debugging tools section.

```js
firefox.launch({ headless: false, slowMo: 50 });
```

## Record scripts

Command line tools can be used to record user interactions and generate JavaScript code.

```bash
npx playwright codegen wikipedia.org
```

## Browser downloads

To download Playwright browsers run:

```bash
# Explicitly download browsers
npx playwright install
```

Alternatively, you can add `@playwright/browser-chromium`, `@playwright/browser-firefox` and `@playwright/browser-webkit` packages to automatically download the respective browser during package installation.

```bash
# Use a helper package that downloads a browser on npm install
npm install @playwright/browser-chromium
```

### Download behind a firewall or a proxy

Pass `HTTPS_PROXY` environment variable to download through a proxy.

```bash
# Manual
HTTPS_PROXY=https://192.0.2.1 npx playwright install
# Through @playwright/browser-chromium, @playwright/browser-firefox
# and @playwright/browser-webkit helper packages
HTTPS_PROXY=https://192.0.2.1 npm install
```

### Download from artifact repository

By default, Playwright downloads browsers from Microsoft's CDN. Pass `PLAYWRIGHT_DOWNLOAD_HOST` environment variable to download from an internal artifacts repository instead.

```bash
# Manual
PLAYWRIGHT_DOWNLOAD_HOST=192.0.2.1 npx playwright install
# Through @playwright/browser-chromium, @playwright/browser-firefox
# and @playwright/browser-webkit helper packages
PLAYWRIGHT_DOWNLOAD_HOST=192.0.2.1 npm install
```

### Skip browser download

In certain cases, it is desired to avoid browser downloads altogether because browser binaries are managed separately. This can be done by setting `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD` variable before installing packages.

```bash
# When using @playwright/browser-chromium, @playwright/browser-firefox
# and @playwright/browser-webkit helper packages
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install
```

## TypeScript support

Playwright includes built-in support for TypeScript. Type definitions will be imported automatically. It is recommended to use type-checking to improve the IDE experience.

### In JavaScript

Add the following to the top of your JavaScript file to get type-checking in VS Code or WebStorm.

```js
// @ts-check
// ...
```

Alternatively, you can use JSDoc to set types for variables.

```js
/** @type {import('playwright').Page} */
let page;
```

### In TypeScript

TypeScript support will work out-of-the-box. Types can also be imported explicitly.

```ts
let page: import('playwright').Page;
```
