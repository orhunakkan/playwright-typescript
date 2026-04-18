# 🌐 Playwright — BrowserContext

> **Source:** [playwright.dev/docs/api/class-browsercontext](https://playwright.dev/docs/api/class-browsercontext)

---

**BrowserContexts** provide a way to operate multiple independent browser sessions. If a page opens another page, e.g. with a `window.open` call, the popup will belong to the parent page's browser context. Playwright allows creating isolated non-persistent browser contexts with `browser.newContext()` method. Non-persistent browser contexts don't write any browsing data to disk.

```ts
// Create a new incognito browser context
const context = await browser.newContext();
// Create a new page inside context.
const page = await context.newPage();
await page.goto('https://example.com');
// Dispose context once it's no longer needed.
await context.close();
```

---

## Methods

### addCookies

**Added before:** v1.9

Adds cookies into this browser context. All pages within this context will have these cookies installed. Cookies can be obtained via `browserContext.cookies()`.

```ts
await browserContext.addCookies([cookieObject1, cookieObject2]);
```

**Arguments:**

- `cookies` Array\<Object\>
  - `name` string
  - `value` string
  - `url` string (optional) — Either url or both domain and path are required.
  - `domain` string (optional) — For the cookie to apply to all subdomains as well, prefix domain with a dot, like this: `".example.com"`. Either url or both domain and path are required.
  - `path` string (optional) — Either url or both domain and path are required.
  - `expires` number (optional) — Unix time in seconds.
  - `httpOnly` boolean (optional)
  - `secure` boolean (optional)
  - `sameSite` `"Strict" | "Lax" | "None"` (optional)
  - `partitionKey` string (optional) — For partitioned third-party cookies (aka CHIPS), the partition key.

**Returns:** `Promise<void>`

---

### addInitScript

**Added before:** v1.9

Adds a script which would be evaluated in one of the following scenarios:

- Whenever a page is created in the browser context or is navigated.
- Whenever a child frame is attached or navigated in any page in the browser context.

The script is evaluated after the document was created but before any of its scripts were run.

```ts
// preload.js
Math.random = () => 42;

// In your playwright script, assuming the preload.js file is in same directory.
await browserContext.addInitScript({ path: 'preload.js' });
```

> **Note:** The order of evaluation of multiple scripts installed via `browserContext.addInitScript()` and `page.addInitScript()` is not defined.

**Arguments:**

- `script` function | string | Object
  - `path` string (optional) — Path to the JavaScript file.
  - `content` string (optional) — Raw script content.
- `arg` Serializable (optional) — Optional argument to pass to script (only supported when passing a function).

**Returns:** `Promise<Disposable>`

---

### browser

**Added before:** v1.9

Gets the browser instance that owns the context. Returns null if the context is created outside of normal browser, e.g. Android or Electron.

```ts
browserContext.browser();
```

**Returns:** `null | Browser`

---

### clearCookies

**Added before:** v1.9

Removes cookies from context. Accepts optional filter.

```ts
await context.clearCookies();
await context.clearCookies({ name: 'session-id' });
await context.clearCookies({ domain: 'my-origin.com' });
await context.clearCookies({ domain: /.*my-origin\.com/ });
await context.clearCookies({ path: '/api/v1' });
await context.clearCookies({ name: 'session-id', domain: 'my-origin.com' });
```

**Arguments:**

- `options` Object (optional)
  - `domain` string | RegExp (optional) _(Added in: v1.43)_ — Only removes cookies with the given domain.
  - `name` string | RegExp (optional) _(Added in: v1.43)_ — Only removes cookies with the given name.
  - `path` string | RegExp (optional) _(Added in: v1.43)_ — Only removes cookies with the given path.

**Returns:** `Promise<void>`

---

### clearPermissions

**Added before:** v1.9

Clears all permission overrides for the browser context.

```ts
const context = await browser.newContext();
await context.grantPermissions(['clipboard-read']);
// do stuff ..
context.clearPermissions();
```

**Returns:** `Promise<void>`

---

### close

**Added before:** v1.9

Closes the browser context. All the pages that belong to the browser context will be closed.

> **Note:** The default browser context cannot be closed.

```ts
await browserContext.close();
await browserContext.close(options);
```

**Arguments:**

- `options` Object (optional)
  - `reason` string (optional) _(Added in: v1.40)_ — The reason to be reported to the operations interrupted by the context closure.

**Returns:** `Promise<void>`

---

### cookies

**Added before:** v1.9

If no URLs are specified, this method returns all cookies. If URLs are specified, only cookies that affect those URLs are returned.

```ts
await browserContext.cookies();
await browserContext.cookies(urls);
```

**Arguments:**

- `urls` string | Array\<string\> (optional) — Optional list of URLs.

**Returns:** `Promise<Array<Object>>`

- `name` string
- `value` string
- `domain` string
- `path` string
- `expires` number — Unix time in seconds.
- `httpOnly` boolean
- `secure` boolean
- `sameSite` `"Strict" | "Lax" | "None"`
- `partitionKey` string (optional)

---

### exposeBinding

**Added before:** v1.9

The method adds a function called `name` on the `window` object of every frame in every page in the context. When called, the function executes `callback` and returns a Promise which resolves to the return value of callback. The first argument of the callback function contains information about the caller: `{ browserContext: BrowserContext, page: Page, frame: Frame }`. See `page.exposeBinding()` for page-only version.

```ts
const { webkit } = require('playwright'); // Or 'chromium' or 'firefox'.
(async () => {
  const browser = await webkit.launch({ headless: false });
  const context = await browser.newContext();
  await context.exposeBinding('pageURL', ({ page }) => page.url());
  const page = await context.newPage();
  await page.setContent(`
    <script>
      async function onClick() {
        document.querySelector('div').textContent = await window.pageURL();
      }
    </script>
    <button onclick="onClick()">Click me</button>
    <div></div>
  `);
  await page.getByRole('button').click();
})();
```

**Arguments:**

- `name` string — Name of the function on the window object.
- `callback` function — Callback function that will be called in the Playwright's context.
- `options` Object (optional)
  - `handle` boolean (optional) — _Deprecated._ Whether to pass the argument as a handle, instead of passing by value.

**Returns:** `Promise<Disposable>`

---

### exposeFunction

**Added before:** v1.9

The method adds a function called `name` on the `window` object of every frame in every page in the context. See `page.exposeFunction()` for page-only version.

```ts
const { webkit } = require('playwright'); // Or 'chromium' or 'firefox'.
const crypto = require('crypto');
(async () => {
  const browser = await webkit.launch({ headless: false });
  const context = await browser.newContext();
  await context.exposeFunction('sha256', (text) => crypto.createHash('sha256').update(text).digest('hex'));
  const page = await context.newPage();
  await page.setContent(`
    <script>
      async function onClick() {
        document.querySelector('div').textContent = await window.sha256('PLAYWRIGHT');
      }
    </script>
    <button onclick="onClick()">Click me</button>
    <div></div>
  `);
  await page.getByRole('button').click();
})();
```

**Arguments:**

- `name` string — Name of the function on the window object.
- `callback` function — Callback function that will be called in the Playwright's context.

**Returns:** `Promise<Disposable>`

---

### grantPermissions

**Added before:** v1.9

Grants specified permissions to the browser context. Only grants corresponding permissions to the given origin if specified.

```ts
await browserContext.grantPermissions(permissions);
await browserContext.grantPermissions(permissions, options);
```

**Arguments:**

- `permissions` Array\<string\> — A list of permissions to grant.

  > **Danger:** Supported permissions differ between browsers, and even between different versions of the same browser. Supported permissions include: `'accelerometer'`, `'ambient-light-sensor'`, `'background-sync'`, `'camera'`, `'clipboard-read'`, `'clipboard-write'`, `'geolocation'`, `'gyroscope'`, `'local-fonts'`, `'local-network-access'`, `'magnetometer'`, `'microphone'`, `'midi-sysex'`, `'midi'`, `'notifications'`, `'payment-handler'`, `'storage-access'`, `'screen-wake-lock'`.

- `options` Object (optional)
  - `origin` string (optional) — The origin to grant permissions to, e.g. `"https://example.com"`.

**Returns:** `Promise<void>`

---

### isClosed

**Added in:** v1.59

Indicates that the browser context is in the process of closing or has already been closed.

```ts
browserContext.isClosed();
```

**Returns:** `boolean`

---

### newCDPSession

**Added in:** v1.11

Returns the newly created session.

> **Note:** CDP sessions are only supported on Chromium-based browsers.

```ts
await browserContext.newCDPSession(page);
```

**Arguments:**

- `page` Page | Frame — Target to create new session for.

**Returns:** `Promise<CDPSession>`

---

### newPage

**Added before:** v1.9

Creates a new page in the browser context.

```ts
await browserContext.newPage();
```

**Returns:** `Promise<Page>`

---

### pages

**Added before:** v1.9

Returns all open pages in the context.

```ts
browserContext.pages();
```

**Returns:** `Array<Page>`

---

### removeAllListeners

**Added in:** v1.47

Removes all the listeners of the given type (or all registered listeners if no type given). Allows to wait for async listeners to complete or to ignore subsequent errors from these listeners.

```ts
await browserContext.removeAllListeners();
await browserContext.removeAllListeners(type, options);
```

**Arguments:**

- `type` string (optional)
- `options` Object (optional)
  - `behavior` `"wait" | "ignoreErrors" | "default"` (optional) — Specifies whether to wait for already running listeners.

**Returns:** `Promise<void>`

---

### route

**Added before:** v1.9

Routing provides the capability to modify network requests that are made by any page in the browser context. Once route is enabled, every request matching the url pattern will stall unless it's continued, fulfilled or aborted.

> **Note:** `browserContext.route()` will not intercept requests intercepted by Service Worker. We recommend disabling Service Workers when using request interception by setting `serviceWorkers` to `'block'`.

```ts
const context = await browser.newContext();
await context.route('**/*.{png,jpg,jpeg}', (route) => route.abort());
const page = await context.newPage();
await page.goto('https://example.com');
await browser.close();
```

```ts
const context = await browser.newContext();
await context.route(/(\.png$)|(\.jpg$)/, (route) => route.abort());
const page = await context.newPage();
await page.goto('https://example.com');
await browser.close();
```

```ts
await context.route('/api/**', async (route) => {
  if (route.request().postData().includes('my-string')) await route.fulfill({ body: 'mocked-data' });
  else await route.continue();
});
```

**Arguments:**

- `url` string | RegExp | URLPattern | function(URL):boolean — A glob pattern, regex pattern, URL pattern, or predicate that receives a URL to match during routing.
- `handler` function(Route, Request):Promise\<Object\> | Object — Handler function to route the request.
- `options` Object (optional)
  - `times` number (optional) _(Added in: v1.15)_ — How often a route should be used. By default it will be used every time.

**Returns:** `Promise<Disposable>`

---

### routeFromHAR

**Added in:** v1.23

If specified the network requests that are made in the context will be served from the HAR file.

```ts
await browserContext.routeFromHAR(har);
await browserContext.routeFromHAR(har, options);
```

**Arguments:**

- `har` string — Path to a HAR file with prerecorded network data.
- `options` Object (optional)
  - `notFound` `"abort" | "fallback"` (optional) — If set to `'abort'` any request not found in the HAR file will be aborted. If set to `'fallback'` falls through to the next route handler. Defaults to `abort`.
  - `update` boolean (optional) — If specified, updates the given HAR with the actual network information instead of serving from file.
  - `updateContent` `"embed" | "attach"` (optional) _(Added in: v1.32)_
  - `updateMode` `"full" | "minimal"` (optional) _(Added in: v1.32)_ — Defaults to `minimal`.
  - `url` string | RegExp (optional) — A glob pattern or regular expression to match the request URL.

**Returns:** `Promise<void>`

---

### routeWebSocket

**Added in:** v1.48

This method allows to modify websocket connections that are made by any page in the browser context. Note that only WebSockets created after this method was called will be routed.

```ts
await context.routeWebSocket('/ws', async (ws) => {
  ws.routeSend((message) => {
    if (message === 'to-be-blocked') return;
    ws.send(message);
  });
  await ws.connect();
});
```

**Arguments:**

- `url` string | RegExp | function(URL):boolean — Only WebSockets with the url matching this pattern will be routed.
- `handler` function(WebSocketRoute):Promise\<Object\> | Object — Handler function to route the WebSocket.

**Returns:** `Promise<void>`

---

### serviceWorkers

**Added in:** v1.11

All existing service workers in the context.

> **Note:** Service workers are only supported on Chromium-based browsers.

```ts
browserContext.serviceWorkers();
```

**Returns:** `Array<Worker>`

---

### setDefaultNavigationTimeout

**Added before:** v1.9

This setting will change the default maximum navigation time for the following methods and related shortcuts: `page.goBack()`, `page.goForward()`, `page.goto()`, `page.reload()`, `page.setContent()`, `page.waitForNavigation()`.

> **Note:** `page.setDefaultNavigationTimeout()` and `page.setDefaultTimeout()` take priority over `browserContext.setDefaultNavigationTimeout()`.

```ts
browserContext.setDefaultNavigationTimeout(timeout);
```

**Arguments:**

- `timeout` number — Maximum navigation time in milliseconds.

---

### setDefaultTimeout

**Added before:** v1.9

This setting will change the default maximum time for all the methods accepting `timeout` option.

> **Note:** `page.setDefaultNavigationTimeout()`, `page.setDefaultTimeout()` and `browserContext.setDefaultNavigationTimeout()` take priority over `browserContext.setDefaultTimeout()`.

```ts
browserContext.setDefaultTimeout(timeout);
```

**Arguments:**

- `timeout` number — Maximum time in milliseconds. Pass 0 to disable timeout.

---

### setExtraHTTPHeaders

**Added before:** v1.9

The extra HTTP headers will be sent with every request initiated by any page in the context. These headers are merged with page-specific extra HTTP headers set with `page.setExtraHTTPHeaders()`.

> **Note:** `browserContext.setExtraHTTPHeaders()` does not guarantee the order of headers in the outgoing requests.

```ts
await browserContext.setExtraHTTPHeaders(headers);
```

**Arguments:**

- `headers` Object\<string, string\> — An object containing additional HTTP headers to be sent with every request. All header values must be strings.

**Returns:** `Promise<void>`

---

### setGeolocation

**Added before:** v1.9

Sets the context's geolocation. Passing `null` or `undefined` emulates position unavailable.

```ts
await browserContext.setGeolocation({ latitude: 59.95, longitude: 30.31667 });
```

> **Note:** Consider using `browserContext.grantPermissions()` to grant permissions for the browser context pages to read its geolocation.

**Arguments:**

- `geolocation` null | Object
  - `latitude` number — Latitude between -90 and 90.
  - `longitude` number — Longitude between -180 and 180.
  - `accuracy` number (optional) — Non-negative accuracy value. Defaults to `0`.

**Returns:** `Promise<void>`

---

### setOffline

**Added before:** v1.9

```ts
await browserContext.setOffline(offline);
```

**Arguments:**

- `offline` boolean — Whether to emulate network being offline for the browser context.

**Returns:** `Promise<void>`

---

### setStorageState

**Added in:** v1.59

Clears the existing cookies, local storage and IndexedDB entries for all origins and sets the new storage state.

```ts
// Load storage state from a file and apply it to the context.
await context.setStorageState('state.json');
```

**Arguments:**

- `storageState` string | Object — Populates context with given storage state.

**Returns:** `Promise<void>`

---

### storageState

**Added before:** v1.9

Returns storage state for this browser context, contains current cookies, local storage snapshot and IndexedDB snapshot.

```ts
await browserContext.storageState();
await browserContext.storageState(options);
```

**Arguments:**

- `options` Object (optional)
  - `indexedDB` boolean (optional) _(Added in: v1.51)_ — Set to true to include IndexedDB in the storage state snapshot.
  - `path` string (optional) — The file path to save the storage state to.

**Returns:** `Promise<Object>`

---

### unroute

**Added before:** v1.9

Removes a route created with `browserContext.route()`. When handler is not specified, removes all routes for the url.

```ts
await browserContext.unroute(url);
await browserContext.unroute(url, handler);
```

**Arguments:**

- `url` string | RegExp | URLPattern | function(URL):boolean — A glob pattern, regex pattern, URL pattern, or predicate.
- `handler` function(Route, Request):Promise\<Object\> | Object (optional) — Optional handler function used to register a routing.

**Returns:** `Promise<void>`

---

### unrouteAll

**Added in:** v1.41

Removes all routes created with `browserContext.route()` and `browserContext.routeFromHAR()`.

```ts
await browserContext.unrouteAll();
await browserContext.unrouteAll(options);
```

**Arguments:**

- `options` Object (optional)
  - `behavior` `"wait" | "ignoreErrors" | "default"` (optional) — Specifies whether to wait for already running handlers.

**Returns:** `Promise<void>`

---

### waitForEvent

**Added before:** v1.9

Waits for event to fire and passes its value into the predicate function. Returns when the predicate returns truthy value. Will throw an error if the context closes before the event is fired.

```ts
const pagePromise = context.waitForEvent('page');
await page.getByRole('button').click();
const page = await pagePromise;
```

**Arguments:**

- `event` string — Event name, same one would pass into `browserContext.on(event)`.
- `optionsOrPredicate` function | Object (optional) — Either a predicate that receives an event or an options object.
  - `predicate` function — Receives the event data and resolves to truthy value when the waiting should resolve.
  - `timeout` number (optional) — Maximum time to wait for in milliseconds. Defaults to 0 - no timeout.

**Returns:** `Promise<Object>`

---

## Properties

### clock

**Added in:** v1.45

Playwright has ability to mock clock and passage of time.

**Type:** `Clock`

---

### debugger

**Added in:** v1.59

Debugger allows to pause and resume the execution.

**Type:** `Debugger`

---

### request

**Added in:** v1.16

API testing helper associated with this context. Requests made with this API will use context cookies.

**Type:** `APIRequestContext`

---

### tracing

**Added in:** v1.12

**Type:** `Tracing`

---

## Events

### on('close')

**Added before:** v1.9

Emitted when Browser context gets closed. This might happen because of one of the following:

- Browser context is closed.
- Browser application is closed or crashed.
- The `browser.close()` method was called.

```ts
browserContext.on('close', (data) => {});
```

**Event data:** `BrowserContext`

---

### on('console')

**Added in:** v1.34

Emitted when JavaScript within the page calls one of console API methods, e.g. `console.log` or `console.dir`.

```ts
context.on('console', async (msg) => {
  const values = [];
  for (const arg of msg.args()) values.push(await arg.jsonValue());
  console.log(...values);
});
await page.evaluate(() => console.log('hello', 5, { foo: 'bar' }));
```

**Event data:** `ConsoleMessage`

---

### on('dialog')

**Added in:** v1.34

Emitted when a JavaScript dialog appears, such as alert, prompt, confirm or beforeunload. Listener must either `dialog.accept()` or `dialog.dismiss()` the dialog.

```ts
context.on('dialog', (dialog) => {
  dialog.accept();
});
```

> **Note:** When no `page.on('dialog')` or `browserContext.on('dialog')` listeners are present, all dialogs are automatically dismissed.

**Event data:** `Dialog`

---

### on('page')

**Added before:** v1.9

The event is emitted when a new Page is created in the BrowserContext. The page may still be loading. The event will also fire for popup pages.

```ts
const newPagePromise = context.waitForEvent('page');
await page.getByText('open new page').click();
const newPage = await newPagePromise;
console.log(await newPage.evaluate('location.href'));
```

**Event data:** `Page`

---

### on('request')

**Added in:** v1.12

Emitted when a request is issued from any pages created through this context. The request object is read-only. To only listen for requests from a particular page, use `page.on('request')`.

```ts
browserContext.on('request', (data) => {});
```

**Event data:** `Request`

---

### on('requestfailed')

**Added in:** v1.12

Emitted when a request fails, for example by timing out. To only listen for failed requests from a particular page, use `page.on('requestfailed')`.

> **Note:** HTTP Error responses, such as 404 or 503, are still successful responses from HTTP standpoint, so request will complete with `browserContext.on('requestfinished')` event and not with `browserContext.on('requestfailed')`.

```ts
browserContext.on('requestfailed', (data) => {});
```

**Event data:** `Request`

---

### on('requestfinished')

**Added in:** v1.12

Emitted when a request finishes successfully after downloading the response body. For a successful response, the sequence of events is `request`, `response` and `requestfinished`.

```ts
browserContext.on('requestfinished', (data) => {});
```

**Event data:** `Request`

---

### on('response')

**Added in:** v1.12

Emitted when response status and headers are received for a request. For a successful response, the sequence of events is `request`, `response` and `requestfinished`.

```ts
browserContext.on('response', (data) => {});
```

**Event data:** `Response`

---

### on('serviceworker')

**Added in:** v1.11

Emitted when new service worker is created in the context.

> **Note:** Service workers are only supported on Chromium-based browsers.

```ts
browserContext.on('serviceworker', (data) => {});
```

**Event data:** `Worker`

---

### on('weberror')

**Added in:** v1.38

Emitted when exception is unhandled in any of the pages in this context. To listen for errors from a particular page, use `page.on('pageerror')` instead.

```ts
browserContext.on('weberror', (data) => {});
```

**Event data:** `WebError`

---

## Deprecated

### on('backgroundpage')

**Added in:** v1.11

_Deprecated: Background pages have been removed from Chromium together with Manifest V2 extensions. This event is not emitted._

```ts
browserContext.on('backgroundpage', (data) => {});
```

---

### backgroundPages

**Added in:** v1.11

_Deprecated: Background pages have been removed from Chromium together with Manifest V2 extensions. Returns an empty list._

```ts
browserContext.backgroundPages();
```

**Returns:** `Array<Page>`

---

### setHTTPCredentials

**Added before:** v1.9

_Deprecated: Browsers may cache credentials after successful authentication. Create a new browser context instead._

```ts
await browserContext.setHTTPCredentials(httpCredentials);
```

**Arguments:**

- `httpCredentials` null | Object
  - `username` string
  - `password` string

**Returns:** `Promise<void>`
