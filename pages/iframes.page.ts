import { FrameLocator, Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class IframesPage {
  readonly locators: {
    heading: Locator;
    iframe: Locator;
    iframeContent: FrameLocator;
    mainParagraphs: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'IFrame' }),
      iframe: page.locator('#my-iframe'),
      iframeContent: page.frameLocator('#my-iframe'),
      mainParagraphs: page.locator('main > .container > .row p'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/iframes.html`);
      },
    };
  }
}
