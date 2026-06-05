import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.searchInput = page.getByRole('searchbox');
    this.searchButton = page.getByRole('button', { name: 'Search' });
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }
}
