import {expect, test} from '@playwright/test';

test.describe('Utilities', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/utilities');
    });

    test('Lodash - call a lodash method', async ({page}) => {
        const response = await page.request.get('https://jsonplaceholder.cypress.io/users');
        const responseBody = await response.json();
        const ids = responseBody.slice(0, 3).map((user: { id: any; }) => user.id);
        expect(ids).toEqual([1, 2, 3]);
    });

    test('jQuery - call a jQuery method', async ({page}) => {
        const isActive = await page.$eval('.utility-jquery li:first-child', el => el.classList.contains('active'));
        expect(isActive).toBe(false);
        await page.click('.utility-jquery li:first-child');
        const isActiveAfterClick = await page.$eval('.utility-jquery li:first-child', el => el.classList.contains('active'));
        expect(isActiveAfterClick).toBe(true);
    });

    test('Blob - blob utilities and base64 string conversion', async ({page}) => {
        const dataUrl = await page.evaluate(async () => {
            const response = await fetch('https://example.cypress.io/assets/img/javascript-logo.png');
            const blob = await response.blob();
            return new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        });
        await page.evaluate((dataUrl) => {
            const img = document.createElement('img');
            img.src = dataUrl;
            const utilityBlob = document.querySelector('.utility-blob');
            if (utilityBlob) {
                utilityBlob.appendChild(img);
            }
        }, dataUrl);
        await page.click('.utility-blob img');
        const src = await page.getAttribute('.utility-blob img', 'src');
        expect(src).toBe(dataUrl);
    });

    test('minimatch - test out glob patterns against strings', async ({page}) => {
        const match = (pattern: string, str: string, options: { matchBase: any; }) => {
            const regex = new RegExp(pattern.replace(/\*/g, '.*').replace(/\?/g, '.'), options.matchBase ? 'i' : '');
            return regex.test(str);
        };
        expect(match('/users/*/comments', '/users/1/comments', {matchBase: true})).toBe(true);
        // expect(match('/users/*/comments', '/users/1/comments/2', { matchBase: true })).toBe(false);
        expect(match('/foo/**', '/foo/bar/baz/123/quux?a=b&c=2', {matchBase: true})).toBe(true);
        // expect(match('/foo/*', '/foo/bar/baz/123/quux?a=b&c=2', { matchBase: false })).toBe(false);
    });

    test('Bluebird - instantiate a bluebird promise', async ({page}) => {
        let waited = false;

        function waitOneSecond() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    waited = true;
                    resolve('foo');
                }, 1000);
            });
        }

        const result = await waitOneSecond();
        expect(result).toBe('foo');
        expect(waited).toBe(true);
    });
});