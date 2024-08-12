import {expect, test} from '@playwright/test';

test.describe('example to-do app', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/todo');
    });

    test('displays two todo items by default', async ({page}) => {
    });

    test('can add new todo items', async ({page}) => {
    });

    test('can check off an item as completed', async ({page}) => {
    });

    test.describe('with a checked task', () => {

        test.beforeEach(async ({page}) => {
            await page.locator('text=Pay electric bill').locator('..').locator('input[type=checkbox]').check();
        });

        test('can filter for uncompleted tasks', async ({page}) => {
        });

        test('can filter for completed tasks', async ({page}) => {
        });

        test('can delete all completed tasks', async ({page}) => {
        });
    });
});