import {expect, test} from '@playwright/test';

test.describe('Utilities', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/utilities');
    });

    test('Lodash - call a lodash method', async ({page}) => {
    });

    test('jQuery - call a jQuery method', async ({page}) => {
    });

    test('Blob - blob utilities and base64 string conversion', async ({page}) => {
    });

    test('minimatch - test out glob patterns against strings', async ({page}) => {
    });

    test('Bluebird - instantiate a bluebird promise', async ({page}) => {
    });
});