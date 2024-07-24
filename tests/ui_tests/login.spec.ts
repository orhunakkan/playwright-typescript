import {expect, test} from '@playwright/test';

test.describe(`Helix Login as Admin`, () => {
    test.beforeEach(async ({page}) => {
        const url: string = "https://helix-qa.aspirion.com";
        const username: string = "compass_test_admin@aspirion.com"
        const password: string = "Rod!Opinion!3"
        await page.goto(url);
        const [popup] = await Promise.all([
            page.waitForEvent("popup"),
            page.getByRole("button", {name: "Login"}).click()
        ]);
        await popup.waitForLoadState();
        await popup.getByPlaceholder("someone@example.com").fill(username);
        await popup.getByRole("button", {name: "Next"}).click();
        await popup.getByPlaceholder("Password").fill(password);
        await popup.getByRole("button", {name: "Sign in"}).click({force: true});
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

