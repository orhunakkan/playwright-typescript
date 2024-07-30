import {expect, test} from '@playwright/test';

test.describe('Window', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/window');
    });

    test('page.evaluate() - get the global window object', async ({page}) => {
        const windowTop = await page.evaluate(() => window.top);
        expect(windowTop).toBeDefined();
    });

    test('page.evaluate() - get the document object', async ({page}) => {
        const charset = await page.evaluate(() => document.charset);
        expect(charset).toBe('UTF-8');
    });

    test('page.title() - get the title', async ({page}) => {
        const title = await page.title();
        expect(title).toContain('Kitchen Sink');
    });
});