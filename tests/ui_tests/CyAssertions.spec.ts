import { test, expect } from '@playwright/test';

test.describe('Assertions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://example.cypress.io/commands/assertions');
    });

    test.describe('Implicit Assertions', () => {
        // test('should make an assertion about the current subject', async ({ page }) => {
        //     const lastRow = page.locator('.assertion-table tbody tr:last-child');
        //     await expect(lastRow).toHaveClass('success');
        //     const firstCell = lastRow.locator('td').first();
        //     await expect(firstCell).toHaveText('Column content');
        //     await expect(firstCell).toContainText('Column content');
        //     await expect(firstCell).toHaveText('Column content');
        //     await expect(firstCell).toMatch('td');
        //     const text = await firstCell.textContent();
        //     expect(text).toMatch(/column content/i);
        //
        //     const lastRowVisible = page.locator('.assertion-table tbody tr:last-child');
        //     await expect(lastRowVisible.locator('td')).toContainText(/column content/i);
        //     await expect(lastRowVisible).toBeVisible();
        // });

        // test('should chain multiple assertions together', async ({ page }) => {
        //     const link = page.locator('.assertions-link');
        //     await expect(link).toHaveClass('active');
        //     await expect(link).toHaveAttribute('href', /cypress.io/);
        // });
    });

    test.describe('Explicit Assertions', () => {
        test('expect - make an assertion about a specified subject', async () => {
            expect(true).toBe(true);
            const o = { foo: 'bar' };
            expect(o).toEqual(o);
            expect(o).toEqual({ foo: 'bar' });
            expect('FooBar').toMatch(/bar$/i);
        });

        test('pass your own callback function to should()', async ({ page }) => {
            const paragraphs = await page.locator('.assertions-p p').allTextContents();
            expect(paragraphs).toHaveLength(3);
            expect(paragraphs).toEqual([
                'Some text from first p',
                'More text from second p',
                'And even more text from third p',
            ]);
        });

        test('finds element by class name regex', async ({ page }) => {
            const div = page.locator('.docs-header div');
            await expect(div).toHaveCount(1);
            const className = await div.first().getAttribute('class');
            expect(className).toMatch(/heading-/);
            await expect(div).toHaveText('Introduction');
        });

        test('can throw any error', async ({ page }) => {
            const div = page.locator('.docs-header div');
            const count = await div.count();
            if (count !== 1) {
                throw new Error('Did not find 1 element');
            }
            const className = await div.first().getAttribute('class');
            if (!className?.match(/heading-/)) {
                throw new Error(`Could not find class "heading-" in ${className}`);
            }
        });

        // test('matches unknown text between two elements', async ({ page }) => {
        //     const normalizeText = (s: string) => s.replace(/\s/g, '').toLowerCase();
        //     const firstText = normalizeText(await page.locator('.two-elements .first').textContent());
        //     const secondText = normalizeText(await page.locator('.two-elements .second').textContent());
        //     expect(secondText).toBe(firstText);
        // });

        test('assert - assert shape of an object', async () => {
            const person = {
                name: 'Joe',
                age: 20,
            };
            expect(person).toBeInstanceOf(Object);
        });

        // test('retries the should callback until assertions pass', async ({ page }) => {
        //     const randomNumber = parseFloat(await page.locator('#random-number').textContent());
        //     expect(randomNumber).toBeGreaterThanOrEqual(1);
        //     expect(randomNumber).toBeLessThanOrEqual(10);
        // });
    });
});