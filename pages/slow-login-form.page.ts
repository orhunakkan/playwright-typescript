import { Locator, Page } from '@playwright/test';
import { BASE_URL } from './base-url';

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
  };
  readonly actions: Record<string, (...args: any[]) => Promise<void>>;

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
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${BASE_URL}/login-slow.html`);
      },
      login: async (username: string, password: string) => {
        await this.locators.usernameInput.fill(username);
        await this.locators.passwordInput.fill(password);
        await this.locators.submitButton.click();
      },
    };
  }
}
