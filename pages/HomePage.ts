import {Page} from 'playwright';
import {expect, Locator} from "@playwright/test";

export class HomePage {

    readonly page: Page;
    readonly innerTitle: Locator;

    constructor(page: Page) {
        this.page = page;
        this.innerTitle = page.locator("//h1");
    }

    async navigate() {
        await this.page.goto('https://example.com');
    }

    async getTitle() {
        return this.page.title();
    }

    async getInnerTitle() {
        expect(await this.innerTitle.textContent()).toEqual("Example Domain");
    }
}
