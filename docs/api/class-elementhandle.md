# 📦 Playwright — ElementHandle

> **Source:** [playwright.dev/docs/api/class-elementhandle](https://playwright.dev/docs/api/class-elementhandle)

---

**ElementHandle** extends: `JSHandle`

**ElementHandle** represents an in-page DOM element. ElementHandles can be created with the `page.$()` method.

> **Discouraged:** The use of ElementHandle is discouraged, use `Locator` objects and web-first assertions instead.

```ts
const hrefElement = await page.$('a');
await hrefElement.click();
```

ElementHandle prevents DOM element from garbage collection unless the handle is disposed with `jsHandle.dispose()`. ElementHandles are auto-disposed when their origin frame gets navigated. ElementHandle instances can be used as an argument in `page.$eval()` and `page.evaluate()` methods.

The difference between the Locator and ElementHandle is that the ElementHandle points to a particular element, while Locator captures the logic of how to retrieve an element. With the locator, every time the element is used, up-to-date DOM element is located in the page using the selector.

## Methods

### boundingBox

**Added before:** v1.9

This method returns the bounding box of the element, or `null` if the element is not visible. The bounding box is calculated relative to the main frame viewport. Scrolling affects the returned bounding box.

```ts
const box = await elementHandle.boundingBox();
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
```

**Returns:** `Promise<null | Object>`

- `x` number — the x coordinate of the element in pixels.
- `y` number — the y coordinate of the element in pixels.
- `width` number — the width of the element in pixels.
- `height` number — the height of the element in pixels.

### contentFrame

**Added before:** v1.9

Returns the content frame for element handles referencing iframe nodes, or `null` otherwise.

```ts
await elementHandle.contentFrame();
```

**Returns:** `Promise<null | Frame>`

### ownerFrame

**Added before:** v1.9

Returns the frame containing the given element.

```ts
await elementHandle.ownerFrame();
```

**Returns:** `Promise<null | Frame>`

### waitForElementState

**Added before:** v1.9

Returns when the element satisfies the state. Depending on the `state` parameter, this method waits for one of the actionability checks to pass.

- `"visible"` — Wait until the element is visible.
- `"hidden"` — Wait until the element is not visible or not attached.
- `"stable"` — Wait until the element is both visible and stable.
- `"enabled"` — Wait until the element is enabled.
- `"disabled"` — Wait until the element is not enabled.
- `"editable"` — Wait until the element is editable.

```ts
await elementHandle.waitForElementState(state);
await elementHandle.waitForElementState(state, options);
```

**Arguments:**

- `state` `"visible" | "hidden" | "stable" | "enabled" | "disabled" | "editable"` — A state to wait for.
- `options` Object (optional)
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.

**Returns:** `Promise<void>`

## Deprecated

### $

**Added in:** v1.9

> **Discouraged:** Use locator-based `page.locator()` instead.

The method finds an element matching the specified selector in the ElementHandle's subtree. If no elements match the selector, returns `null`.

```ts
await elementHandle.$(selector);
```

**Arguments:**

- `selector` string — A selector to query for.

**Returns:** `Promise<null | ElementHandle>`

### $$

**Added in:** v1.9

> **Discouraged:** Use locator-based `page.locator()` instead.

The method finds all elements matching the specified selector in the ElementHandle's subtree. If no elements match the selector, returns empty array.

```ts
await elementHandle.$$(selector);
```

**Arguments:**

- `selector` string — A selector to query for.

**Returns:** `Promise<Array<ElementHandle>>`

### $eval

**Added in:** v1.9

> **Discouraged:** This method does not wait for the element to pass actionability checks. Use `locator.evaluate()`, other Locator helper methods or web-first assertions instead.

Returns the return value of `pageFunction`. The method finds an element matching the specified selector in the ElementHandle's subtree and passes it as a first argument to `pageFunction`.

```ts
const tweetHandle = await page.$('.tweet');
expect(await tweetHandle.$eval('.like', (node) => node.innerText)).toBe('100');
expect(await tweetHandle.$eval('.retweets', (node) => node.innerText)).toBe('10');
```

**Arguments:**

- `selector` string — A selector to query for.
- `pageFunction` function(Element) | string — Function to be evaluated in the page context.
- `arg` EvaluationArgument (optional) — Optional argument to pass to `pageFunction`.

**Returns:** `Promise<Serializable>`

### $$eval

**Added in:** v1.9

> **Discouraged:** In most cases, `locator.evaluateAll()`, other Locator helper methods and web-first assertions do a better job.

Returns the return value of `pageFunction`. The method finds all elements matching the specified selector in the ElementHandle's subtree and passes an array of matched elements as a first argument to `pageFunction`.

```ts
const feedHandle = await page.$('.feed');
expect(await feedHandle.$$eval('.tweet', (nodes) => nodes.map((n) => n.innerText))).toEqual(['Hello!', 'Hi!']);
```

**Arguments:**

- `selector` string — A selector to query for.
- `pageFunction` function(Array\<Element\>) | string — Function to be evaluated in the page context.
- `arg` EvaluationArgument (optional) — Optional argument to pass to `pageFunction`.

**Returns:** `Promise<Serializable>`

### check

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.check()` instead.

This method checks the element by performing the following steps: ensures it is a checkbox or radio input, scrolls into view, clicks in the center, and verifies it is now checked.

```ts
await elementHandle.check();
await elementHandle.check(options);
```

**Arguments:**

- `options` Object (optional)
  - `force` boolean (optional) — Whether to bypass the actionability checks. Defaults to `false`.
  - `noWaitAfter` boolean (optional) — _Deprecated._ This option has no effect.
  - `position` Object (optional) _(Added in: v1.11)_ — `x` number, `y` number.
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.
  - `trial` boolean (optional) _(Added in: v1.11)_ — When set, only performs the actionability checks and skips the action.

**Returns:** `Promise<void>`

### click

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.click()` instead.

This method clicks the element by performing the following steps: waits for actionability checks, scrolls into view, and clicks in the center or specified position.

```ts
await elementHandle.click();
await elementHandle.click(options);
```

**Arguments:**

- `options` Object (optional)
  - `button` `"left" | "right" | "middle"` (optional) — Defaults to `left`.
  - `clickCount` number (optional) — Defaults to 1.
  - `delay` number (optional) — Time to wait between `mousedown` and `mouseup` in milliseconds. Defaults to 0.
  - `force` boolean (optional) — Whether to bypass the actionability checks. Defaults to `false`.
  - `modifiers` Array\<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"\> (optional) — Modifier keys to press.
  - `noWaitAfter` boolean (optional) — _Deprecated._
  - `position` Object (optional) — `x` number, `y` number.
  - `steps` number (optional) _(Added in: v1.57)_ — Defaults to 1.
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.
  - `trial` boolean (optional) _(Added in: v1.11)_ — When set, only performs the actionability checks and skips the action.

**Returns:** `Promise<void>`

### dblclick

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.dblclick()` instead.

This method double clicks the element.

> **Note:** `elementHandle.dblclick()` dispatches two click events and a single dblclick event.

```ts
await elementHandle.dblclick();
await elementHandle.dblclick(options);
```

**Arguments:**

- `options` Object (optional) — Same options as `click` except no `clickCount`.

**Returns:** `Promise<void>`

### dispatchEvent

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.dispatchEvent()` instead.

The snippet below dispatches the `click` event on the element. Regardless of the visibility state of the element, `click` is dispatched.

```ts
await elementHandle.dispatchEvent('click');
```

```ts
// Note you can only create DataTransfer in Chromium and Firefox
const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
await elementHandle.dispatchEvent('dragstart', { dataTransfer });
```

**Arguments:**

- `type` string — DOM event type: `"click"`, `"dragstart"`, etc.
- `eventInit` EvaluationArgument (optional) — Optional event-specific initialization properties.

**Returns:** `Promise<void>`

### fill

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.fill()` instead.

This method waits for actionability checks, focuses the element, fills it and triggers an `input` event after filling.

```ts
await elementHandle.fill(value);
await elementHandle.fill(value, options);
```

**Arguments:**

- `value` string — Value to set for the `<input>`, `<textarea>` or `[contenteditable]` element.
- `options` Object (optional)
  - `force` boolean (optional) _(Added in: v1.13)_ — Whether to bypass the actionability checks. Defaults to `false`.
  - `noWaitAfter` boolean (optional) — _Deprecated._ This option has no effect.
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.

**Returns:** `Promise<void>`

### focus

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.focus()` instead.

Calls focus on the element.

```ts
await elementHandle.focus();
```

**Returns:** `Promise<void>`

### getAttribute

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.getAttribute()` instead.

Returns element attribute value.

```ts
await elementHandle.getAttribute(name);
```

**Arguments:**

- `name` string — Attribute name to get the value for.

**Returns:** `Promise<null | string>`

### hover

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.hover()` instead.

This method hovers over the element by performing actionability checks, scrolling into view, and hovering over the center.

```ts
await elementHandle.hover();
await elementHandle.hover(options);
```

**Arguments:**

- `options` Object (optional)
  - `force` boolean (optional) — Whether to bypass the actionability checks. Defaults to `false`.
  - `modifiers` Array\<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"\> (optional)
  - `noWaitAfter` boolean (optional) _(Added in: v1.28)_ — _Deprecated._ This option has no effect.
  - `position` Object (optional) — `x` number, `y` number.
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.
  - `trial` boolean (optional) _(Added in: v1.11)_ — When set, only performs the actionability checks and skips the action.

**Returns:** `Promise<void>`

### innerHTML

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.innerHTML()` instead.

Returns the `element.innerHTML`.

```ts
await elementHandle.innerHTML();
```

**Returns:** `Promise<string>`

### innerText

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.innerText()` instead.

Returns the `element.innerText`.

```ts
await elementHandle.innerText();
```

**Returns:** `Promise<string>`

### inputValue

**Added in:** v1.13

> **Discouraged:** Use locator-based `locator.inputValue()` instead.

Returns `input.value` for the selected `<input>` or `<textarea>` or `<select>` element.

```ts
await elementHandle.inputValue();
await elementHandle.inputValue(options);
```

**Arguments:**

- `options` Object (optional)
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.

**Returns:** `Promise<string>`

### isChecked

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.isChecked()` instead.

Returns whether the element is checked. Throws if the element is not a checkbox or radio input.

```ts
await elementHandle.isChecked();
```

**Returns:** `Promise<boolean>`

### isDisabled

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.isDisabled()` instead.

Returns whether the element is disabled, the opposite of enabled.

```ts
await elementHandle.isDisabled();
```

**Returns:** `Promise<boolean>`

### isEditable

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.isEditable()` instead.

Returns whether the element is editable.

```ts
await elementHandle.isEditable();
```

**Returns:** `Promise<boolean>`

### isEnabled

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.isEnabled()` instead.

Returns whether the element is enabled.

```ts
await elementHandle.isEnabled();
```

**Returns:** `Promise<boolean>`

### isHidden

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.isHidden()` instead.

Returns whether the element is hidden, the opposite of visible.

```ts
await elementHandle.isHidden();
```

**Returns:** `Promise<boolean>`

### isVisible

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.isVisible()` instead.

Returns whether the element is visible.

```ts
await elementHandle.isVisible();
```

**Returns:** `Promise<boolean>`

### press

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.press()` instead.

Focuses the element, and then uses `keyboard.down()` and `keyboard.up()`.

```ts
await elementHandle.press(key);
await elementHandle.press(key, options);
```

**Arguments:**

- `key` string — Name of the key to press or a character to generate, such as `ArrowLeft` or `a`.
- `options` Object (optional)
  - `delay` number (optional) — Time to wait between keydown and keyup in milliseconds. Defaults to 0.
  - `noWaitAfter` boolean (optional) — _Deprecated._
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.

**Returns:** `Promise<void>`

### screenshot

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.screenshot()` instead.

This method captures a screenshot of the page, clipped to the size and position of this particular element.

```ts
await elementHandle.screenshot();
await elementHandle.screenshot(options);
```

**Arguments:**

- `options` Object (optional)
  - `animations` `"disabled" | "allow"` (optional) — Defaults to `"allow"`.
  - `caret` `"hide" | "initial"` (optional) — Defaults to `"hide"`.
  - `mask` Array\<Locator\> (optional) — Locators to mask in the screenshot.
  - `maskColor` string (optional) _(Added in: v1.35)_ — Color of the overlay box for masked elements. Default is pink `#FF00FF`.
  - `omitBackground` boolean (optional) — Hides default white background. Defaults to `false`.
  - `path` string (optional) — The file path to save the image to.
  - `quality` number (optional) — The quality of the image, between 0-100. Not applicable to png images.
  - `scale` `"css" | "device"` (optional) — Defaults to `"device"`.
  - `style` string (optional) _(Added in: v1.41)_ — Text of the stylesheet to apply while making the screenshot.
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.
  - `type` `"png" | "jpeg"` (optional) — Specify screenshot type, defaults to `png`.

**Returns:** `Promise<Buffer>`

### scrollIntoViewIfNeeded

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.scrollIntoViewIfNeeded()` instead.

This method waits for actionability checks, then tries to scroll element into view, unless it is completely visible.

```ts
await elementHandle.scrollIntoViewIfNeeded();
await elementHandle.scrollIntoViewIfNeeded(options);
```

**Arguments:**

- `options` Object (optional)
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.

**Returns:** `Promise<void>`

### selectOption

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.selectOption()` instead.

This method waits for actionability checks, waits until all specified options are present in the `<select>` element and selects these options.

```ts
// Single selection matching the value or label
handle.selectOption('blue');
// single selection matching the label
handle.selectOption({ label: 'Blue' });
// multiple selection
handle.selectOption(['red', 'green', 'blue']);
```

**Arguments:**

- `values` null | string | ElementHandle | Array\<string\> | Object | Array\<ElementHandle\> | Array\<Object\> — Options to select.
- `options` Object (optional)
  - `force` boolean (optional) _(Added in: v1.13)_ — Whether to bypass the actionability checks. Defaults to `false`.
  - `noWaitAfter` boolean (optional) — _Deprecated._ This option has no effect.
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.

**Returns:** `Promise<Array<string>>`

### selectText

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.selectText()` instead.

This method waits for actionability checks, then focuses the element and selects all its text content.

```ts
await elementHandle.selectText();
await elementHandle.selectText(options);
```

**Arguments:**

- `options` Object (optional)
  - `force` boolean (optional) _(Added in: v1.13)_ — Whether to bypass the actionability checks. Defaults to `false`.
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.

**Returns:** `Promise<void>`

### setChecked

**Added in:** v1.15

> **Discouraged:** Use locator-based `locator.setChecked()` instead.

This method checks or unchecks an element by performing actionability checks, scrolling into view, and clicking in the center.

```ts
await elementHandle.setChecked(checked);
await elementHandle.setChecked(checked, options);
```

**Arguments:**

- `checked` boolean — Whether to check or uncheck the checkbox.
- `options` Object (optional)
  - `force` boolean (optional) — Whether to bypass the actionability checks. Defaults to `false`.
  - `noWaitAfter` boolean (optional) — _Deprecated._ This option has no effect.
  - `position` Object (optional) — `x` number, `y` number.
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.
  - `trial` boolean (optional) — When set, only performs the actionability checks and skips the action.

**Returns:** `Promise<void>`

### setInputFiles

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.setInputFiles()` instead.

Sets the value of the file input to these file paths or files. If some of the `filePaths` are relative paths, they are resolved relative to the current working directory.

```ts
await elementHandle.setInputFiles(files);
await elementHandle.setInputFiles(files, options);
```

**Arguments:**

- `files` string | Array\<string\> | Object | Array\<Object\> — File paths or file objects with `name`, `mimeType`, `buffer`.
- `options` Object (optional)
  - `noWaitAfter` boolean (optional) — _Deprecated._ This option has no effect.
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.

**Returns:** `Promise<void>`

### tap

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.tap()` instead.

This method taps the element by performing actionability checks, scrolling into view, and tapping the center.

> **Note:** `elementHandle.tap()` requires that the `hasTouch` option of the browser context be set to `true`.

```ts
await elementHandle.tap();
await elementHandle.tap(options);
```

**Arguments:**

- `options` Object (optional)
  - `force` boolean (optional) — Whether to bypass the actionability checks. Defaults to `false`.
  - `modifiers` Array\<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"\> (optional)
  - `noWaitAfter` boolean (optional) — _Deprecated._ This option has no effect.
  - `position` Object (optional) — `x` number, `y` number.
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.
  - `trial` boolean (optional) _(Added in: v1.11)_ — When set, only performs the actionability checks and skips the action.

**Returns:** `Promise<void>`

### textContent

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.textContent()` instead.

Returns the `node.textContent`.

```ts
await elementHandle.textContent();
```

**Returns:** `Promise<null | string>`

### type

**Added before:** v1.9

> **Deprecated:** In most cases, you should use `locator.fill()` instead. You only need to press keys one by one if there is special keyboard handling on the page — in this case use `locator.pressSequentially()`.

Focuses the element, and then sends a `keydown`, `keypress`/`input`, and `keyup` event for each character in the text.

```ts
await elementHandle.type(text);
await elementHandle.type(text, options);
```

**Arguments:**

- `text` string — A text to type into a focused element.
- `options` Object (optional)
  - `delay` number (optional) — Time to wait between key presses in milliseconds. Defaults to 0.
  - `noWaitAfter` boolean (optional) — _Deprecated._ This option has no effect.
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.

**Returns:** `Promise<void>`

### uncheck

**Added before:** v1.9

> **Discouraged:** Use locator-based `locator.uncheck()` instead.

This method unchecks the element by performing actionability checks, scrolling into view, and clicking in the center.

```ts
await elementHandle.uncheck();
await elementHandle.uncheck(options);
```

**Arguments:**

- `options` Object (optional)
  - `force` boolean (optional) — Whether to bypass the actionability checks. Defaults to `false`.
  - `noWaitAfter` boolean (optional) — _Deprecated._ This option has no effect.
  - `position` Object (optional) _(Added in: v1.11)_ — `x` number, `y` number.
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.
  - `trial` boolean (optional) _(Added in: v1.11)_ — When set, only performs the actionability checks and skips the action.

**Returns:** `Promise<void>`

### waitForSelector

**Added before:** v1.9

> **Discouraged:** Use web assertions that assert visibility or a locator-based `locator.waitFor()` instead.

Returns element specified by selector when it satisfies `state` option. Returns `null` if waiting for `hidden` or `detached`.

```ts
await page.setContent(`<div><span></span></div>`);
const div = await page.$('div');
// Waiting for the 'span' selector relative to the div.
const span = await div.waitForSelector('span', { state: 'attached' });
```

> **Note:** This method does not work across navigations, use `page.waitForSelector()` instead.

**Arguments:**

- `selector` string — A selector to query for.
- `options` Object (optional)
  - `state` `"attached" | "detached" | "visible" | "hidden"` (optional) — Defaults to `'visible'`.
  - `strict` boolean (optional) _(Added in: v1.15)_ — When true, requires selector to resolve to a single element.
  - `timeout` number (optional) — Maximum time in milliseconds. Defaults to 0 - no timeout.

**Returns:** `Promise<null | ElementHandle>`
