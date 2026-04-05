import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class LoadingImagesPage {
  readonly locators: {
    spinner: Locator;
    text: Locator;
    compassImg: Locator;
    calendarImg: Locator;
    awardImg: Locator;
    landscapeImg: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      spinner: page.locator('#spinner'),
      text: page.locator('#text'),
      compassImg: page.locator('#compass'),
      calendarImg: page.locator('#calendar'),
      awardImg: page.locator('#award'),
      landscapeImg: page.locator('#landscape'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/loading-images.html`);
      },
    };
  }
}
