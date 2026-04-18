# 📦 Playwright — LocatorAssertions

> **Source:** [playwright.dev/docs/api/class-locatorassertions](https://playwright.dev/docs/api/class-locatorassertions)

---

The **LocatorAssertions** class provides assertion methods for the **Locator** state in tests.

```ts
import { test, expect } from '@playwright/test';

test('status becomes submitted', async ({ page }) => {
  await page.getByRole('button').click();
  await expect(page.locator('.status')).toHaveText('Submitted');
});
```

---

## Methods

### `locatorAssertions.toBeAttached(options?)` — Added in: v1.33

Ensures that the Locator points to an element connected to a Document or a ShadowRoot.

```ts
await expect(page.getByText('Hidden text')).toBeAttached();
```

**Arguments:**

| Parameter          | Type                 | Description                                                                 |
| ------------------ | -------------------- | --------------------------------------------------------------------------- |
| `options.attached` | `boolean` (optional) | Whether to assert element is attached (default) or detached.                |
| `options.timeout`  | `number` (optional)  | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toBeChecked(options?)` — Added in: v1.20

Ensures the Locator points to a checked input.

```ts
const locator = page.getByLabel('Subscribe to newsletter');
await expect(locator).toBeChecked();
```

**Arguments:**

| Parameter               | Type                                 | Description                                                                                             |
| ----------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `options.checked`       | `boolean` (optional, Added in v1.18) | Asserts the checked state. Cannot be used when `indeterminate` is `true`.                               |
| `options.indeterminate` | `boolean` (optional, Added in v1.50) | Asserts the element is in the indeterminate (mixed) state. Cannot be `true` when `checked` is provided. |
| `options.timeout`       | `number` (optional, Added in v1.18)  | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout.                             |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toBeDisabled(options?)` — Added in: v1.20

Ensures the Locator points to a disabled element. An element is disabled if it has the `disabled` attribute or is disabled via `aria-disabled`.

```ts
const locator = page.locator('button.submit');
await expect(locator).toBeDisabled();
```

**Arguments:**

| Parameter         | Type                | Description                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------------- |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toBeEditable(options?)` — Added in: v1.20

Ensures the Locator points to an editable element.

```ts
const locator = page.getByRole('textbox');
await expect(locator).toBeEditable();
```

**Arguments:**

| Parameter          | Type                                 | Description                                                                 |
| ------------------ | ------------------------------------ | --------------------------------------------------------------------------- |
| `options.editable` | `boolean` (optional, Added in v1.26) | Whether to assert element is editable (default) or not.                     |
| `options.timeout`  | `number` (optional)                  | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toBeEmpty(options?)` — Added in: v1.20

Ensures the Locator points to an empty editable element or a DOM node with no text.

```ts
const locator = page.locator('div.warning');
await expect(locator).toBeEmpty();
```

**Arguments:**

| Parameter         | Type                | Description                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------------- |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toBeEnabled(options?)` — Added in: v1.20

Ensures the Locator points to an enabled element.

```ts
const locator = page.locator('button.submit');
await expect(locator).toBeEnabled();
```

**Arguments:**

| Parameter         | Type                                 | Description                                                                 |
| ----------------- | ------------------------------------ | --------------------------------------------------------------------------- |
| `options.enabled` | `boolean` (optional, Added in v1.26) | Whether to assert element is enabled (default) or disabled.                 |
| `options.timeout` | `number` (optional)                  | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toBeFocused(options?)` — Added in: v1.20

Ensures the Locator points to a focused DOM node.

```ts
const locator = page.getByRole('textbox');
await expect(locator).toBeFocused();
```

**Arguments:**

| Parameter         | Type                | Description                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------------- |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toBeHidden(options?)` — Added in: v1.20

Ensures the Locator either does not resolve to any DOM node, or resolves to a non-visible one.

```ts
const locator = page.locator('.my-element');
await expect(locator).toBeHidden();
```

**Arguments:**

| Parameter         | Type                | Description                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------------- |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toBeInViewport(options?)` — Added in: v1.31

Ensures the Locator points to an element that intersects the viewport, according to the Intersection Observer API.

```ts
const locator = page.getByRole('button');
await expect(locator).toBeInViewport();
await expect(locator).not.toBeInViewport();
await expect(locator).toBeInViewport({ ratio: 0.5 });
```

**Arguments:**

| Parameter         | Type                | Description                                                                                                   |
| ----------------- | ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `options.ratio`   | `number` (optional) | Minimum ratio of the element to intersect the viewport. `0` means any positive intersection. Defaults to `0`. |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout.                                   |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toBeVisible(options?)` — Added in: v1.20

Ensures the Locator points to an attached and visible DOM node.

```ts
await expect(page.getByText('Welcome')).toBeVisible();
await expect(page.getByTestId('todo-item').first()).toBeVisible();
```

**Arguments:**

| Parameter         | Type                                 | Description                                                                 |
| ----------------- | ------------------------------------ | --------------------------------------------------------------------------- |
| `options.visible` | `boolean` (optional, Added in v1.26) | Whether to assert element is visible (default) or hidden.                   |
| `options.timeout` | `number` (optional)                  | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toContainClass(expected, options?)` — Added in: v1.52

Ensures the Locator points to an element with the given CSS classes. All classes in the asserted value must be present in `Element.classList` in any order.

```ts
const locator = page.locator('#component');
await expect(locator).toContainClass('middle selected row');
await expect(locator).toContainClass('selected');
```

When an array is passed, asserts each element against the corresponding expected class string:

```ts
const locator = page.locator('.list > .component');
await expect(locator).toContainClass(['inactive', 'active', 'inactive']);
```

**Arguments:**

| Parameter         | Type                      | Description                                                                    |
| ----------------- | ------------------------- | ------------------------------------------------------------------------------ |
| `expected`        | `string \| Array<string>` | Expected CSS class names (space-separated), or an array for multiple elements. |
| `options.timeout` | `number` (optional)       | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout.    |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toContainText(expected, options?)` — Added in: v1.20

Ensures the Locator points to an element that contains the given text. All nested elements are considered when computing text content.

```ts
const locator = page.locator('.title');
await expect(locator).toContainText('substring');
await expect(locator).toContainText(/\d messages/);
```

When an array is passed, a matching subset of elements (in the same order) must each contain the corresponding text.

**Arguments:**

| Parameter              | Type                                          | Description                                                                    |
| ---------------------- | --------------------------------------------- | ------------------------------------------------------------------------------ |
| `expected`             | `string \| RegExp \| Array<string \| RegExp>` | Expected substring, RegExp, or list of those.                                  |
| `options.ignoreCase`   | `boolean` (optional, Added in v1.23)          | Perform case-insensitive match. Takes precedence over regex flags.             |
| `options.timeout`      | `number` (optional)                           | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout.    |
| `options.useInnerText` | `boolean` (optional)                          | Use `element.innerText` instead of `element.textContent` when retrieving text. |

**Returns:** `Promise<void>`

> **Note:** When `expected` is a string, Playwright normalizes whitespaces and line breaks before matching. RegExp is matched as-is.

---

### `locatorAssertions.toHaveAccessibleDescription(description, options?)` — Added in: v1.44

Ensures the Locator points to an element with a given accessible description.

```ts
const locator = page.getByTestId('save-button');
await expect(locator).toHaveAccessibleDescription('Save results to disk');
```

**Arguments:**

| Parameter            | Type                 | Description                                                                 |
| -------------------- | -------------------- | --------------------------------------------------------------------------- |
| `description`        | `string \| RegExp`   | Expected accessible description.                                            |
| `options.ignoreCase` | `boolean` (optional) | Perform case-insensitive match. Takes precedence over regex flags.          |
| `options.timeout`    | `number` (optional)  | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toHaveAccessibleErrorMessage(errorMessage, options?)` — Added in: v1.50

Ensures the Locator points to an element with a given ARIA error message.

```ts
const locator = page.getByTestId('username-input');
await expect(locator).toHaveAccessibleErrorMessage('Username is required.');
```

**Arguments:**

| Parameter            | Type                 | Description                                                                 |
| -------------------- | -------------------- | --------------------------------------------------------------------------- |
| `errorMessage`       | `string \| RegExp`   | Expected accessible error message.                                          |
| `options.ignoreCase` | `boolean` (optional) | Perform case-insensitive match. Takes precedence over regex flags.          |
| `options.timeout`    | `number` (optional)  | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toHaveAccessibleName(name, options?)` — Added in: v1.44

Ensures the Locator points to an element with a given accessible name.

```ts
const locator = page.getByTestId('save-button');
await expect(locator).toHaveAccessibleName('Save to disk');
```

**Arguments:**

| Parameter            | Type                 | Description                                                                 |
| -------------------- | -------------------- | --------------------------------------------------------------------------- |
| `name`               | `string \| RegExp`   | Expected accessible name.                                                   |
| `options.ignoreCase` | `boolean` (optional) | Perform case-insensitive match. Takes precedence over regex flags.          |
| `options.timeout`    | `number` (optional)  | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toHaveAttribute(name, value, options?)` — Added in: v1.20

Ensures the Locator points to an element with the given attribute and value.

```ts
const locator = page.locator('input');
await expect(locator).toHaveAttribute('type', 'text');
```

**Arguments:**

| Parameter            | Type                                 | Description                                                                 |
| -------------------- | ------------------------------------ | --------------------------------------------------------------------------- |
| `name`               | `string`                             | Attribute name.                                                             |
| `value`              | `string \| RegExp`                   | Expected attribute value.                                                   |
| `options.ignoreCase` | `boolean` (optional, Added in v1.40) | Perform case-insensitive match. Takes precedence over regex flags.          |
| `options.timeout`    | `number` (optional)                  | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toHaveAttribute(name, options?)` — Added in: v1.39

Ensures the Locator points to an element with the given attribute (presence check only).

```ts
const locator = page.locator('input');
await expect(locator).toHaveAttribute('disabled');
await expect(locator).not.toHaveAttribute('open');
```

**Arguments:**

| Parameter         | Type                | Description                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------------- |
| `name`            | `string`            | Attribute name.                                                             |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toHaveClass(expected, options?)` — Added in: v1.20

Ensures the Locator points to an element with the given CSS classes. When a string is provided, it must fully match the element's `class` attribute.

```ts
const locator = page.locator('#component');
await expect(locator).toHaveClass('middle selected row');
await expect(locator).toHaveClass(/(^|\s)selected(\s|$)/);
```

When an array is passed, asserts each element against the corresponding expected class value.

**Arguments:**

| Parameter         | Type                                          | Description                                                                 |
| ----------------- | --------------------------------------------- | --------------------------------------------------------------------------- |
| `expected`        | `string \| RegExp \| Array<string \| RegExp>` | Expected class, RegExp, or list of those.                                   |
| `options.timeout` | `number` (optional)                           | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toHaveCount(count, options?)` — Added in: v1.20

Ensures the Locator resolves to an exact number of DOM nodes.

```ts
const list = page.locator('list > .component');
await expect(list).toHaveCount(3);
```

**Arguments:**

| Parameter         | Type                | Description                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------------- |
| `count`           | `number`            | Expected count.                                                             |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toHaveCSS(name, value, options?)` — Added in: v1.20

Ensures the Locator resolves to an element with the given computed CSS style.

```ts
const locator = page.getByRole('button');
await expect(locator).toHaveCSS('display', 'flex');
```

**Arguments:**

| Parameter         | Type                | Description                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------------- |
| `name`            | `string`            | CSS property name.                                                          |
| `value`           | `string \| RegExp`  | CSS property value.                                                         |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toHaveId(id, options?)` — Added in: v1.20

Ensures the Locator points to an element with the given DOM Node ID.

```ts
const locator = page.getByRole('textbox');
await expect(locator).toHaveId('lastname');
```

**Arguments:**

| Parameter         | Type                | Description                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------------- |
| `id`              | `string \| RegExp`  | Element ID.                                                                 |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toHaveJSProperty(name, value, options?)` — Added in: v1.20

Ensures the Locator points to an element with the given JavaScript property. Supports primitive types and plain serializable objects.

```ts
const locator = page.locator('.component');
await expect(locator).toHaveJSProperty('loaded', true);
```

**Arguments:**

| Parameter         | Type                | Description                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------------- |
| `name`            | `string`            | Property name.                                                              |
| `value`           | `Object`            | Property value.                                                             |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toHaveRole(role, options?)` — Added in: v1.44

Ensures the Locator points to an element with the given ARIA role. Role is matched as a string; ARIA role hierarchy is not considered.

```ts
const locator = page.getByTestId('save-button');
await expect(locator).toHaveRole('button');
```

**Arguments:**

| Parameter         | Type                | Description                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------------- |
| `role`            | `AriaRole`          | Required ARIA role (e.g. `"button"`, `"checkbox"`, `"textbox"`, etc.).      |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toHaveScreenshot(name, options?)` — Added in: v1.23

Waits until two consecutive locator screenshots yield the same result, then compares the last screenshot with the expectation.

```ts
const locator = page.getByRole('button');
await expect(locator).toHaveScreenshot('image.png');
```

> **Note:** Screenshot assertions only work with the Playwright test runner.

**Arguments:**

| Parameter                   | Type                                                 | Description                                                                           |
| --------------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `name`                      | `string \| Array<string>`                            | Snapshot name.                                                                        |
| `options.animations`        | `"disabled" \| "allow"` (optional)                   | Stops CSS/Web animations when `"disabled"`. Defaults to `"disabled"`.                 |
| `options.caret`             | `"hide" \| "initial"` (optional)                     | Hides text caret when `"hide"`. Defaults to `"hide"`.                                 |
| `options.mask`              | `Array<Locator>` (optional)                          | Locators to mask with a pink `#FF00FF` overlay.                                       |
| `options.maskColor`         | `string` (optional, Added in v1.35)                  | CSS color for mask overlay. Default is `#FF00FF`.                                     |
| `options.maxDiffPixelRatio` | `number` (optional)                                  | Acceptable ratio of different pixels (0–1). Configurable via `TestConfig.expect`.     |
| `options.maxDiffPixels`     | `number` (optional)                                  | Acceptable number of different pixels. Configurable via `TestConfig.expect`.          |
| `options.omitBackground`    | `boolean` (optional)                                 | Hides white background for transparency. Not applicable to JPEG. Defaults to `false`. |
| `options.scale`             | `"css" \| "device"` (optional)                       | `"css"` = 1px per CSS pixel; `"device"` = 1px per device pixel. Defaults to `"css"`.  |
| `options.stylePath`         | `string \| Array<string>` (optional, Added in v1.41) | Path to stylesheet to apply during capture.                                           |
| `options.threshold`         | `number` (optional)                                  | Acceptable YIQ color space difference (0–1). Defaults to `0.2`.                       |
| `options.timeout`           | `number` (optional)                                  | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout.           |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toHaveScreenshot(options?)` — Added in: v1.23

Waits until two consecutive locator screenshots yield the same result, then compares the last screenshot with the expectation.

```ts
const locator = page.getByRole('button');
await expect(locator).toHaveScreenshot();
```

> **Note:** Screenshot assertions only work with the Playwright test runner.

**Arguments:**

| Parameter | Type                | Description                                                   |
| --------- | ------------------- | ------------------------------------------------------------- |
| `options` | `Object` (optional) | Same option properties as `toHaveScreenshot(name, options?)`. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toHaveText(expected, options?)` — Added in: v1.20

Ensures the Locator points to an element with the given text. All nested elements are considered. Supports regular expressions.

```ts
const locator = page.locator('.title');
await expect(locator).toHaveText(/Welcome, Test User/);
await expect(locator).toHaveText(/Welcome, .*/);
```

When an array is passed, the locator resolves to a list of elements where each element's text matches the corresponding array value in order.

**Arguments:**

| Parameter              | Type                                          | Description                                                                    |
| ---------------------- | --------------------------------------------- | ------------------------------------------------------------------------------ |
| `expected`             | `string \| RegExp \| Array<string \| RegExp>` | Expected string, RegExp, or list of those.                                     |
| `options.ignoreCase`   | `boolean` (optional, Added in v1.23)          | Perform case-insensitive match. Takes precedence over regex flags.             |
| `options.timeout`      | `number` (optional)                           | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout.    |
| `options.useInnerText` | `boolean` (optional)                          | Use `element.innerText` instead of `element.textContent` when retrieving text. |

**Returns:** `Promise<void>`

> **Note:** When `expected` is a string, Playwright normalizes whitespaces and line breaks before matching. RegExp is matched as-is.

---

### `locatorAssertions.toHaveValue(value, options?)` — Added in: v1.20

Ensures the Locator points to an element with the given input value. Supports regular expressions.

```ts
const locator = page.locator('input[type=number]');
await expect(locator).toHaveValue(/[0-9]/);
```

**Arguments:**

| Parameter         | Type                | Description                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------------- |
| `value`           | `string \| RegExp`  | Expected value.                                                             |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toHaveValues(values, options?)` — Added in: v1.23

Ensures the Locator points to a multi-select/combobox (`<select multiple>`) and the specified values are selected.

```ts
const locator = page.locator('id=favorite-colors');
await locator.selectOption(['R', 'G']);
await expect(locator).toHaveValues([/R/, /G/]);
```

**Arguments:**

| Parameter         | Type                      | Description                                                                 |
| ----------------- | ------------------------- | --------------------------------------------------------------------------- |
| `values`          | `Array<string \| RegExp>` | Expected selected option values.                                            |
| `options.timeout` | `number` (optional)       | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toMatchAriaSnapshot(expected, options?)` — Added in: v1.49

Asserts that the target element matches the given accessibility snapshot.

```ts
await page.goto('https://demo.playwright.dev/todomvc/');
await expect(page.locator('body')).toMatchAriaSnapshot(`
  - heading "todos"
  - textbox "What needs to be done?"`);
```

**Arguments:**

| Parameter         | Type                | Description                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------------- |
| `expected`        | `string`            | Expected accessibility snapshot string.                                     |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

### `locatorAssertions.toMatchAriaSnapshot(options?)` — Added in: v1.50

Asserts that the target element matches a stored accessibility snapshot in a `.aria.yml` file.

```ts
await expect(page.locator('body')).toMatchAriaSnapshot();
await expect(page.locator('body')).toMatchAriaSnapshot({ name: 'body.aria.yml' });
```

**Arguments:**

| Parameter         | Type                | Description                                                                 |
| ----------------- | ------------------- | --------------------------------------------------------------------------- |
| `options.name`    | `string` (optional) | Name of the snapshot file. Sequential names are generated if not specified. |
| `options.timeout` | `number` (optional) | Time to retry the assertion in ms. Defaults to `TestConfig.expect` timeout. |

**Returns:** `Promise<void>`

---

## Properties

### `locatorAssertions.not` — Added in: v1.20

Makes the assertion check for the opposite condition.

```ts
await expect(locator).not.toContainText('error');
```

**Type:** `LocatorAssertions`

---
