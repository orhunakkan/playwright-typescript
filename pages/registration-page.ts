// pages/RegistrationFormPage.ts
import { Page, Locator, expect } from '@playwright/test';
import { EnvConfig } from '../utilities/env-config';
import userData from '../fixtures/user-data.json';

export class RegistrationPage {
  // Page URL
  private readonly url = `${EnvConfig.getBaseUrl()}/registration_form`;

  // Locators
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly phoneInput: Locator;
  readonly maleGenderRadio: Locator;
  readonly femaleGenderRadio: Locator;
  readonly birthDateInput: Locator;
  readonly departmentSelect: Locator;
  readonly jobTitleSelect: Locator;
  readonly javaCheckbox: Locator;
  readonly javascriptCheckbox: Locator;
  readonly cPlusCheckbox: Locator;
  readonly submitButton: Locator;
  readonly confirmationMessage: Locator;

  // Error message locators
  readonly usernameError: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly phoneError: Locator;

  constructor(private page: Page) {
    // Initialize all locators
    this.firstNameInput = page.locator('input[name="firstname"]');
    this.lastNameInput = page.locator('input[name="lastname"]');
    this.usernameInput = page.locator('input[name="username"]');
    this.emailInput = page.locator('input[name="email"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.phoneInput = page.locator('input[name="phone"]');
    this.maleGenderRadio = page.locator('input[name="gender"][value="male"]');
    this.femaleGenderRadio = page.locator('input[name="gender"][value="female"]');
    this.birthDateInput = page.locator('input[name="birthday"]');
    this.departmentSelect = page.locator('select[name="department"]');
    this.jobTitleSelect = page.locator('select[name="job_title"]');
    this.javaCheckbox = page.locator('#inlineCheckbox2');
    this.javascriptCheckbox = page.locator('#inlineCheckbox3');
    this.cPlusCheckbox = page.locator('#inlineCheckbox1');
    this.submitButton = page.locator('#wooden_spoon');
    this.confirmationMessage = page.locator('.alert-success');

    // Error message locators
    this.usernameError = page.locator('small:text-matches("username must be more than 6")');
    this.emailError = page.locator('small:text-matches("Email format is not correct")');
    this.passwordError = page.locator('small:text-matches("password must have at least 8 characters")');
    this.phoneError = page.locator('small:text-matches("Phone format is not correct")');
  }

  // Navigation methods
  async goto() {
    await this.page.goto(this.url);
  }

  // Form filling methods
  async fillFirstName(firstName: string) {
    await this.firstNameInput.fill(firstName);
  }

  async fillLastName(lastName: string) {
    await this.lastNameInput.fill(lastName);
  }

  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async fillPhone(phone: string) {
    await this.phoneInput.fill(phone);
  }

  async selectGender(gender: string) {
    if (gender === 'male') {
      await this.maleGenderRadio.check();
    } else {
      await this.femaleGenderRadio.check();
    }
  }

  async fillBirthDate(date: string) {
    await this.birthDateInput.fill(date);
  }

  async selectDepartment(departmentCode: string) {
    await this.departmentSelect.selectOption(departmentCode);
  }

  async selectJobTitle(jobTitle: string) {
    await this.jobTitleSelect.selectOption({ label: jobTitle });
  }

  async selectProgrammingLanguages(languages: string[]) {
    for (const language of languages) {
      switch (language) {
        case 'Java':
          await this.javaCheckbox.check();
          break;
        case 'JavaScript':
          await this.javascriptCheckbox.check();
          break;
        case 'C++':
          await this.cPlusCheckbox.check();
          break;
      }
    }
  }

  async submitForm() {
    await this.submitButton.click();
  }

  // Helper methods for full form submission
  async fillFormWithValidData() {
    await this.fillFirstName(userData.validUser.firstName);
    await this.fillLastName(userData.validUser.lastName);
    await this.fillUsername(userData.validUser.username);
    await this.fillEmail(userData.validUser.email);
    await this.fillPassword(userData.validUser.password);
    await this.fillPhone(userData.validUser.phone);
    await this.selectGender(userData.validUser.gender);
    await this.fillBirthDate(userData.validUser.birthday);
    await this.selectDepartment(userData.validUser.department);
    await this.selectJobTitle(userData.validUser.jobTitle);
    
    if (userData.validUser.programmingLanguages) {
      await this.selectProgrammingLanguages(userData.validUser.programmingLanguages);
    }
  }

  // Verification methods
  async verifySuccessfulRegistration() {
    await this.page.waitForURL(/.*registration_confirmation.*/);
    const message = await this.confirmationMessage.textContent();
    expect(message).toContain("You've successfully completed registration!");
  }

  async verifyValidationErrors() {
    await expect(this.usernameError).toBeVisible();
    await expect(this.emailError).toBeVisible();
    await expect(this.passwordError).toBeVisible();
    await expect(this.phoneError).toBeVisible();
  }

  async verifyStillOnRegistrationPage() {
    expect(this.page.url()).toContain('registration_form');
  }
}
