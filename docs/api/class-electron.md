# 📦 Playwright — Electron

> **Source:** [playwright.dev/docs/api/class-electron](https://playwright.dev/docs/api/class-electron)

---

Playwright has **experimental** support for Electron automation. You can access the electron namespace via:

```ts
const { _electron } = require('playwright');
```

```ts
const { _electron: electron } = require('playwright');
(async () => {
  // Launch Electron app.
  const electronApp = await electron.launch({ args: ['main.js'] });
  // Evaluation expression in the Electron context.
  const appPath = await electronApp.evaluate(async ({ app }) => {
    // This runs in the main Electron process, parameter here is always
    // the result of the require('electron') in the main app script.
    return app.getAppPath();
  });
  console.log(appPath);
  // Get the first window that the app opens, wait if necessary.
  const window = await electronApp.firstWindow();
  // Print the title.
  console.log(await window.title());
  // Capture a screenshot.
  await window.screenshot({ path: 'intro.png' });
  // Direct Electron console to Node terminal.
  window.on('console', console.log);
  // Click button.
  await window.click('text=Click me');
  // Exit app.
  await electronApp.close();
})();
```

Supported Electron versions: v12.2.0+, v13.4.0+, v14+

## Methods

### launch

**Added in:** v1.9

Launches electron application specified with the `executablePath`.

```ts
await electron.launch();
await electron.launch(options);
```

**Arguments:**

- `options` Object (optional)
  - `acceptDownloads` boolean (optional) _(Added in: v1.12)_ — Whether to automatically download all the attachments. Defaults to `true`.
  - `args` Array\<string\> (optional) — Additional arguments to pass to the application when launching. You typically pass the main script name here.
  - `artifactsDir` string (optional) _(Added in: v1.59)_ — If specified, artifacts are saved into this directory.
  - `bypassCSP` boolean (optional) _(Added in: v1.12)_ — Toggles bypassing page's Content-Security-Policy. Defaults to `false`.
  - `chromiumSandbox` boolean (optional) _(Added in: v1.59)_ — Enable Chromium sandboxing. Defaults to `false`.
  - `colorScheme` `null | "light" | "dark" | "no-preference"` (optional) _(Added in: v1.12)_ — Emulates `prefers-colors-scheme`. Defaults to `'light'`.
  - `cwd` string (optional) — Current working directory to launch application from.
  - `env` Object\<string, string\> (optional) — Specifies environment variables that will be visible to Electron. Defaults to `process.env`.
  - `executablePath` string (optional) — Launches given Electron application. If not specified, launches the default Electron executable at `node_modules/.bin/electron`.
  - `extraHTTPHeaders` Object\<string, string\> (optional) _(Added in: v1.12)_ — Additional HTTP headers to be sent with every request.
  - `geolocation` Object (optional) _(Added in: v1.12)_ — `latitude`, `longitude`, `accuracy`.
  - `httpCredentials` Object (optional) _(Added in: v1.12)_ — Credentials for HTTP authentication.
    - `username` string
    - `password` string
    - `origin` string (optional)
    - `send` `"unauthorized" | "always"` (optional)
  - `ignoreHTTPSErrors` boolean (optional) _(Added in: v1.12)_ — Whether to ignore HTTPS errors when sending network requests. Defaults to `false`.
  - `locale` string (optional) _(Added in: v1.12)_ — Specify user locale.
  - `offline` boolean (optional) _(Added in: v1.12)_ — Whether to emulate network being offline. Defaults to `false`.
  - `recordHar` Object (optional) _(Added in: v1.12)_ — Enables HAR recording.
    - `omitContent` boolean (optional) — _Deprecated._ Use `content` policy instead.
    - `content` `"omit" | "embed" | "attach"` (optional)
    - `path` string — Path on the filesystem to write the HAR file to.
    - `mode` `"full" | "minimal"` (optional) — Defaults to `full`.
    - `urlFilter` string | RegExp (optional)
  - `recordVideo` Object (optional) _(Added in: v1.12)_ — Enables video recording.
    - `dir` string (optional)
    - `size` Object (optional) — `width` number, `height` number.
    - `showActions` Object (optional) — Visual annotations on interacted elements.
  - `timeout` number (optional) _(Added in: v1.15)_ — Maximum time in milliseconds to wait for the application to start. Defaults to 30000. Pass 0 to disable timeout.
  - `timezoneId` string (optional) _(Added in: v1.12)_ — Changes the timezone of the context.
  - `tracesDir` string (optional) _(Added in: v1.36)_ — If specified, traces are saved into this directory.

**Returns:** `Promise<ElectronApplication>`
