# 📦 Playwright — Page

> **Source:** [playwright.dev/docs/api/class-page](https://playwright.dev/docs/api/class-page)

---

## Page

Page provides methods to interact with a single tab in a Browser, or an extension background page in Chromium. One Browser instance might have multiple Page instances. This example creates a page, navigates it to a URL, and then saves a screenshot: const { webkit } = require('playwright'); // Or 'chromium' or 'firefox'.(async () => { const browser = await webkit.launch(); const context = await browser.newContext(); const page = await context.newPage(); await page.goto('https://example.com'); await page.screenshot({ path: 'screenshot.png' }); await browser.close();})(); The Page class emits various events (described below) which can be handled using any of Node's native EventEmitter methods, such as on, once or removeListener. This example logs a message for a single page load event: page.once('load', () => console.log('Page loaded!')); To unsubscribe from events use the removeListener method: function logRequest(interceptedRequest) { console.log('A request was made:', interceptedRequest.url());}page.on('request', logRequest);// Sometime later...page.removeListener('request', logRequest); Methods

add

## InitScript

Added before v1.9 page.addInitScript Adds a script which would be evaluated in one of the following scenarios: Whenever the page is navigated. Whenever the child frame is attached or navigated. In this case, the script is evaluated in the context of the newly attached frame. The script is evaluated after the document was created but before any of its scripts were run. This is useful to amend the JavaScript environment, e.g. to seed Math.random

An example of overriding Math.random before the page loads: // preload.jsMath.random = () => 42; // In your playwright script, assuming the preload.js file is in same directoryawait page.addInitScript({ path: './preload.js' }); await page.addInitScript(mock => { window.mock = mock;}, mock); noteThe order of evaluation of multiple scripts installed via browserContext.addInitScript() and page.addInitScript() is not defined

script function | string | Object# path string (optional) Path to the JavaScript file. If path is a relative path, then it is resolved relative to the current working directory. Optional. content string (optional) Raw script content. Optional. Script to be evaluated in the page. arg Serializable (optional)# Optional argument to pass to script (only supported when passing a function)

Promise<Disposable># add

## LocatorHandler

Added in: v1.42 page.addLocatorHandler When testing a web page, sometimes unexpected overlays like a "Sign up" dialog appear and block actions you want to automate, e.g. clicking a button. These overlays don't always show up in the same way or at the same time, making them tricky to handle in automated tests. This method lets you set up a special function, called a handler, that activates when it detects that overlay is visible. The handler's job is to remove the overlay, allowing your test to continue as if the overlay wasn't there. Things to keep in mind: When an overlay is shown predictably, we recommend explicitly waiting for it in your test and dismissing it as a part of your normal test flow, instead of using page.addLocatorHandler(). Playwright checks for the overlay every time before executing or retrying an action that requires an actionability check, or before performing an auto-waiting assertion check. When overlay is visible, Playwright calls the handler first, and then proceeds with the action/assertion. Note that the handler is only called when you perform an action/assertion - if the overlay becomes visible but you don't perform any actions, the handler will not be triggered. After executing the handler, Playwright will ensure that overlay that triggered the handler is not visible anymore. You can opt-out of this behavior with noWaitAfter. The execution time of the handler counts towards the timeout of the action/assertion that executed the handler. If your handler takes too long, it might cause timeouts. You can register multiple handlers. However, only a single handler will be running at a time. Make sure the actions within a handler don't depend on another handler. warningRunning the handler will alter your page state mid-test. For example it will change the currently focused element and move the mouse. Make sure that actions that run after the handler are self-contained and do not rely on the focus and mouse state being unchanged.For example, consider a test that calls locator.focus() followed by keyboard.press(). If your handler clicks a button between these two actions, the focused element most likely will be wrong, and key press will happen on the unexpected element. Use locator.press() instead to avoid this problem.Another example is a series of mouse actions, where mouse.move() is followed by mouse.down(). Again, when the handler runs between these two actions, the mouse position will be wrong during the mouse down. Prefer self-contained actions like locator.click() that do not rely on the state being unchanged by a handler

An example that closes a "Sign up to the newsletter" dialog when it appears: // Setup the handler.await page.addLocatorHandler(page.getByText('Sign up to the newsletter'), async () => { await page.getByRole('button', { name: 'No thanks' }).click();});// Write the test as usual.await page.goto('https://example.com');await page.getByRole('button', { name: 'Start here' }).click(); An example that skips the "Confirm your security details" page when it is shown: // Setup the handler.await page.addLocatorHandler(page.getByText('Confirm your security details'), async () => { await page.getByRole('button', { name: 'Remind me later' }).click();});// Write the test as usual.await page.goto('https://example.com');await page.getByRole('button', { name: 'Start here' }).click(); An example with a custom callback on every actionability check. It uses a <body> locator that is always visible, so the handler is called before every actionability check. It is important to specify noWaitAfter, because the handler does not hide the <body> element. // Setup the handler.await page.addLocatorHandler(page.locator('body'), async () => { await page.evaluate(() => window.removeObstructionsForTestIfNeeded());}, { noWaitAfter: true });// Write the test as usual.await page.goto('https://example.com');await page.getByRole('button', { name: 'Start here' }).click(); Handler takes the original locator as an argument. You can also automatically remove the handler after a number of invocations by setting times: await page.addLocatorHandler(page.getByLabel('Close'), async locator => { await locator.click();}, { times: 1 }); Arguments locator Locator# Locator that triggers the handler. handler function(Locator):Promise<Object># Function that should be run once locator appears. This function should get rid of the element that blocks actions like click. options Object (optional) noWaitAfter boolean (optional) Added in: v1.44# By default, after calling the handler Playwright will wait until the overlay becomes hidden, and only then Playwright will continue with the action/assertion that triggered the handler. This option allows to opt-out of this behavior, so that overlay can stay visible after the handler has run. times number (optional) Added in: v1.44# Specifies the maximum number of times this handler should be called. Unlimited by default

Promise<void># add

## ScriptTag

Added before v1.9 page.addScriptTag Adds a <script> tag into the page with the desired url or content

the added tag when the script's onload fires or when the script content was injected into frame

await page.addScriptTag();await page.addScriptTag(options); Arguments options Object (optional) content string (optional)# Raw JavaScript content to be injected into frame. path string (optional)# Path to the JavaScript file to be injected into frame. If path is a relative path, then it is resolved relative to the current working directory. type string (optional)# Script type. Use 'module' in order to load a JavaScript ES6 module. See script for more details. url string (optional)# URL of a script to be added

Promise<ElementHandle># add

## StyleTag

Added before v1.9 page.addStyleTag Adds a <link rel="stylesheet"> tag into the page with the desired url or a <style type="text/css"> tag with the content

the added tag when the stylesheet's onload fires or when the CSS content was injected into frame

await page.addStyleTag();await page.addStyleTag(options); Arguments options Object (optional) content string (optional)# Raw CSS content to be injected into frame. path string (optional)# Path to the CSS file to be injected into frame. If path is a relative path, then it is resolved relative to the current working directory. url string (optional)# URL of the <link> tag

Promise<ElementHandle># aria

## Snapshot

Added in: v1.59 page.ariaSnapshot Captures the aria snapshot of the page. Read more about aria snapshots

await page.ariaSnapshot();await page.ariaSnapshot(options); Arguments options Object (optional) depth number (optional)# When specified, limits the depth of the snapshot. mode "ai" | "default" (optional)# When set to "ai", returns a snapshot optimized for AI consumption: including element references like [ref=e2] and snapshots of <iframe>s. Defaults to "default". timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<string># bring

## ToFront

Added before v1.9 page.bringToFront Brings page to front (activates tab)

await page.bringToFront(); Returns Promise<void># cancel

## PickLocator

Added in: v1.59 page.cancelPickLocator Cancels an ongoing page.pickLocator() call by deactivating pick locator mode. If no pick locator mode is active, this method is a no-op

await page.cancelPickLocator(); Returns Promise<void># clear

## ConsoleMessages

Added in: v1.59 page.clearConsoleMessages Clears all stored console messages from this page. Subsequent calls to page.consoleMessages() will only return messages logged after the clear

await page.clearConsoleMessages(); Returns Promise<void># clear

## PageErrors

Added in: v1.59 page.clearPageErrors Clears all stored page errors from this page. Subsequent calls to page.pageErrors() will only return errors thrown after the clear

await page.clearPageErrors(); Returns Promise<void># close​ Added before v1.9 page.close If runBeforeUnload is false, does not run any unload handlers and waits for the page to be closed. If runBeforeUnload is true the method will run unload handlers, but will not wait for the page to close. By default, page.close() does not run beforeunload handlers. noteif runBeforeUnload is passed as true, a beforeunload dialog might be summoned and should be handled manually via page.on('dialog') event

await page.close();await page.close(options); Arguments options Object (optional) reason string (optional) Added in: v1.40# The reason to be reported to the operations interrupted by the page closure. runBeforeUnload boolean (optional)# Defaults to false. Whether to run the before unload page handlers

Promise<void># console

## Messages

Added in: v1.56 page.consoleMessages Returns up to (currently) 200 last console messages from this page. See page.on('console') for more details

await page.consoleMessages();await page.consoleMessages(options); Arguments options Object (optional) filter "all" | "since-navigation" (optional) Added in: v1.59# Controls which messages are returned: Returns Promise<Array<ConsoleMessage>># content​ Added before v1.9 page.content Gets the full HTML contents of the page, including the doctype

await page.content(); Returns Promise<string># context​ Added before v1.9 page.context Get the browser context that the page belongs to

page.context(); Returns BrowserContext# drag

## AndDrop

Added in: v1.13 page.dragAndDrop This method drags the source element to the target element. It will first move to the source element, perform a mousedown, then move to the target element and perform a mouseup

await page.dragAndDrop('#source', '#target');// or specify exact positions relative to the top-left corners of the elements:await page.dragAndDrop('#source', '#target', { sourcePosition: { x: 34, y: 7 }, targetPosition: { x: 10, y: 20 },}); Arguments source string# A selector to search for an element to drag. If there are multiple elements satisfying the selector, the first will be used. target string# A selector to search for an element to drop onto. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. sourcePosition Object (optional) Added in: v1.14# x number y number Clicks on the source element at this point relative to the top-left corner of the element's padding box. If not specified, some visible point of the element is used. steps number (optional) Added in: v1.57# Defaults to 1. Sends n interpolated mousemove events to represent travel between the mousedown and mouseup of the drag. When set to 1, emits a single mousemove event at the destination location. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. targetPosition Object (optional) Added in: v1.14# x number y number Drops on the target element at this point relative to the top-left corner of the element's padding box. If not specified, some visible point of the element is used. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional)# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it

Promise<void># emulate

## Media

Added before v1.9 page.emulateMedia This method changes the CSS media type through the media argument, and/or the 'prefers-colors-scheme' media feature, using the colorScheme argument

await page.evaluate(() => matchMedia('screen').matches);// → trueawait page.evaluate(() => matchMedia('print').matches);// → falseawait page.emulateMedia({ media: 'print' });await page.evaluate(() => matchMedia('screen').matches);// → falseawait page.evaluate(() => matchMedia('print').matches);// → trueawait page.emulateMedia({});await page.evaluate(() => matchMedia('screen').matches);// → trueawait page.evaluate(() => matchMedia('print').matches);// → false await page.emulateMedia({ colorScheme: 'dark' });await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches);// → trueawait page.evaluate(() => matchMedia('(prefers-color-scheme: light)').matches);// → false Arguments options Object (optional) colorScheme null | "light" | "dark" | "no-preference" (optional) Added in: v1.9# Emulates prefers-colors-scheme media feature, supported values are 'light' and 'dark'. Passing null disables color scheme emulation. 'no-preference' is deprecated. contrast null | "no-preference" | "more" (optional) Added in: v1.51# Emulates 'prefers-contrast' media feature, supported values are 'no-preference', 'more'. Passing null disables contrast emulation. forcedColors null | "active" | "none" (optional) Added in: v1.15# Emulates 'forced-colors' media feature, supported values are 'active' and 'none'. Passing null disables forced colors emulation. media null | "screen" | "print" (optional) Added in: v1.9# Changes the CSS media type of the page. The only allowed values are 'screen', 'print' and null. Passing null disables CSS media emulation. reducedMotion null | "reduce" | "no-preference" (optional) Added in: v1.12# Emulates 'prefers-reduced-motion' media feature, supported values are 'reduce', 'no-preference'. Passing null disables reduced motion emulation

Promise<void># evaluate​ Added before v1.9 page.evaluate Returns the value of the pageFunction invocation. If the function passed to the page.evaluate() returns a Promise, then page.evaluate() would wait for the promise to resolve and return its value. If the function passed to the page.evaluate() returns a non-Serializable value, then page.evaluate() resolves to undefined. Playwright also supports transferring some additional values that are not serializable by JSON: -0, NaN, Infinity, -Infinity

Passing argument to pageFunction: const result = await page.evaluate(([x, y]) => { return Promise.resolve(x \* y);}, [7, 8]);console.log(result); // prints "56" A string can also be passed in instead of a function: console.log(await page.evaluate('1 + 2')); // prints "3"const x = 10;console.log(await page.evaluate(`1 + ${x}`)); // prints "11" ElementHandle instances can be passed as an argument to the page.evaluate(): const bodyHandle = await page.evaluate('document.body');const html = await page.evaluate<string, HTMLElement>(([body, suffix]) => body.innerHTML + suffix, [bodyHandle, 'hello']);await bodyHandle.dispose(); Arguments pageFunction function | string# Function to be evaluated in the page context. arg EvaluationArgument (optional)# Optional argument to pass to pageFunction

Promise<Serializable># evaluate

## Handle

Added before v1.9 page.evaluateHandle Returns the value of the pageFunction invocation as a JSHandle. The only difference between page.evaluate() and page.evaluateHandle() is that page.evaluateHandle() returns JSHandle. If the function passed to the page.evaluateHandle() returns a Promise, then page.evaluateHandle() would wait for the promise to resolve and return its value

// Handle for the window object.const aWindowHandle = await page.evaluateHandle(() => Promise.resolve(window)); A string can also be passed in instead of a function: const aHandle = await page.evaluateHandle('document'); // Handle for the 'document' JSHandle instances can be passed as an argument to the page.evaluateHandle(): const aHandle = await page.evaluateHandle(() => document.body);const resultHandle = await page.evaluateHandle(body => body.innerHTML, aHandle);console.log(await resultHandle.jsonValue());await resultHandle.dispose(); Arguments pageFunction function | string# Function to be evaluated in the page context. arg EvaluationArgument (optional)# Optional argument to pass to pageFunction

Promise<JSHandle># expose

## Binding

Added before v1.9 page.exposeBinding The method adds a function called name on the window object of every frame in this page. When called, the function executes callback and returns a Promise which resolves to the return value of callback. If the callback returns a Promise, it will be awaited. The first argument of the callback function contains information about the caller: { browserContext: BrowserContext, page: Page, frame: Frame }. See browserContext.exposeBinding() for the context-wide version. noteFunctions installed via page.exposeBinding() survive navigations

An example of exposing page URL to all frames in a page: const { webkit } = require('playwright'); // Or 'chromium' or 'firefox'.(async () => { const browser = await webkit.launch({ headless: false }); const context = await browser.newContext(); const page = await context.newPage(); await page.exposeBinding('pageURL', ({ page }) => page.url()); await page.setContent(`<script> async function onClick() { document.querySelector('div').textContent = await window.pageURL(); } </script> <button onclick="onClick()">Click me</button> <div></div>`); await page.click('button');})(); Arguments name string# Name of the function on the window object. callback function# Callback function that will be called in the Playwright's context. options Object (optional) handle boolean (optional)# DeprecatedThis option will be removed in the future. Whether to pass the argument as a handle, instead of passing by value. When passing a handle, only one argument is supported. When passing by value, multiple arguments are supported

Promise<Disposable># expose

## Function

Added before v1.9 page.exposeFunction The method adds a function called name on the window object of every frame in the page. When called, the function executes callback and returns a Promise which resolves to the return value of callback. If the callback returns a Promise, it will be awaited. See browserContext.exposeFunction() for context-wide exposed function. noteFunctions installed via page.exposeFunction() survive navigations

An example of adding a sha256 function to the page: const { webkit } = require('playwright'); // Or 'chromium' or 'firefox'.const crypto = require('crypto');(async () => { const browser = await webkit.launch({ headless: false }); const page = await browser.newPage(); await page.exposeFunction('sha256', text => crypto.createHash('sha256').update(text).digest('hex'), ); await page.setContent(`<script> async function onClick() { document.querySelector('div').textContent = await window.sha256('PLAYWRIGHT'); } </script> <button onclick="onClick()">Click me</button> <div></div>`); await page.click('button');})(); Arguments name string# Name of the function on the window object callback function# Callback function which will be called in Playwright's context

Promise<Disposable># frame​ Added before v1.9 page.frame Returns frame matching the specified criteria. Either name or url must be specified

const frame = page.frame('frame-name'); const frame = page.frame({ url: /._domain._/ }); Arguments frameSelector string | Object# name string (optional) Frame name specified in the iframe's name attribute. Optional. url string | RegExp | [URLPattern] | function(URL):boolean (optional) A glob pattern, regex pattern, URL pattern, or predicate receiving frame's url as a URL object. Optional. Frame name or other frame lookup options

null | Frame# frame

## Locator

Added in: v1.17 page.frameLocator When working with iframes, you can create a frame locator that will enter the iframe and allow selecting elements in that iframe

Following snippet locates element with text "Submit" in the iframe with id my-frame, like <iframe id="my-frame">: const locator = page.frameLocator('#my-iframe').getByText('Submit');await locator.click(); Arguments selector string# A selector to use when resolving DOM element

FrameLocator# frames​ Added before v1.9 page.frames An array of all frames attached to the page

page.frames(); Returns Array<Frame># get

## ByAltText

Added in: v1.27 page.getByAltText Allows locating elements by their alt text

For example, this method will find the image by alt text "Playwright logo": <img alt='Playwright logo'> await page.getByAltText('Playwright logo').click(); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# get

## ByLabel

Added in: v1.27 page.getByLabel Allows locating input elements by the text of the associated <label> or aria-labelledby element, or by the aria-label attribute

For example, this method will find inputs by label "Username" and "Password" in the following DOM: <input aria-label="Username"><label for="password-input">Password:</label><input id="password-input"> await page.getByLabel('Username').fill('john');await page.getByLabel('Password').fill('secret'); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# get

## ByPlaceholder

Added in: v1.27 page.getByPlaceholder Allows locating input elements by the placeholder text

For example, consider the following DOM structure. <input type="email" placeholder="name@example.com" /> You can fill the input after locating it by the placeholder text: await page .getByPlaceholder('name@example.com') .fill('playwright@microsoft.com'); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# get

## ByRole

Added in: v1.27 page.getByRole Allows locating elements by their ARIA role, ARIA attributes and accessible name

Consider the following DOM structure. <h3>Sign up</h3><label> <input type="checkbox" /> Subscribe</label><br/><button>Submit</button> You can locate each element by its implicit role: await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();await page.getByRole('checkbox', { name: 'Subscribe' }).check();await page.getByRole('button', { name: /submit/i }).click(); Arguments role "alert" | "alertdialog" | "application" | "article" | "banner" | "blockquote" | "button" | "caption" | "cell" | "checkbox" | "code" | "columnheader" | "combobox" | "complementary" | "contentinfo" | "definition" | "deletion" | "dialog" | "directory" | "document" | "emphasis" | "feed" | "figure" | "form" | "generic" | "grid" | "gridcell" | "group" | "heading" | "img" | "insertion" | "link" | "list" | "listbox" | "listitem" | "log" | "main" | "marquee" | "math" | "meter" | "menu" | "menubar" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "navigation" | "none" | "note" | "option" | "paragraph" | "presentation" | "progressbar" | "radio" | "radiogroup" | "region" | "row" | "rowgroup" | "rowheader" | "scrollbar" | "search" | "searchbox" | "separator" | "slider" | "spinbutton" | "status" | "strong" | "subscript" | "superscript" | "switch" | "tab" | "table" | "tablist" | "tabpanel" | "term" | "textbox" | "time" | "timer" | "toolbar" | "tooltip" | "tree" | "treegrid" | "treeitem"# Required aria role. options Object (optional) checked boolean (optional)# An attribute that is usually set by aria-checked or native <input type=checkbox> controls. Learn more about aria-checked. disabled boolean (optional)# An attribute that is usually set by aria-disabled or disabled. noteUnlike most other attributes, disabled is inherited through the DOM hierarchy. Learn more about aria-disabled. exact boolean (optional) Added in: v1.28# Whether name is matched exactly: case-sensitive and whole-string. Defaults to false. Ignored when name is a regular expression. Note that exact match still trims whitespace. expanded boolean (optional)# An attribute that is usually set by aria-expanded. Learn more about aria-expanded. includeHidden boolean (optional)# Option that controls whether hidden elements are matched. By default, only non-hidden elements, as defined by ARIA, are matched by role selector. Learn more about aria-hidden. level number (optional)# A number attribute that is usually present for roles heading, listitem, row, treeitem, with default values for <h1>-<h6> elements. Learn more about aria-level. name string | RegExp (optional)# Option to match the accessible name. By default, matching is case-insensitive and searches for a substring, use exact to control this behavior. Learn more about accessible name. pressed boolean (optional)# An attribute that is usually set by aria-pressed. Learn more about aria-pressed. selected boolean (optional)# An attribute that is usually set by aria-selected. Learn more about aria-selected

Locator# Details Role selector does not replace accessibility audits and conformance tests, but rather gives early feedback about the ARIA guidelines. Many html elements have an implicitly defined role that is recognized by the role selector. You can find all the supported roles here. ARIA guidelines do not recommend duplicating implicit roles and attributes by setting role and/or aria-\* attributes to default values. get

## ByTestId

Added in: v1.27 page.getByTestId Locate element by the test id

Consider the following DOM structure. <button data-testid="directions">Itinéraire</button> You can locate the element by its test id: await page.getByTestId('directions').click(); Arguments testId string | RegExp# Id to locate the element by

Locator# Details By default, the data-testid attribute is used as a test id. Use selectors.setTestIdAttribute() to configure a different test id attribute if necessary. // Set custom test id attribute from @playwright/test config:import { defineConfig } from '@playwright/test';export default defineConfig({ use: { testIdAttribute: 'data-pw' },}); get

## ByText

Added in: v1.27 page.getByText Allows locating elements that contain given text. See also locator.filter() that allows to match by another criteria, like an accessible role, and then filter by the text content

Consider the following DOM structure: <div>Hello <span>world</span></div><div>Hello</div> You can locate by text substring, exact string, or a regular expression: // Matches <span>page.getByText('world');// Matches first <div>page.getByText('Hello world');// Matches second <div>page.getByText('Hello', { exact: true });// Matches both <div>spage.getByText(/Hello/);// Matches second <div>page.getByText(/^hello$/i); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# Details Matching by text always normalizes whitespace, even with exact match. For example, it turns multiple spaces into one, turns line breaks into spaces and ignores leading and trailing whitespace. Input elements of the type button and submit are matched by their value instead of the text content. For example, locating by text "Log in" matches <input type=button value="Log in">. get

## ByTitle

Added in: v1.27 page.getByTitle Allows locating elements by their title attribute

Consider the following DOM structure. <span title='Issues count'>25 issues</span> You can check the issues count after locating it by the title text: await expect(page.getByTitle('Issues count')).toHaveText('25 issues'); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# go

## Back

Added before v1.9 page.goBack Returns the main resource response. In case of multiple redirects, the navigation will resolve with the response of the last redirect. If cannot go back, returns null. Navigate to the previous page in history

await page.goBack();await page.goBack(options); Arguments options Object (optional) timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods. waitUntil "load" | "domcontentloaded" | "networkidle" | "commit" (optional)# When to consider operation succeeded, defaults to load

can be either: 'domcontentloaded' - consider operation to be finished when the DOMContentLoaded event is fired. 'load' - consider operation to be finished when the load event is fired. 'networkidle' - DISCOURAGED consider operation to be finished when there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. 'commit' - consider operation to be finished when network response is received and the document started loading

Promise<null | Response># go

## Forward

Added before v1.9 page.goForward Returns the main resource response. In case of multiple redirects, the navigation will resolve with the response of the last redirect. If cannot go forward, returns null. Navigate to the next page in history

await page.goForward();await page.goForward(options); Arguments options Object (optional) timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods. waitUntil "load" | "domcontentloaded" | "networkidle" | "commit" (optional)# When to consider operation succeeded, defaults to load

can be either: 'domcontentloaded' - consider operation to be finished when the DOMContentLoaded event is fired. 'load' - consider operation to be finished when the load event is fired. 'networkidle' - DISCOURAGED consider operation to be finished when there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. 'commit' - consider operation to be finished when network response is received and the document started loading

Promise<null | Response># goto​ Added before v1.9 page.goto Returns the main resource response. In case of multiple redirects, the navigation will resolve with the first non-redirect response. The method will throw an error if: there's an SSL error (e.g. in case of self-signed certificates). target URL is invalid. the timeout is exceeded during navigation. the remote server does not respond or is unreachable. the main resource failed to load. The method will not throw an error when any valid HTTP status code is returned by the remote server, including 404 "Not Found" and 500 "Internal Server Error". The status code for such responses can be retrieved by calling response.status(). noteThe method either throws an error or returns a main resource response. The only exceptions are navigation to about:blank or navigation to the same URL with a different hash, which would succeed and return null. noteHeadless mode doesn't support navigation to a PDF document. See the upstream issue

await page.goto(url);await page.goto(url, options); Arguments url string# URL to navigate page to. The url should include scheme, e.g. https://. When a baseURL via the context options was provided and the passed URL is a path, it gets merged via the new URL() constructor. options Object (optional) referer string (optional)# Referer header value. If provided it will take preference over the referer header value set by page.setExtraHTTPHeaders(). timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods. waitUntil "load" | "domcontentloaded" | "networkidle" | "commit" (optional)# When to consider operation succeeded, defaults to load

can be either: 'domcontentloaded' - consider operation to be finished when the DOMContentLoaded event is fired. 'load' - consider operation to be finished when the load event is fired. 'networkidle' - DISCOURAGED consider operation to be finished when there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. 'commit' - consider operation to be finished when network response is received and the document started loading

Promise<null | Response># is

## Closed

Added before v1.9 page.isClosed Indicates that the page has been closed

page.isClosed(); Returns boolean# locator​ Added in: v1.14 page.locator The method returns an element locator that can be used to perform actions on this page / frame. Locator is resolved to the element immediately before performing an action, so a series of actions on the same locator can in fact be performed on different DOM elements. That would happen if the DOM structure between those actions has changed. Learn more about locators

page.locator(selector);page.locator(selector, options); Arguments selector string# A selector to use when resolving DOM element. options Object (optional) has Locator (optional)# Narrows down the results of the method to those which contain elements matching this relative locator. For example, article that has text=Playwright matches <article><div>Playwright</div></article>. Inner locator must be relative to the outer locator and is queried starting with the outer locator match, not the document root. For example, you can find content that has div in <article><content><div>Playwright</div></content></article>. However, looking for content that has article div will fail, because the inner locator must be relative and should not use any elements outside the content. Note that outer and inner locators must belong to the same frame. Inner locator must not contain FrameLocators. hasNot Locator (optional) Added in: v1.33# Matches elements that do not contain an element that matches an inner locator. Inner locator is queried against the outer one. For example, article that does not have div matches <article><span>Playwright</span></article>. Note that outer and inner locators must belong to the same frame. Inner locator must not contain FrameLocators. hasNotText string | RegExp (optional) Added in: v1.33# Matches elements that do not contain specified text somewhere inside, possibly in a child or a descendant element. When passed a string, matching is case-insensitive and searches for a substring. hasText string | RegExp (optional)# Matches elements containing specified text somewhere inside, possibly in a child or a descendant element. When passed a string, matching is case-insensitive and searches for a substring. For example, "Playwright" matches <article><div>Playwright</div></article>

Locator# main

## Frame

Added before v1.9 page.mainFrame The page's main frame. Page is guaranteed to have a main frame which persists during navigations

page.mainFrame(); Returns Frame# opener​ Added before v1.9 page.opener Returns the opener for popup pages and null for others. If the opener has been closed already the returns null

await page.opener(); Returns Promise<null | Page># page

## Errors

Added in: v1.56 page.pageErrors Returns up to (currently) 200 last page errors from this page. See page.on('pageerror') for more details

await page.pageErrors();await page.pageErrors(options); Arguments options Object (optional) filter "all" | "since-navigation" (optional) Added in: v1.59# Controls which errors are returned: Returns Promise<Array<Error>># pause​ Added in: v1.9 page.pause Pauses script execution. Playwright will stop executing the script and wait for the user to either press the 'Resume' button in the page overlay or to call playwright.resume() in the DevTools console. User can inspect selectors or perform manual steps while paused. Resume will continue running the original script from the place it was paused. noteThis method requires Playwright to be started in a headed mode, with a falsy headless option

await page.pause(); Returns Promise<void># pdf​ Added before v1.9 page.pdf Returns the PDF buffer. page.pdf() generates a pdf of the page with print css media. To generate a pdf with screen media, call page.emulateMedia() before calling page.pdf(): noteBy default, page.pdf() generates a pdf with modified colors for printing. Use the -webkit-print-color-adjust property to force rendering of exact colors

// Generates a PDF with 'screen' media type.await page.emulateMedia({ media: 'screen' });await page.pdf({ path: 'page.pdf' }); The width, height, and margin options accept values labeled with units. Unlabeled values are treated as pixels. A few examples: page.pdf({width: 100}) - prints with width set to 100 pixels page.pdf({width: '100px'}) - prints with width set to 100 pixels page.pdf({width: '10cm'}) - prints with width set to 10 centimeters. All possible units are: px - pixel in - inch cm - centimeter mm - millimeter The format options are: Letter: 8.5in x 11in Legal: 8.5in x 14in Tabloid: 11in x 17in Ledger: 17in x 11in A0: 33.1in x 46.8in A1: 23.4in x 33.1in A2: 16.54in x 23.4in A3: 11.7in x 16.54in A4: 8.27in x 11.7in A5: 5.83in x 8.27in A6: 4.13in x 5.83in noteheaderTemplate and footerTemplate markup have the following limitations: > 1. Script tags inside templates are not evaluated. > 2. Page styles are not visible inside templates

options Object (optional) displayHeaderFooter boolean (optional)# Display header and footer. Defaults to false. footerTemplate string (optional)# HTML template for the print footer. Should use the same format as the headerTemplate. format string (optional)# Paper format. If set, takes priority over width or height options. Defaults to 'Letter'. headerTemplate string (optional)# HTML template for the print header. Should be valid HTML markup with following classes used to inject printing values into them: 'date' formatted print date 'title' document title 'url' document location 'pageNumber' current page number 'totalPages' total pages in the document height string | number (optional)# Paper height, accepts values labeled with units. landscape boolean (optional)# Paper orientation. Defaults to false. margin Object (optional)# top string | number (optional) Top margin, accepts values labeled with units. Defaults to 0. right string | number (optional) Right margin, accepts values labeled with units. Defaults to 0. bottom string | number (optional) Bottom margin, accepts values labeled with units. Defaults to 0. left string | number (optional) Left margin, accepts values labeled with units. Defaults to 0. Paper margins, defaults to none. outline boolean (optional) Added in: v1.42# Whether or not to embed the document outline into the PDF. Defaults to false. pageRanges string (optional)# Paper ranges to print, e.g., '1-5, 8, 11-13'. Defaults to the empty string, which means print all pages. path string (optional)# The file path to save the PDF to. If path is a relative path, then it is resolved relative to the current working directory. If no path is provided, the PDF won't be saved to the disk. preferCSSPageSize boolean (optional)# Give any CSS @page size declared in the page priority over what is declared in width and height or format options. Defaults to false, which will scale the content to fit the paper size. printBackground boolean (optional)# Print background graphics. Defaults to false. scale number (optional)# Scale of the webpage rendering. Defaults to 1. Scale amount must be between 0.1 and 2. tagged boolean (optional) Added in: v1.42# Whether or not to generate tagged (accessible) PDF. Defaults to false. width string | number (optional)# Paper width, accepts values labeled with units

Promise<Buffer># pick

## Locator

Added in: v1.59 page.pickLocator Enters pick locator mode where hovering over page elements highlights them and shows the corresponding locator. Once the user clicks an element, the mode is deactivated and the Locator for the picked element is returned

const locator = await page.pickLocator();console.log(locator); Returns Promise<Locator># reload​ Added before v1.9 page.reload This method reloads the current page, in the same way as if the user had triggered a browser refresh

the main resource response. In case of multiple redirects, the navigation will resolve with the response of the last redirect

await page.reload();await page.reload(options); Arguments options Object (optional) timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods. waitUntil "load" | "domcontentloaded" | "networkidle" | "commit" (optional)# When to consider operation succeeded, defaults to load

can be either: 'domcontentloaded' - consider operation to be finished when the DOMContentLoaded event is fired. 'load' - consider operation to be finished when the load event is fired. 'networkidle' - DISCOURAGED consider operation to be finished when there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. 'commit' - consider operation to be finished when network response is received and the document started loading

Promise<null | Response># remove

## AllListeners

Added in: v1.47 page.removeAllListeners Removes all the listeners of the given type (or all registered listeners if no type given). Allows to wait for async listeners to complete or to ignore subsequent errors from these listeners

page.on('request', async request => { const response = await request.response(); const body = await response.body(); console.log(body.byteLength);});await page.goto('https://playwright.dev', { waitUntil: 'domcontentloaded' });// Waits for all the reported 'request' events to resolve.await page.removeAllListeners('request', { behavior: 'wait' }); Arguments type string (optional)# options Object (optional) behavior "wait" | "ignoreErrors" | "default" (optional)# Specifies whether to wait for already running listeners and what to do if they throw errors: 'default' - do not wait for current listener calls (if any) to finish, if the listener throws, it may result in unhandled error 'wait' - wait for current listener calls (if any) to finish 'ignoreErrors' - do not wait for current listener calls (if any) to finish, all errors thrown by the listeners after removal are silently caught Returns Promise<void># remove

## LocatorHandler

Added in: v1.44 page.removeLocatorHandler Removes all locator handlers added by page.addLocatorHandler() for a specific locator

await page.removeLocatorHandler(locator); Arguments locator Locator# Locator passed to page.addLocatorHandler()

Promise<void># requestGC​ Added in: v1.48 page.requestGC Request the page to perform garbage collection. Note that there is no guarantee that all unreachable objects will be collected. This is useful to help detect memory leaks. For example, if your page has a large object 'suspect' that might be leaked, you can check that it does not leak by using a WeakRef. // 1. In your page, save a WeakRef for the "suspect".await page.evaluate(() => globalThis.suspectWeakRef = new WeakRef(suspect));// 2. Request garbage collection.await page.requestGC();// 3. Check that weak ref does not deref to the original object.expect(await page.evaluate(() => !globalThis.suspectWeakRef.deref())).toBe(true); Usage await page.requestGC(); Returns Promise<void># requests​ Added in: v1.56 page.requests Returns up to (currently) 100 last network request from this page. See page.on('request') for more details. Returned requests should be accessed immediately, otherwise they might be collected to prevent unbounded memory growth as new requests come in. Once collected, retrieving most information about the request is impossible. Note that requests reported through the page.on('request') request are not collected, so there is a trade off between efficient memory usage with page.requests() and the amount of available information reported through page.on('request')

await page.requests(); Returns Promise<Array<Request>># route​ Added before v1.9 page.route Routing provides the capability to modify network requests that are made by a page. Once routing is enabled, every request matching the url pattern will stall unless it's continued, fulfilled or aborted. noteThe handler will only be called for the first url if the response is a redirect. notepage.route() will not intercept requests intercepted by Service Worker. See this issue. We recommend disabling Service Workers when using request interception by setting serviceWorkers to 'block'. notepage.route() will not intercept the first request of a popup page. Use browserContext.route() instead

An example of a naive handler that aborts all image requests: const page = await browser.newPage();await page.route('**/\*.{png,jpg,jpeg}', route => route.abort());await page.goto('https://example.com');await browser.close(); or the same snippet using a regex pattern instead: const page = await browser.newPage();await page.route(/(\.png$)|(\.jpg$)/, route => route.abort());await page.goto('https://example.com');await browser.close(); It is possible to examine the request to decide the route action. For example, mocking all requests that contain some post data, and leaving all other requests as is: await page.route('/api/**', async route => { if (route.request().postData().includes('my-string')) await route.fulfill({ body: 'mocked-data' }); else await route.continue();}); If a request matches multiple registered routes, the most recently registered route takes precedence. Page routes take precedence over browser context routes (set up with browserContext.route()) when request matches both handlers. To remove a route with its handler you can use page.unroute(). noteEnabling routing disables http cache

url string | RegExp | [URLPattern] | function(URL):boolean# A glob pattern, regex pattern, URL pattern, or predicate that receives a URL to match during routing. If baseURL is set in the context options and the provided URL is a string that does not start with \*, it is resolved using the new URL() constructor. handler function(Route, Request):Promise<Object> | Object# handler function to route the request. options Object (optional) times number (optional) Added in: v1.15# How often a route should be used. By default it will be used every time

Promise<Disposable># route

## FromHAR

Added in: v1.23 page.routeFromHAR If specified the network requests that are made in the page will be served from the HAR file. Read more about Replaying from HAR. Playwright will not serve requests intercepted by Service Worker from the HAR file. See this issue. We recommend disabling Service Workers when using request interception by setting serviceWorkers to 'block'

await page.routeFromHAR(har);await page.routeFromHAR(har, options); Arguments har string# Path to a HAR file with prerecorded network data. If path is a relative path, then it is resolved relative to the current working directory. options Object (optional) notFound "abort" | "fallback" (optional)# If set to 'abort' any request not found in the HAR file will be aborted. If set to 'fallback' missing requests will be sent to the network. Defaults to abort. update boolean (optional)# If specified, updates the given HAR with the actual network information instead of serving from file. The file is written to disk when browserContext.close() is called. updateContent "embed" | "attach" (optional) Added in: v1.32# Optional setting to control resource content management. If attach is specified, resources are persisted as separate files or entries in the ZIP archive. If embed is specified, content is stored inline the HAR file. updateMode "full" | "minimal" (optional) Added in: v1.32# When set to minimal, only record information necessary for routing from HAR. This omits sizes, timing, page, cookies, security and other types of HAR information that are not used when replaying from HAR. Defaults to minimal. url string | RegExp (optional)# A glob pattern, regular expression or predicate to match the request URL. Only requests with URL matching the pattern will be served from the HAR file. If not specified, all requests are served from the HAR file

Promise<void># route

## WebSocket

Added in: v1.48 page.routeWebSocket This method allows to modify websocket connections that are made by the page. Note that only WebSockets created after this method was called will be routed. It is recommended to call this method before navigating the page

Below is an example of a simple mock that responds to a single message. See WebSocketRoute for more details and examples. await page.routeWebSocket('/ws', ws => { ws.onMessage(message => { if (message === 'request') ws.send('response'); });}); Arguments url string | RegExp | [URLPattern] | function(URL):boolean# Only WebSockets with the url matching this pattern will be routed. A string pattern can be relative to the baseURL context option. handler function(WebSocketRoute):Promise<Object> | Object# Handler function to route the WebSocket

Promise<void># screenshot​ Added before v1.9 page.screenshot Returns the buffer with the captured screenshot

await page.screenshot();await page.screenshot(options); Arguments options Object (optional) animations "disabled" | "allow" (optional)# When set to "disabled", stops CSS animations, CSS transitions and Web Animations. Animations get different treatment depending on their duration: finite animations are fast-forwarded to completion, so they'll fire transitionend event. infinite animations are canceled to initial state, and then played over after the screenshot. Defaults to "allow" that leaves animations untouched. caret "hide" | "initial" (optional)# When set to "hide", screenshot will hide text caret. When set to "initial", text caret behavior will not be changed. Defaults to "hide". clip Object (optional)# x number x-coordinate of top-left corner of clip area y number y-coordinate of top-left corner of clip area width number width of clipping area height number height of clipping area An object which specifies clipping of the resulting image. fullPage boolean (optional)# When true, takes a screenshot of the full scrollable page, instead of the currently visible viewport. Defaults to false. mask Array<Locator> (optional)# Specify locators that should be masked when the screenshot is taken. Masked elements will be overlaid with a pink box #FF00FF (customized by maskColor) that completely covers its bounding box. The mask is also applied to invisible elements, see Matching only visible elements to disable that. maskColor string (optional) Added in: v1.35# Specify the color of the overlay box for masked elements, in CSS color format. Default color is pink #FF00FF. omitBackground boolean (optional)# Hides default white background and allows capturing screenshots with transparency. Not applicable to jpeg images. Defaults to false. path string (optional)# The file path to save the image to. The screenshot type will be inferred from file extension. If path is a relative path, then it is resolved relative to the current working directory. If no path is provided, the image won't be saved to the disk. quality number (optional)# The quality of the image, between 0-100. Not applicable to png images. scale "css" | "device" (optional)# When set to "css", screenshot will have a single pixel per each css pixel on the page. For high-dpi devices, this will keep screenshots small. Using "device" option will produce a single pixel per each device pixel, so screenshots of high-dpi devices will be twice as large or even larger. Defaults to "device". style string (optional) Added in: v1.41# Text of the stylesheet to apply while making the screenshot. This is where you can hide dynamic elements, make elements invisible or change their properties to help you creating repeatable screenshots. This stylesheet pierces the Shadow DOM and applies to the inner frames. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. type "png" | "jpeg" (optional)# Specify screenshot type, defaults to png

Promise<Buffer># set

## Content

Added before v1.9 page.setContent This method internally calls document.write(), inheriting all its specific characteristics and behaviors

await page.setContent(html);await page.setContent(html, options); Arguments html string# HTML markup to assign to the page. options Object (optional) timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods. waitUntil "load" | "domcontentloaded" | "networkidle" | "commit" (optional)# When to consider operation succeeded, defaults to load

can be either: 'domcontentloaded' - consider operation to be finished when the DOMContentLoaded event is fired. 'load' - consider operation to be finished when the load event is fired. 'networkidle' - DISCOURAGED consider operation to be finished when there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. 'commit' - consider operation to be finished when network response is received and the document started loading

Promise<void># set

## DefaultNavigationTimeout

Added before v1.9 page.setDefaultNavigationTimeout This setting will change the default maximum navigation time for the following methods and related shortcuts: page.goBack() page.goForward() page.goto() page.reload() page.setContent() page.waitForNavigation() page.waitForURL() notepage.setDefaultNavigationTimeout() takes priority over page.setDefaultTimeout(), browserContext.setDefaultTimeout() and browserContext.setDefaultNavigationTimeout()

page.setDefaultNavigationTimeout(timeout); Arguments timeout number#

## Maximum navigation time in milliseconds setDefaultTimeout

Added before v1.9 page.setDefaultTimeout This setting will change the default maximum time for all the methods accepting timeout option. notepage.setDefaultNavigationTimeout() takes priority over page.setDefaultTimeout()

page.setDefaultTimeout(timeout); Arguments timeout number#

## Maximum time in milliseconds. Pass 0 to disable timeout. setExtraHTTPHeaders

Added before v1.9 page.setExtraHTTPHeaders The extra HTTP headers will be sent with every request the page initiates. notepage.setExtraHTTPHeaders() does not guarantee the order of headers in the outgoing requests

await page.setExtraHTTPHeaders(headers); Arguments headers Object<string, string># An object containing additional HTTP headers to be sent with every request. All header values must be strings

Promise<void># set

## ViewportSize

Added before v1.9 page.setViewportSize In the case of multiple pages in a single browser, each page can have its own viewport size. However, browser.newContext() allows to set viewport size (and more) for all pages in the context at once. page.setViewportSize() will resize the page. A lot of websites don't expect phones to change size, so you should set the viewport size before navigating to the page. page.setViewportSize() will also reset screen size, use browser.newContext() with screen and viewport parameters if you need better control of these properties

const page = await browser.newPage();await page.setViewportSize({ width: 640, height: 480,});await page.goto('https://example.com'); Arguments viewportSize Object# width number page width in pixels. height number page height in pixels

Promise<void># title​ Added before v1.9 page.title Returns the page's title

await page.title(); Returns Promise<string># unroute​ Added before v1.9 page.unroute Removes a route created with page.route(). When handler is not specified, removes all routes for the url

await page.unroute(url);await page.unroute(url, handler); Arguments url string | RegExp | [URLPattern] | function(URL):boolean# A glob pattern, regex pattern, URL pattern, or predicate receiving URL to match while routing. handler function(Route, Request):Promise<Object> | Object (optional)# Optional handler function to route the request

Promise<void># unroute

## All

Added in: v1.41 page.unrouteAll Removes all routes created with page.route() and page.routeFromHAR()

await page.unrouteAll();await page.unrouteAll(options); Arguments options Object (optional) behavior "wait" | "ignoreErrors" | "default" (optional)# Specifies whether to wait for already running handlers and what to do if they throw errors: 'default' - do not wait for current handler calls (if any) to finish, if unrouted handler throws, it may result in unhandled error 'wait' - wait for current handler calls (if any) to finish 'ignoreErrors' - do not wait for current handler calls (if any) to finish, all errors thrown by the handlers after unrouting are silently caught Returns Promise<void># url​ Added before v1.9 page.url Usage page.url(); Returns string# video​ Added before v1.9 page.video Video object associated with this page. Can be used to access the video file when using the recordVideo context option

page.video(); Returns null | Video# viewport

## Size

Added before v1.9 page.viewportSize Usage page.viewportSize(); Returns null | Object# width number page width in pixels. height number page height in pixels. wait

## ForEvent

Added before v1.9 page.waitForEvent Waits for event to fire and passes its value into the predicate function

when the predicate returns truthy value. Will throw an error if the page is closed before the event is fired

the event data value

// Start waiting for download before clicking. Note no await.const downloadPromise = page.waitForEvent('download');await page.getByText('Download file').click();const download = await downloadPromise; Arguments event string# Event name, same one typically passed into \*.on(event). optionsOrPredicate function | Object (optional)# predicate function Receives the event data and resolves to truthy value when the waiting should resolve. timeout number (optional) Maximum time to wait for in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. Either a predicate that receives an event or an options object. Optional. options Object (optional) predicate function (optional)# Receives the event data and resolves to truthy value when the waiting should resolve

Promise<Object># wait

## ForFunction

Added before v1.9 page.waitForFunction Returns when the pageFunction returns a truthy value. It resolves to a JSHandle of the truthy value

The page.waitForFunction() can be used to observe viewport size change: const { webkit } = require('playwright'); // Or 'chromium' or 'firefox'.(async () => { const browser = await webkit.launch(); const page = await browser.newPage(); const watchDog = page.waitForFunction(() => window.innerWidth < 100); await page.setViewportSize({ width: 50, height: 50 }); await watchDog; await browser.close();})(); To pass an argument to the predicate of page.waitForFunction() function: const selector = '.foo';await page.waitForFunction(selector => !!document.querySelector(selector), selector); Arguments pageFunction function | string# Function to be evaluated in the page context. arg EvaluationArgument (optional)# Optional argument to pass to pageFunction. options Object (optional) polling number | "raf" (optional)# If polling is 'raf', then pageFunction is constantly executed in requestAnimationFrame callback. If polling is a number, then it is treated as an interval in milliseconds at which the function would be executed. Defaults to raf. timeout number (optional)# Maximum time to wait for in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<JSHandle># wait

## ForLoadState

Added before v1.9 page.waitForLoadState Returns when the required load state has been reached. This resolves when the page reaches a required load state, load by default. The navigation must have been committed when this method is called. If current document has already reached the required state, resolves immediately. noteMost of the time, this method is not needed because Playwright auto-waits before every action

await page.getByRole('button').click(); // Click triggers navigation.await page.waitForLoadState(); // The promise resolves after 'load' event. const popupPromise = page.waitForEvent('popup');await page.getByRole('button').click(); // Click triggers a popup.const popup = await popupPromise;await popup.waitForLoadState('domcontentloaded'); // Wait for the 'DOMContentLoaded' event.console.log(await popup.title()); // Popup is ready to use

state "load" | "domcontentloaded" | "networkidle" (optional)# Optional load state to wait for, defaults to load. If the state has been already reached while loading current document, the method resolves immediately. Can be one of: 'load' - wait for the load event to be fired. 'domcontentloaded' - wait for the DOMContentLoaded event to be fired. 'networkidle' - DISCOURAGED wait until there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. options Object (optional) timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods

Promise<void># wait

## ForRequest

Added before v1.9 page.waitForRequest Waits for the matching request and returns it. See waiting for event for more details about events

// Start waiting for request before clicking. Note no await.const requestPromise = page.waitForRequest('https://example.com/resource');await page.getByText('trigger request').click();const request = await requestPromise;// Alternative way with a predicate. Note no await.const requestPromise = page.waitForRequest(request => request.url() === 'https://example.com' && request.method() === 'GET',);await page.getByText('trigger request').click();const request = await requestPromise; Arguments urlOrPredicate string | RegExp | function(Request):boolean | Promise<boolean># Request URL string, regex or predicate receiving Request object. options Object (optional) timeout number (optional)# Maximum wait time in milliseconds, defaults to 30 seconds, pass 0 to disable the timeout. The default value can be changed by using the page.setDefaultTimeout() method

Promise<Request># wait

## ForResponse

Added before v1.9 page.waitForResponse Returns the matched response. See waiting for event for more details about events

// Start waiting for response before clicking. Note no await.const responsePromise = page.waitForResponse('https://example.com/resource');await page.getByText('trigger response').click();const response = await responsePromise;// Alternative way with a predicate. Note no await.const responsePromise = page.waitForResponse(response => response.url() === 'https://example.com' && response.status() === 200 && response.request().method() === 'GET');await page.getByText('trigger response').click();const response = await responsePromise; Arguments urlOrPredicate string | RegExp | function(Response):boolean | Promise<boolean># Request URL string, regex or predicate receiving Response object. When a baseURL via the context options was provided and the passed URL is a path, it gets merged via the new URL() constructor. options Object (optional) timeout number (optional)# Maximum wait time in milliseconds, defaults to 30 seconds, pass 0 to disable the timeout. The default value can be changed by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<Response># wait

## ForURL

Added in: v1.11 page.waitForURL Waits for the main frame to navigate to the given URL

await page.click('a.delayed-navigation'); // Clicking the link will indirectly cause a navigationawait page.waitForURL('\*\*/target.html'); Arguments url string | RegExp | [URLPattern] | function(URL):boolean# A glob pattern, regex pattern, URL pattern, or predicate receiving URL to match while waiting for the navigation. Note that if the parameter is a string without wildcard characters, the method will wait for navigation to URL that is exactly equal to the string. options Object (optional) timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods. waitUntil "load" | "domcontentloaded" | "networkidle" | "commit" (optional)# When to consider operation succeeded, defaults to load

can be either: 'domcontentloaded' - consider operation to be finished when the DOMContentLoaded event is fired. 'load' - consider operation to be finished when the load event is fired. 'networkidle' - DISCOURAGED consider operation to be finished when there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. 'commit' - consider operation to be finished when network response is received and the document started loading

Promise<void># workers​ Added before v1.9 page.workers This method returns all of the dedicated WebWorkers associated with the page. noteThis does not contain ServiceWorkers Usage page.workers(); Returns Array<Worker>#

## Properties

clock​ Added in: v1.45 page.clock Playwright has ability to mock clock and passage of time.

## Usage page.clock Type Clock coverage

Added before v1.9 page.coverage noteOnly available for Chromium atm. Browser-specific Coverage implementation.

## See Coverage for more details

page.coverage Type Coverage keyboard

## Added before v1.9 page.keyboard Usage page.keyboard Type Keyboard mouse

## Added before v1.9 page.mouse Usage page.mouse Type Mouse request

Added in: v1.16 page.request API testing helper associated with this page. This method returns the same instance as browserContext.request on the page's context. See browserContext.request for more details.

## Usage page.request Type APIRequestContext screencast

Added in: v1.59 page.screencast Screencast object associated with this page

page.screencast.on('screencastFrame', data => { console.log('received frame, jpeg size:', data.length);});await page.screencast.start();// ... perform actions ...await page.screencast.stop();

## Type Screencast touchscreen

## Added before v1.9 page.touchscreen Usage page.touchscreen Type Touchscreen Events

on('close')​ Added before v1.9 page.on('close') Emitted when the page closes

page.on('close', data => {});

## Event data Page on('console')

Added before v1.9 page.on('console') Emitted when JavaScript within the page calls one of console API methods, e.g. console.log or console.dir. The arguments passed into console.log are available on the ConsoleMessage event handler argument

page.on('console', async msg => { const values = []; for (const arg of msg.args()) values.push(await arg.jsonValue()); console.log(...values);});await page.evaluate(() => console.log('hello', 5, { foo: 'bar' }));

## Event data ConsoleMessage on('crash')

Added before v1.9 page.on('crash') Emitted when the page crashes. Browser pages might crash if they try to allocate too much memory. When the page crashes, ongoing and subsequent operations will throw. The most common way to deal with crashes is to catch an exception: try { // Crash might happen during a click. await page.click('button'); // Or while waiting for an event. await page.waitForEvent('popup');} catch (e) { // When the page crashes, exception message contains 'crash'.} Usage page.on('crash', data => {});

## Event data Page on('dialog')

Added before v1.9 page.on('dialog') Emitted when a JavaScript dialog appears, such as alert, prompt, confirm or beforeunload. Listener must either dialog.accept() or dialog.dismiss() the dialog - otherwise the page will freeze waiting for the dialog, and actions like click will never finish

page.on('dialog', dialog => dialog.accept()); noteWhen no page.on('dialog') or browserContext.on('dialog') listeners are present, all dialogs are automatically dismissed.

## Event data Dialog on('domcontentloaded')

Added in: v1.9 page.on('domcontentloaded') Emitted when the JavaScript DOMContentLoaded event is dispatched

page.on('domcontentloaded', data => {});

## Event data Page on('download')

Added before v1.9 page.on('download') Emitted when attachment download started. User can access basic file operations on downloaded content via the passed Download instance

page.on('download', data => {});

## Event data Download on('filechooser')

Added in: v1.9 page.on('filechooser') Emitted when a file chooser is supposed to appear, such as after clicking the <input type=file>. Playwright can respond to it via setting the input files using fileChooser.setFiles() that can be uploaded after that. page.on('filechooser', async fileChooser => { await fileChooser.setFiles(path.join(\_\_dirname, '/tmp/myfile.pdf'));}); Usage page.on('filechooser', data => {});

## Event data FileChooser on('frameattached')

Added in: v1.9 page.on('frameattached') Emitted when a frame is attached

page.on('frameattached', data => {});

## Event data Frame on('framedetached')

Added in: v1.9 page.on('framedetached') Emitted when a frame is detached

page.on('framedetached', data => {});

## Event data Frame on('framenavigated')

Added in: v1.9 page.on('framenavigated') Emitted when a frame is navigated to a new url

page.on('framenavigated', data => {});

## Event data Frame on('load')

Added before v1.9 page.on('load') Emitted when the JavaScript load event is dispatched

page.on('load', data => {});

## Event data Page on('pageerror')

Added in: v1.9 page.on('pageerror') Emitted when an uncaught exception happens within the page. // Log all uncaught errors to the terminalpage.on('pageerror', exception => { console.log(`Uncaught exception: "${exception}"`);});// Navigate to a page with an exception.await page.goto('data:text/html,<script>throw new Error("Test")</script>'); Usage page.on('pageerror', data => {});

## Event data Error on('popup')

Added before v1.9 page.on('popup') Emitted when the page opens a new tab or window. This event is emitted in addition to the browserContext.on('page'), but only for popups relevant to this page. The earliest moment that page is available is when it has navigated to the initial url. For example, when opening a popup with window.open('http://example.com'), this event will fire when the network request to "http://example.com" is done and its response has started loading in the popup. If you would like to route/listen to this network request, use browserContext.route() and browserContext.on('request') respectively instead of similar methods on the Page. // Start waiting for popup before clicking. Note no await.const popupPromise = page.waitForEvent('popup');await page.getByText('open the popup').click();const popup = await popupPromise;console.log(await popup.evaluate('location.href')); noteUse page.waitForLoadState() to wait until the page gets to a particular state (you should not need it in most cases)

page.on('popup', data => {});

## Event data Page on('request')

Added before v1.9 page.on('request') Emitted when a page issues a request. The request object is read-only. In order to intercept and mutate requests, see page.route() or browserContext.route()

page.on('request', data => {});

## Event data Request on('requestfailed')

Added in: v1.9 page.on('requestfailed') Emitted when a request fails, for example by timing out. page.on('requestfailed', request => { console.log(request.url() + ' ' + request.failure().errorText);}); noteHTTP Error responses, such as 404 or 503, are still successful responses from HTTP standpoint, so request will complete with page.on('requestfinished') event and not with page.on('requestfailed'). A request will only be considered failed when the client cannot get an HTTP response from the server, e.g. due to network error net::ERR_FAILED

page.on('requestfailed', data => {});

## Event data Request on('requestfinished')

Added in: v1.9 page.on('requestfinished') Emitted when a request finishes successfully after downloading the response body. For a successful response, the sequence of events is request, response and requestfinished

page.on('requestfinished', data => {});

## Event data Request on('response')

Added before v1.9 page.on('response') Emitted when response status and headers are received for a request. For a successful response, the sequence of events is request, response and requestfinished

page.on('response', data => {});

## Event data Response on('websocket')

Added in: v1.9 page.on('websocket') Emitted when WebSocket request is sent

page.on('websocket', data => {});

## Event data WebSocket on('worker')

Added before v1.9 page.on('worker') Emitted when a dedicated WebWorker is spawned by the page

page.on('worker', data => {});

## Event data Worker Deprecated

$​ Added in: v1.9 page.$ DiscouragedUse locator-based page.locator() instead. Read more about locators. The method finds an element matching the specified selector within the page. If no elements match the selector, the return value resolves to null. To wait for an element on the page, use locator.waitFor()

await page.$(selector);await page.$(selector, options); Arguments selector string# A selector to query for. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception

Promise<null | ElementHandle># $​ Added in: v1.9 page.$ DiscouragedUse locator-based page.locator() instead. Read more about locators. The method finds all elements matching the specified selector within the page. If no elements match the selector, the return value resolves to []

await page.$(selector); Arguments selector string# A selector to query for

Promise<Array<ElementHandle>># $eval​ Added in: v1.9 page.$eval DiscouragedThis method does not wait for the element to pass actionability checks and therefore can lead to the flaky tests. Use locator.evaluate(), other Locator helper methods or web-first assertions instead. The method finds an element matching the specified selector within the page and passes it as a first argument to pageFunction. If no elements match the selector, the method throws an error

the value of pageFunction. If pageFunction returns a Promise, then page.$eval() would wait for the promise to resolve and return its value

const searchValue = await page.$eval('#search', el => el.value);const preloadHref = await page.$eval('link[rel=preload]', el => el.href);const html = await page.$eval('.main-container', (e, suffix) => e.outerHTML + suffix, 'hello');// In TypeScript, this example requires an explicit type annotation (HTMLLinkElement) on el:const preloadHrefTS = await page.$eval('link[rel=preload]', (el: HTMLLinkElement) => el.href); Arguments selector string# A selector to query for. pageFunction function(Element) | string# Function to be evaluated in the page context. arg EvaluationArgument (optional)# Optional argument to pass to pageFunction. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception

Promise<Serializable># $eval​ Added in: v1.9 page.$eval DiscouragedIn most cases, locator.evaluateAll(), other Locator helper methods and web-first assertions do a better job. The method finds all elements matching the specified selector within the page and passes an array of matched elements as a first argument to pageFunction

the result of pageFunction invocation. If pageFunction returns a Promise, then page.$eval() would wait for the promise to resolve and return its value

const divCounts = await page.$eval('div', (divs, min) => divs.length >= min, 10); Arguments selector string# A selector to query for. pageFunction function(Array<Element>) | string# Function to be evaluated in the page context. arg EvaluationArgument (optional)# Optional argument to pass to pageFunction

Promise<Serializable># check​ Added before v1.9 page.check DiscouragedUse locator-based locator.check() instead. Read more about locators. This method checks an element matching selector by performing the following steps: Find an element matching selector. If there is none, wait until a matching element is attached to the DOM. Ensure that matched element is a checkbox or a radio input. If not, this method throws. If the element is already checked, this method returns immediately. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.mouse to click in the center of the element. Ensure that the element is now checked. If not, this method throws. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this

await page.check(selector);await page.check(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional) Added in: v1.11# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional) Added in: v1.11# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it

Promise<void># click​ Added before v1.9 page.click DiscouragedUse locator-based locator.click() instead. Read more about locators. This method clicks an element matching selector by performing the following steps: Find an element matching selector. If there is none, wait until a matching element is attached to the DOM. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.mouse to click in the center of the element, or the specified position. Wait for initiated navigations to either succeed or fail, unless noWaitAfter option is set. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this

await page.click(selector);await page.click(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) button "left" | "right" | "middle" (optional)# Defaults to left. clickCount number (optional)# defaults to 1. See UIEvent.detail. delay number (optional)# Time to wait between mousedown and mouseup in milliseconds. Defaults to 0. force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. modifiers Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"> (optional)# Modifier keys to press. Ensures that only these modifiers are pressed during the operation, and then restores current modifiers back. If not specified, currently pressed modifiers are used. "ControlOrMeta" resolves to "Control" on Windows and Linux and to "Meta" on macOS. noWaitAfter boolean (optional)# DeprecatedThis option will default to true in the future. Actions that initiate navigations are waiting for these navigations to happen and for pages to start loading. You can opt out of waiting via setting this flag. You would only need this option in the exceptional cases such as navigating to inaccessible pages. Defaults to false. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional) Added in: v1.11# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it. Note that keyboard modifiers will be pressed regardless of trial to allow testing elements which are only visible when those keys are pressed

Promise<void># dblclick​ Added before v1.9 page.dblclick DiscouragedUse locator-based locator.dblclick() instead. Read more about locators. This method double clicks an element matching selector by performing the following steps: Find an element matching selector. If there is none, wait until a matching element is attached to the DOM. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.mouse to double click in the center of the element, or the specified position. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this. notepage.dblclick() dispatches two click events and a single dblclick event

await page.dblclick(selector);await page.dblclick(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) button "left" | "right" | "middle" (optional)# Defaults to left. delay number (optional)# Time to wait between mousedown and mouseup in milliseconds. Defaults to 0. force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. modifiers Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"> (optional)# Modifier keys to press. Ensures that only these modifiers are pressed during the operation, and then restores current modifiers back. If not specified, currently pressed modifiers are used. "ControlOrMeta" resolves to "Control" on Windows and Linux and to "Meta" on macOS. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional) Added in: v1.11# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it. Note that keyboard modifiers will be pressed regardless of trial to allow testing elements which are only visible when those keys are pressed

Promise<void># dispatch

## Event

Added before v1.9 page.dispatchEvent DiscouragedUse locator-based locator.dispatchEvent() instead. Read more about locators. The snippet below dispatches the click event on the element. Regardless of the visibility state of the element, click is dispatched. This is equivalent to calling element.click()

await page.dispatchEvent('button#submit', 'click'); Under the hood, it creates an instance of an event based on the given type, initializes it with eventInit properties and dispatches it on the element

are composed, cancelable and bubble by default. Since eventInit is event-specific, please refer to the events documentation for the lists of initial properties: DeviceMotionEvent DeviceOrientationEvent DragEvent Event FocusEvent KeyboardEvent MouseEvent PointerEvent TouchEvent WheelEvent You can also specify JSHandle as the property value if you want live objects to be passed into the event: // Note you can only create DataTransfer in Chromium and Firefoxconst dataTransfer = await page.evaluateHandle(() => new DataTransfer());await page.dispatchEvent('#source', 'dragstart', { dataTransfer }); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. type string# DOM event type: "click", "dragstart", etc. eventInit EvaluationArgument (optional)# Optional event-specific initialization properties. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># fill​ Added before v1.9 page.fill DiscouragedUse locator-based locator.fill() instead. Read more about locators. This method waits for an element matching selector, waits for actionability checks, focuses the element, fills it and triggers an input event after filling. Note that you can pass an empty string to clear the input field. If the target element is not an <input>, <textarea> or [contenteditable] element, this method throws an error. However, if the element is inside the <label> element that has an associated control, the control will be filled instead. To send fine-grained keyboard events, use locator.pressSequentially()

await page.fill(selector, value);await page.fill(selector, value, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. value string# Value to fill for the <input>, <textarea> or [contenteditable] element. options Object (optional) force boolean (optional) Added in: v1.13# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># focus​ Added before v1.9 page.focus DiscouragedUse locator-based locator.focus() instead. Read more about locators. This method fetches an element with selector and focuses it. If there's no element matching selector, the method waits until a matching element appears in the DOM

await page.focus(selector);await page.focus(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># get

## Attribute

Added before v1.9 page.getAttribute DiscouragedUse locator-based locator.getAttribute() instead. Read more about locators

element attribute value

await page.getAttribute(selector, name);await page.getAttribute(selector, name, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. name string# Attribute name to get the value for. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<null | string># hover​ Added before v1.9 page.hover DiscouragedUse locator-based locator.hover() instead. Read more about locators. This method hovers over an element matching selector by performing the following steps: Find an element matching selector. If there is none, wait until a matching element is attached to the DOM. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.mouse to hover over the center of the element, or the specified position. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this

await page.hover(selector);await page.hover(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. modifiers Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"> (optional)# Modifier keys to press. Ensures that only these modifiers are pressed during the operation, and then restores current modifiers back. If not specified, currently pressed modifiers are used. "ControlOrMeta" resolves to "Control" on Windows and Linux and to "Meta" on macOS. noWaitAfter boolean (optional) Added in: v1.28# DeprecatedThis option has no effect. This option has no effect. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional) Added in: v1.11# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it. Note that keyboard modifiers will be pressed regardless of trial to allow testing elements which are only visible when those keys are pressed

Promise<void># inner

## HTML

Added before v1.9 page.innerHTML DiscouragedUse locator-based locator.innerHTML() instead. Read more about locators

element.innerHTML

await page.innerHTML(selector);await page.innerHTML(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<string># inner

## Text

Added before v1.9 page.innerText DiscouragedUse locator-based locator.innerText() instead. Read more about locators

element.innerText

await page.innerText(selector);await page.innerText(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<string># input

## Value

Added in: v1.13 page.inputValue DiscouragedUse locator-based locator.inputValue() instead. Read more about locators

input.value for the selected <input> or <textarea> or <select> element. Throws for non-input elements. However, if the element is inside the <label> element that has an associated control, returns the value of the control

await page.inputValue(selector);await page.inputValue(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<string># is

## Checked

Added before v1.9 page.isChecked DiscouragedUse locator-based locator.isChecked() instead. Read more about locators

whether the element is checked. Throws if the element is not a checkbox or radio input

await page.isChecked(selector);await page.isChecked(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<boolean># is

## Disabled

Added before v1.9 page.isDisabled DiscouragedUse locator-based locator.isDisabled() instead. Read more about locators

whether the element is disabled, the opposite of enabled

await page.isDisabled(selector);await page.isDisabled(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<boolean># is

## Editable

Added before v1.9 page.isEditable DiscouragedUse locator-based locator.isEditable() instead. Read more about locators

whether the element is editable

await page.isEditable(selector);await page.isEditable(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<boolean># is

## Enabled

Added before v1.9 page.isEnabled DiscouragedUse locator-based locator.isEnabled() instead. Read more about locators

whether the element is enabled

await page.isEnabled(selector);await page.isEnabled(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<boolean># is

## Hidden

Added before v1.9 page.isHidden DiscouragedUse locator-based locator.isHidden() instead. Read more about locators

whether the element is hidden, the opposite of visible. selector that does not match any elements is considered hidden

await page.isHidden(selector);await page.isHidden(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# DeprecatedThis option is ignored. page.isHidden() does not wait for the element to become hidden and returns immediately

Promise<boolean># is

## Visible

Added before v1.9 page.isVisible DiscouragedUse locator-based locator.isVisible() instead. Read more about locators

whether the element is visible. selector that does not match any elements is considered not visible

await page.isVisible(selector);await page.isVisible(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# DeprecatedThis option is ignored. page.isVisible() does not wait for the element to become visible and returns immediately

Promise<boolean># press​ Added before v1.9 page.press DiscouragedUse locator-based locator.press() instead. Read more about locators. Focuses the element, and then uses keyboard.down() and keyboard.up(). key can specify the intended keyboardEvent.key value or a single character to generate the text for. A superset of the key values can be found here. Examples of the keys are: F1 - F12, Digit0- Digit9, KeyA- KeyZ, Backquote, Minus, Equal, Backslash, Backspace, Tab, Delete, Escape, ArrowDown, End, Enter, Home, Insert, PageDown, PageUp, ArrowRight, ArrowUp, etc. Following modification shortcuts are also supported: Shift, Control, Alt, Meta, ShiftLeft, ControlOrMeta. ControlOrMeta resolves to Control on Windows and Linux and to Meta on macOS. Holding down Shift will type the text that corresponds to the key in the upper case. If key is a single character, it is case-sensitive, so the values a and A will generate different respective texts. Shortcuts such as key: "Control+o", key: "Control++ or key: "Control+Shift+T" are supported as well. When specified with the modifier, modifier is pressed and being held while the subsequent key is being pressed

const page = await browser.newPage();await page.goto('https://keycode.info');await page.press('body', 'A');await page.screenshot({ path: 'A.png' });await page.press('body', 'ArrowLeft');await page.screenshot({ path: 'ArrowLeft.png' });await page.press('body', 'Shift+O');await page.screenshot({ path: 'O.png' });await browser.close(); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. key string# Name of the key to press or a character to generate, such as ArrowLeft or a. options Object (optional) delay number (optional)# Time to wait between keydown and keyup in milliseconds. Defaults to 0. noWaitAfter boolean (optional)# DeprecatedThis option will default to true in the future. Actions that initiate navigations are waiting for these navigations to happen and for pages to start loading. You can opt out of waiting via setting this flag. You would only need this option in the exceptional cases such as navigating to inaccessible pages. Defaults to false. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># select

## Option

Added before v1.9 page.selectOption DiscouragedUse locator-based locator.selectOption() instead. Read more about locators. This method waits for an element matching selector, waits for actionability checks, waits until all specified options are present in the <select> element and selects these options. If the target element is not a <select> element, this method throws an error. However, if the element is inside the <label> element that has an associated control, the control will be used instead

the array of option values that have been successfully selected. Triggers a change and input event once all the provided options have been selected

// Single selection matching the value or labelpage.selectOption('select#colors', 'blue');// single selection matching the labelpage.selectOption('select#colors', { label: 'Blue' });// multiple selectionpage.selectOption('select#colors', ['red', 'green', 'blue']); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. values null | string | ElementHandle | Array<string> | Object | Array<ElementHandle> | Array<Object># value string (optional) Matches by option.value. Optional. label string (optional) Matches by option.label. Optional. index number (optional) Matches by the index. Optional. Options to select. If the <select> has the multiple attribute, all matching options are selected, otherwise only the first option matching one of the passed options is selected. String values are matching both values and labels. Option is considered matching if all specified properties match. options Object (optional) force boolean (optional) Added in: v1.13# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<Array<string>># set

## Checked

Added in: v1.15 page.setChecked DiscouragedUse locator-based locator.setChecked() instead. Read more about locators. This method checks or unchecks an element matching selector by performing the following steps: Find an element matching selector. If there is none, wait until a matching element is attached to the DOM. Ensure that matched element is a checkbox or a radio input. If not, this method throws. If the element already has the right checked state, this method returns immediately. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.mouse to click in the center of the element. Ensure that the element is now checked or unchecked. If not, this method throws. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this

await page.setChecked(selector, checked);await page.setChecked(selector, checked, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. checked boolean# Whether to check or uncheck the checkbox. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. strict boolean (optional)# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional)# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it

Promise<void># set

## InputFiles

Added before v1.9 page.setInputFiles DiscouragedUse locator-based locator.setInputFiles() instead. Read more about locators. Sets the value of the file input to these file paths or files. If some of the filePaths are relative paths, then they are resolved relative to the current working directory. For empty array, clears the selected files. For inputs with a [webkitdirectory] attribute, only a single directory path is supported. This method expects selector to point to an input element. However, if the element is inside the <label> element that has an associated control, targets the control instead

await page.setInputFiles(selector, files);await page.setInputFiles(selector, files, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. files string | Array<string> | Object | Array<Object># name string File name mimeType string File type buffer Buffer File content options Object (optional) noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># tap​ Added before v1.9 page.tap DiscouragedUse locator-based locator.tap() instead. Read more about locators. This method taps an element matching selector by performing the following steps: Find an element matching selector. If there is none, wait until a matching element is attached to the DOM. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.touchscreen to tap the center of the element, or the specified position. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this. notepage.tap() the method will throw if hasTouch option of the browser context is false

await page.tap(selector);await page.tap(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. modifiers Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"> (optional)# Modifier keys to press. Ensures that only these modifiers are pressed during the operation, and then restores current modifiers back. If not specified, currently pressed modifiers are used. "ControlOrMeta" resolves to "Control" on Windows and Linux and to "Meta" on macOS. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional) Added in: v1.11# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it. Note that keyboard modifiers will be pressed regardless of trial to allow testing elements which are only visible when those keys are pressed

Promise<void># text

## Content

Added before v1.9 page.textContent DiscouragedUse locator-based locator.textContent() instead. Read more about locators

element.textContent

await page.textContent(selector);await page.textContent(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<null | string># type​ Added before v1.9 page.type DeprecatedIn most cases, you should use locator.fill() instead. You only need to press keys one by one if there is special keyboard handling on the page - in this case use locator.pressSequentially(). Sends a keydown, keypress/input, and keyup event for each character in the text. page.type can be used to send fine-grained keyboard events. To fill values in form fields, use page.fill(). To press a special key, like Control or ArrowDown, use keyboard.press()

Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. text string# A text to type into a focused element. options Object (optional) delay number (optional)# Time to wait between key presses in milliseconds. Defaults to 0. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># uncheck​ Added before v1.9 page.uncheck DiscouragedUse locator-based locator.uncheck() instead. Read more about locators. This method unchecks an element matching selector by performing the following steps: Find an element matching selector. If there is none, wait until a matching element is attached to the DOM. Ensure that matched element is a checkbox or a radio input. If not, this method throws. If the element is already unchecked, this method returns immediately. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.mouse to click in the center of the element. Ensure that the element is now unchecked. If not, this method throws. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this

await page.uncheck(selector);await page.uncheck(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional) Added in: v1.11# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional) Added in: v1.11# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it

Promise<void># wait

## ForNavigation

Added before v1.9 page.waitForNavigation DeprecatedThis method is inherently racy, please use page.waitForURL() instead. Waits for the main frame navigation and returns the main resource response. In case of multiple redirects, the navigation will resolve with the response of the last redirect. In case of navigation to a different anchor or navigation due to History API usage, the navigation will resolve with null

This resolves when the page navigates to a new URL or reloads. It is useful for when you run code which will indirectly cause the page to navigate. e.g. The click target has an onclick handler that triggers navigation from a setTimeout. Consider this example: // Start waiting for navigation before clicking. Note no await.const navigationPromise = page.waitForNavigation();await page.getByText('Navigate after timeout').click();await navigationPromise; noteUsage of the History API to change the URL is considered a navigation

options Object (optional) timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods. url string | RegExp | [URLPattern] | function(URL):boolean (optional)# A glob pattern, regex pattern, URL pattern, or predicate receiving URL to match while waiting for the navigation. Note that if the parameter is a string without wildcard characters, the method will wait for navigation to URL that is exactly equal to the string. waitUntil "load" | "domcontentloaded" | "networkidle" | "commit" (optional)# When to consider operation succeeded, defaults to load

can be either: 'domcontentloaded' - consider operation to be finished when the DOMContentLoaded event is fired. 'load' - consider operation to be finished when the load event is fired. 'networkidle' - DISCOURAGED consider operation to be finished when there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. 'commit' - consider operation to be finished when network response is received and the document started loading

Promise<null | Response># wait

## ForSelector

Added before v1.9 page.waitForSelector DiscouragedUse web assertions that assert visibility or a locator-based locator.waitFor() instead. Read more about locators

when element specified by selector satisfies state option

null if waiting for hidden or detached. notePlaywright automatically waits for element to be ready before performing an action. Using Locator objects and web-first assertions makes the code wait-for-selector-free. Wait for the selector to satisfy state option (either appear/disappear from dom, or become visible/hidden). If at the moment of calling the method selector already satisfies the condition, the method will return immediately. If the selector doesn't satisfy the condition for the timeout milliseconds, the function will throw

This method works across navigations: const { chromium } = require('playwright'); // Or 'firefox' or 'webkit'.(async () => { const browser = await chromium.launch(); const page = await browser.newPage(); for (const currentURL of ['https://google.com', 'https://bbc.com']) { await page.goto(currentURL); const element = await page.waitForSelector('img'); console.log('Loaded image: ' + await element.getAttribute('src')); } await browser.close();})(); Arguments selector string# A selector to query for. options Object (optional) state "attached" | "detached" | "visible" | "hidden" (optional)# Defaults to 'visible'. Can be either: 'attached' - wait for element to be present in DOM. 'detached' - wait for element to not be present in DOM. 'visible' - wait for element to have non-empty bounding box and no visibility:hidden. Note that element without any content or with display:none has an empty bounding box and is not considered visible. 'hidden' - wait for element to be either detached from DOM, or have an empty bounding box or visibility:hidden. This is opposite to the 'visible' option. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<null | ElementHandle># wait

## ForTimeout

Added before v1.9 page.waitForTimeout DiscouragedNever wait for timeout in production. Tests that wait for time are inherently flaky. Use Locator actions and web assertions that wait automatically. Waits for the given timeout in milliseconds. Note that page.waitForTimeout() should only be used for debugging. Tests using the timer in production are going to be flaky. Use signals such as network events, selectors becoming visible and others instead

// wait for 1 secondawait page.waitForTimeout(1000); Arguments timeout number# A timeout to wait for Returns Promise<void>#

add

## InitScript

Added before v1.9 page.addInitScript Adds a script which would be evaluated in one of the following scenarios: Whenever the page is navigated. Whenever the child frame is attached or navigated. In this case, the script is evaluated in the context of the newly attached frame. The script is evaluated after the document was created but before any of its scripts were run. This is useful to amend the JavaScript environment, e.g. to seed Math.random

An example of overriding Math.random before the page loads: // preload.jsMath.random = () => 42; // In your playwright script, assuming the preload.js file is in same directoryawait page.addInitScript({ path: './preload.js' }); await page.addInitScript(mock => { window.mock = mock;}, mock); noteThe order of evaluation of multiple scripts installed via browserContext.addInitScript() and page.addInitScript() is not defined

script function | string | Object# path string (optional) Path to the JavaScript file. If path is a relative path, then it is resolved relative to the current working directory. Optional. content string (optional) Raw script content. Optional. Script to be evaluated in the page. arg Serializable (optional)# Optional argument to pass to script (only supported when passing a function)

Promise<Disposable># add

## LocatorHandler

Added in: v1.42 page.addLocatorHandler When testing a web page, sometimes unexpected overlays like a "Sign up" dialog appear and block actions you want to automate, e.g. clicking a button. These overlays don't always show up in the same way or at the same time, making them tricky to handle in automated tests. This method lets you set up a special function, called a handler, that activates when it detects that overlay is visible. The handler's job is to remove the overlay, allowing your test to continue as if the overlay wasn't there. Things to keep in mind: When an overlay is shown predictably, we recommend explicitly waiting for it in your test and dismissing it as a part of your normal test flow, instead of using page.addLocatorHandler(). Playwright checks for the overlay every time before executing or retrying an action that requires an actionability check, or before performing an auto-waiting assertion check. When overlay is visible, Playwright calls the handler first, and then proceeds with the action/assertion. Note that the handler is only called when you perform an action/assertion - if the overlay becomes visible but you don't perform any actions, the handler will not be triggered. After executing the handler, Playwright will ensure that overlay that triggered the handler is not visible anymore. You can opt-out of this behavior with noWaitAfter. The execution time of the handler counts towards the timeout of the action/assertion that executed the handler. If your handler takes too long, it might cause timeouts. You can register multiple handlers. However, only a single handler will be running at a time. Make sure the actions within a handler don't depend on another handler. warningRunning the handler will alter your page state mid-test. For example it will change the currently focused element and move the mouse. Make sure that actions that run after the handler are self-contained and do not rely on the focus and mouse state being unchanged.For example, consider a test that calls locator.focus() followed by keyboard.press(). If your handler clicks a button between these two actions, the focused element most likely will be wrong, and key press will happen on the unexpected element. Use locator.press() instead to avoid this problem.Another example is a series of mouse actions, where mouse.move() is followed by mouse.down(). Again, when the handler runs between these two actions, the mouse position will be wrong during the mouse down. Prefer self-contained actions like locator.click() that do not rely on the state being unchanged by a handler

An example that closes a "Sign up to the newsletter" dialog when it appears: // Setup the handler.await page.addLocatorHandler(page.getByText('Sign up to the newsletter'), async () => { await page.getByRole('button', { name: 'No thanks' }).click();});// Write the test as usual.await page.goto('https://example.com');await page.getByRole('button', { name: 'Start here' }).click(); An example that skips the "Confirm your security details" page when it is shown: // Setup the handler.await page.addLocatorHandler(page.getByText('Confirm your security details'), async () => { await page.getByRole('button', { name: 'Remind me later' }).click();});// Write the test as usual.await page.goto('https://example.com');await page.getByRole('button', { name: 'Start here' }).click(); An example with a custom callback on every actionability check. It uses a <body> locator that is always visible, so the handler is called before every actionability check. It is important to specify noWaitAfter, because the handler does not hide the <body> element. // Setup the handler.await page.addLocatorHandler(page.locator('body'), async () => { await page.evaluate(() => window.removeObstructionsForTestIfNeeded());}, { noWaitAfter: true });// Write the test as usual.await page.goto('https://example.com');await page.getByRole('button', { name: 'Start here' }).click(); Handler takes the original locator as an argument. You can also automatically remove the handler after a number of invocations by setting times: await page.addLocatorHandler(page.getByLabel('Close'), async locator => { await locator.click();}, { times: 1 }); Arguments locator Locator# Locator that triggers the handler. handler function(Locator):Promise<Object># Function that should be run once locator appears. This function should get rid of the element that blocks actions like click. options Object (optional) noWaitAfter boolean (optional) Added in: v1.44# By default, after calling the handler Playwright will wait until the overlay becomes hidden, and only then Playwright will continue with the action/assertion that triggered the handler. This option allows to opt-out of this behavior, so that overlay can stay visible after the handler has run. times number (optional) Added in: v1.44# Specifies the maximum number of times this handler should be called. Unlimited by default

Promise<void># add

## ScriptTag

Added before v1.9 page.addScriptTag Adds a <script> tag into the page with the desired url or content

the added tag when the script's onload fires or when the script content was injected into frame

await page.addScriptTag();await page.addScriptTag(options); Arguments options Object (optional) content string (optional)# Raw JavaScript content to be injected into frame. path string (optional)# Path to the JavaScript file to be injected into frame. If path is a relative path, then it is resolved relative to the current working directory. type string (optional)# Script type. Use 'module' in order to load a JavaScript ES6 module. See script for more details. url string (optional)# URL of a script to be added

Promise<ElementHandle># add

## StyleTag

Added before v1.9 page.addStyleTag Adds a <link rel="stylesheet"> tag into the page with the desired url or a <style type="text/css"> tag with the content

the added tag when the stylesheet's onload fires or when the CSS content was injected into frame

await page.addStyleTag();await page.addStyleTag(options); Arguments options Object (optional) content string (optional)# Raw CSS content to be injected into frame. path string (optional)# Path to the CSS file to be injected into frame. If path is a relative path, then it is resolved relative to the current working directory. url string (optional)# URL of the <link> tag

Promise<ElementHandle># aria

## Snapshot

Added in: v1.59 page.ariaSnapshot Captures the aria snapshot of the page. Read more about aria snapshots

await page.ariaSnapshot();await page.ariaSnapshot(options); Arguments options Object (optional) depth number (optional)# When specified, limits the depth of the snapshot. mode "ai" | "default" (optional)# When set to "ai", returns a snapshot optimized for AI consumption: including element references like [ref=e2] and snapshots of <iframe>s. Defaults to "default". timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<string># bring

## ToFront

Added before v1.9 page.bringToFront Brings page to front (activates tab)

await page.bringToFront(); Returns Promise<void># cancel

## PickLocator

Added in: v1.59 page.cancelPickLocator Cancels an ongoing page.pickLocator() call by deactivating pick locator mode. If no pick locator mode is active, this method is a no-op

await page.cancelPickLocator(); Returns Promise<void># clear

## ConsoleMessages

Added in: v1.59 page.clearConsoleMessages Clears all stored console messages from this page. Subsequent calls to page.consoleMessages() will only return messages logged after the clear

await page.clearConsoleMessages(); Returns Promise<void># clear

## PageErrors

Added in: v1.59 page.clearPageErrors Clears all stored page errors from this page. Subsequent calls to page.pageErrors() will only return errors thrown after the clear

await page.clearPageErrors(); Returns Promise<void># close​ Added before v1.9 page.close If runBeforeUnload is false, does not run any unload handlers and waits for the page to be closed. If runBeforeUnload is true the method will run unload handlers, but will not wait for the page to close. By default, page.close() does not run beforeunload handlers. noteif runBeforeUnload is passed as true, a beforeunload dialog might be summoned and should be handled manually via page.on('dialog') event

await page.close();await page.close(options); Arguments options Object (optional) reason string (optional) Added in: v1.40# The reason to be reported to the operations interrupted by the page closure. runBeforeUnload boolean (optional)# Defaults to false. Whether to run the before unload page handlers

Promise<void># console

## Messages

Added in: v1.56 page.consoleMessages Returns up to (currently) 200 last console messages from this page. See page.on('console') for more details

await page.consoleMessages();await page.consoleMessages(options); Arguments options Object (optional) filter "all" | "since-navigation" (optional) Added in: v1.59# Controls which messages are returned: Returns Promise<Array<ConsoleMessage>># content​ Added before v1.9 page.content Gets the full HTML contents of the page, including the doctype

await page.content(); Returns Promise<string># context​ Added before v1.9 page.context Get the browser context that the page belongs to

page.context(); Returns BrowserContext# drag

## AndDrop

Added in: v1.13 page.dragAndDrop This method drags the source element to the target element. It will first move to the source element, perform a mousedown, then move to the target element and perform a mouseup

await page.dragAndDrop('#source', '#target');// or specify exact positions relative to the top-left corners of the elements:await page.dragAndDrop('#source', '#target', { sourcePosition: { x: 34, y: 7 }, targetPosition: { x: 10, y: 20 },}); Arguments source string# A selector to search for an element to drag. If there are multiple elements satisfying the selector, the first will be used. target string# A selector to search for an element to drop onto. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. sourcePosition Object (optional) Added in: v1.14# x number y number Clicks on the source element at this point relative to the top-left corner of the element's padding box. If not specified, some visible point of the element is used. steps number (optional) Added in: v1.57# Defaults to 1. Sends n interpolated mousemove events to represent travel between the mousedown and mouseup of the drag. When set to 1, emits a single mousemove event at the destination location. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. targetPosition Object (optional) Added in: v1.14# x number y number Drops on the target element at this point relative to the top-left corner of the element's padding box. If not specified, some visible point of the element is used. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional)# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it

Promise<void># emulate

## Media

Added before v1.9 page.emulateMedia This method changes the CSS media type through the media argument, and/or the 'prefers-colors-scheme' media feature, using the colorScheme argument

await page.evaluate(() => matchMedia('screen').matches);// → trueawait page.evaluate(() => matchMedia('print').matches);// → falseawait page.emulateMedia({ media: 'print' });await page.evaluate(() => matchMedia('screen').matches);// → falseawait page.evaluate(() => matchMedia('print').matches);// → trueawait page.emulateMedia({});await page.evaluate(() => matchMedia('screen').matches);// → trueawait page.evaluate(() => matchMedia('print').matches);// → false await page.emulateMedia({ colorScheme: 'dark' });await page.evaluate(() => matchMedia('(prefers-color-scheme: dark)').matches);// → trueawait page.evaluate(() => matchMedia('(prefers-color-scheme: light)').matches);// → false Arguments options Object (optional) colorScheme null | "light" | "dark" | "no-preference" (optional) Added in: v1.9# Emulates prefers-colors-scheme media feature, supported values are 'light' and 'dark'. Passing null disables color scheme emulation. 'no-preference' is deprecated. contrast null | "no-preference" | "more" (optional) Added in: v1.51# Emulates 'prefers-contrast' media feature, supported values are 'no-preference', 'more'. Passing null disables contrast emulation. forcedColors null | "active" | "none" (optional) Added in: v1.15# Emulates 'forced-colors' media feature, supported values are 'active' and 'none'. Passing null disables forced colors emulation. media null | "screen" | "print" (optional) Added in: v1.9# Changes the CSS media type of the page. The only allowed values are 'screen', 'print' and null. Passing null disables CSS media emulation. reducedMotion null | "reduce" | "no-preference" (optional) Added in: v1.12# Emulates 'prefers-reduced-motion' media feature, supported values are 'reduce', 'no-preference'. Passing null disables reduced motion emulation

Promise<void># evaluate​ Added before v1.9 page.evaluate Returns the value of the pageFunction invocation. If the function passed to the page.evaluate() returns a Promise, then page.evaluate() would wait for the promise to resolve and return its value. If the function passed to the page.evaluate() returns a non-Serializable value, then page.evaluate() resolves to undefined. Playwright also supports transferring some additional values that are not serializable by JSON: -0, NaN, Infinity, -Infinity

Passing argument to pageFunction: const result = await page.evaluate(([x, y]) => { return Promise.resolve(x \* y);}, [7, 8]);console.log(result); // prints "56" A string can also be passed in instead of a function: console.log(await page.evaluate('1 + 2')); // prints "3"const x = 10;console.log(await page.evaluate(`1 + ${x}`)); // prints "11" ElementHandle instances can be passed as an argument to the page.evaluate(): const bodyHandle = await page.evaluate('document.body');const html = await page.evaluate<string, HTMLElement>(([body, suffix]) => body.innerHTML + suffix, [bodyHandle, 'hello']);await bodyHandle.dispose(); Arguments pageFunction function | string# Function to be evaluated in the page context. arg EvaluationArgument (optional)# Optional argument to pass to pageFunction

Promise<Serializable># evaluate

## Handle

Added before v1.9 page.evaluateHandle Returns the value of the pageFunction invocation as a JSHandle. The only difference between page.evaluate() and page.evaluateHandle() is that page.evaluateHandle() returns JSHandle. If the function passed to the page.evaluateHandle() returns a Promise, then page.evaluateHandle() would wait for the promise to resolve and return its value

// Handle for the window object.const aWindowHandle = await page.evaluateHandle(() => Promise.resolve(window)); A string can also be passed in instead of a function: const aHandle = await page.evaluateHandle('document'); // Handle for the 'document' JSHandle instances can be passed as an argument to the page.evaluateHandle(): const aHandle = await page.evaluateHandle(() => document.body);const resultHandle = await page.evaluateHandle(body => body.innerHTML, aHandle);console.log(await resultHandle.jsonValue());await resultHandle.dispose(); Arguments pageFunction function | string# Function to be evaluated in the page context. arg EvaluationArgument (optional)# Optional argument to pass to pageFunction

Promise<JSHandle># expose

## Binding

Added before v1.9 page.exposeBinding The method adds a function called name on the window object of every frame in this page. When called, the function executes callback and returns a Promise which resolves to the return value of callback. If the callback returns a Promise, it will be awaited. The first argument of the callback function contains information about the caller: { browserContext: BrowserContext, page: Page, frame: Frame }. See browserContext.exposeBinding() for the context-wide version. noteFunctions installed via page.exposeBinding() survive navigations

An example of exposing page URL to all frames in a page: const { webkit } = require('playwright'); // Or 'chromium' or 'firefox'.(async () => { const browser = await webkit.launch({ headless: false }); const context = await browser.newContext(); const page = await context.newPage(); await page.exposeBinding('pageURL', ({ page }) => page.url()); await page.setContent(`<script> async function onClick() { document.querySelector('div').textContent = await window.pageURL(); } </script> <button onclick="onClick()">Click me</button> <div></div>`); await page.click('button');})(); Arguments name string# Name of the function on the window object. callback function# Callback function that will be called in the Playwright's context. options Object (optional) handle boolean (optional)# DeprecatedThis option will be removed in the future. Whether to pass the argument as a handle, instead of passing by value. When passing a handle, only one argument is supported. When passing by value, multiple arguments are supported

Promise<Disposable># expose

## Function

Added before v1.9 page.exposeFunction The method adds a function called name on the window object of every frame in the page. When called, the function executes callback and returns a Promise which resolves to the return value of callback. If the callback returns a Promise, it will be awaited. See browserContext.exposeFunction() for context-wide exposed function. noteFunctions installed via page.exposeFunction() survive navigations

An example of adding a sha256 function to the page: const { webkit } = require('playwright'); // Or 'chromium' or 'firefox'.const crypto = require('crypto');(async () => { const browser = await webkit.launch({ headless: false }); const page = await browser.newPage(); await page.exposeFunction('sha256', text => crypto.createHash('sha256').update(text).digest('hex'), ); await page.setContent(`<script> async function onClick() { document.querySelector('div').textContent = await window.sha256('PLAYWRIGHT'); } </script> <button onclick="onClick()">Click me</button> <div></div>`); await page.click('button');})(); Arguments name string# Name of the function on the window object callback function# Callback function which will be called in Playwright's context

Promise<Disposable># frame​ Added before v1.9 page.frame Returns frame matching the specified criteria. Either name or url must be specified

const frame = page.frame('frame-name'); const frame = page.frame({ url: /._domain._/ }); Arguments frameSelector string | Object# name string (optional) Frame name specified in the iframe's name attribute. Optional. url string | RegExp | [URLPattern] | function(URL):boolean (optional) A glob pattern, regex pattern, URL pattern, or predicate receiving frame's url as a URL object. Optional. Frame name or other frame lookup options

null | Frame# frame

## Locator

Added in: v1.17 page.frameLocator When working with iframes, you can create a frame locator that will enter the iframe and allow selecting elements in that iframe

Following snippet locates element with text "Submit" in the iframe with id my-frame, like <iframe id="my-frame">: const locator = page.frameLocator('#my-iframe').getByText('Submit');await locator.click(); Arguments selector string# A selector to use when resolving DOM element

FrameLocator# frames​ Added before v1.9 page.frames An array of all frames attached to the page

page.frames(); Returns Array<Frame># get

## ByAltText

Added in: v1.27 page.getByAltText Allows locating elements by their alt text

For example, this method will find the image by alt text "Playwright logo": <img alt='Playwright logo'> await page.getByAltText('Playwright logo').click(); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# get

## ByLabel

Added in: v1.27 page.getByLabel Allows locating input elements by the text of the associated <label> or aria-labelledby element, or by the aria-label attribute

For example, this method will find inputs by label "Username" and "Password" in the following DOM: <input aria-label="Username"><label for="password-input">Password:</label><input id="password-input"> await page.getByLabel('Username').fill('john');await page.getByLabel('Password').fill('secret'); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# get

## ByPlaceholder

Added in: v1.27 page.getByPlaceholder Allows locating input elements by the placeholder text

For example, consider the following DOM structure. <input type="email" placeholder="name@example.com" /> You can fill the input after locating it by the placeholder text: await page .getByPlaceholder('name@example.com') .fill('playwright@microsoft.com'); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# get

## ByRole

Added in: v1.27 page.getByRole Allows locating elements by their ARIA role, ARIA attributes and accessible name

Consider the following DOM structure. <h3>Sign up</h3><label> <input type="checkbox" /> Subscribe</label><br/><button>Submit</button> You can locate each element by its implicit role: await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();await page.getByRole('checkbox', { name: 'Subscribe' }).check();await page.getByRole('button', { name: /submit/i }).click(); Arguments role "alert" | "alertdialog" | "application" | "article" | "banner" | "blockquote" | "button" | "caption" | "cell" | "checkbox" | "code" | "columnheader" | "combobox" | "complementary" | "contentinfo" | "definition" | "deletion" | "dialog" | "directory" | "document" | "emphasis" | "feed" | "figure" | "form" | "generic" | "grid" | "gridcell" | "group" | "heading" | "img" | "insertion" | "link" | "list" | "listbox" | "listitem" | "log" | "main" | "marquee" | "math" | "meter" | "menu" | "menubar" | "menuitem" | "menuitemcheckbox" | "menuitemradio" | "navigation" | "none" | "note" | "option" | "paragraph" | "presentation" | "progressbar" | "radio" | "radiogroup" | "region" | "row" | "rowgroup" | "rowheader" | "scrollbar" | "search" | "searchbox" | "separator" | "slider" | "spinbutton" | "status" | "strong" | "subscript" | "superscript" | "switch" | "tab" | "table" | "tablist" | "tabpanel" | "term" | "textbox" | "time" | "timer" | "toolbar" | "tooltip" | "tree" | "treegrid" | "treeitem"# Required aria role. options Object (optional) checked boolean (optional)# An attribute that is usually set by aria-checked or native <input type=checkbox> controls. Learn more about aria-checked. disabled boolean (optional)# An attribute that is usually set by aria-disabled or disabled. noteUnlike most other attributes, disabled is inherited through the DOM hierarchy. Learn more about aria-disabled. exact boolean (optional) Added in: v1.28# Whether name is matched exactly: case-sensitive and whole-string. Defaults to false. Ignored when name is a regular expression. Note that exact match still trims whitespace. expanded boolean (optional)# An attribute that is usually set by aria-expanded. Learn more about aria-expanded. includeHidden boolean (optional)# Option that controls whether hidden elements are matched. By default, only non-hidden elements, as defined by ARIA, are matched by role selector. Learn more about aria-hidden. level number (optional)# A number attribute that is usually present for roles heading, listitem, row, treeitem, with default values for <h1>-<h6> elements. Learn more about aria-level. name string | RegExp (optional)# Option to match the accessible name. By default, matching is case-insensitive and searches for a substring, use exact to control this behavior. Learn more about accessible name. pressed boolean (optional)# An attribute that is usually set by aria-pressed. Learn more about aria-pressed. selected boolean (optional)# An attribute that is usually set by aria-selected. Learn more about aria-selected

Locator# Details Role selector does not replace accessibility audits and conformance tests, but rather gives early feedback about the ARIA guidelines. Many html elements have an implicitly defined role that is recognized by the role selector. You can find all the supported roles here. ARIA guidelines do not recommend duplicating implicit roles and attributes by setting role and/or aria-\* attributes to default values. get

## ByTestId

Added in: v1.27 page.getByTestId Locate element by the test id

Consider the following DOM structure. <button data-testid="directions">Itinéraire</button> You can locate the element by its test id: await page.getByTestId('directions').click(); Arguments testId string | RegExp# Id to locate the element by

Locator# Details By default, the data-testid attribute is used as a test id. Use selectors.setTestIdAttribute() to configure a different test id attribute if necessary. // Set custom test id attribute from @playwright/test config:import { defineConfig } from '@playwright/test';export default defineConfig({ use: { testIdAttribute: 'data-pw' },}); get

## ByText

Added in: v1.27 page.getByText Allows locating elements that contain given text. See also locator.filter() that allows to match by another criteria, like an accessible role, and then filter by the text content

Consider the following DOM structure: <div>Hello <span>world</span></div><div>Hello</div> You can locate by text substring, exact string, or a regular expression: // Matches <span>page.getByText('world');// Matches first <div>page.getByText('Hello world');// Matches second <div>page.getByText('Hello', { exact: true });// Matches both <div>spage.getByText(/Hello/);// Matches second <div>page.getByText(/^hello$/i); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# Details Matching by text always normalizes whitespace, even with exact match. For example, it turns multiple spaces into one, turns line breaks into spaces and ignores leading and trailing whitespace. Input elements of the type button and submit are matched by their value instead of the text content. For example, locating by text "Log in" matches <input type=button value="Log in">. get

## ByTitle

Added in: v1.27 page.getByTitle Allows locating elements by their title attribute

Consider the following DOM structure. <span title='Issues count'>25 issues</span> You can check the issues count after locating it by the title text: await expect(page.getByTitle('Issues count')).toHaveText('25 issues'); Arguments text string | RegExp# Text to locate the element for. options Object (optional) exact boolean (optional)# Whether to find an exact match: case-sensitive and whole-string. Default to false. Ignored when locating by a regular expression. Note that exact match still trims whitespace

Locator# go

## Back

Added before v1.9 page.goBack Returns the main resource response. In case of multiple redirects, the navigation will resolve with the response of the last redirect. If cannot go back, returns null. Navigate to the previous page in history

await page.goBack();await page.goBack(options); Arguments options Object (optional) timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods. waitUntil "load" | "domcontentloaded" | "networkidle" | "commit" (optional)# When to consider operation succeeded, defaults to load

can be either: 'domcontentloaded' - consider operation to be finished when the DOMContentLoaded event is fired. 'load' - consider operation to be finished when the load event is fired. 'networkidle' - DISCOURAGED consider operation to be finished when there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. 'commit' - consider operation to be finished when network response is received and the document started loading

Promise<null | Response># go

## Forward

Added before v1.9 page.goForward Returns the main resource response. In case of multiple redirects, the navigation will resolve with the response of the last redirect. If cannot go forward, returns null. Navigate to the next page in history

await page.goForward();await page.goForward(options); Arguments options Object (optional) timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods. waitUntil "load" | "domcontentloaded" | "networkidle" | "commit" (optional)# When to consider operation succeeded, defaults to load

can be either: 'domcontentloaded' - consider operation to be finished when the DOMContentLoaded event is fired. 'load' - consider operation to be finished when the load event is fired. 'networkidle' - DISCOURAGED consider operation to be finished when there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. 'commit' - consider operation to be finished when network response is received and the document started loading

Promise<null | Response># goto​ Added before v1.9 page.goto Returns the main resource response. In case of multiple redirects, the navigation will resolve with the first non-redirect response. The method will throw an error if: there's an SSL error (e.g. in case of self-signed certificates). target URL is invalid. the timeout is exceeded during navigation. the remote server does not respond or is unreachable. the main resource failed to load. The method will not throw an error when any valid HTTP status code is returned by the remote server, including 404 "Not Found" and 500 "Internal Server Error". The status code for such responses can be retrieved by calling response.status(). noteThe method either throws an error or returns a main resource response. The only exceptions are navigation to about:blank or navigation to the same URL with a different hash, which would succeed and return null. noteHeadless mode doesn't support navigation to a PDF document. See the upstream issue

await page.goto(url);await page.goto(url, options); Arguments url string# URL to navigate page to. The url should include scheme, e.g. https://. When a baseURL via the context options was provided and the passed URL is a path, it gets merged via the new URL() constructor. options Object (optional) referer string (optional)# Referer header value. If provided it will take preference over the referer header value set by page.setExtraHTTPHeaders(). timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods. waitUntil "load" | "domcontentloaded" | "networkidle" | "commit" (optional)# When to consider operation succeeded, defaults to load

can be either: 'domcontentloaded' - consider operation to be finished when the DOMContentLoaded event is fired. 'load' - consider operation to be finished when the load event is fired. 'networkidle' - DISCOURAGED consider operation to be finished when there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. 'commit' - consider operation to be finished when network response is received and the document started loading

Promise<null | Response># is

## Closed

Added before v1.9 page.isClosed Indicates that the page has been closed

page.isClosed(); Returns boolean# locator​ Added in: v1.14 page.locator The method returns an element locator that can be used to perform actions on this page / frame. Locator is resolved to the element immediately before performing an action, so a series of actions on the same locator can in fact be performed on different DOM elements. That would happen if the DOM structure between those actions has changed. Learn more about locators

page.locator(selector);page.locator(selector, options); Arguments selector string# A selector to use when resolving DOM element. options Object (optional) has Locator (optional)# Narrows down the results of the method to those which contain elements matching this relative locator. For example, article that has text=Playwright matches <article><div>Playwright</div></article>. Inner locator must be relative to the outer locator and is queried starting with the outer locator match, not the document root. For example, you can find content that has div in <article><content><div>Playwright</div></content></article>. However, looking for content that has article div will fail, because the inner locator must be relative and should not use any elements outside the content. Note that outer and inner locators must belong to the same frame. Inner locator must not contain FrameLocators. hasNot Locator (optional) Added in: v1.33# Matches elements that do not contain an element that matches an inner locator. Inner locator is queried against the outer one. For example, article that does not have div matches <article><span>Playwright</span></article>. Note that outer and inner locators must belong to the same frame. Inner locator must not contain FrameLocators. hasNotText string | RegExp (optional) Added in: v1.33# Matches elements that do not contain specified text somewhere inside, possibly in a child or a descendant element. When passed a string, matching is case-insensitive and searches for a substring. hasText string | RegExp (optional)# Matches elements containing specified text somewhere inside, possibly in a child or a descendant element. When passed a string, matching is case-insensitive and searches for a substring. For example, "Playwright" matches <article><div>Playwright</div></article>

Locator# main

## Frame

Added before v1.9 page.mainFrame The page's main frame. Page is guaranteed to have a main frame which persists during navigations

page.mainFrame(); Returns Frame# opener​ Added before v1.9 page.opener Returns the opener for popup pages and null for others. If the opener has been closed already the returns null

await page.opener(); Returns Promise<null | Page># page

## Errors

Added in: v1.56 page.pageErrors Returns up to (currently) 200 last page errors from this page. See page.on('pageerror') for more details

await page.pageErrors();await page.pageErrors(options); Arguments options Object (optional) filter "all" | "since-navigation" (optional) Added in: v1.59# Controls which errors are returned: Returns Promise<Array<Error>># pause​ Added in: v1.9 page.pause Pauses script execution. Playwright will stop executing the script and wait for the user to either press the 'Resume' button in the page overlay or to call playwright.resume() in the DevTools console. User can inspect selectors or perform manual steps while paused. Resume will continue running the original script from the place it was paused. noteThis method requires Playwright to be started in a headed mode, with a falsy headless option

await page.pause(); Returns Promise<void># pdf​ Added before v1.9 page.pdf Returns the PDF buffer. page.pdf() generates a pdf of the page with print css media. To generate a pdf with screen media, call page.emulateMedia() before calling page.pdf(): noteBy default, page.pdf() generates a pdf with modified colors for printing. Use the -webkit-print-color-adjust property to force rendering of exact colors

// Generates a PDF with 'screen' media type.await page.emulateMedia({ media: 'screen' });await page.pdf({ path: 'page.pdf' }); The width, height, and margin options accept values labeled with units. Unlabeled values are treated as pixels. A few examples: page.pdf({width: 100}) - prints with width set to 100 pixels page.pdf({width: '100px'}) - prints with width set to 100 pixels page.pdf({width: '10cm'}) - prints with width set to 10 centimeters. All possible units are: px - pixel in - inch cm - centimeter mm - millimeter The format options are: Letter: 8.5in x 11in Legal: 8.5in x 14in Tabloid: 11in x 17in Ledger: 17in x 11in A0: 33.1in x 46.8in A1: 23.4in x 33.1in A2: 16.54in x 23.4in A3: 11.7in x 16.54in A4: 8.27in x 11.7in A5: 5.83in x 8.27in A6: 4.13in x 5.83in noteheaderTemplate and footerTemplate markup have the following limitations: > 1. Script tags inside templates are not evaluated. > 2. Page styles are not visible inside templates

options Object (optional) displayHeaderFooter boolean (optional)# Display header and footer. Defaults to false. footerTemplate string (optional)# HTML template for the print footer. Should use the same format as the headerTemplate. format string (optional)# Paper format. If set, takes priority over width or height options. Defaults to 'Letter'. headerTemplate string (optional)# HTML template for the print header. Should be valid HTML markup with following classes used to inject printing values into them: 'date' formatted print date 'title' document title 'url' document location 'pageNumber' current page number 'totalPages' total pages in the document height string | number (optional)# Paper height, accepts values labeled with units. landscape boolean (optional)# Paper orientation. Defaults to false. margin Object (optional)# top string | number (optional) Top margin, accepts values labeled with units. Defaults to 0. right string | number (optional) Right margin, accepts values labeled with units. Defaults to 0. bottom string | number (optional) Bottom margin, accepts values labeled with units. Defaults to 0. left string | number (optional) Left margin, accepts values labeled with units. Defaults to 0. Paper margins, defaults to none. outline boolean (optional) Added in: v1.42# Whether or not to embed the document outline into the PDF. Defaults to false. pageRanges string (optional)# Paper ranges to print, e.g., '1-5, 8, 11-13'. Defaults to the empty string, which means print all pages. path string (optional)# The file path to save the PDF to. If path is a relative path, then it is resolved relative to the current working directory. If no path is provided, the PDF won't be saved to the disk. preferCSSPageSize boolean (optional)# Give any CSS @page size declared in the page priority over what is declared in width and height or format options. Defaults to false, which will scale the content to fit the paper size. printBackground boolean (optional)# Print background graphics. Defaults to false. scale number (optional)# Scale of the webpage rendering. Defaults to 1. Scale amount must be between 0.1 and 2. tagged boolean (optional) Added in: v1.42# Whether or not to generate tagged (accessible) PDF. Defaults to false. width string | number (optional)# Paper width, accepts values labeled with units

Promise<Buffer># pick

## Locator

Added in: v1.59 page.pickLocator Enters pick locator mode where hovering over page elements highlights them and shows the corresponding locator. Once the user clicks an element, the mode is deactivated and the Locator for the picked element is returned

const locator = await page.pickLocator();console.log(locator); Returns Promise<Locator># reload​ Added before v1.9 page.reload This method reloads the current page, in the same way as if the user had triggered a browser refresh

the main resource response. In case of multiple redirects, the navigation will resolve with the response of the last redirect

await page.reload();await page.reload(options); Arguments options Object (optional) timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods. waitUntil "load" | "domcontentloaded" | "networkidle" | "commit" (optional)# When to consider operation succeeded, defaults to load

can be either: 'domcontentloaded' - consider operation to be finished when the DOMContentLoaded event is fired. 'load' - consider operation to be finished when the load event is fired. 'networkidle' - DISCOURAGED consider operation to be finished when there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. 'commit' - consider operation to be finished when network response is received and the document started loading

Promise<null | Response># remove

## AllListeners

Added in: v1.47 page.removeAllListeners Removes all the listeners of the given type (or all registered listeners if no type given). Allows to wait for async listeners to complete or to ignore subsequent errors from these listeners

page.on('request', async request => { const response = await request.response(); const body = await response.body(); console.log(body.byteLength);});await page.goto('https://playwright.dev', { waitUntil: 'domcontentloaded' });// Waits for all the reported 'request' events to resolve.await page.removeAllListeners('request', { behavior: 'wait' }); Arguments type string (optional)# options Object (optional) behavior "wait" | "ignoreErrors" | "default" (optional)# Specifies whether to wait for already running listeners and what to do if they throw errors: 'default' - do not wait for current listener calls (if any) to finish, if the listener throws, it may result in unhandled error 'wait' - wait for current listener calls (if any) to finish 'ignoreErrors' - do not wait for current listener calls (if any) to finish, all errors thrown by the listeners after removal are silently caught Returns Promise<void># remove

## LocatorHandler

Added in: v1.44 page.removeLocatorHandler Removes all locator handlers added by page.addLocatorHandler() for a specific locator

await page.removeLocatorHandler(locator); Arguments locator Locator# Locator passed to page.addLocatorHandler()

Promise<void># requestGC​ Added in: v1.48 page.requestGC Request the page to perform garbage collection. Note that there is no guarantee that all unreachable objects will be collected. This is useful to help detect memory leaks. For example, if your page has a large object 'suspect' that might be leaked, you can check that it does not leak by using a WeakRef. // 1. In your page, save a WeakRef for the "suspect".await page.evaluate(() => globalThis.suspectWeakRef = new WeakRef(suspect));// 2. Request garbage collection.await page.requestGC();// 3. Check that weak ref does not deref to the original object.expect(await page.evaluate(() => !globalThis.suspectWeakRef.deref())).toBe(true); Usage await page.requestGC(); Returns Promise<void># requests​ Added in: v1.56 page.requests Returns up to (currently) 100 last network request from this page. See page.on('request') for more details. Returned requests should be accessed immediately, otherwise they might be collected to prevent unbounded memory growth as new requests come in. Once collected, retrieving most information about the request is impossible. Note that requests reported through the page.on('request') request are not collected, so there is a trade off between efficient memory usage with page.requests() and the amount of available information reported through page.on('request')

await page.requests(); Returns Promise<Array<Request>># route​ Added before v1.9 page.route Routing provides the capability to modify network requests that are made by a page. Once routing is enabled, every request matching the url pattern will stall unless it's continued, fulfilled or aborted. noteThe handler will only be called for the first url if the response is a redirect. notepage.route() will not intercept requests intercepted by Service Worker. See this issue. We recommend disabling Service Workers when using request interception by setting serviceWorkers to 'block'. notepage.route() will not intercept the first request of a popup page. Use browserContext.route() instead

An example of a naive handler that aborts all image requests: const page = await browser.newPage();await page.route('**/\*.{png,jpg,jpeg}', route => route.abort());await page.goto('https://example.com');await browser.close(); or the same snippet using a regex pattern instead: const page = await browser.newPage();await page.route(/(\.png$)|(\.jpg$)/, route => route.abort());await page.goto('https://example.com');await browser.close(); It is possible to examine the request to decide the route action. For example, mocking all requests that contain some post data, and leaving all other requests as is: await page.route('/api/**', async route => { if (route.request().postData().includes('my-string')) await route.fulfill({ body: 'mocked-data' }); else await route.continue();}); If a request matches multiple registered routes, the most recently registered route takes precedence. Page routes take precedence over browser context routes (set up with browserContext.route()) when request matches both handlers. To remove a route with its handler you can use page.unroute(). noteEnabling routing disables http cache

url string | RegExp | [URLPattern] | function(URL):boolean# A glob pattern, regex pattern, URL pattern, or predicate that receives a URL to match during routing. If baseURL is set in the context options and the provided URL is a string that does not start with \*, it is resolved using the new URL() constructor. handler function(Route, Request):Promise<Object> | Object# handler function to route the request. options Object (optional) times number (optional) Added in: v1.15# How often a route should be used. By default it will be used every time

Promise<Disposable># route

## FromHAR

Added in: v1.23 page.routeFromHAR If specified the network requests that are made in the page will be served from the HAR file. Read more about Replaying from HAR. Playwright will not serve requests intercepted by Service Worker from the HAR file. See this issue. We recommend disabling Service Workers when using request interception by setting serviceWorkers to 'block'

await page.routeFromHAR(har);await page.routeFromHAR(har, options); Arguments har string# Path to a HAR file with prerecorded network data. If path is a relative path, then it is resolved relative to the current working directory. options Object (optional) notFound "abort" | "fallback" (optional)# If set to 'abort' any request not found in the HAR file will be aborted. If set to 'fallback' missing requests will be sent to the network. Defaults to abort. update boolean (optional)# If specified, updates the given HAR with the actual network information instead of serving from file. The file is written to disk when browserContext.close() is called. updateContent "embed" | "attach" (optional) Added in: v1.32# Optional setting to control resource content management. If attach is specified, resources are persisted as separate files or entries in the ZIP archive. If embed is specified, content is stored inline the HAR file. updateMode "full" | "minimal" (optional) Added in: v1.32# When set to minimal, only record information necessary for routing from HAR. This omits sizes, timing, page, cookies, security and other types of HAR information that are not used when replaying from HAR. Defaults to minimal. url string | RegExp (optional)# A glob pattern, regular expression or predicate to match the request URL. Only requests with URL matching the pattern will be served from the HAR file. If not specified, all requests are served from the HAR file

Promise<void># route

## WebSocket

Added in: v1.48 page.routeWebSocket This method allows to modify websocket connections that are made by the page. Note that only WebSockets created after this method was called will be routed. It is recommended to call this method before navigating the page

Below is an example of a simple mock that responds to a single message. See WebSocketRoute for more details and examples. await page.routeWebSocket('/ws', ws => { ws.onMessage(message => { if (message === 'request') ws.send('response'); });}); Arguments url string | RegExp | [URLPattern] | function(URL):boolean# Only WebSockets with the url matching this pattern will be routed. A string pattern can be relative to the baseURL context option. handler function(WebSocketRoute):Promise<Object> | Object# Handler function to route the WebSocket

Promise<void># screenshot​ Added before v1.9 page.screenshot Returns the buffer with the captured screenshot

await page.screenshot();await page.screenshot(options); Arguments options Object (optional) animations "disabled" | "allow" (optional)# When set to "disabled", stops CSS animations, CSS transitions and Web Animations. Animations get different treatment depending on their duration: finite animations are fast-forwarded to completion, so they'll fire transitionend event. infinite animations are canceled to initial state, and then played over after the screenshot. Defaults to "allow" that leaves animations untouched. caret "hide" | "initial" (optional)# When set to "hide", screenshot will hide text caret. When set to "initial", text caret behavior will not be changed. Defaults to "hide". clip Object (optional)# x number x-coordinate of top-left corner of clip area y number y-coordinate of top-left corner of clip area width number width of clipping area height number height of clipping area An object which specifies clipping of the resulting image. fullPage boolean (optional)# When true, takes a screenshot of the full scrollable page, instead of the currently visible viewport. Defaults to false. mask Array<Locator> (optional)# Specify locators that should be masked when the screenshot is taken. Masked elements will be overlaid with a pink box #FF00FF (customized by maskColor) that completely covers its bounding box. The mask is also applied to invisible elements, see Matching only visible elements to disable that. maskColor string (optional) Added in: v1.35# Specify the color of the overlay box for masked elements, in CSS color format. Default color is pink #FF00FF. omitBackground boolean (optional)# Hides default white background and allows capturing screenshots with transparency. Not applicable to jpeg images. Defaults to false. path string (optional)# The file path to save the image to. The screenshot type will be inferred from file extension. If path is a relative path, then it is resolved relative to the current working directory. If no path is provided, the image won't be saved to the disk. quality number (optional)# The quality of the image, between 0-100. Not applicable to png images. scale "css" | "device" (optional)# When set to "css", screenshot will have a single pixel per each css pixel on the page. For high-dpi devices, this will keep screenshots small. Using "device" option will produce a single pixel per each device pixel, so screenshots of high-dpi devices will be twice as large or even larger. Defaults to "device". style string (optional) Added in: v1.41# Text of the stylesheet to apply while making the screenshot. This is where you can hide dynamic elements, make elements invisible or change their properties to help you creating repeatable screenshots. This stylesheet pierces the Shadow DOM and applies to the inner frames. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. type "png" | "jpeg" (optional)# Specify screenshot type, defaults to png

Promise<Buffer># set

## Content

Added before v1.9 page.setContent This method internally calls document.write(), inheriting all its specific characteristics and behaviors

await page.setContent(html);await page.setContent(html, options); Arguments html string# HTML markup to assign to the page. options Object (optional) timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods. waitUntil "load" | "domcontentloaded" | "networkidle" | "commit" (optional)# When to consider operation succeeded, defaults to load

can be either: 'domcontentloaded' - consider operation to be finished when the DOMContentLoaded event is fired. 'load' - consider operation to be finished when the load event is fired. 'networkidle' - DISCOURAGED consider operation to be finished when there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. 'commit' - consider operation to be finished when network response is received and the document started loading

Promise<void># set

## DefaultNavigationTimeout

Added before v1.9 page.setDefaultNavigationTimeout This setting will change the default maximum navigation time for the following methods and related shortcuts: page.goBack() page.goForward() page.goto() page.reload() page.setContent() page.waitForNavigation() page.waitForURL() notepage.setDefaultNavigationTimeout() takes priority over page.setDefaultTimeout(), browserContext.setDefaultTimeout() and browserContext.setDefaultNavigationTimeout()

page.setDefaultNavigationTimeout(timeout); Arguments timeout number#

## Maximum navigation time in milliseconds setDefaultTimeout

Added before v1.9 page.setDefaultTimeout This setting will change the default maximum time for all the methods accepting timeout option. notepage.setDefaultNavigationTimeout() takes priority over page.setDefaultTimeout()

page.setDefaultTimeout(timeout); Arguments timeout number#

## Maximum time in milliseconds. Pass 0 to disable timeout. setExtraHTTPHeaders

Added before v1.9 page.setExtraHTTPHeaders The extra HTTP headers will be sent with every request the page initiates. notepage.setExtraHTTPHeaders() does not guarantee the order of headers in the outgoing requests

await page.setExtraHTTPHeaders(headers); Arguments headers Object<string, string># An object containing additional HTTP headers to be sent with every request. All header values must be strings

Promise<void># set

## ViewportSize

Added before v1.9 page.setViewportSize In the case of multiple pages in a single browser, each page can have its own viewport size. However, browser.newContext() allows to set viewport size (and more) for all pages in the context at once. page.setViewportSize() will resize the page. A lot of websites don't expect phones to change size, so you should set the viewport size before navigating to the page. page.setViewportSize() will also reset screen size, use browser.newContext() with screen and viewport parameters if you need better control of these properties

const page = await browser.newPage();await page.setViewportSize({ width: 640, height: 480,});await page.goto('https://example.com'); Arguments viewportSize Object# width number page width in pixels. height number page height in pixels

Promise<void># title​ Added before v1.9 page.title Returns the page's title

await page.title(); Returns Promise<string># unroute​ Added before v1.9 page.unroute Removes a route created with page.route(). When handler is not specified, removes all routes for the url

await page.unroute(url);await page.unroute(url, handler); Arguments url string | RegExp | [URLPattern] | function(URL):boolean# A glob pattern, regex pattern, URL pattern, or predicate receiving URL to match while routing. handler function(Route, Request):Promise<Object> | Object (optional)# Optional handler function to route the request

Promise<void># unroute

## All

Added in: v1.41 page.unrouteAll Removes all routes created with page.route() and page.routeFromHAR()

await page.unrouteAll();await page.unrouteAll(options); Arguments options Object (optional) behavior "wait" | "ignoreErrors" | "default" (optional)# Specifies whether to wait for already running handlers and what to do if they throw errors: 'default' - do not wait for current handler calls (if any) to finish, if unrouted handler throws, it may result in unhandled error 'wait' - wait for current handler calls (if any) to finish 'ignoreErrors' - do not wait for current handler calls (if any) to finish, all errors thrown by the handlers after unrouting are silently caught Returns Promise<void># url​ Added before v1.9 page.url Usage page.url(); Returns string# video​ Added before v1.9 page.video Video object associated with this page. Can be used to access the video file when using the recordVideo context option

page.video(); Returns null | Video# viewport

## Size

Added before v1.9 page.viewportSize Usage page.viewportSize(); Returns null | Object# width number page width in pixels. height number page height in pixels. wait

## ForEvent

Added before v1.9 page.waitForEvent Waits for event to fire and passes its value into the predicate function

when the predicate returns truthy value. Will throw an error if the page is closed before the event is fired

the event data value

// Start waiting for download before clicking. Note no await.const downloadPromise = page.waitForEvent('download');await page.getByText('Download file').click();const download = await downloadPromise; Arguments event string# Event name, same one typically passed into \*.on(event). optionsOrPredicate function | Object (optional)# predicate function Receives the event data and resolves to truthy value when the waiting should resolve. timeout number (optional) Maximum time to wait for in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. Either a predicate that receives an event or an options object. Optional. options Object (optional) predicate function (optional)# Receives the event data and resolves to truthy value when the waiting should resolve

Promise<Object># wait

## ForFunction

Added before v1.9 page.waitForFunction Returns when the pageFunction returns a truthy value. It resolves to a JSHandle of the truthy value

The page.waitForFunction() can be used to observe viewport size change: const { webkit } = require('playwright'); // Or 'chromium' or 'firefox'.(async () => { const browser = await webkit.launch(); const page = await browser.newPage(); const watchDog = page.waitForFunction(() => window.innerWidth < 100); await page.setViewportSize({ width: 50, height: 50 }); await watchDog; await browser.close();})(); To pass an argument to the predicate of page.waitForFunction() function: const selector = '.foo';await page.waitForFunction(selector => !!document.querySelector(selector), selector); Arguments pageFunction function | string# Function to be evaluated in the page context. arg EvaluationArgument (optional)# Optional argument to pass to pageFunction. options Object (optional) polling number | "raf" (optional)# If polling is 'raf', then pageFunction is constantly executed in requestAnimationFrame callback. If polling is a number, then it is treated as an interval in milliseconds at which the function would be executed. Defaults to raf. timeout number (optional)# Maximum time to wait for in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<JSHandle># wait

## ForLoadState

Added before v1.9 page.waitForLoadState Returns when the required load state has been reached. This resolves when the page reaches a required load state, load by default. The navigation must have been committed when this method is called. If current document has already reached the required state, resolves immediately. noteMost of the time, this method is not needed because Playwright auto-waits before every action

await page.getByRole('button').click(); // Click triggers navigation.await page.waitForLoadState(); // The promise resolves after 'load' event. const popupPromise = page.waitForEvent('popup');await page.getByRole('button').click(); // Click triggers a popup.const popup = await popupPromise;await popup.waitForLoadState('domcontentloaded'); // Wait for the 'DOMContentLoaded' event.console.log(await popup.title()); // Popup is ready to use

state "load" | "domcontentloaded" | "networkidle" (optional)# Optional load state to wait for, defaults to load. If the state has been already reached while loading current document, the method resolves immediately. Can be one of: 'load' - wait for the load event to be fired. 'domcontentloaded' - wait for the DOMContentLoaded event to be fired. 'networkidle' - DISCOURAGED wait until there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. options Object (optional) timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods

Promise<void># wait

## ForRequest

Added before v1.9 page.waitForRequest Waits for the matching request and returns it. See waiting for event for more details about events

// Start waiting for request before clicking. Note no await.const requestPromise = page.waitForRequest('https://example.com/resource');await page.getByText('trigger request').click();const request = await requestPromise;// Alternative way with a predicate. Note no await.const requestPromise = page.waitForRequest(request => request.url() === 'https://example.com' && request.method() === 'GET',);await page.getByText('trigger request').click();const request = await requestPromise; Arguments urlOrPredicate string | RegExp | function(Request):boolean | Promise<boolean># Request URL string, regex or predicate receiving Request object. options Object (optional) timeout number (optional)# Maximum wait time in milliseconds, defaults to 30 seconds, pass 0 to disable the timeout. The default value can be changed by using the page.setDefaultTimeout() method

Promise<Request># wait

## ForResponse

Added before v1.9 page.waitForResponse Returns the matched response. See waiting for event for more details about events

// Start waiting for response before clicking. Note no await.const responsePromise = page.waitForResponse('https://example.com/resource');await page.getByText('trigger response').click();const response = await responsePromise;// Alternative way with a predicate. Note no await.const responsePromise = page.waitForResponse(response => response.url() === 'https://example.com' && response.status() === 200 && response.request().method() === 'GET');await page.getByText('trigger response').click();const response = await responsePromise; Arguments urlOrPredicate string | RegExp | function(Response):boolean | Promise<boolean># Request URL string, regex or predicate receiving Response object. When a baseURL via the context options was provided and the passed URL is a path, it gets merged via the new URL() constructor. options Object (optional) timeout number (optional)# Maximum wait time in milliseconds, defaults to 30 seconds, pass 0 to disable the timeout. The default value can be changed by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<Response># wait

## ForURL

Added in: v1.11 page.waitForURL Waits for the main frame to navigate to the given URL

await page.click('a.delayed-navigation'); // Clicking the link will indirectly cause a navigationawait page.waitForURL('\*\*/target.html'); Arguments url string | RegExp | [URLPattern] | function(URL):boolean# A glob pattern, regex pattern, URL pattern, or predicate receiving URL to match while waiting for the navigation. Note that if the parameter is a string without wildcard characters, the method will wait for navigation to URL that is exactly equal to the string. options Object (optional) timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods. waitUntil "load" | "domcontentloaded" | "networkidle" | "commit" (optional)# When to consider operation succeeded, defaults to load

can be either: 'domcontentloaded' - consider operation to be finished when the DOMContentLoaded event is fired. 'load' - consider operation to be finished when the load event is fired. 'networkidle' - DISCOURAGED consider operation to be finished when there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. 'commit' - consider operation to be finished when network response is received and the document started loading

Promise<void># workers​ Added before v1.9 page.workers This method returns all of the dedicated WebWorkers associated with the page. noteThis does not contain ServiceWorkers Usage page.workers(); Returns Array<Worker>#

## Properties

clock​ Added in: v1.45 page.clock Playwright has ability to mock clock and passage of time.

## Usage page.clock Type Clock coverage

Added before v1.9 page.coverage noteOnly available for Chromium atm. Browser-specific Coverage implementation.

## See Coverage for more details

page.coverage Type Coverage keyboard

## Added before v1.9 page.keyboard Usage page.keyboard Type Keyboard mouse

## Added before v1.9 page.mouse Usage page.mouse Type Mouse request

Added in: v1.16 page.request API testing helper associated with this page. This method returns the same instance as browserContext.request on the page's context. See browserContext.request for more details.

## Usage page.request Type APIRequestContext screencast

Added in: v1.59 page.screencast Screencast object associated with this page

page.screencast.on('screencastFrame', data => { console.log('received frame, jpeg size:', data.length);});await page.screencast.start();// ... perform actions ...await page.screencast.stop();

## Type Screencast touchscreen

## Added before v1.9 page.touchscreen Usage page.touchscreen Type Touchscreen Events

on('close')​ Added before v1.9 page.on('close') Emitted when the page closes

page.on('close', data => {});

## Event data Page on('console')

Added before v1.9 page.on('console') Emitted when JavaScript within the page calls one of console API methods, e.g. console.log or console.dir. The arguments passed into console.log are available on the ConsoleMessage event handler argument

page.on('console', async msg => { const values = []; for (const arg of msg.args()) values.push(await arg.jsonValue()); console.log(...values);});await page.evaluate(() => console.log('hello', 5, { foo: 'bar' }));

## Event data ConsoleMessage on('crash')

Added before v1.9 page.on('crash') Emitted when the page crashes. Browser pages might crash if they try to allocate too much memory. When the page crashes, ongoing and subsequent operations will throw. The most common way to deal with crashes is to catch an exception: try { // Crash might happen during a click. await page.click('button'); // Or while waiting for an event. await page.waitForEvent('popup');} catch (e) { // When the page crashes, exception message contains 'crash'.} Usage page.on('crash', data => {});

## Event data Page on('dialog')

Added before v1.9 page.on('dialog') Emitted when a JavaScript dialog appears, such as alert, prompt, confirm or beforeunload. Listener must either dialog.accept() or dialog.dismiss() the dialog - otherwise the page will freeze waiting for the dialog, and actions like click will never finish

page.on('dialog', dialog => dialog.accept()); noteWhen no page.on('dialog') or browserContext.on('dialog') listeners are present, all dialogs are automatically dismissed.

## Event data Dialog on('domcontentloaded')

Added in: v1.9 page.on('domcontentloaded') Emitted when the JavaScript DOMContentLoaded event is dispatched

page.on('domcontentloaded', data => {});

## Event data Page on('download')

Added before v1.9 page.on('download') Emitted when attachment download started. User can access basic file operations on downloaded content via the passed Download instance

page.on('download', data => {});

## Event data Download on('filechooser')

Added in: v1.9 page.on('filechooser') Emitted when a file chooser is supposed to appear, such as after clicking the <input type=file>. Playwright can respond to it via setting the input files using fileChooser.setFiles() that can be uploaded after that. page.on('filechooser', async fileChooser => { await fileChooser.setFiles(path.join(\_\_dirname, '/tmp/myfile.pdf'));}); Usage page.on('filechooser', data => {});

## Event data FileChooser on('frameattached')

Added in: v1.9 page.on('frameattached') Emitted when a frame is attached

page.on('frameattached', data => {});

## Event data Frame on('framedetached')

Added in: v1.9 page.on('framedetached') Emitted when a frame is detached

page.on('framedetached', data => {});

## Event data Frame on('framenavigated')

Added in: v1.9 page.on('framenavigated') Emitted when a frame is navigated to a new url

page.on('framenavigated', data => {});

## Event data Frame on('load')

Added before v1.9 page.on('load') Emitted when the JavaScript load event is dispatched

page.on('load', data => {});

## Event data Page on('pageerror')

Added in: v1.9 page.on('pageerror') Emitted when an uncaught exception happens within the page. // Log all uncaught errors to the terminalpage.on('pageerror', exception => { console.log(`Uncaught exception: "${exception}"`);});// Navigate to a page with an exception.await page.goto('data:text/html,<script>throw new Error("Test")</script>'); Usage page.on('pageerror', data => {});

## Event data Error on('popup')

Added before v1.9 page.on('popup') Emitted when the page opens a new tab or window. This event is emitted in addition to the browserContext.on('page'), but only for popups relevant to this page. The earliest moment that page is available is when it has navigated to the initial url. For example, when opening a popup with window.open('http://example.com'), this event will fire when the network request to "http://example.com" is done and its response has started loading in the popup. If you would like to route/listen to this network request, use browserContext.route() and browserContext.on('request') respectively instead of similar methods on the Page. // Start waiting for popup before clicking. Note no await.const popupPromise = page.waitForEvent('popup');await page.getByText('open the popup').click();const popup = await popupPromise;console.log(await popup.evaluate('location.href')); noteUse page.waitForLoadState() to wait until the page gets to a particular state (you should not need it in most cases)

page.on('popup', data => {});

## Event data Page on('request')

Added before v1.9 page.on('request') Emitted when a page issues a request. The request object is read-only. In order to intercept and mutate requests, see page.route() or browserContext.route()

page.on('request', data => {});

## Event data Request on('requestfailed')

Added in: v1.9 page.on('requestfailed') Emitted when a request fails, for example by timing out. page.on('requestfailed', request => { console.log(request.url() + ' ' + request.failure().errorText);}); noteHTTP Error responses, such as 404 or 503, are still successful responses from HTTP standpoint, so request will complete with page.on('requestfinished') event and not with page.on('requestfailed'). A request will only be considered failed when the client cannot get an HTTP response from the server, e.g. due to network error net::ERR_FAILED

page.on('requestfailed', data => {});

## Event data Request on('requestfinished')

Added in: v1.9 page.on('requestfinished') Emitted when a request finishes successfully after downloading the response body. For a successful response, the sequence of events is request, response and requestfinished

page.on('requestfinished', data => {});

## Event data Request on('response')

Added before v1.9 page.on('response') Emitted when response status and headers are received for a request. For a successful response, the sequence of events is request, response and requestfinished

page.on('response', data => {});

## Event data Response on('websocket')

Added in: v1.9 page.on('websocket') Emitted when WebSocket request is sent

page.on('websocket', data => {});

## Event data WebSocket on('worker')

Added before v1.9 page.on('worker') Emitted when a dedicated WebWorker is spawned by the page

page.on('worker', data => {});

## Event data Worker Deprecated

$​ Added in: v1.9 page.$ DiscouragedUse locator-based page.locator() instead. Read more about locators. The method finds an element matching the specified selector within the page. If no elements match the selector, the return value resolves to null. To wait for an element on the page, use locator.waitFor()

await page.$(selector);await page.$(selector, options); Arguments selector string# A selector to query for. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception

Promise<null | ElementHandle># $$​ Added in: v1.9 page.$$ DiscouragedUse locator-based page.locator() instead. Read more about locators. The method finds all elements matching the specified selector within the page. If no elements match the selector, the return value resolves to []

await page.$$(selector); Arguments selector string# A selector to query for

Promise<Array<ElementHandle>># $eval​ Added in: v1.9 page.$eval DiscouragedThis method does not wait for the element to pass actionability checks and therefore can lead to the flaky tests. Use locator.evaluate(), other Locator helper methods or web-first assertions instead. The method finds an element matching the specified selector within the page and passes it as a first argument to pageFunction. If no elements match the selector, the method throws an error

the value of pageFunction. If pageFunction returns a Promise, then page.$eval() would wait for the promise to resolve and return its value

const searchValue = await page.$eval('#search', el => el.value);const preloadHref = await page.$eval('link[rel=preload]', el => el.href);const html = await page.$eval('.main-container', (e, suffix) => e.outerHTML + suffix, 'hello');// In TypeScript, this example requires an explicit type annotation (HTMLLinkElement) on el:const preloadHrefTS = await page.$eval('link[rel=preload]', (el: HTMLLinkElement) => el.href); Arguments selector string# A selector to query for. pageFunction function(Element) | string# Function to be evaluated in the page context. arg EvaluationArgument (optional)# Optional argument to pass to pageFunction. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception

Promise<Serializable># $$eval​ Added in: v1.9 page.$$eval DiscouragedIn most cases, locator.evaluateAll(), other Locator helper methods and web-first assertions do a better job. The method finds all elements matching the specified selector within the page and passes an array of matched elements as a first argument to pageFunction

the result of pageFunction invocation. If pageFunction returns a Promise, then page.$$eval() would wait for the promise to resolve and return its value

const divCounts = await page.$$eval('div', (divs, min) => divs.length >= min, 10); Arguments selector string# A selector to query for. pageFunction function(Array<Element>) | string# Function to be evaluated in the page context. arg EvaluationArgument (optional)# Optional argument to pass to pageFunction

Promise<Serializable># check​ Added before v1.9 page.check DiscouragedUse locator-based locator.check() instead. Read more about locators. This method checks an element matching selector by performing the following steps: Find an element matching selector. If there is none, wait until a matching element is attached to the DOM. Ensure that matched element is a checkbox or a radio input. If not, this method throws. If the element is already checked, this method returns immediately. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.mouse to click in the center of the element. Ensure that the element is now checked. If not, this method throws. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this

await page.check(selector);await page.check(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional) Added in: v1.11# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional) Added in: v1.11# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it

Promise<void># click​ Added before v1.9 page.click DiscouragedUse locator-based locator.click() instead. Read more about locators. This method clicks an element matching selector by performing the following steps: Find an element matching selector. If there is none, wait until a matching element is attached to the DOM. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.mouse to click in the center of the element, or the specified position. Wait for initiated navigations to either succeed or fail, unless noWaitAfter option is set. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this

await page.click(selector);await page.click(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) button "left" | "right" | "middle" (optional)# Defaults to left. clickCount number (optional)# defaults to 1. See UIEvent.detail. delay number (optional)# Time to wait between mousedown and mouseup in milliseconds. Defaults to 0. force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. modifiers Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"> (optional)# Modifier keys to press. Ensures that only these modifiers are pressed during the operation, and then restores current modifiers back. If not specified, currently pressed modifiers are used. "ControlOrMeta" resolves to "Control" on Windows and Linux and to "Meta" on macOS. noWaitAfter boolean (optional)# DeprecatedThis option will default to true in the future. Actions that initiate navigations are waiting for these navigations to happen and for pages to start loading. You can opt out of waiting via setting this flag. You would only need this option in the exceptional cases such as navigating to inaccessible pages. Defaults to false. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional) Added in: v1.11# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it. Note that keyboard modifiers will be pressed regardless of trial to allow testing elements which are only visible when those keys are pressed

Promise<void># dblclick​ Added before v1.9 page.dblclick DiscouragedUse locator-based locator.dblclick() instead. Read more about locators. This method double clicks an element matching selector by performing the following steps: Find an element matching selector. If there is none, wait until a matching element is attached to the DOM. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.mouse to double click in the center of the element, or the specified position. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this. notepage.dblclick() dispatches two click events and a single dblclick event

await page.dblclick(selector);await page.dblclick(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) button "left" | "right" | "middle" (optional)# Defaults to left. delay number (optional)# Time to wait between mousedown and mouseup in milliseconds. Defaults to 0. force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. modifiers Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"> (optional)# Modifier keys to press. Ensures that only these modifiers are pressed during the operation, and then restores current modifiers back. If not specified, currently pressed modifiers are used. "ControlOrMeta" resolves to "Control" on Windows and Linux and to "Meta" on macOS. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional) Added in: v1.11# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it. Note that keyboard modifiers will be pressed regardless of trial to allow testing elements which are only visible when those keys are pressed

Promise<void># dispatch

## Event

Added before v1.9 page.dispatchEvent DiscouragedUse locator-based locator.dispatchEvent() instead. Read more about locators. The snippet below dispatches the click event on the element. Regardless of the visibility state of the element, click is dispatched. This is equivalent to calling element.click()

await page.dispatchEvent('button#submit', 'click'); Under the hood, it creates an instance of an event based on the given type, initializes it with eventInit properties and dispatches it on the element

are composed, cancelable and bubble by default. Since eventInit is event-specific, please refer to the events documentation for the lists of initial properties: DeviceMotionEvent DeviceOrientationEvent DragEvent Event FocusEvent KeyboardEvent MouseEvent PointerEvent TouchEvent WheelEvent You can also specify JSHandle as the property value if you want live objects to be passed into the event: // Note you can only create DataTransfer in Chromium and Firefoxconst dataTransfer = await page.evaluateHandle(() => new DataTransfer());await page.dispatchEvent('#source', 'dragstart', { dataTransfer }); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. type string# DOM event type: "click", "dragstart", etc. eventInit EvaluationArgument (optional)# Optional event-specific initialization properties. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># fill​ Added before v1.9 page.fill DiscouragedUse locator-based locator.fill() instead. Read more about locators. This method waits for an element matching selector, waits for actionability checks, focuses the element, fills it and triggers an input event after filling. Note that you can pass an empty string to clear the input field. If the target element is not an <input>, <textarea> or [contenteditable] element, this method throws an error. However, if the element is inside the <label> element that has an associated control, the control will be filled instead. To send fine-grained keyboard events, use locator.pressSequentially()

await page.fill(selector, value);await page.fill(selector, value, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. value string# Value to fill for the <input>, <textarea> or [contenteditable] element. options Object (optional) force boolean (optional) Added in: v1.13# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># focus​ Added before v1.9 page.focus DiscouragedUse locator-based locator.focus() instead. Read more about locators. This method fetches an element with selector and focuses it. If there's no element matching selector, the method waits until a matching element appears in the DOM

await page.focus(selector);await page.focus(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># get

## Attribute

Added before v1.9 page.getAttribute DiscouragedUse locator-based locator.getAttribute() instead. Read more about locators

element attribute value

await page.getAttribute(selector, name);await page.getAttribute(selector, name, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. name string# Attribute name to get the value for. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<null | string># hover​ Added before v1.9 page.hover DiscouragedUse locator-based locator.hover() instead. Read more about locators. This method hovers over an element matching selector by performing the following steps: Find an element matching selector. If there is none, wait until a matching element is attached to the DOM. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.mouse to hover over the center of the element, or the specified position. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this

await page.hover(selector);await page.hover(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. modifiers Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"> (optional)# Modifier keys to press. Ensures that only these modifiers are pressed during the operation, and then restores current modifiers back. If not specified, currently pressed modifiers are used. "ControlOrMeta" resolves to "Control" on Windows and Linux and to "Meta" on macOS. noWaitAfter boolean (optional) Added in: v1.28# DeprecatedThis option has no effect. This option has no effect. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional) Added in: v1.11# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it. Note that keyboard modifiers will be pressed regardless of trial to allow testing elements which are only visible when those keys are pressed

Promise<void># inner

## HTML

Added before v1.9 page.innerHTML DiscouragedUse locator-based locator.innerHTML() instead. Read more about locators

element.innerHTML

await page.innerHTML(selector);await page.innerHTML(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<string># inner

## Text

Added before v1.9 page.innerText DiscouragedUse locator-based locator.innerText() instead. Read more about locators

element.innerText

await page.innerText(selector);await page.innerText(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<string># input

## Value

Added in: v1.13 page.inputValue DiscouragedUse locator-based locator.inputValue() instead. Read more about locators

input.value for the selected <input> or <textarea> or <select> element. Throws for non-input elements. However, if the element is inside the <label> element that has an associated control, returns the value of the control

await page.inputValue(selector);await page.inputValue(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<string># is

## Checked

Added before v1.9 page.isChecked DiscouragedUse locator-based locator.isChecked() instead. Read more about locators

whether the element is checked. Throws if the element is not a checkbox or radio input

await page.isChecked(selector);await page.isChecked(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<boolean># is

## Disabled

Added before v1.9 page.isDisabled DiscouragedUse locator-based locator.isDisabled() instead. Read more about locators

whether the element is disabled, the opposite of enabled

await page.isDisabled(selector);await page.isDisabled(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<boolean># is

## Editable

Added before v1.9 page.isEditable DiscouragedUse locator-based locator.isEditable() instead. Read more about locators

whether the element is editable

await page.isEditable(selector);await page.isEditable(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<boolean># is

## Enabled

Added before v1.9 page.isEnabled DiscouragedUse locator-based locator.isEnabled() instead. Read more about locators

whether the element is enabled

await page.isEnabled(selector);await page.isEnabled(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<boolean># is

## Hidden

Added before v1.9 page.isHidden DiscouragedUse locator-based locator.isHidden() instead. Read more about locators

whether the element is hidden, the opposite of visible. selector that does not match any elements is considered hidden

await page.isHidden(selector);await page.isHidden(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# DeprecatedThis option is ignored. page.isHidden() does not wait for the element to become hidden and returns immediately

Promise<boolean># is

## Visible

Added before v1.9 page.isVisible DiscouragedUse locator-based locator.isVisible() instead. Read more about locators

whether the element is visible. selector that does not match any elements is considered not visible

await page.isVisible(selector);await page.isVisible(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# DeprecatedThis option is ignored. page.isVisible() does not wait for the element to become visible and returns immediately

Promise<boolean># press​ Added before v1.9 page.press DiscouragedUse locator-based locator.press() instead. Read more about locators. Focuses the element, and then uses keyboard.down() and keyboard.up(). key can specify the intended keyboardEvent.key value or a single character to generate the text for. A superset of the key values can be found here. Examples of the keys are: F1 - F12, Digit0- Digit9, KeyA- KeyZ, Backquote, Minus, Equal, Backslash, Backspace, Tab, Delete, Escape, ArrowDown, End, Enter, Home, Insert, PageDown, PageUp, ArrowRight, ArrowUp, etc. Following modification shortcuts are also supported: Shift, Control, Alt, Meta, ShiftLeft, ControlOrMeta. ControlOrMeta resolves to Control on Windows and Linux and to Meta on macOS. Holding down Shift will type the text that corresponds to the key in the upper case. If key is a single character, it is case-sensitive, so the values a and A will generate different respective texts. Shortcuts such as key: "Control+o", key: "Control++ or key: "Control+Shift+T" are supported as well. When specified with the modifier, modifier is pressed and being held while the subsequent key is being pressed

const page = await browser.newPage();await page.goto('https://keycode.info');await page.press('body', 'A');await page.screenshot({ path: 'A.png' });await page.press('body', 'ArrowLeft');await page.screenshot({ path: 'ArrowLeft.png' });await page.press('body', 'Shift+O');await page.screenshot({ path: 'O.png' });await browser.close(); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. key string# Name of the key to press or a character to generate, such as ArrowLeft or a. options Object (optional) delay number (optional)# Time to wait between keydown and keyup in milliseconds. Defaults to 0. noWaitAfter boolean (optional)# DeprecatedThis option will default to true in the future. Actions that initiate navigations are waiting for these navigations to happen and for pages to start loading. You can opt out of waiting via setting this flag. You would only need this option in the exceptional cases such as navigating to inaccessible pages. Defaults to false. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># select

## Option

Added before v1.9 page.selectOption DiscouragedUse locator-based locator.selectOption() instead. Read more about locators. This method waits for an element matching selector, waits for actionability checks, waits until all specified options are present in the <select> element and selects these options. If the target element is not a <select> element, this method throws an error. However, if the element is inside the <label> element that has an associated control, the control will be used instead

the array of option values that have been successfully selected. Triggers a change and input event once all the provided options have been selected

// Single selection matching the value or labelpage.selectOption('select#colors', 'blue');// single selection matching the labelpage.selectOption('select#colors', { label: 'Blue' });// multiple selectionpage.selectOption('select#colors', ['red', 'green', 'blue']); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. values null | string | ElementHandle | Array<string> | Object | Array<ElementHandle> | Array<Object># value string (optional) Matches by option.value. Optional. label string (optional) Matches by option.label. Optional. index number (optional) Matches by the index. Optional. Options to select. If the <select> has the multiple attribute, all matching options are selected, otherwise only the first option matching one of the passed options is selected. String values are matching both values and labels. Option is considered matching if all specified properties match. options Object (optional) force boolean (optional) Added in: v1.13# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<Array<string>># set

## Checked

Added in: v1.15 page.setChecked DiscouragedUse locator-based locator.setChecked() instead. Read more about locators. This method checks or unchecks an element matching selector by performing the following steps: Find an element matching selector. If there is none, wait until a matching element is attached to the DOM. Ensure that matched element is a checkbox or a radio input. If not, this method throws. If the element already has the right checked state, this method returns immediately. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.mouse to click in the center of the element. Ensure that the element is now checked or unchecked. If not, this method throws. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this

await page.setChecked(selector, checked);await page.setChecked(selector, checked, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. checked boolean# Whether to check or uncheck the checkbox. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. strict boolean (optional)# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional)# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it

Promise<void># set

## InputFiles

Added before v1.9 page.setInputFiles DiscouragedUse locator-based locator.setInputFiles() instead. Read more about locators. Sets the value of the file input to these file paths or files. If some of the filePaths are relative paths, then they are resolved relative to the current working directory. For empty array, clears the selected files. For inputs with a [webkitdirectory] attribute, only a single directory path is supported. This method expects selector to point to an input element. However, if the element is inside the <label> element that has an associated control, targets the control instead

await page.setInputFiles(selector, files);await page.setInputFiles(selector, files, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. files string | Array<string> | Object | Array<Object># name string File name mimeType string File type buffer Buffer File content options Object (optional) noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># tap​ Added before v1.9 page.tap DiscouragedUse locator-based locator.tap() instead. Read more about locators. This method taps an element matching selector by performing the following steps: Find an element matching selector. If there is none, wait until a matching element is attached to the DOM. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.touchscreen to tap the center of the element, or the specified position. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this. notepage.tap() the method will throw if hasTouch option of the browser context is false

await page.tap(selector);await page.tap(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. modifiers Array<"Alt" | "Control" | "ControlOrMeta" | "Meta" | "Shift"> (optional)# Modifier keys to press. Ensures that only these modifiers are pressed during the operation, and then restores current modifiers back. If not specified, currently pressed modifiers are used. "ControlOrMeta" resolves to "Control" on Windows and Linux and to "Meta" on macOS. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional)# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional) Added in: v1.11# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it. Note that keyboard modifiers will be pressed regardless of trial to allow testing elements which are only visible when those keys are pressed

Promise<void># text

## Content

Added before v1.9 page.textContent DiscouragedUse locator-based locator.textContent() instead. Read more about locators

element.textContent

await page.textContent(selector);await page.textContent(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<null | string># type​ Added before v1.9 page.type DeprecatedIn most cases, you should use locator.fill() instead. You only need to press keys one by one if there is special keyboard handling on the page - in this case use locator.pressSequentially(). Sends a keydown, keypress/input, and keyup event for each character in the text. page.type can be used to send fine-grained keyboard events. To fill values in form fields, use page.fill(). To press a special key, like Control or ArrowDown, use keyboard.press()

Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. text string# A text to type into a focused element. options Object (optional) delay number (optional)# Time to wait between key presses in milliseconds. Defaults to 0. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<void># uncheck​ Added before v1.9 page.uncheck DiscouragedUse locator-based locator.uncheck() instead. Read more about locators. This method unchecks an element matching selector by performing the following steps: Find an element matching selector. If there is none, wait until a matching element is attached to the DOM. Ensure that matched element is a checkbox or a radio input. If not, this method throws. If the element is already unchecked, this method returns immediately. Wait for actionability checks on the matched element, unless force option is set. If the element is detached during the checks, the whole action is retried. Scroll the element into view if needed. Use page.mouse to click in the center of the element. Ensure that the element is now unchecked. If not, this method throws. When all steps combined have not finished during the specified timeout, this method throws a TimeoutError. Passing zero timeout disables this

await page.uncheck(selector);await page.uncheck(selector, options); Arguments selector string# A selector to search for an element. If there are multiple elements satisfying the selector, the first will be used. options Object (optional) force boolean (optional)# Whether to bypass the actionability checks. Defaults to false. noWaitAfter boolean (optional)# DeprecatedThis option has no effect. This option has no effect. position Object (optional) Added in: v1.11# x number y number A point to use relative to the top-left corner of element padding box. If not specified, uses some visible point of the element. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods. trial boolean (optional) Added in: v1.11# When set, this method only performs the actionability checks and skips the action. Defaults to false. Useful to wait until the element is ready for the action without performing it

Promise<void># wait

## ForNavigation

Added before v1.9 page.waitForNavigation DeprecatedThis method is inherently racy, please use page.waitForURL() instead. Waits for the main frame navigation and returns the main resource response. In case of multiple redirects, the navigation will resolve with the response of the last redirect. In case of navigation to a different anchor or navigation due to History API usage, the navigation will resolve with null

This resolves when the page navigates to a new URL or reloads. It is useful for when you run code which will indirectly cause the page to navigate. e.g. The click target has an onclick handler that triggers navigation from a setTimeout. Consider this example: // Start waiting for navigation before clicking. Note no await.const navigationPromise = page.waitForNavigation();await page.getByText('Navigate after timeout').click();await navigationPromise; noteUsage of the History API to change the URL is considered a navigation

options Object (optional) timeout number (optional)# Maximum operation time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via navigationTimeout option in the config, or by using the browserContext.setDefaultNavigationTimeout(), browserContext.setDefaultTimeout(), page.setDefaultNavigationTimeout() or page.setDefaultTimeout() methods. url string | RegExp | [URLPattern] | function(URL):boolean (optional)# A glob pattern, regex pattern, URL pattern, or predicate receiving URL to match while waiting for the navigation. Note that if the parameter is a string without wildcard characters, the method will wait for navigation to URL that is exactly equal to the string. waitUntil "load" | "domcontentloaded" | "networkidle" | "commit" (optional)# When to consider operation succeeded, defaults to load

can be either: 'domcontentloaded' - consider operation to be finished when the DOMContentLoaded event is fired. 'load' - consider operation to be finished when the load event is fired. 'networkidle' - DISCOURAGED consider operation to be finished when there are no network connections for at least 500 ms. Don't use this method for testing, rely on web assertions to assess readiness instead. 'commit' - consider operation to be finished when network response is received and the document started loading

Promise<null | Response># wait

## ForSelector

Added before v1.9 page.waitForSelector DiscouragedUse web assertions that assert visibility or a locator-based locator.waitFor() instead. Read more about locators

when element specified by selector satisfies state option

null if waiting for hidden or detached. notePlaywright automatically waits for element to be ready before performing an action. Using Locator objects and web-first assertions makes the code wait-for-selector-free. Wait for the selector to satisfy state option (either appear/disappear from dom, or become visible/hidden). If at the moment of calling the method selector already satisfies the condition, the method will return immediately. If the selector doesn't satisfy the condition for the timeout milliseconds, the function will throw

This method works across navigations: const { chromium } = require('playwright'); // Or 'firefox' or 'webkit'.(async () => { const browser = await chromium.launch(); const page = await browser.newPage(); for (const currentURL of ['https://google.com', 'https://bbc.com']) { await page.goto(currentURL); const element = await page.waitForSelector('img'); console.log('Loaded image: ' + await element.getAttribute('src')); } await browser.close();})(); Arguments selector string# A selector to query for. options Object (optional) state "attached" | "detached" | "visible" | "hidden" (optional)# Defaults to 'visible'. Can be either: 'attached' - wait for element to be present in DOM. 'detached' - wait for element to not be present in DOM. 'visible' - wait for element to have non-empty bounding box and no visibility:hidden. Note that element without any content or with display:none has an empty bounding box and is not considered visible. 'hidden' - wait for element to be either detached from DOM, or have an empty bounding box or visibility:hidden. This is opposite to the 'visible' option. strict boolean (optional) Added in: v1.14# When true, the call requires selector to resolve to a single element. If given selector resolves to more than one element, the call throws an exception. timeout number (optional)# Maximum time in milliseconds. Defaults to 0 - no timeout. The default value can be changed via actionTimeout option in the config, or by using the browserContext.setDefaultTimeout() or page.setDefaultTimeout() methods

Promise<null | ElementHandle># wait

## ForTimeout

Added before v1.9 page.waitForTimeout DiscouragedNever wait for timeout in production. Tests that wait for time are inherently flaky. Use Locator actions and web assertions that wait automatically. Waits for the given timeout in milliseconds. Note that page.waitForTimeout() should only be used for debugging. Tests using the timer in production are going to be flaky. Use signals such as network events, selectors becoming visible and others instead

// wait for 1 secondawait page.waitForTimeout(1000); Arguments timeout number# A timeout to wait for Returns Promise<void>#
