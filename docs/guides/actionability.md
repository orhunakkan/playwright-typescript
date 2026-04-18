# ⚡ Playwright — Auto-waiting

> **Source:** [playwright.dev/docs/actionability](https://playwright.dev/docs/actionability)

---

## Introduction

Playwright performs a range of actionability checks on the elements before making actions to ensure these actions behave as expected. It auto-waits for all the relevant checks to pass and only then performs the requested action. If the required checks do not pass within the given timeout, action fails with the `TimeoutError`.

For example, for `locator.click()`, Playwright will ensure that:

- locator resolves to exactly one element
- element is **Visible**
- element is **Stable**, as in not animating or completed animation
- element **Receives Events**, as in not obscured by other elements
- element is **Enabled**

Here is the complete list of actionability checks performed for each action:

| Action                             | Visible | Stable | Receives Events | Enabled | Editable |
| ---------------------------------- | ------- | ------ | --------------- | ------- | -------- |
| `locator.check()`                  | Yes     | Yes    | Yes             | Yes     | -        |
| `locator.click()`                  | Yes     | Yes    | Yes             | Yes     | -        |
| `locator.dblclick()`               | Yes     | Yes    | Yes             | Yes     | -        |
| `locator.setChecked()`             | Yes     | Yes    | Yes             | Yes     | -        |
| `locator.tap()`                    | Yes     | Yes    | Yes             | Yes     | -        |
| `locator.uncheck()`                | Yes     | Yes    | Yes             | Yes     | -        |
| `locator.hover()`                  | Yes     | Yes    | Yes             | -       | -        |
| `locator.dragTo()`                 | Yes     | Yes    | Yes             | -       | -        |
| `locator.screenshot()`             | Yes     | Yes    | -               | -       | -        |
| `locator.fill()`                   | Yes     | -      | -               | Yes     | Yes      |
| `locator.clear()`                  | Yes     | -      | -               | Yes     | Yes      |
| `locator.selectOption()`           | Yes     | -      | -               | Yes     | -        |
| `locator.selectText()`             | Yes     | -      | -               | -       | -        |
| `locator.scrollIntoViewIfNeeded()` | -       | Yes    | -               | -       | -        |
| `locator.blur()`                   | -       | -      | -               | -       | -        |
| `locator.dispatchEvent()`          | -       | -      | -               | -       | -        |
| `locator.focus()`                  | -       | -      | -               | -       | -        |
| `locator.press()`                  | -       | -      | -               | -       | -        |
| `locator.pressSequentially()`      | -       | -      | -               | -       | -        |
| `locator.setInputFiles()`          | -       | -      | -               | -       | -        |

---

## Forcing actions

Some actions like `locator.click()` support `force` option that disables non-essential actionability checks, for example passing truthy `force` to `locator.click()` method will not check that the target element actually receives click events.

---

## Assertions

Playwright includes auto-retrying assertions that remove flakiness by waiting until the condition is met, similarly to auto-waiting before actions.

| Assertion                            | Description                       |
| ------------------------------------ | --------------------------------- |
| `expect(locator).toBeAttached()`     | Element is attached               |
| `expect(locator).toBeChecked()`      | Checkbox is checked               |
| `expect(locator).toBeDisabled()`     | Element is disabled               |
| `expect(locator).toBeEditable()`     | Element is editable               |
| `expect(locator).toBeEmpty()`        | Container is empty                |
| `expect(locator).toBeEnabled()`      | Element is enabled                |
| `expect(locator).toBeFocused()`      | Element is focused                |
| `expect(locator).toBeHidden()`       | Element is not visible            |
| `expect(locator).toBeInViewport()`   | Element intersects viewport       |
| `expect(locator).toBeVisible()`      | Element is visible                |
| `expect(locator).toContainText()`    | Element contains text             |
| `expect(locator).toHaveAttribute()`  | Element has a DOM attribute       |
| `expect(locator).toHaveClass()`      | Element has a class property      |
| `expect(locator).toHaveCount()`      | List has exact number of children |
| `expect(locator).toHaveCSS()`        | Element has CSS property          |
| `expect(locator).toHaveId()`         | Element has an ID                 |
| `expect(locator).toHaveJSProperty()` | Element has a JavaScript property |
| `expect(locator).toHaveText()`       | Element matches text              |
| `expect(locator).toHaveValue()`      | Input has a value                 |
| `expect(locator).toHaveValues()`     | Select has options selected       |
| `expect(page).toHaveTitle()`         | Page has a title                  |
| `expect(page).toHaveURL()`           | Page has a URL                    |
| `expect(response).toBeOK()`          | Response has an OK status         |

Learn more in the [assertions guide](https://playwright.dev/docs/test-assertions).

---

## Visible

Element is considered visible when it has non-empty bounding box and does not have `visibility:hidden` computed style.

Note that according to this definition:

- Elements of zero size are **not considered visible**.
- Elements with `display:none` are **not considered visible**.
- Elements with `opacity:0` **are considered visible**.

---

## Stable

Element is considered stable when it has maintained the same bounding box for at least two consecutive animation frames.

---

## Enabled

Element is considered enabled when it is not disabled. Element is disabled when:

- it is a `<button>`, `<select>`, `<input>`, `<textarea>`, `<option>` or `<optgroup>` with a `[disabled]` attribute;
- it is a `<button>`, `<select>`, `<input>`, `<textarea>`, `<option>` or `<optgroup>` that is a part of a `<fieldset>` with a `[disabled]` attribute;
- it is a descendant of an element with `[aria-disabled=true]` attribute.

---

## Editable

Element is considered editable when it is enabled and is not readonly. Element is readonly when:

- it is a `<select>`, `<input>` or `<textarea>` with a `[readonly]` attribute;
- it has an `[aria-readonly=true]` attribute and an aria role that supports it.

---

## Receives Events

Element is considered receiving pointer events when it is the hit target of the pointer event at the action point. For example, when clicking at the point `(10;10)`, Playwright checks whether some other element (usually an overlay) will instead capture the click at `(10;10)`.

For example, consider a scenario where Playwright will click **Sign Up** button regardless of when the `locator.click()` call was made:

- page is checking that user name is unique and **Sign Up** button is disabled;
- after checking with the server, the disabled **Sign Up** button is replaced with another one that is now enabled.
