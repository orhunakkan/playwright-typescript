# Chapter 3: WebDriver Fundamentals - Comprehensive Test Plan

## Application Overview

The "Hands-On Selenium WebDriver with Java" practice site provides a collection of web pages designed for testing fundamental WebDriver interactions. Chapter 3 focuses on core WebDriver capabilities including form interactions, navigation, mouse operations, drag and drop, canvas drawing, image loading, and asynchronous calculations.

The Chapter 3 section includes eight distinct test pages:

- **Web Form**: Multi-input form with various HTML input types
- **Navigation**: Multi-page navigation with Previous/Next controls
- **Dropdown Menu**: Click interaction testing (left-click, right-click, double-click)
- **Mouse Over**: Hover interaction with image tooltips
- **Drag and Drop**: Draggable element testing
- **Draw in Canvas**: HTML5 canvas interaction
- **Loading Images**: Asynchronous image loading with wait conditions
- **Slow Calculator**: Delayed calculation with configurable timeout

**Base URL**: https://bonigarcia.dev/selenium-webdriver-java/

---

## Test Scenarios

### 1. Web Form Testing

**Seed:** `tests/seed.spec.ts`

#### 1.1 Verify Web Form Page Load

**Steps:**

1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/index.html
2. Locate the "Chapter 3. WebDriver Fundamentals" section
3. Click on "Web form" link

**Expected Results:**

- Page navigates to web-form.html
- Page title displays "Hands-On Selenium WebDriver with Java"
- "Web form" heading (h1) is visible
- All form elements are present and visible

#### 1.2 Fill Text Input Field

**Steps:**

1. Navigate to the Web form page
2. Locate the "Text input" field
3. Click in the text input field
4. Type "Sample text input"

**Expected Results:**

- Text input field accepts keyboard input
- Entered text "Sample text input" is visible in the field
- No validation errors appear

#### 1.3 Fill Password Field

**Steps:**

1. Navigate to the Web form page
2. Locate the "Password" field
3. Click in the password field
4. Type "SecureP@ssw0rd"

**Expected Results:**

- Password field accepts keyboard input
- Entered text is masked with dots or asterisks
- Actual password is not visible in the field

#### 1.4 Fill Textarea Field

**Steps:**

1. Navigate to the Web form page
2. Locate the "Textarea" field
3. Click in the textarea field
4. Type "This is a longer text input that spans multiple lines and tests textarea functionality"

**Expected Results:**

- Textarea accepts multi-line input
- Text wraps appropriately within textarea boundaries
- Entered text is fully visible

#### 1.5 Verify Disabled Input Field

**Steps:**

1. Navigate to the Web form page
2. Locate the "Disabled input" field
3. Attempt to click in the disabled input field
4. Attempt to type text in the disabled field

**Expected Results:**

- Disabled input field is visually distinguishable (typically grayed out)
- Field does not accept focus when clicked
- No text can be entered in the field
- Field attribute shows disabled state

#### 1.6 Verify Readonly Input Field

**Steps:**

1. Navigate to the Web form page
2. Locate the "Readonly input" field
3. Verify the pre-filled text value
4. Attempt to modify the text

**Expected Results:**

- Readonly input displays default text "Readonly input"
- Field accepts focus when clicked
- Field does not allow text modification
- Field attribute shows readonly state

#### 1.7 Select Dropdown (Select) Option

**Steps:**

1. Navigate to the Web form page
2. Locate the "Dropdown (select)" combobox
3. Click on the dropdown to open options
4. Verify visible options: "Open this select menu", "One", "Two", "Three"
5. Select option "Two"

**Expected Results:**

- Dropdown opens and displays all available options
- "Open this select menu" is selected by default
- Selected option "Two" becomes the displayed value
- Dropdown closes after selection

#### 1.8 Interact with Dropdown (Datalist)

**Steps:**

1. Navigate to the Web form page
2. Locate the "Dropdown (datalist)" field
3. Click in the datalist input field
4. Type partial text to trigger autocomplete
5. Select an option from the datalist

**Expected Results:**

- Datalist field accepts keyboard input
- Suggestions appear based on typed text
- Selected value populates the field

#### 1.9 Toggle Checked Checkbox

**Steps:**

1. Navigate to the Web form page
2. Locate the "Checked checkbox"
3. Verify checkbox is initially checked
4. Click the checkbox to uncheck it
5. Click the checkbox again to re-check it

**Expected Results:**

- Checkbox is checked by default (showing checkmark)
- Clicking unchecks the checkbox (removes checkmark)
- Clicking again re-checks the checkbox
- Checkbox state changes are immediately visible

#### 1.10 Toggle Default Checkbox

**Steps:**

1. Navigate to the Web form page
2. Locate the "Default checkbox"
3. Verify checkbox is initially unchecked
4. Click the checkbox to check it
5. Click the checkbox again to uncheck it

**Expected Results:**

- Checkbox is unchecked by default (no checkmark)
- Clicking checks the checkbox (adds checkmark)
- Clicking again unchecks the checkbox
- Checkbox state changes are immediately visible

#### 1.11 Select Radio Button Options

**Steps:**

1. Navigate to the Web form page
2. Locate the "Checked radio" button
3. Verify it is selected by default
4. Click the "Default radio" button
5. Attempt to click "Checked radio" again

**Expected Results:**

- "Checked radio" is selected by default
- Clicking "Default radio" deselects "Checked radio" and selects "Default radio"
- Only one radio button can be selected at a time
- Radio button selections are mutually exclusive

#### 1.12 Use Color Picker

**Steps:**

1. Navigate to the Web form page
2. Locate the "Color picker" field
3. Verify default color value "#563d7c"
4. Click on the color picker
5. Select a different color (e.g., red #ff0000)

**Expected Results:**

- Color picker displays current color "#563d7c" (purple)
- Clicking opens color picker interface
- Selected color updates the field value
- New color value is reflected in the input field

#### 1.13 Use Date Picker

**Steps:**

1. Navigate to the Web form page
2. Locate the "Date picker" field
3. Click on the date picker
4. Select a date from the calendar interface
5. Verify the selected date appears in the field

**Expected Results:**

- Date picker opens calendar interface
- Current date or selected date is highlighted
- Clicking a date populates the field
- Date format is consistent (typically YYYY-MM-DD)

#### 1.14 Adjust Range Slider

**Steps:**

1. Navigate to the Web form page
2. Locate the "Example range" slider
3. Verify default value is "5"
4. Drag slider to minimum position (left)
5. Drag slider to maximum position (right)
6. Drag slider to middle position

**Expected Results:**

- Slider displays default value "5"
- Slider can be dragged left and right
- Value updates as slider moves
- Minimum and maximum values are enforced

#### 1.15 Submit Form with Valid Data

**Steps:**

1. Navigate to the Web form page
2. Fill "Text input" field with "John Doe"
3. Fill "Password" field with "Test123!"
4. Fill "Textarea" field with "This is a test message"
5. Select "Two" from "Dropdown (select)"
6. Check "Default checkbox"
7. Select "Default radio" button
8. Click "Submit" button

**Expected Results:**

- Form accepts all valid inputs
- Submit button is clickable
- Page navigates to submitted-form.html
- Success message "Form submitted" heading appears
- Message "Received!" is displayed
- URL contains query parameters with submitted data

#### 1.16 Submit Form with Empty Fields

**Steps:**

1. Navigate to the Web form page
2. Leave all fields empty or at default values
3. Click "Submit" button

**Expected Results:**

- Form allows submission with empty fields (no client-side validation)
- Page navigates to submitted-form.html
- Success message appears
- Default values are passed in URL parameters

#### 1.17 Navigate Back from Web Form

**Steps:**

1. Navigate to the Web form page
2. Click "Return to index" link

**Expected Results:**

- Page navigates back to index.html
- Main index page loads successfully
- All chapter sections are visible

---

### 2. Navigation Testing

**Seed:** `tests/seed.spec.ts`

#### 2.1 Verify Navigation Page Load

**Steps:**

1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/index.html
2. Click on "Navigation" link in Chapter 3 section

**Expected Results:**

- Page navigates to navigation1.html
- "Navigation example" heading is visible
- Lorem ipsum text paragraph is displayed
- Pagination controls (Previous, 1, 2, 3, Next) are visible

#### 2.2 Navigate to Page 2 Using Next Button

**Steps:**

1. Navigate to navigation1.html
2. Verify "Previous" link is disabled/inactive
3. Click "Next" button

**Expected Results:**

- Page navigates to navigation2.html
- URL changes to navigation2.html
- Different Lorem ipsum text is displayed
- "Previous" link becomes active/clickable
- Page 2 is highlighted in pagination

#### 2.3 Navigate to Page 3 Using Page Number

**Steps:**

1. Navigate to navigation1.html
2. Click on page number "3" in pagination

**Expected Results:**

- Page navigates directly to navigation3.html
- URL changes to navigation3.html
- Page 3 content is displayed
- Page 3 is highlighted in pagination
- "Next" button may be disabled if page 3 is the last page

#### 2.4 Navigate Backward Using Previous Button

**Steps:**

1. Navigate to navigation2.html (or use Next from page 1)
2. Verify "Previous" button is active
3. Click "Previous" button

**Expected Results:**

- Page navigates back to navigation1.html
- URL changes to navigation1.html
- Page 1 content is displayed
- "Previous" button becomes inactive
- Page 1 is highlighted in pagination

#### 2.5 Navigate Through All Pages Sequentially

**Steps:**

1. Navigate to navigation1.html
2. Click "Next" to go to page 2
3. Click "Next" to go to page 3
4. Click "Previous" to go back to page 2
5. Click "Previous" to go back to page 1

**Expected Results:**

- Each navigation action changes the URL correctly
- Content updates for each page
- Pagination controls reflect current page accurately
- Previous/Next buttons are enabled/disabled appropriately

#### 2.6 Verify Page Content Changes

**Steps:**

1. Navigate to navigation1.html
2. Note the paragraph content (starts with "Lorem ipsum dolor sit amet")
3. Navigate to navigation2.html
4. Verify paragraph content is different (starts with "Ut enim ad minim veniam")
5. Navigate to navigation3.html (if exists)
6. Verify paragraph content is different

**Expected Results:**

- Each page displays unique content
- Paragraph text is clearly different on each page
- Page layout remains consistent across all pages

#### 2.7 Return to Index from Navigation Page

**Steps:**

1. Navigate to any navigation page (1, 2, or 3)
2. Click "Back to index" link

**Expected Results:**

- Page navigates to index.html
- Main index page loads successfully
- Navigation history is maintained

---

### 3. Dropdown Menu Testing (Click Interactions)

**Seed:** `tests/seed.spec.ts`

#### 3.1 Verify Dropdown Menu Page Load

**Steps:**

1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/index.html
2. Click on "Dropdown menu" link in Chapter 3 section

**Expected Results:**

- Page navigates to dropdown-menu.html
- "Dropdown menu" heading is visible
- Three buttons are displayed:
  - "Use left-click here"
  - "Use right-click here"
  - "Use double-click here"

#### 3.2 Test Left-Click Dropdown

**Steps:**

1. Navigate to dropdown-menu.html
2. Verify no dropdown menus are initially visible
3. Perform left-click on "Use left-click here" button
4. Verify dropdown menu appears

**Expected Results:**

- Left-click triggers dropdown menu to appear
- Dropdown displays menu items:
  - "Action"
  - "Another action"
  - "Something else here"
  - (separator)
  - "Separated link"
- Dropdown is positioned below the button
- Button shows active/expanded state

#### 3.3 Select Option from Left-Click Dropdown

**Steps:**

1. Navigate to dropdown-menu.html
2. Left-click on "Use left-click here" button
3. Click on "Another action" menu item

**Expected Results:**

- Dropdown menu item is clickable
- Menu item responds to hover (highlighting)
- Clicking menu item triggers appropriate action (may navigate or close menu)

#### 3.4 Test Right-Click Dropdown

**Steps:**

1. Navigate to dropdown-menu.html
2. Perform right-click on "Use right-click here" button
3. Verify dropdown menu appears

**Expected Results:**

- Right-click (context menu click) triggers dropdown menu
- Dropdown displays same menu items as left-click dropdown
- Menu appears at or near cursor position
- Button shows active state

#### 3.5 Test Double-Click Dropdown

**Steps:**

1. Navigate to dropdown-menu.html
2. Perform double-click on "Use double-click here" button
3. Verify dropdown menu appears

**Expected Results:**

- Double-click triggers dropdown menu
- Dropdown displays menu items
- Menu appears below the button
- Button shows active state

#### 3.6 Test Multiple Dropdowns Simultaneously

**Steps:**

1. Navigate to dropdown-menu.html
2. Left-click on "Use left-click here" button to open first dropdown
3. Right-click on "Use right-click here" button to open second dropdown
4. Verify both dropdowns are visible simultaneously

**Expected Results:**

- Multiple dropdowns can be open at the same time
- Each dropdown maintains its independent state
- Dropdowns do not interfere with each other

#### 3.7 Close Dropdown by Clicking Outside

**Steps:**

1. Navigate to dropdown-menu.html
2. Left-click on "Use left-click here" button to open dropdown
3. Click somewhere on the page outside the dropdown area

**Expected Results:**

- Dropdown closes when clicking outside
- Button returns to normal state
- No menu items remain visible

#### 3.8 Test Dropdown Menu Item Hover States

**Steps:**

1. Navigate to dropdown-menu.html
2. Left-click on "Use left-click here" button
3. Hover mouse over each menu item without clicking
4. Observe visual feedback

**Expected Results:**

- Menu items highlight on hover
- Visual feedback (color change, background change) is immediate
- Hover effect is consistent across all menu items

---

### 4. Mouse Over Testing

**Seed:** `tests/seed.spec.ts`

#### 4.1 Verify Mouse Over Page Load

**Steps:**

1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/index.html
2. Click on "Mouse over" link in Chapter 3 section

**Expected Results:**

- Page navigates to mouse-over.html
- "Mouse over" heading is visible
- Four images are displayed horizontally
- Initially, one caption shows "Compass" below the first image

#### 4.2 Hover Over First Image (Compass)

**Steps:**

1. Navigate to mouse-over.html
2. Move mouse cursor over the first image
3. Observe caption display

**Expected Results:**

- Moving cursor over image triggers hover effect
- Caption "Compass" appears below the image
- Image may show visual hover effect (highlighting, border, etc.)

#### 4.3 Hover Over Second Image (Calendar)

**Steps:**

1. Navigate to mouse-over.html
2. Move mouse cursor over the second image
3. Observe caption display

**Expected Results:**

- Caption "Calendar" appears below the second image
- Previous caption (if any) may be hidden or replaced
- Hover effect is immediate upon mouse entry

#### 4.4 Hover Over Third Image

**Steps:**

1. Navigate to mouse-over.html
2. Move mouse cursor over the third image
3. Observe caption display

**Expected Results:**

- Caption appears for the third image
- Caption text describes the image (e.g., "Award" or other)
- Hover effect is consistent with other images

#### 4.5 Hover Over Fourth Image

**Steps:**

1. Navigate to mouse-over.html
2. Move mouse cursor over the fourth image
3. Observe caption display

**Expected Results:**

- Caption appears for the fourth image
- Caption text describes the image (e.g., "Landscape" or other)
- Hover effect works correctly

#### 4.6 Move Mouse Away from Image

**Steps:**

1. Navigate to mouse-over.html
2. Hover over any image to display caption
3. Move mouse cursor away from the image to empty space

**Expected Results:**

- Caption may remain visible or disappear depending on implementation
- Image returns to normal state (no hover effect)
- No errors occur when cursor leaves image area

#### 4.7 Rapidly Hover Across Multiple Images

**Steps:**

1. Navigate to mouse-over.html
2. Quickly move mouse across all four images from left to right
3. Observe caption changes

**Expected Results:**

- Captions update rapidly as mouse moves across images
- No lag or performance issues
- Each image responds correctly to hover
- Captions do not overlap or display incorrectly

#### 4.8 Test Hover with Keyboard Navigation

**Steps:**

1. Navigate to mouse-over.html
2. Use Tab key to focus on images (if focusable)
3. Verify if caption appears with keyboard focus

**Expected Results:**

- Images may be focusable via keyboard (accessibility)
- Caption may appear on focus (accessibility feature)
- If not keyboard-focusable, images only respond to mouse hover

---

### 5. Drag and Drop Testing

**Seed:** `tests/seed.spec.ts`

#### 5.1 Verify Drag and Drop Page Load

**Steps:**

1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/index.html
2. Click on "Drag and drop" link in Chapter 3 section

**Expected Results:**

- Page navigates to drag-and-drop.html
- "Drag and drop" heading is visible
- "Draggable panel" heading is visible
- Panel with text "Drag me" is displayed and appears draggable

#### 5.2 Identify Draggable Element

**Steps:**

1. Navigate to drag-and-drop.html
2. Locate the panel with "Drag me" text
3. Verify element properties (cursor style, draggable attribute)

**Expected Results:**

- Draggable element is clearly identifiable
- Cursor changes to move/grab cursor when hovering over draggable area
- Element has visual indication it can be dragged (drag handle, distinct styling)

#### 5.3 Drag Element Within Page

**Steps:**

1. Navigate to drag-and-drop.html
2. Click and hold the "Drag me" panel
3. Move mouse cursor to a different position on the page
4. Release mouse button

**Expected Results:**

- Panel moves with mouse cursor while holding mouse button
- Panel position updates in real-time during drag
- Panel remains at new position after mouse release
- No visual glitches during drag operation

#### 5.4 Drag Element to Top of Page

**Steps:**

1. Navigate to drag-and-drop.html
2. Drag "Drag me" panel toward the top of the visible page area
3. Release at top position

**Expected Results:**

- Panel can be moved to top area of page
- Panel does not move beyond page boundaries
- Final position is stable after release

#### 5.5 Drag Element to Bottom of Page

**Steps:**

1. Navigate to drag-and-drop.html
2. Drag "Drag me" panel toward the bottom of the visible page area
3. Release at bottom position

**Expected Results:**

- Panel can be moved to bottom area of page
- Panel respects page boundaries
- Scrolling behavior (if any) works correctly

#### 5.6 Drag Element to Left Edge

**Steps:**

1. Navigate to drag-and-drop.html
2. Drag "Drag me" panel toward the left edge of the page
3. Release at left position

**Expected Results:**

- Panel can be moved to left edge
- Panel does not disappear off-screen
- Horizontal positioning works correctly

#### 5.7 Drag Element to Right Edge

**Steps:**

1. Navigate to drag-and-drop.html
2. Drag "Drag me" panel toward the right edge of the page
3. Release at right position

**Expected Results:**

- Panel can be moved to right edge
- Panel remains fully visible
- Right boundary is respected

#### 5.8 Attempt to Drag Outside Page Boundaries

**Steps:**

1. Navigate to drag-and-drop.html
2. Drag "Drag me" panel beyond the page boundaries
3. Observe behavior when attempting to drag outside visible area

**Expected Results:**

- Panel may be constrained to page boundaries OR
- Panel may partially extend beyond viewport but remains accessible OR
- Clear boundary behavior is implemented

#### 5.9 Test Rapid Drag and Release

**Steps:**

1. Navigate to drag-and-drop.html
2. Quickly drag panel to a new position and immediately release
3. Repeat multiple times

**Expected Results:**

- Panel responds to rapid drag operations
- No position errors or jumpy behavior
- Each drag operation completes successfully

---

### 6. Draw in Canvas Testing

**Seed:** `tests/seed.spec.ts`

#### 6.1 Verify Draw in Canvas Page Load

**Steps:**

1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/index.html
2. Click on "Draw in canvas" link in Chapter 3 section

**Expected Results:**

- Page navigates to draw-in-canvas.html
- "Drawing in canvas" heading is visible
- Text "Click to draw." is displayed
- HTML5 canvas element is present and visible

#### 6.2 Identify Canvas Element

**Steps:**

1. Navigate to draw-in-canvas.html
2. Locate the canvas element
3. Verify canvas dimensions and initial state

**Expected Results:**

- Canvas element is visible and has defined dimensions
- Canvas is initially blank or has a default background color
- Cursor may change when hovering over canvas

#### 6.3 Draw Single Click on Canvas

**Steps:**

1. Navigate to draw-in-canvas.html
2. Click once at a specific position on the canvas
3. Observe result

**Expected Results:**

- A mark (dot, line, or shape) appears at click position
- Drawing is visible and persists on canvas
- Canvas updates immediately upon click

#### 6.4 Draw by Clicking Multiple Times

**Steps:**

1. Navigate to draw-in-canvas.html
2. Click at multiple different positions on the canvas
3. Observe accumulated drawing

**Expected Results:**

- Each click adds a new mark to the canvas
- Previous marks remain visible
- Marks do not overlap incorrectly
- Drawing accumulates with each click

#### 6.5 Draw by Click and Drag

**Steps:**

1. Navigate to draw-in-canvas.html
2. Click on canvas and hold mouse button
3. Move mouse while holding button (drag)
4. Release mouse button

**Expected Results:**

- If supported: continuous line or shape is drawn following mouse path
- If not supported: marks appear at click and release positions
- Drawing behavior is consistent and predictable

#### 6.6 Test Drawing in Different Canvas Areas

**Steps:**

1. Navigate to draw-in-canvas.html
2. Draw in top-left corner of canvas
3. Draw in top-right corner
4. Draw in bottom-left corner
5. Draw in bottom-right corner
6. Draw in center of canvas

**Expected Results:**

- Drawing works correctly in all canvas areas
- No edge cases or boundary errors
- Marks appear at expected positions

#### 6.7 Test Rapid Clicking on Canvas

**Steps:**

1. Navigate to draw-in-canvas.html
2. Rapidly click on canvas multiple times in quick succession
3. Observe drawing behavior

**Expected Results:**

- All rapid clicks are registered (or rate-limited consistently)
- Canvas handles rapid input without errors
- Drawing remains stable and visible

#### 6.8 Verify Canvas State Persistence

**Steps:**

1. Navigate to draw-in-canvas.html
2. Draw several marks on canvas
3. Scroll page up and down (if scrollable)
4. Verify drawings remain intact

**Expected Results:**

- Drawings persist during scrolling
- Canvas content does not reset or disappear
- Visual state is maintained

---

### 7. Loading Images Testing

**Seed:** `tests/seed.spec.ts`

#### 7.1 Verify Loading Images Page Initial State

**Steps:**

1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/index.html
2. Click on "Loading images" link in Chapter 3 section
3. Immediately observe page state

**Expected Results:**

- Page navigates to loading-images.html
- "Loading images" heading is visible
- Text "Please wait until the images are loaded..." is displayed
- Loading indicator or status element is visible
- Images are not yet loaded (or loading)

#### 7.2 Wait for Images to Load Completely

**Steps:**

1. Navigate to loading-images.html
2. Wait for images to load (observe loading process)
3. Verify final state after loading completes

**Expected Results:**

- Loading text changes to "Done!" after images load
- All four images become visible:
  - Compass
  - Calendar
  - Award
  - Landscape
- Images are fully rendered and display correctly
- No broken image icons appear

#### 7.3 Verify Loading Timeout Duration

**Steps:**

1. Navigate to loading-images.html
2. Start timer when page loads
3. Wait for "Done!" message to appear
4. Record time elapsed

**Expected Results:**

- Images load within reasonable time (typically 2-5 seconds)
- Loading completes without errors
- Timeout duration is consistent across test runs

#### 7.4 Verify Image Count After Loading

**Steps:**

1. Navigate to loading-images.html
2. Wait for "Done!" message
3. Count the number of visible images

**Expected Results:**

- Exactly four images are displayed
- All images have alt text attributes (compass, calendar, award, landscape)
- No extra or missing images

#### 7.5 Verify Image Alt Text

**Steps:**

1. Navigate to loading-images.html
2. Wait for images to load
3. Verify alt text for each image

**Expected Results:**

- First image has alt text "compass"
- Second image has alt text "calendar"
- Third image has alt text "award"
- Fourth image has alt text "landscape"

#### 7.6 Test Page Refresh During Loading

**Steps:**

1. Navigate to loading-images.html
2. Immediately refresh the page before images finish loading
3. Observe loading behavior after refresh

**Expected Results:**

- Loading process restarts from beginning
- "Please wait..." message reappears
- Images load successfully after refresh
- No errors occur from interrupted loading

#### 7.7 Verify Images Are Properly Sized

**Steps:**

1. Navigate to loading-images.html
2. Wait for images to load
3. Verify each image has proper dimensions and aspect ratio

**Expected Results:**

- All images are displayed at consistent sizes
- Images are not distorted or stretched
- Images fit properly in their containers
- Layout is visually appealing

#### 7.8 Test Explicit Wait for Loading Completion

**Steps:**

1. Navigate to loading-images.html
2. Implement explicit wait for "Done!" text to appear
3. Verify explicit wait succeeds within timeout

**Expected Results:**

- Explicit wait condition (text "Done!") is met
- Wait completes successfully before timeout
- Test can proceed reliably after wait

---

### 8. Slow Calculator Testing

**Seed:** `tests/seed.spec.ts`

#### 8.1 Verify Slow Calculator Page Load

**Steps:**

1. Navigate to https://bonigarcia.dev/selenium-webdriver-java/index.html
2. Click on "Slow calculator" link in Chapter 3 section

**Expected Results:**

- Page navigates to slow-calculator.html
- "Slow calculator" heading is visible
- Description text is present: "This calculator waits [X] seconds to get the result..."
- Delay input field shows default value "5" seconds
- Calculator buttons (0-9, operators, C, =) are all visible and properly arranged

#### 8.2 Verify Calculator Button Layout

**Steps:**

1. Navigate to slow-calculator.html
2. Verify presence and arrangement of all calculator buttons

**Expected Results:**

- Number buttons: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
- Operator buttons: +, -, ×, ÷
- Special buttons: C (clear), . (decimal), = (equals)
- Buttons are arranged in standard calculator layout
- All buttons are clickable and properly labeled

#### 8.3 Verify Default Delay Setting

**Steps:**

1. Navigate to slow-calculator.html
2. Locate the delay input field
3. Verify default value

**Expected Results:**

- Delay input field contains value "5"
- Field is editable (textbox)
- Description correctly states "waits 5 seconds"

#### 8.4 Perform Simple Addition (2 + 3)

**Steps:**

1. Navigate to slow-calculator.html
2. Click button "2"
3. Click button "+"
4. Click button "3"
5. Click button "="
6. Wait for result to appear

**Expected Results:**

- Each button click updates the display (if present)
- After clicking "=", calculator waits 5 seconds (default delay)
- Result "5" appears after delay
- Calculation is correct: 2 + 3 = 5

#### 8.5 Perform Simple Subtraction (9 - 4)

**Steps:**

1. Navigate to slow-calculator.html
2. Click button "9"
3. Click button "-"
4. Click button "4"
5. Click button "="
6. Wait for result

**Expected Results:**

- Result "5" appears after 5-second delay
- Calculation is correct: 9 - 4 = 5
- Display shows the correct result

#### 8.6 Perform Simple Multiplication (6 × 7)

**Steps:**

1. Navigate to slow-calculator.html
2. Click button "6"
3. Click button "×"
4. Click button "7"
5. Click button "="
6. Wait for result

**Expected Results:**

- Result "42" appears after 5-second delay
- Calculation is correct: 6 × 7 = 42
- Multiplication operator works correctly

#### 8.7 Perform Simple Division (8 ÷ 2)

**Steps:**

1. Navigate to slow-calculator.html
2. Click button "8"
3. Click button "÷"
4. Click button "2"
5. Click button "="
6. Wait for result

**Expected Results:**

- Result "4" appears after 5-second delay
- Calculation is correct: 8 ÷ 2 = 4
- Division operator works correctly

#### 8.8 Test Clear Function

**Steps:**

1. Navigate to slow-calculator.html
2. Click buttons to enter "1", "+", "2"
3. Click "C" (clear) button
4. Verify display is cleared

**Expected Results:**

- Clear button resets the calculator
- Previous input is erased
- Calculator is ready for new input
- No previous calculation state remains

#### 8.9 Test Decimal Input

**Steps:**

1. Navigate to slow-calculator.html
2. Click "3"
3. Click "." (decimal point)
4. Click "5"
5. Click "+"
6. Click "2"
7. Click "."
8. Click "5"
9. Click "="
10. Wait for result

**Expected Results:**

- Calculator accepts decimal input
- Result "6" appears after delay
- Calculation is correct: 3.5 + 2.5 = 6
- Decimal point works correctly

#### 8.10 Change Calculator Delay to 2 Seconds

**Steps:**

1. Navigate to slow-calculator.html
2. Click in the delay input field
3. Clear existing value
4. Type "2"
5. Perform calculation: 1 + 1 =
6. Measure time until result appears

**Expected Results:**

- Delay input field accepts new value "2"
- Calculator uses new delay (2 seconds instead of 5)
- Result appears after approximately 2 seconds
- Custom delay setting works correctly

#### 8.11 Change Calculator Delay to 10 Seconds

**Steps:**

1. Navigate to slow-calculator.html
2. Change delay input to "10"
3. Perform calculation: 5 + 5 =
4. Wait for result

**Expected Results:**

- Calculator uses 10-second delay
- Result "10" appears after approximately 10 seconds
- Longer delay is correctly applied

#### 8.12 Test Zero as Operand

**Steps:**

1. Navigate to slow-calculator.html
2. Click "0"
3. Click "+"
4. Click "0"
5. Click "="
6. Wait for result

**Expected Results:**

- Calculator accepts zero as valid operand
- Result "0" appears after delay
- Calculation is correct: 0 + 0 = 0

#### 8.13 Test Large Number Calculation

**Steps:**

1. Navigate to slow-calculator.html
2. Click "9", "9", "9"
3. Click "+"
4. Click "9", "9", "9"
5. Click "="
6. Wait for result

**Expected Results:**

- Calculator accepts multi-digit numbers
- Result "1998" appears after delay
- Calculation is correct: 999 + 999 = 1998
- Display can show larger numbers

#### 8.14 Test Rapid Button Clicking

**Steps:**

1. Navigate to slow-calculator.html
2. Rapidly click multiple number buttons in quick succession
3. Click operator and more numbers
4. Click "="
5. Verify correct input was registered

**Expected Results:**

- Calculator handles rapid input correctly
- All button clicks are registered (or rate-limited appropriately)
- Final calculation uses correct input sequence
- No input is lost due to rapid clicking

#### 8.15 Test Calculation Without Waiting for Result

**Steps:**

1. Navigate to slow-calculator.html
2. Perform calculation: 2 + 2 =
3. Before result appears, click "C" to clear

**Expected Results:**

- Clear interrupts pending calculation
- Display is cleared immediately
- No result from previous calculation appears
- Calculator is ready for new input

#### 8.16 Test Chaining Operations

**Steps:**

1. Navigate to slow-calculator.html
2. Reduce delay to 1 second for faster testing
3. Click "5", "+", "3", "=" (wait for result "8")
4. Click "+", "2", "=" (continuing from previous result)
5. Wait for final result

**Expected Results:**

- First operation: 5 + 3 = 8
- If supported: Second operation uses result: 8 + 2 = 10
- If not supported: Calculator resets between operations
- Behavior is consistent and predictable

---

## Test Execution Notes

### Prerequisites

- Playwright test framework installed and configured
- TypeScript environment set up
- Valid internet connection to access https://bonigarcia.dev/selenium-webdriver-java/
- Seed file `tests/seed.spec.ts` configured with base URL

### Test Data Requirements

- No authentication required
- No test data setup needed
- All tests can run with fresh page state

### Browser Compatibility

- Tests should be executed on major browsers: Chromium, Firefox, WebKit
- Mobile viewport testing may be considered for responsive behavior

### Wait Strategies

- **Loading Images**: Implement explicit wait for "Done!" text (up to 10 seconds)
- **Slow Calculator**: Implement dynamic wait based on configured delay value (+ 1 second buffer)
- **Navigation**: Standard page load wait strategies
- **Mouse Over**: Hover actions should include short wait for caption appearance

### Accessibility Considerations

- Form elements should be accessible via keyboard navigation
- Images should have proper alt text
- Interactive elements should be focusable
- Screen reader compatibility can be tested

### Known Limitations

- Canvas drawing tests may require advanced Playwright capabilities (canvas pixel verification)
- Drag and drop tests require JavaScript-based drag actions
- Right-click context menu behavior may vary by browser

---

## Success Criteria

All test scenarios pass with:

- 100% element locator success rate
- All interactions complete without timeout errors
- All expected results are met
- No console errors during test execution
- Tests complete within reasonable time (< 5 minutes for full suite)

---

## Maintenance Recommendations

1. **Update Locators**: If page structure changes, update element locators in tests
2. **Monitor Performance**: Track test execution time to detect performance regressions
3. **Cross-Browser Testing**: Run regularly on all supported browsers
4. **Screenshot Evidence**: Capture screenshots on test failure for debugging
5. **Version Control**: Keep test plan and test code synchronized with application updates
