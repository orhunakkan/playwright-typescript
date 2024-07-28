import {Page} from '@playwright/test';
import dotenv from 'dotenv';
import {HelixLoginPageLocators} from "../locators/HelixLoginPageLocators";

dotenv.config();

export class HelixLoginPage {

    async login(page: Page) {

        const url = process.env.BASE_URL as string;
        const username = process.env.ADMIN_USERNAME as string;
        const password = process.env.ADMIN_PASSWORD as string;

        await page.goto(url);
        const [popup] = await Promise.all([
            page.waitForEvent("popup"),
            HelixLoginPageLocators.getLoginButton(page).click()
        ]);
        await popup.waitForLoadState();
        await popup.getByPlaceholder("someone@example.com").fill(username);
        await popup.getByRole("button", {name: "Next"}).click();
        await popup.getByPlaceholder("Password").fill(password);
        await popup.getByRole("button", {name: "Sign in"}).click({force: true});

    }
}