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
        const form = page.locator('.query-form');
        await expect(form.locator('input:first-child')).toHaveAttribute('placeholder', 'Email');
        await expect(form.locator('input:last-child')).toHaveAttribute('placeholder', 'Password');
    });

    test('query the root DOM element', async ({page}) => {
    });

    test('best practices - selecting elements', async ({page}) => {
        const container = page.locator('[data-cy=best-practices-selecting-elements]');
        await container.locator('button').click();
        await container.locator('.btn.btn-large').click();
        await container.locator('[name=submission]').click();
        await container.locator('#main').click();
        await container.locator('#main[role=button]').click();
        await container.locator('text=Submit').click();
        await container.locator('[data-cy=submit]').click();
    });
});