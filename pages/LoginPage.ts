import {Page} from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export class LoginPage {

    async login(page: Page) {

        const url = process.env.BASE_URL as string;
        const username = process.env.ADMIN_USERNAME as string;
        const password = process.env.ADMIN_PASSWORD as string;

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

    }
}