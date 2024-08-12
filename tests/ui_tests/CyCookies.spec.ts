import {expect, test} from '@playwright/test';

test.describe('Cookies', () => {

    test.beforeEach(async ({page, context}) => {
        await context.clearCookies();
        await page.goto('https://example.cypress.io/commands/cookies');
    });

    test('get a browser cookie', async ({page}) => {
    });

    test('get browser cookies for the current domain', async ({page}) => {
    });

    test('get all browser cookies', async ({context}) => {
    });

    test('set a browser cookie', async ({context}) => {
    });

    test('clear a browser cookie', async ({page}) => {
    });

    test('clear browser cookies for the current domain', async ({page}) => {
    });

    test('clear all browser cookies', async ({context}) => {
    });
});