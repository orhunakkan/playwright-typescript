import { Page, Locator } from '@playwright/test';

export class BookCatalogPage {
  // ── Tabs & global controls ───────────────────────────────
  readonly authorsTab: Locator;
  readonly booksTab: Locator;
  readonly catalogTab: Locator;
  readonly resetCatalogDataButton: Locator;

  // ── Authors tab fields (rendered only while Authors is active) ──
  readonly authorsNameInput: Locator;
  readonly authorsCountrySelect: Locator;
  readonly authorsTable: Locator;
  readonly authorsRows: Locator;

  // ── Books tab fields (rendered only while Books is active) ──
  readonly booksTitleInput: Locator;
  readonly booksTable: Locator;
  readonly booksRows: Locator;

  // ── Catalog (JOIN) tab fields (rendered only while Catalog is active) ──
  readonly catalogAuthorCountrySelect: Locator;
  readonly catalogTable: Locator;
  readonly catalogRows: Locator;

  // ── Shared controls ──────────────────────────────────────
  // "Genre" is the accessible name on both Books and Catalog; "Sort by", the
  // direction toggle, Run Query, pagination and the query/result regions share
  // one accessible name across all three tabs. Only the active tab's panel is
  // rendered, so a single role-based locator always resolves to the right one.
  readonly genreSelect: Locator;
  readonly sortBySelect: Locator;
  readonly sortDirectionButton: Locator;
  readonly runQueryButton: Locator;
  readonly queryExecutedLabel: Locator;
  // No accessible name/role identifies the SQL <code> block — flagged fallback,
  // scoped as the sibling of "Query executed" rather than a bare tag selector.
  readonly queryExecutedSql: Locator;
  readonly noResultsText: Locator;
  readonly errorAlert: Locator;
  readonly loadingStatus: Locator;
  readonly pageIndicator: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    // ── Tabs & global controls ─────────────────────────────
    this.authorsTab = page.getByRole('tab', { name: 'Authors' });
    this.booksTab = page.getByRole('tab', { name: 'Books' });
    this.catalogTab = page.getByRole('tab', { name: 'Catalog (JOIN)' });
    this.resetCatalogDataButton = page.getByRole('button', { name: 'Reset catalog data' });

    // ── Authors tab fields ──────────────────────────────────
    this.authorsNameInput = page.getByRole('textbox', { name: 'Name contains' });
    this.authorsCountrySelect = page.getByRole('combobox', { name: 'Country' });
    this.authorsTable = page.getByRole('table', { name: 'authors' });
    this.authorsRows = this.authorsTable.locator('tbody tr');

    // ── Books tab fields ─────────────────────────────────────
    this.booksTitleInput = page.getByRole('textbox', { name: 'Title contains' });
    this.booksTable = page.getByRole('table', { name: 'books' });
    this.booksRows = this.booksTable.locator('tbody tr');

    // ── Catalog (JOIN) tab fields ────────────────────────────
    this.catalogAuthorCountrySelect = page.getByRole('combobox', { name: 'Author country' });
    this.catalogTable = page.getByRole('table', { name: 'catalog entries' });
    this.catalogRows = this.catalogTable.locator('tbody tr');

    // ── Shared controls ──────────────────────────────────────
    this.genreSelect = page.getByRole('combobox', { name: 'Genre' });
    this.sortBySelect = page.getByRole('combobox', { name: 'Sort by' });
    this.sortDirectionButton = page.getByRole('button', { name: /^(Ascending ↑|Descending ↓)$/ });
    this.runQueryButton = page.getByRole('button', { name: 'Run Query' });
    this.queryExecutedLabel = page.getByText('Query executed');
    this.queryExecutedSql = this.queryExecutedLabel.locator('xpath=following-sibling::code');
    this.noResultsText = page.getByText(/No (authors|books|catalog entries) match this query\./);
    this.errorAlert = page.getByRole('alert');
    this.loadingStatus = page.getByRole('status');
    this.pageIndicator = page.getByText(/Page \d+ of \d+ \(\d+ total\)/);
    this.prevButton = page.getByRole('button', { name: 'Prev' });
    this.nextButton = page.getByRole('button', { name: 'Next' });
  }
}
