import {expect, test} from '@playwright/test';

test.describe('Local Storage / Session Storage', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/storage');
    });

    test('clear all data in localStorage for the current origin', async ({page}) => {
        await page.click('.ls-btn');
        let localStorageValues = await page.evaluate(() => {
            return {
                prop1: localStorage.getItem('prop1'),
                prop2: localStorage.getItem('prop2'),
                prop3: localStorage.getItem('prop3')
            };
        });
        expect(localStorageValues.prop1).toBe('red');
        expect(localStorageValues.prop2).toBe('blue');
        expect(localStorageValues.prop3).toBe('magenta');

        await page.evaluate(() => localStorage.clear());
        localStorageValues = await page.evaluate(() => {
            return {
                prop1: localStorage.getItem('prop1'),
                prop2: localStorage.getItem('prop2'),
                prop3: localStorage.getItem('prop3')
            };
        });
        expect(localStorageValues.prop1).toBeNull();
        expect(localStorageValues.prop2).toBeNull();
        expect(localStorageValues.prop3).toBeNull();

        await page.click('.ls-btn');
        localStorageValues = await page.evaluate(() => {
            return {
                prop1: localStorage.getItem('prop1'),
                prop2: localStorage.getItem('prop2'),
                prop3: localStorage.getItem('prop3')
            };
        });
        expect(localStorageValues.prop1).toBe('red');
        expect(localStorageValues.prop2).toBe('blue');
        expect(localStorageValues.prop3).toBe('magenta');

        await page.evaluate(() => localStorage.removeItem('prop1'));
        localStorageValues = await page.evaluate(() => {
            return {
                prop1: localStorage.getItem('prop1'),
                prop2: localStorage.getItem('prop2'),
                prop3: localStorage.getItem('prop3')
            };
        });
        expect(localStorageValues.prop1).toBeNull();
        expect(localStorageValues.prop2).toBe('blue');
        expect(localStorageValues.prop3).toBe('magenta');

        await page.click('.ls-btn');
        localStorageValues = await page.evaluate(() => {
            return {
                prop1: localStorage.getItem('prop1'),
                prop2: localStorage.getItem('prop2'),
                prop3: localStorage.getItem('prop3')
            };
        });
        expect(localStorageValues.prop1).toBe('red');
        expect(localStorageValues.prop2).toBe('blue');
        expect(localStorageValues.prop3).toBe('magenta');

        await page.evaluate(() => {
            localStorage.removeItem('prop1');
            localStorage.removeItem('prop2');
        });
        localStorageValues = await page.evaluate(() => {
            return {
                prop1: localStorage.getItem('prop1'),
                prop2: localStorage.getItem('prop2'),
                prop3: localStorage.getItem('prop3')
            };
        });
        expect(localStorageValues.prop1).toBeNull();
        expect(localStorageValues.prop2).toBeNull();
        expect(localStorageValues.prop3).toBe('magenta');
    });

    test('get all data in localStorage for all origins', async ({page}) => {
        await page.click('.ls-btn');
        const storageMap = await page.evaluate(() => {
            return {'https://example.cypress.io': {...localStorage}};
        });
        expect(storageMap).toEqual({
            'https://example.cypress.io': {
                'prop1': 'red',
                'prop2': 'blue',
                'prop3': 'magenta',
            },
        });
    });

    test('clear all data in localStorage for all origins', async ({page}) => {
        await page.click('.ls-btn');
        await page.evaluate(() => localStorage.clear());
        const localStorageValues = await page.evaluate(() => {
            return {
                prop1: localStorage.getItem('prop1'),
                prop2: localStorage.getItem('prop2'),
                prop3: localStorage.getItem('prop3')
            };
        });
        expect(localStorageValues.prop1).toBeNull();
        expect(localStorageValues.prop2).toBeNull();
        expect(localStorageValues.prop3).toBeNull();
    });

    test('get all data in sessionStorage for all origins', async ({page}) => {
        await page.click('.ls-btn');
        const storageMap = await page.evaluate(() => {
            return {'https://example.cypress.io': {...sessionStorage}};
        });
        expect(storageMap).toEqual({
            'https://example.cypress.io': {
                'prop4': 'cyan',
                'prop5': 'yellow',
                'prop6': 'black',
            },
        });
    });

    test('clear all data in sessionStorage for all origins', async ({page}) => {
        await page.click('.ls-btn');
        await page.evaluate(() => sessionStorage.clear());
        const sessionStorageValues = await page.evaluate(() => {
            return {
                prop4: sessionStorage.getItem('prop4'),
                prop5: sessionStorage.getItem('prop5'),
                prop6: sessionStorage.getItem('prop6')
            };
        });
        expect(sessionStorageValues.prop4).toBeNull();
        expect(sessionStorageValues.prop5).toBeNull();
        expect(sessionStorageValues.prop6).toBeNull();
    });
});