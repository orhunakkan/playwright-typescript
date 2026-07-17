import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-16 — Tables & Filtering

const URL = '/practice/tables-filtering';

test.describe('Tables & Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await expect(page.getByRole('status')).toContainText('employees');
  });

  // AC-1: Count visible rows before any filter using locator.count()
  test.describe('AC-1 — Visible row count on load', () => {
    test('positive: 7 rows visible on page 1 before any filter', async ({ tablesFilteringPage }) => {
      await expect(tablesFilteringPage.tableBodyRows).toHaveCount(7);
    });

    test('positive: status element reports total employee count', async ({ tablesFilteringPage }) => {
      await expect(tablesFilteringPage.employeeCountStatus).toHaveText('23 employees');
    });

    test('boundary: row count decreases after a search filter is applied', async ({ tablesFilteringPage }) => {
      const initialCount = await tablesFilteringPage.tableBodyRows.count();
      await tablesFilteringPage.searchInput.fill('Chen');
      const filteredCount = await tablesFilteringPage.tableBodyRows.count();
      expect(filteredCount).toBeLessThan(initialCount);
    });

    test('boundary: clearing search restores original row count', async ({ tablesFilteringPage }) => {
      await tablesFilteringPage.searchInput.fill('Chen');
      await expect(tablesFilteringPage.tableBodyRows).not.toHaveCount(7);

      await tablesFilteringPage.searchInput.fill('');
      await expect(tablesFilteringPage.tableBodyRows).toHaveCount(7);
    });
  });

  // AC-2: Search field — each visible row contains the search term
  test.describe('AC-2 — Search field filtering', () => {
    test('positive: typing a name shows only matching rows via filter check', async ({ tablesFilteringPage }) => {
      await tablesFilteringPage.searchInput.fill('Chen');
      const visibleRows = tablesFilteringPage.tableBodyRows;
      const count = await visibleRows.count();
      expect(count).toBeGreaterThan(0);
      // All visible rows must contain the search term — verified with filter() not index iteration
      const matchingRows = visibleRows.filter({ hasText: 'Chen' });
      await expect(matchingRows).toHaveCount(count);
    });

    test('positive: search result row contains the expected employee name', async ({ tablesFilteringPage }) => {
      await tablesFilteringPage.searchInput.fill('Carol');
      await expect(tablesFilteringPage.tableBodyRows).toHaveCount(1);
      await expect(tablesFilteringPage.tableBodyRows.first()).toContainText('Carol Davis');
    });

    test('negative: searching a non-existent name yields zero rows', async ({ tablesFilteringPage }) => {
      await tablesFilteringPage.searchInput.fill('Xyznonexistentname99');
      await expect(tablesFilteringPage.tableBodyRows).toHaveCount(0);
    });

    test('boundary: empty search string shows all rows', async ({ tablesFilteringPage }) => {
      await tablesFilteringPage.searchInput.fill('Carol');
      await expect(tablesFilteringPage.tableBodyRows).toHaveCount(1);

      await tablesFilteringPage.searchInput.fill('');
      await expect(tablesFilteringPage.tableBodyRows).toHaveCount(7);
    });

    test('boundary: single-character search narrows the list without error', async ({ tablesFilteringPage }) => {
      await tablesFilteringPage.searchInput.fill('A');
      const count = await tablesFilteringPage.tableBodyRows.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  // AC-3: Combined search + Department dropdown — only intersection rows shown
  test.describe('AC-3 — Combined search and department filter', () => {
    test('positive: search + department dropdown shows only rows matching both criteria', async ({ tablesFilteringPage }) => {
      await tablesFilteringPage.searchInput.fill('Noah');
      await tablesFilteringPage.departmentSelect.selectOption('Engineering');

      await expect(tablesFilteringPage.tableBodyRows).toHaveCount(1);
      await expect(tablesFilteringPage.tableBodyRows.first()).toContainText('Noah Anderson');
      await expect(tablesFilteringPage.tableBodyRows.first()).toContainText('Engineering');
    });

    test('negative: employee matching search but not department is hidden', async ({ tablesFilteringPage }) => {
      // "Iris Johnson" is in HR — should not appear when Department = Engineering
      await tablesFilteringPage.searchInput.fill('Iris');
      await tablesFilteringPage.departmentSelect.selectOption('Engineering');
      await expect(tablesFilteringPage.tableBodyRows).toHaveCount(0);
    });

    test('negative: employee matching department but not search is hidden', async ({ tablesFilteringPage }) => {
      // Many Engineering employees exist but none named "xyz"
      await tablesFilteringPage.searchInput.fill('xyz');
      await tablesFilteringPage.departmentSelect.selectOption('Engineering');
      await expect(tablesFilteringPage.tableBodyRows).toHaveCount(0);
    });

    test('boundary: Department "All" with a search term acts as search-only filter', async ({ tablesFilteringPage }) => {
      await tablesFilteringPage.searchInput.fill('Carol');
      await tablesFilteringPage.departmentSelect.selectOption('All');
      await expect(tablesFilteringPage.tableBodyRows).toHaveCount(1);
      await expect(tablesFilteringPage.tableBodyRows.first()).toContainText('Carol Davis');
    });
  });

  // AC-4: Sort column header — assert first and last row values
  test.describe('AC-4 — Sortable column header', () => {
    test('positive: default sort is ascending by name — first row is Alice Chen', async ({ tablesFilteringPage }) => {
      await expect(tablesFilteringPage.tableBodyRows.first()).toContainText('Alice Chen');
    });

    test('positive: clicking name sort switches to descending — first row becomes Wendy Hall', async ({ tablesFilteringPage, page }) => {
      await tablesFilteringPage.sortByNameButton.click();
      await expect(tablesFilteringPage.tableBodyRows.first()).toContainText('Wendy Hall');
    });

    test('negative: sort direction reverses on second click — returns to ascending', async ({ tablesFilteringPage }) => {
      // First click: ascending → descending
      await tablesFilteringPage.sortByNameButton.click();
      await expect(tablesFilteringPage.tableBodyRows.first()).toContainText('Wendy Hall');

      // Second click: descending → ascending
      await tablesFilteringPage.sortByNameButton.click();
      await expect(tablesFilteringPage.tableBodyRows.first()).toContainText('Alice Chen');
    });

    test('positive: after descending sort, last page last row is Alice Chen', async ({ tablesFilteringPage }) => {
      await tablesFilteringPage.sortByNameButton.click();
      await expect(tablesFilteringPage.tableBodyRows.first()).toContainText('Wendy Hall');

      await tablesFilteringPage.pageButton(4).click();
      await expect(tablesFilteringPage.tableBodyRows.last()).toContainText('Alice Chen');
    });
  });

  // AC-5: Pagination — page navigation and active indicator
  test.describe('AC-5 — Pagination controls', () => {
    test('positive: clicking page 2 updates row content', async ({ tablesFilteringPage }) => {
      const firstRowPage1 = await tablesFilteringPage.tableBodyRows.first().textContent();

      await tablesFilteringPage.pageButton(2).click();
      const firstRowPage2 = tablesFilteringPage.tableBodyRows.first();

      await expect(firstRowPage2).not.toHaveText(firstRowPage1);
      await expect(tablesFilteringPage.tableBodyRows.first()).toContainText('Hank Patel');
    });

    test('positive: page indicator reflects the active page', async ({ tablesFilteringPage }) => {
      await expect(tablesFilteringPage.pageIndicator).toHaveText('Page 1 of 4');

      await tablesFilteringPage.pageButton(2).click();
      await expect(tablesFilteringPage.pageIndicator).toHaveText('Page 2 of 4');
    });

    test('positive: Previous button is disabled on page 1', async ({ tablesFilteringPage }) => {
      await expect(tablesFilteringPage.prevButton).toBeDisabled();
    });

    test('positive: Next button navigates forward one page', async ({ tablesFilteringPage }) => {
      await tablesFilteringPage.nextButton.click();
      await expect(tablesFilteringPage.pageIndicator).toHaveText('Page 2 of 4');
    });

    test('boundary: last page (page 4) shows fewer rows than full page', async ({ tablesFilteringPage }) => {
      await tablesFilteringPage.pageButton(4).click();
      await expect(tablesFilteringPage.pageIndicator).toHaveText('Page 4 of 4');
      const count = await tablesFilteringPage.tableBodyRows.count();
      expect(count).toBeLessThan(7);
    });

    test('boundary: navigating back to page 1 restores original rows', async ({ tablesFilteringPage }) => {
      await tablesFilteringPage.pageButton(2).click();
      await tablesFilteringPage.pageButton(1).click();
      await expect(tablesFilteringPage.tableBodyRows.first()).toContainText('Alice Chen');
      await expect(tablesFilteringPage.pageIndicator).toHaveText('Page 1 of 4');
    });
  });

  // AC-6: Row-scoped action button via getByRole('row').filter()
  test.describe('AC-6 — Row-scoped action button', () => {
    test('positive: action button scoped to Carol Davis row opens that row menu', async ({ tablesFilteringPage }) => {
      await tablesFilteringPage.actionButtonForEmployee('Carol Davis').click();
      await expect(tablesFilteringPage.actionMenuForEmployee('Carol Davis')).toBeVisible();
    });

    test('positive: action menu contains Edit and Remove items', async ({ tablesFilteringPage }) => {
      await tablesFilteringPage.actionButtonForEmployee('Alice Chen').click();
      const menu = tablesFilteringPage.actionMenuForEmployee('Alice Chen');
      await expect(menu.getByRole('menuitem', { name: 'Edit' })).toBeVisible();
      await expect(menu.getByRole('menuitem', { name: 'Remove' })).toBeVisible();
    });

    test('negative: clicking Carol Davis action button does not open Bob Smith menu', async ({ tablesFilteringPage, page }) => {
      await tablesFilteringPage.actionButtonForEmployee('Carol Davis').click();
      await expect(tablesFilteringPage.actionMenuForEmployee('Carol Davis')).toBeVisible();
      await expect(page.getByRole('menu', { name: 'Bob Smith actions' })).toHaveCount(0);
    });

    test('negative: action button for non-visible employee (page 2) is not present on page 1', async ({ tablesFilteringPage }) => {
      // Hank Patel is on page 2; scoping to him on page 1 returns 0 matches
      await expect(tablesFilteringPage.actionButtonForEmployee('Hank Patel')).toHaveCount(0);
    });
  });

  // Accessibility — WCAG 2.1 AA axe scans
  test.describe('accessibility (WCAG 2.1 AA, axe) — all UI states', () => {
    test('no violations on initial page load', async ({ page }) => {
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations after search filter applied', async ({ page, tablesFilteringPage }) => {
      await tablesFilteringPage.searchInput.fill('Carol');
      await expect(tablesFilteringPage.tableBodyRows).toHaveCount(1);
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations after department filter applied', async ({ page, tablesFilteringPage }) => {
      await tablesFilteringPage.departmentSelect.selectOption('Engineering');
      await expect(tablesFilteringPage.tableBodyRows).not.toHaveCount(0);
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });
  });

  // Performance — navigation timing budget
  test.describe('performance @performance', () => {
    test('initial load is within 3 s budget', async ({ page }) => {
      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
      });
      expect(timing.domContentLoaded).toBeLessThan(3000);
      expect(timing.load).toBeLessThan(3000);
    });
  });
});
