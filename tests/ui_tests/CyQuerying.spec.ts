import {expect, test} from '@playwright/test';

test.describe('Querying', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/querying');
    });

    test('query DOM elements', async ({page}) => {
        await expect(page.locator('#query-btn')).toContainText('Button');
        await expect(page.locator('.query-btn')).toContainText('Button');
        await expect(page.locator('#querying .well > button:first-child')).toContainText('Button');
        await expect(page.locator('[data-test-id="test-example"]')).toHaveClass('example');
        await expect(page.locator('[data-test-id="test-example"]').getAttribute('data-test-id')).toBe('test-example');
        await expect(page.locator('[data-test-id="test-example"]').evaluate(el => getComputedStyle(el).position)).toBe('static');
        await expect(page.locator('[data-test-id="test-example"]')).toHaveAttribute('data-test-id', 'test-example');
        await expect(page.locator('[data-test-id="test-example"]')).toHaveCSS('position', 'static');
    });

    test('query DOM elements with matching content', async ({page}) => {
        await expect(page.locator('.query-list').getByText('bananas')).toHaveClass('third');
        await expect(page.locator('.query-list').getByText(/^b\w+/)).toHaveClass('third');
        await expect(page.locator('.query-list').getByText('apples')).toHaveClass('first');
        await expect(page.locator('#querying').locator('ul').getByText('oranges')).toHaveClass('query-list');
        await expect(page.locator('.query-button').getByText('Save Form')).toHaveClass('btn');
    });

    test('query DOM elements within a specific element', async ({page}) => {
        const form = page.locator('.query-form');
        await expect(form.locator('input:first-child')).toHaveAttribute('placeholder', 'Email');
        await expect(form.locator('input:last-child')).toHaveAttribute('placeholder', 'Password');
    });

    test('query the root DOM element', async ({page}) => {
        await expect(page.locator('html')).toHaveClass('html');
        const ul = page.locator('.query-ul');
        await expect(ul.locator('html')).toHaveClass('query-ul');
    });

    test('best practices - selecting elements', async ({page}) => {
        const container = page.locator('[data-cy=best-practices-selecting-elements]');
        await container.locator('button').click();
        await container.locator('.btn.btn-large').click();
        await container.locator('[name=submission]').click();
        await container.locator('#main').click();
        await container.locator('#main[role=button]').click();
        await container.getByText('Submit').click();
        await container.locator('[data-cy=submit]').click();
    });
});