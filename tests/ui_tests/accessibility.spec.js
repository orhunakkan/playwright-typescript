import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
const CommonPage = require("../../pages/common-utils");
const { DashBoardPage } = require("../../pages/dashBoardPage");

let commonPage = new CommonPage();
let dashboardPage;

test.describe(`@smoke Helix Login as analyst`, () => {
  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashBoardPage(page);
    await commonPage.loginAndNavigate(page, "analyst");
  });

  test(
    "- Helix Login and Verify Dashboard Page Accessibility",
    { tag: ["@accessibility"] },
    async ({ page }) => {
      await test.step("Navigate to Dashboard Page and Verify Accessibility on Dashboard Page", async () => {
        await dashboardPage.verifyHeader();
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  );

  test(
    "- Helix Login and Verify Login Page Accessibility",
    { tag: ["@accessibility"] },
    async ({ page }) => {
      await test.step("Navigate to Login Page and Verify Accessibility on Login Page", async () => {
        await page.goto("https://helix-qa.aspirion.com/login");
        await expect(
          page.getByRole("img", { name: "ASPIRION LOGO" })
        ).toBeVisible();
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  );
});
