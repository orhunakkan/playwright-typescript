# 📦 Playwright — Frame

> **Source:** [playwright.dev/docs/api/class-frame](https://playwright.dev/docs/api/class-frame)

---

At every point of time, page exposes its current frame tree via the `page.mainFrame()` and `frame.childFrames()` methods. Frame object's lifecycle is controlled by three events, dispatched on the page object:

- `page.on('frameattached')` — fired when the frame gets attached to the page. A Frame can be attached to the page only once.
- `page.on('framenavigated')` — fired when the frame commits navigation to a different URL.
- `page.on('framedetached')` — fired when the frame gets detached from the page. A Frame can be detached from the page only once.

An example of dumping frame tree:

```ts
const { firefox } = require('playwright'); // Or 'chromium' or 'webkit'.
(async () => {
  const browser = await firefox.launch();
  const page = await browser.newPage();
  await page.goto('https://www.google.com/chrome/browser/canary.html');
  dumpFrameTree(page.mainFrame(), '');
  await browser.close();

  function dumpFrameTree(frame, indent) {
    console.log(indent + frame.url());
    for (const child of frame.childFrames()) dumpFrameTree(child, indent + '  ');
  }
})();
```

---

## Methods

### addScriptTag

**Added before:** v1.9

Returns the added tag when the script's `onload` fires or when the script content was injected into frame. Adds a `<script>` tag into the page with the desired url or content.

```ts
await frame.addScriptTag();
await frame.addScriptTag(options);
```

**Arguments:**

- `options` Object (optional)
  - `content` string (optional) — Raw JavaScript content to be injected into frame.
  - `path` string (optional) — Path to the JavaScript file to be injected into frame.
  - `type` string (optional) — Script type. Use `'module'` in order to load a JavaScript ES6 module.
  - `url` string (optional) — URL of a script to be added.

**Returns:** `Promise<ElementHandle>`

---

### addStyleTag

**Added before:** v1.9

Returns the added tag when the stylesheet's `onload` fires or when the CSS content was injected into frame. Adds a `<link rel="stylesheet">` tag into the page with the desired url or a `<style type="text/css">` tag with the content.

```ts
await frame.addStyleTag();
await frame.addStyleTag(options);
```

**Arguments:**

- `options` Object (optional)
  - `content` string (optional) — Raw CSS content to be injected into frame.
  - `path` string (optional) — Path to the CSS file to be injected into frame.
  - `url` string (optional) — URL of the `<link>` tag.

**Returns:** `Promise<ElementHandle>`

---

### childFrames

**Added before:** v1.9

```ts
frame.childFrames();
```

**Returns:** `Array<Frame>`

---

### content

**Added before:** v1.9

Gets the full HTML contents of the frame, including the doctype.

```ts
await frame.content();
```

**Returns:** `Promise<string>`

---

### dragAndDrop

**Added in:** v1.13

```ts
await frame.dragAndDrop(source, target);
await frame.dragAndDrop(source, target, options);
```

**Arguments:**

- `source` string — A selector to search for an element to drag.
- `target` string — A selector to search for an element to drop onto.
- `options` Object (optional)
  - `force` boolean (optional) — Whether to bypass the actionability checks. Defaults to `false`.
  - `noWaitAfter` boolean (optional) — _Deprecated._ This option has no effect.
  - `sourcePosition` Object (optional) _(Added in: v1.14)_ — `x` number, `y` number. Clicks on the source element at this point relative to the top-left corner of the element's padding box.
  - `steps` number (optional) _(Added in: v1.57)_ — Defaults to `1`. Sends n interpolated `mousemove` events.
  - `strict` boolean (optional) _(Added in: v1.14)_ — When true, requires selector to resolve to a single element.
  - `targetPosition` Object (optional) _(Added in: v1.14)_ — `x` number, `y` number. Drops on the target element at this point.
  - `timeout` number (optional) — Maximum time in milliseconds.
  - `trial` boolean (optional) — When set, only performs actionability checks and skips the action.

**Returns:** `Promise<void>`

---

### evaluate

**Added before:** v1.9

Returns the return value of `pageFunction`. If the function passed to `frame.evaluate()` returns a Promise, then `frame.evaluate()` would wait for the promise to resolve and return its value.

```ts
const result = await frame.evaluate(
  ([x, y]) => {
    return Promise.resolve(x * y);
  },
  [7, 8]
);
console.log(result); // prints "56"

// A string can also be passed in instead of a function.
console.log(await frame.evaluate('1 + 2')); // prints "3"

// ElementHandle instances can be passed as an argument.
const bodyHandle = await frame.evaluate('document.body');
const html = await frame.evaluate(([body, suffix]) => body.innerHTML + suffix, [bodyHandle, 'hello']);
await bodyHandle.dispose();
```

**Arguments:**

- `pageFunction` function | string — Function to be evaluated in the page context.
- `arg` EvaluationArgument (optional) — Optional argument to pass to `pageFunction`.

**Returns:** `Promise<Serializable>`

---

### evaluateHandle

**Added before:** v1.9

Returns the return value of `pageFunction` as a `JSHandle`. The only difference between `frame.evaluate()` and `frame.evaluateHandle()` is that `frame.evaluateHandle()` returns `JSHandle`.

```ts
// Handle for the window object
const aWindowHandle = await frame.evaluateHandle(() => Promise.resolve(window));

// A string can also be passed in instead of a function.
const aHandle = await frame.evaluateHandle('document');

// JSHandle instances can be passed as an argument.
const aHandle2 = await frame.evaluateHandle(() => document.body);
const resultHandle = await frame.evaluateHandle(([body, suffix]) => body.innerHTML + suffix, [aHandle2, 'hello']);
console.log(await resultHandle.jsonValue());
await resultHandle.dispose();
```

**Arguments:**

- `pageFunction` function | string — Function to be evaluated in the page context.
- `arg` EvaluationArgument (optional) — Optional argument to pass to `pageFunction`.

**Returns:** `Promise<JSHandle>`

---

### frameElement

**Added before:** v1.9

Returns the `frame` or `iframe` element handle which corresponds to this frame.

```ts
const frameElement = await frame.frameElement();
```

**Returns:** `Promise<ElementHandle>`

---

### frameLocator

**Added in:** v1.17

When working with iframes, you can create a frame locator that will enter the iframe and allow selecting elements in that iframe.

```ts
const locator = frame.frameLocator(':scope');
```

**Arguments:**

- `selector` string — A selector to use when resolving DOM element.

**Returns:** `FrameLocator`

---

### getByAltText

**Added in:** v1.27

Allows locating elements by their alt text.

```ts
await frame.getByAltText('Playwright logo').click();
```

**Arguments:**

- `text` string | RegExp — Text to locate the element for.
- `options` Object (optional) — `exact` boolean (optional).

**Returns:** `Locator`

---

### getByLabel

**Added in:** v1.27

Allows locating input elements by the text of the associated `<label>` or `aria-label` attribute.

```ts
await frame.getByLabel('Username').fill('john');
```

**Arguments:**

- `text` string | RegExp — Text to locate the element for.
- `options` Object (optional) — `exact` boolean (optional).

**Returns:** `Locator`

---

### getByPlaceholder

**Added in:** v1.27

Allows locating input elements by the placeholder text.

```ts
await frame.getByPlaceholder('name@example.com').fill('playwright@microsoft.com');
```

**Arguments:**

- `text` string | RegExp — Text to locate the element for.
- `options` Object (optional) — `exact` boolean (optional).

**Returns:** `Locator`

---

### getByRole

**Added in:** v1.27

Allows locating elements by their ARIA role, ARIA attributes and accessible name.

```ts
await frame.getByRole('button', { name: /submit/i }).click();
```

**Arguments:**

- `role` string — Required aria role.
- `options` Object (optional) — `checked`, `disabled`, `exact`, `expanded`, `includeHidden`, `level`, `name`, `pressed`, `selected`.

**Returns:** `Locator`

---

### getByTestId

**Added in:** v1.27

Locate element by the test id.

```ts
await frame.getByTestId('directions').click();
```

**Arguments:**

- `testId` string | RegExp — Id to locate the element by.

**Returns:** `Locator`

---

### getByText

**Added in:** v1.27

Allows locating elements that contain given text.

```ts
await frame.getByText('Welcome').click();
```

**Arguments:**

- `text` string | RegExp — Text to locate the element for.
- `options` Object (optional) — `exact` boolean (optional).

**Returns:** `Locator`

---

### getByTitle

**Added in:** v1.27

Allows locating elements by their title attribute.

```ts
await expect(frame.getByTitle('Issues count')).toHaveText('25 issues');
```

**Arguments:**

- `text` string | RegExp — Text to locate the element for.
- `options` Object (optional) — `exact` boolean (optional).

**Returns:** `Locator`

---

### goto

**Added before:** v1.9

Returns the main resource response. In case of multiple redirects, the navigation will resolve with the response of the last redirect.

```ts
await frame.goto(url);
await frame.goto(url, options);
```

**Arguments:**

- `url` string — URL to navigate frame to.
- `options` Object (optional)
  - `referer` string (optional) — Referer header value.
  - `timeout` number (optional) — Maximum operation time in milliseconds.
  - `waitUntil` `"load" | "domcontentloaded" | "networkidle" | "commit"` (optional) — When to consider navigation succeeded.

**Returns:** `Promise<null | Response>`

---

### isDetached

**Added before:** v1.9

Returns `true` if the frame has been detached, or `false` otherwise.

```ts
frame.isDetached();
```

**Returns:** `boolean`

---

### isEnabled

**Added in:** v1.9

> **Deprecated:** Use `locator.isEnabled()` instead.

Returns whether the element is enabled.

```ts
await frame.isEnabled(selector);
await frame.isEnabled(selector, options);
```

**Arguments:**

- `selector` string — A selector to search for an element.
- `options` Object (optional) — `strict` boolean (optional), `timeout` number (optional).

**Returns:** `Promise<boolean>`

---

### locator

**Added in:** v1.14

The method returns an element locator that can be used to perform actions on this page / frame. Locator is resolved to the element immediately before performing an action, so a series of actions on the same locator can in fact be performed on different DOM elements.

```ts
const locator = frame.locator('text=Submit');
await locator.click();
```

**Arguments:**

- `selector` string — A selector to use when resolving DOM element.
- `options` Object (optional) — `has`, `hasNot`, `hasNotText`, `hasText`.

**Returns:** `Locator`

---

### name

**Added before:** v1.9

Returns frame's name attribute as specified in the tag. If the name is empty, returns the `id` attribute instead. Returns an empty string if neither is set.

```ts
frame.name();
```

**Returns:** `string`

---

### page

**Added before:** v1.9

Returns the page containing this frame.

```ts
frame.page();
```

**Returns:** `Page`

---

### parentFrame

**Added before:** v1.9

Parent frame, if any. Detached frames and main frames return `null`.

```ts
frame.parentFrame();
```

**Returns:** `null | Frame`

---

### setContent

**Added before:** v1.9

This method internally calls `document.write()`, inheriting all its specific characteristics and behaviors.

```ts
await frame.setContent(html);
await frame.setContent(html, options);
```

**Arguments:**

- `html` string — HTML markup to assign to the page.
- `options` Object (optional)
  - `timeout` number (optional) — Maximum operation time in milliseconds.
  - `waitUntil` `"load" | "domcontentloaded" | "networkidle" | "commit"` (optional) — When to consider setting content succeeded.

**Returns:** `Promise<void>`

---

### title

**Added before:** v1.9

Returns the page title.

```ts
await frame.title();
```

**Returns:** `Promise<string>`

---

### url

**Added before:** v1.9

Returns frame's url.

```ts
frame.url();
```

**Returns:** `string`

---

### waitForFunction

**Added before:** v1.9

Returns when the `pageFunction` returns a truthy value. It resolves to a JSHandle of the truthy value.

```ts
const watchDog = frame.waitForFunction('window.innerWidth < 100');
await page.setViewportSize({ width: 50, height: 50 });
await watchDog;
```

**Arguments:**

- `pageFunction` function | string | RegExp — Function to be evaluated in the page context.
- `arg` EvaluationArgument (optional) — Optional argument to pass to `pageFunction`.
- `options` Object (optional) — `polling` number | "raf" (optional), `timeout` number (optional).

**Returns:** `Promise<JSHandle>`

---

### waitForLoadState

**Added in:** v1.1

Waits for the required load state to be reached. This returns when the frame reaches a required load state, `'load'` by default.

```ts
await frame.click('button'); // Click triggers navigation.
await frame.waitForLoadState(); // Ensure that 'load' event is fired.
```

**Arguments:**

- `state` `"load" | "domcontentloaded" | "networkidle"` (optional) — Optional load state to wait for. Defaults to `load`.
- `options` Object (optional) — `timeout` number (optional).

**Returns:** `Promise<void>`

---

### waitForURL

**Added in:** v1.11

Waits for the frame to navigate to the given URL.

```ts
await frame.click('a.delayed-navigation'); // Clicking the link will indirectly cause a navigation.
await frame.waitForURL('**/target.html');
```

**Arguments:**

- `url` string | RegExp | Function — A glob pattern, regex pattern or predicate receiving URL to match while waiting for the navigation.
- `options` Object (optional)
  - `timeout` number (optional) — Maximum operation time in milliseconds.
  - `waitUntil` `"load" | "domcontentloaded" | "networkidle" | "commit"` (optional) — When to consider navigation succeeded.

**Returns:** `Promise<void>`

---

## Deprecated

### $

**Added before:** v1.9

> **Deprecated:** Use `frame.locator()` instead.

```ts
await frame.$(selector);
```

**Returns:** `Promise<null | ElementHandle>`

---

### $$

**Added before:** v1.9

> **Deprecated:** Use `frame.locator()` instead.

```ts
await frame.$$(selector);
```

**Returns:** `Promise<Array<ElementHandle>>`

---

### $eval

**Added before:** v1.9

> **Deprecated:** Use `locator.evaluate()`, other Locator helper methods or web-first assertions instead.

```ts
await frame.$eval(selector, pageFunction);
await frame.$eval(selector, pageFunction, arg);
```

**Returns:** `Promise<Serializable>`

---

### $$eval

**Added before:** v1.9

> **Deprecated:** Use `locator.evaluateAll()`, other Locator helper methods or web-first assertions instead.

```ts
await frame.$$eval(selector, pageFunction);
await frame.$$eval(selector, pageFunction, arg);
```

**Returns:** `Promise<Serializable>`

---

### check

**Added before:** v1.9

> **Deprecated:** Use `locator.check()` instead.

```ts
await frame.check(selector);
```

**Returns:** `Promise<void>`

---

### click

**Added before:** v1.9

> **Deprecated:** Use `locator.click()` instead.

```ts
await frame.click(selector);
```

**Returns:** `Promise<void>`

---

### dblclick

**Added before:** v1.9

> **Deprecated:** Use `locator.dblclick()` instead.

```ts
await frame.dblclick(selector);
```

**Returns:** `Promise<void>`

---

### dispatchEvent

**Added before:** v1.9

> **Deprecated:** Use `locator.dispatchEvent()` instead.

```ts
await frame.dispatchEvent(selector, type);
```

**Returns:** `Promise<void>`

---

### fill

**Added before:** v1.9

> **Deprecated:** Use `locator.fill()` instead.

```ts
await frame.fill(selector, value);
```

**Returns:** `Promise<void>`

---

### focus

**Added before:** v1.9

> **Deprecated:** Use `locator.focus()` instead.

```ts
await frame.focus(selector);
```

**Returns:** `Promise<void>`

---

### getAttribute

**Added before:** v1.9

> **Deprecated:** Use `locator.getAttribute()` instead.

```ts
await frame.getAttribute(selector, name);
```

**Returns:** `Promise<null | string>`

---

### hover

**Added before:** v1.9

> **Deprecated:** Use `locator.hover()` instead.

```ts
await frame.hover(selector);
```

**Returns:** `Promise<void>`

---

### innerHTML

**Added before:** v1.9

> **Deprecated:** Use `locator.innerHTML()` instead.

```ts
await frame.innerHTML(selector);
```

**Returns:** `Promise<string>`

---

### innerText

**Added before:** v1.9

> **Deprecated:** Use `locator.innerText()` instead.

```ts
await frame.innerText(selector);
```

**Returns:** `Promise<string>`

---

### inputValue

**Added in:** v1.13

> **Deprecated:** Use `locator.inputValue()` instead.

```ts
await frame.inputValue(selector);
```

**Returns:** `Promise<string>`

---

### isChecked

**Added in:** v1.9

> **Deprecated:** Use `locator.isChecked()` instead.

```ts
await frame.isChecked(selector);
```

**Returns:** `Promise<boolean>`

---

### isDisabled

**Added in:** v1.9

> **Deprecated:** Use `locator.isDisabled()` instead.

```ts
await frame.isDisabled(selector);
```

**Returns:** `Promise<boolean>`

---

### isEditable

**Added in:** v1.9

> **Deprecated:** Use `locator.isEditable()` instead.

```ts
await frame.isEditable(selector);
```

**Returns:** `Promise<boolean>`

---

### isHidden

**Added in:** v1.9

> **Deprecated:** Use `locator.isHidden()` instead.

```ts
await frame.isHidden(selector);
```

**Returns:** `Promise<boolean>`

---

### isVisible

**Added in:** v1.9

> **Deprecated:** Use `locator.isVisible()` instead.

```ts
await frame.isVisible(selector);
```

**Returns:** `Promise<boolean>`

---

### press

**Added before:** v1.9

> **Deprecated:** Use `locator.press()` instead.

```ts
await frame.press(selector, key);
```

**Returns:** `Promise<void>`

---

### selectOption

**Added before:** v1.9

> **Deprecated:** Use `locator.selectOption()` instead.

```ts
await frame.selectOption(selector, values);
```

**Returns:** `Promise<Array<string>>`

---

### setChecked

**Added in:** v1.15

> **Deprecated:** Use `locator.setChecked()` instead.

```ts
await frame.setChecked(selector, checked);
```

**Returns:** `Promise<void>`

---

### setInputFiles

**Added before:** v1.9

> **Deprecated:** Use `locator.setInputFiles()` instead.

```ts
await frame.setInputFiles(selector, files);
```

**Returns:** `Promise<void>`

---

### tap

**Added before:** v1.9

> **Deprecated:** Use `locator.tap()` instead.

```ts
await frame.tap(selector);
```

**Returns:** `Promise<void>`

---

### textContent

**Added before:** v1.9

> **Deprecated:** Use `locator.textContent()` instead.

```ts
await frame.textContent(selector);
```

**Returns:** `Promise<null | string>`

---

### type

**Added before:** v1.9

> **Deprecated:** Use `locator.pressSequentially()` instead.

```ts
await frame.type(selector, text);
```

**Returns:** `Promise<void>`

---

### uncheck

**Added before:** v1.9

> **Deprecated:** Use `locator.uncheck()` instead.

```ts
await frame.uncheck(selector);
```

**Returns:** `Promise<void>`

---

### waitForNavigation

**Added before:** v1.9

> **Deprecated:** Use `frame.waitForURL()` instead.

```ts
await frame.waitForNavigation();
await frame.waitForNavigation(options);
```

**Returns:** `Promise<null | Response>`

---

### waitForSelector

**Added before:** v1.9

> **Deprecated:** Use `locator.waitFor()` instead.

```ts
await frame.waitForSelector(selector);
await frame.waitForSelector(selector, options);
```

**Returns:** `Promise<null | ElementHandle>`

---

### waitForTimeout

**Added before:** v1.9

> **Deprecated:** Never wait for timeout in production. Use this only for debugging.

```ts
await frame.waitForTimeout(timeout);
```

**Returns:** `Promise<void>`
