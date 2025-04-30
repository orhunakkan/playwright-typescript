import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly pageContainer: Locator;
  readonly pageTitle: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.submitButton = page.getByTestId('login-submit');
    this.errorMessage = page.getByTestId('login-error');
    this.registerLink = page.getByRole('link', { name: 'Register' });
    this.pageContainer = page.getByTestId('login-page');
    this.pageTitle = page.getByTestId('login-title');
    this.forgotPasswordLink = page.getByTestId('forgot-password-link');
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/login`);
  }

  async fillLoginForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submitLogin() {
    await this.submitButton.click();
  }

  async login(email: string, password: string) {
    await this.fillLoginForm(email, password);
    await this.submitLogin();
  }

  async expectErrorMessage(errorText: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(errorText);
  }

  async navigateToRegister() {
    await this.registerLink.click();
  }

  async navigateToForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  async checkPageStyling() {
    await expect(this.submitButton).toHaveCSS('background-color', 'rgb(59, 130, 246)');
    await expect(this.pageContainer).toHaveCSS('border-radius', '8px');
  }

  async verifyOnLoginPage(baseUrl: string) {
    await expect(this.page.url()).toBe(`${baseUrl}/login`);
    await expect(this.pageContainer).toBeVisible();
    await expect(this.pageTitle).toHaveText('Login');
  }
}
