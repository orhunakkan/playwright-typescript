import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class SlowLoginFormPage {
  readonly locators: {
    heading: Locator;
    usernameInput: Locator;
    passwordInput: Locator;
    submitButton: Locator;
    spinner: Locator;
    invalidAlert: Locator;
    successAlert: Locator;
    form: Locator;
    copyright: Locator;
    authorLink: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Slow login form' }),
      usernameInput: page.getByLabel('Login'),
      passwordInput: page.getByLabel('Password'),
      submitButton: page.getByRole('button', { name: 'Submit' }),
      spinner: page.locator('#spinner'),
      invalidAlert: page.locator('#invalid'),
      successAlert: page.locator('#success'),
      form: page.locator('#form'),
      copyright: page.getByText('Copyright © 2021-2026'),
      authorLink: page.getByRole('link', { name: 'Boni García' }),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/login-slow.html`);
      },
      login: async (username: string, password: string) => {
        await this.locators.usernameInput.fill(username);
        await this.locators.passwordInput.fill(password);
        await this.locators.submitButton.click();
      },
    };
  }
}
