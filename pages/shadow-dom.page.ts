import { Locator, Page } from '@playwright/test';
import { BASE_URL } from './base-url';

export class ShadowDomPage {
  readonly locators: {
    heading: Locator;
    shadowContent: Locator;
    shadowParagraph: Locator;
    helloText: Locator;
  };
  readonly actions: Record<string, (...args: any[]) => Promise<void>>;

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Shadow DOM' }),
      shadowContent: page.locator('#content'),
      shadowParagraph: page.locator('#content p'),
      helloText: page.getByText('Hello Shadow DOM'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${BASE_URL}/shadow-dom.html`);
      },
    };
  }
}
