import { Page } from "@playwright/test";

export class HerokuAppHomePage {

    constructor(private page: Page) { }

    async getTitle() {
        return this.page.title();
    }

    async getHeader1Text() {
        return this.page.locator("h1").textContent();
    }

    async getHeader2Text() {
        return this.page.locator("h2").textContent();
    }
}
