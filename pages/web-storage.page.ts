import { Locator, Page } from '@playwright/test';
import { BASE_URL } from './base-url';

export class WebStoragePage {
  readonly locators: {
    heading: Locator;
    displayLocalStorageButton: Locator;
    displaySessionStorageButton: Locator;
    sessionStorageDisplay: Locator;
    localStorageDisplay: Locator;
  };
  readonly actions: Record<string, (...args: any[]) => Promise<void>>;

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Web storage' }),
      displayLocalStorageButton: page.getByRole('button', { name: 'Display local storage' }),
      displaySessionStorageButton: page.getByRole('button', { name: 'Display session storage' }),
      sessionStorageDisplay: page.locator('#session-storage'),
      localStorageDisplay: page.locator('#local-storage'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${BASE_URL}/web-storage.html`);
      },
      displaySessionStorage: async () => {
        await this.locators.displaySessionStorageButton.click();
      },
      displayLocalStorage: async () => {
        await this.locators.displayLocalStorageButton.click();
      },
    };
  }
}
