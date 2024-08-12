import {expect, test} from '@playwright/test';

test.describe('Files', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/files');
    });

    test('load a fixture', async ({page}) => {
    });

    test('load a fixture or require', async () => {
    });

    test('read file contents', async () => {
    });

    test('write to a file', async ({request}) => {
    });
});