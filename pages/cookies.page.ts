import { Locator, Page } from '@playwright/test';
import { BASE_URL } from './base-url';

export class CookiesPage {
  readonly locators: {
    heading: Locator;
    displayCookiesButton: Locator;
    cookiesList: Locator;
  };
  readonly actions: Record<string, (...args: any[]) => Promise<void>>;

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Cookies' }),
      displayCookiesButton: page.getByRole('button', { name: 'Display cookies' }),
      cookiesList: page.locator('#cookies-list'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${BASE_URL}/cookies.html`);
      },
      displayCookies: async () => {
        await this.locators.displayCookiesButton.click();
      },
    };
  }
}
