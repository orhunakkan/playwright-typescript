import {expect, test} from '@playwright/test';

test.describe('Local Storage / Session Storage', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/storage');
    });

    test('clear all data in localStorage for the current origin', async ({page}) => {
    });

    test('get all data in localStorage for all origins', async ({page}) => {
    });

    test('clear all data in localStorage for all origins', async ({page}) => {
    });

    test('get all data in sessionStorage for all origins', async ({page}) => {
    });

    test('clear all data in sessionStorage for all origins', async ({page}) => {
    });
});