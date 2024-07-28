import { Page } from '@playwright/test';

export const HelixLoginPageLocators = {
    getLoginButton: (page: Page) => page.getByRole("button", {name: "Login"}),
};