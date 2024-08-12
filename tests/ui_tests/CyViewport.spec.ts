import {expect, test} from '@playwright/test';

test.describe('Viewport', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/viewport');
    });

    test('set the viewport size and dimension', async ({page}) => {
    });
});