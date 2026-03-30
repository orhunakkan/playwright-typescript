import { Locator, Page } from '@playwright/test';

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
        await this.page.goto(`${process.env.PRACTICE_E2E_URL}/infinite-scroll.html`);
      },
      scrollToBottom: async () => {
        await this.page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      },
    };
  }
}
