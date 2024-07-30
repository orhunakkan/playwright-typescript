import {expect, test} from '@playwright/test';

test.describe('Local Storage / Session Storage', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/storage');
    });

    test('clear all data in localStorage for the current origin', async ({page}) => {
        await page.locator('.ls-btn').click();
        await expect(page.evaluate(() => localStorage.getItem('prop1'))).resolves.toBe('red');
        await expect(page.evaluate(() => localStorage.getItem('prop2'))).resolves.toBe('blue');
        await expect(page.evaluate(() => localStorage.getItem('prop3'))).resolves.toBe('magenta');

        await page.evaluate(() => localStorage.clear());
        await expect(page.evaluate(() => localStorage.getItem('prop1'))).resolves.toBeNull();
        await expect(page.evaluate(() => localStorage.getItem('prop2'))).resolves.toBeNull();
        await expect(page.evaluate(() => localStorage.getItem('prop3'))).resolves.toBeNull();

        await page.locator('.ls-btn').click();
        await expect(page.evaluate(() => localStorage.getItem('prop1'))).resolves.toBe('red');
        await expect(page.evaluate(() => localStorage.getItem('prop2'))).resolves.toBe('blue');
        await expect(page.evaluate(() => localStorage.getItem('prop3'))).resolves.toBe('magenta');

        await page.evaluate(() => localStorage.removeItem('prop1'));
        await expect(page.evaluate(() => localStorage.getItem('prop1'))).resolves.toBeNull();
        await expect(page.evaluate(() => localStorage.getItem('prop2'))).resolves.toBe('blue');
        await expect(page.evaluate(() => localStorage.getItem('prop3'))).resolves.toBe('magenta');

        await page.locator('.ls-btn').click();
        await expect(page.evaluate(() => localStorage.getItem('prop1'))).resolves.toBe('red');
        await expect(page.evaluate(() => localStorage.getItem('prop2'))).resolves.toBe('blue');
        await expect(page.evaluate(() => localStorage.getItem('prop3'))).resolves.toBe('magenta');

        await page.evaluate(() => {
            Object.keys(localStorage).forEach(key => {
                if (/prop1|2/.test(key)) {
                    localStorage.removeItem(key);
                }
            });
        });
        await expect(page.evaluate(() => localStorage.getItem('prop1'))).resolves.toBeNull();
        await expect(page.evaluate(() => localStorage.getItem('prop2'))).resolves.toBeNull();
        await expect(page.evaluate(() => localStorage.getItem('prop3'))).resolves.toBe('magenta');
    });

    test('get all data in localStorage for all origins', async ({page}) => {
        await page.locator('.ls-btn').click();
        const storageMap = await page.evaluate(() => Object.assign({}, localStorage));
        expect(storageMap).toEqual({
            'prop1': 'red',
            'prop2': 'blue',
            'prop3': 'magenta',
        });
    });

    test('clear all data in localStorage for all origins', async ({page}) => {
        await page.locator('.ls-btn').click();
        await page.evaluate(() => localStorage.clear());
        await expect(page.evaluate(() => localStorage.getItem('prop1'))).resolves.toBeNull();
        await expect(page.evaluate(() => localStorage.getItem('prop2'))).resolves.toBeNull();
        await expect(page.evaluate(() => localStorage.getItem('prop3'))).resolves.toBeNull();
    });

    test('get all data in sessionStorage for all origins', async ({page}) => {
        await page.locator('.ls-btn').click();
        const storageMap = await page.evaluate(() => Object.assign({}, sessionStorage));
        expect(storageMap).toEqual({
            'prop4': 'cyan',
            'prop5': 'yellow',
            'prop6': 'black',
        });
    });

    test('clear all data in sessionStorage for all origins', async ({page}) => {
        await page.locator('.ls-btn').click();
        await page.evaluate(() => sessionStorage.clear());
        await expect(page.evaluate(() => sessionStorage.getItem('prop4'))).resolves.toBeNull();
        await expect(page.evaluate(() => sessionStorage.getItem('prop5'))).resolves.toBeNull();
        await expect(page.evaluate(() => sessionStorage.getItem('prop6'))).resolves.toBeNull();
    });
});