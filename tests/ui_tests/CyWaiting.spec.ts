import {expect, test} from '@playwright/test';

test.describe('Waiting', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/waiting');
    });

    test('wait for a specific amount of time', async ({page}) => {
    });

    test('wait for a specific route', async ({page}) => {
    });
});