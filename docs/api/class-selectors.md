# 📦 Playwright — Selectors

> **Source:** [playwright.dev/docs/api/class-selectors](https://playwright.dev/docs/api/class-selectors)

---

**Selectors** can be used to install custom selector engines. See extensibility for more information.

## Methods

## Methods

### `selectors.register(name, script, options?)` — Added before v1.9

Selectors must be registered before creating the page.

```ts
const { selectors, firefox } = require('@playwright/test');

(async () => {
  // Must be a function that evaluates to a selector engine instance.
  const createTagNameEngine = () => ({
    // Returns the first element matching given selector in the root's subtree.
    query(root, selector) {
      return root.querySelector(selector);
    },
    // Returns all elements matching given selector in the root's subtree.
    queryAll(root, selector) {
      return Array.from(root.querySelectorAll(selector));
    },
  });

  // Register the engine. Selectors will be prefixed with "tag=".
  await selectors.register('tag', createTagNameEngine);

  const browser = await firefox.launch();
  const page = await browser.newPage();
  await page.setContent(`<div><button>Click me</button></div>`);

  // Use the selector prefixed with its name.
  const button = page.locator('tag=button');
  // We can combine it with built-in locators.
  await page.locator('tag=div').getByText('Click me').click();
  // Can use it in any methods supporting selectors.
  const buttonCount = await page.locator('tag=button').count();
  await browser.close();
})();
```

**Arguments:**

| Parameter               | Type                           | Description                                                                                                                                                                                                                                                                                                                 |
| ----------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                  | `string`                       | Name that is used in selectors as a prefix, e.g. `{name: 'foo'}` enables `foo=myselectorbody` selectors. May only contain `[a-zA-Z0-9_]` characters.                                                                                                                                                                        |
| `script`                | `function \| string \| Object` | Script that evaluates to a selector engine instance. The script is evaluated in the page context.                                                                                                                                                                                                                           |
| `options.contentScript` | `boolean` (optional)           | Whether to run this selector engine in isolated JavaScript environment. This environment has access to the same DOM, but not any JavaScript objects from the frame's scripts. Defaults to `false`. Note that running as a content script is not guaranteed when this engine is used together with other registered engines. |

**Returns:** `Promise<void>`

### `selectors.setTestIdAttribute(attributeName)` — Added in: v1.27

Defines custom attribute name to be used in `page.getByTestId()`. `data-testid` is used by default.

```ts
import { selectors, test } from '@playwright/test';

selectors.setTestIdAttribute('data-pw');
```

**Arguments:**

| Parameter       | Type     | Description             |
| --------------- | -------- | ----------------------- |
| `attributeName` | `string` | Test id attribute name. |

**Returns:** `void`
