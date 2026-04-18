# 📦 Playwright — Locator

> **Source:** [playwright.dev/docs/api/class-locator](https://playwright.dev/docs/api/class-locator)

---

## LocatorLocators are the central piece of Playwright's auto-waiting and retry-ability. In a nutshell, locators represent a way to find element(s) on the page at any moment. A locator can be created with the page.locator() method. Learn more about locators

all​ Added in: v1.29 locator.all When the locator points to a list of elements, this returns an array of locators, pointing to their respective elements. notelocator.all() does not wait for elements to match the locator, and instead immediately returns whatever is present in the page.When the list of elements changes dynamically, locator.all() will produce unpredictable and flaky results.When the list of elements is stable, but loaded dynamically, wait for the full list to finish loading before calling locator.all()

for (const li of await page.getByRole('listitem').all()) await li.click(); Returns Promise<Array<Locator>># all

## InnerTexts

Added in: v1.14 locator.allInnerTexts Returns an array of node.innerText values for all matching nodes. Asserting textIf you need to assert text on the page, prefer expect(locator).toHaveText() with useInnerText option to avoid flakiness. See assertions guide for more details

const texts = await page.getByRole('link').allInnerTexts(); Returns Promise<Array<string>># all

## TextContents

Added in: v1.14 locator.allTextContents Returns an array of node.textContent values for all matching nodes. Asserting textIf you need to assert text on the page, prefer expect(locator).toHaveText() to avoid flakiness. See assertions guide for more details

const texts = await page.getByRole('link').allTextContents(); Returns Promise<Array<string>># and​ Added in: v1.34 locator.and Creates a locator that matches both this locator and the argument locator

The following example finds a button with a specific title. const button = page.getByRole('button').and(page.getByTitle('Subscribe')); Arguments locator Locator# Additional locator to match

Locator# aria

## Snapshot

Added in: v1.49 locator.ariaSnapshot Captures the aria snapshot of the given element. Read more about aria snapshots and expect(locator).toMatchAriaSnapshot() for the corresponding assertion

await page.getByRole('link').ariaSnapshot(); Arguments options Object (optional) depth number (optional) Added in: v1.59# When specified, limits the depth of the snapshot. mode "ai" | "default" (optional) Added in: v1.59# When set to "ai", returns a snapshot optimized for AI consumption. Defaults to "default". See details for more information. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<string># Details This method captures the aria snapshot of the given element. The snapshot is a string that represents the state of the element and its children. The snapshot can be used to assert the state of the element in the test, or to compare it to state in the future. The ARIA snapshot is represented using YAML markup language: The keys of the objects are the roles and optional accessible names of the elements. The values are either text content or an array of child elements. Generic static text can be represented with the text key. Below is the HTML markup and the respective ARIA snapshot: <ul aria-label="Links"> <li><a href="/">Home</a></li> <li><a href="/about">About</a></li><ul> - list "Links": - listitem: - link "Home" - listitem: - link "About" An AI-optimized snapshot, controlled by mode, is different from a default snapshot: Includes element references [ref=e2]. 2. Does not wait for an element matching the locator, and throws when no elements match. 3. Includes snapshots of <iframe>s inside the target. blur​ Added in: v1.28 locator.blur Calls blur on the element

await locator.blur();await locator.blur(options); Arguments options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># bounding

## Box

Added in: v1.14 locator.boundingBox This method returns the bounding box of the element matching the locator, or null if the element is not visible. The bounding box is calculated relative to the main frame viewport - which is usually the same as the browser window

const box = await page.getByRole('button').boundingBox();await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2); Arguments options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<null | Object># x number the x coordinate of the element in pixels. y number the y coordinate of the element in pixels. width number the width of the element in pixels. height number the height of the element in pixels

Scrolling affects the returned bounding box, similarly to Element.getBoundingClientRect. That means x and/or y may be negative. Elements from child frames return the bounding box relative to the main frame, unlike the Element.getBoundingClientRect. Assuming the page is static, it is safe to use bounding box coordinates to perform input.

## For example, the following snippet should click the center of the element. check

Added in: v1.14 locator.check Ensure that checkbox or radio element is checked

await page.getByRole('checkbox').check(); Arguments options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional)# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it

Promise<void># Details Performs the following steps: Ensure that element is a checkbox or a radio input. If not, this method throws. If the element is already checked, this method returns immediately. Wait for actionability checks on the element, unless force option is set. Scroll the element into view if needed. Use page.mouse to click in the center of the element. Ensure that the element is now checked. If not, this method throws. If the element is detached from the DOM at any moment during the action, this method throws. When all steps combined have not finished during the specified timeout, this method throws a

## TimeoutError. Passing zero timeout disables this. clear

Added in: v1.28 locator.clear Clear the input field

await page.getByRole('textbox').clear(); Arguments options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># Details This method waits for actionability checks, focuses the element, clears it and triggers an input event after clearing. If the target element is not an <input>, <textarea> or [contenteditable] element, this method throws an error. However, if the element is inside the <label> element that has an associated control, the control will be cleared instead. click​ Added in: v1.14 locator.click Click an element

Click a button: await page.getByRole('button').click(); Shift-right-click at a specific position on a canvas: await page.locator('canvas').click({ button: 'right', modifiers: ['Shift'], position: { x: 23, y: 32 },}); Arguments options Object (optional) button "left" | "right" | "middle" (optional)# Defaults to left. clickCount number (optional)# defaults to 1. See UIEvent.detail. delay number (optional)# Time to wait between mousedown and mouseup in milliseconds. Defaults to 0. force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. modifiers Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"> (optional)# Modifier keys to press. Ensures that only these modifiers are pressed during the operation, and then restores current modifiers back. If not specified, currently pressed modifiers are used. "ControlOrMeta" resolves to "Control" on Windows and Linux and to "Meta" on macOS. noWaitAfter boolean (optional)# DeprecatedThis option will default to true in the future. Actions that initiate navigations are waiting for these navigations to happen and for pages to start loading. You can opt out of waiting via setting this flag. You would only need this option in the exceptional cases such as navigating to inaccessible pages. Defaults to false. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. steps number (optional) Added in: v1.57# Defaults to 1. Sends n interpolated mousemove events to represent travel between Playwright's current cursor position and the provided destination. When set to 1, emits a single mousemove event at the destination location. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional)# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it. Note that keyboard modifiers will be pressed regardless of trial to allow testing elements which are only visible when those keys are pressed

Promise<void># Details This method clicks the element by performing the following steps: Wait for actionability checks on the element, unless force option is set. Scroll the element into view if needed. Use page.mouse to click in the center of the element, or the specified position. Wait for initiated navigations to either succeed or fail, unless noWaitAfter option is set. If the element is detached from the DOM at any moment during the action, this method throws. When all steps combined have not finished during the specified timeout, this method throws a

## TimeoutError. Passing zero timeout disables this. contentFrame

Added in: v1.43 locator.contentFrame Returns a FrameLocator object pointing to the same iframe as this locator. Useful when you have a Locator object obtained somewhere, and later on would like to interact with the content inside the frame. For a reverse operation, use frameLocator.owner()

const locator = page.locator('iframe[name="embedded"]');// ...const frameLocator = locator.contentFrame();await frameLocator.getByRole('button').click(); Returns FrameLocator# count​ Added in: v1.14 locator.count Returns the number of elements matching the locator. Asserting countIf you need to assert the number of elements on the page, prefer expect(locator).toHaveCount() to avoid flakiness. See assertions guide for more details

const count = await page.getByRole('listitem').count(); Returns Promise<number># dblclick​ Added in: v1.14 locator.dblclick Double-click an element

await locator.dblclick();await locator.dblclick(options); Arguments options Object (optional) button "left" | "right" | "middle" (optional)# Defaults to left. delay number (optional)# Time to wait between mousedown and mouseup in milliseconds. Defaults to 0. force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. modifiers Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"> (optional)# Modifier keys to press. Ensures that only these modifiers are pressed during the operation, and then restores current modifiers back. If not specified, currently pressed modifiers are used. "ControlOrMeta" resolves to "Control" on Windows and Linux and to "Meta" on macOS. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. steps number (optional) Added in: v1.57# Defaults to 1. Sends n interpolated mousemove events to represent travel between Playwright's current cursor position and the provided destination. When set to 1, emits a single mousemove event at the destination location. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional)# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it. Note that keyboard modifiers will be pressed regardless of trial to allow testing elements which are only visible when those keys are pressed

Promise<void># Details This method double clicks the element by performing the following steps: Wait for actionability checks on the element, unless force option is set. Scroll the element into view if needed. Use page.mouse to double click in the center of the element, or the specified position. If the element is detached from the DOM at any moment during the action, this method throws. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this. noteelement.dblclick() dispatches two click events and a single dblclick event. describe​ Added in: v1.53 locator.describe Describes the locator, description is used in the trace viewer and reports

the locator pointing to the same element

const button = page.getByTestId('btn-sub').describe('Subscribe button');await button.click(); Arguments description string# Locator description

Locator# description​ Added in: v1.57 locator.description Returns locator description previously set with locator.describe()

null if no custom description has been set. Prefer locator.toString() for a human-readable representation, as it uses the description when available

const button = page.getByRole('button').describe('Subscribe button');console.log(button.description()); // "Subscribe button"const input = page.getByRole('textbox');console.log(input.description()); // null Returns null | string# dispatch

## Event

Added in: v1.14 locator.dispatchEvent Programmatically dispatch an event on the matching element

await locator.dispatchEvent('click'); Arguments type string# DOM event type: "click", "dragstart", etc. eventInit EvaluationArgument (optional)# Optional event-specific initialization properties. options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># Details The snippet above dispatches the click event on the element. Regardless of the visibility state of the element, click is dispatched. This is equivalent to calling element.click(). Under the hood, it creates an instance of an event based on the given type, initializes it with eventInit properties and dispatches it on the element

are composed, cancelable and bubble by default. Since eventInit is event-specific, please refer to the events documentation for the lists of initial properties: DeviceMotionEvent DeviceOrientationEvent DragEvent Event FocusEvent KeyboardEvent MouseEvent PointerEvent TouchEvent WheelEvent You can also specify JSHandle as the property value if you want live objects to be passed into the event: const dataTransfer = await page.evaluateHandle(() => new DataTransfer());await locator.dispatchEvent('dragstart', { dataTransfer }); dragTo​ Added in: v1.18 locator.dragTo Drag the source element towards the target element and drop it

const source = page.locator('#source');const target = page.locator('#target');await source.dragTo(target);// or specify exact positions relative to the top-left corners of the elements:await source.dragTo(target, { sourcePosition: { x: 34, y: 7 }, targetPosition: { x: 10, y: 20 },}); Arguments target Locator# Locator of the element to drag to. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. sourcePosition Object (optional)# x number y number Clicks on the source element at this point relative to the top-left corner of the element's padding box. If not specified, some visible point of the element is used. steps number (optional) Added in: v1.57# Defaults to 1. Sends n interpolated mousemove events to represent travel between the mousedown and mouseup of the drag. When set to 1, emits a single mousemove event at the destination location. targetPosition Object (optional)# x number y number Drops on the target element at this point relative to the top-left corner of the element's padding box. If not specified, some visible point of the element is used. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional)# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it

Promise<void># Details This method drags the locator to another target locator or target position. It will first move to the source element, perform a mousedown, then move to the target element or position and perform a mouseup. evaluate​ Added in: v1.14 locator.evaluate Execute JavaScript code in the page, taking the matching element as an argument

Passing argument to pageFunction: const result = await page.getByTestId('myId').evaluate((element, [x, y]) => { return element.textContent + ' ' + x \* y;}, [7, 8]);console.log(result); // prints "myId text 56" Arguments pageFunction function | string# Function to be evaluated in the page context. arg EvaluationArgument (optional)# Optional argument to pass to pageFunction. options Object (optional) timeout number (optional)# Maximum time in milliseconds to wait for the locator before evaluating. Note that after locator is resolved, evaluation itself is not limited by the timeout. Defaults to 0 - no timeout

Promise<Serializable># Details Returns the return value of pageFunction, called with the matching element as a first argument, and arg as a second argument. If pageFunction returns a Promise, this method will wait for the promise to resolve and return its value.

## If pageFunction throws or rejects, this method throws. evaluateAll

Added in: v1.14 locator.evaluateAll Execute JavaScript code in the page, taking all matching elements as an argument

const locator = page.locator('div');const moreThanTen = await locator.evaluateAll((divs, min) => divs.length > min, 10); Arguments pageFunction function | string# Function to be evaluated in the page context. arg EvaluationArgument (optional)# Optional argument to pass to pageFunction

Promise<Serializable># Details Returns the return value of pageFunction, called with an array of all matching elements as a first argument, and arg as a second argument. If pageFunction returns a Promise, this method will wait for the promise to resolve and return its value.

## If pageFunction throws or rejects, this method throws. evaluateHandle

Added in: v1.14 locator.evaluateHandle Execute JavaScript code in the page, taking the matching element as an argument, and return a JSHandle with the result

await locator.evaluateHandle(pageFunction);await locator.evaluateHandle(pageFunction, arg, options); Arguments pageFunction function | string# Function to be evaluated in the page context. arg EvaluationArgument (optional)# Optional argument to pass to pageFunction. options Object (optional) timeout number (optional)# Maximum time in milliseconds to wait for the locator before evaluating. Note that after locator is resolved, evaluation itself is not limited by the timeout. Defaults to 0 - no timeout

Promise<JSHandle># Details Returns the return value of pageFunction as aJSHandle, called with the matching element as a first argument, and arg as a second argument. The only difference between locator.evaluate() and locator.evaluateHandle() is that locator.evaluateHandle() returns JSHandle. If pageFunction returns a Promise, this method will wait for the promise to resolve and return its value. If pageFunction throws or rejects, this method throws.

## See page.evaluateHandle() for more details. fill

Added in: v1.14 locator.fill Set a value to the input field

await page.getByRole('textbox').fill('example value'); Arguments value string# Value to set for the <input>, <textarea> or [contenteditable] element. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># Details This method waits for actionability checks, focuses the element, fills it and triggers an input event after filling. Note that you can pass an empty string to clear the input field. If the target element is not an <input>, <textarea> or [contenteditable] element, this method throws an error. However, if the element is inside the <label> element that has an associated control, the control will be filled instead.

## To send fine-grained keyboard events, use locator.pressSequentially(). filter

Added in: v1.22 locator.filter This method narrows existing locator according to the options, for example filters by text. It can be chained to filter multiple times

const rowLocator = page.locator('tr');// ...await rowLocator .filter({ hasText: 'text in column 1' }) .filter({ has: page.getByRole('button', { name: 'column 2 button' }) }) .screenshot(); Arguments options Object (optional) has Locator (optional)# Narrows down the results of the method to those which contain elements matching this relative locator. For example, article that has text=Playwright matches <article><div>Playwright</div></article>. Inner locator must be relative to the outer locator and is queried starting with the outer locator match, not the document root. For example, you can find content that has div in <article><content><div>Playwright</div></content></article>. However, looking for content that has article div will fail, because the inner locator must be relative and should not use any elements outside the content. Note that outer and inner locators must belong to the same frame. Inner locator must not contain FrameLocators. hasNot Locator (optional) Added in: v1.33# Matches elements that do not contain an element that matches an inner locator. Inner locator is queried against the outer one. For example, article that does not have div matches <article><span>Playwright</span></article>. Note that outer and inner locators must belong to the same frame. Inner locator must not contain FrameLocators. hasNotText string | RegExp (optional) Added in: v1.33# Matches elements that do not contain specified text somewhere inside, possibly in a child or a descendant element. When passed a string, matching is case-insensitive and searches for a substring. hasText string | RegExp (optional)# Matches elements containing specified text somewhere inside, possibly in a child or a descendant element. When passed a string, matching is case-insensitive and searches for a substring. For example, "Playwright" matches <article><div>Playwright</div></article>. visible boolean (optional) Added in: v1.51# Only matches visible or invisible elements

Locator# first​ Added in: v1.14 locator.first Returns locator to the first matching element

locator.first(); Returns Locator# focus​ Added in: v1.14 locator.focus Calls focus on the matching element

await locator.focus();await locator.focus(options); Arguments options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># frame

## Locator

Added in: v1.17 locator.frameLocator When working with iframes, you can create a frame locator that will enter the iframe and allow locating elements in that iframe: Usage const locator = page.frameLocator('iframe').getByText('Submit');await locator.click(); Arguments selector string# A selector to use when resolving DOM element

FrameLocator# get

## Attribute

Added in: v1.14 locator.getAttribute Returns the matching element's attribute value. Asserting attributesIf you need to assert an element's attribute, prefer expect(locator).toHaveAttribute() to avoid flakiness. See assertions guide for more details

await locator.getAttribute(name);await locator.getAttribute(name, options); Arguments name string# Attribute name to get the value for. options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<null | string># get

## ByAltText

Added in: v1.27 locator.getByAltText Allows locating elements by their alt text

For example, this method will find the image by alt text "Playwright logo": <img alt='Playwright logo'> await page.getByAltText('Playwright logo').click(); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# get

## ByLabel

Added in: v1.27 locator.getByLabel Allows locating input elements by the text of the associated <label> or aria-labelledby element, or by the aria-label attribute

For example, this method will find inputs by label "Username" and "Password" in the following DOM: <input aria-label="Username"><label for="password-input">Password:</label><input id="password-input"> await page.getByLabel('Username').fill('john');await page.getByLabel('Password').fill('secret'); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# get

## ByPlaceholder

Added in: v1.27 locator.getByPlaceholder Allows locating input elements by the placeholder text

For example, consider the following DOM structure. <input type="email" placeholder="name@example.com" /> You can fill the input after locating it by the placeholder text: await page .getByPlaceholder('name@example.com') .fill('playwright@microsoft.com'); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# get

## ByRole

Added in: v1.27 locator.getByRole Allows locating elements by their ARIA role, ARIA attributes and accessible name

Consider the following DOM structure. <h3>Sign up</h3><label> <input type="checkbox" /> Subscribe</label><br/><button>Submit</button> You can locate each element by its implicit role: await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();await page.getByRole('checkbox', { name: 'Subscribe' }).check();await page.getByRole('button', { name: /submit/i }).click(); Arguments role "alert" | "alertdialog" | "application" | "article" | "banner" | "blockquote" | "button" | "caption" | "cell" | "checkbox" | "code" | "columnheader" | "combobox" | "complementary" | "contentinfo" | "definition" | "deletion" | "dialog" | "directory" | "document" | "emphasis" | "feed" | "figure" | "form" | "generic" | "grid" | "gridcell" | "group" | "heading" | "img" | "insertion" | "link" | "list" | "listbox" | "listitem" | "log" | "main" | "marquee" | "math" | "meter" | "menu" | "menubar" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "navigation" | "none" | "note" | "option" | "paragraph" | "presentation" | "progressbar" | "radio" | "radiogroup" | "region" | "row" | "rowgroup" | "rowheader" | "scrollbar" | "search" | "searchbox" | "separator" | "slider" | "spinbutton" | "status" | "strong" | "subscript" | "superscript" | "switch" | "tab" | "table" | "tablist" | "tabpanel" | "term" | "textbox" | "time" | "timer" | "toolbar" | "tooltip" | "tree" | "treegrid" | "treeitem"# Required aria role. options Object (optional) checked boolean (optional)# An attribute that is usually set by aria-checked or native <input type=checkbox> controls. Learn more about aria-checked. disabled boolean (optional)# An attribute that is usually set by aria-disabled or disabled. noteUnlike most other attributes, disabled is inherited through the DOM hierarchy. Learn more about aria-disabled. exact boolean (optional) Added in: v1.28# Whether name is matched exactly: case-sensitive and whole-string. Defaults to false. Ignored when name is a regular expression. Note that exact match still trims whitespace. expanded boolean (optional)# An attribute that is usually set by aria-expanded. Learn more about aria-expanded. includeHidden boolean (optional)# Option that controls whether hidden elements are matched. By default, only non-hidden elements, as defined by ARIA, are matched by role selector. Learn more about aria-hidden. level number (optional)# A number attribute that is usually present for roles heading, listitem, row, treeitem, with default values for <h1>-<h6> elements. Learn more about aria-level. name string | RegExp (optional)# Option to match the accessible name. By default, matching is case-insensitive and searches for a substring, use exact to control this behavior. Learn more about accessible name. pressed boolean (optional)# An attribute that is usually set by aria-pressed. Learn more about aria-pressed. selected boolean (optional)# An attribute that is usually set by aria-selected. Learn more about aria-selected

Locator# Details Role selector does not replace accessibility audits and conformance tests, but rather gives early feedback about the ARIA guidelines. Many html elements have an implicitly defined role that is recognized by the role selector. You can find all the supported roles here. ARIA guidelines do not recommend duplicating implicit roles and attributes by setting role and/or aria-\* attributes to default values. get

## ByTestId

Added in: v1.27 locator.getByTestId Locate element by the test id

Consider the following DOM structure. <button data-testid="directions">Itinéraire</button> You can locate the element by its test id: await page.getByTestId('directions').click(); Arguments testId string | RegExp# Id to locate the element by

Locator# Details By default, the data-testid attribute is used as a test id. Use selectors.setTestIdAttribute() to configure a different test id attribute if necessary. // Set custom test id attribute from @playwright/test config:import { defineConfig } from '@playwright/test';export default defineConfig({ use: { testIdAttribute: 'data-pw' },}); get

## ByText

Added in: v1.27 locator.getByText Allows locating elements that contain given text. See also locator.filter() that allows to match by another criteria, like an accessible role, and then filter by the text content

Consider the following DOM structure: <div>Hello <span>world</span></div><div>Hello</div> You can locate by text substring, exact string, or a regular expression: // Matches <span>page.getByText('world');// Matches first <div>page.getByText('Hello world');// Matches second <div>page.getByText('Hello', { exact: true });// Matches both <div>spage.getByText(/Hello/);// Matches second <div>page.getByText(/^hello$/i); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# Details Matching by text always normalizes whitespace, even with exact match. For example, it turns multiple spaces into one, turns line breaks into spaces and ignores leading and trailing whitespace. Input elements of the type button and submit are matched by their value instead of the text content. For example, locating by text "Log in" matches <input type=button value="Log in">. get

## ByTitle

Added in: v1.27 locator.getByTitle Allows locating elements by their title attribute

Consider the following DOM structure. <span title='Issues count'>25 issues</span> You can check the issues count after locating it by the title text: await expect(page.getByTitle('Issues count')).toHaveText('25 issues'); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# highlight​ Added in: v1.20 locator.highlight Highlight the corresponding element(s) on the screen. Useful for debugging, don't commit the code that uses locator.highlight()

await locator.highlight(); Returns Promise<void># hover​ Added in: v1.14 locator.hover Hover over the matching element

await page.getByRole('link').hover(); Arguments options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. modifiers Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"> (optional)# Modifier keys to press. Ensures that only these modifiers are pressed during the operation, and then restores current modifiers back. If not specified, currently pressed modifiers are used. "ControlOrMeta" resolves to "Control" on Windows and Linux and to "Meta" on macOS. noWaitAfter boolean (optional) Added in: v1.28# DeprecatedThis option has no effect. This option has no effect. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional)# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it. Note that keyboard modifiers will be pressed regardless of trial to allow testing elements which are only visible when those keys are pressed

Promise<void># Details This method hovers over the element by performing the following steps: Wait for actionability checks on the element, unless force option is set. Scroll the element into view if needed. Use page.mouse to hover over the center of the element, or the specified position. If the element is detached from the DOM at any moment during the action, this method throws. When all steps combined have not finished during the specified timeout, this method throws a

## TimeoutError. Passing zero timeout disables this. innerHTML

Added in: v1.14 locator.innerHTML Returns the element.innerHTML

await locator.innerHTML();await locator.innerHTML(options); Arguments options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<string># inner

## Text

Added in: v1.14 locator.innerText Returns the element.innerText. Asserting textIf you need to assert text on the page, prefer expect(locator).toHaveText() with useInnerText option to avoid flakiness. See assertions guide for more details

await locator.innerText();await locator.innerText(options); Arguments options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<string># input

## Value

Added in: v1.14 locator.inputValue Returns the value for the matching <input> or <textarea> or <select> element. Asserting valueIf you need to assert input value, prefer expect(locator).toHaveValue() to avoid flakiness. See assertions guide for more details

const value = await page.getByRole('textbox').inputValue(); Arguments options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<string># Details Throws elements that are not an input, textarea or a select. However, if the element is inside the <label> element that has an associated control, returns the value of the control. is

## Checked

Added in: v1.14 locator.isChecked Returns whether the element is checked. Throws if the element is not a checkbox or radio input. Asserting checked stateIf you need to assert that checkbox is checked, prefer expect(locator).toBeChecked() to avoid flakiness. See assertions guide for more details

const checked = await page.getByRole('checkbox').isChecked(); Arguments options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<boolean># is

## Disabled

Added in: v1.14 locator.isDisabled Returns whether the element is disabled, the opposite of enabled. Asserting disabled stateIf you need to assert that an element is disabled, prefer expect(locator).toBeDisabled() to avoid flakiness. See assertions guide for more details

const disabled = await page.getByRole('button').isDisabled(); Arguments options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<boolean># is

## Editable

Added in: v1.14 locator.isEditable Returns whether the element is editable. If the target element is not an <input>, <textarea>, <select>, [contenteditable] and does not have a role allowing [aria-readonly], this method throws an error. Asserting editable stateIf you need to assert that an element is editable, prefer expect(locator).toBeEditable() to avoid flakiness. See assertions guide for more details

const editable = await page.getByRole('textbox').isEditable(); Arguments options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<boolean># is

## Enabled

Added in: v1.14 locator.isEnabled Returns whether the element is enabled. Asserting enabled stateIf you need to assert that an element is enabled, prefer expect(locator).toBeEnabled() to avoid flakiness. See assertions guide for more details

const enabled = await page.getByRole('button').isEnabled(); Arguments options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<boolean># is

## Hidden

Added in: v1.14 locator.isHidden Returns whether the element is hidden, the opposite of visible. Asserting visibilityIf you need to assert that element is hidden, prefer expect(locator).toBeHidden() to avoid flakiness. See assertions guide for more details

const hidden = await page.getByRole('button').isHidden(); Arguments options Object (optional) timeout number (optional)# DeprecatedThis option is ignored. locator.isHidden() does not wait for the element to become hidden and returns immediately

Promise<boolean># is

## Visible

Added in: v1.14 locator.isVisible Returns whether the element is visible. Asserting visibilityIf you need to assert that element is visible, prefer expect(locator).toBeVisible() to avoid flakiness. See assertions guide for more details

const visible = await page.getByRole('button').isVisible(); Arguments options Object (optional) timeout number (optional)# DeprecatedThis option is ignored. locator.isVisible() does not wait for the element to become visible and returns immediately

Promise<boolean># last​ Added in: v1.14 locator.last Returns locator to the last matching element

const banana = await page.getByRole('listitem').last(); Returns Locator# locator​ Added in: v1.14 locator.locator The method finds an element matching the specified selector in the locator's subtree. It also accepts filter options, similar to locator.filter() method. Learn more about locators

locator.locator(selectorOrLocator);locator.locator(selectorOrLocator, options); Arguments selectorOrLocator string | Locator# A selector or locator to use when resolving DOM element. options Object (optional) has Locator (optional)# Narrows down the results of the method to those which contain elements matching this relative locator. For example, article that has text=Playwright matches <article><div>Playwright</div></article>. Inner locator must be relative to the outer locator and is queried starting with the outer locator match, not the document root. For example, you can find content that has div in <article><content><div>Playwright</div></content></article>. However, looking for content that has article div will fail, because the inner locator must be relative and should not use any elements outside the content. Note that outer and inner locators must belong to the same frame. Inner locator must not contain FrameLocators. hasNot Locator (optional) Added in: v1.33# Matches elements that do not contain an element that matches an inner locator. Inner locator is queried against the outer one. For example, article that does not have div matches <article><span>Playwright</span></article>. Note that outer and inner locators must belong to the same frame. Inner locator must not contain FrameLocators. hasNotText string | RegExp (optional) Added in: v1.33# Matches elements that do not contain specified text somewhere inside, possibly in a child or a descendant element. When passed a string, matching is case-insensitive and searches for a substring. hasText string | RegExp (optional)# Matches elements containing specified text somewhere inside, possibly in a child or a descendant element. When passed a string, matching is case-insensitive and searches for a substring. For example, "Playwright" matches <article><div>Playwright</div></article>

Locator# normalize​ Added in: v1.59 locator.normalize Returns a new locator that uses best practices for referencing the matched element, prioritizing test ids, aria roles, and other user-facing attributes over CSS selectors. This is useful for converting implementation-detail selectors into more resilient, human-readable locators

await locator.normalize(); Returns Promise<Locator># nth​ Added in: v1.14 locator.nth Returns locator to the n-th matching element. It's zero based, nth(0) selects the first element

const banana = await page.getByRole('listitem').nth(2); Arguments index number# Returns Locator# or​ Added in: v1.33 locator.or Creates a locator matching all elements that match one or both of the two locators. Note that when both locators match something, the resulting locator will have multiple matches, potentially causing a locator strictness violation

Consider a scenario where you'd like to click on a "New email" button, but sometimes a security settings dialog shows up instead. In this case, you can wait for either a "New email" button, or a dialog and act accordingly. noteIf both "New email" button and security dialog appear on screen, the "or" locator will match both of them, possibly throwing the "strict mode violation" error. In this case, you can use locator.first() to only match one of them. const newEmail = page.getByRole('button', { name: 'New' });const dialog = page.getByText('Confirm security settings');await expect(newEmail.or(dialog).first()).toBeVisible();if (await dialog.isVisible()) await page.getByRole('button', { name: 'Dismiss' }).click();await newEmail.click(); Arguments locator Locator# Alternative locator to match

Locator# page​ Added in: v1.19 locator.page A page this locator belongs to

locator.page(); Returns Page# press​ Added in: v1.14 locator.press Focuses the matching element and presses a combination of the keys

await page.getByRole('textbox').press('Backspace'); Arguments key string# Name of the key to press or a character to generate, such as ArrowLeft or a. options Object (optional) delay number (optional)# Time to wait between keydown and keyup in milliseconds. Defaults to 0. noWaitAfter boolean (optional)# DeprecatedThis option will default to true in the future. Actions that initiate navigations are waiting for these navigations to happen and for pages to start loading. You can opt out of waiting via setting this flag. You would only need this option in the exceptional cases such as navigating to inaccessible pages. Defaults to false. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># Details Focuses the element, and then uses keyboard.down() and keyboard.up(). key can specify the intended keyboardEvent.key value or a single character to generate the text for. A superset of the key values can be found here. Examples of the keys are: F1 - F12, Digit0- Digit9, KeyA- KeyZ, Backquote, Minus, Equal, Backslash, Backspace, Tab, Delete, Escape, ArrowDown, End, Enter, Home, Insert, PageDown, PageUp, ArrowRight, ArrowUp, etc. Following modification shortcuts are also supported: Shift, Control, Alt, Meta, ShiftLeft, ControlOrMeta. ControlOrMeta resolves to Control on Windows and Linux and to Meta on macOS. Holding down Shift will type the text that corresponds to the key in the upper case. If key is a single character, it is case-sensitive, so the values a and A will generate different respective texts. Shortcuts such as key: "Control+o", key: "Control++ or key: "Control+Shift+T" are supported as well. When specified with the modifier, modifier is pressed and being held while the subsequent key is being pressed. press

## Sequentially

Added in: v1.38 locator.pressSequentially tipIn most cases, you should use locator.fill() instead. You only need to press keys one by one if there is special keyboard handling on the page. Focuses the element, and then sends a keydown, keypress/input, and keyup event for each character in the text. To press a special key, like Control or ArrowDown, use locator.press()

await locator.pressSequentially('Hello'); // Types instantlyawait locator.pressSequentially('World', { delay: 100 }); // Types slower, like a user An example of typing into a text field and then submitting the form: const locator = page.getByLabel('Password');await locator.pressSequentially('my password');await locator.press('Enter'); Arguments text string# String of characters to sequentially press into a focused element. options Object (optional) delay number (optional)# Time to wait between key presses in milliseconds. Defaults to 0. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># screenshot​ Added in: v1.14 locator.screenshot Take a screenshot of the element matching the locator

await page.getByRole('link').screenshot(); Disable animations and save screenshot to a file: await page.getByRole('link').screenshot({ animations: 'disabled', path: 'link.png' }); Arguments options Object (optional) animations "disabled" | "allow" (optional)# When set to "disabled", stops CSS animations, CSS transitions and Web Animations. Animations get different treatment depending on their duration: finite animations are fast-forwarded to completion, so they'll fire transitionend event. infinite animations are canceled to initial state, and then played over after the screenshot. Defaults to "allow" that leaves animations untouched. caret "hide" | "initial" (optional)# When set to "hide", screenshot will hide text caret. When set to "initial", text caret behavior will not be changed. Defaults to "hide". mask Array<Locator> (optional)# Specify locators that should be masked when the screenshot is taken. Masked elements will be overlaid with a pink box #FF00FF (customized by maskColor) that completely covers its bounding box. The mask is also applied to invisible elements, see Matching only visible elements to disable that. maskColor string (optional) Added in: v1.35# Specify the color of the overlay box for masked elements, in CSS color format. Default color is pink #FF00FF. omitBackground boolean (optional)# Hides default white background and allows capturing screenshots with transparency. Not applicable to jpeg images. Defaults to false. path string (optional)# The file path to save the image to. The screenshot type will be inferred from file extension. If path is a relative path, then it is resolved relative to the current working directory. If no path is provided, the image won't be saved to the disk. quality number (optional)# The quality of the image, between 0-100. Not applicable to png images. scale "css" | "device" (optional)# When set to "css", screenshot will have a single pixel per each css pixel on the page. For high-dpi devices, this will keep screenshots small. Using "device" option will produce a single pixel per each device pixel, so screenshots of high-dpi devices will be twice as large or even larger. Defaults to "device". style string (optional) Added in: v1.41# Text of the stylesheet to apply while making the screenshot. This is where you can hide dynamic elements, make elements invisible or change their properties to help you creating repeatable screenshots. This stylesheet pierces the Shadow DOM and applies to the inner frames. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. type "png" | "jpeg" (optional)# Specify screenshot type, defaults to png

Promise<Buffer># Details This method captures a screenshot of the page, clipped to the size and position of a particular element matching the locator. If the element is covered by other elements, it will not be actually visible on the screenshot. If the element is a scrollable container, only the currently scrolled content will be visible on the screenshot. This method waits for the actionability checks, then scrolls element into view before taking a screenshot. If the element is detached from DOM, the method throws an error.

## Returns the buffer with the captured screenshot. scrollIntoViewIfNeeded

Added in: v1.14 locator.scrollIntoViewIfNeeded This method waits for actionability checks, then tries to scroll element into view, unless it is completely visible as defined by IntersectionObserver's ratio. See scrolling for alternative ways to scroll

await locator.scrollIntoViewIfNeeded();await locator.scrollIntoViewIfNeeded(options); Arguments options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># select

## Option

Added in: v1.14 locator.selectOption Selects option or options in <select>

<select multiple> <option value="red">Red</option> <option value="green">Green</option> <option value="blue">Blue</option></select> // single selection matching the value or labelelement.selectOption('blue');// single selection matching the labelelement.selectOption({ label: 'Blue' });// multiple selection for red, green and blue optionselement.selectOption(['red', 'green', 'blue']); Arguments values null | string | ElementHandle | Array<string> | Object | Array<ElementHandle> | Array<Object># value string (optional) Matches by option.value. Optional. label string (optional) Matches by option.label. Optional. index number (optional) Matches by the index. Optional. Options to select. If the <select> has the multiple attribute, all matching options are selected, otherwise only the first option matching one of the passed options is selected. String values are matching both values and labels. Option is considered matching if all specified properties match. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<Array<string>># Details This method waits for actionability checks, waits until all specified options are present in the <select> element and selects these options. If the target element is not a <select> element, this method throws an error. However, if the element is inside the <label> element that has an associated control, the control will be used instead

the array of option values that have been successfully selected. Triggers a change and input event once all the provided options have been selected. select

## Text

Added in: v1.14 locator.selectText This method waits for actionability checks, then focuses the element and selects all its text content. If the element is inside the <label> element that has an associated control, focuses and selects text in the control instead

await locator.selectText();await locator.selectText(options); Arguments options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># set

## Checked

Added in: v1.15 locator.setChecked Set the state of a checkbox or a radio element

await page.getByRole('checkbox').setChecked(true); Arguments checked boolean# Whether to check or uncheck the checkbox. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional)# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it

Promise<void># Details This method checks or unchecks an element by performing the following steps: Ensure that matched element is a checkbox or a radio input. If not, this method throws. If the element already has the right checked state, this method returns immediately. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.mouse to click in the center of the element. Ensure that the element is now checked or unchecked. If not, this method throws. When all steps combined have not finished during the specified timeout, this method throws a

## TimeoutError. Passing zero timeout disables this. setInputFiles

Added in: v1.14 locator.setInputFiles Upload file or multiple files into <input type=file>. For inputs with a [webkitdirectory] attribute, only a single directory path is supported

// Select one fileawait page.getByLabel('Upload file').setInputFiles(path.join(**dirname, 'myfile.pdf'));// Select multiple filesawait page.getByLabel('Upload files').setInputFiles([ path.join(**dirname, 'file1.txt'), path.join(**dirname, 'file2.txt'),]);// Select a directoryawait page.getByLabel('Upload directory').setInputFiles(path.join(**dirname, 'mydir'));// Remove all the selected filesawait page.getByLabel('Upload file').setInputFiles([]);// Upload buffer from memoryawait page.getByLabel('Upload file').setInputFiles({ name: 'file.txt', mimeType: 'text/plain', buffer: Buffer.from('this is test')}); Arguments files string | Array<string> | Object | Array<Object># name string File name mimeType string File type buffer Buffer File content options Object (optional) noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># Details Sets the value of the file input to these file paths or files. If some of the filePaths are relative paths, then they are resolved relative to the current working directory. For empty array, clears the selected files. This method expects Locator to point to an input element. However, if the element is inside the <label> element that has an associated control, targets the control instead. tap​ Added in: v1.14 locator.tap Perform a tap gesture on the element matching the locator. For examples of emulating other gestures by manually dispatching touch events, see the emulating legacy touch events page

await locator.tap();await locator.tap(options); Arguments options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. modifiers Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"> (optional)# Modifier keys to press. Ensures that only these modifiers are pressed during the operation, and then restores current modifiers back. If not specified, currently pressed modifiers are used. "ControlOrMeta" resolves to "Control" on Windows and Linux and to "Meta" on macOS. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional)# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it. Note that keyboard modifiers will be pressed regardless of trial to allow testing elements which are only visible when those keys are pressed

Promise<void># Details This method taps the element by performing the following steps: Wait for actionability checks on the element, unless force option is set. Scroll the element into view if needed. Use page.touchscreen to tap the center of the element, or the specified position. If the element is detached from the DOM at any moment during the action, this method throws. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this. noteelement.tap() requires that the has

## Touch option of the browser context be set to true. textContent

Added in: v1.14 locator.textContent Returns the node.textContent. Asserting textIf you need to assert text on the page, prefer expect(locator).toHaveText() to avoid flakiness. See assertions guide for more details

await locator.textContent();await locator.textContent(options); Arguments options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<null | string># to

## String

Added in: v1.57 locator.toString Returns a human-readable representation of the locator, using the locator.description() if one exists; otherwise, it generates a string based on the locator's selector

locator.toString(); Returns string# uncheck​ Added in: v1.14 locator.uncheck Ensure that checkbox or radio element is unchecked

await page.getByRole('checkbox').uncheck(); Arguments options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional)# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it

Promise<void># Details This method unchecks the element by performing the following steps: Ensure that element is a checkbox or a radio input. If not, this method throws. If the element is already unchecked, this method returns immediately. Wait for actionability checks on the element, unless force option is set. Scroll the element into view if needed. Use page.mouse to click in the center of the element. Ensure that the element is now unchecked. If not, this method throws. If the element is detached from the DOM at any moment during the action, this method throws. When all steps combined have not finished during the specified timeout, this method throws a

## TimeoutError. Passing zero timeout disables this. waitFor

Added in: v1.16 locator.waitFor Returns when element specified by locator satisfies the state option. If target element already satisfies the condition, the method returns immediately. Otherwise, waits for up to timeout milliseconds until the condition is met

const orderSent = page.locator('#order-sent');await orderSent.waitFor(); Arguments options Object (optional) state "attached" | "detached" | "visible" | "hidden" (optional)# Defaults to 'visible'. Can be either: 'attached' - wait for element to be present in DOM. 'detached' - wait for element to not be present in DOM. 'visible' - wait for element to have non-empty bounding box and no visibility:hidden. Note that element without any content or with display:none has an empty bounding box and is not considered visible. 'hidden' - wait for element to be either detached from DOM, or have an empty bounding box or visibility:hidden. This is opposite to the 'visible' option. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void>#

## Deprecated

element

## Handle

Added in: v1.14 locator.elementHandle DiscouragedAlways prefer using Locators and web assertions over ElementHandles because latter are inherently racy. Resolves given locator to the first matching DOM element. If there are no matching elements, waits for one. If multiple elements match the locator, throws

await locator.elementHandle();await locator.elementHandle(options); Arguments options Object (optional) timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<ElementHandle># element

## Handles

Added in: v1.14 locator.elementHandles DiscouragedAlways prefer using Locators and web assertions over ElementHandles because latter are inherently racy. Resolves given locator to all matching DOM elements. If there are no matching elements, returns an empty list

await locator.elementHandles(); Returns Promise<Array<ElementHandle>># type​ Added in: v1.14 locator.type DeprecatedIn most cases, you should use locator.fill() instead. You only need to press keys one by one if there is special keyboard handling on the page - in this case use locator.pressSequentially(). Focuses the element, and then sends a keydown, keypress/input, and keyup event for each character in the text. To press a special key, like Control or ArrowDown, use locator.press()

Arguments text string# A text to type into a focused element. options Object (optional) delay number (optional)# Time to wait between key presses in milliseconds. Defaults to 0. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void>#
