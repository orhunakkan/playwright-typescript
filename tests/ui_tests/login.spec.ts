import { test } from '@playwright/test';
import * as dotenv from 'dotenv';
const CommonPage = require("../../pages/commonUtils");
const { DashBoardPage } = require("../../pages/dashBoardPage");

let commonPage = new CommonPage();
let dashboardPage: { verifyHeader: () => any; verifyUserRole: (arg0: string) => any; };
dotenv.config();

const userRoles = [
    { role: "analyst" },
    { role: "manager" },
    { role: "admin" },
    { role: "Analyst 2" }
];

userRoles.forEach((user) => {
    test.describe(`@smoke Helix Login as ${user.role}`, () => {
        test.beforeEach(async ({ page }) => {
            await commonPage.loginAndNavigate(page, user.role);
            dashboardPage = new DashBoardPage(page);
        });

        test(`10568 - Helix Login as ${user.role} and verify User Account Role`, {tag: ['@smoke', '@login']}, async () => {
            await test.step("Navigate to Dashboard Page and Verify User has Landed on Dashboard Page", async () => {
                await dashboardPage.verifyHeader();
            });
            await test.step("Click on User DropDown and Verify UserRole", async () => {
                await dashboardPage.verifyUserRole(user.role);
            });
        });
    });
});