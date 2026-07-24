import { test, expect } from '../../fixtures/index';
import type { Locator, APIRequestContext } from '@playwright/test';
import { scanWcag } from '../../utilities/accessibility';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-67 — Book Catalog

const URL = '/practice/book-catalog';
const RESEED_ENDPOINT = '/api/book-catalog/reseed';
const SQL_INJECTION_ATTEMPT = "' OR '1'='1' --";

// Reads a 0-based column's text from every row of a table body.
async function columnValues(rows: Locator, columnIndex: number): Promise<string[]> {
  return rows.evaluateAll((trs, idx) => trs.map((tr) => (tr.children[idx]?.textContent ?? '').trim()), columnIndex);
}

// Non-strict order check — ties are allowed in both directions, matching real seeded data.
function isSorted(values: (string | number)[], direction: 'asc' | 'desc'): boolean {
  for (let i = 1; i < values.length; i++) {
    if (direction === 'asc' && values[i] < values[i - 1]) return false;
    if (direction === 'desc' && values[i] > values[i - 1]) return false;
  }
  return true;
}

// The lab is backed by a real, shared, persistent Azure SQL database. Reseeding (and the
// serverless compute cold-starting) can transiently 503 — observed directly while mapping
// this lab — so this polls until the backend is awake and the fixture data is deterministic.
async function reseedCatalog(request: APIRequestContext): Promise<void> {
  await expect
    .poll(async () => (await request.post(RESEED_ENDPOINT)).status(), {
      message: 'waiting for /api/book-catalog/reseed to succeed past a possible cold-start 503',
      timeout: 30_000,
      intervals: [1000, 2000, 5000],
    })
    .toBe(200);
}

// Tests share one real, persistent backend rather than a per-test fixture — serial mode
// keeps the Reset-data tests (AC-8) from racing other tests' assertions in this project.
test.describe.serial('Book Catalog', () => {
  test.beforeEach(async ({ page, request }) => {
    await reseedCatalog(request);
    await page.goto(URL);
  });

  // AC-1 (TAB1-67): Tests assert the Authors tab runs its SELECT query on load with no
  // sign-in required, showing seeded rows and the literal SQL text executed
  test.describe('AC-1 — Authors tab auto-runs its SELECT on load', () => {
    test('positive: seeded author rows and total are visible without clicking Run Query', async ({ bookCatalogPage }) => {
      await expect(bookCatalogPage.authorsTable).toBeVisible({ timeout: 15_000 });
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 2 (12 total)');
      await expect(bookCatalogPage.authorsRows).toHaveCount(10);
    });

    test('positive: the literal SELECT SQL executed is displayed', async ({ bookCatalogPage }) => {
      await expect(bookCatalogPage.queryExecutedSql).toHaveText('SELECT Id, Name, Country, BirthYear FROM Authors ORDER BY Name ASC');
    });

    test('negative: no sign-in or authentication control is present anywhere on the page', async ({ page }) => {
      await expect(page.getByRole('link', { name: /sign in/i })).toHaveCount(0);
      await expect(page.getByRole('button', { name: /sign in|log in/i })).toHaveCount(0);
    });
  });

  // AC-2 (TAB1-67): Tests search Authors by name and Books by title after clicking "Run
  // Query", and assert the filtered result count and that returned rows match the search term
  test.describe('AC-2 — Search Authors by name / Books by title', () => {
    test('positive: searching Authors by name filters the count and matches the term', async ({ bookCatalogPage }) => {
      await bookCatalogPage.authorsNameInput.fill('Austen');
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 1 (1 total)');
      await expect(bookCatalogPage.authorsRows.first()).toContainText('Jane Austen');
    });

    test('positive: searching Books by title filters the count and matches the term', async ({ bookCatalogPage }) => {
      await bookCatalogPage.booksTab.click();
      await bookCatalogPage.booksTitleInput.fill('Beloved');
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.booksRows).toHaveCount(1);
      await expect(bookCatalogPage.booksRows.first()).toContainText('Beloved');
    });

    test('negative: a name with no matches shows the Authors no-results message', async ({ bookCatalogPage }) => {
      await bookCatalogPage.authorsNameInput.fill('Zzznonexistentname99');
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.noResultsText).toHaveText('No authors match this query.');
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 1 (0 total)');
    });

    test('boundary: clearing the search after a filter restores the full result set', async ({ bookCatalogPage }) => {
      await bookCatalogPage.authorsNameInput.fill('Austen');
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 1 (1 total)');

      await bookCatalogPage.authorsNameInput.fill('');
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 2 (12 total)');
    });
  });

  // AC-3 (TAB1-67): Tests filter by a dropdown (country on Authors/Catalog, genre on
  // Books/Catalog) and assert every returned row matches the selected filter
  test.describe('AC-3 — Dropdown filter constrains every returned row', () => {
    test('positive: Authors filtered by Country shows only rows matching that country', async ({ bookCatalogPage }) => {
      await bookCatalogPage.authorsCountrySelect.selectOption({ label: 'Japan' });
      await bookCatalogPage.runQueryButton.click();
      // Wait for the query to actually re-resolve before reading rows — a raw .count()
      // right after the click can race the in-flight request against the old DOM.
      await expect(bookCatalogPage.pageIndicator).not.toHaveText(/\(12 total\)/);
      const count = await bookCatalogPage.authorsRows.count();
      expect(count).toBeGreaterThan(0);
      for (const country of await columnValues(bookCatalogPage.authorsRows, 1)) {
        expect(country).toBe('Japan');
      }
    });

    test('positive: Books filtered by Genre shows only rows matching that genre', async ({ bookCatalogPage }) => {
      await bookCatalogPage.booksTab.click();
      await bookCatalogPage.genreSelect.selectOption({ label: 'Dystopian' });
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.pageIndicator).not.toHaveText(/\(30 total\)/);
      const count = await bookCatalogPage.booksRows.count();
      expect(count).toBeGreaterThan(0);
      for (const genre of await columnValues(bookCatalogPage.booksRows, 1)) {
        expect(genre).toBe('Dystopian');
      }
    });

    test('negative: switching the filter back to "All" clears it and restores the full result set', async ({ bookCatalogPage }) => {
      await bookCatalogPage.authorsCountrySelect.selectOption({ label: 'Japan' });
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.pageIndicator).not.toHaveText(/\(12 total\)/);

      await bookCatalogPage.authorsCountrySelect.selectOption({ label: 'All' });
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 2 (12 total)');
    });
  });

  // AC-4 (TAB1-67): Tests switch to the Catalog tab, assert the displayed SQL text shows a
  // JOIN between Books and Authors, and that filtering by author country narrows the joined
  // result correctly
  test.describe('AC-4 — Catalog (JOIN) tab', () => {
    test('positive: displayed SQL text shows a JOIN between Books and Authors', async ({ bookCatalogPage }) => {
      await bookCatalogPage.catalogTab.click();
      await expect(bookCatalogPage.queryExecutedSql).toContainText('JOIN Authors a ON b.AuthorId = a.Id');
    });

    test('positive: filtering by author country narrows the joined result to that country only', async ({ bookCatalogPage }) => {
      await bookCatalogPage.catalogTab.click();
      await bookCatalogPage.catalogAuthorCountrySelect.selectOption({ label: 'Japan' });
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.pageIndicator).not.toHaveText(/\(30 total\)/);
      const count = await bookCatalogPage.catalogRows.count();
      expect(count).toBeGreaterThan(0);
      for (const country of await columnValues(bookCatalogPage.catalogRows, 2)) {
        expect(country).toBe('Japan');
      }
    });

    test('negative: a genre + country combination with no matches shows the catalog no-results message', async ({ bookCatalogPage }) => {
      await bookCatalogPage.catalogTab.click();
      await bookCatalogPage.genreSelect.selectOption({ label: 'Romance' });
      await bookCatalogPage.catalogAuthorCountrySelect.selectOption({ label: 'Japan' });
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.noResultsText).toHaveText('No catalog entries match this query.');
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 1 (0 total)');
    });
  });

  // AC-5 (TAB1-67): Tests sort by each available column and toggle ascending/descending,
  // asserting the resulting order without hardcoding expected values
  test.describe('AC-5 — Sorting and direction toggle (order asserted dynamically)', () => {
    // The literal SQL "ORDER BY <column> <direction>" is the exact, known-in-advance signal
    // that the newly-sorted query has resolved — the pageIndicator's total never changes on
    // a sort, so it can't be used to detect when the re-fetch has settled.
    const authorsSortColumns: { label: string; index: number; orderBy: string; parse: (v: string) => string | number }[] = [
      { label: 'Name', index: 0, orderBy: 'ORDER BY Name ASC', parse: (v) => v },
      { label: 'Birth year', index: 2, orderBy: 'ORDER BY BirthYear ASC', parse: (v) => Number(v) },
    ];
    for (const { label, index, orderBy, parse } of authorsSortColumns) {
      test(`positive: Authors sorted ascending by ${label}`, async ({ bookCatalogPage }) => {
        await bookCatalogPage.sortBySelect.selectOption({ label });
        await bookCatalogPage.runQueryButton.click();
        await expect(bookCatalogPage.queryExecutedSql).toContainText(orderBy);
        const values = (await columnValues(bookCatalogPage.authorsRows, index)).map(parse);
        expect(isSorted(values, 'asc')).toBe(true);
      });
    }

    const booksSortColumns: { label: string; index: number; orderBy: string; parse: (v: string) => string | number }[] = [
      { label: 'Title', index: 0, orderBy: 'ORDER BY Title ASC', parse: (v) => v },
      { label: 'Published year', index: 2, orderBy: 'ORDER BY PublishedYear ASC', parse: (v) => Number(v) },
      { label: 'Rating', index: 3, orderBy: 'ORDER BY Rating ASC', parse: (v) => Number(v) },
    ];
    for (const { label, index, orderBy, parse } of booksSortColumns) {
      test(`positive: Books sorted ascending by ${label}`, async ({ bookCatalogPage }) => {
        await bookCatalogPage.booksTab.click();
        await bookCatalogPage.sortBySelect.selectOption({ label });
        await bookCatalogPage.runQueryButton.click();
        await expect(bookCatalogPage.queryExecutedSql).toContainText(orderBy);
        const values = (await columnValues(bookCatalogPage.booksRows, index)).map(parse);
        expect(isSorted(values, 'asc')).toBe(true);
      });
    }

    const catalogSortColumns: { label: string; index: number; orderBy: string; parse: (v: string) => string | number }[] = [
      { label: 'Title', index: 0, orderBy: 'ORDER BY Title ASC', parse: (v) => v },
      { label: 'Published year', index: 4, orderBy: 'ORDER BY PublishedYear ASC', parse: (v) => Number(v) },
      { label: 'Rating', index: 5, orderBy: 'ORDER BY Rating ASC', parse: (v) => Number(v) },
    ];
    for (const { label, index, orderBy, parse } of catalogSortColumns) {
      test(`positive: Catalog sorted ascending by ${label}`, async ({ bookCatalogPage }) => {
        await bookCatalogPage.catalogTab.click();
        await bookCatalogPage.sortBySelect.selectOption({ label });
        await bookCatalogPage.runQueryButton.click();
        await expect(bookCatalogPage.queryExecutedSql).toContainText(orderBy);
        const values = (await columnValues(bookCatalogPage.catalogRows, index)).map(parse);
        expect(isSorted(values, 'asc')).toBe(true);
      });
    }

    test('boundary: toggling the direction button reverses the sort order', async ({ bookCatalogPage }) => {
      await bookCatalogPage.sortBySelect.selectOption({ label: 'Birth year' });
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.queryExecutedSql).toContainText('ORDER BY BirthYear ASC');
      const ascending = (await columnValues(bookCatalogPage.authorsRows, 2)).map(Number);
      expect(isSorted(ascending, 'asc')).toBe(true);

      await bookCatalogPage.sortDirectionButton.click();
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.queryExecutedSql).toContainText('ORDER BY BirthYear DESC');
      const descending = (await columnValues(bookCatalogPage.authorsRows, 2)).map(Number);
      expect(isSorted(descending, 'desc')).toBe(true);
      expect(descending).not.toEqual(ascending);
    });
  });

  // AC-6 (TAB1-67): Tests paginate with Next and Prev after a filtered Run Query and assert
  // the row content changes between pages
  test.describe('AC-6 — Pagination with Next/Prev', () => {
    test('positive: Next navigates forward and changes row content; indicator updates', async ({ bookCatalogPage }) => {
      await bookCatalogPage.booksTab.click();
      const firstRowPage1 = await bookCatalogPage.booksRows.first().textContent();
      await bookCatalogPage.nextButton.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 2 of 3 (30 total)');
      await expect(bookCatalogPage.booksRows.first()).not.toHaveText(firstRowPage1 ?? '');
    });

    test('positive: Prev navigates back and restores the original first row', async ({ bookCatalogPage }) => {
      await bookCatalogPage.booksTab.click();
      const firstRowPage1 = await bookCatalogPage.booksRows.first().textContent();
      await bookCatalogPage.nextButton.click();
      await bookCatalogPage.prevButton.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 3 (30 total)');
      await expect(bookCatalogPage.booksRows.first()).toHaveText(firstRowPage1 ?? '');
    });

    test('boundary: Prev is disabled on the first page, Next is disabled on the last page', async ({ bookCatalogPage }) => {
      await bookCatalogPage.booksTab.click();
      await expect(bookCatalogPage.prevButton).toBeDisabled();

      await bookCatalogPage.nextButton.click();
      await bookCatalogPage.nextButton.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 3 of 3 (30 total)');
      await expect(bookCatalogPage.nextButton).toBeDisabled();
    });

    test('positive: pagination reflects a filtered Run Query, not just the unfiltered set', async ({ bookCatalogPage }) => {
      // Fiction is a 14-book subset of the 30 seeded books (confirmed via the API) —
      // guarantees a real second page under a filter, not just the unfiltered 30.
      await bookCatalogPage.booksTab.click();
      await bookCatalogPage.genreSelect.selectOption({ label: 'Fiction' });
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 2 (14 total)');

      const firstRowPage1 = await bookCatalogPage.booksRows.first().textContent();
      await bookCatalogPage.nextButton.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 2 of 2 (14 total)');
      await expect(bookCatalogPage.booksRows.first()).not.toHaveText(firstRowPage1 ?? '');
    });
  });

  // AC-7 (TAB1-67): Tests submit a SQL-injection-style search string and assert it is
  // treated as a safe literal substring with no matching rows, then run a normal search
  // afterward to prove the data and app still work
  test.describe('AC-7 — SQL-injection-style search is a safe literal (security)', () => {
    test('positive: injection-style search returns zero rows with no error state', async ({ bookCatalogPage }) => {
      await bookCatalogPage.authorsNameInput.fill(SQL_INJECTION_ATTEMPT);
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.noResultsText).toHaveText('No authors match this query.');
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 1 (0 total)');
      await expect(bookCatalogPage.errorAlert).toHaveCount(0);
    });

    test('positive: a normal search afterward still returns correct results (data/app unaffected)', async ({ bookCatalogPage }) => {
      await bookCatalogPage.authorsNameInput.fill(SQL_INJECTION_ATTEMPT);
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 1 (0 total)');

      await bookCatalogPage.authorsNameInput.fill('Austen');
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 1 (1 total)');
      await expect(bookCatalogPage.authorsRows.first()).toContainText('Jane Austen');
    });
  });

  // AC-8 (TAB1-67): Tests click "Reset catalog data", handle the confirmation dialog (both
  // accept and dismiss), and assert the tables return to their deterministic seeded state
  // (12 authors, 30 books) only when confirmed
  test.describe('AC-8 — Reset catalog data with confirmation dialog', () => {
    test('positive: accepting the dialog resets both tables to the seeded state (12 authors, 30 books)', async ({ page, bookCatalogPage }) => {
      page.once('dialog', (dialog) => dialog.accept());
      await bookCatalogPage.resetCatalogDataButton.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 2 (12 total)', { timeout: 15_000 });

      await bookCatalogPage.booksTab.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 3 (30 total)', { timeout: 15_000 });
    });

    test('negative: dismissing the dialog leaves the currently displayed data unchanged', async ({ page, bookCatalogPage }) => {
      await bookCatalogPage.authorsNameInput.fill('Austen');
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 1 (1 total)');

      page.once('dialog', (dialog) => dialog.dismiss());
      await bookCatalogPage.resetCatalogDataButton.click();

      // No reseed should occur — the currently filtered view must stay exactly as it was.
      // toHaveText's own polling (rather than an arbitrary sleep) is what confirms stability.
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 1 (1 total)');
      await expect(bookCatalogPage.authorsRows.first()).toContainText('Jane Austen');
    });
  });

  // Accessibility — WCAG 2.x axe scans across meaningful UI states
  test.describe('accessibility (WCAG 2.x, axe) — all UI states', () => {
    test('no violations on initial page load (Authors tab)', async ({ page }) => {
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations after a search returns results', async ({ page, bookCatalogPage }) => {
      await bookCatalogPage.authorsNameInput.fill('Austen');
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.pageIndicator).toHaveText('Page 1 of 1 (1 total)');
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations in the no-results state', async ({ page, bookCatalogPage }) => {
      await bookCatalogPage.authorsNameInput.fill('Zzznonexistentname99');
      await bookCatalogPage.runQueryButton.click();
      await expect(bookCatalogPage.noResultsText).toBeVisible();
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations on the Catalog (JOIN) tab', async ({ page, bookCatalogPage }) => {
      await bookCatalogPage.catalogTab.click();
      await expect(bookCatalogPage.catalogTable).toBeVisible({ timeout: 15_000 });
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });
  });

  // Performance — navigation timing budget (generous: a real Azure SQL round trip on load)
  test.describe('performance @performance', () => {
    test('initial load is within budget', async ({ page }) => {
      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
      });
      expect(timing.domContentLoaded).toBeLessThan(8000);
      expect(timing.load).toBeLessThan(15000);
    });
  });
});
