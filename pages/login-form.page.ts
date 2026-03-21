import { expect, Locator, Page } from '@playwright/test';

const BASE_URL = 'https://bonigarcia.dev/selenium-webdriver-java';

export class LoginFormPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly invalidAlert: Locator;
  readonly successAlert: Locator;
  readonly form: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Login form' });
    this.usernameInput = page.getByLabel('Login');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.invalidAlert = page.locator('#invalid');
    this.successAlert = page.locator('#success');
    this.form = page.locator('form');
  }

  async goto() {
    await this.page.goto(`${BASE_URL}/login-form.html`);
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectSuccessfulLogin() {
    await expect(this.page).toHaveURL(/login-sucess\.html/);
    await expect(this.successAlert).toBeVisible();
    await expect(this.successAlert).toHaveText('Login successful');
  }

  async expectInvalidCredentials() {
    await expect(this.page).toHaveURL(/login-form\.html/);
    await expect(this.invalidAlert).toBeVisible();
    await expect(this.invalidAlert).toHaveText('Invalid credentials');
  }
}
