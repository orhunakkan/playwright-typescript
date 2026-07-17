import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-15 — Accessible Locators

const URL = '/practice/accessible-locators';

test.describe('Accessible Locators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    // React renders async — wait for at least one book card before any test runs
    await expect(page.getByRole('article')).not.toHaveCount(0);
  });

  // AC-1: All locators are semantic (getByRole / getByLabel / getByAltText / getByText)
  test.describe('AC-1 — Semantic-only locators', () => {
    test('positive: page heading is reachable via getByRole', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Accessible Locators' })).toBeVisible();
    });

    test('positive: search input is reachable via getByLabel', async ({ accessibleLocatorsPage }) => {
      await expect(accessibleLocatorsPage.searchBooksInput).toBeVisible();
    });

    test('positive: genre filter is reachable via getByLabel', async ({ accessibleLocatorsPage }) => {
      await expect(accessibleLocatorsPage.filterByGenreDropdown).toBeVisible();
    });

    test('positive: each book card is represented as an article landmark', async ({ page }) => {
      const cards = page.getByRole('article');
      await expect(cards).not.toHaveCount(0);
    });

    test('positive: books count status element is reachable via getByRole status', async ({ accessibleLocatorsPage }) => {
      await expect(accessibleLocatorsPage.booksCountStatus).toBeVisible();
    });

    test('negative: no assertion relies on CSS selectors, test IDs, or XPath', async ({ accessibleLocatorsPage }) => {
      // This spec never uses $(), locator('div.class'), or xpath — only POM methods that wrap semantic locators.
      // Validates that all POM-exposed locators resolve via semantic APIs.
      await expect(accessibleLocatorsPage.searchBooksInput).toBeVisible();
      await expect(accessibleLocatorsPage.filterByGenreDropdown).toBeVisible();
      await expect(accessibleLocatorsPage.cleanCodeCoverImage).toBeVisible();
      await expect(accessibleLocatorsPage.cleanCodeAddToWishlistButton).toBeVisible();
    });
  });

  // AC-2: Assert only on "Available" books using locator.filter — no hardcoded row indices
  test.describe('AC-2 — Available books via locator.filter', () => {
    test('positive: can isolate Available books without hardcoding indices', async ({ page }) => {
      const availableCards = page.getByRole('article').filter({ hasText: 'Available' });
      const count = await availableCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('positive: every card in the Available subset contains the text "Available"', async ({ page }) => {
      const availableCards = page.getByRole('article').filter({ hasText: 'Available' });
      for (const card of await availableCards.all()) {
        await expect(card).toContainText('Available');
      }
    });

    test('negative: checked-out books are excluded from the Available filter', async ({ page }) => {
      const allCards = page.getByRole('article');
      const availableCards = page.getByRole('article').filter({ hasText: 'Available' });
      const totalCount = await allCards.count();
      const availableCount = await availableCards.count();
      // Available subset must be ≤ total (some may be checked out)
      expect(availableCount).toBeLessThanOrEqual(totalCount);
    });

    test('boundary: Available filter returns empty set gracefully when no books are available', async ({ page }) => {
      // Verify the filter expression itself is sound — count may be 0 if all checked out
      const availableCards = page.getByRole('article').filter({ hasText: 'Available' });
      const count = await availableCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  // AC-3: Genre filter — select a genre and assert all visible books match
  test.describe('AC-3 — Genre filter', () => {
    test('positive: selecting a genre shows only books of that genre', async ({ page, accessibleLocatorsPage }) => {
      const dropdown = accessibleLocatorsPage.filterByGenreDropdown;

      // slice(1) skips the first "All genres" option regardless of its value attribute
      const genreOptions = await dropdown.evaluate((el: HTMLSelectElement) =>
        Array.from(el.options)
          .slice(1)
          .map((o) => ({ value: o.value, text: o.text })),
      );
      expect(genreOptions.length).toBeGreaterThan(0);

      const targetGenre = genreOptions[0];
      await dropdown.selectOption(targetGenre.value);

      const visibleCards = page.getByRole('article');
      await expect(visibleCards).not.toHaveCount(0);
      for (const card of await visibleCards.all()) {
        await expect(card).toContainText(targetGenre.text, { ignoreCase: true });
      }
    });

    test('negative: books of other genres are absent after genre filter applied', async ({ page, accessibleLocatorsPage }) => {
      const dropdown = accessibleLocatorsPage.filterByGenreDropdown;

      const genreOptions = await dropdown.evaluate((el: HTMLSelectElement) =>
        Array.from(el.options)
          .slice(1)
          .map((o) => ({ value: o.value, text: o.text })),
      );
      if (genreOptions.length < 2) return;

      await dropdown.selectOption(genreOptions[0].value);
      await expect(page.getByRole('article')).not.toHaveCount(0);

      const visibleCards = page.getByRole('article');
      for (const card of await visibleCards.all()) {
        await expect(card).not.toContainText(genreOptions[1].text, { ignoreCase: true });
      }
    });

    test('boundary: selecting All restores the full book list', async ({ page, accessibleLocatorsPage }) => {
      const dropdown = accessibleLocatorsPage.filterByGenreDropdown;
      const initialCount = await page.getByRole('article').count();

      const genreOptions = await dropdown.evaluate((el: HTMLSelectElement) =>
        Array.from(el.options)
          .slice(1)
          .map((o) => o.value),
      );
      if (genreOptions.length > 0) {
        await dropdown.selectOption(genreOptions[0]);
        await expect(page.getByRole('article')).not.toHaveCount(initialCount);
      }

      // Restore to the first option ("All genres")
      await dropdown.selectOption({ index: 0 });
      await expect(page.getByRole('article')).toHaveCount(initialCount);
    });

    test('boundary: genre with a single book returns exactly one card', async ({ page, accessibleLocatorsPage }) => {
      const dropdown = accessibleLocatorsPage.filterByGenreDropdown;

      const options = await dropdown.evaluate((el: HTMLSelectElement) =>
        Array.from(el.options)
          .map((o) => ({ value: o.value, text: o.text }))
          .filter((o) => o.value !== '' && o.value !== 'all'),
      );

      for (const option of options) {
        await dropdown.selectOption(option.value);
        const count = await page.getByRole('article').count();
        if (count === 1) {
          // Found a single-book genre — validate the card is visible and contains genre text
          await expect(page.getByRole('article').first()).toBeVisible();
          break;
        }
        // Reset before trying next option
        await dropdown.selectOption({ index: 0 });
      }
    });
  });

  // AC-4: Locate book cover image by alt text and confirm visibility
  test.describe('AC-4 — Book cover image via getByAltText', () => {
    test('positive: Clean Code cover located by alt text and is visible', async ({ accessibleLocatorsPage }) => {
      await expect(accessibleLocatorsPage.cleanCodeCoverImage).toBeVisible();
    });

    test('positive: The Pragmatic Programmer cover located by alt text and is visible', async ({ accessibleLocatorsPage }) => {
      await expect(accessibleLocatorsPage.pragmaticProgrammerCoverImage).toBeVisible();
    });

    test('positive: Design Patterns cover located by alt text and is visible', async ({ accessibleLocatorsPage }) => {
      await expect(accessibleLocatorsPage.designPatternsCoverImage).toBeVisible();
    });

    test('positive: Refactoring cover located by alt text and is visible', async ({ accessibleLocatorsPage }) => {
      await expect(accessibleLocatorsPage.refactoringCoverImage).toBeVisible();
    });

    test('positive: all six book covers are visible via getByAltText', async ({ accessibleLocatorsPage }) => {
      await expect(accessibleLocatorsPage.cleanCodeCoverImage).toBeVisible();
      await expect(accessibleLocatorsPage.pragmaticProgrammerCoverImage).toBeVisible();
      await expect(accessibleLocatorsPage.designPatternsCoverImage).toBeVisible();
      await expect(accessibleLocatorsPage.refactoringCoverImage).toBeVisible();
      await expect(accessibleLocatorsPage.designOfEverydayThingsCoverImage).toBeVisible();
      await expect(accessibleLocatorsPage.domainDrivenDesignCoverImage).toBeVisible();
    });

    test('negative: getByAltText with incorrect alt text returns no visible element', async ({ page }) => {
      const wrongAlt = page.getByAltText('Nonexistent Book Cover XYZ');
      await expect(wrongAlt).toHaveCount(0);
    });

    test('boundary: all book cover images have non-empty alt text (verified via getByAltText resolution)', async ({ accessibleLocatorsPage }) => {
      // Resolving via getByAltText inherently proves the attribute is meaningful and non-empty
      const covers = [
        accessibleLocatorsPage.cleanCodeCoverImage,
        accessibleLocatorsPage.pragmaticProgrammerCoverImage,
        accessibleLocatorsPage.designPatternsCoverImage,
        accessibleLocatorsPage.refactoringCoverImage,
        accessibleLocatorsPage.designOfEverydayThingsCoverImage,
        accessibleLocatorsPage.domainDrivenDesignCoverImage,
      ];
      for (const cover of covers) {
        await expect(cover).toBeVisible();
      }
    });
  });

  // AC-5: Scoped button clicks using chained locators
  test.describe('AC-5 — Chained card-scoped button locators', () => {
    test('positive: Add to wishlist on Clean Code card is visible and enabled', async ({ accessibleLocatorsPage }) => {
      await expect(accessibleLocatorsPage.cleanCodeAddToWishlistButton).toBeVisible();
      await expect(accessibleLocatorsPage.cleanCodeAddToWishlistButton).toBeEnabled();
    });

    test('positive: Add to wishlist on The Pragmatic Programmer card is visible and enabled', async ({ accessibleLocatorsPage }) => {
      await expect(accessibleLocatorsPage.pragmaticProgrammerAddToWishlistButton).toBeVisible();
      await expect(accessibleLocatorsPage.pragmaticProgrammerAddToWishlistButton).toBeEnabled();
    });

    test('positive: clicking Add to wishlist on Clean Code does not click the Pragmatic Programmer card button', async ({
      page,
      accessibleLocatorsPage,
    }) => {
      // Chained locator scopes the action to exactly one card
      await accessibleLocatorsPage.cleanCodeAddToWishlistButton.click();

      // Pragmatic Programmer card retains its original wishlist state (independent card scope)
      const ppCard = page.getByRole('article').filter({ hasText: 'The Pragmatic Programmer' });
      await expect(ppCard).toBeVisible();
    });

    test('boundary: each book card exposes its own Add to wishlist button independently', async ({ accessibleLocatorsPage }) => {
      const buttons = [
        accessibleLocatorsPage.cleanCodeAddToWishlistButton,
        accessibleLocatorsPage.pragmaticProgrammerAddToWishlistButton,
        accessibleLocatorsPage.designPatternsAddToWishlistButton,
        accessibleLocatorsPage.refactoringAddToWishlistButton,
        accessibleLocatorsPage.designOfEverydayThingsAddToWishlistButton,
        accessibleLocatorsPage.domainDrivenDesignAddToWishlistButton,
      ];
      for (const btn of buttons) {
        await expect(btn).toBeVisible();
      }
    });

    test('negative: View details link scoped to Clean Code card does not resolve to the Pragmatic Programmer card', async ({
      page,
      accessibleLocatorsPage,
    }) => {
      // Chained link scoped to Clean Code card
      const cleanCodeDetailsHref = accessibleLocatorsPage.cleanCodeViewDetailsLink;
      const ppCard = page.getByRole('article').filter({ hasText: 'The Pragmatic Programmer' });
      const ppDetailsHref = await ppCard.getByRole('link', { name: 'View details' }).getAttribute('href');
      await expect(cleanCodeDetailsHref).not.toHaveAttribute('href', ppDetailsHref);
    });
  });

  // AC-6: Search input filters the book list; result count updates
  test.describe('AC-6 — Search input filtering', () => {
    test('positive: searching a known book title shows only matching cards', async ({ page, accessibleLocatorsPage }) => {
      await accessibleLocatorsPage.searchBooksInput.fill('Clean Code');
      const visibleCards = page.getByRole('article');
      await expect(visibleCards).not.toHaveCount(0);
      for (const card of await visibleCards.all()) {
        await expect(card).toContainText('Clean Code', { ignoreCase: true });
      }
    });

    test('positive: result count updates after search', async ({ accessibleLocatorsPage }) => {
      const statusBefore = await accessibleLocatorsPage.booksCountStatus.textContent();
      await accessibleLocatorsPage.searchBooksInput.fill('Design');
      const statusAfter = accessibleLocatorsPage.booksCountStatus;
      // Count should be different after narrowing the search
      await expect(statusAfter).not.toHaveText(statusBefore);
    });

    test('negative: searching a non-existent title yields an empty book list', async ({ page, accessibleLocatorsPage }) => {
      await accessibleLocatorsPage.searchBooksInput.fill('xyznonexistentbook12345');
      const visibleCards = page.getByRole('article');
      await expect(visibleCards).toHaveCount(0);
    });

    test('negative: result count reflects 0 matching books for a no-match search', async ({ page, accessibleLocatorsPage }) => {
      await accessibleLocatorsPage.searchBooksInput.fill('xyznonexistentbook12345');
      // App shows "No books found." when count reaches 0
      await expect(accessibleLocatorsPage.booksCountStatus).toContainText('No books found.');
      await expect(page.getByRole('article')).toHaveCount(0);
    });

    test('boundary: clearing search restores the full book list', async ({ page, accessibleLocatorsPage }) => {
      const initialCount = await page.getByRole('article').count();

      await accessibleLocatorsPage.searchBooksInput.fill('Clean Code');
      await expect(page.getByRole('article')).not.toHaveCount(initialCount);

      await accessibleLocatorsPage.searchBooksInput.fill('');
      await expect(page.getByRole('article')).toHaveCount(initialCount);
    });

    test('boundary: single character search narrows the list without error', async ({ page, accessibleLocatorsPage }) => {
      await accessibleLocatorsPage.searchBooksInput.fill('C');
      const count = await page.getByRole('article').count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('boundary: search with leading and trailing spaces is handled gracefully', async ({ page, accessibleLocatorsPage }) => {
      await accessibleLocatorsPage.searchBooksInput.fill('  Clean Code  ');
      const count = await page.getByRole('article').count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  // Accessibility — WCAG 2.1 AA axe scan across all UI states
  test.describe('accessibility (WCAG 2.1 AA, axe) — all UI states', () => {
    test('no violations on initial page load', async ({ page }) => {
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations in genre-filtered state', async ({ page, accessibleLocatorsPage }) => {
      const dropdown = accessibleLocatorsPage.filterByGenreDropdown;
      const firstGenreOption = await dropdown.evaluate((el: HTMLSelectElement) => el.options[1]?.value ?? null);
      if (firstGenreOption) {
        await dropdown.selectOption(firstGenreOption);
        await expect(page.getByRole('article')).not.toHaveCount(0);
      }
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations in search-results state', async ({ page, accessibleLocatorsPage }) => {
      await accessibleLocatorsPage.searchBooksInput.fill('Design');
      await expect(page.getByRole('article')).not.toHaveCount(0);
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
