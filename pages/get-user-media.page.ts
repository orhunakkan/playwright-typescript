import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

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
        await this.page.goto(`${config.e2eUrl}/get-user-media.html`);
      },
      clickStart: async () => {
        await this.locators.startButton.click();
      },
    };
  }
}
