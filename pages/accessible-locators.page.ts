import { Page, Locator } from '@playwright/test';

export class AccessibleLocatorsPage {
  // ── Inputs ──────────────────────────────────────────────
  readonly searchBooksInput: Locator;

  // ── Dropdowns ───────────────────────────────────────────
  readonly filterByGenreDropdown: Locator;

  // ── Buttons ─────────────────────────────────────────────
  readonly darkModeToggleButton: Locator;
  readonly markCompleteButton: Locator;
  readonly previousPageButton: Locator;
  readonly nextPageButton: Locator;

  // ── Book Card Buttons ────────────────────────────────────
  readonly cleanCodeAddToWishlistButton: Locator;
  readonly pragmaticProgrammerAddToWishlistButton: Locator;
  readonly designPatternsAddToWishlistButton: Locator;
  readonly refactoringAddToWishlistButton: Locator;
  readonly designOfEverydayThingsAddToWishlistButton: Locator;
  readonly domainDrivenDesignAddToWishlistButton: Locator;

  // ── Links ───────────────────────────────────────────────
  readonly homeLink: Locator;
  readonly allLabsLink: Locator;
  readonly playwrightDocsLink: Locator;

  // ── Book Card Links ──────────────────────────────────────
  readonly cleanCodeViewDetailsLink: Locator;
  readonly pragmaticProgrammerViewDetailsLink: Locator;
  readonly designPatternsViewDetailsLink: Locator;
  readonly refactoringViewDetailsLink: Locator;
  readonly designOfEverydayThingsViewDetailsLink: Locator;
  readonly domainDrivenDesignViewDetailsLink: Locator;

  // ── Images ──────────────────────────────────────────────
  readonly cleanCodeCoverImage: Locator;
  readonly pragmaticProgrammerCoverImage: Locator;
  readonly designPatternsCoverImage: Locator;
  readonly refactoringCoverImage: Locator;
  readonly designOfEverydayThingsCoverImage: Locator;
  readonly domainDrivenDesignCoverImage: Locator;

  // ── Status ──────────────────────────────────────────────
  readonly booksCountStatus: Locator;

  constructor(page: Page) {
    // ── Inputs ────────────────────────────────────────────
    this.searchBooksInput = page.getByLabel('Search books');

    // ── Dropdowns ─────────────────────────────────────────
    this.filterByGenreDropdown = page.getByLabel('Filter by genre');

    // ── Buttons ───────────────────────────────────────────
    this.darkModeToggleButton = page.getByRole('button', { name: 'Toggle dark mode' });
    this.markCompleteButton = page.getByRole('button', { name: 'Mark complete' });
    this.previousPageButton = page.getByRole('button', { name: 'Previous' });
    this.nextPageButton = page.getByRole('button', { name: 'Next' });

    // ── Book Card Buttons ──────────────────────────────────
    this.cleanCodeAddToWishlistButton = page.getByRole('article').filter({ hasText: 'Clean Code' }).getByRole('button', { name: 'Add to wishlist' });
    this.pragmaticProgrammerAddToWishlistButton = page
      .getByRole('article')
      .filter({ hasText: 'The Pragmatic Programmer' })
      .getByRole('button', { name: 'Add to wishlist' });
    this.designPatternsAddToWishlistButton = page
      .getByRole('article')
      .filter({ hasText: 'Design Patterns' })
      .getByRole('button', { name: 'Add to wishlist' });
    this.refactoringAddToWishlistButton = page
      .getByRole('article')
      .filter({ hasText: 'Refactoring' })
      .getByRole('button', { name: 'Add to wishlist' });
    this.designOfEverydayThingsAddToWishlistButton = page
      .getByRole('article')
      .filter({ hasText: 'The Design of Everyday Things' })
      .getByRole('button', { name: 'Add to wishlist' });
    this.domainDrivenDesignAddToWishlistButton = page
      .getByRole('article')
      .filter({ hasText: 'Domain-Driven Design' })
      .getByRole('button', { name: 'Add to wishlist' });

    // ── Links ─────────────────────────────────────────────
    this.homeLink = page.getByRole('link', { name: 'Stagecraft' });
    this.allLabsLink = page.getByRole('link', { name: '← All labs' });
    this.playwrightDocsLink = page.getByRole('link', { name: 'Playwright Docs' });

    // ── Book Card Links ────────────────────────────────────
    this.cleanCodeViewDetailsLink = page.getByRole('article').filter({ hasText: 'Clean Code' }).getByRole('link', { name: 'View details' });
    this.pragmaticProgrammerViewDetailsLink = page
      .getByRole('article')
      .filter({ hasText: 'The Pragmatic Programmer' })
      .getByRole('link', { name: 'View details' });
    this.designPatternsViewDetailsLink = page.getByRole('article').filter({ hasText: 'Design Patterns' }).getByRole('link', { name: 'View details' });
    this.refactoringViewDetailsLink = page.getByRole('article').filter({ hasText: 'Refactoring' }).getByRole('link', { name: 'View details' });
    this.designOfEverydayThingsViewDetailsLink = page
      .getByRole('article')
      .filter({ hasText: 'The Design of Everyday Things' })
      .getByRole('link', { name: 'View details' });
    this.domainDrivenDesignViewDetailsLink = page
      .getByRole('article')
      .filter({ hasText: 'Domain-Driven Design' })
      .getByRole('link', { name: 'View details' });

    // ── Images ────────────────────────────────────────────
    this.cleanCodeCoverImage = page.getByAltText('Clean Code book cover');
    this.pragmaticProgrammerCoverImage = page.getByAltText('The Pragmatic Programmer book cover');
    this.designPatternsCoverImage = page.getByAltText('Design Patterns book cover');
    this.refactoringCoverImage = page.getByAltText('Refactoring book cover');
    this.designOfEverydayThingsCoverImage = page.getByAltText('The Design of Everyday Things book cover');
    this.domainDrivenDesignCoverImage = page.getByAltText('Domain-Driven Design book cover');

    // ── Status ────────────────────────────────────────────
    this.booksCountStatus = page.getByRole('status');
  }
}
