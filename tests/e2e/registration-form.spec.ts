import { test } from '@playwright/test';
import { RegistrationFormPage } from '../../pages/registration-page';

test.describe('Registration Form Tests', () => {
  let registrationPage: RegistrationFormPage;

  test.beforeEach(async ({ page }) => {
    registrationPage = new RegistrationFormPage(page);
    await registrationPage.goto();
  });

  test('should successfully submit the registration form with valid data', async () => {
    // Fill in the form with valid data using our Page Object methods
    await registrationPage.fillFormWithValidData();

    // Submit the form
    await registrationPage.submitForm();

    // Verify successful registration
    await registrationPage.verifySuccessfulRegistration();
  });

  test('should display validation errors for invalid form submission', async () => {
    // Fill form with invalid data
    await registrationPage.fillFirstName('Jane');
    await registrationPage.fillLastName('Smith');
    await registrationPage.fillUsername('jane'); // Too short username
    await registrationPage.fillEmail('invalid-email'); // Invalid email
    await registrationPage.fillPassword('pass'); // Too short password
    await registrationPage.fillPhone('123-456'); // Invalid phone format

    // Verify validation errors
    await registrationPage.verifyValidationErrors();

    // Check that we're still on the registration page
    await registrationPage.verifyStillOnRegistrationPage();
  });
});
