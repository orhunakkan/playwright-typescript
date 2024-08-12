import {expect, test} from '@playwright/test';

test.describe('Location', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/location');
    });

    test('get the current URL hash', async ({page}) => {
    });

    test('get window.location', async ({page}) => {
    });

    test('get the current URL', async ({page}) => {
    });
});