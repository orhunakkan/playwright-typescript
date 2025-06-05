import { test, expect } from "playwright/test";

test.describe("Heroku App - Smoke Suite @smoke", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should load the homepage and validate title and basic elements", async ({ page }) => {
    expect(await page.title()).toBe("The Internet");
    expect(await page.locator("h1").textContent()).toBe("Welcome to the-internet");
    expect(await page.locator("h2").textContent()).toBe("Available Examples");
  });
});
