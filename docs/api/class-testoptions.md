# 📦 Playwright — TestOptions

> **Source:** [playwright.dev/docs/api/class-testoptions](https://playwright.dev/docs/api/class-testoptions)

---

**TestOptions** provides many options to configure test execution. These options are usually provided in the configuration file through `use`.

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    // All pages will start in the Mobile Chrome mode.
    ...devices['Pixel 5'],
  },
});
```

## Properties

### `testOptions.acceptDownloads` — Added in: v1.10

Whether to automatically download all the attachments. Defaults to `true` where all the downloads are accepted.

**Type:** `boolean`

---

### `testOptions.actionTimeout` — Added in: v1.10

Default timeout for each Playwright action in milliseconds, defaults to `0` (no timeout).

**Type:** `number`

---

### `testOptions.baseURL` — Added in: v1.10

When using `page.goto()`, `page.route()`, `page.waitForURL()`, `page.waitForRequest()`, or `page.waitForResponse()` it takes the base URL in consideration by using the `URL()` constructor for building the respective URL.

**Type:** `string`

---

### `testOptions.browserName` — Added in: v1.10

Name of the browser that runs tests. Defaults to `'chromium'`. Most of the time you should set `browserName` in your `TestProject`.

**Type:** `"chromium" | "firefox" | "webkit"`

---

### `testOptions.bypassCSP` — Added in: v1.10

Toggles bypassing page's Content-Security-Policy. Defaults to `false`.

**Type:** `boolean`

---

### `testOptions.channel` — Added in: v1.10

Browser distribution channel. Supported values are `"chrome"`, `"chrome-beta"`, `"chrome-dev"`, `"chrome-canary"`, `"msedge"`, `"msedge-beta"`, `"msedge-dev"`, `"msedge-canary"`. Read more about using Google Chrome and Microsoft Edge.

**Type:** `string`

---

### `testOptions.clientCertificates` — Added in: v1.46

TLS Client Authentication allows the server to request a client certificate and verify it.

**Type:** `Array<Object>`

- `certPath` `string` (optional) — Path to the file with the certificate in PEM format.
- `keyPath` `string` (optional) — Path to the file with the private key in PEM format.
- `pfxPath` `string` (optional) — Path to the PFX or PKCS12 encoded private key and certificate chain.
- `passphrase` `string` (optional) — Passphrase for the private key (PEM or PFX).
- `origin` `string` — Exact origin that the certificate is valid for.

---

### `testOptions.colorScheme` — Added in: v1.10

Emulates `prefers-colors-scheme` media feature, supported values are `'light'`, `'dark'`, `'no-preference'`. See `page.emulateMedia()` for more details. Passing `null` resets emulation to system defaults. Defaults to `'light'`.

**Type:** `"light" | "dark" | "no-preference" | null`

---

### `testOptions.connectOptions` — Added in: v1.10

When connect options are specified, default `fixtures.browser`, `fixtures.context` and `fixtures.page` use the remote browser instead of launching a local browser.

**Type:** `Object`

- `wsEndpoint` `string` — A WebSocket endpoint to connect to.
- `headers` `Object<string, string>` (optional) — Additional HTTP headers to be sent with web socket connect request.
- `timeout` `number` (optional) — Timeout in milliseconds for the connection to be established. Optional, defaults to no timeout.
- `exposeNetwork` `string` (optional) — Option to expose network available on the connecting client to the browser being connected to.
- `slowMo` `number` (optional) — Slows down Playwright operations by the specified amount of milliseconds.

---

### `testOptions.contextOptions` — Added in: v1.10

Options used to create the context, as passed to `browser.newContext()`. Specific options like `testOptions.viewport` take priority over this.

**Type:** `Object`

---

### `testOptions.deviceScaleFactor` — Added in: v1.10

Specify device scale factor (can be thought of as a DPR). Defaults to `1`. Learn more about emulation with device scale factor.

**Type:** `number`

---

### `testOptions.extraHTTPHeaders` — Added in: v1.10

An object containing additional HTTP headers to be sent with every request.

**Type:** `Object<string, string>`

---

### `testOptions.geolocation` — Added in: v1.10

Emulates geolocation coordinates.

**Type:** `Object`

- `latitude` `number` — Latitude between `-90` and `90`.
- `longitude` `number` — Longitude between `-180` and `180`.
- `accuracy` `number` (optional) — Non-negative accuracy value. Defaults to `0`.

---

### `testOptions.hasTouch` — Added in: v1.10

Specifies if viewport supports touch events. Defaults to `false`. Learn more about mobile emulation.

**Type:** `boolean`

---

### `testOptions.headless` — Added in: v1.10

Whether to run the browser in headless mode. More details for Chromium and Firefox. Defaults to `true` unless the `devtools` option is `true`.

**Type:** `boolean`

---

### `testOptions.httpCredentials` — Added in: v1.10

Credentials for HTTP authentication. If no `origin` is specified, the username and password are sent to any servers upon unauthorized responses.

**Type:** `Object`

- `username` `string`
- `password` `string`
- `origin` `string` (optional) — Restrict sending HTTP credentials on a specific origin (`scheme://host:port`).
- `send` `"unauthorized" | "always"` (optional) — Strategy for when to send credentials. Defaults to `'unauthorized'`.

---

### `testOptions.ignoreHTTPSErrors` — Added in: v1.10

Whether to ignore HTTPS errors when sending network requests. Defaults to `false`.

**Type:** `boolean`

---

### `testOptions.isMobile` — Added in: v1.10

Whether the `meta viewport` tag is taken into account and touch events are enabled. `isMobile` is a part of a device, so you usually don't need to set it manually. Defaults to `false` and is not supported in Firefox.

**Type:** `boolean`

---

### `testOptions.javaScriptEnabled` — Added in: v1.10

Whether or not to enable JavaScript in the context. Defaults to `true`. Learn more about disabling JavaScript.

**Type:** `boolean`

---

### `testOptions.launchOptions` — Added in: v1.10

Options used to launch the browser, as passed to `browserType.launch()`. Specific options like `testOptions.headless` and `testOptions.channel` take priority over this.

> **Warning:** Use custom browser args at your own risk, as some of them may break Playwright functionality.

**Type:** `Object`

---

### `testOptions.locale` — Added in: v1.10

Specify user locale, for example `en-GB`, `de-DE`, etc. Locale will affect `navigator.language` value, `Accept-Language` request header value as well as number and date formatting rules. Defaults to `en-US`.

**Type:** `string`

---

### `testOptions.navigationTimeout` — Added in: v1.10

Timeout for each navigation action in milliseconds. Defaults to `0` (no timeout). This is a default navigation timeout, same as configured via `page.setDefaultNavigationTimeout()`.

**Type:** `number`

---

### `testOptions.offline` — Added in: v1.10

Whether to emulate network being offline. Defaults to `false`.

**Type:** `boolean`

---

### `testOptions.permissions` — Added in: v1.10

A list of permissions to grant to all pages in this context. See `browserContext.grantPermissions()` for more details. Defaults to none.

**Type:** `Array<string>`

---

### `testOptions.proxy` — Added in: v1.10

Network proxy settings.

**Type:** `Object`

- `server` `string` — Proxy to be used for all requests. HTTP and SOCKS proxies are supported, for example `http://myproxy.com:3128` or `socks5://myproxy.com:3128`.
- `bypass` `string` (optional) — Optional comma-separated domains to bypass proxy, for example `".com, chromium.org, .domain.com"`.
- `username` `string` (optional) — Optional username to use if HTTP proxy requires authentication.
- `password` `string` (optional) — Optional password to use if HTTP proxy requires authentication.

---

### `testOptions.screenshot` — Added in: v1.10

Whether to automatically capture a screenshot after each test. Defaults to `'off'`.

- `'off'` — Do not capture screenshots.
- `'on'` — Capture screenshot after each test.
- `'only-on-failure'` — Capture screenshot after each test failure.
- `'on-first-failure'` — Capture screenshot after each test's first failure.

**Type:** `"off" | "on" | "only-on-failure" | "on-first-failure" | Object`

- `mode` `"off" | "on" | "only-on-failure" | "on-first-failure"` — Automatic screenshot mode.
- `fullPage` `boolean` (optional) — When `true`, takes a screenshot of the full scrollable page. Defaults to `false`.
- `omitBackground` `boolean` (optional) — Hides default white background and allows capturing screenshots with transparency. Not applicable to JPEG images. Defaults to `false`.

---

### `testOptions.serviceWorkers` — Added in: v1.10

Whether to allow sites to register Service Workers. Defaults to `'allow'`.

- `'allow'` — Service Workers can be registered.
- `'block'` — Playwright will block all registration of Service Workers.

**Type:** `"allow" | "block"`

---

### `testOptions.storageState` — Added in: v1.10

Populates context with given storage state. This option can be used to initialize context with logged-in information obtained via `browserContext.storageState()`. Learn more about storage state and auth.

**Type:** `string | Object`

- `cookies` `Array<Object>` — Cookies to set for context.
- `origins` `Array<Object>` — Origins with localStorage data to set for context.

---

### `testOptions.testIdAttribute` — Added in: v1.27

Custom attribute to be used in `page.getByTestId()`. `data-testid` is used by default.

**Type:** `string`

---

### `testOptions.timezoneId` — Added in: v1.10

Changes the timezone of the context. See ICU's `metaZones.txt` for a list of supported timezone IDs. Defaults to the system timezone.

**Type:** `string`

---

### `testOptions.trace` — Added in: v1.10

Whether to record trace for each test. Defaults to `'off'`.

- `'off'` — Do not record trace.
- `'on'` — Record trace for each test.
- `'on-first-retry'` — Record trace only when retrying a test for the first time.
- `'on-all-retries'` — Record trace only when retrying a test.
- `'retain-on-failure'` — Record trace for each test. When test run passes, remove the recorded trace.
- `'retain-on-first-failure'` — Record trace for the first run of each test, but not for retries.
- `'retain-on-failure-and-retries'` — Record trace for each test run. Retains all traces when an attempt fails.

**Type:** `"off" | "on" | "retain-on-failure" | "on-first-retry" | "on-all-retries" | "retain-on-first-failure" | "retain-on-failure-and-retries" | Object`

- `mode` `"off" | "on" | "retain-on-failure" | "on-first-retry" | "on-all-retries" | "retain-on-first-failure" | "retain-on-failure-and-retries"` — Trace recording mode.
- `attachments` `boolean` (optional) — Whether to include test attachments. Defaults to `true`.
- `screenshots` `boolean` (optional) — Whether to capture screenshots during tracing. Defaults to `true`.
- `snapshots` `boolean` (optional) — Whether to capture DOM snapshot on every action. Defaults to `true`.
- `sources` `boolean` (optional) — Whether to include source files for trace actions. Defaults to `true`.

---

### `testOptions.userAgent` — Added in: v1.10

Specific user agent to use in this context.

**Type:** `string`

---

### `testOptions.video` — Added in: v1.10

Whether to record video for each test. Defaults to `'off'`.

- `'off'` — Do not record video.
- `'on'` — Record video for each test.
- `'retain-on-failure'` — Record video for each test, but remove all videos from successful test runs.
- `'on-first-retry'` — Record video only when retrying a test for the first time.

**Type:** `"off" | "on" | "retain-on-failure" | "on-first-retry" | Object`

- `mode` `"off" | "on" | "retain-on-failure" | "on-first-retry"` — Video recording mode.
- `size` `Object` (optional) — Size of the recorded video. If not specified, the size will be equal to `testOptions.viewport` scaled down to fit into `800x800`.
  - `width` `number`
  - `height` `number`

---

### `testOptions.viewport` — Added in: v1.10

Emulates consistent viewport for each page. Defaults to an `1280x720` viewport. Use `null` to disable the consistent viewport emulation.

> **Note:** The `null` value opts out from the default presets, makes viewport depend on the host window size defined by the operating system. It makes the execution of the tests non-deterministic.

**Type:** `null | Object`

- `width` `number` — Page width in pixels.
- `height` `number` — Page height in pixels.
