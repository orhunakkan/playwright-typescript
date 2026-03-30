import { Locator, Page } from '@playwright/test';

export class LoginFormPage {
  readonly locators: {
    heading: Locator;
    usernameInput: Locator;
    passwordInput: Locator;
    submitButton: Locator;
    invalidAlert: Locator;
    successAlert: Locator;
    form: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    login: (username: string, password: string) => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Login form' }),
      usernameInput: page.getByLabel('Login'),
      passwordInput: page.getByLabel('Password'),
      submitButton: page.getByRole('button', { name: 'Submit' }),
      invalidAlert: page.locator('#invalid'),
      successAlert: page.locator('#success'),
      form: page.locator('form'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${process.env.PRACTICE_E2E_URL}/login-form.html`);
      },
      login: async (username: string, password: string) => {
        await this.locators.usernameInput.fill(username);
        await this.locators.passwordInput.fill(password);
        await this.locators.submitButton.click();
      },
    };
  }
}
