import { Locator, Page } from '@playwright/test';
import { BASE_URL } from './base-url';

export class GetUserMediaPage {
  readonly locators: {
    heading: Locator;
    startButton: Locator;
    video: Locator;
    videoDevice: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    clickStart: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Get user media' }),
      startButton: page.getByRole('button', { name: 'Start' }),
      video: page.locator('#my-video'),
      videoDevice: page.locator('#video-device'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${BASE_URL}/get-user-media.html`);
      },
      clickStart: async () => {
        await this.locators.startButton.click();
      },
    };
  }
}
