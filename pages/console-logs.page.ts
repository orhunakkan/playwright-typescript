import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class ConsoleLogsPage {
  readonly locators: {
    heading: Locator;
    description: Locator;
    copyright: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Console logs' }),
      description: page.getByText("This page makes call to JavaScript's console (log, info, warn, error)."),
      copyright: page.getByText('Copyright © 2021-2026'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/console-logs.html`);
      },
    };
  }
}
