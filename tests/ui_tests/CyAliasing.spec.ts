import {expect, test} from '@playwright/test';

test.describe('Aliasing', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/aliasing');
    });

    test('alias a DOM element for later use', async ({page}) => {
    });

    test('alias a route for later use', async ({page}) => {
    });
});