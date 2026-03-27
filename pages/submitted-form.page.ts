import { Locator, Page } from '@playwright/test';
import { BASE_URL } from './base-url';

export class SubmittedFormPage {
  readonly locators: {
    heading: Locator;
    receivedText: Locator;
  };
  readonly actions: Record<string, (...args: any[]) => Promise<void>>;

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Form submitted' }),
      receivedText: page.getByText('Received!'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${BASE_URL}/submitted-form.html`);
      },
    };
  }
}
