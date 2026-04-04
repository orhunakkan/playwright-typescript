import { expect, test } from '@playwright/test';
import path from 'path';
import { WebFormPage } from '../../pages/web-form.page';
import { NavigationPage } from '../../pages/navigation.page';
import { DropdownMenuPage } from '../../pages/dropdown-menu.page';
import { MouseOverPage } from '../../pages/mouse-over.page';
import { DragAndDropPage } from '../../pages/drag-and-drop.page';
import { DrawInCanvasPage } from '../../pages/draw-in-canvas.page';
import { LoadingImagesPage } from '../../pages/loading-images.page';
import { SlowCalculatorPage } from '../../pages/slow-calculator.page';
import { HomePage } from '../../pages/home.page';

const BASE_URL = process.env.PRACTICE_E2E_URL;

test.describe('Chapter 3 - WebDriver Fundamentals', () => {
  // ─────────────────────────────────────────────────
  //  1. Web Form
  // ─────────────────────────────────────────────────
  test.describe('Web Form', () => {
    let webForm: WebFormPage;

    test.beforeEach(async ({ page }) => {
      webForm = new WebFormPage(page);
      await webForm.actions.goto();
    });

    test('should display the web form heading @smoke', async () => {
      await expect(webForm.locators.heading).toBeVisible();
    });

    // --- Text Input ---
    test('should type into text input field @critical', async () => {
      await webForm.locators.textInput.fill('Hello Playwright');
      await expect(webForm.locators.textInput).toHaveValue('Hello Playwright');
    });

    test('should clear and retype in text input field', async () => {
      await webForm.locators.textInput.fill('Initial text');
      await expect(webForm.locators.textInput).toHaveValue('Initial text');
      await webForm.locators.textInput.clear();
      await expect(webForm.locators.textInput).toHaveValue('');
      await webForm.locators.textInput.fill('Updated text');
      await expect(webForm.locators.textInput).toHaveValue('Updated text');
    });

    // --- Password Input ---
    test('should type into password field', async () => {
      await webForm.locators.passwordInput.fill('secret123');
      await expect(webForm.locators.passwordInput).toHaveValue('secret123');
      // Verify the input type is password (masked)
      await expect(webForm.locators.passwordInput).toHaveAttribute('type', 'password');
    });

    // --- Textarea ---
    test('should type into textarea', async () => {
      const multiLineText = 'Line 1\nLine 2\nLine 3';
      await webForm.locators.textarea.fill(multiLineText);
      await expect(webForm.locators.textarea).toHaveValue(multiLineText);
    });

    // --- Disabled Input ---
    test('should verify disabled input is not editable', async () => {
      await expect.soft(webForm.locators.disabledInput).toBeDisabled();
      await expect.soft(webForm.locators.disabledInput).toHaveAttribute('placeholder', 'Disabled input');
    });

    // --- Readonly Input ---
    test('should verify readonly input has pre-filled value', async () => {
      await expect.soft(webForm.locators.readonlyInput).toBeEditable({ editable: false });
      await expect.soft(webForm.locators.readonlyInput).toHaveValue('Readonly input');
      await expect.soft(webForm.locators.readonlyInput).toHaveAttribute('readonly', '');
    });

    // --- Dropdown (select) ---
    test('should select options from dropdown by visible text @critical', async () => {
      await expect(webForm.locators.dropdown).toHaveValue('Open this select menu');

      await webForm.locators.dropdown.selectOption({ label: 'One' });
      await expect(webForm.locators.dropdown).toHaveValue('1');

      await webForm.locators.dropdown.selectOption({ label: 'Two' });
      await expect(webForm.locators.dropdown).toHaveValue('2');

      await webForm.locators.dropdown.selectOption({ label: 'Three' });
      await expect(webForm.locators.dropdown).toHaveValue('3');
    });

    test('should select dropdown option by value', async () => {
      await webForm.locators.dropdown.selectOption('2');
      await expect(webForm.locators.dropdown).toHaveValue('2');
    });

    test('should verify all dropdown options are present', async () => {
      await expect(webForm.locators.dropdownOptions).toHaveCount(4);
      await expect(webForm.locators.dropdownOptions).toHaveText(['Open this select menu', 'One', 'Two', 'Three']);
    });

    // --- Dropdown (datalist) ---
    test('should type into datalist input and verify suggestions', async () => {
      await expect(webForm.locators.datalistInput).toHaveAttribute('placeholder', 'Type to search...');
      await webForm.locators.datalistInput.fill('San Francisco');
      await expect(webForm.locators.datalistInput).toHaveValue('San Francisco');
    });

    test('should verify datalist options exist', async () => {
      await expect(webForm.locators.datalistOptions).toHaveCount(5);

      const expectedCities = ['San Francisco', 'New York', 'Seattle', 'Los Angeles', 'Chicago'];
      for (const city of expectedCities) {
        await expect(webForm.locators.datalistOptions.filter({ hasText: city })).toHaveCount(0); // datalist options use value attribute
        await expect(webForm.locators.datalistOption(city)).toBeAttached();
      }
    });

    // --- File Input ---
    test('should upload a file', async () => {
      const testFilePath = path.resolve('package.json');
      await webForm.actions.uploadFile(testFilePath);
      // Verify a file has been selected (input value contains the filename)
      const inputValue = await webForm.locators.fileInput.inputValue();
      expect(inputValue).toContain('package.json');
    });

    // --- Checkboxes ---
    test('should verify default checkbox states', async () => {
      await expect(webForm.locators.checkedCheckbox).toBeChecked();
      await expect(webForm.locators.defaultCheckbox).not.toBeChecked();
    });

    test('should toggle checkboxes @critical', async () => {
      // Uncheck the checked one
      await webForm.locators.checkedCheckbox.uncheck();
      await expect(webForm.locators.checkedCheckbox).not.toBeChecked();

      // Check the default one
      await webForm.locators.defaultCheckbox.check();
      await expect(webForm.locators.defaultCheckbox).toBeChecked();
    });

    // --- Radio Buttons ---
    test('should verify default radio button states', async () => {
      await expect(webForm.locators.checkedRadio).toBeChecked();
      await expect(webForm.locators.defaultRadio).not.toBeChecked();
    });

    test('should select a different radio button @critical', async () => {
      await webForm.locators.defaultRadio.check();
      await expect(webForm.locators.defaultRadio).toBeChecked();
      // Only one radio in the group can be selected
      await expect(webForm.locators.checkedRadio).not.toBeChecked();
    });

    // --- Color Picker ---
    test('should verify default color picker value', async () => {
      await expect(webForm.locators.colorPicker).toHaveValue('#563d7c');
    });

    test('should change color picker value', async () => {
      await webForm.locators.colorPicker.fill('#ff5733');
      await expect(webForm.locators.colorPicker).toHaveValue('#ff5733');
    });

    // --- Date Picker ---
    test('should set a date in the date picker', async () => {
      await webForm.locators.datePicker.fill('03/02/2026');
      await expect(webForm.locators.datePicker).toHaveValue('03/02/2026');
    });

    // --- Range Slider ---
    test('should verify default range slider value', async () => {
      await expect.soft(webForm.locators.rangeSlider).toHaveValue('5');
      await expect.soft(webForm.locators.rangeSlider).toHaveAttribute('min', '0');
      await expect.soft(webForm.locators.rangeSlider).toHaveAttribute('max', '10');
      await expect.soft(webForm.locators.rangeSlider).toHaveAttribute('step', '1');
    });

    test('should change range slider value', async () => {
      await webForm.locators.rangeSlider.fill('8');
      await expect(webForm.locators.rangeSlider).toHaveValue('8');
    });

    // --- Hidden Input ---
    test('should verify hidden input exists', async () => {
      await expect.soft(webForm.locators.hiddenInput).toBeAttached();
      await expect.soft(webForm.locators.hiddenInput).toBeHidden();
      await expect.soft(webForm.locators.hiddenInput).toHaveAttribute('type', 'hidden');
    });

    // --- Return to Index Link ---
    test('should navigate back to index via link', async ({ page }) => {
      await webForm.locators.returnToIndexLink.click();
      await expect(page).toHaveURL(`${BASE_URL}/index.html`);
    });

    // --- Form Submission ---
    test('should submit the form and verify navigation @smoke @critical', async ({ page }) => {
      // Fill the form
      await webForm.locators.textInput.fill('Playwright Test');
      await webForm.locators.passwordInput.fill('mypassword');
      await webForm.locators.textarea.fill('Test content');

      // Submit the form
      await webForm.actions.submitForm();

      // Verify we land on the submitted page
      await expect(page).toHaveURL(/submitted-form\.html/);
      await expect(page.getByRole('heading', { name: 'Form submitted' })).toBeVisible();
      await expect(page.getByText('Received!')).toBeVisible();
    });

    test('should submit the form with all fields filled', async ({ page }) => {
      // Text input
      await webForm.locators.textInput.fill('Full form test');
      // Password
      await webForm.locators.passwordInput.fill('pass123');
      // Textarea
      await webForm.locators.textarea.fill('Some notes here');
      // Dropdown
      await webForm.locators.dropdown.selectOption({ label: 'Two' });
      // Datalist
      await webForm.locators.datalistInput.fill('New York');
      // File upload
      await webForm.actions.uploadFile(path.resolve('package.json'));
      // Uncheck the checked checkbox
      await webForm.locators.checkedCheckbox.uncheck();
      // Check the default checkbox
      await webForm.locators.defaultCheckbox.check();
      // Select default radio
      await webForm.locators.defaultRadio.check();
      // Color
      await webForm.locators.colorPicker.fill('#00ff00');
      // Date
      await webForm.locators.datePicker.fill('12/25/2025');
      await page.keyboard.press('Escape');
      // Range
      await webForm.locators.rangeSlider.fill('9');

      // Submit
      await webForm.actions.submitForm();

      await expect(page).toHaveURL(/submitted-form\.html/);
      await expect(page.getByText('Received!')).toBeVisible();
    });

    // --- Custom Attribute ---
    test('should locate element by custom attribute', async () => {
      await expect(webForm.locators.textInputByCustomAttr).toBeVisible();
      await webForm.locators.textInputByCustomAttr.fill('Located by custom attribute');
      await expect(webForm.locators.textInputByCustomAttr).toHaveValue('Located by custom attribute');
    });

    // --- Locator by ID ---
    test('should locate text input by id', async () => {
      await expect(webForm.locators.textInputById).toBeVisible();
      await webForm.locators.textInputById.fill('Located by ID');
      await expect(webForm.locators.textInputById).toHaveValue('Located by ID');
    });

    // --- Locator by Name ---
    test('should locate elements by name attribute', async () => {
      await expect(webForm.locators.textInputByName).toBeVisible();
      await expect(webForm.locators.passwordInputByName).toBeVisible();
      await expect(webForm.locators.textareaByName).toBeVisible();
    });
  });

  // ─────────────────────────────────────────────────
  //  2. Navigation
  // ─────────────────────────────────────────────────
  test.describe('Navigation', () => {
    let nav: NavigationPage;

    test.beforeEach(async ({ page }) => {
      nav = new NavigationPage(page);
    });

    test('should display navigation page 1 content @smoke', async ({ page }) => {
      await nav.actions.goto();
      await expect(nav.locators.heading).toBeVisible();
      await expect(page.getByText('Lorem ipsum dolor sit amet')).toBeVisible();
    });

    test('should navigate through pages using pagination links @critical', async ({ page }) => {
      await nav.actions.goto();

      // Verify we are on page 1
      await expect(page).toHaveURL(/navigation1\.html/);

      // Click page 2
      await nav.actions.goToPage(2);
      await expect(page).toHaveURL(/navigation2\.html/);
      await expect(nav.locators.heading).toBeVisible();

      // Click page 3
      await nav.actions.goToPage(3);
      await expect(page).toHaveURL(/navigation3\.html/);
      await expect(nav.locators.heading).toBeVisible();
    });

    test('should navigate using Next and Previous links', async ({ page }) => {
      await nav.actions.goto();

      // "Previous" should be disabled on page 1 (it has href="#")
      await expect(nav.locators.previousLink).toBeVisible();

      // Click "Next" to go to page 2
      await nav.actions.goNext();
      await expect(page).toHaveURL(/navigation2\.html/);

      // Click "Next" again to go to page 3
      await nav.actions.goNext();
      await expect(page).toHaveURL(/navigation3\.html/);

      // Click "Previous" to go back to page 2
      await nav.actions.goPrevious();
      await expect(page).toHaveURL(/navigation2\.html/);
    });

    test('should navigate back using browser history', async ({ page }) => {
      await nav.actions.goto();
      await nav.actions.goToPage(2);
      await expect(page).toHaveURL(/navigation2\.html/);

      // Go back using browser history
      await page.goBack();
      await expect(page).toHaveURL(/navigation1\.html/);

      // Go forward using browser history
      await page.goForward();
      await expect(page).toHaveURL(/navigation2\.html/);
    });

    test('should navigate using Back to index link', async ({ page }) => {
      await nav.actions.goto();
      await nav.locators.backToIndexLink.click();
      await expect(page).toHaveURL(`${BASE_URL}/index.html`);
    });

    test('should verify all pagination links are present', async () => {
      await nav.actions.goto();

      await expect(nav.locators.pagination).toBeVisible();
      await expect.soft(nav.locators.previousLink).toBeVisible();
      await expect.soft(nav.locators.pageLink(1)).toBeVisible();
      await expect.soft(nav.locators.pageLink(2)).toBeVisible();
      await expect.soft(nav.locators.pageLink(3)).toBeVisible();
      await expect.soft(nav.locators.nextLink).toBeVisible();
    });

    test('should verify page title remains consistent across pages', async ({ page }) => {
      await nav.actions.goto();
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');

      await nav.actions.goToPage(2);
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');

      await nav.actions.goToPage(3);
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
    });

    test('should verify current page has active class in pagination', async () => {
      // Page 1 — "1" should be active
      await nav.actions.goto();
      await expect(nav.locators.activePageLink).toHaveText('1');

      // Page 2 — "2" should be active
      await nav.actions.goToPage(2);
      await expect(nav.locators.activePageLink).toHaveText('2');

      // Page 3 — "3" should be active
      await nav.actions.goToPage(3);
      await expect(nav.locators.activePageLink).toHaveText('3');
    });

    test('should verify Previous link is disabled on first page', async () => {
      await nav.actions.goto();
      await expect(nav.locators.previousItem).toHaveClass(/disabled/);
    });

    test('should verify Next link is disabled on last page', async () => {
      await nav.actions.goto(3);
      await expect(nav.locators.nextItem).toHaveClass(/disabled/);
    });

    test('should display different content on each page', async () => {
      await nav.actions.goto();
      await expect(nav.locators.leadParagraph).toContainText('Lorem ipsum dolor sit amet');

      await nav.actions.goToPage(2);
      await expect(nav.locators.leadParagraph).toContainText('Ut enim ad minim veniam');

      await nav.actions.goToPage(3);
      await expect(nav.locators.leadParagraph).toContainText('Excepteur sint occaecat cupidatat');
    });

    test('should stay on the same page when clicking current page number', async ({ page }) => {
      await nav.actions.goto();

      // Click page 1 while already on page 1
      await nav.actions.goToPage(1);
      await expect(page).toHaveURL(/navigation1\.html/);
      await expect(nav.locators.leadParagraph).toContainText('Lorem ipsum dolor sit amet');
    });
  });

  // ─────────────────────────────────────────────────
  //  3. Dropdown Menu
  // ─────────────────────────────────────────────────
  test.describe('Dropdown Menu', () => {
    let dropdown: DropdownMenuPage;

    test.beforeEach(async ({ page }) => {
      dropdown = new DropdownMenuPage(page);
      await dropdown.actions.goto();
    });

    test('should display dropdown menu heading @smoke', async () => {
      await expect(dropdown.locators.heading).toBeVisible();
    });

    test('should open dropdown with left-click @critical', async () => {
      await expect(dropdown.locators.leftClickButton).toBeVisible();

      // Click the button to open the dropdown
      await dropdown.actions.openLeftClickDropdown();

      // Verify dropdown items are visible
      await expect(dropdown.locators.leftClickMenu).toBeVisible();
      await expect.soft(dropdown.locators.leftClickMenu.getByRole('link', { name: 'Action', exact: true })).toBeVisible();
      await expect.soft(dropdown.locators.leftClickMenu.getByRole('link', { name: 'Another action' })).toBeVisible();
      await expect.soft(dropdown.locators.leftClickMenu.getByRole('link', { name: 'Something else here' })).toBeVisible();
      await expect.soft(dropdown.locators.leftClickMenu.getByRole('link', { name: 'Separated link' })).toBeVisible();
    });

    test('should open dropdown with right-click (context menu)', async () => {
      await expect(dropdown.locators.rightClickButton).toBeVisible();

      // Right-click
      await dropdown.actions.openRightClickDropdown();

      // Verify the context menu dropdown is shown
      await expect(dropdown.locators.rightClickMenu).toBeVisible();
      await expect.soft(dropdown.locators.rightClickMenu.getByRole('link', { name: 'Action', exact: true })).toBeVisible();
      await expect.soft(dropdown.locators.rightClickMenu.getByRole('link', { name: 'Another action' })).toBeVisible();
      await expect.soft(dropdown.locators.rightClickMenu.getByRole('link', { name: 'Something else here' })).toBeVisible();
      await expect.soft(dropdown.locators.rightClickMenu.getByRole('link', { name: 'Separated link' })).toBeVisible();
    });

    test('should open dropdown with double-click', async () => {
      await expect(dropdown.locators.doubleClickButton).toBeVisible();

      // Double-click
      await dropdown.actions.openDoubleClickDropdown();

      // Verify the dropdown is shown
      await expect(dropdown.locators.doubleClickMenu).toBeVisible();
      await expect(dropdown.locators.doubleClickMenu.getByRole('link', { name: 'Action', exact: true })).toBeVisible();
      await expect(dropdown.locators.doubleClickMenu.getByRole('link', { name: 'Another action' })).toBeVisible();
    });

    test('should close dropdown after clicking an item (left-click)', async () => {
      await dropdown.actions.openLeftClickDropdown();
      await expect(dropdown.locators.leftClickMenu).toBeVisible();

      // Click an item to close the dropdown
      await dropdown.locators.leftClickMenu.getByRole('link', { name: 'Action', exact: true }).click();
      await expect(dropdown.locators.leftClickMenu).toBeHidden();
    });

    test('should verify all three dropdown trigger buttons exist', async () => {
      await expect(dropdown.locators.leftClickButton).toBeVisible();
      await expect(dropdown.locators.rightClickButton).toBeVisible();
      await expect(dropdown.locators.doubleClickButton).toBeVisible();
    });

    test('should verify all four items in double-click dropdown', async () => {
      await dropdown.actions.openDoubleClickDropdown();

      await expect(dropdown.locators.doubleClickMenu).toBeVisible();
      await expect.soft(dropdown.locators.doubleClickMenu.getByRole('link', { name: 'Action', exact: true })).toBeVisible();
      await expect.soft(dropdown.locators.doubleClickMenu.getByRole('link', { name: 'Another action' })).toBeVisible();
      await expect.soft(dropdown.locators.doubleClickMenu.getByRole('link', { name: 'Something else here' })).toBeVisible();
      await expect.soft(dropdown.locators.doubleClickMenu.getByRole('link', { name: 'Separated link' })).toBeVisible();
    });

    test('should verify dropdown divider exists in each dropdown', async ({ page }) => {
      // Left-click dropdown
      await dropdown.actions.openLeftClickDropdown();
      await expect(dropdown.locators.leftClickMenu).toBeVisible();
      await expect(dropdown.locators.leftClickMenu.locator('hr.dropdown-divider')).toBeAttached();

      // Dismiss by clicking elsewhere
      await page.locator('body').click();

      // Right-click dropdown
      await dropdown.actions.openRightClickDropdown();
      await expect(dropdown.locators.rightClickMenu).toBeVisible();
      await expect(dropdown.locators.rightClickMenu.locator('hr.dropdown-divider')).toBeAttached();
    });

    test('should close right-click dropdown after clicking an item', async () => {
      await dropdown.actions.openRightClickDropdown();

      await expect(dropdown.locators.rightClickMenu).toBeVisible();

      await dropdown.locators.rightClickMenu.getByRole('link', { name: 'Action', exact: true }).click();
      await expect(dropdown.locators.rightClickMenu).toBeHidden();
    });

    test('should close double-click dropdown after clicking an item', async () => {
      await dropdown.actions.openDoubleClickDropdown();

      await expect(dropdown.locators.doubleClickMenu).toBeVisible();

      await dropdown.locators.doubleClickMenu.getByRole('link', { name: 'Another action' }).click();
      await expect(dropdown.locators.doubleClickMenu).toBeHidden();
    });

    test('should close dropdown when clicking outside', async () => {
      // Open left-click dropdown
      await dropdown.actions.openLeftClickDropdown();
      await expect(dropdown.locators.leftClickMenu).toBeVisible();

      // Click outside to dismiss
      await dropdown.locators.heading.click();
      await expect(dropdown.locators.leftClickMenu).toBeHidden();
    });
  });

  // ─────────────────────────────────────────────────
  //  4. Mouse Over
  // ─────────────────────────────────────────────────
  test.describe('Mouse Over', () => {
    let mouseOver: MouseOverPage;

    test.beforeEach(async ({ page }) => {
      mouseOver = new MouseOverPage(page);
      await mouseOver.actions.goto();
    });

    test('should display the mouse over heading @smoke', async () => {
      await expect(mouseOver.locators.heading).toBeVisible();
    });

    test('should display all four images', async () => {
      await expect(mouseOver.locators.images).toHaveCount(4);
    });

    test('should reveal image captions on hover @critical', async () => {
      const expectedCaptions = ['Compass', 'Calendar', 'Award', 'Landscape'];

      for (let captionIndex = 0; captionIndex < expectedCaptions.length; captionIndex++) {
        const figure = mouseOver.locators.figures.nth(captionIndex);
        // Hover over the image to reveal the caption
        await mouseOver.actions.hoverImage(captionIndex);
        await expect(figure.getByText(expectedCaptions[captionIndex])).toBeVisible();
      }
    });

    test('should verify image sources are correct', async () => {
      await expect(mouseOver.locators.compassImage).toBeVisible();
      await expect(mouseOver.locators.calendarImage).toBeVisible();
      await expect(mouseOver.locators.awardImage).toBeVisible();
      await expect(mouseOver.locators.landscapeImage).toBeVisible();
    });

    test('should verify images are loaded successfully', async () => {
      const count = await mouseOver.locators.images.count();

      for (let imageIndex = 0; imageIndex < count; imageIndex++) {
        const image = mouseOver.locators.images.nth(imageIndex);
        const naturalWidth = await image.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    });

    test('should have all captions hidden before hover', async () => {
      const count = await mouseOver.locators.captions.count();
      expect(count).toBe(4);

      for (let captionIndex = 0; captionIndex < count; captionIndex++) {
        await expect(mouseOver.locators.captions.nth(captionIndex)).toBeHidden();
      }
    });

    test('should hide caption when mouse leaves the image', async () => {
      const figure = mouseOver.locators.figures.first();
      const caption = figure.locator('.caption');

      // Initially hidden
      await expect(caption).toBeHidden();

      // Hover to reveal
      await mouseOver.actions.hoverImage(0);
      await expect(caption).toBeVisible();

      // Move mouse away (hover on heading to leave the figure area)
      await mouseOver.locators.heading.hover();
      await expect(caption).toBeHidden();
    });
  });

  // ─────────────────────────────────────────────────
  //  5. Drag and Drop
  // ─────────────────────────────────────────────────
  test.describe('Drag and Drop', () => {
    let dragDrop: DragAndDropPage;

    test.beforeEach(async ({ page }) => {
      dragDrop = new DragAndDropPage(page);
      await dragDrop.actions.goto();
    });

    test('should display the drag and drop heading @smoke', async () => {
      await expect(dragDrop.locators.heading).toBeVisible();
    });

    test('should display the draggable panel', async () => {
      await expect(dragDrop.locators.draggable).toBeVisible();
      await expect(dragDrop.locators.draggableHeading).toBeVisible();
      await expect(dragDrop.locators.dragMeText).toBeVisible();
    });

    test('should display the drop target area', async () => {
      await expect(dragDrop.locators.target).toBeVisible();
    });

    test('should drag element to target @critical', async () => {
      // Get initial position of draggable
      const initialBox = await dragDrop.locators.draggable.boundingBox();
      expect(initialBox).not.toBeNull();

      // Perform drag and drop
      await dragDrop.actions.dragToTarget();

      // Verify position has changed after drag
      const finalBox = await dragDrop.locators.draggable.boundingBox();
      expect(finalBox).not.toBeNull();

      // The position should have changed (moved to the right towards target)
      expect(finalBox!.x).not.toBe(initialBox!.x);
    });

    test('should drag element using mouse actions', async ({ page }) => {
      const box = await dragDrop.locators.draggable.boundingBox();
      expect(box).not.toBeNull();

      const startX = box!.x + box!.width / 2;
      const startY = box!.y + box!.height / 2;

      // Perform manual drag using mouse
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 200, startY, { steps: 10 });
      await page.mouse.up();

      // Verify position has changed
      const newBox = await dragDrop.locators.draggable.boundingBox();
      expect(newBox).not.toBeNull();
      expect(newBox!.x).toBeGreaterThan(box!.x);
    });
  });

  // ─────────────────────────────────────────────────
  //  6. Draw in Canvas
  // ─────────────────────────────────────────────────
  test.describe('Draw in Canvas', () => {
    let canvas: DrawInCanvasPage;

    test.beforeEach(async ({ page }) => {
      canvas = new DrawInCanvasPage(page);
      await canvas.actions.goto();
    });

    test('should display the drawing in canvas heading @smoke', async () => {
      await expect(canvas.locators.heading).toBeVisible();
      await expect(canvas.locators.instructions).toBeVisible();
    });

    test('should verify canvas element exists', async () => {
      await expect(canvas.locators.canvas).toBeVisible();
      await expect(canvas.locators.canvas).toHaveAttribute('id', 'my-canvas');
    });

    test('should draw on canvas by clicking @critical', async ({ page }) => {
      const box = await canvas.locators.canvas.boundingBox();
      expect(box).not.toBeNull();

      // Get pixel data before drawing
      const pixelsBefore = await page.evaluate(() => {
        const canvas = document.getElementById('my-canvas') as HTMLCanvasElement;
        const ctx = canvas.getContext('2d')!;
        return ctx.getImageData(0, 0, canvas.width, canvas.height).data.some((pixel, index) => index % 4 === 3 && pixel > 0);
      });
      expect(pixelsBefore).toBe(false);

      // Click in the center of canvas to draw
      await canvas.locators.canvas.click({
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

    test('should draw a line on canvas by dragging', async ({ page }) => {
      const box = await canvas.locators.canvas.boundingBox();
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

    test('should draw multiple shapes on canvas', async ({ page }) => {
      const box = await canvas.locators.canvas.boundingBox();
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

    test('should verify canvas dimensions', async () => {
      const width = await canvas.locators.canvas.getAttribute('width');
      expect(Number(width)).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────────
  //  7. Loading Images
  // ─────────────────────────────────────────────────
  test.describe('Loading Images', () => {
    let loadingImages: LoadingImagesPage;

    test.beforeEach(async ({ page }) => {
      loadingImages = new LoadingImagesPage(page);
    });

    test('should display loading message initially', async () => {
      await loadingImages.actions.goto();
      // The spinner should be visible initially
      await expect(loadingImages.locators.spinner).toBeVisible();
    });

    test('should show "Done!" text after all images load', async () => {
      await loadingImages.actions.goto();

      // Wait for the text to change to "Done!" (images load at 2s intervals, last at 8s)
      await expect(loadingImages.locators.text).toHaveText('Done!', { timeout: 15000 });
    });

    test('should load compass image first @smoke', async () => {
      await loadingImages.actions.goto();

      // Compass image should appear quickly (within ~2s)
      await expect(loadingImages.locators.compassImg).toBeVisible({ timeout: 5000 });
      await expect(loadingImages.locators.compassImg).toHaveAttribute('alt', 'compass');
    });

    test('should load all four images with correct attributes after waiting @critical', async () => {
      test.setTimeout(20000);
      await loadingImages.actions.goto();

      // Wait for all images to load (last image appears at ~8s)
      await expect(loadingImages.locators.text).toHaveText('Done!', { timeout: 15000 });

      // Verify all 4 images are present with correct alt and src attributes
      const images = [
        { locator: loadingImages.locators.compassImg, alt: 'compass', src: 'img/compass.png' },
        { locator: loadingImages.locators.calendarImg, alt: 'calendar', src: 'img/calendar.png' },
        { locator: loadingImages.locators.awardImg, alt: 'award', src: 'img/award.png' },
        { locator: loadingImages.locators.landscapeImg, alt: 'landscape', src: 'img/landscape.png' },
      ];

      for (const img of images) {
        await expect(img.locator).toBeVisible();
        await expect(img.locator).toHaveAttribute('alt', img.alt);
        await expect(img.locator).toHaveAttribute('src', img.src);
      }
    });

    test('should verify images appear in correct order', async () => {
      test.setTimeout(20000);
      await loadingImages.actions.goto();

      // First image should appear within ~2s
      await expect(loadingImages.locators.compassImg).toBeVisible({ timeout: 5000 });

      // Second image should appear around ~4s
      await expect(loadingImages.locators.calendarImg).toBeVisible({ timeout: 5000 });

      // Third image around ~6s
      await expect(loadingImages.locators.awardImg).toBeVisible({ timeout: 5000 });

      // Fourth image around ~8s
      await expect(loadingImages.locators.landscapeImg).toBeVisible({ timeout: 5000 });
    });

    test('should verify spinner disappears after loading', async () => {
      test.setTimeout(20000);
      await loadingImages.actions.goto();

      // Wait for done text which replaces the spinner
      await expect(loadingImages.locators.text).toHaveText('Done!', { timeout: 15000 });

      // Spinner should no longer exist (the innerHTML is replaced)
      await expect(loadingImages.locators.spinner).toHaveCount(0);
    });
  });

  // ─────────────────────────────────────────────────
  //  8. Slow Calculator
  // ─────────────────────────────────────────────────
  test.describe('Slow Calculator', () => {
    let calc: SlowCalculatorPage;

    test.beforeEach(async ({ page }) => {
      calc = new SlowCalculatorPage(page);
      await calc.actions.goto();
    });

    test('should display the slow calculator heading @smoke', async () => {
      await expect(calc.locators.heading).toBeVisible();
    });

    test('should verify default delay is 5 seconds', async () => {
      await expect(calc.locators.delayInput).toHaveValue('5');
    });

    test('should verify all calculator buttons are present', async ({ page }) => {
      // Number buttons
      for (let digit = 0; digit <= 9; digit++) {
        await expect(page.locator(`#calculator .keys >> text="${digit}"`)).toBeVisible();
      }

      // Operator buttons
      await expect(page.locator('#calculator .keys >> text="+"')).toBeVisible();
      await expect(page.locator('#calculator .keys >> text="-"')).toBeVisible();
      await expect(page.locator('#calculator .keys >> text="÷"')).toBeVisible();
      await expect(page.locator('#calculator .keys >> text="x"')).toBeVisible();

      // Other buttons
      await expect(page.locator('#calculator .keys >> text="="')).toBeVisible();
      await expect(page.locator('#calculator .keys >> text="."')).toBeVisible();
      await expect(page.locator('#calculator >> text="C"')).toBeVisible();
    });

    test('should perform addition (1 + 3 = 4) with reduced delay @smoke @critical', async () => {
      test.setTimeout(15000);
      await calc.actions.setDelay('1');

      await calc.actions.pressKeys('1', '+', '3', '=');
      await expect(calc.locators.screen).toHaveText('4', { timeout: 10000 });
    });

    test('should perform subtraction (9 - 4 = 5) with reduced delay @critical', async () => {
      test.setTimeout(15000);
      await calc.actions.setDelay('1');

      await calc.actions.pressKeys('9', '-', '4', '=');
      await expect(calc.locators.screen).toHaveText('5', { timeout: 10000 });
    });

    test('should perform multiplication (6 x 7 = 42) with reduced delay @critical', async () => {
      test.setTimeout(15000);
      await calc.actions.setDelay('1');

      await calc.actions.pressKeys('6', 'x', '7', '=');
      await expect(calc.locators.screen).toHaveText('42', { timeout: 10000 });
    });

    test('should perform division (8 ÷ 2 = 4) with reduced delay @critical', async () => {
      test.setTimeout(15000);
      await calc.actions.setDelay('1');

      await calc.actions.pressKeys('8', '÷', '2', '=');
      await expect(calc.locators.screen).toHaveText('4', { timeout: 10000 });
    });

    test('should clear calculator display', async () => {
      await calc.actions.pressKeys('5', '3');
      await expect(calc.locators.screen).toHaveText('53');

      await calc.actions.clear();
      await expect(calc.locators.screen).toHaveText('');
    });

    test('should handle decimal numbers with reduced delay', async () => {
      test.setTimeout(15000);
      await calc.actions.setDelay('1');

      await calc.actions.pressKeys('2', '.', '5', '+', '1', '.', '5', '=');
      await expect(calc.locators.screen).toHaveText('4', { timeout: 10000 });
    });

    test('should show spinner while calculating', async () => {
      test.setTimeout(15000);

      // Keep default 5-second delay so spinner is visible
      await calc.actions.pressKeys('1', '+', '1', '=');

      await expect(calc.locators.spinner).toBeVisible();

      await expect(calc.locators.screen).toHaveText('2', { timeout: 10000 });
    });

    test('should change the delay value', async () => {
      await calc.actions.setDelay('2');
      await expect(calc.locators.delayInput).toHaveValue('2');
    });

    test('should perform chained calculation with reduced delay', async () => {
      test.setTimeout(15000);
      await calc.actions.setDelay('1');

      await calc.actions.pressKeys('1', '+', '2', '=');
      await expect(calc.locators.screen).toHaveText('3', { timeout: 10000 });
    });

    test('should handle division by zero with reduced delay', async () => {
      test.setTimeout(15000);
      await calc.actions.setDelay('1');

      await calc.actions.pressKeys('5', '÷', '0', '=');
      await expect(calc.locators.screen).toHaveText('Infinity', { timeout: 10000 });
    });

    test('should hide spinner after calculation completes', async () => {
      test.setTimeout(15000);
      await calc.actions.setDelay('1');

      await calc.actions.pressKeys('3', '+', '4', '=');

      await expect(calc.locators.spinner).toBeVisible();

      await expect(calc.locators.screen).toHaveText('7', { timeout: 10000 });
      await expect(calc.locators.spinner).toBeHidden();
    });
  });

  // ─────────────────────────────────────────────────
  //  Cross-page: Index Page Links
  // ─────────────────────────────────────────────────
  test.describe('Index Page - Chapter 3 Links', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
      homePage = new HomePage(page);
      await homePage.actions.goto();
    });

    test('should display the Chapter 3 section heading', async () => {
      await expect(homePage.locators.chapter3Heading).toBeVisible();
    });

    test('should have all Chapter 3 links', async () => {
      const chapter3Links = ['Web form', 'Navigation', 'Dropdown menu', 'Mouse over', 'Drag and drop', 'Draw in canvas', 'Loading images', 'Slow calculator'];

      for (const linkText of chapter3Links) {
        await expect(homePage.locators.chapterLink(linkText)).toBeVisible();
      }
    });

    test('should navigate to each Chapter 3 page and back', async ({ page }) => {
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
        await expect(page.getByRole('heading', { name: pageInfo.heading })).toBeVisible();
      }
    });
  });
});
