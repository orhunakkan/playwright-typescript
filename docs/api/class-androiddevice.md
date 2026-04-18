# 📦 Playwright — AndroidDevice

> **Source:** [playwright.dev/docs/api/class-androiddevice](https://playwright.dev/docs/api/class-androiddevice)

---

## Overview

**AndroidDevice** represents a connected device, either real hardware or emulated. Devices can be obtained using `android.devices()`.

---

## Methods

### close

**Added in:** v1.9

Disconnects from the device.

```ts
await androidDevice.close();
```

**Returns:** `Promise<void>`

---

### drag

**Added in:** v1.9

Drags the widget defined by selector towards dest point.

```ts
await androidDevice.drag(selector, dest);
await androidDevice.drag(selector, dest, options);
```

**Arguments:**

- `selector` [AndroidSelector] — Selector to drag.
- `dest` Object
  - `x` number
  - `y` number — Point to drag to.
- `options` Object (optional)
  - `speed` number (optional) — Optional speed of the drag in pixels per second.
  - `timeout` number (optional) — Maximum time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout. The default value can be changed by using the `androidDevice.setDefaultTimeout()` method.

**Returns:** `Promise<void>`

---

### fill

**Added in:** v1.9

Fills the specific selector input box with text.

```ts
await androidDevice.fill(selector, text);
await androidDevice.fill(selector, text, options);
```

**Arguments:**

- `selector` [AndroidSelector] — Selector to fill.
- `text` string — Text to be filled in the input box.
- `options` Object (optional)
  - `timeout` number (optional) — Maximum time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout. The default value can be changed by using the `androidDevice.setDefaultTimeout()` method.

**Returns:** `Promise<void>`

---

### fling

**Added in:** v1.9

Flings the widget defined by selector in the specified direction.

```ts
await androidDevice.fling(selector, direction);
await androidDevice.fling(selector, direction, options);
```

**Arguments:**

- `selector` [AndroidSelector] — Selector to fling.
- `direction` `"down" | "up" | "left" | "right"` — Fling direction.
- `options` Object (optional)
  - `speed` number (optional) — Optional speed of the fling in pixels per second.
  - `timeout` number (optional) — Maximum time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.

**Returns:** `Promise<void>`

---

### info

**Added in:** v1.9

Returns information about a widget defined by selector.

```ts
await androidDevice.info(selector);
```

**Arguments:**

- `selector` [AndroidSelector] — Selector to return information about.

**Returns:** `Promise<AndroidElementInfo>`

---

### installApk

**Added in:** v1.9

Installs an apk on the device.

```ts
await androidDevice.installApk(file);
await androidDevice.installApk(file, options);
```

**Arguments:**

- `file` string | Buffer — Either a path to the apk file, or apk file content.
- `options` Object (optional)
  - `args` Array\<string\> (optional) — Optional arguments to pass to the `shell:cmd package install` call. Defaults to `-r -t -S`.

**Returns:** `Promise<void>`

---

### launchBrowser

**Added in:** v1.9

Launches Chrome browser on the device, and returns its persistent context.

```ts
await androidDevice.launchBrowser();
await androidDevice.launchBrowser(options);
```

**Arguments:**

- `options` Object (optional)
  - `acceptDownloads` boolean (optional) — Whether to automatically download all the attachments. Defaults to `true`.
  - `args` Array\<string\> (optional) _(Added in: v1.29)_ — Additional arguments to pass to the browser instance.

    > **Warning:** Use custom browser args at your own risk, as some of them may break Playwright functionality.

  - `baseURL` string (optional) — When using `page.goto()`, `page.route()`, etc., takes the base URL into consideration by using the `URL()` constructor for building the corresponding URL.
  - `bypassCSP` boolean (optional) — Toggles bypassing page's Content-Security-Policy. Defaults to `false`.
  - `colorScheme` `null | "light" | "dark" | "no-preference"` (optional) — Emulates `prefers-colors-scheme` media feature. Defaults to `'light'`.
  - `contrast` `null | "no-preference" | "more"` (optional) — Emulates `prefers-contrast` media feature. Defaults to `'no-preference'`.
  - `deviceScaleFactor` number (optional) — Specify device scale factor. Defaults to `1`.
  - `extraHTTPHeaders` Object\<string, string\> (optional) — Additional HTTP headers to be sent with every request.
  - `forcedColors` `null | "active" | "none"` (optional) — Emulates `forced-colors` media feature. Defaults to `'none'`.
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
  - `javaScriptEnabled` boolean (optional) — Whether to enable JavaScript in the context. Defaults to `true`.
  - `locale` string (optional) — Specify user locale, for example `en-GB`, `de-DE`.
  - `logger` Logger (optional) — _Deprecated._ Logger sink for Playwright logging.
  - `offline` boolean (optional) — Whether to emulate network being offline. Defaults to `false`.
  - `permissions` Array\<string\> (optional) — A list of permissions to grant to all pages in this context.
  - `pkg` string (optional) — Optional package name to launch instead of default Chrome for Android.
  - `proxy` Object (optional) _(Added in: v1.29)_ — Network proxy settings.
    - `server` string
    - `bypass` string (optional)
    - `username` string (optional)
    - `password` string (optional)
  - `recordHar` Object (optional) — Enables HAR recording for all pages.
    - `omitContent` boolean (optional) — _Deprecated._ Whether to omit request content. Defaults to `false`.
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
  - `strictSelectors` boolean (optional) — Enables strict selectors mode. Defaults to `false`.
  - `timezoneId` string (optional) — Changes the timezone of the context.
  - `userAgent` string (optional) — Specific user agent to use in this context.
  - `viewport` `null | Object` (optional) — `width` number, `height` number. Defaults to 1280x720.

    > **Note:** The `null` value opts out from the default presets, makes viewport depend on the host window size. It makes the execution of the tests non-deterministic.

**Returns:** `Promise<BrowserContext>`

---

### longTap

**Added in:** v1.9

Performs a long tap on the widget defined by selector.

```ts
await androidDevice.longTap(selector);
await androidDevice.longTap(selector, options);
```

**Arguments:**

- `selector` [AndroidSelector] — Selector to tap on.
- `options` Object (optional)
  - `timeout` number (optional) — Maximum time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.

**Returns:** `Promise<void>`

---

### model

**Added in:** v1.9

Device model.

```ts
androidDevice.model();
```

**Returns:** `string`

---

### open

**Added in:** v1.9

Launches a process in the shell on the device and returns a socket to communicate with the launched process.

```ts
await androidDevice.open(command);
```

**Arguments:**

- `command` string — Shell command to execute.

**Returns:** `Promise<AndroidSocket>`

---

### pinchClose

**Added in:** v1.9

Pinches the widget defined by selector in the closing direction.

```ts
await androidDevice.pinchClose(selector, percent);
await androidDevice.pinchClose(selector, percent, options);
```

**Arguments:**

- `selector` [AndroidSelector] — Selector to pinch close.
- `percent` number — The size of the pinch as a percentage of the widget's size.
- `options` Object (optional)
  - `speed` number (optional) — Optional speed of the pinch in pixels per second.
  - `timeout` number (optional) — Maximum time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.

**Returns:** `Promise<void>`

---

### pinchOpen

**Added in:** v1.9

Pinches the widget defined by selector in the open direction.

```ts
await androidDevice.pinchOpen(selector, percent);
await androidDevice.pinchOpen(selector, percent, options);
```

**Arguments:**

- `selector` [AndroidSelector] — Selector to pinch open.
- `percent` number — The size of the pinch as a percentage of the widget's size.
- `options` Object (optional)
  - `speed` number (optional) — Optional speed of the pinch in pixels per second.
  - `timeout` number (optional) — Maximum time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.

**Returns:** `Promise<void>`

---

### press

**Added in:** v1.9

Presses the specific key in the widget defined by selector.

```ts
await androidDevice.press(selector, key);
await androidDevice.press(selector, key, options);
```

**Arguments:**

- `selector` [AndroidSelector] — Selector to press the key in.
- `key` [AndroidKey] — The key to press.
- `options` Object (optional)
  - `timeout` number (optional) — Maximum time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.

**Returns:** `Promise<void>`

---

### push

**Added in:** v1.9

Copies a file to the device.

```ts
await androidDevice.push(file, path);
await androidDevice.push(file, path, options);
```

**Arguments:**

- `file` string | Buffer — Either a path to the file, or file content.
- `path` string — Path to the file on the device.
- `options` Object (optional)
  - `mode` number (optional) — Optional file mode, defaults to `644` (`rw-r--r--`).

**Returns:** `Promise<void>`

---

### screenshot

**Added in:** v1.9

Returns the buffer with the captured screenshot of the device.

```ts
await androidDevice.screenshot();
await androidDevice.screenshot(options);
```

**Arguments:**

- `options` Object (optional)
  - `path` string (optional) — The file path to save the image to. If path is a relative path, then it is resolved relative to the current working directory. If no path is provided, the image won't be saved to the disk.

**Returns:** `Promise<Buffer>`

---

### scroll

**Added in:** v1.9

Scrolls the widget defined by selector in the specified direction.

```ts
await androidDevice.scroll(selector, direction, percent);
await androidDevice.scroll(selector, direction, percent, options);
```

**Arguments:**

- `selector` [AndroidSelector] — Selector to scroll.
- `direction` `"down" | "up" | "left" | "right"` — Scroll direction.
- `percent` number — Distance to scroll as a percentage of the widget's size.
- `options` Object (optional)
  - `speed` number (optional) — Optional speed of the scroll in pixels per second.
  - `timeout` number (optional) — Maximum time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.

**Returns:** `Promise<void>`

---

### serial

**Added in:** v1.9

Device serial number.

```ts
androidDevice.serial();
```

**Returns:** `string`

---

### setDefaultTimeout

**Added in:** v1.9

This setting will change the default maximum time for all the methods accepting `timeout` option.

```ts
androidDevice.setDefaultTimeout(timeout);
```

**Arguments:**

- `timeout` number — Maximum time in milliseconds.

---

### shell

**Added in:** v1.9

Executes a shell command on the device and returns its output.

```ts
await androidDevice.shell(command);
```

**Arguments:**

- `command` string — Shell command to execute.

**Returns:** `Promise<Buffer>`

---

### swipe

**Added in:** v1.9

Swipes the widget defined by selector in the specified direction.

```ts
await androidDevice.swipe(selector, direction, percent);
await androidDevice.swipe(selector, direction, percent, options);
```

**Arguments:**

- `selector` [AndroidSelector] — Selector to swipe.
- `direction` `"down" | "up" | "left" | "right"` — Swipe direction.
- `percent` number — Distance to swipe as a percentage of the widget's size.
- `options` Object (optional)
  - `speed` number (optional) — Optional speed of the swipe in pixels per second.
  - `timeout` number (optional) — Maximum time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.

**Returns:** `Promise<void>`

---

### tap

**Added in:** v1.9

Taps on the widget defined by selector.

```ts
await androidDevice.tap(selector);
await androidDevice.tap(selector, options);
```

**Arguments:**

- `selector` [AndroidSelector] — Selector to tap on.
- `options` Object (optional)
  - `duration` number (optional) — Optional duration of the tap in milliseconds.
  - `timeout` number (optional) — Maximum time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.

**Returns:** `Promise<void>`

---

### wait

**Added in:** v1.9

Waits for the specific selector to either appear or disappear, depending on the state.

```ts
await androidDevice.wait(selector);
await androidDevice.wait(selector, options);
```

**Arguments:**

- `selector` [AndroidSelector] — Selector to wait for.
- `options` Object (optional)
  - `state` `"gone"` (optional) — Optional state. Can be either: default — wait for element to be present; `'gone'` — wait for element to not be present.
  - `timeout` number (optional) — Maximum time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.

**Returns:** `Promise<void>`

---

### waitForEvent

**Added in:** v1.9

Waits for event to fire and passes its value into the predicate function. Returns when the predicate returns truthy value.

```ts
await androidDevice.waitForEvent(event);
await androidDevice.waitForEvent(event, optionsOrPredicate);
```

**Arguments:**

- `event` string — Event name, same one typically passed into `*.on(event)`.
- `optionsOrPredicate` function | Object (optional) — Either a predicate that receives an event or an options object.
  - `predicate` function — Receives the event data and resolves to truthy value when the waiting should resolve.
  - `timeout` number (optional) — Maximum time to wait in milliseconds. Defaults to 30000 (30 seconds). Pass 0 to disable timeout.

**Returns:** `Promise<Object>`

---

### webView

**Added in:** v1.9

This method waits until `AndroidWebView` matching the selector is opened and returns it. If there is already an open `AndroidWebView` matching the selector, returns immediately.

```ts
await androidDevice.webView(selector);
await androidDevice.webView(selector, options);
```

**Arguments:**

- `selector` Object
  - `pkg` string (optional) — Optional Package identifier.
  - `socketName` string (optional) — Optional webview socket name.
- `options` Object (optional)
  - `timeout` number (optional) — Maximum time in milliseconds, defaults to 30 seconds, pass 0 to disable timeout.

**Returns:** `Promise<AndroidWebView>`

---

### webViews

**Added in:** v1.9

Currently open WebViews.

```ts
androidDevice.webViews();
```

**Returns:** `Array<AndroidWebView>`

---

## Properties

### input

**Added in:** v1.9

**Type:** `AndroidInput`

```ts
androidDevice.input;
```

---

## Events

### on('close')

**Added in:** v1.28

Emitted when the device connection gets closed.

```ts
androidDevice.on('close', (data) => {});
```

**Event data:** `AndroidDevice`

---

### on('webview')

**Added in:** v1.9

Emitted when a new WebView instance is detected.

```ts
androidDevice.on('webview', (data) => {});
```

**Event data:** `AndroidWebView`
