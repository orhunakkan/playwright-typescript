# 🎯 Playwright — Locators

> **Source:** [playwright.dev/docs/locators](https://playwright.dev/docs/locators)

---

## 📖 Introduction

**Locators** are the central piece of Playwright's auto-waiting and retry-ability. In a nutshell, locators represent a way to find element(s) on the page at any moment.

---

## 🗺️ Quick Guide

These are the recommended built-in locators:

- `page.getByRole()` — locate by explicit and implicit accessibility attributes
- `page.getByText()` — locate by text content
- `page.getByLabel()` — locate a form control by associated label's text
- `page.getByPlaceholder()` — locate an input by placeholder
- `page.getByAltText()` — locate an element, usually image, by its text alternative
- `page.getByTitle()` — locate an element by its title attribute
- `page.getByTestId()` — locate an element based on its `data-testid` attribute (other attributes can be configured)

```ts
await page.getByLabel('User Name').fill('John');
await page.getByLabel('Password').fill('secret-password');
await page.getByRole('button', { name: 'Sign in' }).click();
await expect(page.getByText('Welcome, John!')).toBeVisible();
```

---

## 🔍 Locating elements

Playwright comes with multiple built-in locators. To make tests resilient, we recommend prioritizing user-facing attributes and explicit contracts such as `page.getByRole()`.

For example, consider the following DOM structure:

```html
<button>Sign in</button>
```

Locate the element by its role of button with name "Sign in":

```ts
await page.getByRole('button', { name: 'Sign in' }).click();
```

> **Note:** Use the code generator to generate a locator, and then edit it as you'd like.

Every time a locator is used for an action, an up-to-date DOM element is located in the page. In the snippet below, the underlying DOM element will be located twice, once prior to every action. This means that if the DOM changes in between the calls due to re-render, the new element corresponding to the locator will be used.

```ts
const locator = page.getByRole('button', { name: 'Sign in' });
await locator.hover();
await locator.click();
```

Note that all methods that create a locator, such as `page.getByLabel()`, are also available on the `Locator` and `FrameLocator` classes, so you can chain them and iteratively narrow down your locator.

```ts
const locator = page.frameLocator('#my-frame').getByRole('button', { name: 'Sign in' });
await locator.click();
```

---

## 🎭 Locate by role

The `page.getByRole()` locator reflects how users and assistive technology perceive the page, for example whether some element is a button or a checkbox. When locating by role, you should usually pass the accessible name as well, so that the locator pinpoints the exact element.

For example, consider the following DOM structure:

```html
<h3>Sign up</h3>
<label> <input type="checkbox" /> Subscribe </label>
<br />
<button>Submit</button>
```

You can locate each element by its implicit role:

```ts
await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();
await page.getByRole('checkbox', { name: 'Subscribe' }).check();
await page.getByRole('button', { name: /submit/i }).click();
```

Role locators include buttons, checkboxes, headings, links, lists, tables, and many more and follow W3C specifications for ARIA role, ARIA attributes and accessible name. Note that many html elements like `<button>` have an implicitly defined role that is recognized by the role locator.

> **Note:** Role locators do not replace accessibility audits and conformance tests, but rather give early feedback about the ARIA guidelines.

> **Note:** We recommend prioritizing role locators to locate elements, as it is the closest way to how users and assistive technology perceive the page.

---

## 🏷️ Locate by label

Most form controls usually have dedicated labels that could be conveniently used to interact with the form. In this case, you can locate the control by its associated label using `page.getByLabel()`.

For example, consider the following DOM structure:

```html
<label>Password <input type="password" /></label>
```

You can fill the input after locating it by the label text:

```ts
await page.getByLabel('Password').fill('secret');
```

> **Note:** Use this locator when locating form fields.

---

## 📝 Locate by placeholder

Inputs may have a `placeholder` attribute to hint to the user what value should be entered. You can locate such an input using `page.getByPlaceholder()`.

For example, consider the following DOM structure:

```html
<input type="email" placeholder="name@example.com" />
```

You can fill the input after locating it by the placeholder text:

```ts
await page.getByPlaceholder('name@example.com').fill('playwright@microsoft.com');
```

> **Note:** Use this locator when locating form elements that do not have labels but do have placeholder texts.

---

## 📄 Locate by text

Find an element by the text it contains. You can match by a substring, exact string, or a regular expression when using `page.getByText()`.

For example, consider the following DOM structure:

```html
<span>Welcome, John</span>
```

You can locate the element by the text it contains:

```ts
await expect(page.getByText('Welcome, John')).toBeVisible();
```

Set an exact match:

```ts
await expect(page.getByText('Welcome, John', { exact: true })).toBeVisible();
```

Match with a regular expression:

```ts
await expect(page.getByText(/welcome, [A-Za-z]+$/i)).toBeVisible();
```

> **Note:** Matching by text always normalizes whitespace, even with exact match. For example, it turns multiple spaces into one, turns line breaks into spaces and ignores leading and trailing whitespace.

> **Note:** We recommend using text locators to find non interactive elements like `div`, `span`, `p`, etc. For interactive elements like `button`, `a`, `input`, etc. use role locators. You can also filter by text which can be useful when trying to find a particular item in a list.

---

## 🖼️ Locate by alt text

All images should have an `alt` attribute that describes the image. You can locate an image based on the text alternative using `page.getByAltText()`.

For example, consider the following DOM structure:

```html
<img alt="playwright logo" src="/img/playwright-logo.svg" width="100" />
```

You can click on the image after locating it by the text alternative:

```ts
await page.getByAltText('playwright logo').click();
```

> **Note:** Use this locator when your element supports alt text such as `img` and `area` elements.

---

## 📌 Locate by title

Locate an element with a matching `title` attribute using `page.getByTitle()`.

For example, consider the following DOM structure:

```html
<span title="Issues count">25 issues</span>
```

You can check the issues count after locating it by the title text:

```ts
await expect(page.getByTitle('Issues count')).toHaveText('25 issues');
```

> **Note:** Use this locator when your element has the `title` attribute.

---

## 🔖 Locate by test id

Testing by test ids is the most resilient way of testing as even if your text or role of the attribute changes, the test will still pass. QA's and developers should define explicit test ids and query them with `page.getByTestId()`. However testing by test ids is not user facing. If the role or text value is important to you then consider using user facing locators such as role and text locators.

For example, consider the following DOM structure:

```html
<button data-testid="directions">Itinéraire</button>
```

You can locate the element by its test id:

```ts
await page.getByTestId('directions').click();
```

> **Note:** You can also use test ids when you choose to use the test id methodology or when you can't locate by role or text.

### Set a custom test id attribute

By default, `page.getByTestId()` will locate elements based on the `data-testid` attribute, but you can configure it in your test config or by calling `selectors.setTestIdAttribute()`. Set the test id to use a custom data attribute for your tests.

`playwright.config.ts`

```ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: {
    testIdAttribute: 'data-pw',
  },
});
```

In your html you can now use `data-pw` as your test id instead of the default `data-testid`:

```html
<button data-pw="directions">Itinéraire</button>
```

And then locate the element as you would normally do:

```ts
await page.getByTestId('directions').click();
```

---

## 🔗 Locate by CSS or XPath

If you absolutely must use CSS or XPath locators, you can use `page.locator()` to create a locator that takes a selector describing how to find an element in the page. Playwright supports CSS and XPath selectors, and auto-detects them if you omit the `css=` or `xpath=` prefix.

```ts
await page.locator('css=button').click();
await page.locator('xpath=//button').click();
await page.locator('button').click();
await page.locator('//button').click();
```

XPath and CSS selectors can be tied to the DOM structure or implementation. These selectors can break when the DOM structure changes. Long CSS or XPath chains below are an example of a bad practice that leads to unstable tests:

```ts
await page.locator('#tsf > div:nth-child(2) > div.A8SBwf > div.RNNXgb > div > div.a4bIc > input').click();
await page.locator('//*[@id="tsf"]/div[2]/div[1]/div[1]/div/div[2]/input').click();
```

> **Note:** CSS and XPath are not recommended as the DOM can often change leading to non resilient tests. Instead, try to come up with a locator that is close to how the user perceives the page such as role locators or define an explicit testing contract using test ids.

---

## 🌑 Locate in Shadow DOM

All locators in Playwright by default work with elements in Shadow DOM. The exceptions are:

- Locating by XPath does not pierce shadow roots.
- Closed-mode shadow roots are not supported.

Consider the following example with a custom web component:

```html
<x-details role="button" aria-expanded="true" aria-controls="inner-details">
  <div>Title</div>
  #shadow-root
  <div id="inner-details">Details</div>
</x-details>
```

You can locate in the same way as if the shadow root was not present at all. To click `<div>Details</div>`:

```ts
await page.getByText('Details').click();
```

To click `<x-details>`:

```ts
await page.locator('x-details', { hasText: 'Details' }).click();
```

To ensure that `<x-details>` contains the text "Details":

```ts
await expect(page.locator('x-details')).toContainText('Details');
```

---

## 🔎 Filtering Locators

Consider the following DOM structure where we want to click on the buy button of the second product card:

```html
<ul>
  <li>
    <h3>Product 1</h3>
    <button>Add to cart</button>
  </li>
  <li>
    <h3>Product 2</h3>
    <button>Add to cart</button>
  </li>
</ul>
```

### Filter by text

Locators can be filtered by text with the `locator.filter()` method. It will search for a particular string somewhere inside the element, possibly in a descendant element, case-insensitively. You can also pass a regular expression.

```ts
await page.getByRole('listitem').filter({ hasText: 'Product 2' }).getByRole('button', { name: 'Add to cart' }).click();
```

Use a regular expression:

```ts
await page
  .getByRole('listitem')
  .filter({ hasText: /Product 2/ })
  .getByRole('button', { name: 'Add to cart' })
  .click();
```

### Filter by not having text

Alternatively, filter by not having text:

```ts
// 5 in-stock items
await expect(page.getByRole('listitem').filter({ hasNotText: 'Out of stock' })).toHaveCount(5);
```

### Filter by child/descendant

Locators support an option to only select elements that have or have not a descendant matching another locator. You can therefore filter by any other locator such as a `locator.getByRole()`, `locator.getByTestId()`, `locator.getByText()` etc.

```ts
await page
  .getByRole('listitem')
  .filter({ has: page.getByRole('heading', { name: 'Product 2' }) })
  .getByRole('button', { name: 'Add to cart' })
  .click();
```

We can also assert the product card to make sure there is only one:

```ts
await expect(page.getByRole('listitem').filter({ has: page.getByRole('heading', { name: 'Product 2' }) })).toHaveCount(1);
```

The filtering locator must be relative to the original locator and is queried starting with the original locator match, not the document root. Therefore, the following will not work, because the filtering locator starts matching from the `<ul>` list element that is outside of the `<li>` list item matched by the original locator:

```ts
// ✖ WRONG
await expect(page.getByRole('listitem').filter({ has: page.getByRole('list').getByText('Product 2') })).toHaveCount(1);
```

### Filter by not having child/descendant

We can also filter by not having a matching element inside.

```ts
await expect(page.getByRole('listitem').filter({ hasNot: page.getByText('Product 2') })).toHaveCount(1);
```

Note that the inner locator is matched starting from the outer one, not from the document root.

---

## ⚙️ Locator operators

### Matching inside a locator

You can chain methods that create a locator, like `page.getByText()` or `locator.getByRole()`, to narrow down the search to a particular part of the page.

In this example we first create a locator called `product` by locating its role of `listitem`. We then filter by text. We can use the product locator again to get by role of button and click it and then use an assertion to make sure there is only one product with the text "Product 2".

```ts
const product = page.getByRole('listitem').filter({ hasText: 'Product 2' });
await product.getByRole('button', { name: 'Add to cart' }).click();
await expect(product).toHaveCount(1);
```

You can also chain two locators together, for example to find a "Save" button inside a particular dialog:

```ts
const saveButton = page.getByRole('button', { name: 'Save' });
// ...
const dialog = page.getByTestId('settings-dialog');
await dialog.locator(saveButton).click();
```

### Matching two locators simultaneously

Method `locator.and()` narrows down an existing locator by matching an additional locator. For example, you can combine `page.getByRole()` and `page.getByTitle()` to match by both role and title.

```ts
const button = page.getByRole('button').and(page.getByTitle('Subscribe'));
```

### Matching one of the two alternative locators

If you'd like to target one of the two or more elements, and you don't know which one it will be, use `locator.or()` to create a locator that matches any one or both of the alternatives.

For example, consider a scenario where you'd like to click on a "New email" button, but sometimes a security settings dialog shows up instead. In this case, you can wait for either a "New email" button, or a dialog and act accordingly.

> **Note:** If both "New email" button and security dialog appear on screen, the "or" locator will match both of them, possibly throwing the "strict mode violation" error. In this case, you can use `locator.first()` to only match one of them.

```ts
const newEmail = page.getByRole('button', { name: 'New' });
const dialog = page.getByText('Confirm security settings');
await expect(newEmail.or(dialog).first()).toBeVisible();
if (await dialog.isVisible()) await page.getByRole('button', { name: 'Dismiss' }).click();
await newEmail.click();
```

### Matching only visible elements

> **Note:** It's usually better to find a more reliable way to uniquely identify the element instead of checking the visibility.

Consider a page with two buttons, the first invisible and the second visible.

```html
<button style="display: none">Invisible</button> <button>Visible</button>
```

This will find both buttons and throw a strictness violation error:

```ts
await page.locator('button').click();
```

This will only find a second button, because it is visible, and then click it:

```ts
await page.locator('button').filter({ visible: true }).click();
```

---

## 📋 Lists

### Count items in a list

You can assert locators in order to count the items in a list. For example, consider the following DOM structure:

```html
<ul>
  <li>apple</li>
  <li>banana</li>
  <li>orange</li>
</ul>
```

Use the count assertion to ensure that the list has 3 items:

```ts
await expect(page.getByRole('listitem')).toHaveCount(3);
```

### Assert all text in a list

You can assert locators in order to find all the text in a list. For example, consider the following DOM structure:

```html
<ul>
  <li>apple</li>
  <li>banana</li>
  <li>orange</li>
</ul>
```

Use `expect(locator).toHaveText()` to ensure that the list has the text "apple", "banana" and "orange":

```ts
await expect(page.getByRole('listitem')).toHaveText(['apple', 'banana', 'orange']);
```

### Get a specific item

There are many ways to get a specific item in a list.

#### Get by text

Use the `page.getByText()` method to locate an element in a list by its text content and then click on it. For example, consider the following DOM structure:

```html
<ul>
  <li>apple</li>
  <li>banana</li>
  <li>orange</li>
</ul>
```

Locate an item by its text content and click it:

```ts
await page.getByText('orange').click();
```

#### Filter by text

Use the `locator.filter()` to locate a specific item in a list. For example, consider the following DOM structure:

```html
<ul>
  <li>apple</li>
  <li>banana</li>
  <li>orange</li>
</ul>
```

Locate an item by the role of "listitem" and then filter by the text of "orange" and then click it:

```ts
await page.getByRole('listitem').filter({ hasText: 'orange' }).click();
```

#### Get by test id

Use the `page.getByTestId()` method to locate an element in a list. You may need to modify the html and add a test id if you don't already have a test id. For example, consider the following DOM structure:

```html
<ul>
  <li data-testid="apple">apple</li>
  <li data-testid="banana">banana</li>
  <li data-testid="orange">orange</li>
</ul>
```

Locate an item by its test id of "orange" and then click it:

```ts
await page.getByTestId('orange').click();
```

#### Get by nth item

If you have a list of identical elements, and the only way to distinguish between them is the order, you can choose a specific element from a list with `locator.first()`, `locator.last()` or `locator.nth()`.

```ts
const banana = await page.getByRole('listitem').nth(1);
```

However, use this method with caution. Often times, the page might change, and the locator will point to a completely different element from the one you expected. Instead, try to come up with a unique locator that will pass the strictness criteria.

### Chaining filters

When you have elements with various similarities, you can use the `locator.filter()` method to select the right one. You can also chain multiple filters to narrow down the selection.

For example, consider the following DOM structure:

```html
<ul>
  <li>
    <div>John</div>
    <div><button>Say hello</button></div>
  </li>
  <li>
    <div>Mary</div>
    <div><button>Say hello</button></div>
  </li>
  <li>
    <div>John</div>
    <div><button>Say goodbye</button></div>
  </li>
  <li>
    <div>Mary</div>
    <div><button>Say goodbye</button></div>
  </li>
</ul>
```

To take a screenshot of the row with "Mary" and "Say goodbye":

```ts
const rowLocator = page.getByRole('listitem');
await rowLocator
  .filter({ hasText: 'Mary' })
  .filter({ has: page.getByRole('button', { name: 'Say goodbye' }) })
  .screenshot({ path: 'screenshot.png' });
```

You should now have a "screenshot.png" file in your project's root directory.

---

## 🔄 Rare use cases

### Do something with each element in the list

Iterate elements:

```ts
for (const row of await page.getByRole('listitem').all()) console.log(await row.textContent());
```

Iterate using regular for loop:

```ts
const rows = page.getByRole('listitem');
const count = await rows.count();
for (let i = 0; i < count; ++i) console.log(await rows.nth(i).textContent());
```

### Evaluate in the page

The code inside `locator.evaluateAll()` runs in the page, you can call any DOM apis there.

```ts
const rows = page.getByRole('listitem');
const texts = await rows.evaluateAll((list) => list.map((element) => element.textContent));
```

---

## ⚡ Strictness

**Locators are strict.** This means that all operations on locators that imply some target DOM element will throw an exception if more than one element matches.

For example, the following call throws if there are several buttons in the DOM:

```ts
await page.getByRole('button').click();
```

On the other hand, Playwright understands when you perform a multiple-element operation, so the following call works perfectly fine when the locator resolves to multiple elements:

```ts
await page.getByRole('button').count();
```

You can explicitly opt-out from strictness check by telling Playwright which element to use when multiple elements match, through `locator.first()`, `locator.last()`, and `locator.nth()`. These methods are not recommended because when your page changes, Playwright may click on an element you did not intend. Instead, follow best practices above to create a locator that uniquely identifies the target element.

---

## 🗂️ Quick Reference

| Locator Method              | When to Use                                         |
| --------------------------- | --------------------------------------------------- |
| `page.getByRole()`          | Locate by ARIA role and accessible name (preferred) |
| `page.getByText()`          | Locate non-interactive elements by text content     |
| `page.getByLabel()`         | Locate form controls by associated label            |
| `page.getByPlaceholder()`   | Locate inputs by placeholder text                   |
| `page.getByAltText()`       | Locate images by alt text                           |
| `page.getByTitle()`         | Locate elements by title attribute                  |
| `page.getByTestId()`        | Locate elements by `data-testid` attribute          |
| `page.locator('css=...')`   | CSS selector (use only when necessary)              |
| `page.locator('xpath=...')` | XPath selector (use only when necessary)            |

---

## 🔗 More Locators

For less commonly used locators, look at the other locators guide.
