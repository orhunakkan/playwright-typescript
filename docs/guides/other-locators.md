# 🔍 Playwright — Other Locators

> **Source:** [playwright.dev/docs/other-locators](https://playwright.dev/docs/other-locators)

---

## Introduction

> **Note:** Check out the main locators guide for most common and recommended locators.

In addition to recommended locators like `page.getByRole()` and `page.getByText()`, Playwright supports a variety of other locators described in this guide.

---

## CSS locator

> **Note:** We recommend prioritizing user-visible locators like text or accessible role instead of using CSS that is tied to the implementation and could break when the page changes.

Playwright can locate an element by CSS selector.

```ts
await page.locator('css=button').click();
```

Playwright augments standard CSS selectors in two ways:

- CSS selectors pierce open shadow DOM.
- Playwright adds custom pseudo-classes like `:visible`, `:has-text()`, `:has()`, `:is()`, `:nth-match()` and more.

### CSS: matching by text

Playwright includes a number of CSS pseudo-classes to match elements by their text content.

- `article:has-text("Playwright")` — the `:has-text()` matches any element containing specified text somewhere inside, possibly in a child or a descendant element. Matching is case-insensitive, trims whitespace and searches for a substring.

  > **Note:** `:has-text()` should be used together with other CSS specifiers, otherwise it will match all the elements containing specified text, including the `<body>`.

  ```ts
  // Wrong, will match many elements including <body>
  await page.locator(':has-text("Playwright")').click();
  // Correct, only matches the <article> element
  await page.locator('article:has-text("Playwright")').click();
  ```

- `#nav-bar :text("Home")` — the `:text()` pseudo-class matches the smallest element containing specified text. Matching is case-insensitive, trims whitespace and searches for a substring.

  ```ts
  await page.locator('#nav-bar :text("Home")').click();
  ```

- `#nav-bar :text-is("Home")` — the `:text-is()` pseudo-class matches the smallest element with exact text. Exact matching is case-sensitive, trims whitespace and searches for the full string.

- `#nav-bar :text-matches("reg?ex", "i")` — the `:text-matches()` pseudo-class matches the smallest element with text content matching a JavaScript-like regex.

> **Note:** Text matching always normalizes whitespace — it turns multiple spaces into one, turns line breaks into spaces and ignores leading and trailing whitespace.

> **Note:** Input elements of type `button` and `submit` are matched by their `value` instead of text content. For example, `:text("Log in")` matches `<input type=button value="Log in">`.

### CSS: matching only visible elements

Playwright supports the `:visible` pseudo class in CSS selectors. For example, `css=button` matches all the buttons on the page, while `css=button:visible` only matches visible buttons.

```ts
// Finds both buttons and throws a strictness violation error:
await page.locator('button').click();

// Only finds the visible button and clicks it:
await page.locator('button:visible').click();
```

### CSS: elements that contain other elements

The `:has()` pseudo-class returns an element if any of the selectors passed as parameters match at least one element inside it.

```ts
// Returns text content of an <article> that has a <div class=promo> inside.
await page.locator('article:has(div.promo)').textContent();
```

### CSS: elements matching one of the conditions

Comma-separated list of CSS selectors will match all elements that can be selected by one of the selectors in that list.

```ts
// Clicks a <button> that has either a "Log in" or "Sign in" text.
await page.locator('button:has-text("Log in"), button:has-text("Sign in")').click();
```

The `:is()` pseudo-class may be useful for specifying a list of extra conditions on an element.

### CSS: matching elements based on layout

> **Warning:** Layout selectors are deprecated and may be removed in the future. Matching based on layout may produce unexpected results. For example, a different element could be matched when layout changes by one pixel. We recommend prioritizing user-visible locators instead.

In this case, using Playwright layout CSS pseudo-classes could help. These can be combined with regular CSS to pinpoint one of the multiple choices. For example, `input:right-of(:text("Password"))` matches an input field that is to the right of text "Password".

Layout pseudo-classes use bounding client rect to compute distance and relative position of the elements:

- `:right-of(div > button)` — Matches elements that are to the right of any element matching the inner selector, at any vertical position.
- `:left-of(div > button)` — Matches elements that are to the left of any element matching the inner selector, at any vertical position.
- `:above(div > button)` — Matches elements that are above any of the elements matching the inner selector, at any horizontal position.
- `:below(div > button)` — Matches elements that are below any of the elements matching the inner selector, at any horizontal position.
- `:near(div > button)` — Matches elements that are near (within 50 CSS pixels) any of the elements matching the inner selector.

```ts
// Fill an input to the right of "Username".
await page.locator('input:right-of(:text("Username"))').fill('value');
// Click a button near the promo card.
await page.locator('button:near(.promo-card)').click();
// Click the radio input in the list closest to the "Label 3".
await page.locator('[type=radio]:left-of(:text("Label 3"))').first().click();
```

All layout pseudo-classes support an optional maximum pixel distance as the last argument. For example `button:near(:text("Username"), 120)` matches a button that is at most 120 CSS pixels away from the element with the text "Username".

### CSS: pick n-th match from the query result

> **Note:** It is usually possible to distinguish elements by some attribute or text content, which is more resilient to page changes.

Sometimes page contains a number of similar elements, and it is hard to select a particular one. In this case, `:nth-match(:text("Buy"), 3)` will select the third button. Note that index is one-based.

```ts
// Click the third "Buy" button
await page.locator(':nth-match(:text("Buy"), 3)').click();
```

`:nth-match()` is also useful to wait until a specified number of elements appear, using `locator.waitFor()`.

```ts
// Wait until all three buttons are visible
await page.locator(':nth-match(:text("Buy"), 3)').waitFor();
```

> **Note:** Unlike `:nth-child()`, elements do not have to be siblings — they could be anywhere on the page.

---

## N-th element locator

You can narrow down query to the n-th match using the `nth=` locator passing a zero-based index.

```ts
// Click first button
await page.locator('button').locator('nth=0').click();
// Click last button
await page.locator('button').locator('nth=-1').click();
```

---

## Parent element locator

When you need to target a parent element of some other element, most of the time you should use `locator.filter()` by the child locator. For example, consider the following DOM structure:

```html
<li><label>Hello</label></li>
<li><label>World</label></li>
```

If you'd like to target the parent `<li>` of a label with text "Hello", using `locator.filter()` works best:

```ts
const child = page.getByText('Hello');
const parent = page.getByRole('listitem').filter({ has: child });
```

Alternatively, if you cannot find a suitable locator for the parent element, use `xpath=..`. Note that this method is not as reliable, because any changes to the DOM structure will break your tests. Prefer `locator.filter()` when possible.

```ts
const parent = page.getByText('Hello').locator('xpath=..');
```

---

## XPath locator

> **Warning:** We recommend prioritizing user-visible locators like text or accessible role instead of using XPath that is tied to the implementation and easily breaks when the page changes.

XPath locators are equivalent to calling `Document.evaluate`.

```ts
await page.locator('xpath=//button').click();
```

> **Note:** Any selector string starting with `//` or `..` is assumed to be an XPath selector. For example, Playwright converts `'//html/body'` to `'xpath=//html/body'`.

> **Note:** XPath does not pierce shadow roots.

### XPath union

Pipe operator (`|`) can be used to specify multiple selectors in XPath. It will match all elements that can be selected by one of the selectors in that list.

```ts
// Waits for either confirmation dialog or load spinner.
await page.locator(`//span[contains(@class, 'spinner__loading')]|//div[@id='confirmation']`).waitFor();
```

---

## Label to form control retargeting

> **Warning:** We recommend locating by label text instead of relying on label-to-control retargeting.

Targeted input actions in Playwright automatically distinguish between labels and controls, so you can target the label to perform an action on the associated control. For example, consider:

```html
<label for="password">Password:</label> <input id="password" type="password" />
```

The following actions will be performed on the input instead of the label when you target the label:

- `locator.click()` will click the label and automatically focus the input field
- `locator.fill()` will fill the input field
- `locator.inputValue()` will return the value of the input field
- `locator.selectText()` will select text in the input field
- `locator.setInputFiles()` will set files for the input field with `type=file`
- `locator.selectOption()` will select an option from the select box

```ts
// Fill the input by targeting the label.
await page.getByText('Password').fill('secret');
```

However, other methods will target the label itself:

```ts
// Asserts text content of the label, not the input field.
await expect(page.locator('label')).toHaveText('Password');
```

---

## Legacy text locator

> **Warning:** We recommend the modern text locator instead.

Legacy text locator matches elements that contain passed text.

```ts
await page.locator('text=Log in').click();
```

Legacy text locator has a few variations:

- `text=Log in` — default matching is case-insensitive, trims whitespace and searches for a substring. For example, `text=Log` matches `<button>Log in</button>`.
- `text="Log in"` — text body can be escaped with single or double quotes to search for a text node with exact content after trimming whitespace. This exact mode implies case-sensitive matching.
- `/Log\s*in/i` — body can be a JavaScript-like regex wrapped in `/` symbols.

> **Note:** String selectors starting and ending with a quote (`"` or `'`) are assumed to be legacy text locators.

> **Note:** Matching always normalizes whitespace.

> **Note:** Input elements of type `button` and `submit` are matched by their `value` instead of text content.

---

## id, data-testid, data-test-id, data-test selectors

> **Warning:** We recommend locating by test id instead.

Playwright supports shorthand for selecting elements using certain attributes. Currently, only the following attributes are supported: `id`, `data-testid`, `data-test-id`, `data-test`.

```ts
// Fill an input with the id "username"
await page.locator('id=username').fill('value');
// Click an element with data-test-id "submit"
await page.locator('data-test-id=submit').click();
```

> **Note:** Attribute selectors are not CSS selectors, so anything CSS-specific like `:enabled` is not supported. For more features, use a proper CSS selector, e.g. `css=[data-test="login"]:enabled`.

---

## Chaining selectors

> **Warning:** We recommend chaining locators instead.

Selectors defined as `engine=body` or in short-form can be combined with the `>>` token. When selectors are chained, the next one is queried relative to the previous one's result.

For example, `css=article >> css=.bar > .baz >> css=span[attr=value]` is equivalent to:

```ts
document.querySelector('article').querySelector('.bar > .baz').querySelector('span[attr=value]');
```

If a selector needs to include `>>` in the body, it should be escaped inside a string: `text="some >> text"`.

---

## Intermediate matches

> **Warning:** We recommend filtering by another locator to locate elements that contain other elements.

By default, chained selectors resolve to an element queried by the last selector. A selector can be prefixed with `*` to capture elements that are queried by an intermediate selector. For example, `css=article >> text=Hello` captures the element with the text Hello, and `*css=article >> text=Hello` (note the `*`) captures the `article` element that contains some element with the text Hello.
