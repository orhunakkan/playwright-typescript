import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class NotificationsPage {
  readonly locators: {
    heading: Locator;
    notifyMeButton: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    clickNotifyMe: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Notifications' }),
      notifyMeButton: page.getByRole('button', { name: 'Notify me' }),
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
