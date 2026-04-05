import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class NavigationPage {
  readonly locators: {
    heading: Locator;
    pagination: Locator;
    previousLink: Locator;
    nextLink: Locator;
    pageLink: (num: number) => Locator;
    activePageLink: Locator;
    previousItem: Locator;
    nextItem: Locator;
    leadParagraph: Locator;
    backToIndexLink: Locator;
  };
  readonly actions: {
    goto: (pageNum?: number) => Promise<void>;
    goToPage: (num: number) => Promise<void>;
    goNext: () => Promise<void>;
    goPrevious: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Navigation example' }),
      pagination: page.getByRole('navigation', { name: 'Page navigation example' }),
      previousLink: page.getByRole('link', { name: 'Previous' }),
      nextLink: page.getByRole('link', { name: 'Next' }),
      pageLink: (num: number) => page.getByRole('link', { name: `${num}`, exact: true }),
      activePageLink: page.locator('li.page-item.active a.page-link'),
      previousItem: page.locator('li.page-item').filter({ hasText: 'Previous' }),
      nextItem: page.locator('li.page-item').filter({ hasText: 'Next' }),
      leadParagraph: page.locator('p.lead'),
      backToIndexLink: page.getByRole('link', { name: 'Back to index' }),
    };

    this.actions = {
      goto: async (pageNum: number = 1) => {
        await this.page.goto(`${config.e2eUrl}/navigation${pageNum}.html`);
      },
      goToPage: async (num: number) => {
        await this.locators.pageLink(num).click();
      },
      goNext: async () => {
        await this.locators.nextLink.click();
      },
      goPrevious: async () => {
        await this.locators.previousLink.click();
      },
    };
  }
}
