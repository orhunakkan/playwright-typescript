import {expect, test} from '@playwright/test';

test.describe('Location', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/location');
    });

    test('get the current URL hash', async ({page}) => {
        const hash = await page.evaluate(() => window.location.hash);
        expect(hash).toBe('');
    });

    test('get window.location', async ({page}) => {
        const location = await page.evaluate(() => {
            return {
                hash: window.location.hash,
                href: window.location.href,
                host: window.location.host,
                hostname: window.location.hostname,
                origin: window.location.origin,
                pathname: window.location.pathname,
                port: window.location.port,
                protocol: window.location.protocol,
                search: window.location.search
            };
        });
        expect(location.hash).toBe('');
        expect(location.href).toBe('https://example.cypress.io/commands/location');
        expect(location.host).toBe('example.cypress.io');
        expect(location.hostname).toBe('example.cypress.io');
        expect(location.origin).toBe('https://example.cypress.io');
        expect(location.pathname).toBe('/commands/location');
        expect(location.port).toBe('');
        expect(location.protocol).toBe('https:');
        expect(location.search).toBe('');
    });

    test('get the current URL', async ({page}) => {
        const url = page.url();
        expect(url).toBe('https://example.cypress.io/commands/location');
    });
});