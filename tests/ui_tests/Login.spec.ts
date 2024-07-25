import {expect, test} from '@playwright/test';
import {LoginPage} from '../../pages/LoginPage';

let loginPage = new LoginPage();

test.describe(`Helix Login as Admin`, () => {
    test.beforeEach(async ({page}) => {
        await loginPage.login(page);
    });

    test(`Login as Admin and Verify User Account Role`, async ({page}) => {
        await test.step("Navigate to Dashboard Page and Verify User has Landed on Dashboard Page", async () => {
            await page.waitForLoadState('load');
            await page.getByText('Aspirion Compass').waitFor();
            await expect(page.getByRole('menuitem')).toContainText('Aspirion Compass');
        });
        await test.step("Click on User DropDown and Verify UserRole", async () => {
            await page.getByRole('button', {name: 'USER'}).click();
            await expect(page.getByRole('menu')).toContainText("admin");
        });
    });
});
