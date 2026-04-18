# 🌐 Playwright — Browser

> **Source:** [playwright.dev/docs/api/class-browser](https://playwright.dev/docs/api/class-browser)

---

A **Browser** is created via `browserType.launch()`. An example of using a Browser to create a Page:

```ts
const { firefox } = require('playwright'); // Or 'chromium' or 'webkit'.
(async () => {
  const browser = await firefox.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await browser.close();
})();
```

---

## Methods

### bind

**Added in:** v1.59

Binds the browser to a named pipe or web socket, making it available for other clients to connect to.

```ts
await browser.bind(title);
await browser.bind(title, options);
```

**Arguments:**

- `title` string — Title of the browser server, used for identification.
- `options` Object (optional)
  - `host` string (optional) — Host to bind the web socket server to. When specified, a web socket server is created instead of a named pipe.
  - `metadata` Object\<string, Object\> (optional) — Additional metadata to associate with the browser server.
  - `port` number (optional) — Port to bind the web socket server to. When specified, a web socket server is created instead of a named pipe. Use 0 to let the OS pick an available port.
  - `workspaceDir` string (optional) — Working directory associated with this browser server.

**Returns:** `Promise<Object>`

- `endpoint` string

---

### browserType

**Added in:** v1.23

Get the browser type (chromium, firefox or webkit) that the browser belongs to.

```ts
browser.browserType();
```

**Returns:** `BrowserType`

---

### close

**Added before:** v1.9

In case this browser is obtained using `browserType.launch()`, closes the browser and all of its pages (if any were opened). In case this browser is connected to, clears all created contexts belonging to this browser and disconnects from the browser server.

> **Note:** This is similar to force-quitting the browser. To close pages gracefully and ensure you receive page close events, call `browserContext.close()` on any `BrowserContext` instances you explicitly created earlier using `browser.newContext()` before calling `browser.close()`. The Browser object itself is considered to be disposed and cannot be used anymore.

```ts
await browser.close();
await browser.close(options);
```

**Arguments:**

- `options` Object (optional)
  - `reason` string (optional) _(Added in: v1.40)_ — The reason to be reported to the operations interrupted by the browser closure.

**Returns:** `Promise<void>`

---

### contexts

**Added before:** v1.9

Returns an array of all open browser contexts. In a newly created browser, this will return zero browser contexts.

```ts
const browser = await pw.webkit.launch();
console.log(browser.contexts().length); // prints `0`
const context = await browser.newContext();
console.log(browser.contexts().length); // prints `1`
```

**Returns:** `Array<BrowserContext>`

---

### isConnected

**Added before:** v1.9

Indicates that the browser is connected.

```ts
browser.isConnected();
```

**Returns:** `boolean`

---

### newBrowserCDPSession

**Added in:** v1.11

Returns the newly created browser session.

> **Note:** CDP Sessions are only supported on Chromium-based browsers.

```ts
await browser.newBrowserCDPSession();
```

**Returns:** `Promise<CDPSession>`

---

### newContext

**Added before:** v1.9

Creates a new browser context. It won't share cookies/cache with other browser contexts.

> **Note:** If directly using this method to create BrowserContexts, it is best practice to explicitly close the returned context via `browserContext.close()` when your code is done with the BrowserContext, and before calling `browser.close()`. This will ensure the context is closed gracefully and any artifacts—like HARs and videos—are fully flushed and saved.

```ts
(async () => {
  const browser = await playwright.firefox.launch(); // Or 'chromium' or 'webkit'.
  // Create a new incognito browser context.
  const context = await browser.newContext();
  // Create a new page in a pristine context.
  const page = await context.newPage();
  await page.goto('https://example.com');
  // Gracefully close up everything
  await context.close();
  await browser.close();
})();
```

**Arguments:**

- `options` Object (optional)
  - `acceptDownloads` boolean (optional) — Whether to automatically download all the attachments. Defaults to `true`.
  - `baseURL` string (optional) — Base URL for `page.goto()`, `page.route()`, etc.
  - `bypassCSP` boolean (optional) — Toggles bypassing page's Content-Security-Policy. Defaults to `false`.
  - `clientCertificates` Array\<Object\> (optional) _(Added in: 1.46)_ — TLS Client Authentication certificates.
  - `colorScheme` `null | "light" | "dark" | "no-preference"` (optional) — Emulates `prefers-colors-scheme`. Defaults to `'light'`.
  - `contrast` `null | "no-preference" | "more"` (optional) — Emulates `prefers-contrast`. Defaults to `'no-preference'`.
  - `deviceScaleFactor` number (optional) — Specify device scale factor (dpr). Defaults to `1`.
  - `extraHTTPHeaders` Object\<string, string\> (optional) — Additional HTTP headers for every request.
  - `forcedColors` `null | "active" | "none"` (optional) — Emulates `forced-colors`. Defaults to `'none'`.
  - `geolocation` Object (optional)
    - `latitude` number — Latitude between -90 and 90.
    - `longitude` number — Longitude between -180 and 180.
    - `accuracy` number (optional) — Non-negative accuracy value. Defaults to `0`.
  - `hasTouch` boolean (optional) — Specifies if viewport supports touch events. Defaults to `false`.
  - `httpCredentials` Object (optional) — Credentials for HTTP authentication.
    - `username` string
    - `password` string
    - `origin` string (optional)
    - `send` `"unauthorized" | "always"` (optional)
  - `ignoreHTTPSErrors` boolean (optional) — Whether to ignore HTTPS errors. Defaults to `false`.
  - `isMobile` boolean (optional) — Whether the meta viewport tag is taken into account. Defaults to `false`.
  - `javaScriptEnabled` boolean (optional) — Whether to enable JavaScript. Defaults to `true`.
  - `locale` string (optional) — Specify user locale, for example `en-GB`, `de-DE`.
  - `logger` Logger (optional) — _Deprecated._ Logger sink for Playwright logging.
  - `offline` boolean (optional) — Whether to emulate network being offline. Defaults to `false`.
  - `permissions` Array\<string\> (optional) — A list of permissions to grant to all pages in this context.
  - `proxy` Object (optional) — Network proxy settings.
    - `server` string
    - `bypass` string (optional)
    - `username` string (optional)
    - `password` string (optional)
  - `recordHar` Object (optional) — Enables HAR recording.
    - `omitContent` boolean (optional) — _Deprecated._
    - `content` `"omit" | "embed" | "attach"` (optional)
    - `path` string — Path on the filesystem to write the HAR file to.
    - `mode` `"full" | "minimal"` (optional) — Defaults to `full`.
    - `urlFilter` string | RegExp (optional)
  - `recordVideo` Object (optional) — Enables video recording.
    - `dir` string (optional)
    - `size` Object (optional) — `width` number, `height` number.
  - `reducedMotion` `null | "reduce" | "no-preference"` (optional) — Emulates `prefers-reduced-motion`. Defaults to `'no-preference'`.
  - `screen` Object (optional) — `width` number, `height` number.
  - `serviceWorkers` `"allow" | "block"` (optional) — Whether to allow sites to register Service Workers. Defaults to `'allow'`.
  - `storageState` string | Object (optional) — Populates context with given storage state.
  - `strictSelectors` boolean (optional) — Enables strict selectors mode. Defaults to `false`.
  - `timezoneId` string (optional) — Changes the timezone of the context.
  - `userAgent` string (optional) — Specific user agent to use in this context.
  - `viewport` `null | Object` (optional) — `width` number, `height` number. Defaults to 1280x720.

    > **Note:** The `null` value opts out from the default presets, makes viewport depend on the host window size. It makes the execution of the tests non-deterministic.

**Returns:** `Promise<BrowserContext>`

---

### newPage

**Added before:** v1.9

Creates a new page in a new browser context. Closing this page will close the context as well. This is a convenience API that should only be used for the single-page scenarios and short snippets. Production code and testing frameworks should explicitly create `browser.newContext()` followed by `browserContext.newPage()`.

```ts
await browser.newPage();
await browser.newPage(options);
```

**Arguments:**

- `options` Object (optional) — Same options as `browser.newContext()`.

**Returns:** `Promise<Page>`

---

### removeAllListeners

**Added in:** v1.47

Removes all the listeners of the given type (or all registered listeners if no type given). Allows to wait for async listeners to complete or to ignore subsequent errors from these listeners.

```ts
await browser.removeAllListeners();
await browser.removeAllListeners(type, options);
```

**Arguments:**

- `type` string (optional)
- `options` Object (optional)
  - `behavior` `"wait" | "ignoreErrors" | "default"` (optional) — Specifies whether to wait for already running listeners:
    - `'default'` — do not wait for current listener calls, if the listener throws it may result in unhandled error
    - `'wait'` — wait for current listener calls to finish
    - `'ignoreErrors'` — do not wait, all errors thrown by listeners after removal are silently caught

**Returns:** `Promise<void>`

---

### startTracing

**Added in:** v1.11

You can use `browser.startTracing()` and `browser.stopTracing()` to create a trace file that can be opened in Chrome DevTools performance panel.

> **Note:** This API controls Chromium Tracing which is a low-level chromium-specific debugging tool. API to control Playwright Tracing could be found here.

```ts
await browser.startTracing(page, { path: 'trace.json' });
await page.goto('https://www.google.com');
await browser.stopTracing();
```

**Arguments:**

- `page` Page (optional) — Optional, if specified, tracing includes screenshots of the given page.
- `options` Object (optional)
  - `categories` Array\<string\> (optional) — Specify custom categories to use instead of default.
  - `path` string (optional) — A path to write the trace file to.
  - `screenshots` boolean (optional) — Captures screenshots in the trace.

**Returns:** `Promise<void>`

---

### stopTracing

**Added in:** v1.11

Returns the buffer with trace data.

> **Note:** This API controls Chromium Tracing which is a low-level chromium-specific debugging tool.

```ts
await browser.stopTracing();
```

**Returns:** `Promise<Buffer>`

---

### unbind

**Added in:** v1.59

Unbinds the browser server previously bound with `browser.bind()`.

```ts
await browser.unbind();
```

**Returns:** `Promise<void>`

---

### version

**Added before:** v1.9

Returns the browser version.

```ts
browser.version();
```

**Returns:** `string`

---

## Events

### on('disconnected')

**Added before:** v1.9

Emitted when Browser gets disconnected from the browser application. This might happen because of one of the following:

- Browser application is closed or crashed.
- The `browser.close()` method was called.

```ts
browser.on('disconnected', (data) => {});
```

**Event data:** `Browser`
