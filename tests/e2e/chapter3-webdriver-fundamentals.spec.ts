import { expect, test } from '@playwright/test';
import path from 'path';
import { pressCalcKeys } from '../../utilities/calculator';

const BASE_URL = 'https://bonigarcia.dev/selenium-webdriver-java';

test.describe('Chapter 3 - WebDriver Fundamentals', () => {
  // ─────────────────────────────────────────────────
  //  1. Web Form
  // ─────────────────────────────────────────────────
  test.describe('Web Form', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/web-form.html`);
    });

    test('should display the web form heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Web form' })).toBeVisible();
    });

    // --- Text Input ---
    test('should type into text input field', async ({ page }) => {
      const textInput = page.getByRole('textbox', { name: 'Text input' });
      await textInput.fill('Hello Playwright');
      await expect(textInput).toHaveValue('Hello Playwright');
    });

    test('should clear and retype in text input field', async ({ page }) => {
      const textInput = page.getByRole('textbox', { name: 'Text input' });
      await textInput.fill('Initial text');
      await expect(textInput).toHaveValue('Initial text');
      await textInput.clear();
      await expect(textInput).toHaveValue('');
      await textInput.fill('Updated text');
      await expect(textInput).toHaveValue('Updated text');
    });

    // --- Password Input ---
    test('should type into password field', async ({ page }) => {
      const passwordInput = page.getByRole('textbox', { name: 'Password' });
      await passwordInput.fill('secret123');
      await expect(passwordInput).toHaveValue('secret123');
      // Verify the input type is password (masked)
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    // --- Textarea ---
    test('should type into textarea', async ({ page }) => {
      const textarea = page.getByRole('textbox', { name: 'Textarea' });
      const multiLineText = 'Line 1\nLine 2\nLine 3';
      await textarea.fill(multiLineText);
      await expect(textarea).toHaveValue(multiLineText);
    });

    // --- Disabled Input ---
    test('should verify disabled input is not editable', async ({ page }) => {
      const disabledInput = page.getByRole('textbox', { name: 'Disabled input' });
      await expect(disabledInput).toBeDisabled();
      await expect(disabledInput).toHaveAttribute('placeholder', 'Disabled input');
    });

    // --- Readonly Input ---
    test('should verify readonly input has pre-filled value', async ({ page }) => {
      const readonlyInput = page.getByRole('textbox', { name: 'Readonly input' });
      await expect(readonlyInput).toBeEditable({ editable: false });
      await expect(readonlyInput).toHaveValue('Readonly input');
      await expect(readonlyInput).toHaveAttribute('readonly', '');
    });

    // --- Dropdown (select) ---
    test('should select options from dropdown by visible text', async ({ page }) => {
      const dropdown = page.getByRole('combobox', { name: 'Dropdown (select)' });
      await expect(dropdown).toHaveValue('Open this select menu');

      await dropdown.selectOption({ label: 'One' });
      await expect(dropdown).toHaveValue('1');

      await dropdown.selectOption({ label: 'Two' });
      await expect(dropdown).toHaveValue('2');

      await dropdown.selectOption({ label: 'Three' });
      await expect(dropdown).toHaveValue('3');
    });

    test('should select dropdown option by value', async ({ page }) => {
      const dropdown = page.getByRole('combobox', { name: 'Dropdown (select)' });
      await dropdown.selectOption('2');
      await expect(dropdown).toHaveValue('2');
    });

    test('should verify all dropdown options are present', async ({ page }) => {
      const options = page.getByRole('combobox', { name: 'Dropdown (select)' }).getByRole('option');
      await expect(options).toHaveCount(4);
      await expect(options).toHaveText(['Open this select menu', 'One', 'Two', 'Three']);
    });

    // --- Dropdown (datalist) ---
    test('should type into datalist input and verify suggestions', async ({ page }) => {
      const datalistInput = page.getByRole('combobox', { name: 'Dropdown (datalist)' });
      await expect(datalistInput).toHaveAttribute('placeholder', 'Type to search...');
      await datalistInput.fill('San Francisco');
      await expect(datalistInput).toHaveValue('San Francisco');
    });

    test('should verify datalist options exist', async ({ page }) => {
      const datalistOptions = page.locator('#my-options option');
      await expect(datalistOptions).toHaveCount(5);

      const expectedCities = ['San Francisco', 'New York', 'Seattle', 'Los Angeles', 'Chicago'];
      for (const city of expectedCities) {
        await expect(datalistOptions.filter({ hasText: city })).toHaveCount(0); // datalist options use value attribute
        await expect(page.locator(`#my-options option[value="${city}"]`)).toBeAttached();
      }
    });

    // --- File Input ---
    test('should upload a file', async ({ page }) => {
      const fileInput = page.locator('input[type="file"]');
      const testFilePath = path.resolve('package.json');
      await fileInput.setInputFiles(testFilePath);
      // Verify a file has been selected (input value contains the filename)
      const inputValue = await fileInput.inputValue();
      expect(inputValue).toContain('package.json');
    });

    // --- Checkboxes ---
    test('should verify default checkbox states', async ({ page }) => {
      const checkedCheckbox = page.getByRole('checkbox', { name: 'Checked checkbox' });
      const defaultCheckbox = page.getByRole('checkbox', { name: 'Default checkbox' });

      await expect(checkedCheckbox).toBeChecked();
      await expect(defaultCheckbox).not.toBeChecked();
    });

    test('should toggle checkboxes', async ({ page }) => {
      const checkedCheckbox = page.getByRole('checkbox', { name: 'Checked checkbox' });
      const defaultCheckbox = page.getByRole('checkbox', { name: 'Default checkbox' });

      // Uncheck the checked one
      await checkedCheckbox.uncheck();
      await expect(checkedCheckbox).not.toBeChecked();

      // Check the default one
      await defaultCheckbox.check();
      await expect(defaultCheckbox).toBeChecked();
    });

    // --- Radio Buttons ---
    test('should verify default radio button states', async ({ page }) => {
      const checkedRadio = page.getByRole('radio', { name: 'Checked radio' });
      const defaultRadio = page.getByRole('radio', { name: 'Default radio' });

      await expect(checkedRadio).toBeChecked();
      await expect(defaultRadio).not.toBeChecked();
    });

    test('should select a different radio button', async ({ page }) => {
      const checkedRadio = page.getByRole('radio', { name: 'Checked radio' });
      const defaultRadio = page.getByRole('radio', { name: 'Default radio' });

      await defaultRadio.check();
      await expect(defaultRadio).toBeChecked();
      // Only one radio in the group can be selected
      await expect(checkedRadio).not.toBeChecked();
    });

    // --- Color Picker ---
    test('should verify default color picker value', async ({ page }) => {
      const colorPicker = page.locator('input[type="color"]');
      await expect(colorPicker).toHaveValue('#563d7c');
    });

    test('should change color picker value', async ({ page }) => {
      const colorPicker = page.locator('input[type="color"]');
      await colorPicker.fill('#ff5733');
      await expect(colorPicker).toHaveValue('#ff5733');
    });

    // --- Date Picker ---
    test('should set a date in the date picker', async ({ page }) => {
      const datePicker = page.getByRole('textbox', { name: 'Date picker' });
      await datePicker.fill('03/02/2026');
      await expect(datePicker).toHaveValue('03/02/2026');
    });

    // --- Range Slider ---
    test('should verify default range slider value', async ({ page }) => {
      const rangeSlider = page.getByRole('slider', { name: 'Example range' });
      await expect(rangeSlider).toHaveValue('5');
      await expect(rangeSlider).toHaveAttribute('min', '0');
      await expect(rangeSlider).toHaveAttribute('max', '10');
      await expect(rangeSlider).toHaveAttribute('step', '1');
    });

    test('should change range slider value', async ({ page }) => {
      const rangeSlider = page.getByRole('slider', { name: 'Example range' });
      await rangeSlider.fill('8');
      await expect(rangeSlider).toHaveValue('8');
    });

    // --- Hidden Input ---
    test('should verify hidden input exists', async ({ page }) => {
      const hiddenInput = page.locator('input[name="my-hidden"]');
      await expect(hiddenInput).toBeAttached();
      await expect(hiddenInput).toBeHidden();
      await expect(hiddenInput).toHaveAttribute('type', 'hidden');
    });

    // --- Return to Index Link ---
    test('should navigate back to index via link', async ({ page }) => {
      await page.getByRole('link', { name: 'Return to index' }).click();
      await expect(page).toHaveURL(`${BASE_URL}/index.html`);
    });

    // --- Form Submission ---
    test('should submit the form and verify navigation', async ({ page }) => {
      // Fill the form
      await page.getByRole('textbox', { name: 'Text input' }).fill('Playwright Test');
      await page.getByRole('textbox', { name: 'Password' }).fill('mypassword');
      await page.getByRole('textbox', { name: 'Textarea' }).fill('Test content');

      // Submit the form
      await page.getByRole('button', { name: 'Submit' }).click();

      // Verify we land on the submitted page
      await expect(page).toHaveURL(/submitted-form\.html/);
      await expect(page.getByRole('heading', { name: 'Form submitted' })).toBeVisible();
      await expect(page.getByText('Received!')).toBeVisible();
    });

    test('should submit the form with all fields filled', async ({ page }) => {
      // Text input
      await page.getByRole('textbox', { name: 'Text input' }).fill('Full form test');
      // Password
      await page.getByRole('textbox', { name: 'Password' }).fill('pass123');
      // Textarea
      await page.getByRole('textbox', { name: 'Textarea' }).fill('Some notes here');
      // Dropdown
      await page.getByRole('combobox', { name: 'Dropdown (select)' }).selectOption({ label: 'Two' });
      // Datalist
      await page.getByRole('combobox', { name: 'Dropdown (datalist)' }).fill('New York');
      // File upload
      await page.locator('input[type="file"]').setInputFiles(path.resolve('package.json'));
      // Uncheck the checked checkbox
      await page.getByRole('checkbox', { name: 'Checked checkbox' }).uncheck();
      // Check the default checkbox
      await page.getByRole('checkbox', { name: 'Default checkbox' }).check();
      // Select default radio
      await page.getByRole('radio', { name: 'Default radio' }).check();
      // Color
      await page.locator('input[type="color"]').fill('#00ff00');
      // Date
      await page.getByRole('textbox', { name: 'Date picker' }).fill('12/25/2025');
      // Range
      await page.getByRole('slider', { name: 'Example range' }).fill('9');

      // Submit
      await page.getByRole('button', { name: 'Submit' }).click();

      await expect(page).toHaveURL(/submitted-form\.html/);
      await expect(page.getByText('Received!')).toBeVisible();
    });

    // --- Custom Attribute ---
    test('should locate element by custom attribute', async ({ page }) => {
      const textInput = page.locator('[myprop="myvalue"]');
      await expect(textInput).toBeVisible();
      await textInput.fill('Located by custom attribute');
      await expect(textInput).toHaveValue('Located by custom attribute');
    });

    // --- Locator by ID ---
    test('should locate text input by id', async ({ page }) => {
      const textInput = page.locator('#my-text-id');
      await expect(textInput).toBeVisible();
      await textInput.fill('Located by ID');
      await expect(textInput).toHaveValue('Located by ID');
    });

    // --- Locator by Name ---
    test('should locate elements by name attribute', async ({ page }) => {
      const textInput = page.locator('[name="my-text"]');
      await expect(textInput).toBeVisible();

      const passwordInput = page.locator('[name="my-password"]');
      await expect(passwordInput).toBeVisible();

      const textarea = page.locator('[name="my-textarea"]');
      await expect(textarea).toBeVisible();
    });
  });

  // ─────────────────────────────────────────────────
  //  2. Navigation
  // ─────────────────────────────────────────────────
  test.describe('Navigation', () => {
    test('should display navigation page 1 content', async ({ page }) => {
      await page.goto(`${BASE_URL}/navigation1.html`);
      await expect(page.getByRole('heading', { name: 'Navigation example' })).toBeVisible();
      await expect(page.getByText('Lorem ipsum dolor sit amet')).toBeVisible();
    });

    test('should navigate through pages using pagination links', async ({ page }) => {
      await page.goto(`${BASE_URL}/navigation1.html`);

      // Verify we are on page 1
      await expect(page).toHaveURL(/navigation1\.html/);

      // Click page 2
      await page.getByRole('link', { name: '2' }).click();
      await expect(page).toHaveURL(/navigation2\.html/);
      await expect(page.getByRole('heading', { name: 'Navigation example' })).toBeVisible();

      // Click page 3
      await page.getByRole('link', { name: '3' }).click();
      await expect(page).toHaveURL(/navigation3\.html/);
      await expect(page.getByRole('heading', { name: 'Navigation example' })).toBeVisible();
    });

    test('should navigate using Next and Previous links', async ({ page }) => {
      await page.goto(`${BASE_URL}/navigation1.html`);

      // "Previous" should be disabled on page 1 (it has href="#")
      const previousLink = page.getByRole('link', { name: 'Previous' });
      await expect(previousLink).toBeVisible();

      // Click "Next" to go to page 2
      await page.getByRole('link', { name: 'Next' }).click();
      await expect(page).toHaveURL(/navigation2\.html/);

      // Click "Next" again to go to page 3
      await page.getByRole('link', { name: 'Next' }).click();
      await expect(page).toHaveURL(/navigation3\.html/);

      // Click "Previous" to go back to page 2
      await page.getByRole('link', { name: 'Previous' }).click();
      await expect(page).toHaveURL(/navigation2\.html/);
    });

    test('should navigate back using browser history', async ({ page }) => {
      await page.goto(`${BASE_URL}/navigation1.html`);
      await page.getByRole('link', { name: '2' }).click();
      await expect(page).toHaveURL(/navigation2\.html/);

      // Go back using browser history
      await page.goBack();
      await expect(page).toHaveURL(/navigation1\.html/);

      // Go forward using browser history
      await page.goForward();
      await expect(page).toHaveURL(/navigation2\.html/);
    });

    test('should navigate using Back to index link', async ({ page }) => {
      await page.goto(`${BASE_URL}/navigation1.html`);
      await page.getByRole('link', { name: 'Back to index' }).click();
      await expect(page).toHaveURL(`${BASE_URL}/index.html`);
    });

    test('should verify all pagination links are present', async ({ page }) => {
      await page.goto(`${BASE_URL}/navigation1.html`);

      const pagination = page.getByRole('navigation', { name: 'Page navigation example' });
      await expect(pagination).toBeVisible();

      await expect(page.getByRole('link', { name: 'Previous' })).toBeVisible();
      await expect(page.getByRole('link', { name: '1' })).toBeVisible();
      await expect(page.getByRole('link', { name: '2' })).toBeVisible();
      await expect(page.getByRole('link', { name: '3' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Next' })).toBeVisible();
    });

    test('should verify page title remains consistent across pages', async ({ page }) => {
      await page.goto(`${BASE_URL}/navigation1.html`);
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');

      await page.getByRole('link', { name: '2' }).click();
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');

      await page.getByRole('link', { name: '3' }).click();
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
    });

    test('should verify current page has active class in pagination', async ({ page }) => {
      // Page 1 — "1" should be active
      await page.goto(`${BASE_URL}/navigation1.html`);
      await expect(page.locator('li.page-item.active a.page-link')).toHaveText('1');

      // Page 2 — "2" should be active
      await page.getByRole('link', { name: '2' }).click();
      await expect(page.locator('li.page-item.active a.page-link')).toHaveText('2');

      // Page 3 — "3" should be active
      await page.getByRole('link', { name: '3' }).click();
      await expect(page.locator('li.page-item.active a.page-link')).toHaveText('3');
    });

    test('should verify Previous link is disabled on first page', async ({ page }) => {
      await page.goto(`${BASE_URL}/navigation1.html`);

      const previousItem = page.locator('li.page-item').filter({ hasText: 'Previous' });
      await expect(previousItem).toHaveClass(/disabled/);
    });

    test('should verify Next link is disabled on last page', async ({ page }) => {
      await page.goto(`${BASE_URL}/navigation3.html`);

      const nextItem = page.locator('li.page-item').filter({ hasText: 'Next' });
      await expect(nextItem).toHaveClass(/disabled/);
    });

    test('should display different content on each page', async ({ page }) => {
      await page.goto(`${BASE_URL}/navigation1.html`);
      await expect(page.locator('p.lead')).toContainText('Lorem ipsum dolor sit amet');

      await page.getByRole('link', { name: '2' }).click();
      await expect(page.locator('p.lead')).toContainText('Ut enim ad minim veniam');

      await page.getByRole('link', { name: '3' }).click();
      await expect(page.locator('p.lead')).toContainText('Excepteur sint occaecat cupidatat');
    });

    test('should stay on the same page when clicking current page number', async ({ page }) => {
      await page.goto(`${BASE_URL}/navigation1.html`);

      // Click page 1 while already on page 1
      await page.getByRole('link', { name: '1' }).click();
      await expect(page).toHaveURL(/navigation1\.html/);
      await expect(page.locator('p.lead')).toContainText('Lorem ipsum dolor sit amet');
    });
  });

  // ─────────────────────────────────────────────────
  //  3. Dropdown Menu
  // ─────────────────────────────────────────────────
  test.describe('Dropdown Menu', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/dropdown-menu.html`);
    });

    test('should display dropdown menu heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Dropdown menu' })).toBeVisible();
    });

    test('should open dropdown with left-click', async ({ page }) => {
      const leftClickButton = page.getByRole('button', { name: 'Use left-click here' });
      await expect(leftClickButton).toBeVisible();

      // Click the button to open the dropdown
      await leftClickButton.click();

      // Verify dropdown items are visible
      const dropdownMenu = page.locator('#my-dropdown-1 + .dropdown-menu');
      await expect(dropdownMenu).toBeVisible();
      await expect(dropdownMenu.getByRole('link', { name: 'Action', exact: true })).toBeVisible();
      await expect(dropdownMenu.getByRole('link', { name: 'Another action' })).toBeVisible();
      await expect(dropdownMenu.getByRole('link', { name: 'Something else here' })).toBeVisible();
      await expect(dropdownMenu.getByRole('link', { name: 'Separated link' })).toBeVisible();
    });

    test('should open dropdown with right-click (context menu)', async ({ page }) => {
      const rightClickButton = page.getByRole('button', { name: 'Use right-click here' });
      await expect(rightClickButton).toBeVisible();

      // Right-click
      await rightClickButton.click({ button: 'right' });

      // Verify the context menu dropdown is shown
      const contextMenu = page.locator('#context-menu-2');
      await expect(contextMenu).toBeVisible();
      await expect(contextMenu.getByRole('link', { name: 'Action', exact: true })).toBeVisible();
      await expect(contextMenu.getByRole('link', { name: 'Another action' })).toBeVisible();
      await expect(contextMenu.getByRole('link', { name: 'Something else here' })).toBeVisible();
      await expect(contextMenu.getByRole('link', { name: 'Separated link' })).toBeVisible();
    });

    test('should open dropdown with double-click', async ({ page }) => {
      const doubleClickButton = page.getByRole('button', { name: 'Use double-click here' });
      await expect(doubleClickButton).toBeVisible();

      // Double-click
      await doubleClickButton.dblclick();

      // Verify the dropdown is shown
      const dblClickMenu = page.locator('#context-menu-3');
      await expect(dblClickMenu).toBeVisible();
      await expect(dblClickMenu.getByRole('link', { name: 'Action', exact: true })).toBeVisible();
      await expect(dblClickMenu.getByRole('link', { name: 'Another action' })).toBeVisible();
    });

    test('should close dropdown after clicking an item (left-click)', async ({ page }) => {
      const leftClickButton = page.getByRole('button', { name: 'Use left-click here' });
      await leftClickButton.click();

      const dropdownMenu = page.locator('#my-dropdown-1 + .dropdown-menu');
      await expect(dropdownMenu).toBeVisible();

      // Click an item to close the dropdown
      await dropdownMenu.getByRole('link', { name: 'Action', exact: true }).click();
      await expect(dropdownMenu).toBeHidden();
    });

    test('should verify all three dropdown trigger buttons exist', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Use left-click here' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Use right-click here' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Use double-click here' })).toBeVisible();
    });

    test('should verify all four items in double-click dropdown', async ({ page }) => {
      await page.getByRole('button', { name: 'Use double-click here' }).dblclick();

      const menu = page.locator('#context-menu-3');
      await expect(menu).toBeVisible();
      await expect(menu.getByRole('link', { name: 'Action', exact: true })).toBeVisible();
      await expect(menu.getByRole('link', { name: 'Another action' })).toBeVisible();
      await expect(menu.getByRole('link', { name: 'Something else here' })).toBeVisible();
      await expect(menu.getByRole('link', { name: 'Separated link' })).toBeVisible();
    });

    test('should verify dropdown divider exists in each dropdown', async ({ page }) => {
      // Left-click dropdown
      await page.getByRole('button', { name: 'Use left-click here' }).click();
      const leftMenu = page.locator('#my-dropdown-1 + .dropdown-menu');
      await expect(leftMenu).toBeVisible();
      await expect(leftMenu.locator('hr.dropdown-divider')).toBeAttached();

      // Dismiss by clicking elsewhere
      await page.locator('body').click();

      // Right-click dropdown
      await page.getByRole('button', { name: 'Use right-click here' }).click({ button: 'right' });
      const rightMenu = page.locator('#context-menu-2');
      await expect(rightMenu).toBeVisible();
      await expect(rightMenu.locator('hr.dropdown-divider')).toBeAttached();
    });

    test('should close right-click dropdown after clicking an item', async ({ page }) => {
      await page.getByRole('button', { name: 'Use right-click here' }).click({ button: 'right' });

      const contextMenu = page.locator('#context-menu-2');
      await expect(contextMenu).toBeVisible();

      await contextMenu.getByRole('link', { name: 'Action', exact: true }).click();
      await expect(contextMenu).toBeHidden();
    });

    test('should close double-click dropdown after clicking an item', async ({ page }) => {
      await page.getByRole('button', { name: 'Use double-click here' }).dblclick();

      const dblMenu = page.locator('#context-menu-3');
      await expect(dblMenu).toBeVisible();

      await dblMenu.getByRole('link', { name: 'Another action' }).click();
      await expect(dblMenu).toBeHidden();
    });

    test('should close dropdown when clicking outside', async ({ page }) => {
      // Open left-click dropdown
      await page.getByRole('button', { name: 'Use left-click here' }).click();
      const dropdown = page.locator('#my-dropdown-1 + .dropdown-menu');
      await expect(dropdown).toBeVisible();

      // Click outside to dismiss
      await page.getByRole('heading', { name: 'Dropdown menu' }).click();
      await expect(dropdown).toBeHidden();
    });
  });

  // ─────────────────────────────────────────────────
  //  4. Mouse Over
  // ─────────────────────────────────────────────────
  test.describe('Mouse Over', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/mouse-over.html`);
    });

    test('should display the mouse over heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Mouse over' })).toBeVisible();
    });

    test('should display all four images', async ({ page }) => {
      const images = page.locator('.figure img');
      await expect(images).toHaveCount(4);
    });

    test('should reveal image captions on hover', async ({ page }) => {
      const figures = page.locator('.figure');
      const expectedCaptions = ['Compass', 'Calendar', 'Award', 'Landscape'];

      for (let i = 0; i < expectedCaptions.length; i++) {
        const figure = figures.nth(i);
        // Hover over the image to reveal the caption
        await figure.locator('img').hover();
        await expect(figure.getByText(expectedCaptions[i])).toBeVisible();
      }
    });

    test('should verify image sources are correct', async ({ page }) => {
      await expect(page.locator('img[src="img/compass.png"]')).toBeVisible();
      await expect(page.locator('img[src="img/calendar.png"]')).toBeVisible();
      await expect(page.locator('img[src="img/award.png"]')).toBeVisible();
      await expect(page.locator('img[src="img/landscape.png"]')).toBeVisible();
    });

    test('should verify images are loaded successfully', async ({ page }) => {
      const images = page.locator('.figure img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const image = images.nth(i);
        const naturalWidth = await image.evaluate((el: HTMLImageElement) => el.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);
      }
    });

    test('should have all captions hidden before hover', async ({ page }) => {
      const captions = page.locator('.figure .caption');
      const count = await captions.count();
      expect(count).toBe(4);

      for (let i = 0; i < count; i++) {
        await expect(captions.nth(i)).toBeHidden();
      }
    });

    test('should hide caption when mouse leaves the image', async ({ page }) => {
      const figure = page.locator('.figure').first();
      const caption = figure.locator('.caption');

      // Initially hidden
      await expect(caption).toBeHidden();

      // Hover to reveal
      await figure.locator('img').hover();
      await expect(caption).toBeVisible();

      // Move mouse away (hover on heading to leave the figure area)
      await page.getByRole('heading', { name: 'Mouse over' }).hover();
      await expect(caption).toBeHidden();
    });
  });

  // ─────────────────────────────────────────────────
  //  5. Drag and Drop
  // ─────────────────────────────────────────────────
  test.describe('Drag and Drop', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/drag-and-drop.html`);
    });

    test('should display the drag and drop heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Drag and drop' })).toBeVisible();
    });

    test('should display the draggable panel', async ({ page }) => {
      const draggable = page.locator('#draggable');
      await expect(draggable).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Draggable panel' })).toBeVisible();
      await expect(page.getByText('Drag me')).toBeVisible();
    });

    test('should display the drop target area', async ({ page }) => {
      const target = page.locator('#target');
      await expect(target).toBeVisible();
    });

    test('should drag element to target', async ({ page }) => {
      const draggable = page.locator('#draggable');
      const target = page.locator('#target');

      // Get initial position of draggable
      const initialBox = await draggable.boundingBox();
      expect(initialBox).not.toBeNull();

      // Perform drag and drop
      await draggable.dragTo(target);

      // Verify position has changed after drag
      const finalBox = await draggable.boundingBox();
      expect(finalBox).not.toBeNull();

      // The position should have changed (moved to the right towards target)
      expect(finalBox!.x).not.toBe(initialBox!.x);
    });

    test('should drag element using mouse actions', async ({ page }) => {
      const draggable = page.locator('#draggable');

      const box = await draggable.boundingBox();
      expect(box).not.toBeNull();

      const startX = box!.x + box!.width / 2;
      const startY = box!.y + box!.height / 2;

      // Perform manual drag using mouse
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 200, startY, { steps: 10 });
      await page.mouse.up();

      // Verify position has changed
      const newBox = await draggable.boundingBox();
      expect(newBox).not.toBeNull();
      expect(newBox!.x).toBeGreaterThan(box!.x);
    });
  });

  // ─────────────────────────────────────────────────
  //  6. Draw in Canvas
  // ─────────────────────────────────────────────────
  test.describe('Draw in Canvas', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/draw-in-canvas.html`);
    });

    test('should display the drawing in canvas heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Drawing in canvas' })).toBeVisible();
      await expect(page.getByText('Click to draw.')).toBeVisible();
    });

    test('should verify canvas element exists', async ({ page }) => {
      const canvas = page.locator('#my-canvas');
      await expect(canvas).toBeVisible();
      await expect(canvas).toHaveAttribute('id', 'my-canvas');
    });

    test('should draw on canvas by clicking', async ({ page }) => {
      const canvas = page.locator('#my-canvas');
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();

      // Get pixel data before drawing
      const pixelsBefore = await page.evaluate(() => {
        const c = document.getElementById('my-canvas') as HTMLCanvasElement;
        const ctx = c.getContext('2d')!;
        return ctx.getImageData(0, 0, c.width, c.height).data.some((v, i) => i % 4 === 3 && v > 0);
      });
      expect(pixelsBefore).toBe(false);

      // Click in the center of canvas to draw
      await canvas.click({
        position: { x: box!.width / 2, y: box!.height / 2 },
      });

      // Verify pixels were drawn
      const pixelsAfter = await page.evaluate(() => {
        const c = document.getElementById('my-canvas') as HTMLCanvasElement;
        const ctx = c.getContext('2d')!;
        return ctx.getImageData(0, 0, c.width, c.height).data.some((v, i) => i % 4 === 3 && v > 0);
      });
      expect(pixelsAfter).toBe(true);
    });

    test('should draw a line on canvas by dragging', async ({ page }) => {
      const canvas = page.locator('#my-canvas');
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();

      const startX = box!.x + 50;
      const startY = box!.y + 50;
      const endX = box!.x + 200;
      const endY = box!.y + 100;

      // Draw by clicking and dragging
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(endX, endY, { steps: 20 });
      await page.mouse.up();

      // Verify non-transparent pixels exist after drawing
      const hasDrawnPixels = await page.evaluate(() => {
        const c = document.getElementById('my-canvas') as HTMLCanvasElement;
        const ctx = c.getContext('2d')!;
        return ctx.getImageData(0, 0, c.width, c.height).data.some((v, i) => i % 4 === 3 && v > 0);
      });
      expect(hasDrawnPixels).toBe(true);
    });

    test('should draw multiple shapes on canvas', async ({ page }) => {
      const canvas = page.locator('#my-canvas');
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();

      // Draw a triangle by clicking three points
      const points = [
        { x: box!.x + 100, y: box!.y + 20 },
        { x: box!.x + 50, y: box!.y + 120 },
        { x: box!.x + 150, y: box!.y + 120 },
      ];

      for (const point of points) {
        await page.mouse.click(point.x, point.y);
      }

      const countAfterClicks = await page.evaluate(() => {
        const c = document.getElementById('my-canvas') as HTMLCanvasElement;
        const ctx = c.getContext('2d')!;
        const data = ctx.getImageData(0, 0, c.width, c.height).data;
        let count = 0;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 0) count++;
        }
        return count;
      });

      // Draw a line
      await page.mouse.move(box!.x + 200, box!.y + 30);
      await page.mouse.down();
      await page.mouse.move(box!.x + 350, box!.y + 130, { steps: 15 });
      await page.mouse.up();

      // Verify more pixels were drawn after the line
      const countAfterLine = await page.evaluate(() => {
        const c = document.getElementById('my-canvas') as HTMLCanvasElement;
        const ctx = c.getContext('2d')!;
        const data = ctx.getImageData(0, 0, c.width, c.height).data;
        let count = 0;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 0) count++;
        }
        return count;
      });
      expect(countAfterLine).toBeGreaterThan(countAfterClicks);
    });

    test('should verify canvas dimensions', async ({ page }) => {
      const canvas = page.locator('#my-canvas');
      const width = await canvas.getAttribute('width');
      expect(Number(width)).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────────
  //  7. Loading Images
  // ─────────────────────────────────────────────────
  test.describe('Loading Images', () => {
    test('should display loading message initially', async ({ page }) => {
      await page.goto(`${BASE_URL}/loading-images.html`);
      // The spinner should be visible initially
      const spinner = page.locator('#spinner');
      await expect(spinner).toBeVisible();
    });

    test('should show "Done!" text after all images load', async ({ page }) => {
      await page.goto(`${BASE_URL}/loading-images.html`);

      // Wait for the text to change to "Done!" (images load at 2s intervals, last at 8s)
      await expect(page.locator('#text')).toHaveText('Done!', { timeout: 15000 });
    });

    test('should load compass image first', async ({ page }) => {
      await page.goto(`${BASE_URL}/loading-images.html`);

      // Compass image should appear quickly (within ~2s)
      const compassImg = page.locator('#compass');
      await expect(compassImg).toBeVisible({ timeout: 5000 });
      await expect(compassImg).toHaveAttribute('alt', 'compass');
    });

    test('should load all four images with correct attributes after waiting', async ({ page }) => {
      test.setTimeout(20000);
      await page.goto(`${BASE_URL}/loading-images.html`);

      // Wait for all images to load (last image appears at ~8s)
      await expect(page.locator('#text')).toHaveText('Done!', { timeout: 15000 });

      // Verify all 4 images are present with correct alt and src attributes
      const images = [
        { id: '#compass', alt: 'compass', src: 'img/compass.png' },
        { id: '#calendar', alt: 'calendar', src: 'img/calendar.png' },
        { id: '#award', alt: 'award', src: 'img/award.png' },
        { id: '#landscape', alt: 'landscape', src: 'img/landscape.png' },
      ];

      for (const img of images) {
        await expect(page.locator(img.id)).toBeVisible();
        await expect(page.locator(img.id)).toHaveAttribute('alt', img.alt);
        await expect(page.locator(img.id)).toHaveAttribute('src', img.src);
      }
    });

    test('should verify images appear in correct order', async ({ page }) => {
      test.setTimeout(20000);
      await page.goto(`${BASE_URL}/loading-images.html`);

      // First image should appear within ~2s
      await expect(page.locator('#compass')).toBeVisible({ timeout: 5000 });

      // Second image should appear around ~4s
      await expect(page.locator('#calendar')).toBeVisible({ timeout: 5000 });

      // Third image around ~6s
      await expect(page.locator('#award')).toBeVisible({ timeout: 5000 });

      // Fourth image around ~8s
      await expect(page.locator('#landscape')).toBeVisible({ timeout: 5000 });
    });

    test('should verify spinner disappears after loading', async ({ page }) => {
      test.setTimeout(20000);
      await page.goto(`${BASE_URL}/loading-images.html`);

      // Wait for done text which replaces the spinner
      await expect(page.locator('#text')).toHaveText('Done!', { timeout: 15000 });

      // Spinner should no longer exist (the innerHTML is replaced)
      await expect(page.locator('#spinner')).toHaveCount(0);
    });
  });

  // ─────────────────────────────────────────────────
  //  8. Slow Calculator
  // ─────────────────────────────────────────────────
  test.describe('Slow Calculator', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/slow-calculator.html`);
    });

    test('should display the slow calculator heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Slow calculator' })).toBeVisible();
    });

    test('should verify default delay is 5 seconds', async ({ page }) => {
      const delayInput = page.locator('#delay');
      await expect(delayInput).toHaveValue('5');
    });

    test('should verify all calculator buttons are present', async ({ page }) => {
      // Number buttons
      for (let i = 0; i <= 9; i++) {
        await expect(page.locator(`#calculator .keys >> text="${i}"`)).toBeVisible();
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

    test('should perform addition (1 + 3 = 4) with reduced delay', async ({ page }) => {
      test.setTimeout(15000);
      await page.locator('#delay').fill('1');

      await pressCalcKeys(page, '1', '+', '3', '=');
      await expect(page.locator('#calculator .screen')).toHaveText('4', { timeout: 10000 });
    });

    test('should perform subtraction (9 - 4 = 5) with reduced delay', async ({ page }) => {
      test.setTimeout(15000);
      await page.locator('#delay').fill('1');

      await pressCalcKeys(page, '9', '-', '4', '=');
      await expect(page.locator('#calculator .screen')).toHaveText('5', { timeout: 10000 });
    });

    test('should perform multiplication (6 x 7 = 42) with reduced delay', async ({ page }) => {
      test.setTimeout(15000);
      await page.locator('#delay').fill('1');

      await pressCalcKeys(page, '6', 'x', '7', '=');
      await expect(page.locator('#calculator .screen')).toHaveText('42', { timeout: 10000 });
    });

    test('should perform division (8 ÷ 2 = 4) with reduced delay', async ({ page }) => {
      test.setTimeout(15000);
      await page.locator('#delay').fill('1');

      await pressCalcKeys(page, '8', '÷', '2', '=');
      await expect(page.locator('#calculator .screen')).toHaveText('4', { timeout: 10000 });
    });

    test('should clear calculator display', async ({ page }) => {
      await pressCalcKeys(page, '5', '3');
      await expect(page.locator('#calculator .screen')).toHaveText('53');

      await pressCalcKeys(page, 'C');
      await expect(page.locator('#calculator .screen')).toHaveText('');
    });

    test('should handle decimal numbers with reduced delay', async ({ page }) => {
      test.setTimeout(15000);
      await page.locator('#delay').fill('1');

      await pressCalcKeys(page, '2', '.', '5', '+', '1', '.', '5', '=');
      await expect(page.locator('#calculator .screen')).toHaveText('4', { timeout: 10000 });
    });

    test('should show spinner while calculating', async ({ page }) => {
      test.setTimeout(15000);

      // Keep default 5-second delay so spinner is visible
      await pressCalcKeys(page, '1', '+', '1', '=');

      const spinner = page.locator('#spinner');
      await expect(spinner).toBeVisible();

      await expect(page.locator('#calculator .screen')).toHaveText('2', { timeout: 10000 });
    });

    test('should change the delay value', async ({ page }) => {
      const delayInput = page.locator('#delay');
      await delayInput.fill('2');
      await expect(delayInput).toHaveValue('2');
    });

    test('should perform chained calculation with reduced delay', async ({ page }) => {
      test.setTimeout(15000);
      await page.locator('#delay').fill('1');

      await pressCalcKeys(page, '1', '+', '2', '=');
      await expect(page.locator('#calculator .screen')).toHaveText('3', { timeout: 10000 });
    });

    test('should handle division by zero with reduced delay', async ({ page }) => {
      test.setTimeout(15000);
      await page.locator('#delay').fill('1');

      await pressCalcKeys(page, '5', '÷', '0', '=');
      await expect(page.locator('#calculator .screen')).toHaveText('Infinity', { timeout: 10000 });
    });

    test('should hide spinner after calculation completes', async ({ page }) => {
      test.setTimeout(15000);
      await page.locator('#delay').fill('1');

      await pressCalcKeys(page, '3', '+', '4', '=');

      const spinner = page.locator('#spinner');
      await expect(spinner).toBeVisible();

      await expect(page.locator('#calculator .screen')).toHaveText('7', { timeout: 10000 });
      await expect(spinner).toBeHidden();
    });
  });

  // ─────────────────────────────────────────────────
  //  Cross-page: Index Page Links
  // ─────────────────────────────────────────────────
  test.describe('Index Page - Chapter 3 Links', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/index.html`);
    });

    test('should display the Chapter 3 section heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Chapter 3. WebDriver Fundamentals' })).toBeVisible();
    });

    test('should have all Chapter 3 links', async ({ page }) => {
      const chapter3Links = ['Web form', 'Navigation', 'Dropdown menu', 'Mouse over', 'Drag and drop', 'Draw in canvas', 'Loading images', 'Slow calculator'];

      for (const linkText of chapter3Links) {
        await expect(page.getByRole('link', { name: linkText })).toBeVisible();
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
        await page.goto(`${BASE_URL}/index.html`);
        await page.getByRole('link', { name: pageInfo.name }).click();
        await expect(page).toHaveURL(new RegExp(pageInfo.url));
        await expect(page.getByRole('heading', { name: pageInfo.heading })).toBeVisible();
      }
    });
  });
});
