import {expect, test} from '@playwright/test';

test.describe('Waiting', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/waiting');
    });

    test('wait for a specific amount of time', async ({page}) => {
        await page.fill('.wait-input1', 'Wait 1000ms after typing');
        await page.waitForTimeout(1000);
        await page.fill('.wait-input2', 'Wait 1000ms after typing');
        await page.waitForTimeout(1000);
        await page.fill('.wait-input3', 'Wait 1000ms after typing');
        await page.waitForTimeout(1000);
    });

    test('wait for a specific route', async ({page}) => {
        await page.route('**/comments/*', route => route.continue());
        const [response] = await Promise.all([
            page.waitForResponse(response => response.url().includes('/comments/') && [200, 304].includes(response.status())),
            page.click('.network-btn')
        ]);
        expect([200, 304]).toContain(response.status());
    });
});