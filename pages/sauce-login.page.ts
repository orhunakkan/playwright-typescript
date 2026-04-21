import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class SauceLoginPage {
  readonly locators: {
    usernameInput: Locator;
    passwordInput: Locator;
    loginButton: Locator;
    errorMessage: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      usernameInput: page.getByPlaceholder('Username'),
      passwordInput: page.getByPlaceholder('Password'),
      loginButton: page.getByRole('button', { name: 'Login' }),
      errorMessage: page.locator('[data-test="error"]'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(config.sauceDemoUrl);
      },
      login: async (username: string, password: string) => {
        await this.locators.usernameInput.fill(username);
        await this.locators.passwordInput.fill(password);
        await this.locators.loginButton.click();
      },
    };
  }
}
