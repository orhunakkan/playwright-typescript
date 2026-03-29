import { Locator, Page } from '@playwright/test';
import { BASE_URL } from './base-url';

export class ConsoleLogsPage {
  readonly locators: {
    heading: Locator;
    description: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Console logs' }),
      description: page.getByText("This page makes call to JavaScript's console (log, info, warn, error)."),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${BASE_URL}/console-logs.html`);
      },
    };
  }
}
