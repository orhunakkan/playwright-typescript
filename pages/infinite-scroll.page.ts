import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class InfiniteScrollPage {
  readonly locators: {
    heading: Locator;
    contentDiv: Locator;
    contentParagraphs: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    scrollToBottom: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Infinite scroll' }),
      contentDiv: page.locator('#content'),
      contentParagraphs: page.locator('#content p'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/infinite-scroll.html`);
      },
      scrollToBottom: async () => {
        await this.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      },
    };
  }
}
