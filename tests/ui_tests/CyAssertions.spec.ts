import {expect, test} from '@playwright/test';

test.describe('Assertions', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/assertions');
    });

    test.describe('Implicit Assertions', () => {

        test('.should() - make an assertion about the current subject', async ({page}) => {
        });

        test('.and() - chain multiple assertions together', async ({page}) => {
            const assertionsLink = page.locator('.assertions-link');
            await expect(assertionsLink).toHaveClass(/active/);
            await expect(assertionsLink).toHaveAttribute('href', /cypress.io/);
        });
    });

    test.describe('Explicit Assertions', () => {

        test('expect - make an assertion about a specified subject', async ({page}) => {
            expect(true).toBe(true);
            const o = {foo: 'bar'};
            expect(o).toEqual(o);
            expect(o).toEqual({foo: 'bar'});
            expect('FooBar').toMatch(/bar$/i);
        });

        test('pass your own callback function to should()', async ({page}) => {
            const assertionsP = page.locator('.assertions-p').locator('p');
            await expect(assertionsP).toHaveCount(3);
            await expect(assertionsP).toHaveText([
                'Some text from first p',
                'More text from second p',
                'And even more text from third p',
            ]);
        });

        test('finds element by class name regex', async ({page}) => {
            const docsHeader = page.locator('.docs-header');
            const div = await docsHeader.locator('div').first();
            await expect(div).toHaveClass(/heading-/);
            await expect(div).toHaveText('Introduction');
        });

        test('can throw any error', async ({page}) => {
            const docsHeader = page.locator('.docs-header');
            await expect(docsHeader.locator('div')).toHaveCount(1);
            const div = docsHeader.locator('div').first();
            await expect(div).toHaveClass(/heading-/);
        });

        test('matches unknown text between two elements', async ({page}) => {
        });

        test('assert - assert shape of an object', async ({page}) => {
        });

        test('retries the should callback until assertions pass', async ({page}) => {
            const randomNumber = page.locator('#random-number');
            await expect(randomNumber).toContainText(/\d+/);
            await expect(randomNumber).toContainText(/\d+/);
        });
    });
});

