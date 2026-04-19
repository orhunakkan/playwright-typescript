# 📦 Playwright — BrowserType

> **Source:** [playwright.dev/docs/api/class-browsertype](https://playwright.dev/docs/api/class-browsertype)

---

**BrowserType** provides methods to launch a specific browser instance or connect to an existing one.

```ts
const { chromium } = require('playwright'); // Or 'firefox' or 'webkit'.
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  // other actions...
  await browser.close();
})();
```

## Methods

### connect

**Added before:** v1.9

This method attaches Playwright to an existing browser instance created via `BrowserType.launchServer` in Node.js.

> **Note:** The major and minor version of the Playwright instance that connects needs to match the version of Playwright that launches the browser (1.2.3 → is compatible with 1.2.x).

```ts
await browserType.connect(endpoint);
await browserType.connect(endpoint, options);
```

**Arguments:**

- `endpoint` string _(Added in: v1.10)_ — A Playwright browser websocket endpoint to connect to. You obtain this endpoint via `BrowserServer.wsEndpoint`.
- `options` Object (optional)
  - `exposeNetwork` string (optional) _(Added in: v1.37)_ — Exposes network available on the connecting client to the browser being connected to. Consists of a list of rules separated by comma. Available rules: Hostname pattern (e.g., `example.com`, `*.org:99`), IP literal, or `<loopback>`.
  - `headers` Object\<string, string\> (optional) _(Added in: v1.11)_ — Additional HTTP headers to be sent with web socket connect request.
  - `logger` Logger (optional) _(Added in: v1.14)_ — _Deprecated._ Logger sink for Playwright logging.
  - `slowMo` number (optional) _(Added in: v1.10)_ — Slows down Playwright operations by the specified amount of milliseconds. Defaults to 0.
  - `timeout` number (optional) _(Added in: v1.10)_ — Maximum time in milliseconds to wait for the connection to be established. Defaults to 0 (no timeout).

**Returns:** `Promise<Browser>`

### connectOverCDP

**Added in:** v1.9

This method attaches Playwright to an existing browser instance using the Chrome DevTools Protocol. The default browser context is accessible via `browser.contexts()`.

> **Note:** Connecting over the Chrome DevTools Protocol is only supported for Chromium-based browsers.

> **Note:** This connection is significantly lower fidelity than the Playwright protocol connection via `browserType.connect()`.

```ts
const browser = await playwright.chromium.connectOverCDP('http://localhost:9222');
const defaultContext = browser.contexts()[0];
const page = defaultContext.pages()[0];
```

**Arguments:**

- `endpointURL` string _(Added in: v1.11)_ — A CDP websocket endpoint or http url to connect to. For example `http://localhost:9222/` or `ws://127.0.0.1:9222/devtools/browser/387adf4c-...`.
- `options` Object (optional)
  - `endpointURL` string (optional) _(Added in: v1.14)_ — _Deprecated._ Use the first argument instead.
  - `headers` Object\<string, string\> (optional) _(Added in: v1.11)_ — Additional HTTP headers to be sent with connect request.
  - `isLocal` boolean (optional) _(Added in: v1.58)_ — Tells Playwright that it runs on the same host as the CDP server.
  - `logger` Logger (optional) _(Added in: v1.14)_ — _Deprecated._ Logger sink for Playwright logging.
  - `slowMo` number (optional) _(Added in: v1.11)_ — Slows down Playwright operations by the specified amount of milliseconds. Defaults to 0.
  - `timeout` number (optional) _(Added in: v1.11)_ — Maximum time in milliseconds to wait for the connection to be established. Defaults to 30000 (30 seconds). Pass 0 to disable timeout.

**Returns:** `Promise<Browser>`

### executablePath

**Added before:** v1.9

A path where Playwright expects to find a bundled browser executable.

```ts
browserType.executablePath();
```

**Returns:** `string`

### launch

**Added before:** v1.9

Returns the browser instance.

```ts
const browser = await chromium.launch({
  // Or 'firefox' or 'webkit'.
  ignoreDefaultArgs: ['--mute-audio'],
});
```

> **Warning:** Use custom browser args at your own risk, as some of them may break Playwright functionality.

**Arguments:**

- `options` Object (optional)
  - `args` Array\<string\> (optional) — Additional arguments to pass to the browser instance.
  - `artifactsDir` string (optional) — If specified, artifacts are saved into this directory.
  - `channel` string (optional) — Browser distribution channel. Use `"chromium"` for new headless mode. Use `"chrome"`, `"chrome-beta"`, `"msedge"`, etc. for branded browsers.
  - `chromiumSandbox` boolean (optional) — Enable Chromium sandboxing. Defaults to `false`.
  - `downloadsPath` string (optional) — If specified, accepted downloads are downloaded into this directory.
  - `env` Object\<string, string\> (optional) — Environment variables for the browser.
  - `executablePath` string (optional) — Path to a browser executable to run instead of the bundled one.
  - `firefoxUserPrefs` Object\<string, string | number | boolean\> (optional) — Firefox user preferences.
  - `handleSIGHUP` boolean (optional) — Close the browser process on SIGHUP. Defaults to `true`.
  - `handleSIGINT` boolean (optional) — Close the browser process on Ctrl-C. Defaults to `true`.
  - `handleSIGTERM` boolean (optional) — Close the browser process on SIGTERM. Defaults to `true`.
  - `headless` boolean (optional) — Whether to run browser in headless mode. Defaults to `true`.
  - `ignoreDefaultArgs` boolean | Array\<string\> (optional) — If `true`, Playwright does not pass its own configuration args. Dangerous option; use with care.
  - `logger` Logger (optional) — _Deprecated._ Logger sink for Playwright logging.
  - `proxy` Object (optional) — Network proxy settings.
    - `server` string
    - `bypass` string (optional)
    - `username` string (optional)
    - `password` string (optional)
  - `slowMo` number (optional) — Slows down Playwright operations by the specified amount of milliseconds.
  - `timeout` number (optional) — Maximum time in milliseconds to wait for the browser instance to start. Defaults to 30000. Pass 0 to disable timeout.
  - `tracesDir` string (optional) — If specified, traces are saved into this directory.

**Returns:** `Promise<Browser>`

### launchPersistentContext

**Added before:** v1.9

Returns the persistent browser context instance. Launches browser that uses persistent storage located at `userDataDir` and returns the only context. Closing this context will automatically close the browser.

```ts
await browserType.launchPersistentContext(userDataDir);
await browserType.launchPersistentContext(userDataDir, options);
```

> **Warning:** Chromium/Chrome: Due to recent Chrome policy changes, automating the default Chrome user profile is not supported. Create and use a separate directory as your automation profile instead.

**Arguments:**

- `userDataDir` string — Path to a User Data Directory, which stores browser session data like cookies and local storage. Pass an empty string to create a temporary directory.
- `options` Object (optional) — Accepts all `browser.newContext()` options plus browser-specific options:
  - `acceptDownloads` boolean (optional) — Whether to automatically download all attachments. Defaults to `true`.
  - `args` Array\<string\> (optional) — Additional arguments to pass to the browser instance.
  - `artifactsDir` string (optional) — If specified, artifacts are saved into this directory.
  - `baseURL` string (optional) — Base URL for `page.goto()`, `page.route()`, etc.
  - `bypassCSP` boolean (optional) — Toggles bypassing page's Content-Security-Policy. Defaults to `false`.
  - `channel` string (optional) — Browser distribution channel.
  - `chromiumSandbox` boolean (optional) — Enable Chromium sandboxing. Defaults to `false`.
  - `clientCertificates` Array\<Object\> (optional) _(Added in: 1.46)_ — TLS Client Authentication certificates.
  - `colorScheme` `null | "light" | "dark" | "no-preference"` (optional) — Emulates `prefers-colors-scheme`. Defaults to `'light'`.
  - `contrast` `null | "no-preference" | "more"` (optional) — Emulates `prefers-contrast`. Defaults to `'no-preference'`.
  - `deviceScaleFactor` number (optional) — Specify device scale factor. Defaults to `1`.
  - `downloadsPath` string (optional) — Downloads directory path.
  - `env` Object\<string, string\> (optional) — Environment variables for the browser.
  - `executablePath` string (optional) — Path to a browser executable.
  - `extraHTTPHeaders` Object\<string, string\> (optional) — Additional HTTP headers for every request.
  - `firefoxUserPrefs` Object\<string, string | number | boolean\> (optional) _(Added in: v1.40)_ — Firefox user preferences.
  - `forcedColors` `null | "active" | "none"` (optional) — Emulates `forced-colors`. Defaults to `'none'`.
  - `geolocation` Object (optional) — `latitude`, `longitude`, `accuracy`.
  - `handleSIGHUP` / `handleSIGINT` / `handleSIGTERM` boolean (optional) — Signal handlers. All default to `true`.
  - `hasTouch` boolean (optional) — Specifies if viewport supports touch events. Defaults to `false`.
  - `headless` boolean (optional) — Whether to run browser in headless mode. Defaults to `true`.
  - `httpCredentials` Object (optional) — Credentials for HTTP authentication.
  - `ignoreDefaultArgs` boolean | Array\<string\> (optional) — Dangerous option; use with care.
  - `ignoreHTTPSErrors` boolean (optional) — Whether to ignore HTTPS errors. Defaults to `false`.
  - `isMobile` boolean (optional) — Whether the meta viewport tag is taken into account. Defaults to `false`.
  - `javaScriptEnabled` boolean (optional) — Whether to enable JavaScript. Defaults to `true`.
  - `locale` string (optional) — Specify user locale.
  - `logger` Logger (optional) — _Deprecated._ Logger sink for Playwright logging.
  - `offline` boolean (optional) — Whether to emulate network being offline. Defaults to `false`.
  - `permissions` Array\<string\> (optional) — A list of permissions to grant to all pages.
  - `proxy` Object (optional) — Network proxy settings.
  - `recordHar` Object (optional) — Enables HAR recording.
  - `recordVideo` Object (optional) — Enables video recording.
  - `reducedMotion` `null | "reduce" | "no-preference"` (optional) — Emulates `prefers-reduced-motion`.
  - `screen` Object (optional) — `width` number, `height` number.
  - `serviceWorkers` `"allow" | "block"` (optional) — Whether to allow Service Workers. Defaults to `'allow'`.
  - `slowMo` number (optional) — Slows down Playwright operations by the specified amount of milliseconds.
  - `strictSelectors` boolean (optional) — Enables strict selectors mode. Defaults to `false`.
  - `timeout` number (optional) — Maximum time in milliseconds to wait for browser to start. Defaults to 30000.
  - `timezoneId` string (optional) — Changes the timezone of the context.
  - `tracesDir` string (optional) — If specified, traces are saved into this directory.
  - `userAgent` string (optional) — Specific user agent to use in this context.
  - `viewport` `null | Object` (optional) — `width` number, `height` number. Defaults to 1280x720.

**Returns:** `Promise<BrowserContext>`

### launchServer

**Added before:** v1.9

Returns the browser app instance. You can connect to it via `browserType.connect()`.

```ts
const { chromium } = require('playwright'); // Or 'webkit' or 'firefox'.
(async () => {
  const browserServer = await chromium.launchServer();
  const wsEndpoint = browserServer.wsEndpoint();
  // Use web socket endpoint later to establish a connection.
  const browser = await chromium.connect(wsEndpoint);
  // Close browser instance.
  await browserServer.close();
})();
```

**Arguments:**

- `options` Object (optional)
  - `args` Array\<string\> (optional) — Additional arguments to pass to the browser instance.
  - `artifactsDir` string (optional) — If specified, artifacts are saved into this directory.
  - `channel` string (optional) — Browser distribution channel.
  - `chromiumSandbox` boolean (optional) — Enable Chromium sandboxing. Defaults to `false`.
  - `downloadsPath` string (optional) — Downloads directory path.
  - `env` Object\<string, string\> (optional) — Environment variables for the browser.
  - `executablePath` string (optional) — Path to a browser executable.
  - `firefoxUserPrefs` Object\<string, string | number | boolean\> (optional) — Firefox user preferences.
  - `handleSIGHUP` / `handleSIGINT` / `handleSIGTERM` boolean (optional) — Signal handlers. All default to `true`.
  - `headless` boolean (optional) — Whether to run browser in headless mode. Defaults to `true`.
  - `host` string (optional) _(Added in: v1.45)_ — Host to use for the web socket.
  - `ignoreDefaultArgs` boolean | Array\<string\> (optional) — Dangerous option; use with care.
  - `logger` Logger (optional) — _Deprecated._ Logger sink for Playwright logging.
  - `port` number (optional) — Port to use for the web socket. Defaults to 0 (any available port).
  - `proxy` Object (optional) — Network proxy settings.
  - `timeout` number (optional) — Maximum time in milliseconds to wait for browser to start. Defaults to 30000.
  - `tracesDir` string (optional) — If specified, traces are saved into this directory.
  - `wsPath` string (optional) _(Added in: v1.15)_ — Path at which to serve the Browser Server. Defaults to an unguessable string.

> **Warning:** Any process or web page with knowledge of the `wsPath` can take control of the OS user. Use an unguessable token.

**Returns:** `Promise<BrowserServer>`

### name

**Added before:** v1.9

Returns browser name. For example: `'chromium'`, `'webkit'` or `'firefox'`.

```ts
browserType.name();
```

**Returns:** `string`
