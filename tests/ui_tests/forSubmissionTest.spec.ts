import {test} from '@playwright/test';
import {FormPage} from '../../pages/FormPage';
import {generateRandomFormData} from '../../helpers/fakerHelper';

test('UI Test: Form Submission with Random Data', async ({page}) => {
    const formPage = new FormPage(page);
    const formData = generateRandomFormData();
    await formPage.navigate();
    await formPage.fillForm(formData.textInput, formData.password, formData.textarea);
    await formPage.submitForm();
    await formPage.assertFormSubmission();
});
