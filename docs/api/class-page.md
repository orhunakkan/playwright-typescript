# 📦 Playwright — Page

> **Source:** [playwright.dev/docs/api/class-page](https://playwright.dev/docs/api/class-page)

---

Page provides methods to interact with a single tab in a Browser, or an extension background page in Chromium. One Browser instance might have multiple Page instances.

```js
const { webkit } = require('playwright');
(async () => {
  const browser = await webkit.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://example.com');
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
})();
```

The Page class emits various events which can be handled using Node's native EventEmitter methods (`on`, `once`, `removeListener`).

## Methods

### `page.addInitScript()` — Added before v1.9

Adds a script which would be evaluated in one of the following scenarios:

- Whenever the page is navigated.
- Whenever the child frame is attached or navigated.

The script is evaluated after the document was created but before any of its scripts ran.

```js
await page.addInitScript({ path: './preload.js' });
await page.addInitScript((mock) => {
  window.mock = mock;
}, mock);
```

**Arguments:**

| Parameter | Type                           | Description                                                                   |
| --------- | ------------------------------ | ----------------------------------------------------------------------------- |
| `script`  | `function \| string \| Object` | Script to be evaluated. Object form: `{ path?: string, content?: string }`.   |
| `arg`     | `Serializable` (optional)      | Optional argument to pass to script (only supported when passing a function). |

**Returns:** `Promise<Disposable>`

### `page.addLocatorHandler()` — Added in: v1.42

Sets up a handler that activates when a specified locator (e.g., a "Sign up" overlay) becomes visible. The handler's job is to remove the overlay so the test can proceed.

```js
await page.addLocatorHandler(page.getByText('Sign up to the newsletter'), async () => {
  await page.getByRole('button', { name: 'No thanks' }).click();
});
```

**Arguments:**

| Parameter             | Type                                 | Description                                                                                                               |
| --------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `locator`             | `Locator`                            | Locator that triggers the handler.                                                                                        |
| `handler`             | `function(Locator): Promise<Object>` | Function that should be run once locator appears.                                                                         |
| `options.noWaitAfter` | `boolean` (optional)                 | Added in v1.44. By default Playwright waits until the overlay is hidden after the handler runs. Set to `true` to opt out. |
| `options.times`       | `number` (optional)                  | Added in v1.44. Maximum number of times this handler should be called. Unlimited by default.                              |

**Returns:** `Promise<void>`

### `page.addScriptTag()` — Added before v1.9

Adds a `<script>` tag into the page with the desired url or content. Returns the added tag when the script's onload fires or when the script content was injected.

```js
await page.addScriptTag({ url: 'https://example.com/script.js' });
await page.addScriptTag({ content: 'window.x = 1;' });
```

**Arguments:**

| Parameter         | Type                | Description                                       |
| ----------------- | ------------------- | ------------------------------------------------- |
| `options.content` | `string` (optional) | Raw JavaScript content to be injected into frame. |
| `options.path`    | `string` (optional) | Path to the JavaScript file to be injected.       |
| `options.type`    | `string` (optional) | Script type. Use `'module'` for ES6 modules.      |
| `options.url`     | `string` (optional) | URL of a script to be added.                      |

**Returns:** `Promise<ElementHandle>`

### `page.addStyleTag()` — Added before v1.9

Adds a `<link rel="stylesheet">` tag or a `<style>` tag into the page. Returns the added tag when the stylesheet's onload fires.

```js
await page.addStyleTag({ url: 'https://example.com/style.css' });
await page.addStyleTag({ content: 'body { background: red; }' });
```

**Arguments:**

| Parameter         | Type                | Description                                |
| ----------------- | ------------------- | ------------------------------------------ |
| `options.content` | `string` (optional) | Raw CSS content to be injected into frame. |
| `options.path`    | `string` (optional) | Path to the CSS file to be injected.       |
| `options.url`     | `string` (optional) | URL of the `<link>` tag.                   |

**Returns:** `Promise<ElementHandle>`

### `page.ariaSnapshot()` — Added in: v1.59

Captures the aria snapshot of the page.

```js
const snapshot = await page.ariaSnapshot();
```

**Arguments:**

| Parameter         | Type                           | Description                                                                                   |
| ----------------- | ------------------------------ | --------------------------------------------------------------------------------------------- |
| `options.depth`   | `number` (optional)            | When specified, limits the depth of the snapshot.                                             |
| `options.mode`    | `"ai" \| "default"` (optional) | When set to `"ai"`, returns a snapshot optimized for AI consumption. Defaults to `"default"`. |
| `options.timeout` | `number` (optional)            | Maximum time in milliseconds. Defaults to 0 (no timeout).                                     |

**Returns:** `Promise<string>`

### `page.bringToFront()` — Added before v1.9

Brings page to front (activates tab).

```js
await page.bringToFront();
```

**Returns:** `Promise<void>`

### `page.cancelPickLocator()` — Added in: v1.59

Cancels an ongoing `page.pickLocator()` call by deactivating pick locator mode. If no pick locator mode is active, this method is a no-op.

```js
await page.cancelPickLocator();
```

**Returns:** `Promise<void>`

### `page.clearConsoleMessages()` — Added in: v1.59

Clears all stored console messages from this page. Subsequent calls to `page.consoleMessages()` will only return messages logged after the clear.

```js
await page.clearConsoleMessages();
```

**Returns:** `Promise<void>`

### `page.clearPageErrors()` — Added in: v1.59

Clears all stored page errors from this page. Subsequent calls to `page.pageErrors()` will only return errors thrown after the clear.

```js
await page.clearPageErrors();
```

**Returns:** `Promise<void>`

### `page.close()` — Added before v1.9

If `runBeforeUnload` is `false`, does not run any unload handlers and waits for the page to be closed. If `runBeforeUnload` is `true`, the method will run unload handlers but will not wait for the page to close.

```js
await page.close();
await page.close({ runBeforeUnload: true });
```

**Arguments:**

| Parameter                 | Type                 | Description                                                                        |
| ------------------------- | -------------------- | ---------------------------------------------------------------------------------- |
| `options.reason`          | `string` (optional)  | Added in v1.40. The reason reported to operations interrupted by the page closure. |
| `options.runBeforeUnload` | `boolean` (optional) | Defaults to `false`. Whether to run the before unload page handlers.               |

**Returns:** `Promise<void>`

### `page.consoleMessages()` — Added in: v1.56

Returns up to 200 last console messages from this page.

```js
const messages = await page.consoleMessages();
```

**Arguments:**

| Parameter        | Type                                     | Description                                           |
| ---------------- | ---------------------------------------- | ----------------------------------------------------- |
| `options.filter` | `"all" \| "since-navigation"` (optional) | Added in v1.59. Controls which messages are returned. |

**Returns:** `Promise<Array<ConsoleMessage>>`

### `page.content()` — Added before v1.9

Gets the full HTML contents of the page, including the doctype.

```js
const html = await page.content();
```

**Returns:** `Promise<string>`

### `page.context()` — Added before v1.9

Get the browser context that the page belongs to.

```js
const context = page.context();
```

**Returns:** `BrowserContext`

### `page.dragAndDrop()` — Added in: v1.13

Drags the source element to the target element. First moves to the source, performs mousedown, then moves to target and performs mouseup.

```js
await page.dragAndDrop('#source', '#target');
await page.dragAndDrop('#source', '#target', {
  sourcePosition: { x: 34, y: 7 },
  targetPosition: { x: 10, y: 20 },
});
```

**Arguments:**

| Parameter                | Type                 | Description                                                              |
| ------------------------ | -------------------- | ------------------------------------------------------------------------ |
| `source`                 | `string`             | Selector for the element to drag.                                        |
| `target`                 | `string`             | Selector for the element to drop onto.                                   |
| `options.force`          | `boolean` (optional) | Whether to bypass actionability checks. Defaults to `false`.             |
| `options.noWaitAfter`    | `boolean` (optional) | Deprecated. This option has no effect.                                   |
| `options.sourcePosition` | `Object` (optional)  | Added in v1.14. `{ x, y }` relative to the element's padding box.        |
| `options.steps`          | `number` (optional)  | Added in v1.57. Number of interpolated mousemove events. Defaults to 1.  |
| `options.strict`         | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element.        |
| `options.targetPosition` | `Object` (optional)  | Added in v1.14. `{ x, y }` relative to the target element's padding box. |
| `options.timeout`        | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).                |
| `options.trial`          | `boolean` (optional) | Only perform actionability checks without performing the action.         |

**Returns:** `Promise<void>`

### `page.emulateMedia()` — Added before v1.9

Changes the CSS media type and/or media features.

```js
await page.emulateMedia({ media: 'print' });
await page.emulateMedia({ colorScheme: 'dark' });
```

**Arguments:**

| Parameter               | Type                                                      | Description                                                                        |
| ----------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `options.colorScheme`   | `null \| "light" \| "dark" \| "no-preference"` (optional) | Added in v1.9. Emulates `prefers-color-scheme`. Passing `null` disables emulation. |
| `options.contrast`      | `null \| "no-preference" \| "more"` (optional)            | Added in v1.51. Emulates `prefers-contrast`.                                       |
| `options.forcedColors`  | `null \| "active" \| "none"` (optional)                   | Added in v1.15. Emulates `forced-colors`.                                          |
| `options.media`         | `null \| "screen" \| "print"` (optional)                  | Added in v1.9. Changes the CSS media type. Passing `null` disables emulation.      |
| `options.reducedMotion` | `null \| "reduce" \| "no-preference"` (optional)          | Added in v1.12. Emulates `prefers-reduced-motion`.                                 |

**Returns:** `Promise<void>`

### `page.evaluate()` — Added before v1.9

Returns the value of the `pageFunction` invocation. If the function returns a Promise, it will be awaited. Non-serializable values resolve to `undefined`.

```js
const result = await page.evaluate(([x, y]) => Promise.resolve(x * y), [7, 8]);
console.log(result); // 56
```

**Arguments:**

| Parameter      | Type                            | Description                                   |
| -------------- | ------------------------------- | --------------------------------------------- |
| `pageFunction` | `function \| string`            | Function to be evaluated in the page context. |
| `arg`          | `EvaluationArgument` (optional) | Optional argument to pass to `pageFunction`.  |

**Returns:** `Promise<Serializable>`

### `page.evaluateHandle()` — Added before v1.9

Returns the value of the `pageFunction` invocation as a `JSHandle`. The only difference from `page.evaluate()` is that it returns a `JSHandle` instead of a serialized value.

```js
const handle = await page.evaluateHandle(() => Promise.resolve(window));
const docHandle = await page.evaluateHandle('document');
```

**Arguments:**

| Parameter      | Type                            | Description                                   |
| -------------- | ------------------------------- | --------------------------------------------- |
| `pageFunction` | `function \| string`            | Function to be evaluated in the page context. |
| `arg`          | `EvaluationArgument` (optional) | Optional argument to pass to `pageFunction`.  |

**Returns:** `Promise<JSHandle>`

### `page.exposeBinding()` — Added before v1.9

Adds a function called `name` on the `window` object of every frame. When called, the function executes `callback` and returns a Promise. The first argument of the callback contains caller info: `{ browserContext, page, frame }`.

```js
await page.exposeBinding('pageURL', ({ page }) => page.url());
```

**Arguments:**

| Parameter        | Type                 | Description                                                    |
| ---------------- | -------------------- | -------------------------------------------------------------- |
| `name`           | `string`             | Name of the function on the window object.                     |
| `callback`       | `function`           | Callback function that will be called in Playwright's context. |
| `options.handle` | `boolean` (optional) | Deprecated. Whether to pass the argument as a handle.          |

**Returns:** `Promise<Disposable>`

### `page.exposeFunction()` — Added before v1.9

Adds a function called `name` on the `window` object of every frame. When called, executes `callback` and returns a Promise. Functions survive navigations.

```js
await page.exposeFunction('sha256', (text) => crypto.createHash('sha256').update(text).digest('hex'));
```

**Arguments:**

| Parameter  | Type       | Description                                                     |
| ---------- | ---------- | --------------------------------------------------------------- |
| `name`     | `string`   | Name of the function on the window object.                      |
| `callback` | `function` | Callback function which will be called in Playwright's context. |

**Returns:** `Promise<Disposable>`

### `page.frame()` — Added before v1.9

Returns frame matching the specified criteria. Either `name` or `url` must be specified.

```js
const frame = page.frame('frame-name');
const frame = page.frame({ url: /.*domain.*/ });
```

**Arguments:**

| Parameter       | Type               | Description                                                                                  |
| --------------- | ------------------ | -------------------------------------------------------------------------------------------- |
| `frameSelector` | `string \| Object` | Frame name string, or `{ name?: string, url?: string \| RegExp \| URLPattern \| function }`. |

**Returns:** `null | Frame`

### `page.frameLocator()` — Added in: v1.17

Creates a frame locator for working with iframes.

```js
const locator = page.frameLocator('#my-iframe').getByText('Submit');
await locator.click();
```

**Arguments:**

| Parameter  | Type     | Description                                              |
| ---------- | -------- | -------------------------------------------------------- |
| `selector` | `string` | A selector to use when resolving the iframe DOM element. |

**Returns:** `FrameLocator`

### `page.frames()` — Added before v1.9

An array of all frames attached to the page.

```js
const frames = page.frames();
```

**Returns:** `Array<Frame>`

### `page.getByAltText()` — Added in: v1.27

Locates elements by their alt text.

```js
await page.getByAltText('Playwright logo').click();
```

**Arguments:**

| Parameter       | Type                 | Description                                                                         |
| --------------- | -------------------- | ----------------------------------------------------------------------------------- |
| `text`          | `string \| RegExp`   | Text to locate the element for.                                                     |
| `options.exact` | `boolean` (optional) | Whether to find an exact match (case-sensitive, whole-string). Defaults to `false`. |

**Returns:** `Locator`

### `page.getByLabel()` — Added in: v1.27

Locates input elements by the text of their associated `<label>` or `aria-labelledby` element, or by the `aria-label` attribute.

```js
await page.getByLabel('Username').fill('john');
await page.getByLabel('Password').fill('secret');
```

**Arguments:**

| Parameter       | Type                 | Description                                          |
| --------------- | -------------------- | ---------------------------------------------------- |
| `text`          | `string \| RegExp`   | Text to locate the element for.                      |
| `options.exact` | `boolean` (optional) | Whether to find an exact match. Defaults to `false`. |

**Returns:** `Locator`

### `page.getByPlaceholder()` — Added in: v1.27

Locates input elements by the placeholder text.

```js
await page.getByPlaceholder('name@example.com').fill('playwright@microsoft.com');
```

**Arguments:**

| Parameter       | Type                 | Description                                          |
| --------------- | -------------------- | ---------------------------------------------------- |
| `text`          | `string \| RegExp`   | Text to locate the element for.                      |
| `options.exact` | `boolean` (optional) | Whether to find an exact match. Defaults to `false`. |

**Returns:** `Locator`

### `page.getByRole()` — Added in: v1.27

Locates elements by their ARIA role, ARIA attributes and accessible name.

```js
await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
await page.getByRole('checkbox', { name: 'Subscribe' }).check();
await page.getByRole('button', { name: /submit/i }).click();
```

**Arguments:**

| Parameter               | Type                          | Description                                                             |
| ----------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| `role`                  | `string`                      | Required ARIA role (e.g., `"button"`, `"heading"`, `"checkbox"`, etc.). |
| `options.checked`       | `boolean` (optional)          | Matches `aria-checked` or native checkbox state.                        |
| `options.disabled`      | `boolean` (optional)          | Matches `aria-disabled` or `disabled` attribute.                        |
| `options.exact`         | `boolean` (optional)          | Added in v1.28. Whether `name` is matched exactly. Defaults to `false`. |
| `options.expanded`      | `boolean` (optional)          | Matches `aria-expanded`.                                                |
| `options.includeHidden` | `boolean` (optional)          | Whether to match hidden elements. Defaults to `false`.                  |
| `options.level`         | `number` (optional)           | Number attribute for roles like `heading`.                              |
| `options.name`          | `string \| RegExp` (optional) | Option to match the accessible name.                                    |
| `options.pressed`       | `boolean` (optional)          | Matches `aria-pressed`.                                                 |
| `options.selected`      | `boolean` (optional)          | Matches `aria-selected`.                                                |

**Returns:** `Locator`

### `page.getByTestId()` — Added in: v1.27

Locates an element by its test id attribute (defaults to `data-testid`).

```js
await page.getByTestId('directions').click();
```

**Arguments:**

| Parameter | Type               | Description                  |
| --------- | ------------------ | ---------------------------- |
| `testId`  | `string \| RegExp` | Id to locate the element by. |

**Returns:** `Locator`

### `page.getByText()` — Added in: v1.27

Locates elements that contain the given text.

```js
page.getByText('world');
page.getByText('Hello', { exact: true });
page.getByText(/^hello$/i);
```

**Arguments:**

| Parameter       | Type                 | Description                                          |
| --------------- | -------------------- | ---------------------------------------------------- |
| `text`          | `string \| RegExp`   | Text to locate the element for.                      |
| `options.exact` | `boolean` (optional) | Whether to find an exact match. Defaults to `false`. |

**Returns:** `Locator`

### `page.getByTitle()` — Added in: v1.27

Locates elements by their `title` attribute.

```js
await expect(page.getByTitle('Issues count')).toHaveText('25 issues');
```

**Arguments:**

| Parameter       | Type                 | Description                                          |
| --------------- | -------------------- | ---------------------------------------------------- |
| `text`          | `string \| RegExp`   | Text to locate the element for.                      |
| `options.exact` | `boolean` (optional) | Whether to find an exact match. Defaults to `false`. |

**Returns:** `Locator`

### `page.goBack()` — Added before v1.9

Navigate to the previous page in history. Returns the main resource response, or `null` if cannot go back.

```js
await page.goBack();
```

**Arguments:**

| Parameter           | Type                                                                   | Description                                                         |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `options.timeout`   | `number` (optional)                                                    | Maximum operation time in milliseconds. Defaults to 0 (no timeout). |
| `options.waitUntil` | `"load" \| "domcontentloaded" \| "networkidle" \| "commit"` (optional) | When to consider operation succeeded. Defaults to `load`.           |

**Returns:** `Promise<null | Response>`

### `page.goForward()` — Added before v1.9

Navigate to the next page in history. Returns the main resource response, or `null` if cannot go forward.

```js
await page.goForward();
```

**Arguments:**

| Parameter           | Type                                                                   | Description                                                         |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `options.timeout`   | `number` (optional)                                                    | Maximum operation time in milliseconds. Defaults to 0 (no timeout). |
| `options.waitUntil` | `"load" \| "domcontentloaded" \| "networkidle" \| "commit"` (optional) | When to consider operation succeeded. Defaults to `load`.           |

**Returns:** `Promise<null | Response>`

### `page.goto()` — Added before v1.9

Navigates to the given URL. Returns the main resource response.

```js
await page.goto('https://example.com');
await page.goto('https://example.com', { waitUntil: 'domcontentloaded' });
```

**Arguments:**

| Parameter           | Type                                                                   | Description                                                         |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `url`               | `string`                                                               | URL to navigate page to. Must include scheme (e.g., `https://`).    |
| `options.referer`   | `string` (optional)                                                    | Referer header value.                                               |
| `options.timeout`   | `number` (optional)                                                    | Maximum operation time in milliseconds. Defaults to 0 (no timeout). |
| `options.waitUntil` | `"load" \| "domcontentloaded" \| "networkidle" \| "commit"` (optional) | When to consider operation succeeded. Defaults to `load`.           |

**Returns:** `Promise<null | Response>`

### `page.isClosed()` — Added before v1.9

Indicates that the page has been closed.

```js
const closed = page.isClosed();
```

**Returns:** `boolean`

### `page.locator()` — Added in: v1.14

Returns an element locator for use in performing actions on this page. Locator is resolved to the element immediately before each action.

```js
page.locator('css=button');
page.locator('css=article', { hasText: 'Playwright' });
```

**Arguments:**

| Parameter            | Type                          | Description                                                                               |
| -------------------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| `selector`           | `string`                      | A selector to use when resolving DOM element.                                             |
| `options.has`        | `Locator` (optional)          | Narrows results to elements containing a matching child element.                          |
| `options.hasNot`     | `Locator` (optional)          | Added in v1.33. Narrows results to elements that do not contain a matching child element. |
| `options.hasNotText` | `string \| RegExp` (optional) | Added in v1.33. Narrows results to elements that do not contain specified text.           |
| `options.hasText`    | `string \| RegExp` (optional) | Narrows results to elements containing specified text.                                    |

**Returns:** `Locator`

### `page.mainFrame()` — Added before v1.9

The page's main frame. Page is guaranteed to have a main frame which persists during navigations.

```js
const frame = page.mainFrame();
```

**Returns:** `Frame`

### `page.opener()` — Added before v1.9

Returns the opener for popup pages and `null` for others. If the opener has been closed, returns `null`.

```js
const opener = await page.opener();
```

**Returns:** `Promise<null | Page>`

### `page.pageErrors()` — Added in: v1.56

Returns up to 200 last page errors from this page.

```js
const errors = await page.pageErrors();
```

**Arguments:**

| Parameter        | Type                                     | Description                                         |
| ---------------- | ---------------------------------------- | --------------------------------------------------- |
| `options.filter` | `"all" \| "since-navigation"` (optional) | Added in v1.59. Controls which errors are returned. |

**Returns:** `Promise<Array<Error>>`

### `page.pause()` — Added in: v1.9

Pauses script execution. Playwright will stop executing the script and wait for the user to press 'Resume' in the page overlay or call `playwright.resume()` in DevTools. Requires headed mode.

```js
await page.pause();
```

**Returns:** `Promise<void>`

### `page.pdf()` — Added before v1.9

Returns the PDF buffer. Generates a PDF of the page with print CSS media.

```js
await page.emulateMedia({ media: 'screen' });
await page.pdf({ path: 'page.pdf' });
```

**Arguments:**

| Parameter                     | Type                          | Description                                                                       |
| ----------------------------- | ----------------------------- | --------------------------------------------------------------------------------- |
| `options.displayHeaderFooter` | `boolean` (optional)          | Display header and footer. Defaults to `false`.                                   |
| `options.footerTemplate`      | `string` (optional)           | HTML template for the print footer.                                               |
| `options.format`              | `string` (optional)           | Paper format (e.g., `'A4'`, `'Letter'`). Defaults to `'Letter'`.                  |
| `options.headerTemplate`      | `string` (optional)           | HTML template for the print header.                                               |
| `options.height`              | `string \| number` (optional) | Paper height with units.                                                          |
| `options.landscape`           | `boolean` (optional)          | Paper orientation. Defaults to `false`.                                           |
| `options.margin`              | `Object` (optional)           | Paper margins: `{ top, right, bottom, left }`.                                    |
| `options.outline`             | `boolean` (optional)          | Added in v1.42. Whether to embed document outline in PDF. Defaults to `false`.    |
| `options.pageRanges`          | `string` (optional)           | Paper ranges to print, e.g., `'1-5, 8, 11-13'`.                                   |
| `options.path`                | `string` (optional)           | File path to save the PDF to.                                                     |
| `options.preferCSSPageSize`   | `boolean` (optional)          | Give CSS `@page` size priority over `width`/`height`. Defaults to `false`.        |
| `options.printBackground`     | `boolean` (optional)          | Print background graphics. Defaults to `false`.                                   |
| `options.scale`               | `number` (optional)           | Scale of the webpage rendering. Defaults to 1.                                    |
| `options.tagged`              | `boolean` (optional)          | Added in v1.42. Whether to generate tagged (accessible) PDF. Defaults to `false`. |
| `options.width`               | `string \| number` (optional) | Paper width with units.                                                           |

**Returns:** `Promise<Buffer>`

### `page.pickLocator()` — Added in: v1.59

Enters pick locator mode where hovering over elements highlights them and shows the corresponding locator. Once the user clicks an element, the mode deactivates and returns the Locator.

```js
const locator = await page.pickLocator();
console.log(locator);
```

**Returns:** `Promise<Locator>`

### `page.reload()` — Added before v1.9

Reloads the current page, as if the user triggered a browser refresh. Returns the main resource response.

```js
await page.reload();
```

**Arguments:**

| Parameter           | Type                                                                   | Description                                                         |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `options.timeout`   | `number` (optional)                                                    | Maximum operation time in milliseconds. Defaults to 0 (no timeout). |
| `options.waitUntil` | `"load" \| "domcontentloaded" \| "networkidle" \| "commit"` (optional) | When to consider operation succeeded. Defaults to `load`.           |

**Returns:** `Promise<null | Response>`

### `page.removeAllListeners()` — Added in: v1.47

Removes all the listeners of the given type (or all registered listeners if no type given). Allows waiting for async listeners to complete or ignoring errors from them.

```js
await page.removeAllListeners('request', { behavior: 'wait' });
```

**Arguments:**

| Parameter          | Type                                               | Description                                                                 |
| ------------------ | -------------------------------------------------- | --------------------------------------------------------------------------- |
| `type`             | `string` (optional)                                | Event type to remove listeners for.                                         |
| `options.behavior` | `"wait" \| "ignoreErrors" \| "default"` (optional) | Whether to wait for already running listeners and what to do if they throw. |

**Returns:** `Promise<void>`

### `page.removeLocatorHandler()` — Added in: v1.44

Removes all locator handlers added by `page.addLocatorHandler()` for a specific locator.

```js
await page.removeLocatorHandler(locator);
```

**Arguments:**

| Parameter | Type      | Description                                   |
| --------- | --------- | --------------------------------------------- |
| `locator` | `Locator` | Locator passed to `page.addLocatorHandler()`. |

**Returns:** `Promise<void>`

### `page.requestGC()` — Added in: v1.48

Request the page to perform garbage collection. Useful for detecting memory leaks.

```js
await page.evaluate(() => (globalThis.suspectWeakRef = new WeakRef(suspect)));
await page.requestGC();
expect(await page.evaluate(() => !globalThis.suspectWeakRef.deref())).toBe(true);
```

**Returns:** `Promise<void>`

### `page.requests()` — Added in: v1.56

Returns up to 100 last network requests from this page. Returned requests should be accessed immediately.

```js
const requests = await page.requests();
```

**Returns:** `Promise<Array<Request>>`

### `page.route()` — Added before v1.9

Enables routing to modify network requests. Every request matching the url pattern will stall unless continued, fulfilled or aborted.

```js
await page.route('**/*.{png,jpg,jpeg}', (route) => route.abort());
await page.route(/\.(png|jpg)$/, (route) => route.abort());
```

**Arguments:**

| Parameter       | Type                                                       | Description                                                                |
| --------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| `url`           | `string \| RegExp \| URLPattern \| function(URL): boolean` | A glob pattern, regex, URL pattern, or predicate to match during routing.  |
| `handler`       | `function(Route, Request): Promise<Object> \| Object`      | Handler function to route the request.                                     |
| `options.times` | `number` (optional)                                        | Added in v1.15. How many times a route should be used. Defaults to always. |

**Returns:** `Promise<Disposable>`

### `page.routeFromHAR()` — Added in: v1.23

Serves matching network requests from the HAR file.

```js
await page.routeFromHAR('recording.har');
await page.routeFromHAR('recording.har', { url: /api/ });
```

**Arguments:**

| Parameter               | Type                               | Description                                                                                |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------ |
| `har`                   | `string`                           | Path to a HAR file with prerecorded network data.                                          |
| `options.notFound`      | `"abort" \| "fallback"` (optional) | What to do with requests not found in HAR. Defaults to `abort`.                            |
| `options.update`        | `boolean` (optional)               | If specified, updates the given HAR with actual network info instead of serving from file. |
| `options.updateContent` | `"embed" \| "attach"` (optional)   | Added in v1.32. Controls resource content management during update.                        |
| `options.updateMode`    | `"full" \| "minimal"` (optional)   | Added in v1.32. Whether to record full or minimal HAR. Defaults to `minimal`.              |
| `options.url`           | `string \| RegExp` (optional)      | Only requests matching this pattern are served from the HAR file.                          |

**Returns:** `Promise<void>`

### `page.routeWebSocket()` — Added in: v1.48

Allows modifying WebSocket connections made by the page. Only WebSockets created after this method is called are routed.

```js
await page.routeWebSocket('/ws', (ws) => {
  ws.onMessage((message) => {
    if (message === 'request') ws.send('response');
  });
});
```

**Arguments:**

| Parameter | Type                                                       | Description                                       |
| --------- | ---------------------------------------------------------- | ------------------------------------------------- |
| `url`     | `string \| RegExp \| URLPattern \| function(URL): boolean` | Only WebSockets with matching URL will be routed. |
| `handler` | `function(WebSocketRoute): Promise<Object> \| Object`      | Handler function to route the WebSocket.          |

**Returns:** `Promise<void>`

### `page.screenshot()` — Added before v1.9

Returns the buffer with the captured screenshot.

```js
await page.screenshot({ path: 'screenshot.png' });
await page.screenshot({ fullPage: true });
```

**Arguments:**

| Parameter                | Type                               | Description                                                            |
| ------------------------ | ---------------------------------- | ---------------------------------------------------------------------- |
| `options.animations`     | `"disabled" \| "allow"` (optional) | When set to `"disabled"`, stops CSS animations. Defaults to `"allow"`. |
| `options.caret`          | `"hide" \| "initial"` (optional)   | Whether to hide text caret. Defaults to `"hide"`.                      |
| `options.clip`           | `Object` (optional)                | `{ x, y, width, height }` clipping area.                               |
| `options.fullPage`       | `boolean` (optional)               | Full scrollable page screenshot. Defaults to `false`.                  |
| `options.mask`           | `Array<Locator>` (optional)        | Locators to mask with a pink box.                                      |
| `options.maskColor`      | `string` (optional)                | Added in v1.35. Color of the mask overlay. Defaults to `#FF00FF`.      |
| `options.omitBackground` | `boolean` (optional)               | Hide default white background for transparency. Defaults to `false`.   |
| `options.path`           | `string` (optional)                | File path to save the image to.                                        |
| `options.quality`        | `number` (optional)                | Image quality, 0-100. Not applicable to PNG.                           |
| `options.scale`          | `"css" \| "device"` (optional)     | Pixel ratio for the screenshot. Defaults to `"device"`.                |
| `options.style`          | `string` (optional)                | Added in v1.41. Stylesheet text to apply while taking the screenshot.  |
| `options.timeout`        | `number` (optional)                | Maximum time in milliseconds. Defaults to 0 (no timeout).              |
| `options.type`           | `"png" \| "jpeg"` (optional)       | Screenshot type. Defaults to `png`.                                    |

**Returns:** `Promise<Buffer>`

### `page.setContent()` — Added before v1.9

Sets the HTML content of the page (internally calls `document.write()`).

```js
await page.setContent('<h1>Hello world</h1>');
```

**Arguments:**

| Parameter           | Type                                                                   | Description                                                         |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `html`              | `string`                                                               | HTML markup to assign to the page.                                  |
| `options.timeout`   | `number` (optional)                                                    | Maximum operation time in milliseconds. Defaults to 0 (no timeout). |
| `options.waitUntil` | `"load" \| "domcontentloaded" \| "networkidle" \| "commit"` (optional) | When to consider operation succeeded. Defaults to `load`.           |

**Returns:** `Promise<void>`

### `page.setDefaultNavigationTimeout()` — Added before v1.9

Changes the default maximum navigation time for navigation-related methods. Takes priority over `page.setDefaultTimeout()`, `browserContext.setDefaultTimeout()`, and `browserContext.setDefaultNavigationTimeout()`.

```js
page.setDefaultNavigationTimeout(30000);
```

**Arguments:**

| Parameter | Type     | Description                              |
| --------- | -------- | ---------------------------------------- |
| `timeout` | `number` | Maximum navigation time in milliseconds. |

**Returns:** `void`

### `page.setDefaultTimeout()` — Added before v1.9

Changes the default maximum time for all methods accepting a `timeout` option. `page.setDefaultNavigationTimeout()` takes priority over this method.

```js
page.setDefaultTimeout(30000);
```

**Arguments:**

| Parameter | Type     | Description                                                |
| --------- | -------- | ---------------------------------------------------------- |
| `timeout` | `number` | Maximum time in milliseconds. Pass `0` to disable timeout. |

**Returns:** `void`

### `page.setExtraHTTPHeaders()` — Added before v1.9

Sets extra HTTP headers sent with every request the page initiates.

```js
await page.setExtraHTTPHeaders({ 'X-Custom-Header': 'value' });
```

**Arguments:**

| Parameter | Type                     | Description                                                                      |
| --------- | ------------------------ | -------------------------------------------------------------------------------- |
| `headers` | `Object<string, string>` | An object containing additional HTTP headers. All header values must be strings. |

**Returns:** `Promise<void>`

### `page.setViewportSize()` — Added before v1.9

Sets the page viewport size. Should be set before navigating.

```js
await page.setViewportSize({ width: 640, height: 480 });
await page.goto('https://example.com');
```

**Arguments:**

| Parameter             | Type     | Description            |
| --------------------- | -------- | ---------------------- |
| `viewportSize.width`  | `number` | Page width in pixels.  |
| `viewportSize.height` | `number` | Page height in pixels. |

**Returns:** `Promise<void>`

### `page.title()` — Added before v1.9

Returns the page's title.

```js
const title = await page.title();
```

**Returns:** `Promise<string>`

### `page.unroute()` — Added before v1.9

Removes a route created with `page.route()`. When `handler` is not specified, removes all routes for the URL.

```js
await page.unroute(url);
await page.unroute(url, handler);
```

**Arguments:**

| Parameter | Type                                                             | Description                                      |
| --------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| `url`     | `string \| RegExp \| URLPattern \| function(URL): boolean`       | URL pattern matching the route to remove.        |
| `handler` | `function(Route, Request): Promise<Object> \| Object` (optional) | Optional handler to match which route to remove. |

**Returns:** `Promise<void>`

### `page.unrouteAll()` — Added in: v1.41

Removes all routes created with `page.route()` and `page.routeFromHAR()`.

```js
await page.unrouteAll();
await page.unrouteAll({ behavior: 'wait' });
```

**Arguments:**

| Parameter          | Type                                               | Description                             |
| ------------------ | -------------------------------------------------- | --------------------------------------- |
| `options.behavior` | `"wait" \| "ignoreErrors" \| "default"` (optional) | How to handle already running handlers. |

**Returns:** `Promise<void>`

### `page.url()` — Added before v1.9

Returns the page's URL.

```js
const url = page.url();
```

**Returns:** `string`

### `page.video()` — Added before v1.9

Video object associated with this page. Can be used to access the video file when using the `recordVideo` context option.

```js
const video = page.video();
```

**Returns:** `null | Video`

### `page.viewportSize()` — Added before v1.9

Returns the page viewport size.

```js
const size = page.viewportSize();
// { width: 1280, height: 720 }
```

**Returns:** `null | Object` — `{ width: number, height: number }`

### `page.waitForEvent()` — Added before v1.9

Waits for the event to fire and passes its value to a predicate function. Resolves when predicate returns truthy.

```js
const downloadPromise = page.waitForEvent('download');
await page.getByText('Download file').click();
const download = await downloadPromise;
```

**Arguments:**

| Parameter            | Type                            | Description                                                   |
| -------------------- | ------------------------------- | ------------------------------------------------------------- |
| `event`              | `string`                        | Event name (e.g., `'download'`, `'popup'`).                   |
| `optionsOrPredicate` | `function \| Object` (optional) | A predicate or options object with `predicate` and `timeout`. |

**Returns:** `Promise<Object>`

### `page.waitForFunction()` — Added before v1.9

Returns when the `pageFunction` returns a truthy value. Resolves to a `JSHandle` of that value.

```js
const watchDog = page.waitForFunction(() => window.innerWidth < 100);
await page.setViewportSize({ width: 50, height: 50 });
await watchDog;
```

**Arguments:**

| Parameter         | Type                            | Description                                               |
| ----------------- | ------------------------------- | --------------------------------------------------------- |
| `pageFunction`    | `function \| string`            | Function to be evaluated in the page context.             |
| `arg`             | `EvaluationArgument` (optional) | Optional argument to pass to `pageFunction`.              |
| `options.polling` | `number \| "raf"` (optional)    | Polling interval. Defaults to `"raf"`.                    |
| `options.timeout` | `number` (optional)             | Maximum time in milliseconds. Defaults to 0 (no timeout). |

**Returns:** `Promise<JSHandle>`

### `page.waitForLoadState()` — Added before v1.9

Returns when the required load state has been reached.

```js
await page.getByRole('button').click();
await page.waitForLoadState();
```

**Arguments:**

| Parameter         | Type                                                       | Description                                                         |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------------------------- |
| `state`           | `"load" \| "domcontentloaded" \| "networkidle"` (optional) | Load state to wait for. Defaults to `"load"`.                       |
| `options.timeout` | `number` (optional)                                        | Maximum operation time in milliseconds. Defaults to 0 (no timeout). |

**Returns:** `Promise<void>`

### `page.waitForRequest()` — Added before v1.9

Waits for the matching request and returns it.

```js
const requestPromise = page.waitForRequest('https://example.com/resource');
await page.getByText('trigger request').click();
const request = await requestPromise;
```

**Arguments:**

| Parameter         | Type                                                                 | Description                                                |
| ----------------- | -------------------------------------------------------------------- | ---------------------------------------------------------- |
| `urlOrPredicate`  | `string \| RegExp \| function(Request): boolean \| Promise<boolean>` | Request URL string, regex, or predicate.                   |
| `options.timeout` | `number` (optional)                                                  | Maximum wait time in milliseconds. Defaults to 30 seconds. |

**Returns:** `Promise<Request>`

### `page.waitForResponse()` — Added before v1.9

Returns the matched response.

```js
const responsePromise = page.waitForResponse('https://example.com/resource');
await page.getByText('trigger response').click();
const response = await responsePromise;
```

**Arguments:**

| Parameter         | Type                                                                  | Description                                                |
| ----------------- | --------------------------------------------------------------------- | ---------------------------------------------------------- |
| `urlOrPredicate`  | `string \| RegExp \| function(Response): boolean \| Promise<boolean>` | Request URL string, regex, or predicate.                   |
| `options.timeout` | `number` (optional)                                                   | Maximum wait time in milliseconds. Defaults to 30 seconds. |

**Returns:** `Promise<Response>`

### `page.waitForURL()` — Added in: v1.11

Waits for the main frame to navigate to the given URL.

```js
await page.click('a.delayed-navigation');
await page.waitForURL('**/target.html');
```

**Arguments:**

| Parameter           | Type                                                                   | Description                                                         |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `url`               | `string \| RegExp \| URLPattern \| function(URL): boolean`             | A glob pattern, regex, URL pattern, or predicate.                   |
| `options.timeout`   | `number` (optional)                                                    | Maximum operation time in milliseconds. Defaults to 0 (no timeout). |
| `options.waitUntil` | `"load" \| "domcontentloaded" \| "networkidle" \| "commit"` (optional) | When to consider operation succeeded. Defaults to `load`.           |

**Returns:** `Promise<void>`

### `page.workers()` — Added before v1.9

Returns all dedicated WebWorkers associated with the page.

```js
const workers = page.workers();
```

**Returns:** `Array<Worker>`

## Properties

### `page.clock` — Added in: v1.45

Playwright has ability to mock clock and passage of time.

**Type:** `Clock`

### `page.coverage` — Added before v1.9

Browser-specific Coverage implementation. Only available for Chromium.

**Type:** `Coverage`

### `page.keyboard` — Added before v1.9

Keyboard interface for this page.

**Type:** `Keyboard`

### `page.mouse` — Added before v1.9

Mouse interface for this page.

**Type:** `Mouse`

### `page.request` — Added in: v1.16

API testing helper associated with this page. Returns the same instance as `browserContext.request` on the page's context.

**Type:** `APIRequestContext`

### `page.screencast` — Added in: v1.59

Screencast object associated with this page.

```js
page.screencast.on('screencastFrame', (data) => {
  console.log('received frame, jpeg size:', data.length);
});
await page.screencast.start();
await page.screencast.stop();
```

**Type:** `Screencast`

### `page.touchscreen` — Added before v1.9

Touchscreen interface for this page.

**Type:** `Touchscreen`

## Events

### `page.on('close')` — Added before v1.9

Emitted when the page closes.

```js
page.on('close', (data) => {});
```

**Event data:** `Page`

### `page.on('console')` — Added before v1.9

Emitted when JavaScript calls a console API method (e.g., `console.log`).

```js
page.on('console', async (msg) => {
  const values = [];
  for (const arg of msg.args()) values.push(await arg.jsonValue());
  console.log(...values);
});
```

**Event data:** `ConsoleMessage`

### `page.on('crash')` — Added before v1.9

Emitted when the page crashes (e.g., out of memory).

```js
try {
  await page.click('button');
} catch (e) {
  // exception message contains 'crash'
}
```

**Event data:** `Page`

### `page.on('dialog')` — Added before v1.9

Emitted when a JavaScript dialog appears (`alert`, `prompt`, `confirm`, `beforeunload`). Listener must either `dialog.accept()` or `dialog.dismiss()` the dialog.

```js
page.on('dialog', (dialog) => dialog.accept());
```

**Event data:** `Dialog`

### `page.on('domcontentloaded')` — Added in: v1.9

Emitted when the JavaScript `DOMContentLoaded` event is dispatched.

```js
page.on('domcontentloaded', (data) => {});
```

**Event data:** `Page`

### `page.on('download')` — Added before v1.9

Emitted when attachment download started.

```js
page.on('download', (data) => {});
```

**Event data:** `Download`

### `page.on('filechooser')` — Added in: v1.9

Emitted when a file chooser is supposed to appear.

```js
page.on('filechooser', async (fileChooser) => {
  await fileChooser.setFiles(path.join(__dirname, '/tmp/myfile.pdf'));
});
```

**Event data:** `FileChooser`

### `page.on('frameattached')` — Added in: v1.9

Emitted when a frame is attached.

```js
page.on('frameattached', (data) => {});
```

**Event data:** `Frame`

### `page.on('framedetached')` — Added in: v1.9

Emitted when a frame is detached.

```js
page.on('framedetached', (data) => {});
```

**Event data:** `Frame`

### `page.on('framenavigated')` — Added in: v1.9

Emitted when a frame is navigated to a new URL.

```js
page.on('framenavigated', (data) => {});
```

**Event data:** `Frame`

### `page.on('load')` — Added before v1.9

Emitted when the JavaScript `load` event is dispatched.

```js
page.on('load', (data) => {});
```

**Event data:** `Page`

### `page.on('pageerror')` — Added in: v1.9

Emitted when an uncaught exception happens within the page.

```js
page.on('pageerror', (exception) => {
  console.log(`Uncaught exception: "${exception}"`);
});
```

**Event data:** `Error`

### `page.on('popup')` — Added before v1.9

Emitted when the page opens a new tab or window.

```js
const popupPromise = page.waitForEvent('popup');
await page.getByText('open the popup').click();
const popup = await popupPromise;
console.log(await popup.evaluate('location.href'));
```

**Event data:** `Page`

### `page.on('request')` — Added before v1.9

Emitted when a page issues a request. The request object is read-only.

```js
page.on('request', (data) => {});
```

**Event data:** `Request`

### `page.on('requestfailed')` — Added in: v1.9

Emitted when a request fails (e.g., by timing out).

```js
page.on('requestfailed', (request) => {
  console.log(request.url() + ' ' + request.failure().errorText);
});
```

**Event data:** `Request`

### `page.on('requestfinished')` — Added in: v1.9

Emitted when a request finishes successfully after downloading the response body.

```js
page.on('requestfinished', (data) => {});
```

**Event data:** `Request`

### `page.on('response')` — Added before v1.9

Emitted when response status and headers are received for a request.

```js
page.on('response', (data) => {});
```

**Event data:** `Response`

### `page.on('websocket')` — Added in: v1.9

Emitted when WebSocket request is sent.

```js
page.on('websocket', (data) => {});
```

**Event data:** `WebSocket`

### `page.on('worker')` — Added before v1.9

Emitted when a dedicated WebWorker is spawned by the page.

```js
page.on('worker', (data) => {});
```

**Event data:** `Worker`

## Deprecated

### `page.$()` — Added in: v1.9

> **Discouraged:** Use locator-based `page.locator()` instead.

Finds an element matching the specified selector. Returns `null` if no elements match.

```js
const element = await page.$('css=button');
```

**Arguments:**

| Parameter        | Type                 | Description                                                       |
| ---------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`       | `string`             | A selector to query for.                                          |
| `options.strict` | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |

**Returns:** `Promise<null | ElementHandle>`

### `page.$$()` — Added in: v1.9

> **Discouraged:** Use locator-based `page.locator()` instead.

Finds all elements matching the specified selector. Returns `[]` if no elements match.

```js
const elements = await page.$$('css=button');
```

**Arguments:**

| Parameter  | Type     | Description              |
| ---------- | -------- | ------------------------ |
| `selector` | `string` | A selector to query for. |

**Returns:** `Promise<Array<ElementHandle>>`

### `page.$eval()` — Added in: v1.9

> **Discouraged:** Use `locator.evaluate()` or web-first assertions instead.

Finds an element matching the selector and passes it as the first argument to `pageFunction`.

```js
const searchValue = await page.$eval('#search', (el) => el.value);
```

**Arguments:**

| Parameter        | Type                            | Description                                                       |
| ---------------- | ------------------------------- | ----------------------------------------------------------------- |
| `selector`       | `string`                        | A selector to query for.                                          |
| `pageFunction`   | `function(Element) \| string`   | Function to be evaluated in the page context.                     |
| `arg`            | `EvaluationArgument` (optional) | Optional argument to pass to `pageFunction`.                      |
| `options.strict` | `boolean` (optional)            | Added in v1.14. Requires selector to resolve to a single element. |

**Returns:** `Promise<Serializable>`

### `page.$$eval()` — Added in: v1.9

> **Discouraged:** Use `locator.evaluateAll()` or web-first assertions instead.

Finds all elements matching the selector and passes them as the first argument to `pageFunction`.

```js
const divCounts = await page.$$eval('div', (divs, min) => divs.length >= min, 10);
```

**Arguments:**

| Parameter      | Type                                 | Description                                   |
| -------------- | ------------------------------------ | --------------------------------------------- |
| `selector`     | `string`                             | A selector to query for.                      |
| `pageFunction` | `function(Array<Element>) \| string` | Function to be evaluated in the page context. |
| `arg`          | `EvaluationArgument` (optional)      | Optional argument to pass to `pageFunction`.  |

**Returns:** `Promise<Serializable>`

### `page.check()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.check()` instead.

Checks an element matching `selector`.

```js
await page.check('input[type=checkbox]');
```

**Arguments:**

| Parameter             | Type                 | Description                                                         |
| --------------------- | -------------------- | ------------------------------------------------------------------- |
| `selector`            | `string`             | A selector to search for an element.                                |
| `options.force`       | `boolean` (optional) | Whether to bypass actionability checks. Defaults to `false`.        |
| `options.noWaitAfter` | `boolean` (optional) | Deprecated. No effect.                                              |
| `options.position`    | `Object` (optional)  | Added in v1.11. `{ x, y }` point relative to element.               |
| `options.strict`      | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element.   |
| `options.timeout`     | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).           |
| `options.trial`       | `boolean` (optional) | Added in v1.11. Only perform actionability checks, skip the action. |

**Returns:** `Promise<void>`

### `page.click()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.click()` instead.

Clicks an element matching `selector`.

```js
await page.click('button#submit');
```

**Arguments:**

| Parameter             | Type                                       | Description                                                         |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| `selector`            | `string`                                   | A selector to search for an element.                                |
| `options.button`      | `"left" \| "right" \| "middle"` (optional) | Defaults to `left`.                                                 |
| `options.clickCount`  | `number` (optional)                        | Number of clicks. Defaults to 1.                                    |
| `options.delay`       | `number` (optional)                        | Time between mousedown and mouseup in milliseconds. Defaults to 0.  |
| `options.force`       | `boolean` (optional)                       | Whether to bypass actionability checks. Defaults to `false`.        |
| `options.modifiers`   | `Array<string>` (optional)                 | Modifier keys to press during the operation.                        |
| `options.noWaitAfter` | `boolean` (optional)                       | Deprecated.                                                         |
| `options.position`    | `Object` (optional)                        | `{ x, y }` point relative to element.                               |
| `options.strict`      | `boolean` (optional)                       | Added in v1.14. Requires selector to resolve to a single element.   |
| `options.timeout`     | `number` (optional)                        | Maximum time in milliseconds. Defaults to 0 (no timeout).           |
| `options.trial`       | `boolean` (optional)                       | Added in v1.11. Only perform actionability checks, skip the action. |

**Returns:** `Promise<void>`

### `page.dblclick()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.dblclick()` instead.

Double clicks an element matching `selector`.

```js
await page.dblclick('button#edit');
```

**Arguments:**

| Parameter             | Type                                       | Description                                                         |
| --------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| `selector`            | `string`                                   | A selector to search for an element.                                |
| `options.button`      | `"left" \| "right" \| "middle"` (optional) | Defaults to `left`.                                                 |
| `options.delay`       | `number` (optional)                        | Time between mousedown and mouseup in milliseconds. Defaults to 0.  |
| `options.force`       | `boolean` (optional)                       | Whether to bypass actionability checks. Defaults to `false`.        |
| `options.modifiers`   | `Array<string>` (optional)                 | Modifier keys to press.                                             |
| `options.noWaitAfter` | `boolean` (optional)                       | Deprecated. No effect.                                              |
| `options.position`    | `Object` (optional)                        | `{ x, y }` point relative to element.                               |
| `options.strict`      | `boolean` (optional)                       | Added in v1.14. Requires selector to resolve to a single element.   |
| `options.timeout`     | `number` (optional)                        | Maximum time in milliseconds. Defaults to 0 (no timeout).           |
| `options.trial`       | `boolean` (optional)                       | Added in v1.11. Only perform actionability checks, skip the action. |

**Returns:** `Promise<void>`

### `page.dispatchEvent()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.dispatchEvent()` instead.

Dispatches a DOM event on the matching element.

```js
await page.dispatchEvent('button#submit', 'click');
```

**Arguments:**

| Parameter         | Type                            | Description                                                       |
| ----------------- | ------------------------------- | ----------------------------------------------------------------- |
| `selector`        | `string`                        | A selector to search for an element.                              |
| `type`            | `string`                        | DOM event type (e.g., `"click"`, `"dragstart"`).                  |
| `eventInit`       | `EvaluationArgument` (optional) | Optional event-specific initialization properties.                |
| `options.strict`  | `boolean` (optional)            | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout` | `number` (optional)             | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<void>`

### `page.fill()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.fill()` instead.

Fills an input, textarea, or contenteditable element.

```js
await page.fill('#username', 'admin');
```

**Arguments:**

| Parameter             | Type                 | Description                                                                  |
| --------------------- | -------------------- | ---------------------------------------------------------------------------- |
| `selector`            | `string`             | A selector to search for an element.                                         |
| `value`               | `string`             | Value to fill the element with.                                              |
| `options.force`       | `boolean` (optional) | Added in v1.13. Whether to bypass actionability checks. Defaults to `false`. |
| `options.noWaitAfter` | `boolean` (optional) | Deprecated. No effect.                                                       |
| `options.strict`      | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element.            |
| `options.timeout`     | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).                    |

**Returns:** `Promise<void>`

### `page.focus()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.focus()` instead.

Fetches an element with `selector` and focuses it.

```js
await page.focus('#username');
```

**Arguments:**

| Parameter         | Type                 | Description                                                       |
| ----------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`        | `string`             | A selector to search for an element.                              |
| `options.strict`  | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout` | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<void>`

### `page.getAttribute()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.getAttribute()` instead.

Returns the element attribute value.

```js
const href = await page.getAttribute('a', 'href');
```

**Arguments:**

| Parameter         | Type                 | Description                                                       |
| ----------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`        | `string`             | A selector to search for an element.                              |
| `name`            | `string`             | Attribute name to get the value for.                              |
| `options.strict`  | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout` | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<null | string>`

### `page.hover()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.hover()` instead.

Hovers over an element matching `selector`.

```js
await page.hover('button#menu');
```

**Arguments:**

| Parameter             | Type                       | Description                                                         |
| --------------------- | -------------------------- | ------------------------------------------------------------------- |
| `selector`            | `string`                   | A selector to search for an element.                                |
| `options.force`       | `boolean` (optional)       | Whether to bypass actionability checks. Defaults to `false`.        |
| `options.modifiers`   | `Array<string>` (optional) | Modifier keys to press.                                             |
| `options.noWaitAfter` | `boolean` (optional)       | Added in v1.28. Deprecated. No effect.                              |
| `options.position`    | `Object` (optional)        | `{ x, y }` point relative to element.                               |
| `options.strict`      | `boolean` (optional)       | Added in v1.14. Requires selector to resolve to a single element.   |
| `options.timeout`     | `number` (optional)        | Maximum time in milliseconds. Defaults to 0 (no timeout).           |
| `options.trial`       | `boolean` (optional)       | Added in v1.11. Only perform actionability checks, skip the action. |

**Returns:** `Promise<void>`

### `page.innerHTML()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.innerHTML()` instead.

Returns `element.innerHTML`.

```js
const html = await page.innerHTML('.main-container');
```

**Arguments:**

| Parameter         | Type                 | Description                                                       |
| ----------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`        | `string`             | A selector to search for an element.                              |
| `options.strict`  | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout` | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<string>`

### `page.innerText()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.innerText()` instead.

Returns `element.innerText`.

```js
const text = await page.innerText('h1');
```

**Arguments:**

| Parameter         | Type                 | Description                                                       |
| ----------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`        | `string`             | A selector to search for an element.                              |
| `options.strict`  | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout` | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<string>`

### `page.inputValue()` — Added in: v1.13

> **Discouraged:** Use locator-based `locator.inputValue()` instead.

Returns `input.value` for `<input>`, `<textarea>` or `<select>` elements.

```js
const value = await page.inputValue('#search');
```

**Arguments:**

| Parameter         | Type                 | Description                                                       |
| ----------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`        | `string`             | A selector to search for an element.                              |
| `options.strict`  | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout` | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<string>`

### `page.isChecked()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.isChecked()` instead.

Returns whether the element is checked. Throws if not a checkbox or radio input.

```js
const checked = await page.isChecked('input[type=checkbox]');
```

**Arguments:**

| Parameter         | Type                 | Description                                                       |
| ----------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`        | `string`             | A selector to search for an element.                              |
| `options.strict`  | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout` | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<boolean>`

### `page.isDisabled()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.isDisabled()` instead.

Returns whether the element is disabled.

```js
const disabled = await page.isDisabled('button');
```

**Arguments:**

| Parameter         | Type                 | Description                                                       |
| ----------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`        | `string`             | A selector to search for an element.                              |
| `options.strict`  | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout` | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<boolean>`

### `page.isEditable()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.isEditable()` instead.

Returns whether the element is editable.

```js
const editable = await page.isEditable('input#name');
```

**Arguments:**

| Parameter         | Type                 | Description                                                       |
| ----------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`        | `string`             | A selector to search for an element.                              |
| `options.strict`  | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout` | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<boolean>`

### `page.isEnabled()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.isEnabled()` instead.

Returns whether the element is enabled.

```js
const enabled = await page.isEnabled('button');
```

**Arguments:**

| Parameter         | Type                 | Description                                                       |
| ----------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`        | `string`             | A selector to search for an element.                              |
| `options.strict`  | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout` | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<boolean>`

### `page.isHidden()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.isHidden()` instead.

Returns whether the element is hidden. Selectors that don't match any elements are considered hidden.

```js
const hidden = await page.isHidden('.overlay');
```

**Arguments:**

| Parameter         | Type                 | Description                                                       |
| ----------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`        | `string`             | A selector to search for an element.                              |
| `options.strict`  | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout` | `number` (optional)  | Deprecated. This option is ignored.                               |

**Returns:** `Promise<boolean>`

### `page.isVisible()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.isVisible()` instead.

Returns whether the element is visible. Selectors that don't match any elements are considered not visible.

```js
const visible = await page.isVisible('button#submit');
```

**Arguments:**

| Parameter         | Type                 | Description                                                       |
| ----------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`        | `string`             | A selector to search for an element.                              |
| `options.strict`  | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout` | `number` (optional)  | Deprecated. This option is ignored.                               |

**Returns:** `Promise<boolean>`

### `page.press()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.press()` instead.

Focuses the element and uses `keyboard.down()` and `keyboard.up()` to press the key.

```js
await page.press('body', 'A');
await page.press('body', 'Control+c');
```

**Arguments:**

| Parameter             | Type                 | Description                                                       |
| --------------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`            | `string`             | A selector to search for an element.                              |
| `key`                 | `string`             | Name of the key to press or a character to generate.              |
| `options.delay`       | `number` (optional)  | Time between keydown and keyup in milliseconds. Defaults to 0.    |
| `options.noWaitAfter` | `boolean` (optional) | Deprecated.                                                       |
| `options.strict`      | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout`     | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<void>`

### `page.selectOption()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.selectOption()` instead.

Selects options in a `<select>` element.

```js
page.selectOption('select#colors', 'blue');
page.selectOption('select#colors', { label: 'Blue' });
page.selectOption('select#colors', ['red', 'green', 'blue']);
```

**Arguments:**

| Parameter             | Type                                                                | Description                                                       |
| --------------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `selector`            | `string`                                                            | A selector to search for an element.                              |
| `values`              | `null \| string \| ElementHandle \| Array<string> \| Object \| ...` | Options to select.                                                |
| `options.force`       | `boolean` (optional)                                                | Added in v1.13. Whether to bypass actionability checks.           |
| `options.noWaitAfter` | `boolean` (optional)                                                | Deprecated. No effect.                                            |
| `options.strict`      | `boolean` (optional)                                                | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout`     | `number` (optional)                                                 | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<Array<string>>`

### `page.setChecked()` — Added in: v1.15

> **Discouraged:** Use locator-based `locator.setChecked()` instead.

Checks or unchecks an element matching `selector`.

```js
await page.setChecked('input[type=checkbox]', true);
```

**Arguments:**

| Parameter             | Type                 | Description                                                  |
| --------------------- | -------------------- | ------------------------------------------------------------ |
| `selector`            | `string`             | A selector to search for an element.                         |
| `checked`             | `boolean`            | Whether to check or uncheck the checkbox.                    |
| `options.force`       | `boolean` (optional) | Whether to bypass actionability checks. Defaults to `false`. |
| `options.noWaitAfter` | `boolean` (optional) | Deprecated. No effect.                                       |
| `options.position`    | `Object` (optional)  | `{ x, y }` point relative to element.                        |
| `options.strict`      | `boolean` (optional) | Requires selector to resolve to a single element.            |
| `options.timeout`     | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).    |
| `options.trial`       | `boolean` (optional) | Only perform actionability checks, skip the action.          |

**Returns:** `Promise<void>`

### `page.setInputFiles()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.setInputFiles()` instead.

Sets the value of a file input to the specified file paths or files.

```js
await page.setInputFiles('input[type=file]', 'myfile.pdf');
```

**Arguments:**

| Parameter             | Type                                                 | Description                                                       |
| --------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| `selector`            | `string`                                             | A selector to search for an element.                              |
| `files`               | `string \| Array<string> \| Object \| Array<Object>` | File paths or file objects `{ name, mimeType, buffer }`.          |
| `options.noWaitAfter` | `boolean` (optional)                                 | Deprecated. No effect.                                            |
| `options.strict`      | `boolean` (optional)                                 | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout`     | `number` (optional)                                  | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<void>`

### `page.tap()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.tap()` instead.

Taps an element matching `selector`. Requires `hasTouch` option in browser context to be `true`.

```js
await page.tap('button#menu');
```

**Arguments:**

| Parameter             | Type                       | Description                                                         |
| --------------------- | -------------------------- | ------------------------------------------------------------------- |
| `selector`            | `string`                   | A selector to search for an element.                                |
| `options.force`       | `boolean` (optional)       | Whether to bypass actionability checks. Defaults to `false`.        |
| `options.modifiers`   | `Array<string>` (optional) | Modifier keys to press.                                             |
| `options.noWaitAfter` | `boolean` (optional)       | Deprecated. No effect.                                              |
| `options.position`    | `Object` (optional)        | `{ x, y }` point relative to element.                               |
| `options.strict`      | `boolean` (optional)       | Added in v1.14. Requires selector to resolve to a single element.   |
| `options.timeout`     | `number` (optional)        | Maximum time in milliseconds. Defaults to 0 (no timeout).           |
| `options.trial`       | `boolean` (optional)       | Added in v1.11. Only perform actionability checks, skip the action. |

**Returns:** `Promise<void>`

### `page.textContent()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.textContent()` instead.

Returns `element.textContent`.

```js
const text = await page.textContent('h1');
```

**Arguments:**

| Parameter         | Type                 | Description                                                       |
| ----------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`        | `string`             | A selector to search for an element.                              |
| `options.strict`  | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout` | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<null | string>`

### `page.type()` — Added before v1.9

> **Deprecated:** Use `locator.fill()` in most cases. Use `locator.pressSequentially()` only for special keyboard handling.

Sends a keydown, keypress/input, and keyup event for each character in the text.

```js
await page.type('#editor', 'Hello World');
```

**Arguments:**

| Parameter             | Type                 | Description                                                       |
| --------------------- | -------------------- | ----------------------------------------------------------------- |
| `selector`            | `string`             | A selector to search for an element.                              |
| `text`                | `string`             | A text to type into a focused element.                            |
| `options.delay`       | `number` (optional)  | Time between key presses in milliseconds. Defaults to 0.          |
| `options.noWaitAfter` | `boolean` (optional) | Deprecated. No effect.                                            |
| `options.strict`      | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout`     | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<void>`

### `page.uncheck()` — Added before v1.9

> **Discouraged:** Use locator-based `locator.uncheck()` instead.

Unchecks an element matching `selector`.

```js
await page.uncheck('input[type=checkbox]');
```

**Arguments:**

| Parameter             | Type                 | Description                                                         |
| --------------------- | -------------------- | ------------------------------------------------------------------- |
| `selector`            | `string`             | A selector to search for an element.                                |
| `options.force`       | `boolean` (optional) | Whether to bypass actionability checks. Defaults to `false`.        |
| `options.noWaitAfter` | `boolean` (optional) | Deprecated. No effect.                                              |
| `options.position`    | `Object` (optional)  | Added in v1.11. `{ x, y }` point relative to element.               |
| `options.strict`      | `boolean` (optional) | Added in v1.14. Requires selector to resolve to a single element.   |
| `options.timeout`     | `number` (optional)  | Maximum time in milliseconds. Defaults to 0 (no timeout).           |
| `options.trial`       | `boolean` (optional) | Added in v1.11. Only perform actionability checks, skip the action. |

**Returns:** `Promise<void>`

### `page.waitForNavigation()` — Added before v1.9

> **Deprecated:** Use `page.waitForURL()` instead.

Waits for the main frame navigation and returns the main resource response.

```js
const navigationPromise = page.waitForNavigation();
await page.getByText('Navigate after timeout').click();
await navigationPromise;
```

**Arguments:**

| Parameter           | Type                                                                   | Description                                                         |
| ------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `options.timeout`   | `number` (optional)                                                    | Maximum operation time in milliseconds. Defaults to 0 (no timeout). |
| `options.url`       | `string \| RegExp \| URLPattern \| function(URL): boolean` (optional)  | URL pattern to match while waiting.                                 |
| `options.waitUntil` | `"load" \| "domcontentloaded" \| "networkidle" \| "commit"` (optional) | When to consider operation succeeded. Defaults to `load`.           |

**Returns:** `Promise<null | Response>`

### `page.waitForSelector()` — Added before v1.9

> **Discouraged:** Use web assertions or `locator.waitFor()` instead.

Waits for the selector to satisfy the `state` option.

```js
const element = await page.waitForSelector('img');
```

**Arguments:**

| Parameter         | Type                                                           | Description                                                       |
| ----------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| `selector`        | `string`                                                       | A selector to query for.                                          |
| `options.state`   | `"attached" \| "detached" \| "visible" \| "hidden"` (optional) | Defaults to `"visible"`.                                          |
| `options.strict`  | `boolean` (optional)                                           | Added in v1.14. Requires selector to resolve to a single element. |
| `options.timeout` | `number` (optional)                                            | Maximum time in milliseconds. Defaults to 0 (no timeout).         |

**Returns:** `Promise<null | ElementHandle>`

### `page.waitForTimeout()` — Added before v1.9

> **Discouraged:** Never use in production. Use Locator actions and web assertions instead.

Waits for the given timeout in milliseconds.

```js
await page.waitForTimeout(1000);
```

**Arguments:**

| Parameter | Type     | Description                            |
| --------- | -------- | -------------------------------------- |
| `timeout` | `number` | A timeout to wait for in milliseconds. |

**Returns:** `Promise<void>`
