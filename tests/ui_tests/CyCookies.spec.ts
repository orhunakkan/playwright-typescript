import {expect, test} from '@playwright/test';

test.describe('Cookies', () => {

    test.beforeEach(async ({page, context}) => {
        await context.clearCookies();
        await page.goto('https://example.cypress.io/commands/cookies');
    });

    test('get a browser cookie', async ({page, context}) => {
        await page.click('#getCookie .set-a-cookie');
        const cookie = await context.cookies();
        const tokenCookie = cookie.find(c => c.name === 'token');
        expect(tokenCookie).toBeDefined();
        expect(tokenCookie?.value).toBe('123ABC');
    });

    test('get browser cookies for the current domain', async ({page, context}) => {
        let cookies = await context.cookies();
        expect(cookies).toHaveLength(0);
        await page.click('#getCookies .set-a-cookie');
        cookies = await context.cookies();
        expect(cookies).toHaveLength(1);
        const cookie = cookies[0];
        expect(cookie).toMatchObject({
            name: 'token',
            value: '123ABC',
            httpOnly: false,
            secure: false,
            domain: expect.any(String),
            path: expect.any(String)
        });
    });

    test('get all browser cookies', async ({context}) => {
        let cookies = await context.cookies();
        expect(cookies).toHaveLength(0);
        await context.addCookies([
            {name: 'key', value: 'value', domain: 'example.cypress.io', path: '/'},
            {name: 'key', value: 'value', domain: '.example.com', path: '/'}
        ]);
        cookies = await context.cookies();
        expect(cookies).toHaveLength(2);
        expect(cookies[0]).toMatchObject({
            name: 'key',
            value: 'value',
            httpOnly: false,
            secure: false,
            domain: expect.any(String),
            path: expect.any(String)
        });
        expect(cookies[1]).toMatchObject({
            name: 'key',
            value: 'value',
            httpOnly: false,
            secure: false,
            domain: '.example.com',
            path: expect.any(String)
        });
    });

    test('set a browser cookie', async ({context}) => {
        let cookies = await context.cookies();
        expect(cookies).toHaveLength(0);
        await context.addCookies([{name: 'foo', value: 'bar', domain: 'example.cypress.io', path: '/'}]);
        const cookie = (await context.cookies()).find(c => c.name === 'foo');
        expect(cookie).toBeDefined();
        expect(cookie?.value).toBe('bar');
    });

    test('clear a browser cookie', async ({page, context}) => {
        let cookie = (await context.cookies()).find(c => c.name === 'token');
        expect(cookie).toBeUndefined();
        await page.click('#clearCookie .set-a-cookie');
        cookie = (await context.cookies()).find(c => c.name === 'token');
        expect(cookie).toBeDefined();
        expect(cookie?.value).toBe('123ABC');
        await context.clearCookies({name: 'token'});
        cookie = (await context.cookies()).find(c => c.name === 'token');
        expect(cookie).toBeUndefined();
    });

    test('clear browser cookies for the current domain', async ({page, context}) => {
        let cookies = await context.cookies();
        expect(cookies).toHaveLength(0);
        await page.click('#clearCookies .set-a-cookie');
        cookies = await context.cookies();
        expect(cookies).toHaveLength(1);
        await context.clearCookies();
        cookies = await context.cookies();
        expect(cookies).toHaveLength(0);
    });

    test('clear all browser cookies', async ({context}) => {
        let cookies = await context.cookies();
        expect(cookies).toHaveLength(0);
        await context.addCookies([
            {name: 'key', value: 'value', domain: 'example.cypress.io', path: '/'},
            {name: 'key', value: 'value', domain: '.example.com', path: '/'}
        ]);
        cookies = await context.cookies();
        expect(cookies).toHaveLength(2);
        await context.clearCookies();
        cookies = await context.cookies();
        expect(cookies).toHaveLength(0);
    });
});