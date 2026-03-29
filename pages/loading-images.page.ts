import { Locator, Page } from '@playwright/test';
import { BASE_URL } from './base-url';

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
        await this.page.goto(`${BASE_URL}/loading-images.html`);
      },
    };
  }
}
