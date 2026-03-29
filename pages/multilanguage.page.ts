import { Locator, Page } from '@playwright/test';
import { BASE_URL } from './base-url';

export class MultilanguagePage {
  readonly locators: {
    heading: Locator;
    contentListItems: Locator;
    langElements: Locator;
    langListItems: Locator;
    contentDiv: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.locator('h1.display-6'),
      contentListItems: page.locator('#content li'),
      langElements: page.locator('.lang'),
      langListItems: page.locator('#content li.lang'),
      contentDiv: page.locator('#content'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${BASE_URL}/multilanguage.html`);
      },
    };
  }
}
