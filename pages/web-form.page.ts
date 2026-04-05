import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class WebFormPage {
  readonly locators: {
    heading: Locator;
    textInput: Locator;
    passwordInput: Locator;
    textarea: Locator;
    disabledInput: Locator;
    readonlyInput: Locator;
    dropdown: Locator;
    dropdownOptions: Locator;
    datalistInput: Locator;
    datalistOptions: Locator;
    fileInput: Locator;
    checkedCheckbox: Locator;
    defaultCheckbox: Locator;
    checkedRadio: Locator;
    defaultRadio: Locator;
    colorPicker: Locator;
    datePicker: Locator;
    rangeSlider: Locator;
    hiddenInput: Locator;
    submitButton: Locator;
    returnToIndexLink: Locator;
    textInputById: Locator;
    textInputByCustomAttr: Locator;
    textInputByName: Locator;
    passwordInputByName: Locator;
    textareaByName: Locator;
    datalistOption: (city: string) => Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    submitForm: () => Promise<void>;
    uploadFile: (filePath: string) => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Web form' }),
      textInput: page.getByRole('textbox', { name: 'Text input' }),
      passwordInput: page.getByRole('textbox', { name: 'Password' }),
      textarea: page.getByRole('textbox', { name: 'Textarea' }),
      disabledInput: page.getByRole('textbox', { name: 'Disabled input' }),
      readonlyInput: page.getByRole('textbox', { name: 'Readonly input' }),
      dropdown: page.getByRole('combobox', { name: 'Dropdown (select)' }),
      dropdownOptions: page.getByRole('combobox', { name: 'Dropdown (select)' }).getByRole('option'),
      datalistInput: page.getByRole('combobox', { name: 'Dropdown (datalist)' }),
      datalistOptions: page.locator('#my-options option'),
      fileInput: page.locator('input[type="file"]'),
      checkedCheckbox: page.getByRole('checkbox', { name: 'Checked checkbox' }),
      defaultCheckbox: page.getByRole('checkbox', { name: 'Default checkbox' }),
      checkedRadio: page.getByRole('radio', { name: 'Checked radio' }),
      defaultRadio: page.getByRole('radio', { name: 'Default radio' }),
      colorPicker: page.locator('input[type="color"]'),
      datePicker: page.getByRole('textbox', { name: 'Date picker' }),
      rangeSlider: page.getByRole('slider', { name: 'Example range' }),
      hiddenInput: page.locator('input[name="my-hidden"]'),
      submitButton: page.getByRole('button', { name: 'Submit' }),
      returnToIndexLink: page.getByRole('link', { name: 'Return to index' }),
      textInputById: page.locator('#my-text-id'),
      textInputByCustomAttr: page.locator('[myprop="myvalue"]'),
      textInputByName: page.locator('[name="my-text"]'),
      passwordInputByName: page.locator('[name="my-password"]'),
      textareaByName: page.locator('[name="my-textarea"]'),
      datalistOption: (city: string) => page.locator(`#my-options option[value="${city}"]`),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/web-form.html`);
      },
      submitForm: async () => {
        await this.locators.submitButton.click();
      },
      uploadFile: async (filePath: string) => {
        await this.locators.fileInput.setInputFiles(filePath);
      },
    };
  }
}
