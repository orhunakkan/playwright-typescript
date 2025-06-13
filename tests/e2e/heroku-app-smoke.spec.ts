import { test, expect } from "playwright/test";
import { HerokuAppHomePage } from "../../pages/heroku-app-home-page";

test.describe("Heroku App - Smoke Suite", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the homepage and validate title and basic elements", async ({ page }) => {
    const homePage = new HerokuAppHomePage(page);
    expect(await homePage.getTitle()).toBe("The Internet");
    expect(await homePage.getHeader1Text()).toBe("Welcome to the-internet");
    expect(await homePage.getHeader2Text()).toBe("Available Examples");
  });
});
