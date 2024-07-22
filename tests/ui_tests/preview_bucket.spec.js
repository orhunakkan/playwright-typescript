const { test } = require("@playwright/test");
const CommonPage = require("../../pages/common-utils");
import { DashBoardPage } from "../../pages/dashBoardPage";
let commonPage;
let dashboardPage;
commonPage = new CommonPage();

const userRoles = [
  { role: "analyst" },
  { role: "manager" },
  { role: "admin" },
  { role: "Analyst 2" }
];

userRoles.forEach((user) => {
  test.describe(`Helix Login as ${user.role} `, { tag: ["@smoke", "@login"] }, () => {
      test.beforeEach(async ({ page }) => {
        await commonPage.loginAndNavigate(page, user.role);
        dashboardPage = new DashBoardPage(page);
      });

      test(`10568 - Helix Login as ${user.role} and verify Preview Accounts Display the Correct Service Line`, async ({page}) => {
        await test.step("Navigate to Dashboard Page and Verify User has Landed on Dashboard Page", async () => {
          await dashboardPage.verifyHeader();
        });

        await test.step("Click on Other Actions Button", async () => {
          await dashboardPage.clickOtherActions();
        });

        await test.step("Enter Create Bucket Data & Click on Preview & Verify Preview State", async () => {
          await dashboardPage.clickCreateBucket();
          await dashboardPage.fillCreateBucketDetails("Testing 101", "Ambulance Billing MVA/PL");
          await dashboardPage.clickOnPreviewButtonAndVerify("Ambulance Billing MVA/PL");
          await dashboardPage.verifyPreviewPanel();
        });
      });
    }
  );
});
