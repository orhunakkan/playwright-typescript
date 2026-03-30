import { Locator, Page } from '@playwright/test';

export class DataTypesPage {
  readonly locators: {
    heading: Locator;
    firstNameInput: Locator;
    lastNameInput: Locator;
    addressInput: Locator;
    zipCodeInput: Locator;
    cityInput: Locator;
    countryInput: Locator;
    emailInput: Locator;
    phoneInput: Locator;
    jobPositionInput: Locator;
    companyInput: Locator;
    submitButton: Locator;
    formInputs: Locator;
    form: Locator;
    copyright: Locator;
    resultField: (id: string) => Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    fillAllFields: (data: {
      firstName: string;
      lastName: string;
      address: string;
      zipCode: string;
      city: string;
      country: string;
      email: string;
      phone: string;
      jobPosition: string;
      company: string;
    }) => Promise<void>;
    submit: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Data types' }),
      firstNameInput: page.getByLabel('First name'),
      lastNameInput: page.getByLabel('Last name'),
      addressInput: page.getByLabel('Address'),
      zipCodeInput: page.getByLabel('Zip code'),
      cityInput: page.getByLabel('City'),
      countryInput: page.getByLabel('Country'),
      emailInput: page.getByLabel('E-mail'),
      phoneInput: page.getByLabel('Phone number'),
      jobPositionInput: page.getByLabel('Job position'),
      companyInput: page.getByLabel('Company'),
      submitButton: page.getByRole('button', { name: 'Submit' }),
      formInputs: page.locator('form input.form-control'),
      form: page.locator('form'),
      copyright: page.getByText('Copyright © 2021-2025'),
      resultField: (id: string) => page.locator(`#${id}`),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${process.env.PRACTICE_E2E_URL}/data-types.html`);
      },
      fillAllFields: async (data: {
        firstName: string;
        lastName: string;
        address: string;
        zipCode: string;
        city: string;
        country: string;
        email: string;
        phone: string;
        jobPosition: string;
        company: string;
      }) => {
        await this.locators.firstNameInput.fill(data.firstName);
        await this.locators.lastNameInput.fill(data.lastName);
        await this.locators.addressInput.fill(data.address);
        await this.locators.zipCodeInput.fill(data.zipCode);
        await this.locators.cityInput.fill(data.city);
        await this.locators.countryInput.fill(data.country);
        await this.locators.emailInput.fill(data.email);
        await this.locators.phoneInput.fill(data.phone);
        await this.locators.jobPositionInput.fill(data.jobPosition);
        await this.locators.companyInput.fill(data.company);
      },
      submit: async () => {
        await this.locators.submitButton.click();
      },
    };
  }
}
