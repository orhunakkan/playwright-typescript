import { Locator, Page } from '@playwright/test';

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
        await this.page.goto(`${process.env.PRACTICE_E2E_URL}/notifications.html`);
      },
      clickNotifyMe: async () => {
        await this.locators.notifyMeButton.click();
      },
    };
  }
}
