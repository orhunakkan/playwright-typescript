import {expect, test} from '@playwright/test';

test.describe('Waiting', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/waiting');
    });

    test('wait for a specific amount of time', async ({page}) => {
        await page.locator('.wait-input1').fill('Wait 1000ms after typing');
        await page.waitForTimeout(1000);
        await page.locator('.wait-input2').fill('Wait 1000ms after typing');
        await page.waitForTimeout(1000);
        await page.locator('.wait-input3').fill('Wait 1000ms after typing');
        await page.waitForTimeout(1000);
    });

    test('wait for a specific route', async ({page}) => {
        await page.route('**/comments/*', route => route.fulfill({status: 200}));
        await page.locator('.network-btn').click();
        const response = await page.waitForResponse('**/comments/*');
        expect([200, 304]).toContain(response.status());
    });
});