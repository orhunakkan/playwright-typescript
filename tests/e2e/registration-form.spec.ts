import { test } from '@playwright/test';
import { RegistrationPage } from '../../pages/registration-page';
import userData from '../../fixtures/user-data.json';

test.describe('Registration Form Tests', () => {
  let registrationPage: RegistrationPage;

  test.beforeEach(async ({ page }) => {
    registrationPage = new RegistrationPage(page);
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
    // Fill form with invalid data from JSON file
    await registrationPage.fillFirstName(userData.invalidUser.firstName);
    await registrationPage.fillLastName(userData.invalidUser.lastName);
    await registrationPage.fillUsername(userData.invalidUser.username);
    await registrationPage.fillEmail(userData.invalidUser.email);
    await registrationPage.fillPassword(userData.invalidUser.password);
    await registrationPage.fillPhone(userData.invalidUser.phone);
    
    // Verify validation errors
    await registrationPage.verifyValidationErrors();

    // Check that we're still on the registration page
    await registrationPage.verifyStillOnRegistrationPage();
  });
});
