import {test} from '@playwright/test';
import {HelixLoginPage} from '../../pages/HelixLoginPage';
import {generateUniqueString} from '../../helpers/HelixHelperFunctions';

let loginPage = new HelixLoginPage();

test.describe("Create Bucket Feature", () => {
    test.beforeEach(async ({page}) => {
        await loginPage.login(page);
    });

    test("Create bucket by selecting a service line", async ({page}) => {
        await test.step("Create bucket and verify", async () => {
            await page.waitForLoadState('load');
            await page.getByRole('button', {name: 'OTHER ACTIONS'}).click();
            await page.getByRole('menuitem', {name: 'Create new bucket'}).click();
            await page.getByLabel('Name').click();
            await page.getByLabel('Name').fill(generateUniqueString());
            await page.getByText('Select...').first().click();
            page.getByRole('option', {name: 'Service Line'});
            await page.locator('.custom_select__input-container').click();
            await page.getByRole('option', {name: 'Motor Vehicle Accident'}).click();
            await page.getByRole('button', {name: 'CREATE'}).click();
        });
    });
});