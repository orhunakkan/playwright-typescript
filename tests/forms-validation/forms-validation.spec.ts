import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';
import { faker } from '@faker-js/faker';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-13 — Forms & Validation

const URL = '/practice/forms-validation';

// ─── Test data (Phase 4b) ───────────────────────────────────────────────────
// Valid values are generated with faker; invalid/boundary values are fixed tables.
const validName = faker.person.fullName();
const validEmail = faker.internet.email();

// Fields that gate the Subscribe button — verified against the live form: name,
// email, topic, a frequency choice, and the terms checkbox are all required.
const gatingFields = ['name', 'email', 'topic', 'frequency', 'terms'] as const;

// Invalid emails that the form's validator rejects (verified against the live page).
const invalidEmails = [
  { value: 'not-an-email', label: 'no @ sign' },
  { value: 'a@b', label: 'no TLD' },
  { value: 'jane@', label: 'no domain' },
  { value: '@example.com', label: 'no local part' },
  { value: 'jane doe@example.com', label: 'contains a space' },
];

const topicOptions = ['technology', 'design', 'business', 'science'];

test.describe('Forms & Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // AC-1: Tests assert the Subscribe button is disabled before any fields are filled using `toBeDisabled`
  test.describe('AC-1 — Subscribe disabled until requirements are met', () => {
    test('positive: disabled on initial load with no fields filled', async ({ formsValidationPage }) => {
      await expect(formsValidationPage.subscribeButton).toBeDisabled();
    });

    test('negative: still disabled when only the optional frequency is chosen', async ({ formsValidationPage }) => {
      await formsValidationPage.weeklyRadio.check();
      await expect(formsValidationPage.subscribeButton).toBeDisabled();
    });
  });

  // AC-2: Trigger a validation error on a required field by focusing then blurring without input,
  //        and assert the inline error message appears using a semantic locator (not a CSS class)
  test.describe('AC-2 — inline validation errors on blur', () => {
    test('negative: empty full name shows an inline error announced as role=alert', async ({ formsValidationPage }) => {
      await formsValidationPage.fullNameInput.focus();
      await formsValidationPage.fullNameInput.blur();

      await expect(formsValidationPage.nameErrorMessage).toBeVisible();
      await expect(formsValidationPage.nameErrorMessage).toHaveRole('alert');
      await expect(formsValidationPage.nameErrorMessage).toContainText('Full name must be at least 2 characters');
    });

    test('boundary: 1 character is rejected, 2 characters is accepted', async ({ formsValidationPage }) => {
      // N-1 (below the "at least 2 characters" boundary) → error
      await formsValidationPage.fullNameInput.fill('A');
      await formsValidationPage.fullNameInput.blur();
      await expect(formsValidationPage.nameErrorMessage).toBeVisible();

      // N (on the boundary) → error clears
      await formsValidationPage.fullNameInput.fill('Jo');
      await formsValidationPage.fullNameInput.blur();
      await expect(formsValidationPage.nameErrorMessage).toBeHidden();
    });

    for (const { value, label } of invalidEmails) {
      test(`negative: rejects malformed email (${label})`, async ({ formsValidationPage }) => {
        await formsValidationPage.emailAddressInput.fill(value);
        await formsValidationPage.emailAddressInput.blur();

        await expect(formsValidationPage.emailErrorMessage).toBeVisible();
        await expect(formsValidationPage.emailErrorMessage).toContainText('Enter a valid email address');
      });
    }

    test('negative: leaving the category unselected shows the category error', async ({ formsValidationPage }) => {
      await formsValidationPage.topicCategorySelect.focus();
      await formsValidationPage.topicCategorySelect.blur();

      await expect(formsValidationPage.categoryErrorMessage).toBeVisible();
      await expect(formsValidationPage.categoryErrorMessage).toContainText('Please select a category');
    });

    test('positive: a valid full name produces no error', async ({ formsValidationPage }) => {
      await formsValidationPage.fullNameInput.fill(validName);
      await formsValidationPage.fullNameInput.blur();

      await expect(formsValidationPage.nameErrorMessage).toBeHidden();
    });
  });

  // AC-3: Use `fill` for text inputs, `selectOption` for the dropdown, `check` for the
  //        terms checkbox, and the radio API for Email Frequency
  test.describe('AC-3 — correct Playwright API per control type', () => {
    test('positive: each control is driven by its matching API and reflects state', async ({ formsValidationPage }) => {
      await formsValidationPage.fullNameInput.fill(validName);
      await formsValidationPage.emailAddressInput.fill(validEmail);
      await formsValidationPage.topicCategorySelect.selectOption('technology');
      await formsValidationPage.weeklyRadio.check();
      await formsValidationPage.termsCheckbox.check();

      await expect(formsValidationPage.fullNameInput).toHaveValue(validName);
      await expect(formsValidationPage.emailAddressInput).toHaveValue(validEmail);
      await expect(formsValidationPage.topicCategorySelect).toHaveValue('technology');
      await expect(formsValidationPage.weeklyRadio).toBeChecked();
      await expect(formsValidationPage.termsCheckbox).toBeChecked();
    });
  });

  // AC-4: Assert each field's current value using `toHaveValue` after interaction
  test.describe('AC-4 — toHaveValue reflects each field after interaction', () => {
    test('positive: text inputs echo the typed value', async ({ formsValidationPage }) => {
      await formsValidationPage.fullNameInput.fill(validName);
      await expect(formsValidationPage.fullNameInput).toHaveValue(validName);

      await formsValidationPage.emailAddressInput.fill(validEmail);
      await expect(formsValidationPage.emailAddressInput).toHaveValue(validEmail);
    });

    for (const option of topicOptions) {
      test(`positive: selecting "${option}" is reflected by toHaveValue`, async ({ formsValidationPage }) => {
        await formsValidationPage.topicCategorySelect.selectOption(option);
        await expect(formsValidationPage.topicCategorySelect).toHaveValue(option);
      });
    }
  });

  // AC-5: Fill all required fields with valid data and assert the Subscribe button
  //        transitions to enabled before clicking
  test.describe('AC-5 — Subscribe enables only when all required fields are valid', () => {
    test('positive: enabled after every required field is filled with valid data', async ({ formsValidationPage }) => {
      await expect(formsValidationPage.subscribeButton).toBeDisabled();
      await formsValidationPage.fillGatingFields(validName, validEmail);
      await expect(formsValidationPage.subscribeButton).toBeEnabled();
    });

    for (const field of gatingFields) {
      test(`negative: stays disabled when "${field}" is missing`, async ({ formsValidationPage }) => {
        await formsValidationPage.fillGatingFields(validName, validEmail, field);
        await expect(formsValidationPage.subscribeButton).toBeDisabled();
      });
    }

    test('negative: re-disables after a required field is cleared', async ({ formsValidationPage }) => {
      await formsValidationPage.fillGatingFields(validName, validEmail);
      await expect(formsValidationPage.subscribeButton).toBeEnabled();

      await formsValidationPage.fullNameInput.fill('');
      await expect(formsValidationPage.subscribeButton).toBeDisabled();
    });
  });

  // AC-6: Submit the form and assert the success confirmation region is visible using a semantic role locator
  test.describe('AC-6 — successful submission confirmation', () => {
    test('negative: success region is not present before submitting', async ({ formsValidationPage }) => {
      await formsValidationPage.fillGatingFields(validName, validEmail);
      await expect(formsValidationPage.successRegion).toBeHidden();
    });

    test('positive: submitting valid data shows a personalized success region', async ({ formsValidationPage }) => {
      await formsValidationPage.submitValidForm(validName, validEmail);

      await expect(formsValidationPage.successRegion).toBeVisible();
      await expect(formsValidationPage.successRegion).toContainText(validName);
    });

    test('positive: Reset form returns the form to its initial empty state', async ({ formsValidationPage }) => {
      await formsValidationPage.submitValidForm(validName, validEmail);
      await expect(formsValidationPage.successRegion).toBeVisible();

      await formsValidationPage.resetFormButton.click();

      await expect(formsValidationPage.fullNameInput).toHaveValue('');
      await expect(formsValidationPage.subscribeButton).toBeDisabled();
    });
  });

  // AC-7: Assert the `aria-invalid` attribute is present on a field after a validation error is triggered
  test.describe('AC-7 — aria-invalid reflects field validity', () => {
    test('negative: aria-invalid becomes true after a validation error', async ({ formsValidationPage }) => {
      await formsValidationPage.fullNameInput.focus();
      await formsValidationPage.fullNameInput.blur();

      await expect(formsValidationPage.fullNameInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('positive: aria-invalid is false for a valid field', async ({ formsValidationPage }) => {
      await formsValidationPage.fullNameInput.fill(validName);
      await formsValidationPage.fullNameInput.blur();

      await expect(formsValidationPage.fullNameInput).toHaveAttribute('aria-invalid', 'false');
    });

    test('a11y contract: an invalid field links to its error via aria-describedby', async ({ formsValidationPage }) => {
      await formsValidationPage.fullNameInput.focus();
      await formsValidationPage.fullNameInput.blur();

      await expect(formsValidationPage.fullNameInput).toHaveAttribute('aria-describedby', 'name-error');
      await expect(formsValidationPage.nameErrorMessage).toHaveAttribute('id', 'name-error');
    });
  });

  // Optional controls present on the page but not covered by a dedicated AC.
  test.describe('Optional controls', () => {
    test('profile picture (optional) accepts a file without gating submission', async ({ formsValidationPage }) => {
      await formsValidationPage.profilePictureInput.setInputFiles({
        name: 'avatar.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-png-bytes'),
      });

      await expect(formsValidationPage.profilePictureInput).toHaveValue(/avatar\.png$/);
      // Optional field alone must not enable the form.
      await expect(formsValidationPage.subscribeButton).toBeDisabled();
    });
  });

  // Accessibility — scan the page on load AND in each rendered state (Phase 4.1).
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial page load', async ({ page }) => {
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations while validation errors are displayed', async ({ page, formsValidationPage }) => {
      await formsValidationPage.fullNameInput.focus();
      await formsValidationPage.fullNameInput.blur();
      await formsValidationPage.emailAddressInput.fill('not-an-email');
      await formsValidationPage.emailAddressInput.blur();
      await expect(formsValidationPage.nameErrorMessage).toBeVisible();

      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });

    test('no NEW violations on the success state (one contrast defect is tracked)', async ({ page, formsValidationPage }) => {
      await formsValidationPage.submitValidForm(validName, validEmail);
      await expect(formsValidationPage.successRegion).toBeVisible();

      const results = await scanWcag(page);
      // KNOWN DEFECT (found by this multi-state scan, missed by the load-only scan):
      // the success banner text (#009966 on #ecfdf5, 14px) is 3.46:1 — below WCAG 2 AA 4.5:1.
      // Tracked as a real accessibility bug; excluded so it doesn't mask regressions elsewhere.
      // See docs/rtm/forms-validation.rtm.md (DEFECT row). Remove this filter once the app fixes it.
      const unexpected = results.violations.filter((v) => v.id !== 'color-contrast');
      expect(unexpected).toEqual([]);
    });
  });

  // Non-functional — performance budget on initial load (Phase 5b).
  test.describe('performance @performance', () => {
    test('initial load is within budget', async ({ page }) => {
      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
      });
      // Generous budgets so they don't flake against the live site; tighten in a controlled env.
      expect(timing.domContentLoaded).toBeLessThan(6000);
      expect(timing.load).toBeLessThan(12000);
    });
  });
});
