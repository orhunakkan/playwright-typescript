import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class LongPage {
  readonly locators: {
    heading: Locator;
    contentParagraphs: Locator;
    footer: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    waitForContent: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'This is a long page' }),
      contentParagraphs: page.locator('#content p'),
      footer: page.locator('footer'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/long-page.html`);
      },
      waitForContent: async () => {
        await this.locators.contentParagraphs.first().waitFor();
      },
    };
  }
}
