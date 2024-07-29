import {expect, test} from '@playwright/test';

test.describe('Cookies', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/cookies');
        await page.context().clearCookies();
    });

    test('get a browser cookie', async ({page}) => {
        await page.locator('#getCookie .set-a-cookie').click();
        const cookie = await page.context().cookies();
        const tokenCookie = cookie.find(c => c.name === 'token');
        expect(tokenCookie).toBeDefined();
        expect(tokenCookie?.value).toBe('123ABC');
    });

    test('get browser cookies for the current domain', async ({page}) => {
        let cookies = await page.context().cookies();
        expect(cookies).toHaveLength(0);
        await page.locator('#getCookies .set-a-cookie').click();
        cookies = await page.context().cookies();
        expect(cookies).toHaveLength(1);
        const cookie = cookies[0];
        expect(cookie).toMatchObject({
            name: 'token',
            value: '123ABC',
            httpOnly: false,
            secure: false,
            domain: expect.any(String),
            path: expect.any(String),
        });
    });

    test('get all browser cookies', async ({page}) => {
        let cookies = await page.context().cookies();
        expect(cookies).toHaveLength(0);
        await page.context().addCookies([
            {name: 'key', value: 'value', domain: 'example.cypress.io', path: '/'},
            {name: 'key', value: 'value', domain: '.example.com', path: '/'},
        ]);
        cookies = await page.context().cookies();
        expect(cookies).toHaveLength(2);
        expect(cookies[0]).toMatchObject({
            name: 'key',
            value: 'value',
            httpOnly: false,
            secure: false,
            domain: 'example.cypress.io',
            path: '/',
        });
        expect(cookies[1]).toMatchObject({
            name: 'key',
            value: 'value',
            httpOnly: false,
            secure: false,
            domain: '.example.com',
            path: '/',
        });
    });

    test('set a browser cookie', async ({page}) => {
        let cookies = await page.context().cookies();
        expect(cookies).toHaveLength(0);
        await page.context().addCookies([{name: 'foo', value: 'bar', domain: 'example.cypress.io', path: '/'}]);
        const cookie = (await page.context().cookies()).find(c => c.name === 'foo');
        expect(cookie).toBeDefined();
        expect(cookie?.value).toBe('bar');
    });

    test('clear a browser cookie', async ({page}) => {
        let cookie = (await page.context().cookies()).find(c => c.name === 'token');
        expect(cookie).toBeUndefined();
        await page.locator('#clearCookie .set-a-cookie').click();
        cookie = (await page.context().cookies()).find(c => c.name === 'token');
        expect(cookie).toBeDefined();
        expect(cookie?.value).toBe('123ABC');
        await page.context().clearCookies({name: 'token'});
        cookie = (await page.context().cookies()).find(c => c.name === 'token');
        expect(cookie).toBeUndefined();
    });

    test('clear browser cookies for the current domain', async ({page}) => {
        let cookies = await page.context().cookies();
        expect(cookies).toHaveLength(0);
        await page.locator('#clearCookies .set-a-cookie').click();
        cookies = await page.context().cookies();
        expect(cookies).toHaveLength(1);
        await page.context().clearCookies();
        cookies = await page.context().cookies();
        expect(cookies).toHaveLength(0);
    });

    test('clear all browser cookies', async ({page}) => {
        let cookies = await page.context().cookies();
        expect(cookies).toHaveLength(0);
        await page.context().addCookies([
            {name: 'key', value: 'value', domain: 'example.cypress.io', path: '/'},
            {name: 'key', value: 'value', domain: '.example.com', path: '/'},
        ]);
        cookies = await page.context().cookies();
        expect(cookies).toHaveLength(2);
        await page.context().clearCookies();
        cookies = await page.context().cookies();
        expect(cookies).toHaveLength(0);
    });
});