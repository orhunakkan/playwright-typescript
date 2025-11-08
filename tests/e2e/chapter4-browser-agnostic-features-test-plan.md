# Chapter 4. Browser-Agnostic Features - Comprehensive Test Plan

## Application Overview

Chapter 4 of the Hands-On Selenium WebDriver with Java practice site contains eight distinct web pages designed to test browser-agnostic features that are commonly encountered in web automation. These pages demonstrate fundamental browser capabilities that work across different browser types and versions:

- **Long page**: Tests scrolling functionality on pages with extended vertical content (3837px height)
- **Infinite scroll**: Demonstrates dynamic content loading as the user scrolls down the page
- **Shadow DOM**: Tests interaction with Shadow DOM encapsulated content
- **Cookies**: Provides cookie manipulation and display functionality
- **Frames**: Tests working with traditional HTML framesets (3 frames)
- **IFrames**: Tests interaction with inline frames embedded within a page
- **Dialog boxes**: Tests handling of various JavaScript dialog types (alert, confirm, prompt, modal)
- **Web storage**: Tests localStorage and sessionStorage manipulation and retrieval

## Test Scenarios

### 1. Long Page - Scrolling Tests

**Seed:** `tests/seed.spec.ts`

#### 1.1 Verify Long Page Load

**Steps:**

1. Navigate to `https://bonigarcia.dev/selenium-webdriver-java/long-page.html`
2. Wait for page to load completely

**Expected Results:**

- Page URL is `https://bonigarcia.dev/selenium-webdriver-java/long-page.html`
- Page title is "Hands-On Selenium WebDriver with Java"
- Main heading "This is a long page" is visible
- Header with site title and GitHub link is visible
- Page content contains multiple Lorem ipsum paragraphs

#### 1.2 Verify Page Height Exceeds Viewport

**Steps:**

1. Navigate to long page
2. Get document body scroll height
3. Get viewport height
4. Compare the values

**Expected Results:**

- Document scroll height is approximately 3837px
- Viewport height is less than scroll height (approximately 720px)
- Vertical scrollbar is present
- Content extends beyond initial viewport

#### 1.3 Scroll to Bottom of Page

**Steps:**

1. Navigate to long page
2. Verify initial scroll position is at top (scrollY = 0)
3. Execute scroll to bottom using `window.scrollTo(0, document.body.scrollHeight)`
4. Verify scroll position changed

**Expected Results:**

- Initial scroll position is 0
- After scrolling, scroll position is greater than 3000
- Footer "Copyright © 2021-2025 Boni García" is visible
- Last paragraph of content is visible in viewport

#### 1.4 Scroll to Specific Element

**Steps:**

1. Navigate to long page
2. Identify a paragraph element in the middle of the page (e.g., 10th paragraph)
3. Scroll the element into view using `scrollIntoView()`
4. Verify element is in viewport

**Expected Results:**

- Target element is visible after scrolling
- Scroll position is between 0 and maximum scroll height
- Page doesn't scroll to top or bottom
- Element is centered or near top of viewport

#### 1.5 Scroll Up from Bottom

**Steps:**

1. Navigate to long page
2. Scroll to bottom
3. Scroll back to top using `window.scrollTo(0, 0)`
4. Verify scroll position

**Expected Results:**

- After scrolling to top, scrollY position is 0
- First paragraph is visible
- Main heading "This is a long page" is visible in viewport
- Header remains at top of page

#### 1.6 Verify Scroll by Pixel Amount

**Steps:**

1. Navigate to long page
2. Note initial scroll position
3. Scroll down by 500 pixels using `window.scrollBy(0, 500)`
4. Verify new scroll position

**Expected Results:**

- Scroll position increases by approximately 500 pixels
- Content shifts up in viewport
- New content becomes visible at bottom of viewport
- Page scrolls smoothly

#### 1.7 Return to Index from Long Page

**Steps:**

1. Navigate to long page
2. Click the site title/logo or use browser back
3. Verify navigation back to index

**Expected Results:**

- URL changes to index.html
- Main index page with all chapters is displayed
- Chapter 4 section is visible with all its links

---

### 2. Infinite Scroll - Dynamic Content Loading

**Seed:** `tests/seed.spec.ts`

#### 2.1 Verify Infinite Scroll Page Load

**Steps:**

1. Navigate to `https://bonigarcia.dev/selenium-webdriver-java/infinite-scroll.html`
2. Wait for page to load completely

**Expected Results:**

- Page URL is `https://bonigarcia.dev/selenium-webdriver-java/infinite-scroll.html`
- Page title is "Hands-On Selenium WebDriver with Java"
- Main heading "Infinite scroll" is visible
- Initial set of Lorem ipsum paragraphs is loaded
- Page is scrollable

#### 2.2 Verify Initial Content Count

**Steps:**

1. Navigate to infinite scroll page
2. Count the number of paragraph elements initially loaded
3. Note the initial page height

**Expected Results:**

- Initial paragraph count is 20 paragraphs
- Initial page height is approximately 3837px
- Content fills more than one viewport height
- Scroll is possible

#### 2.3 Trigger Content Loading by Scrolling

**Steps:**

1. Navigate to infinite scroll page
2. Count initial paragraphs
3. Scroll to bottom of page
4. Wait briefly for new content to load
5. Count paragraphs again
6. Verify page height increased

**Expected Results:**

- New paragraphs are added after scrolling to bottom
- Paragraph count increases (adds approximately 20 more paragraphs)
- Page height increases beyond initial height
- No error messages or console errors occur
- New content appears seamlessly

#### 2.4 Trigger Multiple Scroll Events

**Steps:**

1. Navigate to infinite scroll page
2. Record initial paragraph count
3. Scroll to bottom
4. Wait for content to load
5. Scroll to new bottom
6. Wait for additional content to load
7. Verify content continues to increase

**Expected Results:**

- Content loads after each scroll to bottom event
- Paragraph count increases with each load cycle
- Page continues to extend vertically
- Performance remains stable
- No duplicate content appears

#### 2.5 Verify Content During Rapid Scrolling

**Steps:**

1. Navigate to infinite scroll page
2. Perform rapid scroll to bottom multiple times
3. Verify content loading behavior

**Expected Results:**

- Page handles rapid scroll events gracefully
- Content loads appropriately
- No JavaScript errors occur
- Page remains responsive
- Content doesn't overlap or corrupt

#### 2.6 Verify Scroll Position Persistence

**Steps:**

1. Navigate to infinite scroll page
2. Scroll down to load additional content
3. Scroll to a specific position in the middle
4. Note the scroll position
5. Click a link to navigate away
6. Use browser back button
7. Check scroll position

**Expected Results:**

- Browser may restore scroll position (browser-dependent)
- Content at that position is still visible
- No errors occur on page restore

#### 2.7 Return to Index from Infinite Scroll Page

**Steps:**

1. Navigate to infinite scroll page
2. Navigate back to index page

**Expected Results:**

- Successfully returns to index page
- No content from infinite scroll persists
- Index page loads normally

---

### 3. Shadow DOM - Encapsulated Content

**Seed:** `tests/seed.spec.ts`

#### 3.1 Verify Shadow DOM Page Load

**Steps:**

1. Navigate to `https://bonigarcia.dev/selenium-webdriver-java/shadow-dom.html`
2. Wait for page to load completely

**Expected Results:**

- Page URL is `https://bonigarcia.dev/selenium-webdriver-java/shadow-dom.html`
- Page title is "Hands-On Selenium WebDriver with Java"
- Main heading "Shadow DOM" is visible
- Text "Hello Shadow DOM" is displayed on the page

#### 3.2 Verify Shadow DOM Content Visibility

**Steps:**

1. Navigate to shadow DOM page
2. Locate the "Hello Shadow DOM" text
3. Verify text is visible in the viewport

**Expected Results:**

- "Hello Shadow DOM" text is rendered on page
- Text is visible without scrolling
- Text appears below the main heading
- Standard page layout is maintained

#### 3.3 Access Shadow DOM Root

**Steps:**

1. Navigate to shadow DOM page
2. Use JavaScript to locate shadow host element
3. Access shadowRoot property
4. Verify shadow root exists

**Expected Results:**

- Shadow host element can be identified
- shadowRoot property is not null
- Shadow DOM is in "open" mode (accessible)
- Shadow content can be queried within shadow root

#### 3.4 Query Elements Inside Shadow DOM

**Steps:**

1. Navigate to shadow DOM page
2. Access shadow root
3. Query for elements within shadow DOM
4. Verify content can be retrieved

**Expected Results:**

- Elements within shadow DOM can be found using querySelector on shadowRoot
- Text content "Hello Shadow DOM" can be retrieved
- Shadow DOM elements are isolated from main DOM
- Standard DOM queries from document root don't find shadow content

#### 3.5 Verify Shadow DOM Encapsulation

**Steps:**

1. Navigate to shadow DOM page
2. Attempt to query shadow DOM content directly from document
3. Verify query returns null/empty
4. Access via shadow root and verify success

**Expected Results:**

- Direct document.querySelector for shadow content returns null
- Only queries through shadowRoot can access shadow content
- Shadow DOM provides proper encapsulation
- Styles within shadow DOM are isolated (if applicable)

#### 3.6 Interact with Shadow DOM Content

**Steps:**

1. Navigate to shadow DOM page
2. Access shadow root
3. Locate interactive elements within shadow DOM (if any)
4. Attempt interaction

**Expected Results:**

- Interactive elements respond to actions
- Events within shadow DOM function correctly
- Shadow DOM behaves as regular DOM for interactions
- No JavaScript errors occur

#### 3.7 Return to Index from Shadow DOM Page

**Steps:**

1. Navigate to shadow DOM page
2. Navigate back to index page

**Expected Results:**

- Successfully returns to index page
- No shadow DOM content persists
- Index page loads normally

---

### 4. Cookies - Browser Cookie Management

**Seed:** `tests/seed.spec.ts`

#### 4.1 Verify Cookies Page Load

**Steps:**

1. Navigate to `https://bonigarcia.dev/selenium-webdriver-java/cookies.html`
2. Wait for page to load completely

**Expected Results:**

- Page URL is `https://bonigarcia.dev/selenium-webdriver-java/cookies.html`
- Page title is "Hands-On Selenium WebDriver with Java"
- Main heading "Cookies" is visible
- "Display cookies" button is present and enabled
- Empty paragraph element exists for cookie display

#### 4.2 Display Pre-set Cookies

**Steps:**

1. Navigate to cookies page
2. Click "Display cookies" button
3. Observe displayed cookie information

**Expected Results:**

- Cookie information is displayed in the paragraph below button
- Two cookies are shown:
  - `username=John Doe`
  - `date=10/07/2018`
- Cookies are displayed in readable text format
- No errors occur when displaying cookies

#### 4.3 Verify Cookies in Browser

**Steps:**

1. Navigate to cookies page
2. Use browser DevTools or automation API to get all cookies
3. Verify presence of expected cookies

**Expected Results:**

- Browser contains cookies for the domain
- Cookie named "username" exists with value "John Doe"
- Cookie named "date" exists with value "10/07/2018"
- Cookies are accessible via browser cookie API
- Cookie properties (domain, path, etc.) are correctly set

#### 4.4 Add New Cookie

**Steps:**

1. Navigate to cookies page
2. Use browser API to add a new cookie (e.g., `testcookie=testvalue`)
3. Click "Display cookies" button
4. Verify new cookie appears

**Expected Results:**

- New cookie is successfully added
- Display cookies shows the new cookie along with existing ones
- Cookie persists in browser storage
- No errors occur

#### 4.5 Delete Specific Cookie

**Steps:**

1. Navigate to cookies page
2. Display initial cookies
3. Use browser API to delete "username" cookie
4. Click "Display cookies" button again
5. Verify cookie is removed

**Expected Results:**

- "username" cookie is successfully deleted
- Display shows only remaining cookies
- "date" cookie is still present
- Page functions normally without deleted cookie

#### 4.6 Delete All Cookies

**Steps:**

1. Navigate to cookies page
2. Display initial cookies
3. Use browser API to delete all cookies
4. Click "Display cookies" button
5. Verify no cookies displayed

**Expected Results:**

- All cookies are successfully deleted
- Display shows empty or no cookie message
- Page continues to function
- No JavaScript errors occur

#### 4.7 Verify Cookie Persistence After Refresh

**Steps:**

1. Navigate to cookies page
2. Display cookies to verify presence
3. Refresh the page
4. Display cookies again
5. Verify cookies persist

**Expected Results:**

- Cookies persist after page refresh
- Same cookies are displayed after refresh
- Cookie values remain unchanged
- No cookies are lost

#### 4.8 Return to Index from Cookies Page

**Steps:**

1. Navigate to cookies page
2. Navigate back to index page

**Expected Results:**

- Successfully returns to index page
- Cookies remain in browser (domain-specific)
- Index page loads normally

---

### 5. Frames - HTML Frameset

**Seed:** `tests/seed.spec.ts`

#### 5.1 Verify Frames Page Load

**Steps:**

1. Navigate to `https://bonigarcia.dev/selenium-webdriver-java/frames.html`
2. Wait for page to load completely

**Expected Results:**

- Page URL is `https://bonigarcia.dev/selenium-webdriver-java/frames.html`
- Page title is "Hands-On Selenium WebDriver with Java"
- Page uses HTML frameset structure
- Multiple frames are present on the page
- No standard body content is visible (frameset page)

#### 5.2 Verify Frame Count

**Steps:**

1. Navigate to frames page
2. Count the number of frames using `window.frames.length` or similar
3. Verify frameset structure

**Expected Results:**

- Page contains exactly 3 frames
- Frameset element exists in HTML structure
- Each frame has a distinct name or id
- Frames are properly loaded

#### 5.3 Switch to First Frame

**Steps:**

1. Navigate to frames page
2. Switch context to the first frame (index 0)
3. Verify content within first frame
4. Locate elements within the frame

**Expected Results:**

- Successfully switches to first frame context
- Frame content is accessible
- Can query elements within the frame
- Elements outside frame are not accessible in this context

#### 5.4 Switch to Second Frame

**Steps:**

1. Navigate to frames page
2. Switch context to the second frame (index 1)
3. Verify content within second frame
4. Verify it's different from first frame

**Expected Results:**

- Successfully switches to second frame context
- Frame content is accessible and distinct from first frame
- Can query elements within this frame
- Previous frame context is no longer active

#### 5.5 Switch to Third Frame

**Steps:**

1. Navigate to frames page
2. Switch context to the third frame (index 2)
3. Verify content within third frame

**Expected Results:**

- Successfully switches to third frame context
- Frame content is accessible
- Can query elements within this frame
- Content is distinct from other frames

#### 5.6 Switch Between Frames Multiple Times

**Steps:**

1. Navigate to frames page
2. Switch to first frame and verify content
3. Switch to second frame and verify content
4. Switch back to first frame and verify content
5. Switch to default content (main page)

**Expected Results:**

- Can switch between frames without errors
- Each frame maintains its own content
- Content doesn't get mixed between frames
- Can return to default/top-level context

#### 5.7 Verify Frame Independence

**Steps:**

1. Navigate to frames page
2. Switch to first frame
3. Attempt to access elements from second frame
4. Verify elements are not accessible

**Expected Results:**

- Elements in other frames are not accessible from current frame context
- Queries return null or not found
- Must explicitly switch context to access different frame
- Each frame maintains proper isolation

#### 5.8 Return to Index from Frames Page

**Steps:**

1. Navigate to frames page
2. Navigate back to index page (may require switching to default content first)

**Expected Results:**

- Successfully returns to index page
- No frame content persists
- Index page loads normally with standard layout

---

### 6. IFrames - Inline Frames

**Seed:** `tests/seed.spec.ts`

#### 6.1 Verify IFrames Page Load

**Steps:**

1. Navigate to `https://bonigarcia.dev/selenium-webdriver-java/iframes.html`
2. Wait for page to load completely

**Expected Results:**

- Page URL is `https://bonigarcia.dev/selenium-webdriver-java/iframes.html`
- Page title is "Hands-On Selenium WebDriver with Java"
- Main heading "IFrame" is visible
- Page contains an iframe element
- Iframe content is loaded and visible

#### 6.2 Verify IFrame Presence

**Steps:**

1. Navigate to iframes page
2. Locate iframe element on the page
3. Verify iframe properties (src, dimensions, etc.)

**Expected Results:**

- Iframe element exists on page
- Iframe has defined width and height
- Iframe src attribute points to valid content
- Iframe is visible in viewport

#### 6.3 Switch to IFrame Context

**Steps:**

1. Navigate to iframes page
2. Switch automation context to the iframe
3. Verify content is accessible within iframe

**Expected Results:**

- Successfully switches to iframe context
- Can query elements within iframe
- Iframe contains Lorem ipsum paragraph content
- Multiple paragraphs are present within iframe

#### 6.4 Verify IFrame Content

**Steps:**

1. Navigate to iframes page
2. Switch to iframe
3. Count paragraph elements within iframe
4. Verify text content

**Expected Results:**

- Iframe contains multiple paragraphs (approximately 20)
- Paragraphs contain Lorem ipsum text
- Content is similar to long-page content
- Text is properly rendered

#### 6.5 Interact with IFrame Content

**Steps:**

1. Navigate to iframes page
2. Switch to iframe
3. Locate a specific paragraph element
4. Verify element properties and text

**Expected Results:**

- Can locate specific elements within iframe
- Text content can be retrieved
- Element properties are accessible
- Interactions work within iframe context

#### 6.6 Switch Back to Main Page from IFrame

**Steps:**

1. Navigate to iframes page
2. Switch to iframe context
3. Perform actions within iframe
4. Switch back to default/parent content
5. Verify main page elements are accessible

**Expected Results:**

- Can successfully switch back to parent page
- Main page heading "IFrame" is accessible
- Footer with copyright is accessible
- Iframe is no longer the active context

#### 6.7 Verify IFrame Scrolling

**Steps:**

1. Navigate to iframes page
2. Switch to iframe
3. Get iframe scroll height
4. Scroll within iframe if content exceeds viewport
5. Verify scrolling works independently

**Expected Results:**

- IFrame has its own scroll context
- Can scroll within iframe independently of parent page
- Iframe content extends beyond visible area
- Scrollbar appears within iframe if needed

#### 6.8 Verify Parent and IFrame Isolation

**Steps:**

1. Navigate to iframes page
2. Attempt to access iframe content without switching context
3. Verify content is not accessible
4. Switch to iframe and verify access succeeds

**Expected Results:**

- Cannot access iframe content from parent context
- Must explicitly switch to iframe context
- After switching, iframe content is accessible
- Proper isolation is maintained

#### 6.9 Return to Index from IFrames Page

**Steps:**

1. Navigate to iframes page
2. If in iframe context, switch to default content
3. Navigate back to index page

**Expected Results:**

- Successfully returns to index page
- No iframe content persists
- Index page loads normally

---

### 7. Dialog Boxes - JavaScript Dialogs

**Seed:** `tests/seed.spec.ts`

#### 7.1 Verify Dialog Boxes Page Load

**Steps:**

1. Navigate to `https://bonigarcia.dev/selenium-webdriver-java/dialog-boxes.html`
2. Wait for page to load completely

**Expected Results:**

- Page URL is `https://bonigarcia.dev/selenium-webdriver-java/dialog-boxes.html`
- Page title is "Hands-On Selenium WebDriver with Java"
- Main heading "Dialog boxes" is visible
- Four buttons are present:
  - "Launch alert"
  - "Launch confirm"
  - "Launch prompt"
  - "Launch modal"
- Result paragraphs exist for each dialog type

#### 7.2 Launch and Accept Alert Dialog

**Steps:**

1. Navigate to dialog boxes page
2. Set up alert handler to accept
3. Click "Launch alert" button
4. Verify alert appears
5. Accept the alert
6. Verify alert is dismissed

**Expected Results:**

- Alert dialog appears with expected message
- Alert message can be retrieved
- Alert is successfully dismissed after accepting
- Page remains functional after alert
- No result text appears (alerts don't return values)

#### 7.3 Launch and Accept Confirm Dialog

**Steps:**

1. Navigate to dialog boxes page
2. Set up confirm dialog handler to accept (click OK)
3. Click "Launch confirm" button
4. Verify confirm dialog appears
5. Accept the confirm dialog
6. Check result paragraph for "OK" message

**Expected Results:**

- Confirm dialog appears with expected message
- Dialog message can be retrieved
- After accepting, dialog is dismissed
- Result paragraph shows "You chose: OK" or similar
- Page updates with confirm result

#### 7.4 Launch and Dismiss Confirm Dialog

**Steps:**

1. Navigate to dialog boxes page
2. Set up confirm dialog handler to dismiss (click Cancel)
3. Click "Launch confirm" button
4. Verify confirm dialog appears
5. Dismiss the confirm dialog
6. Check result paragraph for "Cancel" message

**Expected Results:**

- Confirm dialog appears with expected message
- After dismissing, dialog is closed
- Result paragraph shows "You chose: Cancel" or similar
- Page updates with dismissal result
- No errors occur

#### 7.5 Launch and Accept Prompt Dialog with Input

**Steps:**

1. Navigate to dialog boxes page
2. Set up prompt dialog handler to accept with text input (e.g., "Test User")
3. Click "Launch prompt" button
4. Verify prompt dialog appears
5. Enter text and accept
6. Check result paragraph for entered text

**Expected Results:**

- Prompt dialog appears with input field
- Default text (if any) is visible
- Can send text to prompt input
- After accepting, dialog is dismissed
- Result paragraph shows entered text (e.g., "You typed: Test User")

#### 7.6 Launch and Dismiss Prompt Dialog

**Steps:**

1. Navigate to dialog boxes page
2. Set up prompt dialog handler to dismiss (click Cancel)
3. Click "Launch prompt" button
4. Verify prompt dialog appears
5. Dismiss the prompt dialog
6. Check result paragraph

**Expected Results:**

- Prompt dialog appears with input field
- After dismissing, dialog is closed
- Result paragraph shows null or cancellation message
- No text input is processed
- Page remains functional

#### 7.7 Launch Modal Dialog

**Steps:**

1. Navigate to dialog boxes page
2. Click "Launch modal" button
3. Verify modal appears on page
4. Locate close button in modal
5. Close the modal
6. Verify modal is dismissed

**Expected Results:**

- Modal dialog appears overlaid on page
- Modal contains content and close button
- Page content behind modal is dimmed or blocked
- Can interact with modal elements
- After closing, modal is no longer visible
- Main page is accessible again

#### 7.8 Verify Modal Content and Interaction

**Steps:**

1. Navigate to dialog boxes page
2. Click "Launch modal" button
3. Verify modal content
4. Attempt to interact with main page (should be blocked)
5. Close modal and verify page is accessible

**Expected Results:**

- Modal displays expected content
- Modal has proper styling and overlay
- Cannot interact with page elements behind modal
- Focus is trapped within modal
- After closing, full page interaction is restored

#### 7.9 Handle Multiple Dialog Types in Sequence

**Steps:**

1. Navigate to dialog boxes page
2. Launch and handle alert
3. Launch and handle confirm (accept)
4. Launch and handle prompt (with input)
5. Launch and close modal
6. Verify all work correctly

**Expected Results:**

- Each dialog type works independently
- No interference between different dialog types
- Results display correctly for each
- Page remains stable throughout
- No errors occur

#### 7.10 Return to Index from Dialog Boxes Page

**Steps:**

1. Navigate to dialog boxes page
2. Ensure no dialogs are open
3. Navigate back to index page

**Expected Results:**

- Successfully returns to index page
- No dialogs persist
- Index page loads normally

---

### 8. Web Storage - Local and Session Storage

**Seed:** `tests/seed.spec.ts`

#### 8.1 Verify Web Storage Page Load

**Steps:**

1. Navigate to `https://bonigarcia.dev/selenium-webdriver-java/web-storage.html`
2. Wait for page to load completely

**Expected Results:**

- Page URL is `https://bonigarcia.dev/selenium-webdriver-java/web-storage.html`
- Page title is "Hands-On Selenium WebDriver with Java"
- Main heading "Web storage" is visible
- Two sections present:
  - Local storage with "Display local storage" button
  - Session storage with "Display session storage" button
- Empty paragraphs exist for displaying storage content

#### 8.2 Display Local Storage

**Steps:**

1. Navigate to web storage page
2. Click "Display local storage" button
3. Observe displayed content

**Expected Results:**

- Local storage content is displayed in paragraph
- Initially shows empty object `{}` or empty message
- No errors occur when displaying
- Button remains functional

#### 8.3 Display Session Storage

**Steps:**

1. Navigate to web storage page
2. Click "Display session storage" button
3. Observe displayed content

**Expected Results:**

- Session storage content is displayed in paragraph
- Shows pre-populated data: `{"lastname":"Doe","name":"John"}`
- Data is formatted as JSON string
- Content appears in designated paragraph

#### 8.4 Add Item to Local Storage

**Steps:**

1. Navigate to web storage page
2. Use JavaScript execution to add item to localStorage (e.g., `localStorage.setItem('testKey', 'testValue')`)
3. Click "Display local storage" button
4. Verify new item appears

**Expected Results:**

- Item is successfully added to localStorage
- Display shows the new key-value pair
- Data persists in localStorage
- JSON format is maintained in display

#### 8.5 Add Item to Session Storage

**Steps:**

1. Navigate to web storage page
2. Use JavaScript execution to add item to sessionStorage (e.g., `sessionStorage.setItem('newKey', 'newValue')`)
3. Click "Display session storage" button
4. Verify new item appears along with existing items

**Expected Results:**

- Item is successfully added to sessionStorage
- Display shows existing items plus new item
- All items are displayed in JSON format
- No existing items are lost

#### 8.6 Remove Item from Local Storage

**Steps:**

1. Navigate to web storage page
2. Add item to localStorage
3. Display localStorage to confirm
4. Remove the item using `localStorage.removeItem('testKey')`
5. Display localStorage again
6. Verify item is removed

**Expected Results:**

- Item is successfully removed
- Display shows updated storage without removed item
- Other items remain unaffected
- Empty object shown if no items remain

#### 8.7 Remove Item from Session Storage

**Steps:**

1. Navigate to web storage page
2. Display session storage to see existing items
3. Remove an item using `sessionStorage.removeItem('name')`
4. Display session storage again
5. Verify item is removed

**Expected Results:**

- Specified item is removed from sessionStorage
- Display shows remaining items only
- "lastname" remains but "name" is gone
- JSON format is maintained

#### 8.8 Clear All Local Storage

**Steps:**

1. Navigate to web storage page
2. Add multiple items to localStorage
3. Display localStorage
4. Execute `localStorage.clear()`
5. Display localStorage again

**Expected Results:**

- All localStorage items are cleared
- Display shows empty object `{}`
- No items remain in localStorage
- Operation completes without errors

#### 8.9 Clear All Session Storage

**Steps:**

1. Navigate to web storage page
2. Display session storage with existing items
3. Execute `sessionStorage.clear()`
4. Display session storage again

**Expected Results:**

- All sessionStorage items are cleared
- Display shows empty object `{}`
- Pre-populated data is removed
- No errors occur

#### 8.10 Verify Local Storage Persistence

**Steps:**

1. Navigate to web storage page
2. Add item to localStorage
3. Display localStorage to confirm
4. Refresh the page (F5 or reload)
5. Display localStorage again
6. Verify item persists

**Expected Results:**

- localStorage item persists after page refresh
- Same data is displayed after refresh
- No data loss occurs
- localStorage maintains data across page loads

#### 8.11 Verify Session Storage Persistence Within Session

**Steps:**

1. Navigate to web storage page
2. Display session storage
3. Note the existing data
4. Refresh the page
5. Display session storage again
6. Verify data persists

**Expected Results:**

- sessionStorage data persists within the same browser session
- Data remains after page refresh
- Pre-populated data still appears
- No data is lost during refresh

#### 8.12 Verify Session Storage Clears on New Session

**Steps:**

1. Navigate to web storage page
2. Add custom item to sessionStorage
3. Display sessionStorage to confirm
4. Close browser/tab
5. Open new browser/tab and navigate to same page
6. Display sessionStorage

**Expected Results:**

- Custom items from previous session are gone
- New session starts with default/pre-populated data only
- sessionStorage doesn't persist across browser sessions
- Only data set by page on load is present

#### 8.13 Verify Storage Independence

**Steps:**

1. Navigate to web storage page
2. Add item to localStorage
3. Add different item to sessionStorage
4. Display both storages
5. Verify items are independent

**Expected Results:**

- localStorage items don't appear in sessionStorage
- sessionStorage items don't appear in localStorage
- Each storage mechanism is independent
- Both can be used simultaneously without interference

#### 8.14 Return to Index from Web Storage Page

**Steps:**

1. Navigate to web storage page
2. Navigate back to index page

**Expected Results:**

- Successfully returns to index page
- localStorage items persist (domain-specific)
- sessionStorage items persist within session
- Index page loads normally

---

## Test Coverage Summary

This comprehensive test plan covers:

1. **Long Page (7 scenarios)**: Scrolling behavior, page height, viewport interaction, scroll position management
2. **Infinite Scroll (7 scenarios)**: Dynamic content loading, scroll event handling, content persistence
3. **Shadow DOM (7 scenarios)**: Shadow DOM access, encapsulation, content querying, isolation
4. **Cookies (8 scenarios)**: Cookie display, creation, deletion, persistence, browser API interaction
5. **Frames (8 scenarios)**: Frame navigation, context switching, frame isolation, multi-frame handling
6. **IFrames (9 scenarios)**: IFrame access, content interaction, scrolling, context management
7. **Dialog Boxes (10 scenarios)**: Alert, confirm, prompt, modal dialogs, acceptance, dismissal, input handling
8. **Web Storage (14 scenarios)**: localStorage and sessionStorage manipulation, persistence, session management, independence

**Total Scenarios: 70**

Each scenario is designed to be independent and can be executed in any order, ensuring comprehensive coverage of browser-agnostic features commonly encountered in web automation testing.
