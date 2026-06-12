import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { FormsValidationPage } from '../../pages/forms-validation.page';

const URL = '/practice/forms-validation';

test.describe('Forms & Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // AC-1: Tests assert the Subscribe button is disabled before any fields are filled using `toBeDisabled`
  test('AC-1: Subscribe button is disabled on page load before any fields are filled', async ({ page }) => {
    const form = new FormsValidationPage(page);

    await expect(form.subscribeButton).toBeDisabled();
  });

  // AC-2: Tests trigger a validation error on a required field by focusing then blurring without input,
  // and assert the inline error message appears using a semantic locator (not a CSS class)
  test('AC-2: Blurring a required field without input shows an inline validation error via semantic locator', async ({ page }) => {
    const form = new FormsValidationPage(page);

    await form.fullNameInput.focus();
    await form.fullNameInput.blur();

    await expect(form.nameErrorMessage).toBeVisible();
    await expect(form.nameErrorMessage).toContainText('Full name must be at least 2 characters');
  });

  // AC-3: Tests use `locator.fill` for text inputs, `locator.selectOption` for the Topic Category dropdown,
  //        `locator.check` for the terms checkbox, and a radio API for Email Frequency
  test('AC-3: Correct Playwright API is used for each form control type', async ({ page }) => {
    const form = new FormsValidationPage(page);

    await form.fullNameInput.fill('Jane Doe');
    await form.emailAddressInput.fill('jane@example.com');
    await form.topicCategorySelect.selectOption('Technology');
    await form.weeklyRadio.click();
    await form.termsCheckbox.check();

    await expect(form.fullNameInput).toHaveValue('Jane Doe');
    await expect(form.emailAddressInput).toHaveValue('jane@example.com');
    await expect(form.topicCategorySelect).toHaveValue('technology');
    await expect(form.weeklyRadio).toBeChecked();
    await expect(form.termsCheckbox).toBeChecked();
  });

  // AC-4: Tests assert each field's current value using `toHaveValue` after interaction
  test('AC-4: toHaveValue reflects the typed or selected value of each field after interaction', async ({ page }) => {
    const form = new FormsValidationPage(page);

    await form.fullNameInput.fill('Alex Smith');
    await expect(form.fullNameInput).toHaveValue('Alex Smith');

    await form.emailAddressInput.fill('alex@example.com');
    await expect(form.emailAddressInput).toHaveValue('alex@example.com');

    await form.topicCategorySelect.selectOption('Design');
    await expect(form.topicCategorySelect).toHaveValue('design');
  });

  // AC-5: Tests fill all required fields with valid data and assert the Subscribe button transitions
  //        to enabled before clicking
  test('AC-5: Subscribe button becomes enabled after all required fields are filled with valid data', async ({ page }) => {
    const form = new FormsValidationPage(page);

    await expect(form.subscribeButton).toBeDisabled();

    await form.fullNameInput.fill('Jane Doe');
    await form.emailAddressInput.fill('jane@example.com');
    await form.topicCategorySelect.selectOption('Technology');
    await form.weeklyRadio.click();
    await form.termsCheckbox.check();

    await expect(form.subscribeButton).toBeEnabled();
  });

  // AC-6: Tests submit the form and assert the success confirmation region is visible using a semantic role locator
  test('AC-6: Submitting the form with valid data shows the success confirmation region', async ({ page }) => {
    const form = new FormsValidationPage(page);

    await form.fullNameInput.fill('Jane Doe');
    await form.emailAddressInput.fill('jane@example.com');
    await form.topicCategorySelect.selectOption('Technology');
    await form.weeklyRadio.click();
    await form.termsCheckbox.check();
    await form.subscribeButton.click();

    await expect(form.successRegion).toBeVisible();
  });

  // AC-7: Tests assert the `aria-invalid` attribute is present on a field after a validation error is triggered
  test('AC-7: aria-invalid is set to true on a field after a validation error is triggered', async ({ page }) => {
    const form = new FormsValidationPage(page);

    await form.fullNameInput.focus();
    await form.fullNameInput.blur();

    await expect(form.fullNameInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('accessibility: no WCAG 2.x axe violations on page load', async ({ page }) => {
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

    expect(results.violations).toEqual([]);
  });
});
