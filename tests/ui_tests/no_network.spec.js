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
  test.describe(`Feature 15270: Network Outage Notification - ${user.role}`, () => {
    test.beforeEach(async ({ page }) => {
      dashboardPage = new DashBoardPage(page);
      await commonPage.loginAndNavigate(page, user.role);
    });

    test(`15270 - User should see "No Internet" pop up when there is no internet connection - ${user.role}`, async () => {
      await test.step("Navigate to Dashboard Page and Verify User has Landed on Dashbaord Page", async () => {
        await dashboardPage.verifyHeader();
      });
      await test.step("Simulate going offline and verify 'No Internet' message", async () => {
        await dashboardPage.goOfflineAndVerifyNoNetworkMessage();
      });
      await test.step("Simulate going online and verify 'No Internet' message no longer exists", async () => {
        await dashboardPage.goOnlineAndVerifyNoNetworkMessageNotExist();
      });
    });
  });
});
