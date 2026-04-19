# 📦 Playwright — FrameLocator

> **Source:** [playwright.dev/docs/api/class-framelocator](https://playwright.dev/docs/api/class-framelocator)

---

**FrameLocator** represents a view to the iframe on the page. It captures the logic sufficient to retrieve the iframe and locate elements in that iframe. FrameLocator can be created with either `locator.contentFrame()`, `page.frameLocator()` or `locator.frameLocator()` method.

```ts
const locator = page.locator('#my-frame').contentFrame().getByText('Submit');
await locator.click();
```

**Strictness:** Frame locators are strict. This means that all operations on frame locators will throw if more than one element matches a given selector.

```ts
// Throws if there are several frames in DOM:
await page.locator('.result-frame').contentFrame().getByRole('button').click();

// Works because we explicitly tell locator to pick the first frame:
await page.locator('.result-frame').contentFrame().first().getByRole('button').click();
```

**Converting Locator to FrameLocator:** If you have a Locator object pointing to an iframe it can be converted to FrameLocator using `locator.contentFrame()`.

**Converting FrameLocator to Locator:** If you have a FrameLocator object it can be converted to Locator pointing to the same iframe using `frameLocator.owner()`.

## Methods

### frameLocator

**Added in:** v1.17

When working with iframes, you can create a frame locator that will enter the iframe and allow selecting elements in that iframe.

```ts
frameLocator.frameLocator(selector);
```

**Arguments:**

- `selector` string — A selector to use when resolving DOM element.

**Returns:** `FrameLocator`

### getByAltText

**Added in:** v1.27

Allows locating elements by their alt text.

```ts
// Find the image by alt text "Playwright logo":
// <img alt='Playwright logo'>
await page.getByAltText('Playwright logo').click();
```

**Arguments:**

- `text` string | RegExp — Text to locate the element for.
- `options` Object (optional)
  - `exact` boolean (optional) — Whether to find an exact match: case-sensitive and whole-string. Default to `false`. Ignored when locating by a regular expression.

**Returns:** `Locator`

### getByLabel

**Added in:** v1.27

Allows locating input elements by the text of the associated `<label>` or `aria-labelledby` element, or by the `aria-label` attribute.

```ts
await page.getByLabel('Username').fill('john');
await page.getByLabel('Password').fill('secret');
```

**Arguments:**

- `text` string | RegExp — Text to locate the element for.
- `options` Object (optional)
  - `exact` boolean (optional) — Whether to find an exact match: case-sensitive and whole-string. Default to `false`.

**Returns:** `Locator`

### getByPlaceholder

**Added in:** v1.27

Allows locating input elements by the placeholder text.

```ts
await page.getByPlaceholder('name@example.com').fill('playwright@microsoft.com');
```

**Arguments:**

- `text` string | RegExp — Text to locate the element for.
- `options` Object (optional)
  - `exact` boolean (optional) — Whether to find an exact match: case-sensitive and whole-string. Default to `false`.

**Returns:** `Locator`

### getByRole

**Added in:** v1.27

Allows locating elements by their ARIA role, ARIA attributes and accessible name.

```ts
await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
await page.getByRole('checkbox', { name: 'Subscribe' }).check();
await page.getByRole('button', { name: /submit/i }).click();
```

**Arguments:**

- `role` string — Required aria role (e.g. `"button"`, `"heading"`, `"checkbox"`, etc.).
- `options` Object (optional)
  - `checked` boolean (optional) — Matches elements with `aria-checked`.
  - `disabled` boolean (optional) — Matches elements with `aria-disabled` or `disabled`.
  - `exact` boolean (optional) _(Added in: v1.28)_ — Whether `name` is matched exactly.
  - `expanded` boolean (optional) — Matches elements with `aria-expanded`.
  - `includeHidden` boolean (optional) — Whether hidden elements are matched.
  - `level` number (optional) — Matches heading level for `heading` role.
  - `name` string | RegExp (optional) — Match by accessible name.
  - `pressed` boolean (optional) — Matches elements with `aria-pressed`.
  - `selected` boolean (optional) — Matches elements with `aria-selected`.

**Returns:** `Locator`

### getByTestId

**Added in:** v1.27

Locate element by the test id. By default, the `data-testid` attribute is used as a test id.

```ts
await page.getByTestId('directions').click();
```

**Arguments:**

- `testId` string | RegExp — Id to locate the element by.

**Returns:** `Locator`

### getByText

**Added in:** v1.27

Allows locating elements that contain given text.

```ts
// Matches <span>
page.getByText('world');
// Matches first <div>
page.getByText('Hello world');
// Matches second <div>
page.getByText('Hello', { exact: true });
// Matches both <div>s
page.getByText(/Hello/);
```

**Arguments:**

- `text` string | RegExp — Text to locate the element for.
- `options` Object (optional)
  - `exact` boolean (optional) — Whether to find an exact match: case-sensitive and whole-string. Default to `false`.

**Returns:** `Locator`

### getByTitle

**Added in:** v1.27

Allows locating elements by their title attribute.

```ts
await expect(page.getByTitle('Issues count')).toHaveText('25 issues');
```

**Arguments:**

- `text` string | RegExp — Text to locate the element for.
- `options` Object (optional)
  - `exact` boolean (optional) — Whether to find an exact match: case-sensitive and whole-string. Default to `false`.

**Returns:** `Locator`

### locator

**Added in:** v1.17

The method finds an element matching the specified selector in the locator's subtree. It also accepts filter options, similar to `locator.filter()` method.

```ts
frameLocator.locator(selectorOrLocator);
frameLocator.locator(selectorOrLocator, options);
```

**Arguments:**

- `selectorOrLocator` string | Locator — A selector or locator to use when resolving DOM element.
- `options` Object (optional)
  - `has` Locator (optional) — Narrows down results to those which contain elements matching this relative locator.
  - `hasNot` Locator (optional) _(Added in: v1.33)_ — Matches elements that do not contain an element matching an inner locator.
  - `hasNotText` string | RegExp (optional) _(Added in: v1.33)_ — Matches elements that do not contain specified text.
  - `hasText` string | RegExp (optional) — Matches elements containing specified text.

**Returns:** `Locator`

### owner

**Added in:** v1.43

Returns a Locator object pointing to the same iframe as this frame locator. Useful when you have a FrameLocator object obtained somewhere, and later on would like to interact with the iframe element. For a reverse operation, use `locator.contentFrame()`.

```ts
const frameLocator = page.locator('iframe[name="embedded"]').contentFrame();
// ...
const locator = frameLocator.owner();
await expect(locator).toBeVisible();
```

**Returns:** `Locator`

## Deprecated

### first

**Added in:** v1.17

> **Deprecated:** Use `locator.first()` followed by `locator.contentFrame()` instead.

Returns locator to the first matching frame.

```ts
frameLocator.first();
```

**Returns:** `FrameLocator`

### last

**Added in:** v1.17

> **Deprecated:** Use `locator.last()` followed by `locator.contentFrame()` instead.

Returns locator to the last matching frame.

```ts
frameLocator.last();
```

**Returns:** `FrameLocator`

### nth

**Added in:** v1.17

> **Deprecated:** Use `locator.nth()` followed by `locator.contentFrame()` instead.

Returns locator to the n-th matching frame. It's zero based, `nth(0)` selects the first frame.

```ts
frameLocator.nth(index);
```

**Arguments:**

- `index` number

**Returns:** `FrameLocator`
