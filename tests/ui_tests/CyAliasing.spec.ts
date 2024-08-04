import {expect, test} from '@playwright/test';

test.describe('Aliasing', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/aliasing');
    });

    test('alias a DOM element for later use', async ({page}) => {
        const firstBtn = page.locator('.as-table').locator('tbody>tr').first().locator('td').first().locator('button');
        await firstBtn.evaluateHandle('node => node.setAttribute("data-cy", "firstBtn")');
        await firstBtn.click();
        expect(await firstBtn.getAttribute('class')).toContain('btn-success');
        expect(await firstBtn.textContent()).toContain('Changed');
    });

    test('alias a route for later use', async ({page}) => {
        await page.route('**/comments/*', route => route.continue());
        const [response] = await Promise.all([
            page.waitForResponse('**/comments/*'),
            page.click('.network-btn')
        ]);
        expect(response.status()).toBe(200);
    });
});