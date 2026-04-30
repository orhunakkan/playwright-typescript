import { expect, test } from '../../fixtures/page-fixtures';
import path from 'path';
import { config } from '../../config/env';
import { feature, story, severity } from 'allure-js-commons';

const BASE_URL = config.e2eUrl;

test.describe('Chapter 3 - WebDriver Fundamentals', () => {
  // ─────────────────────────────────────────────────
  //  1. Web Form
  // ─────────────────────────────────────────────────
  test.describe('Web Form', () => {
    test.beforeEach(async ({ webFormPage }) => {
      await feature('WebDriver Fundamentals');
      await story('Web Form');
      await severity('critical');
      await webFormPage.actions.goto();
    });

    test('should display the web form heading', { tag: ['@smoke'] }, async ({ webFormPage }) => {
      await expect(webFormPage.locators.heading).toBeVisible();
    });

    // --- Text Input ---
    test('should type into text input field', { tag: ['@critical'] }, async ({ webFormPage }) => {
      await webFormPage.locators.textInput.fill('Hello Playwright');
      await expect(webFormPage.locators.textInput).toHaveValue('Hello Playwright');
    });

    test('should clear and retype in text input field', async ({ webFormPage }) => {
      await webFormPage.locators.textInput.fill('Initial text');
      await expect(webFormPage.locators.textInput).toHaveValue('Initial text');
      await webFormPage.locators.textInput.clear();
      await expect(webFormPage.locators.textInput).toHaveValue('');
      await webFormPage.locators.textInput.fill('Updated text');
      await expect(webFormPage.locators.textInput).toHaveValue('Updated text');
    });

    // --- Password Input ---
    test('should type into password field', async ({ webFormPage }) => {
      await webFormPage.locators.passwordInput.fill('secret123');
      await expect(webFormPage.locators.passwordInput).toHaveValue('secret123');
      // Verify the input type is password (masked)
      await expect(webFormPage.locators.passwordInput).toHaveAttribute('type', 'password');
    });

    // --- Textarea ---
    test('should type into textarea', async ({ webFormPage }) => {
      const multiLineText = 'Line 1\nLine 2\nLine 3';
      await webFormPage.locators.textarea.fill(multiLineText);
      await expect(webFormPage.locators.textarea).toHaveValue(multiLineText);
    });

    // --- Disabled Input ---
    test('should verify disabled input is not editable', async ({ webFormPage }) => {
      await expect.soft(webFormPage.locators.disabledInput).toBeDisabled();
      await expect.soft(webFormPage.locators.disabledInput).toHaveAttribute('placeholder', 'Disabled input');
    });

    // --- Readonly Input ---
    test('should verify readonly input has pre-filled value', async ({ webFormPage }) => {
      await expect.soft(webFormPage.locators.readonlyInput).toBeEditable({ editable: false });
      await expect.soft(webFormPage.locators.readonlyInput).toHaveValue('Readonly input');
      await expect.soft(webFormPage.locators.readonlyInput).toHaveAttribute('readonly', '');
    });

    // --- Dropdown (select) ---
    test('should select options from dropdown by visible text', { tag: ['@critical'] }, async ({ webFormPage }) => {
      await expect(webFormPage.locators.dropdown).toHaveValue('Open this select menu');

      await webFormPage.locators.dropdown.selectOption({ label: 'One' });
      await expect(webFormPage.locators.dropdown).toHaveValue('1');

      await webFormPage.locators.dropdown.selectOption({ label: 'Two' });
      await expect(webFormPage.locators.dropdown).toHaveValue('2');

      await webFormPage.locators.dropdown.selectOption({ label: 'Three' });
      await expect(webFormPage.locators.dropdown).toHaveValue('3');
    });

    test('should select dropdown option by value', async ({ webFormPage }) => {
      await webFormPage.locators.dropdown.selectOption('2');
      await expect(webFormPage.locators.dropdown).toHaveValue('2');
    });

    test('should verify all dropdown options are present', async ({ webFormPage }) => {
      await expect(webFormPage.locators.dropdownOptions).toHaveCount(4);
      await expect(webFormPage.locators.dropdownOptions).toHaveText(['Open this select menu', 'One', 'Two', 'Three']);
    });

    // --- Dropdown (datalist) ---
    test('should type into datalist input and verify suggestions', async ({ webFormPage }) => {
      await expect(webFormPage.locators.datalistInput).toHaveAttribute('placeholder', 'Type to search...');
      await webFormPage.locators.datalistInput.fill('San Francisco');
      await expect(webFormPage.locators.datalistInput).toHaveValue('San Francisco');
    });

    test('should verify datalist options exist', async ({ webFormPage }) => {
      await expect(webFormPage.locators.datalistOptions).toHaveCount(5);

      const expectedCities = ['San Francisco', 'New York', 'Seattle', 'Los Angeles', 'Chicago'];
      for (const city of expectedCities) {
        await expect(webFormPage.locators.datalistOptions.filter({ hasText: city })).toHaveCount(0); // datalist options use value attribute
        await expect(webFormPage.locators.datalistOption(city)).toBeAttached();
      }
    });

    // --- File Input ---
    test('should upload a file', async ({ webFormPage }) => {
      const testFilePath = path.resolve('package.json');
      await webFormPage.actions.uploadFile(testFilePath);
      // Verify a file has been selected (input value contains the filename)
      const inputValue = await webFormPage.locators.fileInput.inputValue();
      expect(inputValue).toContain('package.json');
    });

    // --- Checkboxes ---
    test('should verify default checkbox states', async ({ webFormPage }) => {
      await expect(webFormPage.locators.checkedCheckbox).toBeChecked();
      await expect(webFormPage.locators.defaultCheckbox).not.toBeChecked();
    });

    test('should toggle checkboxes', { tag: ['@critical'] }, async ({ webFormPage }) => {
      // Uncheck the checked one
      await webFormPage.locators.checkedCheckbox.uncheck();
      await expect(webFormPage.locators.checkedCheckbox).not.toBeChecked();

      // Check the default one
      await webFormPage.locators.defaultCheckbox.check();
      await expect(webFormPage.locators.defaultCheckbox).toBeChecked();
    });

    // --- Radio Buttons ---
    test('should verify default radio button states', async ({ webFormPage }) => {
      await expect(webFormPage.locators.checkedRadio).toBeChecked();
      await expect(webFormPage.locators.defaultRadio).not.toBeChecked();
    });

    test('should select a different radio button', { tag: ['@critical'] }, async ({ webFormPage }) => {
      await webFormPage.locators.defaultRadio.check();
      await expect(webFormPage.locators.defaultRadio).toBeChecked();
      // Only one radio in the group can be selected
      await expect(webFormPage.locators.checkedRadio).not.toBeChecked();
    });

    // --- Color Picker ---
    test('should verify default color picker value', async ({ webFormPage }) => {
      await expect(webFormPage.locators.colorPicker).toHaveValue('#563d7c');
    });

    test('should change color picker value', async ({ webFormPage }) => {
      await webFormPage.locators.colorPicker.fill('#ff5733');
      await expect(webFormPage.locators.colorPicker).toHaveValue('#ff5733');
    });

    // --- Date Picker ---
    test('should set a date in the date picker', async ({ webFormPage }) => {
      await webFormPage.locators.datePicker.fill('03/02/2026');
      await expect(webFormPage.locators.datePicker).toHaveValue('03/02/2026');
    });

    // --- Range Slider ---
    test('should verify default range slider value', async ({ webFormPage }) => {
      await expect.soft(webFormPage.locators.rangeSlider).toHaveValue('5');
      await expect.soft(webFormPage.locators.rangeSlider).toHaveAttribute('min', '0');
      await expect.soft(webFormPage.locators.rangeSlider).toHaveAttribute('max', '10');
      await expect.soft(webFormPage.locators.rangeSlider).toHaveAttribute('step', '1');
    });

    test('should change range slider value', async ({ webFormPage }) => {
      await webFormPage.locators.rangeSlider.fill('8');
      await expect(webFormPage.locators.rangeSlider).toHaveValue('8');
    });

    // --- Hidden Input ---
    test('should verify hidden input exists', async ({ webFormPage }) => {
      await expect.soft(webFormPage.locators.hiddenInput).toBeAttached();
      await expect.soft(webFormPage.locators.hiddenInput).toBeHidden();
      await expect.soft(webFormPage.locators.hiddenInput).toHaveAttribute('type', 'hidden');
    });

    // --- Return to Index Link ---
    test('should navigate back to index via link', async ({ webFormPage, page }) => {
      await webFormPage.locators.returnToIndexLink.click();
      await expect(page).toHaveURL(`${BASE_URL}/index.html`);
    });

    // --- Form Submission ---
    test('should submit the form and verify navigation', { tag: ['@smoke', '@critical'] }, async ({ webFormPage, submittedFormPage, page }) => {
      // Fill the form
      await webFormPage.locators.textInput.fill('Playwright Test');
      await webFormPage.locators.passwordInput.fill('mypassword');
      await webFormPage.locators.textarea.fill('Test content');

      // Submit the form
      await webFormPage.actions.submitForm();

      // Verify we land on the submitted page
      await expect(page).toHaveURL(/submitted-form\.html/);
      await expect(submittedFormPage.locators.heading).toBeVisible();
      await expect(submittedFormPage.locators.receivedText).toBeVisible();
    });

    test('should submit the form with all fields filled', async ({ webFormPage, submittedFormPage, page }) => {
      // Text input
      await webFormPage.locators.textInput.fill('Full form test');
      // Password
      await webFormPage.locators.passwordInput.fill('pass123');
      // Textarea
      await webFormPage.locators.textarea.fill('Some notes here');
      // Dropdown
      await webFormPage.locators.dropdown.selectOption({ label: 'Two' });
      // Datalist
      await webFormPage.locators.datalistInput.fill('New York');
      // File upload
      await webFormPage.actions.uploadFile(path.resolve('package.json'));
      // Uncheck the checked checkbox
      await webFormPage.locators.checkedCheckbox.uncheck();
      // Check the default checkbox
      await webFormPage.locators.defaultCheckbox.check();
      // Select default radio
      await webFormPage.locators.defaultRadio.check();
      // Color
      await webFormPage.locators.colorPicker.fill('#00ff00');
      // Date
      await webFormPage.locators.datePicker.fill('12/25/2025');
      await page.keyboard.press('Escape');
      // Range
      await webFormPage.locators.rangeSlider.fill('9');

      // Submit
      await webFormPage.actions.submitForm();

      await expect(page).toHaveURL(/submitted-form\.html/);
      await expect(submittedFormPage.locators.receivedText).toBeVisible();
    });

    // --- Custom Attribute ---
    test('should locate element by custom attribute', async ({ webFormPage }) => {
      await expect(webFormPage.locators.textInputByCustomAttr).toBeVisible();
      await webFormPage.locators.textInputByCustomAttr.fill('Located by custom attribute');
      await expect(webFormPage.locators.textInputByCustomAttr).toHaveValue('Located by custom attribute');
    });

    // --- Locator by ID ---
    test('should locate text input by id', async ({ webFormPage }) => {
      await expect(webFormPage.locators.textInputById).toBeVisible();
      await webFormPage.locators.textInputById.fill('Located by ID');
      await expect(webFormPage.locators.textInputById).toHaveValue('Located by ID');
    });

    // --- Locator by Name ---
    test('should locate elements by name attribute', async ({ webFormPage }) => {
      await expect(webFormPage.locators.textInputByName).toBeVisible();
      await expect(webFormPage.locators.passwordInputByName).toBeVisible();
      await expect(webFormPage.locators.textareaByName).toBeVisible();
    });
  });

  // ─────────────────────────────────────────────────
  //  2. Navigation
  // ─────────────────────────────────────────────────
  test.describe('Navigation', () => {
    test.beforeEach(async () => {
      await feature('WebDriver Fundamentals');
      await story('Navigation');
      await severity('critical');
    });

    test('should display navigation page 1 content', { tag: ['@smoke'] }, async ({ navigationPage }) => {
      await navigationPage.actions.goto();
      await expect(navigationPage.locators.heading).toBeVisible();
      await expect(navigationPage.locators.leadParagraph).toContainText('Lorem ipsum dolor sit amet');
    });

    test('should navigate through pages using pagination links', { tag: ['@critical'] }, async ({ navigationPage, page }) => {
      await navigationPage.actions.goto();

      // Verify we are on page 1
      await expect(page).toHaveURL(/navigation1\.html/);

      // Click page 2
      await navigationPage.actions.goToPage(2);
      await expect(page).toHaveURL(/navigation2\.html/);
      await expect(navigationPage.locators.heading).toBeVisible();

      // Click page 3
      await navigationPage.actions.goToPage(3);
      await expect(page).toHaveURL(/navigation3\.html/);
      await expect(navigationPage.locators.heading).toBeVisible();
    });

    test('should navigate using Next and Previous links', async ({ navigationPage, page }) => {
      await navigationPage.actions.goto();

      // "Previous" should be disabled on page 1 (it has href="#")
      await expect(navigationPage.locators.previousLink).toBeVisible();

      // Click "Next" to go to page 2
      await navigationPage.actions.goNext();
      await expect(page).toHaveURL(/navigation2\.html/);

      // Click "Next" again to go to page 3
      await navigationPage.actions.goNext();
      await expect(page).toHaveURL(/navigation3\.html/);

      // Click "Previous" to go back to page 2
      await navigationPage.actions.goPrevious();
      await expect(page).toHaveURL(/navigation2\.html/);
    });

    test('should navigate back using browser history', async ({ navigationPage, page }) => {
      await navigationPage.actions.goto();
      await navigationPage.actions.goToPage(2);
      await expect(page).toHaveURL(/navigation2\.html/);

      // Go back using browser history
      await page.goBack();
      await expect(page).toHaveURL(/navigation1\.html/);

      // Go forward using browser history
      await page.goForward();
      await expect(page).toHaveURL(/navigation2\.html/);
    });

    test('should navigate using Back to index link', async ({ navigationPage, page }) => {
      await navigationPage.actions.goto();
      await navigationPage.locators.backToIndexLink.click();
      await expect(page).toHaveURL(`${BASE_URL}/index.html`);
    });

    test('should verify all pagination links are present', async ({ navigationPage }) => {
      await navigationPage.actions.goto();

      await expect(navigationPage.locators.pagination).toBeVisible();
      await expect.soft(navigationPage.locators.previousLink).toBeVisible();
      await expect.soft(navigationPage.locators.pageLink(1)).toBeVisible();
      await expect.soft(navigationPage.locators.pageLink(2)).toBeVisible();
      await expect.soft(navigationPage.locators.pageLink(3)).toBeVisible();
      await expect.soft(navigationPage.locators.nextLink).toBeVisible();
    });

    test('should verify page title remains consistent across pages', async ({ navigationPage, page }) => {
      await navigationPage.actions.goto();
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');

      await navigationPage.actions.goToPage(2);
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');

      await navigationPage.actions.goToPage(3);
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
    });

    test('should verify current page has active class in pagination', async ({ navigationPage }) => {
      // Page 1 — "1" should be active
      await navigationPage.actions.goto();
      await expect(navigationPage.locators.activePageLink).toHaveText('1');

      // Page 2 — "2" should be active
      await navigationPage.actions.goToPage(2);
      await expect(navigationPage.locators.activePageLink).toHaveText('2');

      // Page 3 — "3" should be active
      await navigationPage.actions.goToPage(3);
      await expect(navigationPage.locators.activePageLink).toHaveText('3');
    });

    test('should verify Previous link is disabled on first page', async ({ navigationPage }) => {
      await navigationPage.actions.goto();
      await expect(navigationPage.locators.previousItem).toHaveClass(/disabled/);
    });

    test('should verify Next link is disabled on last page', async ({ navigationPage }) => {
      await navigationPage.actions.goto(3);
      await expect(navigationPage.locators.nextItem).toHaveClass(/disabled/);
    });

    test('should display different content on each page', async ({ navigationPage }) => {
      await navigationPage.actions.goto();
      await expect(navigationPage.locators.leadParagraph).toContainText('Lorem ipsum dolor sit amet');

      await navigationPage.actions.goToPage(2);
      await expect(navigationPage.locators.leadParagraph).toContainText('Ut enim ad minim veniam');

      await navigationPage.actions.goToPage(3);
      await expect(navigationPage.locators.leadParagraph).toContainText('Excepteur sint occaecat cupidatat');
    });

    test('should stay on the same page when clicking current page number', async ({ navigationPage, page }) => {
      await navigationPage.actions.goto();

      // Click page 1 while already on page 1
      await navigationPage.actions.goToPage(1);
      await expect(page).toHaveURL(/navigation1\.html/);
      await expect(navigationPage.locators.leadParagraph).toContainText('Lorem ipsum dolor sit amet');
    });
  });

  // ─────────────────────────────────────────────────
  //  3. Dropdown Menu
  // ─────────────────────────────────────────────────
  test.describe('Dropdown Menu', () => {
    test.beforeEach(async ({ dropdownMenuPage }) => {
      await feature('WebDriver Fundamentals');
      await story('Dropdown Menu');
      await severity('critical');
      await dropdownMenuPage.actions.goto();
    });

    test('should display dropdown menu heading', { tag: ['@smoke'] }, async ({ dropdownMenuPage }) => {
      await expect(dropdownMenuPage.locators.heading).toBeVisible();
    });

    test('should open dropdown with left-click', { tag: ['@critical'] }, async ({ dropdownMenuPage }) => {
      await expect(dropdownMenuPage.locators.leftClickButton).toBeVisible();

      // Click the button to open the dropdown
      await dropdownMenuPage.actions.openLeftClickDropdown();

      // Verify dropdown items are visible
      await expect(dropdownMenuPage.locators.leftClickMenu).toBeVisible();
      await expect.soft(dropdownMenuPage.locators.leftClickMenu.getByRole('link', { name: 'Action', exact: true })).toBeVisible();
      await expect.soft(dropdownMenuPage.locators.leftClickMenu.getByRole('link', { name: 'Another action' })).toBeVisible();
      await expect.soft(dropdownMenuPage.locators.leftClickMenu.getByRole('link', { name: 'Something else here' })).toBeVisible();
      await expect.soft(dropdownMenuPage.locators.leftClickMenu.getByRole('link', { name: 'Separated link' })).toBeVisible();
    });

    test('should open dropdown with right-click (context menu)', async ({ dropdownMenuPage }) => {
      await expect(dropdownMenuPage.locators.rightClickButton).toBeVisible();

      // Right-click
      await dropdownMenuPage.actions.openRightClickDropdown();

      // Verify the context menu dropdown is shown
      await expect(dropdownMenuPage.locators.rightClickMenu).toBeVisible();
      await expect.soft(dropdownMenuPage.locators.rightClickMenu.getByRole('link', { name: 'Action', exact: true })).toBeVisible();
      await expect.soft(dropdownMenuPage.locators.rightClickMenu.getByRole('link', { name: 'Another action' })).toBeVisible();
      await expect.soft(dropdownMenuPage.locators.rightClickMenu.getByRole('link', { name: 'Something else here' })).toBeVisible();
      await expect.soft(dropdownMenuPage.locators.rightClickMenu.getByRole('link', { name: 'Separated link' })).toBeVisible();
    });

    test('should open dropdown with double-click', async ({ dropdownMenuPage }) => {
      await expect(dropdownMenuPage.locators.doubleClickButton).toBeVisible();

      // Double-click
      await dropdownMenuPage.actions.openDoubleClickDropdown();

      // Verify the dropdown is shown
      await expect(dropdownMenuPage.locators.doubleClickMenu).toBeVisible();
      await expect(dropdownMenuPage.locators.doubleClickMenu.getByRole('link', { name: 'Action', exact: true })).toBeVisible();
      await expect(dropdownMenuPage.locators.doubleClickMenu.getByRole('link', { name: 'Another action' })).toBeVisible();
    });

    test('should close dropdown after clicking an item (left-click)', async ({ dropdownMenuPage }) => {
      await dropdownMenuPage.actions.openLeftClickDropdown();
      await expect(dropdownMenuPage.locators.leftClickMenu).toBeVisible();

      // Click an item to close the dropdown
      await dropdownMenuPage.locators.leftClickMenu.getByRole('link', { name: 'Action', exact: true }).click();
      await expect(dropdownMenuPage.locators.leftClickMenu).toBeHidden();
    });

    test('should verify all three dropdown trigger buttons exist', async ({ dropdownMenuPage }) => {
      await expect(dropdownMenuPage.locators.leftClickButton).toBeVisible();
      await expect(dropdownMenuPage.locators.rightClickButton).toBeVisible();
      await expect(dropdownMenuPage.locators.doubleClickButton).toBeVisible();
    });

    test('should verify all four items in double-click dropdown', async ({ dropdownMenuPage }) => {
      await dropdownMenuPage.actions.openDoubleClickDropdown();

      await expect(dropdownMenuPage.locators.doubleClickMenu).toBeVisible();
      await expect.soft(dropdownMenuPage.locators.doubleClickMenu.getByRole('link', { name: 'Action', exact: true })).toBeVisible();
      await expect.soft(dropdownMenuPage.locators.doubleClickMenu.getByRole('link', { name: 'Another action' })).toBeVisible();
      await expect.soft(dropdownMenuPage.locators.doubleClickMenu.getByRole('link', { name: 'Something else here' })).toBeVisible();
      await expect.soft(dropdownMenuPage.locators.doubleClickMenu.getByRole('link', { name: 'Separated link' })).toBeVisible();
    });

    test('should verify dropdown divider exists in each dropdown', async ({ dropdownMenuPage }) => {
      // Left-click dropdown
      await dropdownMenuPage.actions.openLeftClickDropdown();
      await expect(dropdownMenuPage.locators.leftClickMenu).toBeVisible();
      await expect(dropdownMenuPage.locators.leftClickMenu.locator('hr.dropdown-divider')).toBeAttached();

      // Dismiss by clicking elsewhere
      await dropdownMenuPage.actions.dismiss();

      // Right-click dropdown
      await dropdownMenuPage.actions.openRightClickDropdown();
      await expect(dropdownMenuPage.locators.rightClickMenu).toBeVisible();
      await expect(dropdownMenuPage.locators.rightClickMenu.locator('hr.dropdown-divider')).toBeAttached();
    });

    test('should close right-click dropdown after clicking an item', async ({ dropdownMenuPage }) => {
      await dropdownMenuPage.actions.openRightClickDropdown();

      await expect(dropdownMenuPage.locators.rightClickMenu).toBeVisible();

      await dropdownMenuPage.locators.rightClickMenu.getByRole('link', { name: 'Action', exact: true }).click();
      await expect(dropdownMenuPage.locators.rightClickMenu).toBeHidden();
    });

    test('should close double-click dropdown after clicking an item', async ({ dropdownMenuPage }) => {
      await dropdownMenuPage.actions.openDoubleClickDropdown();

      await expect(dropdownMenuPage.locators.doubleClickMenu).toBeVisible();

      await dropdownMenuPage.locators.doubleClickMenu.getByRole('link', { name: 'Another action' }).click();
      await expect(dropdownMenuPage.locators.doubleClickMenu).toBeHidden();
    });

    test('should close dropdown when clicking outside', async ({ dropdownMenuPage }) => {
      // Open left-click dropdown
      await dropdownMenuPage.actions.openLeftClickDropdown();
      await expect(dropdownMenuPage.locators.leftClickMenu).toBeVisible();

      // Click outside to dismiss
      await dropdownMenuPage.locators.heading.click();
      await expect(dropdownMenuPage.locators.leftClickMenu).toBeHidden();
    });
  });

  // ─────────────────────────────────────────────────
  //  4. Mouse Over
  // ─────────────────────────────────────────────────
  test.describe('Mouse Over', () => {
    test.beforeEach(async ({ mouseOverPage }) => {
      await feature('WebDriver Fundamentals');
      await story('Mouse Over');
      await severity('critical');
      await mouseOverPage.actions.goto();
    });

    test('should display the mouse over heading', { tag: ['@smoke'] }, async ({ mouseOverPage }) => {
      await expect(mouseOverPage.locators.heading).toBeVisible();
    });

    test('should display all four images', async ({ mouseOverPage }) => {
      await expect(mouseOverPage.locators.images).toHaveCount(4);
    });

    test('should reveal image captions on hover', { tag: ['@critical'] }, async ({ mouseOverPage }) => {
      const expectedCaptions = ['Compass', 'Calendar', 'Award', 'Landscape'];

      for (let captionIndex = 0; captionIndex < expectedCaptions.length; captionIndex++) {
        const figure = mouseOverPage.locators.figures.nth(captionIndex);
        // Hover over the image to reveal the caption
        await mouseOverPage.actions.hoverImage(captionIndex);
        await expect(figure.getByText(expectedCaptions[captionIndex])).toBeVisible();
      }
    });

    test('should verify image sources are correct', async ({ mouseOverPage }) => {
      await expect(mouseOverPage.locators.compassImage).toBeVisible();
      await expect(mouseOverPage.locators.calendarImage).toBeVisible();
      await expect(mouseOverPage.locators.awardImage).toBeVisible();
      await expect(mouseOverPage.locators.landscapeImage).toBeVisible();
    });

    test('should verify images are loaded successfully', async ({ mouseOverPage }) => {
      const count = await mouseOverPage.locators.images.count();

      for (let imageIndex = 0; imageIndex < count; imageIndex++) {
        const image = mouseOverPage.locators.images.nth(imageIndex);
        const naturalWidth = await image.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    });

    test('should have all captions hidden before hover', async ({ mouseOverPage }) => {
      const count = await mouseOverPage.locators.captions.count();
      expect(count).toBe(4);

      for (let captionIndex = 0; captionIndex < count; captionIndex++) {
        await expect(mouseOverPage.locators.captions.nth(captionIndex)).toBeHidden();
      }
    });

    test('should hide caption when mouse leaves the image', async ({ mouseOverPage }) => {
      const figure = mouseOverPage.locators.figures.first();
      const caption = figure.locator('.caption');

      // Initially hidden
      await expect(caption).toBeHidden();

      // Hover to reveal
      await mouseOverPage.actions.hoverImage(0);
      await expect(caption).toBeVisible();

      // Move mouse away (hover on heading to leave the figure area)
      await mouseOverPage.locators.heading.hover();
      await expect(caption).toBeHidden();
    });
  });

  // ─────────────────────────────────────────────────
  //  5. Drag and Drop
  // ─────────────────────────────────────────────────
  test.describe('Drag and Drop', () => {
    test.beforeEach(async ({ dragAndDropPage }) => {
      await feature('WebDriver Fundamentals');
      await story('Drag and Drop');
      await severity('critical');
      await dragAndDropPage.actions.goto();
    });

    test('should display the drag and drop heading', { tag: ['@smoke'] }, async ({ dragAndDropPage }) => {
      await expect(dragAndDropPage.locators.heading).toBeVisible();
    });

    test('should display the draggable panel', async ({ dragAndDropPage }) => {
      await expect(dragAndDropPage.locators.draggable).toBeVisible();
      await expect(dragAndDropPage.locators.draggableHeading).toBeVisible();
      await expect(dragAndDropPage.locators.dragMeText).toBeVisible();
    });

    test('should display the drop target area', async ({ dragAndDropPage }) => {
      await expect(dragAndDropPage.locators.target).toBeVisible();
    });

    test('should drag element to target', { tag: ['@critical'] }, async ({ dragAndDropPage }) => {
      // Get initial position of draggable
      const initialBox = await dragAndDropPage.locators.draggable.boundingBox();
      expect(initialBox).not.toBeNull();

      // Perform drag and drop
      await dragAndDropPage.actions.dragToTarget();

      // Verify position has changed after drag
      const finalBox = await dragAndDropPage.locators.draggable.boundingBox();
      expect(finalBox).not.toBeNull();

      // The position should have changed (moved to the right towards target)
      expect(finalBox!.x).not.toBe(initialBox!.x);
    });

    test('should drag element using mouse actions', async ({ dragAndDropPage, page }) => {
      const box = await dragAndDropPage.locators.draggable.boundingBox();
      expect(box).not.toBeNull();

      const startX = box!.x + box!.width / 2;
      const startY = box!.y + box!.height / 2;

      // Perform manual drag using mouse
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 200, startY, { steps: 10 });
      await page.mouse.up();

      // Verify position has changed
      const newBox = await dragAndDropPage.locators.draggable.boundingBox();
      expect(newBox).not.toBeNull();
      expect(newBox!.x).toBeGreaterThan(box!.x);
    });
  });

  // ─────────────────────────────────────────────────
  //  6. Draw in Canvas
  // ─────────────────────────────────────────────────
  test.describe('Draw in Canvas', () => {
    test.beforeEach(async ({ drawInCanvasPage }) => {
      await feature('WebDriver Fundamentals');
      await story('Draw in Canvas');
      await severity('critical');
      await drawInCanvasPage.actions.goto();
    });

    test('should display the drawing in canvas heading', { tag: ['@smoke'] }, async ({ drawInCanvasPage }) => {
      await expect(drawInCanvasPage.locators.heading).toBeVisible();
      await expect(drawInCanvasPage.locators.instructions).toBeVisible();
    });

    test('should verify canvas element exists', async ({ drawInCanvasPage }) => {
      await expect(drawInCanvasPage.locators.canvas).toBeVisible();
      await expect(drawInCanvasPage.locators.canvas).toHaveAttribute('id', 'my-canvas');
    });

    test('should draw on canvas by clicking', { tag: ['@critical'] }, async ({ drawInCanvasPage, page }) => {
      const box = await drawInCanvasPage.locators.canvas.boundingBox();
      expect(box).not.toBeNull();

      // Get pixel data before drawing
      const pixelsBefore = await page.evaluate(() => {
        const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        return ctx.getImageData(0, 0, canvas.width, canvas.height).data.some((pixel, index) => index % 4 === 3 && pixel > 0);
      });
      expect(pixelsBefore).toBe(false);

      // Click in the center of canvas to draw
      await drawInCanvasPage.locators.canvas.click({
        position: { x: box!.width / 2, y: box!.height / 2 },
      });

      // Verify pixels were drawn
      const pixelsAfter = await page.evaluate(() => {
        const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        return ctx.getImageData(0, 0, canvas.width, canvas.height).data.some((pixel, index) => index % 4 === 3 && pixel > 0);
      });
      expect(pixelsAfter).toBe(true);
    });

    test('should draw a line on canvas by dragging', async ({ drawInCanvasPage, page }) => {
      const box = await drawInCanvasPage.locators.canvas.boundingBox();
      expect(box).not.toBeNull();

      // Use proportional coords to stay within canvas bounds on all viewport sizes
      // SignaturePad draws a line between sequential click points
      const startX = box!.x + box!.width * 0.2;
      const startY = box!.y + box!.height * 0.3;
      const endX = box!.x + box!.width * 0.8;
      const endY = box!.y + box!.height * 0.7;

      await page.mouse.click(startX, startY);
      await page.mouse.click(endX, endY);

      // Verify non-transparent pixels exist after drawing
      const hasDrawnPixels = await page.evaluate(() => {
        const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        return ctx.getImageData(0, 0, canvas.width, canvas.height).data.some((pixel, index) => index % 4 === 3 && pixel > 0);
      });
      expect(hasDrawnPixels).toBe(true);
    });

    test('should draw multiple shapes on canvas', async ({ drawInCanvasPage, page }) => {
      const box = await drawInCanvasPage.locators.canvas.boundingBox();
      expect(box).not.toBeNull();

      // Draw a triangle using proportional coords so it stays within the canvas on all viewport sizes
      const points = [
        { x: box!.x + box!.width * 0.2, y: box!.y + box!.height * 0.2 },
        { x: box!.x + box!.width * 0.5, y: box!.y + box!.height * 0.8 },
        { x: box!.x + box!.width * 0.8, y: box!.y + box!.height * 0.2 },
      ];

      for (const point of points) {
        await page.mouse.click(point.x, point.y);
      }

      const countAfterClicks = await page.evaluate(() => {
        const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let count = 0;
        for (let alphaIndex = 3; alphaIndex < data.length; alphaIndex += 4) {
          if (data[alphaIndex] > 0) count++;
        }
        return count;
      });

      // Draw a line using proportional coords to stay within canvas on all viewport sizes
      const lineSteps = 10;
      for (let i = 0; i <= lineSteps; i++) {
        await page.mouse.click(box!.x + box!.width * 0.1 + (box!.width * 0.6 * i) / lineSteps, box!.y + box!.height * 0.3 + (box!.height * 0.4 * i) / lineSteps);
      }

      // Verify more pixels were drawn after the line
      const countAfterLine = await page.evaluate(() => {
        const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let count = 0;
        for (let alphaIndex = 3; alphaIndex < data.length; alphaIndex += 4) {
          if (data[alphaIndex] > 0) count++;
        }
        return count;
      });
      expect(countAfterLine).toBeGreaterThan(countAfterClicks);
    });

    test('should verify canvas dimensions', async ({ drawInCanvasPage }) => {
      const width = await drawInCanvasPage.locators.canvas.getAttribute('width');
      expect(Number(width)).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────────
  //  7. Loading Images
  // ─────────────────────────────────────────────────
  test.describe('Loading Images', () => {
    test.beforeEach(async () => {
      await feature('WebDriver Fundamentals');
      await story('Loading Images');
      await severity('critical');
    });

    test('should display loading message initially', async ({ loadingImagesPage }) => {
      await loadingImagesPage.actions.goto();
      // The spinner should be visible initially
      await expect(loadingImagesPage.locators.spinner).toBeVisible();
    });

    test('should show "Done!" text after all images load', async ({ loadingImagesPage }) => {
      await loadingImagesPage.actions.goto();

      // Wait for the text to change to "Done!" (images load at 2s intervals, last at 8s)
      await expect(loadingImagesPage.locators.text).toHaveText('Done!', { timeout: 15000 });
    });

    test('should load compass image first', { tag: ['@smoke'] }, async ({ loadingImagesPage }) => {
      await loadingImagesPage.actions.goto();

      // Compass image should appear quickly (within ~2s)
      await expect(loadingImagesPage.locators.compassImg).toBeVisible({ timeout: 5000 });
      await expect(loadingImagesPage.locators.compassImg).toHaveAttribute('alt', 'compass');
    });

    test('should load all four images with correct attributes after waiting', { tag: ['@critical'] }, async ({ loadingImagesPage }) => {
      test.setTimeout(20000);
      await loadingImagesPage.actions.goto();

      // Wait for all images to load (last image appears at ~8s)
      await expect(loadingImagesPage.locators.text).toHaveText('Done!', { timeout: 15000 });

      // Verify all 4 images are present with correct alt and src attributes
      const images = [
        { locator: loadingImagesPage.locators.compassImg, alt: 'compass', src: 'img/compass.png' },
        { locator: loadingImagesPage.locators.calendarImg, alt: 'calendar', src: 'img/calendar.png' },
        { locator: loadingImagesPage.locators.awardImg, alt: 'award', src: 'img/award.png' },
        { locator: loadingImagesPage.locators.landscapeImg, alt: 'landscape', src: 'img/landscape.png' },
      ];

      for (const img of images) {
        await expect(img.locator).toBeVisible();
        await expect(img.locator).toHaveAttribute('alt', img.alt);
        await expect(img.locator).toHaveAttribute('src', img.src);
      }
    });

    test('should verify images appear in correct order', async ({ loadingImagesPage }) => {
      test.setTimeout(20000);
      await loadingImagesPage.actions.goto();

      // First image should appear within ~2s
      await expect(loadingImagesPage.locators.compassImg).toBeVisible({ timeout: 5000 });

      // Second image should appear around ~4s
      await expect(loadingImagesPage.locators.calendarImg).toBeVisible({ timeout: 5000 });

      // Third image around ~6s
      await expect(loadingImagesPage.locators.awardImg).toBeVisible({ timeout: 5000 });

      // Fourth image around ~8s
      await expect(loadingImagesPage.locators.landscapeImg).toBeVisible({ timeout: 5000 });
    });

    test('should verify spinner disappears after loading', async ({ loadingImagesPage }) => {
      test.setTimeout(20000);
      await loadingImagesPage.actions.goto();

      // Wait for done text which replaces the spinner
      await expect(loadingImagesPage.locators.text).toHaveText('Done!', { timeout: 15000 });

      // Spinner should no longer exist (the innerHTML is replaced)
      await expect(loadingImagesPage.locators.spinner).toHaveCount(0);
    });
  });

  // ─────────────────────────────────────────────────
  //  8. Slow Calculator
  // ─────────────────────────────────────────────────
  test.describe('Slow Calculator', () => {
    test.beforeEach(async ({ slowCalculatorPage }) => {
      await feature('WebDriver Fundamentals');
      await story('Slow Calculator');
      await severity('critical');
      await slowCalculatorPage.actions.goto();
    });

    test('should display the slow calculator heading', { tag: ['@smoke'] }, async ({ slowCalculatorPage }) => {
      await expect(slowCalculatorPage.locators.heading).toBeVisible();
    });

    test('should verify default delay is 5 seconds', async ({ slowCalculatorPage }) => {
      await expect(slowCalculatorPage.locators.delayInput).toHaveValue('5');
    });

    test('should verify all calculator buttons are present', async ({ slowCalculatorPage }) => {
      // Number buttons
      for (let digit = 0; digit <= 9; digit++) {
        await expect(slowCalculatorPage.locators.key(`${digit}`)).toBeVisible();
      }

      // Operator buttons
      await expect(slowCalculatorPage.locators.key('+')).toBeVisible();
      await expect(slowCalculatorPage.locators.key('-')).toBeVisible();
      await expect(slowCalculatorPage.locators.key('÷')).toBeVisible();
      await expect(slowCalculatorPage.locators.key('x')).toBeVisible();

      // Other buttons
      await expect(slowCalculatorPage.locators.equalsButton).toBeVisible();
      await expect(slowCalculatorPage.locators.key('.')).toBeVisible();
      await expect(slowCalculatorPage.locators.clearButton).toBeVisible();
    });

    test('should perform addition (1 + 3 = 4) with reduced delay', { tag: ['@smoke', '@critical'] }, async ({ slowCalculatorPage }) => {
      test.setTimeout(15000);
      await slowCalculatorPage.actions.setDelay('1');

      await slowCalculatorPage.actions.pressKeys('1', '+', '3', '=');
      await expect(slowCalculatorPage.locators.screen).toHaveText('4', { timeout: 10000 });
    });

    test('should perform subtraction (9 - 4 = 5) with reduced delay', { tag: ['@critical'] }, async ({ slowCalculatorPage }) => {
      test.setTimeout(15000);
      await slowCalculatorPage.actions.setDelay('1');

      await slowCalculatorPage.actions.pressKeys('9', '-', '4', '=');
      await expect(slowCalculatorPage.locators.screen).toHaveText('5', { timeout: 10000 });
    });

    test('should perform multiplication (6 x 7 = 42) with reduced delay', { tag: ['@critical'] }, async ({ slowCalculatorPage }) => {
      test.setTimeout(15000);
      await slowCalculatorPage.actions.setDelay('1');

      await slowCalculatorPage.actions.pressKeys('6', 'x', '7', '=');
      await expect(slowCalculatorPage.locators.screen).toHaveText('42', { timeout: 10000 });
    });

    test('should perform division (8 ÷ 2 = 4) with reduced delay', { tag: ['@critical'] }, async ({ slowCalculatorPage }) => {
      test.setTimeout(15000);
      await slowCalculatorPage.actions.setDelay('1');

      await slowCalculatorPage.actions.pressKeys('8', '÷', '2', '=');
      await expect(slowCalculatorPage.locators.screen).toHaveText('4', { timeout: 10000 });
    });

    test('should clear calculator display', async ({ slowCalculatorPage }) => {
      await slowCalculatorPage.actions.pressKeys('5', '3');
      await expect(slowCalculatorPage.locators.screen).toHaveText('53');

      await slowCalculatorPage.actions.clear();
      await expect(slowCalculatorPage.locators.screen).toHaveText('');
    });

    test('should handle decimal numbers with reduced delay', async ({ slowCalculatorPage }) => {
      test.setTimeout(15000);
      await slowCalculatorPage.actions.setDelay('1');

      await slowCalculatorPage.actions.pressKeys('2', '.', '5', '+', '1', '.', '5', '=');
      await expect(slowCalculatorPage.locators.screen).toHaveText('4', { timeout: 10000 });
    });

    test('should show spinner while calculating', async ({ slowCalculatorPage }) => {
      test.setTimeout(15000);

      // Keep default 5-second delay so spinner is visible
      await slowCalculatorPage.actions.pressKeys('1', '+', '1', '=');

      await expect(slowCalculatorPage.locators.spinner).toBeVisible();

      await expect(slowCalculatorPage.locators.screen).toHaveText('2', { timeout: 10000 });
    });

    test('should change the delay value', async ({ slowCalculatorPage }) => {
      await slowCalculatorPage.actions.setDelay('2');
      await expect(slowCalculatorPage.locators.delayInput).toHaveValue('2');
    });

    test('should perform chained calculation with reduced delay', async ({ slowCalculatorPage }) => {
      test.setTimeout(15000);
      await slowCalculatorPage.actions.setDelay('1');

      await slowCalculatorPage.actions.pressKeys('1', '+', '2', '=');
      await expect(slowCalculatorPage.locators.screen).toHaveText('3', { timeout: 10000 });
    });

    test('should handle division by zero with reduced delay', async ({ slowCalculatorPage }) => {
      test.setTimeout(15000);
      await slowCalculatorPage.actions.setDelay('1');

      await slowCalculatorPage.actions.pressKeys('5', '÷', '0', '=');
      await expect(slowCalculatorPage.locators.screen).toHaveText('Infinity', { timeout: 10000 });
    });

    test('should hide spinner after calculation completes', async ({ slowCalculatorPage }) => {
      test.setTimeout(15000);
      await slowCalculatorPage.actions.setDelay('1');

      await slowCalculatorPage.actions.pressKeys('3', '+', '4', '=');

      await expect(slowCalculatorPage.locators.spinner).toBeVisible();

      await expect(slowCalculatorPage.locators.screen).toHaveText('7', { timeout: 10000 });
      await expect(slowCalculatorPage.locators.spinner).toBeHidden();
    });
  });

  // ─────────────────────────────────────────────────
  //  Cross-page: Index Page Links
  // ─────────────────────────────────────────────────
  test.describe('Index Page - Chapter 3 Links', () => {
    test.beforeEach(async ({ homePage }) => {
      await feature('WebDriver Fundamentals');
      await story('Chapter 3 Index');
      await severity('normal');
      await homePage.actions.goto();
    });

    test('should display the Chapter 3 section heading', async ({ homePage }) => {
      await expect(homePage.locators.chapter3Heading).toBeVisible();
    });

    test('should have all Chapter 3 links', async ({ homePage }) => {
      const chapter3Links = ['Web form', 'Navigation', 'Dropdown menu', 'Mouse over', 'Drag and drop', 'Draw in canvas', 'Loading images', 'Slow calculator'];

      for (const linkText of chapter3Links) {
        await expect(homePage.locators.chapterLink(linkText)).toBeVisible();
      }
    });

    test('should navigate to each Chapter 3 page and back', async ({ homePage, page }) => {
      const chapter3Pages = [
        { name: 'Web form', url: 'web-form.html', heading: 'Web form' },
        { name: 'Navigation', url: 'navigation1.html', heading: 'Navigation example' },
        { name: 'Dropdown menu', url: 'dropdown-menu.html', heading: 'Dropdown menu' },
        { name: 'Mouse over', url: 'mouse-over.html', heading: 'Mouse over' },
        { name: 'Drag and drop', url: 'drag-and-drop.html', heading: 'Drag and drop' },
        { name: 'Draw in canvas', url: 'draw-in-canvas.html', heading: 'Drawing in canvas' },
        { name: 'Loading images', url: 'loading-images.html', heading: 'Loading images' },
        { name: 'Slow calculator', url: 'slow-calculator.html', heading: 'Slow calculator' },
      ];

      for (const pageInfo of chapter3Pages) {
        await homePage.actions.goto();
        await homePage.actions.navigateToLink(pageInfo.name);
        await expect(page).toHaveURL(new RegExp(pageInfo.url));
        await expect(homePage.locators.destinationHeading(pageInfo.heading)).toBeVisible();
      }
    });
  });
});
