# 📦 Playwright — Playwright

> **Source:** [playwright.dev/docs/api/class-playwright](https://playwright.dev/docs/api/class-playwright)

---

**Playwright** module provides a method to launch a browser instance. The following is a typical example of using Playwright to drive automation:

```ts
const { chromium, firefox, webkit } = require('playwright');

(async () => {
  const browser = await chromium.launch(); // Or 'firefox' or 'webkit'.
  const page = await browser.newPage();
  await page.goto('http://example.com');
  // other actions...
  await browser.close();
})();
```

## Properties

### `playwright.chromium` — Added before v1.9

This object can be used to launch or connect to Chromium, returning instances of `Browser`.

**Type:** `BrowserType`

### `playwright.devices` — Added before v1.9

Returns a dictionary of devices to be used with `browser.newContext()` or `browser.newPage()`.

```ts
const { webkit, devices } = require('playwright');
const iPhone = devices['iPhone 6'];

(async () => {
  const browser = await webkit.launch();
  const context = await browser.newContext({ ...iPhone });
  const page = await context.newPage();
  await page.goto('http://example.com');
  // other actions...
  await browser.close();
})();
```

**Type:** `Object`

### `playwright.errors` — Added before v1.9

Playwright methods might throw errors if they are unable to fulfill a request. For example, `locator.waitFor()` might fail if the selector doesn't match any nodes during the given timeframe. For certain types of errors Playwright uses specific error classes. These classes are available via `playwright.errors`.

```ts
try {
  await page.locator('.foo').waitFor();
} catch (e) {
  if (e instanceof playwright.errors.TimeoutError) {
    // Do something if this is a timeout.
  }
}
```

**Type:** `Object`

- `TimeoutError` `function` — A class of `TimeoutError`.

### `playwright.firefox` — Added before v1.9

This object can be used to launch or connect to Firefox, returning instances of `Browser`.

**Type:** `BrowserType`

### `playwright.request` — Added in: v1.16

Exposes API that can be used for the Web API testing.

**Type:** `APIRequest`

### `playwright.selectors` — Added before v1.9

Selectors can be used to install custom selector engines. See extensibility for more information.

**Type:** `Selectors`

### `playwright.webkit` — Added before v1.9

This object can be used to launch or connect to WebKit, returning instances of `Browser`.

**Type:** `BrowserType`
