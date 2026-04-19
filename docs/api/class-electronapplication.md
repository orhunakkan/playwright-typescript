# 📦 Playwright — ElectronApplication

> **Source:** [playwright.dev/docs/api/class-electronapplication](https://playwright.dev/docs/api/class-electronapplication)

---

**Experimental**

Electron application representation. You can use `electron.launch()` to obtain the application instance. This instance you can control main electron process as well as work with Electron windows:

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

## Methods

### browserWindow

**Added in:** v1.11

`electronApplication.browserWindow`

Returns the BrowserWindow object that corresponds to the given Playwright page.

**Usage:**

```ts
await electronApplication.browserWindow(page);
```

**Arguments:**

- `page` Page — Page to retrieve the window for.

**Returns:** `Promise<JSHandle>`

### close

**Added in:** v1.9

`electronApplication.close`

Closes Electron application.

**Usage:**

```ts
await electronApplication.close();
```

**Returns:** `Promise<void>`

### context

**Added in:** v1.9

`electronApplication.context`

This method returns browser context that can be used for setting up context-wide routing, etc.

**Usage:**

```ts
electronApplication.context();
```

**Returns:** `BrowserContext`

### evaluate

**Added in:** v1.9

`electronApplication.evaluate`

Returns the return value of `pageFunction`. If the function passed to the `electronApplication.evaluate()` returns a Promise, then `electronApplication.evaluate()` would wait for the promise to resolve and return its value.

If the function passed to the `electronApplication.evaluate()` returns a non-Serializable value, then `electronApplication.evaluate()` returns `undefined`. Playwright also supports transferring some additional values that are not serializable by JSON: `-0`, `NaN`, `Infinity`, `-Infinity`.

**Usage:**

```ts
await electronApplication.evaluate(pageFunction);
await electronApplication.evaluate(pageFunction, arg);
```

**Arguments:**

- `pageFunction` function | Electron — Function to be evaluated in the main Electron process.
- `arg` EvaluationArgument (optional) — Optional argument to pass to `pageFunction`.

**Returns:** `Promise<Serializable>`

### evaluateHandle

**Added in:** v1.9

`electronApplication.evaluateHandle`

Returns the return value of `pageFunction` as a JSHandle. The only difference between `electronApplication.evaluate()` and `electronApplication.evaluateHandle()` is that `electronApplication.evaluateHandle()` returns JSHandle.

If the function passed to the `electronApplication.evaluateHandle()` returns a Promise, then `electronApplication.evaluateHandle()` would wait for the promise to resolve and return its value.

**Usage:**

```ts
await electronApplication.evaluateHandle(pageFunction);
await electronApplication.evaluateHandle(pageFunction, arg);
```

**Arguments:**

- `pageFunction` function | Electron — Function to be evaluated in the main Electron process.
- `arg` EvaluationArgument (optional) — Optional argument to pass to `pageFunction`.

**Returns:** `Promise<JSHandle>`

### firstWindow

**Added in:** v1.9

`electronApplication.firstWindow`

Convenience method that waits for the first application window to be opened.

**Usage:**

```ts
const electronApp = await electron.launch({ args: ['main.js'] });
const window = await electronApp.firstWindow();
// ...
```

**Arguments:**

- `options` Object (optional)
  - `timeout` number (optional) _(Added in: v1.33)_ — Maximum time to wait for in milliseconds. Defaults to 30000 (30 seconds). Pass 0 to disable timeout. The default value can be changed by using the `browserContext.setDefaultTimeout()`.

**Returns:** `Promise<Page>`

### process

**Added in:** v1.21

`electronApplication.process`

Returns the main process for this Electron Application.

**Usage:**

```ts
electronApplication.process();
```

**Returns:** `ChildProcess`

### waitForEvent

**Added in:** v1.9

`electronApplication.waitForEvent`

Waits for event to fire and passes its value into the predicate function. Returns when the predicate returns truthy value. Will throw an error if the application is closed before the event is fired. Returns the event data value.

**Usage:**

```ts
const windowPromise = electronApp.waitForEvent('window');
await mainWindow.click('button');
const window = await windowPromise;
```

**Arguments:**

- `event` string — Event name, same one typically passed into `*.on(event)`.
- `optionsOrPredicate` function | Object (optional)
  - `predicate` function — receives the event data and resolves to truthy value when the waiting should resolve.
  - `timeout` number (optional) — maximum time to wait for in milliseconds. Defaults to 30000 (30 seconds). Pass 0 to disable timeout. The default value can be changed by using the `browserContext.setDefaultTimeout()`.

Either a predicate that receives an event or an options object. Optional.

**Returns:** `Promise<Object>`

### windows

**Added in:** v1.9

`electronApplication.windows`

Convenience method that returns all the opened windows.

**Usage:**

```ts
electronApplication.windows();
```

**Returns:** `Array<Page>`

## Events

### on('close')

**Added in:** v1.9

`electronApplication.on('close')`

This event is issued when the application process has been terminated.

**Usage:**

```ts
electronApplication.on('close', (data) => {});
```

### on('console')

**Added in:** v1.42

`electronApplication.on('console')`

Emitted when JavaScript within the Electron main process calls one of console API methods, e.g. `console.log` or `console.dir`. The arguments passed into `console.log` are available on the ConsoleMessage event handler argument.

**Usage:**

```ts
electronApp.on('console', async (msg) => {
  const values = [];
  for (const arg of msg.args()) values.push(await arg.jsonValue());
  console.log(...values);
});
await electronApp.evaluate(() => console.log('hello', 5, { foo: 'bar' }));
```

**Event data:** `ConsoleMessage`

### on('window')

**Added in:** v1.9

`electronApplication.on('window')`

This event is issued for every window that is created and loaded in Electron. It contains a Page that can be used for Playwright automation.

**Usage:**

```ts
electronApplication.on('window', (data) => {});
```

**Event data:** `Page`
