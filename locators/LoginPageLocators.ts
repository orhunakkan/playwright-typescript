import { Page } from '@playwright/test';

export const LoginPageLocators = {
    getLoginButton: (page: Page) => page.getByRole("button", {name: "Login"}),
};