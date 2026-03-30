import { Locator, Page } from '@playwright/test';

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
        await this.page.goto(`${process.env.PRACTICE_E2E_URL}/submitted-form.html`);
      },
    };
  }
}
