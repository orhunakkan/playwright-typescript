import {expect, test} from '@playwright/test';

test.describe('Connectors', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/connectors');
    });

    test('.each() - iterate over an array of elements', async ({page}) => {
        const items = page.locator('.connectors-each-ul>li');
        const count = await items.count();
        for (let i = 0; i < count; i++) {
            const item = items.nth(i);
            console.log(await item.textContent(), i, await items.allTextContents());
        }
    });

    test('.its() - get properties on the current subject', async ({page}) => {
        const items = page.locator('.connectors-its-ul>li');
        const length = await items.count();
        expect(length).toBeGreaterThan(2);
    });

    test('.invoke() - invoke a function on the current subject', async ({page}) => {
        const div = page.locator('.connectors-div');
        await expect(div).toBeHidden();
        await div.evaluate(node => node.style.display = 'block');
        await expect(div).toBeVisible();
    });

    test('.spread() - spread an array as individual args to callback function', async ({page}) => {
        const arr = ['foo', 'bar', 'baz'];
        const [foo, bar, baz] = arr;
        expect(foo).toBe('foo');
        expect(bar).toBe('bar');
        expect(baz).toBe('baz');
    });

    test.describe('.then()', () => {
        test('invokes a callback function with the current subject', async ({page}) => {
            const items = page.locator('.connectors-list > li');
            await expect(items).toHaveCount(3);
            await expect(items.nth(0)).toContainText('Walk the dog');
            await expect(items.nth(1)).toContainText('Feed the cat');
            await expect(items.nth(2)).toContainText('Write JavaScript');
        });

        test('yields the returned value to the next command', async ({page}) => {
            let num = 1;
            expect(num).toBe(1);
            num = 2;
            expect(num).toBe(2);
        });

        test('yields the original subject without return', async ({page}) => {
            const num = 1;
            expect(num).toBe(1);
            expect(num).toBe(1);
        });

        test('yields the value yielded by the last Playwright command inside', async ({page}) => {
            let num = 1;
            expect(num).toBe(1);
            num = await page.evaluate(() => 2);
            expect(num).toBe(2);
        });
    });
});