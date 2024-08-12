import {expect, test} from '@playwright/test';

test.describe('Querying', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/querying');
    });

    test('query DOM elements', async ({page}) => {
    });

    test('query DOM elements with matching content', async ({page}) => {
    });

    test('query DOM elements within a specific element', async ({page}) => {
    });

    test('query the root DOM element', async ({page}) => {
    });

    test('best practices - selecting elements', async ({page}) => {
    });
});