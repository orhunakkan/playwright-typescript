import { Page, Locator } from '@playwright/test';

export class BrowserEventsPage {
  private readonly page: Page;

  // ── Native Dialogs ────────────────────────────────────────
  readonly triggerAlertButton: Locator;
  readonly triggerConfirmButton: Locator;
  readonly triggerPromptButton: Locator;
  // Injected after first dialog trigger: role="status" aria-live="polite"
  readonly dialogResult: Locator;

  // ── File Upload ───────────────────────────────────────────
  // Hidden via sr-only; setInputFiles() works without visibility
  readonly fileInput: Locator;
  readonly chooseFileLabel: Locator;
  readonly uploadViaButton: Locator;
  readonly uploadStatus: Locator;

  // ── File Download ─────────────────────────────────────────
  // download attribute is "stagecraft-sample.txt" (not "sample.txt" as stated in AC-5)
  readonly downloadLink: Locator;

  // ── Navigation Event ──────────────────────────────────────
  readonly navigateToHomeLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // ── Native Dialogs ────────────────────────────────────────
    this.triggerAlertButton = page.getByRole('button', { name: 'Trigger alert' });
    this.triggerConfirmButton = page.getByRole('button', { name: 'Trigger confirm' });
    this.triggerPromptButton = page.getByRole('button', { name: 'Trigger prompt' });
    this.dialogResult = page.getByRole('status');

    // ── File Upload ───────────────────────────────────────────
    this.fileInput = page.locator('#file-upload');
    this.chooseFileLabel = page.locator('label[for="file-upload"]');
    this.uploadViaButton = page.getByRole('button', { name: 'Upload via button' });
    this.uploadStatus = page.locator('section[aria-labelledby="upload-heading"]').locator('p.mt-3');

    // ── File Download ─────────────────────────────────────────
    this.downloadLink = page.getByRole('link', { name: 'Download sample.txt' });

    // ── Navigation Event ──────────────────────────────────────
    this.navigateToHomeLink = page.getByRole('link', { name: 'Navigate to home' });
  }

  async goto() {
    await this.page.goto('/practice/browser-events');
  }
}
