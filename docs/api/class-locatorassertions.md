# 📦 Playwright — LocatorAssertions

> **Source:** [playwright.dev/docs/api/class-locatorassertions](https://playwright.dev/docs/api/class-locatorassertions)

---

## Overview

The **LocatorAssertions** class provides assertion methods that can be used to make assertions about **Locator** state in tests.

```ts
import { test, expect } from '@playwright/test';

test('status becomes submitted', async ({ page }) => {
	// ...
	await page.getByRole('button').click();

	await expect(page.locator('.status')).toHaveText('Submitted');
});
```

## Methods

### toBeAttached

Added in: v1.33 locatorAssertions.toBeAttached Ensures that Locator points to an element that is connected to a Document or a ShadowRoot

await expect(page.getByText('Hidden text')).toBeAttached();

Arguments options Object (optional) attached boolean (optional)# timeout number (optional)# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## BeChecked

Added in: v1.20 locatorAssertions.toBeChecked Ensures the Locator points to a checked input

const locator = page.getByLabel('Subscribe to newsletter');
await expect(locator).toBeChecked();

Arguments options Object (optional) checked boolean (optional)

Added in: v1.18# Provides state to assert for. Asserts for input to be checked by default. This option can't be used when indeterminate is set to true. indeterminate boolean (optional)

Added in: v1.50# Asserts that the element is in the indeterminate (mixed) state. Only supported for checkboxes and radio buttons. This option can't be true when checked is provided. timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## BeDisabled

Added in: v1.20 locatorAssertions.toBeDisabled Ensures the Locator points to a disabled element. Element is disabled if it has "disabled" attribute or is disabled via 'aria-disabled'. Note that only native control elements such as HTML button, input, select, textarea, option, optgroup can be disabled by setting "disabled" attribute. "disabled" attribute on other elements is ignored by the browser

const locator = page.locator('button.submit');
await expect(locator).toBeDisabled();

Arguments options Object (optional) timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## BeEditable

Added in: v1.20 locatorAssertions.toBeEditable Ensures the Locator points to an editable element

const locator = page.getByRole('textbox');
await expect(locator).toBeEditable();

Arguments options Object (optional) editable boolean (optional)

Added in: v1.26# timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## BeEmpty

Added in: v1.20 locatorAssertions.toBeEmpty Ensures the Locator points to an empty editable element or to a DOM node that has no text

const locator = page.locator('div.warning');
await expect(locator).toBeEmpty();

Arguments options Object (optional) timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## BeEnabled

Added in: v1.20 locatorAssertions.toBeEnabled Ensures the Locator points to an enabled element

const locator = page.locator('button.submit');
await expect(locator).toBeEnabled();

Arguments options Object (optional) enabled boolean (optional)

Added in: v1.26# timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## BeFocused

Added in: v1.20 locatorAssertions.toBeFocused Ensures the Locator points to a focused DOM node

const locator = page.getByRole('textbox');
await expect(locator).toBeFocused();

Arguments options Object (optional) timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## BeHidden

Added in: v1.20 locatorAssertions.toBeHidden Ensures that Locator either does not resolve to any DOM node, or resolves to a non-visible one

const locator = page.locator('.my-element');
await expect(locator).toBeHidden();

Arguments options Object (optional) timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## BeInViewport

Added in: v1.31 locatorAssertions.toBeInViewport Ensures the Locator points to an element that intersects viewport, according to the intersection observer API

const locator = page.getByRole('button');// Make sure at least some part of element intersects viewport.await expect(locator).toBeInViewport();// Make sure element is fully outside of viewport.await expect(locator).not.toBeInViewport();// Make sure that at least half of the element intersects viewport.await expect(locator).toBeInViewport({ ratio: 0.5 });

Arguments options Object (optional) ratio number (optional)# The minimal ratio of the element to intersect viewport. If equals to 0, then element should intersect viewport at any positive ratio. Defaults to 0. timeout number (optional)# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## BeVisible

Added in: v1.20 locatorAssertions.toBeVisible Ensures that Locator points to an attached and visible DOM node. To check that at least one element from the list is visible, use locator.first()

// A specific element is visible.await expect(page.getByText('Welcome')).toBeVisible();// At least one item in the list is visible.await expect(page.getByTestId('todo-item').first()).toBeVisible();// At least one of the two elements is visible, possibly both.await expect( page.getByRole('button', { name: 'Sign in' }) .or(page.getByRole('button', { name: 'Sign up' })) .first()).toBeVisible();

Arguments options Object (optional) timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect. visible boolean (optional)

Added in: v1.26#

Returns Promise<void># to

## ContainClass

Added in: v1.52 locatorAssertions.toContainClass Ensures the Locator points to an element with given CSS classes. All classes from the asserted value, separated by spaces, must be present in the Element.classList in any order

 <div class='middle selected row' id='component'></div> const locator = page.locator('#component');
await expect(locator).toContainClass('middle selected row');
await expect(locator).toContainClass('selected');
await expect(locator).toContainClass('row middle');
When an array is passed, the method asserts that the list of elements located matches the corresponding list of expected class lists.

Each element's class attribute is matched against the corresponding class in the array: <div class='list'> <div class='component inactive'></div> <div class='component active'></div> <div class='component inactive'></div></div> const locator = page.locator('.list > .component');
await expect(locator).toContainClass(['inactive', 'active', 'inactive']);

Arguments expected string | Array<string># A string containing expected class names, separated by spaces, or a list of such strings to assert multiple elements.

options Object (optional) timeout number (optional)# Time to retry the assertion for in milliseconds.

Defaults to timeout in TestConfig.expect

Promise<void># to

## ContainText

Added in: v1.20 locatorAssertions.toContainText Ensures the Locator points to an element that contains the given text. All nested elements will be considered when computing the text content of the element. You can use regular expressions for the value as well

const locator = page.locator('.title');
await expect(locator).toContainText('substring');
await expect(locator).toContainText(/\d messages/);
If you pass an array as an expected value, the expectations are: Locator resolves to a list of elements.

Elements from a subset of this list contain text from the expected array, respectively.

The matching subset of elements has the same order as the expected array.

Each text value from the expected array is matched by some element from the list.

For example, consider the following list: <ul> <li>Item Text 1</li> <li>Item Text 2</li> <li>Item Text 3</li></ul> Let's see how we can use the assertion: // ✓ Contains the right items in the right orderawait expect(page.locator('ul > li')).toContainText(['Text 1', 'Text 3']);// ✖ Wrong orderawait expect(page.locator('ul > li')).toContainText(['Text 3', 'Text 2']);// ✖ No item contains this textawait expect(page.locator('ul > li')).toContainText(['Some 33']);// ✖ Locator points to the outer list element, not to the list itemsawait expect(page.locator('ul')).toContainText(['Text 3']);

Arguments expected string | RegExp | Array<string | RegExp>

Added in: v1.18# Expected substring or RegExp or a list of those.

options Object (optional) ignoreCase boolean (optional)

Added in: v1.23# Whether to perform case-insensitive match.

ignoreCase option takes precedence over the corresponding regular expression flag if specified.

timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds.

Defaults to timeout in TestConfig.expect.

useInnerText boolean (optional)

Added in: v1.18# Whether to use element.innerText instead of element.textContent when retrieving DOM node text

Promise<void>#

Details When expected parameter is a string, Playwright will normalize whitespaces and line breaks both in the actual text and in the expected string before matching. When regular expression is used, the actual text is matched as is. to

## HaveAccessibleDescription

Added in: v1.44 locatorAssertions.toHaveAccessibleDescription Ensures the Locator points to an element with a given accessible description

const locator = page.getByTestId('save-button');
await expect(locator).toHaveAccessibleDescription('Save results to disk');

Arguments description string | RegExp# Expected accessible description. options Object (optional) ignoreCase boolean (optional)# Whether to perform case-insensitive match. ignoreCase option takes precedence over the corresponding regular expression flag if specified. timeout number (optional)# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## HaveAccessibleErrorMessage

Added in: v1.50 locatorAssertions.toHaveAccessibleErrorMessage Ensures the Locator points to an element with a given aria errormessage

const locator = page.getByTestId('username-input');
await expect(locator).toHaveAccessibleErrorMessage('Username is required.');

Arguments errorMessage string | RegExp# Expected accessible error message. options Object (optional) ignoreCase boolean (optional)# Whether to perform case-insensitive match. ignoreCase option takes precedence over the corresponding regular expression flag if specified. timeout number (optional)# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## HaveAccessibleName

Added in: v1.44 locatorAssertions.toHaveAccessibleName Ensures the Locator points to an element with a given accessible name

const locator = page.getByTestId('save-button');
await expect(locator).toHaveAccessibleName('Save to disk');

Arguments name string | RegExp# Expected accessible name. options Object (optional) ignoreCase boolean (optional)# Whether to perform case-insensitive match. ignoreCase option takes precedence over the corresponding regular expression flag if specified. timeout number (optional)# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## HaveAttribute(name, value)

Added in: v1.20 locatorAssertions.toHaveAttribute(name, value) Ensures the Locator points to an element with given attribute

const locator = page.locator('input');
await expect(locator).toHaveAttribute('type', 'text');

Arguments name string

Added in: v1.18# Attribute name. value string | RegExp

Added in: v1.18# Expected attribute value. options Object (optional) ignoreCase boolean (optional)

Added in: v1.40# Whether to perform case-insensitive match. ignoreCase option takes precedence over the corresponding regular expression flag if specified. timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## HaveAttribute(name)

Added in: v1.39 locatorAssertions.toHaveAttribute(name) Ensures the Locator points to an element with given attribute. The method will assert attribute presence. const locator = page.locator('input');// Assert attribute existence.await expect(locator).toHaveAttribute('disabled');
await expect(locator).not.toHaveAttribute('open');

Usage await expect(locator).toHaveAttribute(name);
await expect(locator).toHaveAttribute(name, options);

Arguments name string# Attribute name. options Object (optional) timeout number (optional)# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## HaveClass

Added in: v1.20 locatorAssertions.toHaveClass Ensures the Locator points to an element with given CSS classes. When a string is provided, it must fully match the element's class attribute. To match individual classes use expect(locator).toContainClass()

 <div class='middle selected row' id='component'></div> const locator = page.locator('#component');
await expect(locator).toHaveClass('middle selected row');
await expect(locator).toHaveClass(/(^|\s)selected(\s|$)/);
When an array is passed, the method asserts that the list of elements located matches the corresponding list of expected class values.

Each element's class attribute is matched against the corresponding string or regular expression in the array: const locator = page.locator('.list > .component');
await expect(locator).toHaveClass(['component', 'component selected', 'component']);

Arguments expected string | RegExp | Array<string | RegExp>

Added in: v1.18# Expected class or RegExp or a list of those.

options Object (optional) timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds.

Defaults to timeout in TestConfig.expect

Promise<void># to

## HaveCount

Added in: v1.20 locatorAssertions.toHaveCount Ensures the Locator resolves to an exact number of DOM nodes

const list = page.locator('list > .component');
await expect(list).toHaveCount(3);

Arguments count number

Added in: v1.18# Expected count. options Object (optional) timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## HaveCSS

Added in: v1.20 locatorAssertions.toHaveCSS Ensures the Locator resolves to an element with the given computed CSS style

const locator = page.getByRole('button');
await expect(locator).toHaveCSS('display', 'flex');

Arguments name string

Added in: v1.18# CSS property name. value string | RegExp

Added in: v1.18# CSS property value. options Object (optional) timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## HaveId

Added in: v1.20 locatorAssertions.toHaveId Ensures the Locator points to an element with the given DOM Node ID

const locator = page.getByRole('textbox');
await expect(locator).toHaveId('lastname');

Arguments id string | RegExp

Added in: v1.18# Element id. options Object (optional) timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## HaveJSProperty

Added in: v1.20 locatorAssertions.toHaveJSProperty Ensures the Locator points to an element with given JavaScript property. Note that this property can be of a primitive type as well as a plain serializable JavaScript object

const locator = page.locator('.component');
await expect(locator).toHaveJSProperty('loaded', true);

Arguments name string

Added in: v1.18# Property name. value Object

Added in: v1.18# Property value. options Object (optional) timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## HaveRole

Added in: v1.44 locatorAssertions.toHaveRole Ensures the Locator points to an element with a given ARIA role. Note that role is matched as a string, disregarding the ARIA role hierarchy. For example, asserting a superclass role "checkbox" on an element with a subclass role "switch" will fail

const locator = page.getByTestId('save-button');
await expect(locator).toHaveRole('button');

Arguments

role
"alert" | "alertdialog" | "application" | "article" | "banner" | "blockquote" | "button" | "caption" | "cell" | "checkbox" | "code" | "columnheader" | "combobox" | "complementary" | "contentinfo" | "definition" | "deletion" | "dialog" | "directory" | "document" | "emphasis" | "feed" | "figure" | "form" | "generic" | "grid" | "gridcell" | "group" | "heading" | "img" | "insertion" | "link" | "list" | "listbox" | "listitem" | "log" | "main" | "marquee" | "math" | "meter" | "menu" | "menubar" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "navigation" | "none" | "note" | "option" | "paragraph" | "presentation" |
"progressbar" | "radio" | "radiogroup" | "region" | "row" | "rowgroup" | "rowheader" | "scrollbar" | "search" | "searchbox" | "separator" | "slider" | "spinbutton" | "status" | "strong" | "subscript" | "superscript" | "switch" | "tab" | "table" | "tablist" | "tabpanel" | "term" | "textbox" | "time" | "timer" | "toolbar" | "tooltip" | "tree" | "treegrid" | "treeitem"
# Required aria role.

options Object (optional) timeout number (optional)# Time to retry the assertion for in milliseconds.

Defaults to timeout in TestConfig.expect

Promise<void># to

## HaveScreenshot(name)

Added in: v1.23 locatorAssertions.toHaveScreenshot(name) This function will wait until two consecutive locator screenshots yield the same result, and then compare the last screenshot with the expectation

const locator = page.getByRole('button');
await expect(locator).toHaveScreenshot('image.png'); Note that screenshot assertions only work with Playwright test runner

name string | Array<string># Snapshot name.

options Object (optional) animations "disabled" | "allow" (optional)# When set to "disabled", stops CSS animations, CSS transitions and Web Animations.

Animations get different treatment depending on their duration: finite animations are fast-forwarded to completion, so they'll fire transitionend event.

infinite animations are canceled to initial state, and then played over after the screenshot.

Defaults to "disabled" that disables animations.

caret "hide" | "initial" (optional)# When set to "hide", screenshot will hide text caret.

When set to "initial", text caret behavior will not be changed.

Defaults to "hide".

mask Array<Locator> (optional)# Specify locators that should be masked when the screenshot is taken.

Masked elements will be overlaid with a pink box #FF00FF (customized by maskColor) that completely covers its bounding box.

The mask is also applied to invisible elements, see Matching only visible elements to disable that.

maskColor string (optional)

Added in: v1.35# Specify the color of the overlay box for masked elements, in CSS color format.

Default color is pink #FF00FF.

maxDiffPixelRatio number (optional)# An acceptable ratio of pixels that are different to the total amount of pixels, between 0 and 1.

Default is configurable with TestConfig.expect.

Unset by default.

maxDiffPixels number (optional)# An acceptable amount of pixels that could be different.

Default is configurable with TestConfig.expect.

Unset by default.

omitBackground boolean (optional)# Hides default white background and allows capturing screenshots with transparency.

Not applicable to jpeg images.

Defaults to false.

scale "css" | "device" (optional)# When set to "css", screenshot will have a single pixel per each css pixel on the page.

For high-dpi devices, this will keep screenshots small.

Using "device" option will produce a single pixel per each device pixel, so screenshots of high-dpi devices will be twice as large or even larger.

Defaults to "css".

stylePath string | Array<string> (optional)

Added in: v1.41# File name containing the stylesheet to apply while making the screenshot.

This is where you can hide dynamic elements, make elements invisible or change their properties to help you creating repeatable screenshots.

This stylesheet pierces the Shadow DOM and applies to the inner frames.

threshold number (optional)# An acceptable perceived color difference in the YIQ color space between the same pixel in compared images, between zero (strict) and one (lax), default is configurable with TestConfig.expect.

Defaults to 0.2.

timeout number (optional)# Time to retry the assertion for in milliseconds.

Defaults to timeout in TestConfig.expect

Promise<void># to

## HaveScreenshot(options)

Added in: v1.23 locatorAssertions.toHaveScreenshot(options) This function will wait until two consecutive locator screenshots yield the same result, and then compare the last screenshot with the expectation

const locator = page.getByRole('button');
await expect(locator).toHaveScreenshot(); Note that screenshot assertions only work with Playwright test runner

options Object (optional) animations "disabled" | "allow" (optional)# When set to "disabled", stops CSS animations, CSS transitions and Web Animations.

Animations get different treatment depending on their duration: finite animations are fast-forwarded to completion, so they'll fire transitionend event.

infinite animations are canceled to initial state, and then played over after the screenshot.

Defaults to "disabled" that disables animations.

caret "hide" | "initial" (optional)# When set to "hide", screenshot will hide text caret.

When set to "initial", text caret behavior will not be changed.

Defaults to "hide".

mask Array<Locator> (optional)# Specify locators that should be masked when the screenshot is taken.

Masked elements will be overlaid with a pink box #FF00FF (customized by maskColor) that completely covers its bounding box.

The mask is also applied to invisible elements, see Matching only visible elements to disable that.

maskColor string (optional)

Added in: v1.35# Specify the color of the overlay box for masked elements, in CSS color format.

Default color is pink #FF00FF.

maxDiffPixelRatio number (optional)# An acceptable ratio of pixels that are different to the total amount of pixels, between 0 and 1.

Default is configurable with TestConfig.expect.

Unset by default.

maxDiffPixels number (optional)# An acceptable amount of pixels that could be different.

Default is configurable with TestConfig.expect.

Unset by default.

omitBackground boolean (optional)# Hides default white background and allows capturing screenshots with transparency.

Not applicable to jpeg images.

Defaults to false.

scale "css" | "device" (optional)# When set to "css", screenshot will have a single pixel per each css pixel on the page.

For high-dpi devices, this will keep screenshots small.

Using "device" option will produce a single pixel per each device pixel, so screenshots of high-dpi devices will be twice as large or even larger.

Defaults to "css".

stylePath string | Array<string> (optional)

Added in: v1.41# File name containing the stylesheet to apply while making the screenshot.

This is where you can hide dynamic elements, make elements invisible or change their properties to help you creating repeatable screenshots.

This stylesheet pierces the Shadow DOM and applies to the inner frames.

threshold number (optional)# An acceptable perceived color difference in the YIQ color space between the same pixel in compared images, between zero (strict) and one (lax), default is configurable with TestConfig.expect.

Defaults to 0.2.

timeout number (optional)# Time to retry the assertion for in milliseconds.

Defaults to timeout in TestConfig.expect

Promise<void># to

## HaveText

Added in: v1.20 locatorAssertions.toHaveText Ensures the Locator points to an element with the given text. All nested elements will be considered when computing the text content of the element. You can use regular expressions for the value as well

const locator = page.locator('.title');
await expect(locator).toHaveText(/Welcome, Test User/);
await expect(locator).toHaveText(/Welcome, .\*/);
If you pass an array as an expected value, the expectations are: Locator resolves to a list of elements.

The number of elements equals the number of expected values in the array.

Elements from the list have text matching expected array values, one by one, in order.

For example, consider the following list: <ul> <li>Text 1</li> <li>Text 2</li> <li>Text 3</li></ul> Let's see how we can use the assertion: // ✓ Has the right items in the right orderawait expect(page.locator('ul > li')).toHaveText(['Text 1', 'Text 2', 'Text 3']);// ✖ Wrong orderawait expect(page.locator('ul > li')).toHaveText(['Text 3', 'Text 2', 'Text 1']);// ✖ Last item does not matchawait expect(page.locator('ul > li')).toHaveText(['Text 1', 'Text 2', 'Text']);// ✖ Locator points to the outer list element, not to the list itemsawait expect(page.locator('ul')).toHaveText(['Text 1', 'Text 2', 'Text 3']);

Arguments expected string | RegExp | Array<string | RegExp>

Added in: v1.18# Expected string or RegExp or a list of those.

options Object (optional) ignoreCase boolean (optional)

Added in: v1.23# Whether to perform case-insensitive match.

ignoreCase option takes precedence over the corresponding regular expression flag if specified.

timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds.

Defaults to timeout in TestConfig.expect.

useInnerText boolean (optional)

Added in: v1.18# Whether to use element.innerText instead of element.textContent when retrieving DOM node text

Promise<void>#

Details When expected parameter is a string, Playwright will normalize whitespaces and line breaks both in the actual text and in the expected string before matching.

## When regular expression is used, the actual text is matched as is. toHaveValue

Added in: v1.20 locatorAssertions.toHaveValue Ensures the Locator points to an element with the given input value. You can use regular expressions for the value as well

const locator = page.locator('input[type=number]');
await expect(locator).toHaveValue(/[0-9]/);

Arguments value string | RegExp

Added in: v1.18# Expected value. options Object (optional) timeout number (optional)

Added in: v1.18# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## HaveValues

Added in: v1.23 locatorAssertions.toHaveValues Ensures the Locator points to multi-select/combobox (i.e. a select with the multiple attribute) and the specified values are selected

For example, given the following element: <select id="favorite-colors" multiple> <option value="R">Red</option> <option value="G">Green</option> <option value="B">Blue</option></select> const locator = page.locator('id=favorite-colors');
await locator.selectOption(['R', 'G']);
await expect(locator).toHaveValues([/R/, /G/]);

Arguments values Array<string | RegExp># Expected options currently selected. options Object (optional) timeout number (optional)# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## MatchAriaSnapshot(expected)

Added in: v1.49 locatorAssertions.toMatchAriaSnapshot(expected) Asserts that the target element matches the given accessibility snapshot

await page.goto('https://demo.playwright.dev/todomvc/');
await expect(page.locator('body')).toMatchAriaSnapshot(` - heading "todos" - textbox "What needs to be done?"`);

Arguments expected string# options Object (optional) timeout number (optional)# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void># to

## MatchAriaSnapshot(options)

Added in: v1.50 locatorAssertions.toMatchAriaSnapshot(options) Asserts that the target element matches the given accessibility snapshot. Snapshot is stored in a separate .aria.yml file in a location configured by expect.toMatchAriaSnapshot.pathTemplate and/or snapshotPathTemplate properties in the configuration file

await expect(page.locator('body')).toMatchAriaSnapshot();
await expect(page.locator('body')).toMatchAriaSnapshot({ name: 'body.aria.yml' });

Arguments options Object (optional) name string (optional)# Name of the snapshot to store in the snapshot folder corresponding to this test. Generates sequential names if not specified. timeout number (optional)# Time to retry the assertion for in milliseconds. Defaults to timeout in TestConfig.expect

Promise<void>#

##

Properties

not​

Added in: v1.20 locatorAssertions.not Makes the assertion check for the opposite condition

For example, this code tests that the Locator doesn't contain text "error": await expect(locator).not.toContainText('error');

Type LocatorAssertions
