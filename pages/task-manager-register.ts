import { Page, Locator, expect } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly loginLink: Locator;
  readonly pageContainer: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId('register-name');
    this.emailInput = page.getByTestId('register-email');
    this.passwordInput = page.getByTestId('register-password');
    this.submitButton = page.getByTestId('register-submit');
    this.errorMessage = page.getByTestId('register-error');
    this.successMessage = page.getByTestId('register-success');
    this.loginLink = page.getByRole('link', { name: 'Login' });
    this.pageContainer = page.getByTestId('register-page');
    this.pageTitle = page.getByTestId('register-title');
  }

  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/register`);
  }

  async fillRegistrationForm(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async submitRegistration() {
    await this.submitButton.click();
  }

  async register(name: string, email: string, password: string) {
    await this.fillRegistrationForm(name, email, password);
    await this.submitRegistration();
  }

  async expectSuccessMessage() {
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText('Registration successful');
  }

  async expectErrorMessage(errorText: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(errorText);
  }

  async navigateToLogin() {
    await this.loginLink.click();
  }

  async checkPageStyling() {
    await expect(this.submitButton).toHaveCSS('background-color', 'rgb(59, 130, 246)');
    await expect(this.pageContainer).toHaveCSS('border-radius', '8px');
  }
}
