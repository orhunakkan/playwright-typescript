import {expect, test} from '@playwright/test';

test.describe('Aliasing', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/aliasing');
    });

    test('.as() - alias a DOM element for later use', async ({page}) => {
        const firstBtn = page.locator('.as-table tbody > tr:first-child td:first-child button');
        await firstBtn.click();
        await expect(firstBtn).toHaveClass(/btn-success/);
        await expect(firstBtn).toContainText('Changed');
    });

    test('.as() - alias a route for later use', async ({page}) => {
        await page.route('**/comments/*', route => route.continue());
        await page.click('.network-btn');
        const response = await page.waitForResponse(response => response.url().includes('/comments/') && response.status() === 200);
        expect(response.ok()).toBeTruthy();
    });
});