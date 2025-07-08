import { Page } from '@playwright/test';

export class HerokuAppHomePage {
  constructor(private page: Page) {}

  get Title() {
    return this.page.title();
  }

  get header1() {
    return this.page.locator('h1');
  }

  get header2() {
    return this.page.locator('h2');
  }
}
