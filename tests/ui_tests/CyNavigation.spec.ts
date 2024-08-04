import {expect, test} from '@playwright/test';

test.describe('Navigation', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io');
        await page.click('.navbar-nav >> text=Commands');
        await page.click('.dropdown-menu >> text=Navigation');
    });

    test('go back or forward in the browser\'s history', async ({page}) => {
        await expect(page).toHaveURL(/.*navigation/);
        await page.goBack();
        await expect(page).not.toHaveURL(/.*navigation/);
        await page.goForward();
        await expect(page).toHaveURL(/.*navigation/);
        await page.goBack();
        await expect(page).not.toHaveURL(/.*navigation/);
        await page.goForward();
        await expect(page).toHaveURL(/.*navigation/);
    });

    test('reload the page', async ({page}) => {
        await page.reload();
        await page.reload({waitUntil: 'networkidle'});
    });

    test('visit a remote url', async ({page}) => {
    });
});