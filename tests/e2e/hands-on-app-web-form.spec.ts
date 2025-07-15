import { test, expect } from '@playwright/test';
import { WebFormPage } from '../../pages/hands-on-app-web-form';
import { generateDynamicPasswordInput, generateDynamicTextArea, generateDynamicTextInput } from '../../utilities/e2e-dynamic-content';

const pagePath = 'https://bonigarcia.dev/selenium-webdriver-java/web-form.html';

test.describe('Hands on App - Web Form', () => {
  let webFormPage: WebFormPage;

  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
    webFormPage = new WebFormPage(page);
  });

  test('should fill out the form and submit', async () => {
    await webFormPage.headingPracticeSite.isVisible();
    await webFormPage.headingWebForm.isVisible();
    await webFormPage.textInput.fill(generateDynamicTextInput());
    await webFormPage.passwordInput.fill(generateDynamicPasswordInput());
    await webFormPage.textArea.fill(generateDynamicTextArea());
    await webFormPage.submitButton.click();
    await expect(webFormPage.headingFormSubmitted).toBeVisible();
  });
});
