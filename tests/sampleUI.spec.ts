import {expect, test} from '@playwright/test';

const baseURL = 'https://formy-project.herokuapp.com/';

test.describe('Formy Complete Web Form', () => {

    test('Submit Webform and Validate', async ({page}) => {
        await page.goto(`${baseURL}form`);
        await page.fill('#first-name', 'John');
        await page.fill('#last-name', 'Doe');
        await page.fill('#job-title', 'QA Engineer');
        await page.click('#radio-button-2');
        await page.click('#checkbox-1');
        await page.selectOption('select', '1');
        await page.fill('#datepicker', '01/01/2022');
        await page.click('.btn.btn-lg.btn-primary');
        const successMessage = await page.textContent('.alert.alert-success');
        expect(successMessage).toContain('The form was successfully submitted!');
    });
});