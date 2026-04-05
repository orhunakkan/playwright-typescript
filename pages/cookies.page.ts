import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class CookiesPage {
  readonly locators: {
    heading: Locator;
    displayCookiesButton: Locator;
    cookiesList: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    displayCookies: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Cookies' }),
      displayCookiesButton: page.getByRole('button', { name: 'Display cookies' }),
      cookiesList: page.locator('#cookies-list'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/cookies.html`);
      },
      displayCookies: async () => {
        await this.locators.displayCookiesButton.click();
      },
    };
  }
}
