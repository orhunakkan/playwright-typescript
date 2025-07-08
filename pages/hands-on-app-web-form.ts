import { Page } from '@playwright/test';

export class WebFormPage {
  constructor(private page: Page) {}

  get headingPracticeSite() {
    return this.page.getByRole('heading', { name: 'Practice site' });
  }

  get headingWebForm() {
    return this.page.getByRole('heading', { name: 'Web form' });
  }

  get textInput() {
    return this.page.getByRole('textbox', { name: 'Text input' });
  }

  get passwordInput() {
    return this.page.getByRole('textbox', { name: 'Password' });
  }

  get textArea() {
    return this.page.getByRole('textbox', { name: 'Textarea' });
  }

  get submitButton() {
    return this.page.getByRole('button', { name: 'Submit' });
  }

  get headingFormSubmitted() {
    return this.page.getByRole('heading', { name: 'Form submitted' });
  }
}
