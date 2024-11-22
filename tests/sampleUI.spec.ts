import {expect, test} from '@playwright/test';
import {SamplePage} from '../pages/samplePage';

const baseURL = 'https://formy-project.herokuapp.com/';

test.describe('Formy Complete Web Form', () => {
    test('Submit Webform and Validate', async ({page}) => {
        const samplePage = new SamplePage();
        await page.goto(`${baseURL}form`);
        await page.fill(samplePage.firstNameInput, 'John');
        await page.fill(samplePage.lastNameInput, 'Doe');
        await page.fill(samplePage.jobTitleInput, 'QA Engineer');
        await page.click(samplePage.radioButton);
        await page.click(samplePage.checkbox);
        await page.fill(samplePage.datepicker, '01/01/2022');
        await page.click(samplePage.submitButton);
        const successMessage = await page.textContent(samplePage.successMessage);
        expect(successMessage).toContain('The form was successfully submitted!');
    });
});