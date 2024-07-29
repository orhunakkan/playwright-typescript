import {expect, test} from '@playwright/test';

test.describe('Navigation', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io');
        await page.locator('.navbar-nav').getByText('Commands').click();
        await page.locator('.dropdown-menu').getByText('Navigation').click();
    });

    test('go back or forward in the browser\'s history', async ({page}) => {
        let location = await page.evaluate(() => window.location.pathname);
        expect(location).toContain('navigation');

        await page.goBack();
        location = await page.evaluate(() => window.location.pathname);
        expect(location).not.toContain('navigation');

        await page.goForward();
        location = await page.evaluate(() => window.location.pathname);
        expect(location).toContain('navigation');

        await page.goBack();
        location = await page.evaluate(() => window.location.pathname);
        expect(location).not.toContain('navigation');

        await page.goForward();
        location = await page.evaluate(() => window.location.pathname);
        expect(location).toContain('navigation');
    });

    test('reload the page', async ({page}) => {
        await page.reload();
        await page.reload({waitUntil: 'load'});
    });

    test('visit a remote url', async ({page}) => {
        await page.goto('https://example.cypress.io/commands/navigation', {
            timeout: 50000,
            waitUntil: 'load'
        });
        const contentWindow = await page.evaluate(() => window);
        expect(typeof contentWindow).toBe('object');
    });
});