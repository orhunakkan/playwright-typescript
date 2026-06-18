import { Page, Locator } from '@playwright/test';

export class TablesFilteringPage {
  private readonly page: Page;

  // ── Filters ──────────────────────────────────────────────
  readonly searchInput: Locator;
  readonly departmentSelect: Locator;
  readonly employeeCountStatus: Locator;

  // ── Table ────────────────────────────────────────────────
  readonly table: Locator;
  readonly tableBodyRows: Locator;

  // ── Sort Controls ────────────────────────────────────────
  readonly sortByNameButton: Locator;
  readonly sortByDepartmentButton: Locator;
  readonly sortByStatusButton: Locator;
  readonly sortByJoinedButton: Locator;

  // ── Pagination ───────────────────────────────────────────
  readonly pagination: Locator;
  readonly pageIndicator: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // ── Filters ───────────────────────────────────────────
    this.searchInput = page.getByRole('searchbox', { name: 'Search' });
    this.departmentSelect = page.getByRole('combobox', { name: 'Department' });
    this.employeeCountStatus = page.getByRole('status');

    // ── Table ─────────────────────────────────────────────
    this.table = page.getByRole('table');
    // filter by td button to exclude the "No employees match your filters." no-results row (has td but no button)
    this.tableBodyRows = this.table.getByRole('row').filter({ has: page.locator('td button') });

    // ── Sort Controls ─────────────────────────────────────
    this.sortByNameButton = page.getByRole('button', { name: /Sort by name/ });
    this.sortByDepartmentButton = page.getByRole('button', { name: /Sort by department/ });
    this.sortByStatusButton = page.getByRole('button', { name: /Sort by status/ });
    this.sortByJoinedButton = page.getByRole('button', { name: /Sort by joined date/ });

    // ── Pagination ────────────────────────────────────────
    this.pagination = page.getByRole('navigation', { name: 'Employee table pagination' });
    this.pageIndicator = this.pagination.getByText(/Page \d+ of \d+/);
    this.prevButton = this.pagination.getByRole('button', { name: 'Previous' });
    this.nextButton = this.pagination.getByRole('button', { name: 'Next' });
  }

  async goto() {
    await this.page.goto('/practice/tables-filtering');
  }

  pageButton(number: number): Locator {
    return this.pagination.getByRole('button', { name: String(number) });
  }

  rowByEmployee(name: string): Locator {
    return this.tableBodyRows.filter({ hasText: name });
  }

  actionButtonForEmployee(name: string): Locator {
    return this.rowByEmployee(name).getByRole('button', { name: `Actions for ${name}` });
  }

  actionMenuForEmployee(name: string): Locator {
    return this.rowByEmployee(name).getByRole('menu', { name: `${name} actions` });
  }
}
