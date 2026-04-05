import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class SubmittedFormPage {
  readonly locators: {
    heading: Locator;
    receivedText: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Form submitted' }),
      receivedText: page.getByText('Received!'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/submitted-form.html`);
      },
    };
  }
}
