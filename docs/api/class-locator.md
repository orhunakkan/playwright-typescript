# 📦 Playwright — Locator

> **Source:** [playwright.dev/docs/api/class-locator](https://playwright.dev/docs/api/class-locator)

---

Locators are the central piece of Playwright's auto-waiting and retry-ability. They represent a way to find element(s) on the page at any moment. A locator can be created with the `page.locator()` method.

## Methods

### `locator.all()` — Added in: v1.29

When the locator points to a list of elements, returns an array of locators pointing to their respective elements. Does not wait for elements — returns whatever is present immediately.

```ts
for (const li of await page.getByRole('listitem').all()) await li.click();
```

**Returns:** `Promise<Array<Locator>>`

### `locator.allInnerTexts()` — Added in: v1.14

Returns an array of `node.innerText` values for all matching nodes.

```ts
const texts = await page.getByRole('link').allInnerTexts();
```

**Returns:** `Promise<Array<string>>`

### `locator.allTextContents()` — Added in: v1.14

Returns an array of `node.textContent` values for all matching nodes.

```ts
const texts = await page.getByRole('link').allTextContents();
```

**Returns:** `Promise<Array<string>>`

### `locator.and(locator)` — Added in: v1.34

Creates a locator that matches both this locator and the argument locator.

```ts
const button = page.getByRole('button').and(page.getByTitle('Subscribe'));
```

**Arguments:**

| Parameter | Type      | Description                 |
| --------- | --------- | --------------------------- |
| `locator` | `Locator` | Additional locator to match |

**Returns:** `Locator`

### `locator.ariaSnapshot(options?)` — Added in: v1.49

Captures the aria snapshot of the given element as a YAML string representing roles and accessible names.

```ts
await page.getByRole('link').ariaSnapshot();
```

**Arguments:**

| Parameter         | Type                           | Description                                            |
| ----------------- | ------------------------------ | ------------------------------------------------------ |
| `options.depth`   | `number` (optional)            | Limit depth of snapshot. Added in: v1.59               |
| `options.mode`    | `"ai" \| "default"` (optional) | Snapshot format. Default: `"default"`. Added in: v1.59 |
| `options.timeout` | `number` (optional)            | Max time in ms. Default: no timeout                    |

**Returns:** `Promise<string>`

### `locator.blur(options?)` — Added in: v1.28

Calls blur on the element.

```ts
await locator.blur();
```

**Arguments:**

| Parameter         | Type                | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout |

**Returns:** `Promise<void>`

### `locator.boundingBox(options?)` — Added in: v1.14

Returns the bounding box of the element matching the locator, or `null` if not visible. Bounding box is relative to the main frame viewport.

```ts
const box = await page.getByRole('button').boundingBox();
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
```

**Arguments:**

| Parameter         | Type                | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout |

**Returns:** `Promise<null | { x: number, y: number, width: number, height: number }>`

### `locator.check(options?)` — Added in: v1.14

Ensure that checkbox or radio element is checked.

```ts
await page.getByRole('checkbox').check();
```

**Arguments:**

| Parameter          | Type                                  | Description                                                      |
| ------------------ | ------------------------------------- | ---------------------------------------------------------------- |
| `options.force`    | `boolean` (optional)                  | Bypass actionability checks. Default: `false`                    |
| `options.position` | `{ x: number, y: number }` (optional) | Point relative to top-left of element padding box                |
| `options.timeout`  | `number` (optional)                   | Max time in ms. Default: no timeout                              |
| `options.trial`    | `boolean` (optional)                  | Only perform actionability checks, skip action. Default: `false` |

**Returns:** `Promise<void>`

### `locator.clear(options?)` — Added in: v1.28

Clear the input field. Waits for actionability checks, focuses, clears, and triggers an input event.

```ts
await page.getByRole('textbox').clear();
```

**Arguments:**

| Parameter         | Type                 | Description                                   |
| ----------------- | -------------------- | --------------------------------------------- |
| `options.force`   | `boolean` (optional) | Bypass actionability checks. Default: `false` |
| `options.timeout` | `number` (optional)  | Max time in ms. Default: no timeout           |

**Returns:** `Promise<void>`

### `locator.click(options?)` — Added in: v1.14

Click an element.

```ts
await page.getByRole('button').click();
// Shift-right-click at specific position:
await page.locator('canvas').click({ button: 'right', modifiers: ['Shift'], position: { x: 23, y: 32 } });
```

**Arguments:**

| Parameter            | Type                                                                           | Description                                                  |
| -------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `options.button`     | `"left" \| "right" \| "middle"` (optional)                                     | Default: `"left"`                                            |
| `options.clickCount` | `number` (optional)                                                            | Default: `1`                                                 |
| `options.delay`      | `number` (optional)                                                            | Time between mousedown and mouseup in ms. Default: `0`       |
| `options.force`      | `boolean` (optional)                                                           | Bypass actionability checks. Default: `false`                |
| `options.modifiers`  | `Array<"Alt" \| "Control" \| "ControlOrMeta" \| "Meta" \| "Shift">` (optional) | Modifier keys to press                                       |
| `options.position`   | `{ x: number, y: number }` (optional)                                          | Click position relative to element top-left                  |
| `options.steps`      | `number` (optional)                                                            | Interpolated mousemove events. Default: `1`. Added in: v1.57 |
| `options.timeout`    | `number` (optional)                                                            | Max time in ms. Default: no timeout                          |
| `options.trial`      | `boolean` (optional)                                                           | Only perform actionability checks. Default: `false`          |

**Returns:** `Promise<void>`

### `locator.contentFrame()` — Added in: v1.43

Returns a `FrameLocator` pointing to the same iframe as this locator. Useful for interacting with iframe contents.

```ts
const locator = page.locator('iframe[name="embedded"]');
const frameLocator = locator.contentFrame();
await frameLocator.getByRole('button').click();
```

**Returns:** `FrameLocator`

### `locator.count()` — Added in: v1.14

Returns the number of elements matching the locator.

```ts
const count = await page.getByRole('listitem').count();
```

**Returns:** `Promise<number>`

### `locator.dblclick(options?)` — Added in: v1.14

Double-click an element.

```ts
await locator.dblclick();
```

**Arguments:**

| Parameter           | Type                                                                           | Description                                                  |
| ------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| `options.button`    | `"left" \| "right" \| "middle"` (optional)                                     | Default: `"left"`                                            |
| `options.delay`     | `number` (optional)                                                            | Time between mousedown and mouseup in ms. Default: `0`       |
| `options.force`     | `boolean` (optional)                                                           | Bypass actionability checks. Default: `false`                |
| `options.modifiers` | `Array<"Alt" \| "Control" \| "ControlOrMeta" \| "Meta" \| "Shift">` (optional) | Modifier keys to press                                       |
| `options.position`  | `{ x: number, y: number }` (optional)                                          | Click position relative to element top-left                  |
| `options.steps`     | `number` (optional)                                                            | Interpolated mousemove events. Default: `1`. Added in: v1.57 |
| `options.timeout`   | `number` (optional)                                                            | Max time in ms. Default: no timeout                          |
| `options.trial`     | `boolean` (optional)                                                           | Only perform actionability checks. Default: `false`          |

**Returns:** `Promise<void>`

### `locator.describe(description)` — Added in: v1.53

Describes the locator; description is used in the trace viewer and reports.

```ts
const button = page.getByTestId('btn-sub').describe('Subscribe button');
await button.click();
```

**Arguments:**

| Parameter     | Type     | Description         |
| ------------- | -------- | ------------------- |
| `description` | `string` | Locator description |

**Returns:** `Locator`

### `locator.description()` — Added in: v1.57

Returns locator description previously set with `locator.describe()`, or `null` if none set.

```ts
const button = page.getByRole('button').describe('Subscribe button');
console.log(button.description()); // "Subscribe button"
const input = page.getByRole('textbox');
console.log(input.description()); // null
```

**Returns:** `null | string`

### `locator.dispatchEvent(type, eventInit?, options?)` — Added in: v1.14

Programmatically dispatch an event on the matching element.

```ts
await locator.dispatchEvent('click');
// With event data:
const dataTransfer = await page.evaluateHandle(() => new DataTransfer());
await locator.dispatchEvent('dragstart', { dataTransfer });
```

**Arguments:**

| Parameter         | Type                            | Description                                       |
| ----------------- | ------------------------------- | ------------------------------------------------- |
| `type`            | `string`                        | DOM event type: `"click"`, `"dragstart"`, etc.    |
| `eventInit`       | `EvaluationArgument` (optional) | Optional event-specific initialization properties |
| `options.timeout` | `number` (optional)             | Max time in ms. Default: no timeout               |

**Returns:** `Promise<void>`

### `locator.dragTo(target, options?)` — Added in: v1.18

Drag the source element towards the target element and drop it.

```ts
const source = page.locator('#source');
const target = page.locator('#target');
await source.dragTo(target);
// With explicit positions:
await source.dragTo(target, { sourcePosition: { x: 34, y: 7 }, targetPosition: { x: 10, y: 20 } });
```

**Arguments:**

| Parameter                | Type                                  | Description                                                  |
| ------------------------ | ------------------------------------- | ------------------------------------------------------------ |
| `target`                 | `Locator`                             | Locator of the element to drag to                            |
| `options.force`          | `boolean` (optional)                  | Bypass actionability checks. Default: `false`                |
| `options.sourcePosition` | `{ x: number, y: number }` (optional) | Click position on source element                             |
| `options.steps`          | `number` (optional)                   | Interpolated mousemove events. Default: `1`. Added in: v1.57 |
| `options.targetPosition` | `{ x: number, y: number }` (optional) | Drop position on target element                              |
| `options.timeout`        | `number` (optional)                   | Max time in ms. Default: no timeout                          |
| `options.trial`          | `boolean` (optional)                  | Only perform actionability checks. Default: `false`          |

**Returns:** `Promise<void>`

### `locator.evaluate(pageFunction, arg?, options?)` — Added in: v1.14

Execute JavaScript code in the page, taking the matching element as an argument.

```ts
const result = await page.getByTestId('myId').evaluate(
  (element, [x, y]) => {
    return element.textContent + ' ' + x * y;
  },
  [7, 8]
);
```

**Arguments:**

| Parameter         | Type                            | Description                                                 |
| ----------------- | ------------------------------- | ----------------------------------------------------------- |
| `pageFunction`    | `function \| string`            | Function to evaluate in the page context                    |
| `arg`             | `EvaluationArgument` (optional) | Argument to pass to `pageFunction`                          |
| `options.timeout` | `number` (optional)             | Max time in ms to wait for the locator. Default: no timeout |

**Returns:** `Promise<Serializable>`

### `locator.evaluateAll(pageFunction, arg?)` — Added in: v1.14

Execute JavaScript code in the page, taking all matching elements as an argument.

```ts
const locator = page.locator('div');
const moreThanTen = await locator.evaluateAll((divs, min) => divs.length > min, 10);
```

**Arguments:**

| Parameter      | Type                            | Description                              |
| -------------- | ------------------------------- | ---------------------------------------- |
| `pageFunction` | `function \| string`            | Function to evaluate in the page context |
| `arg`          | `EvaluationArgument` (optional) | Argument to pass to `pageFunction`       |

**Returns:** `Promise<Serializable>`

### `locator.evaluateHandle(pageFunction, arg?, options?)` — Added in: v1.14

Execute JavaScript code in the page and return a `JSHandle` with the result.

```ts
await locator.evaluateHandle(pageFunction);
await locator.evaluateHandle(pageFunction, arg, options);
```

**Arguments:**

| Parameter         | Type                            | Description                                                 |
| ----------------- | ------------------------------- | ----------------------------------------------------------- |
| `pageFunction`    | `function \| string`            | Function to evaluate in the page context                    |
| `arg`             | `EvaluationArgument` (optional) | Argument to pass to `pageFunction`                          |
| `options.timeout` | `number` (optional)             | Max time in ms to wait for the locator. Default: no timeout |

**Returns:** `Promise<JSHandle>`

### `locator.fill(value, options?)` — Added in: v1.14

Set a value to the input field. Waits for actionability checks, focuses, fills, and triggers an input event.

```ts
await page.getByRole('textbox').fill('example value');
```

**Arguments:**

| Parameter         | Type                 | Description                                                      |
| ----------------- | -------------------- | ---------------------------------------------------------------- |
| `value`           | `string`             | Value to set for the input, textarea, or contenteditable element |
| `options.force`   | `boolean` (optional) | Bypass actionability checks. Default: `false`                    |
| `options.timeout` | `number` (optional)  | Max time in ms. Default: no timeout                              |

**Returns:** `Promise<void>`

### `locator.filter(options?)` — Added in: v1.22

Narrows existing locator according to the options, e.g. filters by text or contained element. Can be chained.

```ts
const rowLocator = page.locator('tr');
await rowLocator
  .filter({ hasText: 'text in column 1' })
  .filter({ has: page.getByRole('button', { name: 'column 2 button' }) })
  .screenshot();
```

**Arguments:**

| Parameter            | Type                          | Description                                                 |
| -------------------- | ----------------------------- | ----------------------------------------------------------- |
| `options.has`        | `Locator` (optional)          | Match elements containing this relative locator             |
| `options.hasNot`     | `Locator` (optional)          | Match elements NOT containing this locator. Added in: v1.33 |
| `options.hasNotText` | `string \| RegExp` (optional) | Match elements not containing this text. Added in: v1.33    |
| `options.hasText`    | `string \| RegExp` (optional) | Match elements containing this text                         |
| `options.visible`    | `boolean` (optional)          | Only match visible/invisible elements. Added in: v1.51      |

**Returns:** `Locator`

### `locator.first()` — Added in: v1.14

Returns locator to the first matching element.

```ts
locator.first();
```

**Returns:** `Locator`

### `locator.focus(options?)` — Added in: v1.14

Calls focus on the matching element.

```ts
await locator.focus();
```

**Arguments:**

| Parameter         | Type                | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout |

**Returns:** `Promise<void>`

### `locator.frameLocator(selector)` — Added in: v1.17

Creates a frame locator that enters the iframe and allows locating elements inside it.

```ts
const locator = page.frameLocator('iframe').getByText('Submit');
await locator.click();
```

**Arguments:**

| Parameter  | Type     | Description                                    |
| ---------- | -------- | ---------------------------------------------- |
| `selector` | `string` | Selector to use when resolving the DOM element |

**Returns:** `FrameLocator`

### `locator.getAttribute(name, options?)` — Added in: v1.14

Returns the matching element's attribute value.

```ts
await locator.getAttribute(name);
await locator.getAttribute(name, options);
```

**Arguments:**

| Parameter         | Type                | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| `name`            | `string`            | Attribute name to get the value for |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout |

**Returns:** `Promise<null | string>`

### `locator.getByAltText(text, options?)` — Added in: v1.27

Allows locating elements by their alt text.

```ts
await page.getByAltText('Playwright logo').click();
```

**Arguments:**

| Parameter       | Type                 | Description                                      |
| --------------- | -------------------- | ------------------------------------------------ |
| `text`          | `string \| RegExp`   | Text to locate the element for                   |
| `options.exact` | `boolean` (optional) | Whether to find an exact match. Default: `false` |

**Returns:** `Locator`

### `locator.getByLabel(text, options?)` — Added in: v1.27

Allows locating input elements by the text of the associated `<label>` or `aria-labelledby` element, or by `aria-label` attribute.

```ts
await page.getByLabel('Username').fill('john');
await page.getByLabel('Password').fill('secret');
```

**Arguments:**

| Parameter       | Type                 | Description                                      |
| --------------- | -------------------- | ------------------------------------------------ |
| `text`          | `string \| RegExp`   | Text to locate the element for                   |
| `options.exact` | `boolean` (optional) | Whether to find an exact match. Default: `false` |

**Returns:** `Locator`

### `locator.getByPlaceholder(text, options?)` — Added in: v1.27

Allows locating input elements by the placeholder text.

```ts
await page.getByPlaceholder('name@example.com').fill('playwright@microsoft.com');
```

**Arguments:**

| Parameter       | Type                 | Description                                      |
| --------------- | -------------------- | ------------------------------------------------ |
| `text`          | `string \| RegExp`   | Text to locate the element for                   |
| `options.exact` | `boolean` (optional) | Whether to find an exact match. Default: `false` |

**Returns:** `Locator`

### `locator.getByRole(role, options?)` — Added in: v1.27

Allows locating elements by their ARIA role, ARIA attributes, and accessible name.

```ts
await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
await page.getByRole('checkbox', { name: 'Subscribe' }).check();
await page.getByRole('button', { name: /submit/i }).click();
```

**Arguments:**

| Parameter               | Type                          | Description                                                        |
| ----------------------- | ----------------------------- | ------------------------------------------------------------------ |
| `role`                  | `AriaRole`                    | Required ARIA role (e.g. `"button"`, `"heading"`, `"textbox"`)     |
| `options.checked`       | `boolean` (optional)          | Match by `aria-checked` state                                      |
| `options.disabled`      | `boolean` (optional)          | Match by `aria-disabled` or `disabled` attribute                   |
| `options.exact`         | `boolean` (optional)          | Whether name is matched exactly. Default: `false`. Added in: v1.28 |
| `options.expanded`      | `boolean` (optional)          | Match by `aria-expanded` state                                     |
| `options.includeHidden` | `boolean` (optional)          | Include hidden elements. Default: only non-hidden                  |
| `options.level`         | `number` (optional)           | For roles `heading`, `listitem`, `row`, `treeitem`                 |
| `options.name`          | `string \| RegExp` (optional) | Match by accessible name                                           |
| `options.pressed`       | `boolean` (optional)          | Match by `aria-pressed` state                                      |
| `options.selected`      | `boolean` (optional)          | Match by `aria-selected` state                                     |

**Returns:** `Locator`

### `locator.getByTestId(testId)` — Added in: v1.27

Locate element by the test id. By default uses the `data-testid` attribute.

```ts
await page.getByTestId('directions').click();
```

**Arguments:**

| Parameter | Type               | Description                 |
| --------- | ------------------ | --------------------------- |
| `testId`  | `string \| RegExp` | Id to locate the element by |

**Returns:** `Locator`

### `locator.getByText(text, options?)` — Added in: v1.27

Allows locating elements that contain given text.

```ts
page.getByText('world');
page.getByText('Hello', { exact: true });
page.getByText(/^hello$/i);
```

**Arguments:**

| Parameter       | Type                 | Description                                      |
| --------------- | -------------------- | ------------------------------------------------ |
| `text`          | `string \| RegExp`   | Text to locate the element for                   |
| `options.exact` | `boolean` (optional) | Whether to find an exact match. Default: `false` |

**Returns:** `Locator`

### `locator.getByTitle(text, options?)` — Added in: v1.27

Allows locating elements by their title attribute.

```ts
await expect(page.getByTitle('Issues count')).toHaveText('25 issues');
```

**Arguments:**

| Parameter       | Type                 | Description                                      |
| --------------- | -------------------- | ------------------------------------------------ |
| `text`          | `string \| RegExp`   | Text to locate the element for                   |
| `options.exact` | `boolean` (optional) | Whether to find an exact match. Default: `false` |

**Returns:** `Locator`

### `locator.highlight()` — Added in: v1.20

Highlight the corresponding element(s) on the screen. Useful for debugging.

```ts
await locator.highlight();
```

**Returns:** `Promise<void>`

### `locator.hover(options?)` — Added in: v1.14

Hover over the matching element.

```ts
await page.getByRole('link').hover();
```

**Arguments:**

| Parameter           | Type                                                                           | Description                                         |
| ------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| `options.force`     | `boolean` (optional)                                                           | Bypass actionability checks. Default: `false`       |
| `options.modifiers` | `Array<"Alt" \| "Control" \| "ControlOrMeta" \| "Meta" \| "Shift">` (optional) | Modifier keys to press                              |
| `options.position`  | `{ x: number, y: number }` (optional)                                          | Hover position relative to element top-left         |
| `options.timeout`   | `number` (optional)                                                            | Max time in ms. Default: no timeout                 |
| `options.trial`     | `boolean` (optional)                                                           | Only perform actionability checks. Default: `false` |

**Returns:** `Promise<void>`

### `locator.innerHTML(options?)` — Added in: v1.14

Returns the `element.innerHTML`.

```ts
await locator.innerHTML();
```

**Arguments:**

| Parameter         | Type                | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout |

**Returns:** `Promise<string>`

### `locator.innerText(options?)` — Added in: v1.14

Returns the `element.innerText`.

```ts
await locator.innerText();
```

**Arguments:**

| Parameter         | Type                | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout |

**Returns:** `Promise<string>`

### `locator.inputValue(options?)` — Added in: v1.14

Returns the value for the matching `<input>`, `<textarea>`, or `<select>` element.

```ts
const value = await page.getByRole('textbox').inputValue();
```

**Arguments:**

| Parameter         | Type                | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout |

**Returns:** `Promise<string>`

### `locator.isChecked(options?)` — Added in: v1.14

Returns whether the element is checked. Throws if the element is not a checkbox or radio input.

```ts
const checked = await page.getByRole('checkbox').isChecked();
```

**Arguments:**

| Parameter         | Type                | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout |

**Returns:** `Promise<boolean>`

### `locator.isDisabled(options?)` — Added in: v1.14

Returns whether the element is disabled (opposite of enabled).

```ts
const disabled = await page.getByRole('button').isDisabled();
```

**Arguments:**

| Parameter         | Type                | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout |

**Returns:** `Promise<boolean>`

### `locator.isEditable(options?)` — Added in: v1.14

Returns whether the element is editable.

```ts
const editable = await page.getByRole('textbox').isEditable();
```

**Arguments:**

| Parameter         | Type                | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout |

**Returns:** `Promise<boolean>`

### `locator.isEnabled(options?)` — Added in: v1.14

Returns whether the element is enabled.

```ts
const enabled = await page.getByRole('button').isEnabled();
```

**Arguments:**

| Parameter         | Type                | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout |

**Returns:** `Promise<boolean>`

### `locator.isHidden(options?)` — Added in: v1.14

Returns whether the element is hidden (opposite of visible). Does not wait for the element to become hidden and returns immediately.

```ts
const hidden = await page.getByRole('button').isHidden();
```

**Returns:** `Promise<boolean>`

### `locator.isVisible(options?)` — Added in: v1.14

Returns whether the element is visible. Does not wait for the element to become visible and returns immediately.

```ts
const visible = await page.getByRole('button').isVisible();
```

**Returns:** `Promise<boolean>`

### `locator.last()` — Added in: v1.14

Returns locator to the last matching element.

```ts
const banana = await page.getByRole('listitem').last();
```

**Returns:** `Locator`

### `locator.locator(selectorOrLocator, options?)` — Added in: v1.14

Finds an element matching the specified selector in the locator's subtree.

```ts
locator.locator(selectorOrLocator);
locator.locator(selectorOrLocator, options);
```

**Arguments:**

| Parameter            | Type                          | Description                                                 |
| -------------------- | ----------------------------- | ----------------------------------------------------------- |
| `selectorOrLocator`  | `string \| Locator`           | Selector or locator to use                                  |
| `options.has`        | `Locator` (optional)          | Match elements containing this relative locator             |
| `options.hasNot`     | `Locator` (optional)          | Match elements NOT containing this locator. Added in: v1.33 |
| `options.hasNotText` | `string \| RegExp` (optional) | Match elements not containing this text. Added in: v1.33    |
| `options.hasText`    | `string \| RegExp` (optional) | Match elements containing this text                         |

**Returns:** `Locator`

### `locator.normalize()` — Added in: v1.59

Returns a new locator using best practices for referencing the matched element, prioritizing test ids, aria roles, and user-facing attributes over CSS selectors.

```ts
await locator.normalize();
```

**Returns:** `Promise<Locator>`

### `locator.nth(index)` — Added in: v1.14

Returns locator to the n-th matching element (zero-based).

```ts
const banana = await page.getByRole('listitem').nth(2);
```

**Arguments:**

| Parameter | Type     | Description      |
| --------- | -------- | ---------------- |
| `index`   | `number` | Zero-based index |

**Returns:** `Locator`

### `locator.or(locator)` — Added in: v1.33

Creates a locator matching all elements that match one or both of the two locators.

```ts
const newEmail = page.getByRole('button', { name: 'New' });
const dialog = page.getByText('Confirm security settings');
await expect(newEmail.or(dialog).first()).toBeVisible();
if (await dialog.isVisible()) await page.getByRole('button', { name: 'Dismiss' }).click();
await newEmail.click();
```

**Arguments:**

| Parameter | Type      | Description                  |
| --------- | --------- | ---------------------------- |
| `locator` | `Locator` | Alternative locator to match |

**Returns:** `Locator`

### `locator.page()` — Added in: v1.19

A page this locator belongs to.

```ts
locator.page();
```

**Returns:** `Page`

### `locator.press(key, options?)` — Added in: v1.14

Focuses the matching element and presses a combination of keys.

```ts
await page.getByRole('textbox').press('Backspace');
```

**Arguments:**

| Parameter         | Type                | Description                                        |
| ----------------- | ------------------- | -------------------------------------------------- |
| `key`             | `string`            | Key name or character, e.g. `"ArrowLeft"` or `"a"` |
| `options.delay`   | `number` (optional) | Time between keydown and keyup in ms. Default: `0` |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout                |

**Returns:** `Promise<void>`

### `locator.pressSequentially(text, options?)` — Added in: v1.38

Focuses the element, then sends keydown/keypress/input/keyup events for each character. Prefer `locator.fill()` unless special keyboard handling is needed.

```ts
await locator.pressSequentially('Hello');
await locator.pressSequentially('World', { delay: 100 });
```

**Arguments:**

| Parameter         | Type                | Description                                  |
| ----------------- | ------------------- | -------------------------------------------- |
| `text`            | `string`            | Characters to sequentially press             |
| `options.delay`   | `number` (optional) | Time between key presses in ms. Default: `0` |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout          |

**Returns:** `Promise<void>`

### `locator.screenshot(options?)` — Added in: v1.14

Take a screenshot of the element matching the locator.

```ts
await page.getByRole('link').screenshot();
await page.getByRole('link').screenshot({ animations: 'disabled', path: 'link.png' });
```

**Arguments:**

| Parameter                | Type                               | Description                                                   |
| ------------------------ | ---------------------------------- | ------------------------------------------------------------- |
| `options.animations`     | `"disabled" \| "allow"` (optional) | Control CSS animations. Default: `"allow"`                    |
| `options.caret`          | `"hide" \| "initial"` (optional)   | Control text caret. Default: `"hide"`                         |
| `options.mask`           | `Array<Locator>` (optional)        | Locators to mask with a colored box                           |
| `options.maskColor`      | `string` (optional)                | Mask color in CSS format. Default: `#FF00FF`. Added in: v1.35 |
| `options.omitBackground` | `boolean` (optional)               | Hide default white background. Default: `false`               |
| `options.path`           | `string` (optional)                | File path to save image                                       |
| `options.scale`          | `"css" \| "device"` (optional)     | Default: `"device"`                                           |
| `options.style`          | `string` (optional)                | Stylesheet text applied during screenshot. Added in: v1.41    |
| `options.timeout`        | `number` (optional)                | Max time in ms. Default: no timeout                           |
| `options.type`           | `"png" \| "jpeg"` (optional)       | Default: `"png"`                                              |

**Returns:** `Promise<Buffer>`

### `locator.scrollIntoViewIfNeeded(options?)` — Added in: v1.14

Waits for actionability checks, then scrolls element into view unless already completely visible.

```ts
await locator.scrollIntoViewIfNeeded();
```

**Arguments:**

| Parameter         | Type                | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout |

**Returns:** `Promise<void>`

### `locator.selectOption(values, options?)` — Added in: v1.14

Selects option or options in a `<select>` element.

```ts
element.selectOption('blue');
element.selectOption({ label: 'Blue' });
element.selectOption(['red', 'green', 'blue']);
```

**Arguments:**

| Parameter         | Type                                                         | Description                                   |
| ----------------- | ------------------------------------------------------------ | --------------------------------------------- |
| `values`          | `null \| string \| Array<string> \| Object \| Array<Object>` | Options to select                             |
| `options.force`   | `boolean` (optional)                                         | Bypass actionability checks. Default: `false` |
| `options.timeout` | `number` (optional)                                          | Max time in ms. Default: no timeout           |

**Returns:** `Promise<Array<string>>`

### `locator.selectText(options?)` — Added in: v1.14

Waits for actionability checks, then focuses the element and selects all its text content.

```ts
await locator.selectText();
```

**Arguments:**

| Parameter         | Type                 | Description                                   |
| ----------------- | -------------------- | --------------------------------------------- |
| `options.force`   | `boolean` (optional) | Bypass actionability checks. Default: `false` |
| `options.timeout` | `number` (optional)  | Max time in ms. Default: no timeout           |

**Returns:** `Promise<void>`

### `locator.setChecked(checked, options?)` — Added in: v1.15

Set the state of a checkbox or radio element.

```ts
await page.getByRole('checkbox').setChecked(true);
```

**Arguments:**

| Parameter          | Type                                  | Description                                         |
| ------------------ | ------------------------------------- | --------------------------------------------------- |
| `checked`          | `boolean`                             | Whether to check or uncheck the checkbox            |
| `options.force`    | `boolean` (optional)                  | Bypass actionability checks. Default: `false`       |
| `options.position` | `{ x: number, y: number }` (optional) | Click position relative to element top-left         |
| `options.timeout`  | `number` (optional)                   | Max time in ms. Default: no timeout                 |
| `options.trial`    | `boolean` (optional)                  | Only perform actionability checks. Default: `false` |

**Returns:** `Promise<void>`

### `locator.setInputFiles(files, options?)` — Added in: v1.14

Upload file or multiple files into `<input type=file>`.

```ts
await page.getByLabel('Upload file').setInputFiles(path.join(__dirname, 'myfile.pdf'));
await page.getByLabel('Upload files').setInputFiles(['file1.txt', 'file2.txt']);
await page.getByLabel('Upload file').setInputFiles([]);
// Upload buffer from memory:
await page.getByLabel('Upload file').setInputFiles({ name: 'file.txt', mimeType: 'text/plain', buffer: Buffer.from('test') });
```

**Arguments:**

| Parameter         | Type                                                 | Description                         |
| ----------------- | ---------------------------------------------------- | ----------------------------------- |
| `files`           | `string \| Array<string> \| Object \| Array<Object>` | File path(s) or buffer objects      |
| `options.timeout` | `number` (optional)                                  | Max time in ms. Default: no timeout |

**Returns:** `Promise<void>`

### `locator.tap(options?)` — Added in: v1.14

Perform a tap gesture on the element. Requires the browser context to have `hasTouch` set to `true`.

```ts
await locator.tap();
```

**Arguments:**

| Parameter           | Type                                                                           | Description                                         |
| ------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------- |
| `options.force`     | `boolean` (optional)                                                           | Bypass actionability checks. Default: `false`       |
| `options.modifiers` | `Array<"Alt" \| "Control" \| "ControlOrMeta" \| "Meta" \| "Shift">` (optional) | Modifier keys                                       |
| `options.position`  | `{ x: number, y: number }` (optional)                                          | Tap position relative to element top-left           |
| `options.timeout`   | `number` (optional)                                                            | Max time in ms. Default: no timeout                 |
| `options.trial`     | `boolean` (optional)                                                           | Only perform actionability checks. Default: `false` |

**Returns:** `Promise<void>`

### `locator.textContent(options?)` — Added in: v1.14

Returns the `node.textContent`.

```ts
await locator.textContent();
```

**Arguments:**

| Parameter         | Type                | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout |

**Returns:** `Promise<null | string>`

### `locator.toString()` — Added in: v1.57

Returns a human-readable representation of the locator, using `locator.description()` if one exists.

```ts
locator.toString();
```

**Returns:** `string`

### `locator.uncheck(options?)` — Added in: v1.14

Ensure that checkbox or radio element is unchecked.

```ts
await page.getByRole('checkbox').uncheck();
```

**Arguments:**

| Parameter          | Type                                  | Description                                         |
| ------------------ | ------------------------------------- | --------------------------------------------------- |
| `options.force`    | `boolean` (optional)                  | Bypass actionability checks. Default: `false`       |
| `options.position` | `{ x: number, y: number }` (optional) | Click position relative to element top-left         |
| `options.timeout`  | `number` (optional)                   | Max time in ms. Default: no timeout                 |
| `options.trial`    | `boolean` (optional)                  | Only perform actionability checks. Default: `false` |

**Returns:** `Promise<void>`

### `locator.waitFor(options?)` — Added in: v1.16

Returns when element specified by locator satisfies the state option. If already satisfied, returns immediately.

```ts
const orderSent = page.locator('#order-sent');
await orderSent.waitFor();
```

**Arguments:**

| Parameter         | Type                                                           | Description                         |
| ----------------- | -------------------------------------------------------------- | ----------------------------------- |
| `options.state`   | `"attached" \| "detached" \| "visible" \| "hidden"` (optional) | Default: `"visible"`                |
| `options.timeout` | `number` (optional)                                            | Max time in ms. Default: no timeout |

**Returns:** `Promise<void>`

## Deprecated Methods

### `locator.elementHandle(options?)` — Added in: v1.14

> **Discouraged:** Always prefer using Locators and web assertions over ElementHandles.

Resolves given locator to the first matching DOM element. If no matching elements, waits for one.

```ts
await locator.elementHandle();
await locator.elementHandle(options);
```

**Arguments:**

| Parameter         | Type                | Description                         |
| ----------------- | ------------------- | ----------------------------------- |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout |

**Returns:** `Promise<ElementHandle>`

### `locator.elementHandles()` — Added in: v1.14

> **Discouraged:** Always prefer using Locators and web assertions over ElementHandles.

Resolves given locator to all matching DOM elements. Returns an empty list if no matching elements.

```ts
await locator.elementHandles();
```

**Returns:** `Promise<Array<ElementHandle>>`

### `locator.type(text, options?)` — Added in: v1.14

> **Deprecated:** Use `locator.fill()` or `locator.pressSequentially()` instead.

Focuses the element, then sends keydown/keypress/input/keyup events for each character.

**Arguments:**

| Parameter         | Type                | Description                                  |
| ----------------- | ------------------- | -------------------------------------------- |
| `text`            | `string`            | Text to type                                 |
| `options.delay`   | `number` (optional) | Time between key presses in ms. Default: `0` |
| `options.timeout` | `number` (optional) | Max time in ms. Default: no timeout          |

**Returns:** `Promise<void>`
