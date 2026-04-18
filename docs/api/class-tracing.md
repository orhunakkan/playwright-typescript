# 📦 Playwright — Tracing

> **Source:** [playwright.dev/docs/api/class-tracing](https://playwright.dev/docs/api/class-tracing)

---

API for collecting and saving Playwright traces. Playwright traces can be opened in **Trace Viewer** after Playwright script runs.

> **Note:** You probably want to enable tracing in your config file instead of using `context.tracing`. The `context.tracing` API captures browser operations and network activity, but it doesn't record test assertions (like `expect` calls). We recommend enabling tracing through Playwright Test configuration, which includes those assertions and provides a more complete trace for debugging test failures.

Start recording a trace before performing actions. At the end, stop tracing and save it to a file.

```ts
const browser = await chromium.launch();
const context = await browser.newContext();
await context.tracing.start({ screenshots: true, snapshots: true });
const page = await context.newPage();
await page.goto('https://playwright.dev');
expect(page.url()).toBe('https://playwright.dev');
await context.tracing.stop({ path: 'trace.zip' });
```

---

## Methods

### `group()` — Added in: v1.49

> **Caution:** Use `test.step` instead when available.

Creates a new group within the trace, assigning any subsequent API calls to this group, until `tracing.groupEnd()` is called. Groups can be nested and will be visible in the trace viewer.

```ts
// use test.step instead
await test.step('Log in', async () => {
  // ...
});
```

**Arguments:**

- `name` `string` — Group name shown in the trace viewer.
- `options` `Object` _(optional)_
  - `location` `Object` _(optional)_ — Specifies a custom location for the group to be shown in the trace viewer. Defaults to the location of the `tracing.group()` call.
    - `file` `string`
    - `line` `number` _(optional)_
    - `column` `number` _(optional)_

**Returns:** `Promise<Disposable>`

---

### `groupEnd()` — Added in: v1.49

Closes the last group created by `tracing.group()`.

```ts
await tracing.groupEnd();
```

**Returns:** `Promise<void>`

---

### `start()` — Added in: v1.12

Start tracing.

> **Note:** You probably want to enable tracing in your config file instead of using `Tracing.start`. The `context.tracing` API captures browser operations and network activity, but it doesn't record test assertions (like `expect` calls). We recommend enabling tracing through Playwright Test configuration, which includes those assertions and provides a more complete trace for debugging test failures.

```ts
await context.tracing.start({ screenshots: true, snapshots: true });
const page = await context.newPage();
await page.goto('https://playwright.dev');
expect(page.url()).toBe('https://playwright.dev');
await context.tracing.stop({ path: 'trace.zip' });
```

**Arguments:**

- `options` `Object` _(optional)_
  - `live` `boolean` _(optional)_ — Added in: v1.59. When enabled, the trace is written to an unarchived file updated in real time as actions occur, instead of caching changes and archiving into a zip at the end. Useful for live trace viewing during test execution.
  - `name` `string` _(optional)_ — If specified, intermediate trace files are saved into files with the given name prefix inside the `tracesDir` directory specified in `browserType.launch()`. To specify the final trace zip file name, pass the `path` option to `tracing.stop()` instead.
  - `screenshots` `boolean` _(optional)_ — Whether to capture screenshots during tracing. Screenshots are used to build a timeline preview.
  - `snapshots` `boolean` _(optional)_ — If `true`, tracing will capture DOM snapshot on every action and record network activity.
  - `sources` `boolean` _(optional)_ — Added in: v1.17. Whether to include source files for trace actions.
  - `title` `string` _(optional)_ — Added in: v1.17. Trace name to be shown in the Trace Viewer.

**Returns:** `Promise<void>`

---

### `startChunk()` — Added in: v1.15

Start a new trace chunk. If you'd like to record multiple traces on the same `BrowserContext`, use `tracing.start()` once, and then create multiple trace chunks with `tracing.startChunk()` and `tracing.stopChunk()`.

```ts
await context.tracing.start({ screenshots: true, snapshots: true });
const page = await context.newPage();
await page.goto('https://playwright.dev');
await context.tracing.startChunk();
await page.getByText('Get Started').click();
// Everything between startChunk and stopChunk will be recorded in the trace.
await context.tracing.stopChunk({ path: 'trace1.zip' });
await context.tracing.startChunk();
await page.goto('http://example.com');
// Save a second trace file with different actions.
await context.tracing.stopChunk({ path: 'trace2.zip' });
```

**Arguments:**

- `options` `Object` _(optional)_
  - `name` `string` _(optional)_ — Added in: v1.32. If specified, intermediate trace files are saved into files with the given name prefix inside the `tracesDir` directory specified in `browserType.launch()`. To specify the final trace zip file name, pass the `path` option to `tracing.stopChunk()` instead.
  - `title` `string` _(optional)_ — Added in: v1.17. Trace name to be shown in the Trace Viewer.

**Returns:** `Promise<void>`

---

### `stop()` — Added in: v1.12

Stop tracing.

```ts
await tracing.stop();
await tracing.stop(options);
```

**Arguments:**

- `options` `Object` _(optional)_
  - `path` `string` _(optional)_ — Export trace into the file with the given path.

**Returns:** `Promise<void>`

---

### `stopChunk()` — Added in: v1.15

Stop the trace chunk. See `tracing.startChunk()` for more details about multiple trace chunks.

```ts
await tracing.stopChunk();
await tracing.stopChunk(options);
```

**Arguments:**

- `options` `Object` _(optional)_
  - `path` `string` _(optional)_ — Export trace collected since the last `tracing.startChunk()` call into the file with the given path.

**Returns:** `Promise<void>`
