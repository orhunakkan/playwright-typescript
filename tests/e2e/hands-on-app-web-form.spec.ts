import { test, expect } from '@playwright/test';
import { WebFormPage } from '../../pages/hands-on-app-web-form';

const pagePath = 'https://bonigarcia.dev/selenium-webdriver-java/web-form.html';

test.describe('Hands on App - Web Form', () => {
  let webFormPage: WebFormPage;

  test.beforeEach(async ({ page }) => {
    await page.goto(pagePath);
    webFormPage = new WebFormPage(page);
  });

  test('should fill out the form and submit', async ({ page }) => {
    await webFormPage.headingPracticeSite.isVisible();
    await webFormPage.headingWebForm.isVisible();
    await webFormPage.textInput.fill('QQQQQQQQQQ');
    await webFormPage.passwordInput.fill('AAAAAAAAAA');
    await webFormPage.textArea.fill('ZZZZZZZZZZ');
    await webFormPage.submitButton.click();
    await expect(webFormPage.headingFormSubmitted).toBeVisible();
  });
});
