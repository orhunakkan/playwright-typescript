# 📦 Playwright — Android

> **Source:** [playwright.dev/docs/api/class-android](https://playwright.dev/docs/api/class-android)

---

Playwright has experimental support for Android automation. This includes Chrome for Android and Android WebView.

**Requirements:**

- Android device or AVD Emulator
- ADB daemon running and authenticated with your device (typically running `adb devices` is all you need)
- Chrome 87 or newer installed on the device
- "Enable command line on non-rooted devices" enabled in `chrome://flags`

**Known Limitations:**

- Raw USB operation is not yet supported, so you need ADB
- Device needs to be awake to produce screenshots (enabling "Stay awake" developer mode will help)
- Not all tests have been run against the device, so not everything works

---

## Example Usage

```ts
const { _android: android } = require('playwright');

(async () => {
  // Connect to the device
  const [device] = await android.devices();
  console.log(`Model: ${device.model()}`);
  console.log(`Serial: ${device.serial()}`);

  // Take screenshot of the whole device
  await device.screenshot({ path: 'device.png' });

  // WebView automation
  await device.shell('am force-stop org.chromium.webview_shell');
  await device.shell('am start org.chromium.webview_shell/.WebViewBrowserActivity');

  const webview = await device.webView({ pkg: 'org.chromium.webview_shell' });
  await device.fill({ res: 'org.chromium.webview_shell:id/url_field' }, 'github.com/microsoft/playwright');
  await device.press({ res: 'org.chromium.webview_shell:id/url_field' }, 'Enter');

  const page = await webview.page();
  await page.waitForNavigation({ url: /.*microsoft\/playwright.*/ });
  console.log(await page.title());

  // Browser automation
  await device.shell('am force-stop com.android.chrome');
  const context = await device.launchBrowser();
  const browserPage = await context.newPage();
  await browserPage.goto('https://webkit.org/');
  console.log(await browserPage.evaluate(() => window.location.href));
  await browserPage.screenshot({ path: 'page.png' });
  await context.close();

  await device.close();
})();
```

---

## Methods

### connect

**Added in:** v1.28

Attaches Playwright to an existing Android device. Use **android.launchServer()** to launch a new Android server instance.

```ts
await android.connect(endpoint);
await android.connect(endpoint, options);
```

**Arguments:**

- `endpoint` string — A browser websocket endpoint to connect to
- `options` Object (optional)
  - `headers` Object<string, string> (optional) — Additional HTTP headers for WebSocket connection
  - `slowMo` number (optional) — Slows down operations by specified milliseconds. Defaults to 0
  - `timeout` number (optional) — Maximum time to wait for connection. Defaults to 30000ms (30s). Pass 0 to disable

**Returns:** Promise<AndroidDevice>

---

### devices

**Added in:** v1.9

Returns the list of detected Android devices.

```ts
await android.devices();
await android.devices(options);
```

**Arguments:**

- `options` Object (optional)
  - `host` string (optional) — Optional host to establish ADB server connection. Default: `127.0.0.1`
  - `omitDriverInstall` boolean (optional) — Prevents automatic driver installation. Assumes drivers are already installed
  - `port` number (optional) — Optional port to establish ADB server connection. Default: `5037`

**Returns:** Promise<Array<AndroidDevice>>

---

### launchServer

**Added in:** v1.28

Launches Playwright Android server that clients can connect to.

**Server Side:**

```ts
const { _android } = require('playwright');

(async () => {
  const browserServer = await _android.launchServer({
    // deviceSerialNumber: '<deviceSerialNumber>',
  });
  const wsEndpoint = browserServer.wsEndpoint();
  console.log(wsEndpoint);
})();
```

**Client Side:**

```ts
const { _android } = require('playwright');

(async () => {
  const device = await _android.connect('<wsEndpoint>');
  console.log(device.model());
  console.log(device.serial());

  await device.shell('am force-stop com.android.chrome');
  const context = await device.launchBrowser();
  const page = await context.newPage();
  await page.goto('https://webkit.org/');
  console.log(await page.evaluate(() => window.location.href));
  await page.screenshot({ path: 'page-chrome-1.png' });
  await context.close();
})();
```

**Arguments:**

- `options` Object (optional)
  - `adbHost` string (optional) — Optional host to establish ADB server connection. Default: `127.0.0.1`
  - `adbPort` number (optional) — Optional port to establish ADB server connection. Default: `5037`
  - `deviceSerialNumber` string (optional) — Optional device serial number. Throws if multiple devices are connected and not specified
  - `host` string (optional) — Host for the web socket. Defaults to unspecified IPv6 address (::) when IPv6 is available, or unspecified IPv4 address (0.0.0.0) otherwise
  - `omitDriverInstall` boolean (optional) — Prevents automatic driver installation
  - `port` number (optional) — Port for the web socket. Defaults to 0 (any available port)
  - `wsPath` string (optional) — Path to serve the Android Server. Defaults to an unguessable string for security

⚠️ **Warning:** Any process or web page with knowledge of the wsPath can take control of the OS user. Use an unguessable token when using this option.

**Returns:** Promise<BrowserServer>

---

### setDefaultTimeout

**Added in:** v1.9

Changes the default maximum time for all methods accepting timeout option.

```ts
android.setDefaultTimeout(timeout);
```

**Arguments:**

- `timeout` number — Maximum time in milliseconds
