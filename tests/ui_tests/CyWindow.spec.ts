import {expect, test} from '@playwright/test';

test.describe('Window', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/window');
    });

    test('get the global window object', async ({page}) => {
    });

    test('get the document object', async ({page}) => {
    });

    test('get the title', async ({page}) => {
    });
});