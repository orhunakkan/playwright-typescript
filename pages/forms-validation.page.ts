import { Page, Locator } from '@playwright/test';

export class FormsValidationPage {
  // ── Inputs ──────────────────────────────────────────────
  readonly fullNameInput: Locator;
  readonly emailAddressInput: Locator;
  readonly topicCategorySelect: Locator;
  readonly dailyRadio: Locator;
  readonly weeklyRadio: Locator;
  readonly monthlyRadio: Locator;
  readonly termsCheckbox: Locator;
  readonly profilePictureInput: Locator;

  // ── Buttons ─────────────────────────────────────────────
  readonly subscribeButton: Locator;
  readonly resetFormButton: Locator;
  readonly markCompleteButton: Locator;
  readonly darkModeToggleButton: Locator;

  // ── Validation errors ────────────────────────────────────
  readonly nameErrorMessage: Locator;
  readonly emailErrorMessage: Locator;
  readonly categoryErrorMessage: Locator;

  // ── Success ──────────────────────────────────────────────
  readonly successRegion: Locator;

  // ── Links ────────────────────────────────────────────────
  readonly homeLink: Locator;
  readonly allLabsLink: Locator;
  readonly playwrightDocsLink: Locator;

  constructor(page: Page) {
    // ── Inputs ────────────────────────────────────────────
    this.fullNameInput = page.getByRole('textbox', { name: 'Full name' });
    this.emailAddressInput = page.getByRole('textbox', { name: 'Email address' });
    this.topicCategorySelect = page.getByRole('combobox', { name: 'Topic category' });
    this.dailyRadio = page.getByRole('radio', { name: 'Daily' });
    this.weeklyRadio = page.getByRole('radio', { name: 'Weekly' });
    this.monthlyRadio = page.getByRole('radio', { name: 'Monthly' });
    this.termsCheckbox = page.getByRole('checkbox', {
      name: 'I agree to the terms and conditions',
    });
    this.profilePictureInput = page.getByLabel('Profile picture (optional)');

    // ── Buttons ───────────────────────────────────────────
    this.subscribeButton = page.getByRole('button', { name: 'Subscribe' });
    this.resetFormButton = page.getByRole('button', { name: 'Reset form' });
    this.markCompleteButton = page.getByRole('button', { name: 'Mark complete' });
    this.darkModeToggleButton = page.getByRole('button', { name: 'Toggle dark mode' });

    // ── Validation errors ──────────────────────────────────
    // Each error is a role="alert" <p> injected on blur; its id is the target of the
    // field's aria-describedby, so the id IS the accessibility contract (not a style hook).
    this.nameErrorMessage = page.locator('#name-error');
    this.emailErrorMessage = page.locator('#email-error');
    this.categoryErrorMessage = page.locator('#category-error');

    // ── Success ───────────────────────────────────────────
    // After submission the confirmation container carries role="alert"
    this.successRegion = page.getByRole('alert').filter({ hasText: 'Subscribed!' });

    // ── Links ─────────────────────────────────────────────
    this.homeLink = page.getByRole('link', { name: 'Stagecraft' });
    this.allLabsLink = page.getByRole('link', { name: '← All labs' });
    this.playwrightDocsLink = page.getByRole('link', { name: 'Playwright Docs' });
  }
}
