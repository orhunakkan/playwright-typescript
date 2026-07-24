import { Locator, Page } from '@playwright/test';

export class AuditLogSearchPage {
  // ── Filters ───────────────────────────────────────────────────────────
  readonly usernameInput: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly searchButton: Locator;

  // ── Results ───────────────────────────────────────────────────────────
  readonly auditLogEntries: Locator;
  readonly auditLogItems: Locator;
  readonly emptyResultsMessage: Locator;
  readonly pageSummary: Locator;
  readonly previousPageButton: Locator;
  readonly nextPageButton: Locator;

  // ── Actions & feedback ────────────────────────────────────────────────
  readonly reseedButton: Locator;
  readonly alertMessage: Locator;

  constructor(page: Page) {
    // ── Filters ─────────────────────────────────────────────────────────
    this.usernameInput = page.getByRole('textbox', { name: 'Username contains' });
    this.fromDateInput = page.getByRole('textbox', { name: 'From date' });
    this.toDateInput = page.getByRole('textbox', { name: 'To date' });
    this.searchButton = page.getByRole('button', { name: 'Search' });

    // ── Results ─────────────────────────────────────────────────────────
    this.auditLogEntries = page.getByRole('list', { name: 'Audit log entries' });
    this.auditLogItems = this.auditLogEntries.getByRole('listitem');
    this.emptyResultsMessage = page.getByText('No audit log entries match this search.');
    this.pageSummary = page.getByText(/Page \d+ of \d+ \(\d+ total\)/);
    this.previousPageButton = page.getByRole('button', { name: 'Prev' });
    this.nextPageButton = page.getByRole('button', { name: 'Next' });

    // ── Actions & feedback ──────────────────────────────────────────────
    this.reseedButton = page.getByRole('button', { name: 'Reseed fixture data' });
    this.alertMessage = page.getByRole('alert');
  }
}
