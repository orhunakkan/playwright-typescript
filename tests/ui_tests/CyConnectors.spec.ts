import {expect, test} from '@playwright/test';

test.describe('Connectors', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/connectors');
    });

    test('.each() - iterate over an array of elements', async ({page}) => {
    });

    test('.its() - get properties on the current subject', async ({page}) => {
    });

    test('.invoke() - invoke a function on the current subject', async ({page}) => {
    });

    test('.spread() - spread an array as individual args to callback function', async ({page}) => {
    });

    test.describe('.then()', () => {

        test('invokes a callback function with the current subject', async ({page}) => {
        });

        test('yields the returned value to the next command', async ({page}) => {
        });

        test('yields the original subject without return', async ({page}) => {
        });

        test('yields the value yielded by the last Playwright command inside', async ({page}) => {
        });
    });
});