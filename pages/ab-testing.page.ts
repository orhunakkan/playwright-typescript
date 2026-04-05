import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class ABTestingPage {
  readonly locators: {
    heading: Locator;
    contentDiv: Locator;
    contentHeading: Locator;
    contentParagraph: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    waitForContent: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'A/B Testing' }),
      contentDiv: page.locator('#content'),
      contentHeading: page.locator('#content h6'),
      contentParagraph: page.locator('#content p.lead'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/ab-testing.html`);
      },
      waitForContent: async () => {
        await this.locators.contentHeading.waitFor();
      },
    };
  }
}
