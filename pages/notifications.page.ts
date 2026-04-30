import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class NotificationsPage {
  readonly locators: {
    heading: Locator;
    notifyMeButton: Locator;
    copyright: Locator;
    authorLink: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    clickNotifyMe: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Notifications' }),
      notifyMeButton: page.getByRole('button', { name: 'Notify me' }),
      copyright: page.getByText('Copyright © 2021-2026'),
      authorLink: page.getByRole('link', { name: 'Boni García' }),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/notifications.html`);
      },
      clickNotifyMe: async () => {
        await this.locators.notifyMeButton.click();
      },
    };
  }
}
