import {Page, Locator, expect} from '@playwright/test';

export class FormPage {
    private page: Page;
    private textInput: Locator;
    private passwordInput: Locator;
    private textareaInput: Locator;
    private submitButton: Locator;
    private formSubmittedHeading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.textInput = this.page.getByLabel('Text input');
        this.passwordInput = this.page.getByLabel('Password');
        this.textareaInput = this.page.getByLabel('Textarea');
        this.submitButton = this.page.getByRole('button', { name: 'Submit' });
        this.formSubmittedHeading = this.page.getByRole('heading', { name: 'Form submitted' });
    }

    async navigate() {
        await this.page.goto('https://bonigarcia.dev/selenium-webdriver-java/web-form.html');
    }

    async fillForm(textInput: string, password: string, textarea: string) {
        await this.textInput.fill(textInput);
        await this.passwordInput.fill(password);
        await this.textareaInput.fill(textarea);
    }

    async submitForm() {
        await this.submitButton.click();
    }

    async assertFormSubmission() {
        await expect(this.formSubmittedHeading).toBeVisible();
    }
}
