import { Page, Locator } from '@playwright/test';

// Fields that gate the Subscribe button — verified against the live form.
export type GatingField = 'name' | 'email' | 'topic' | 'frequency' | 'terms';

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
  // frequency (radio group) and terms (checkbox) have NO inline error messages.
  // Their aria-required/disabled-button gating is the sole validation signal.
  // Confirmed by DOM inspection on 2026-06-12 — no role="alert" injected on blur.
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

  /** Fills every required (gating) field with valid data, optionally skipping one. */
  async fillGatingFields(name: string, email: string, skip?: GatingField): Promise<void> {
    if (skip !== 'name') await this.fullNameInput.fill(name);
    if (skip !== 'email') await this.emailAddressInput.fill(email);
    if (skip !== 'topic') await this.topicCategorySelect.selectOption('technology');
    if (skip !== 'frequency') await this.weeklyRadio.check();
    if (skip !== 'terms') await this.termsCheckbox.check();
  }

  /** Fills every required field with valid data and submits the form. */
  async submitValidForm(name: string, email: string): Promise<void> {
    await this.fillGatingFields(name, email);
    await this.subscribeButton.click();
  }
}
