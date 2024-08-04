import { expect, test } from '@playwright/test';

test.describe('Window', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://example.cypress.io/commands/window');
    });

    test('get the global window object', async ({ page }) => {
        const hasTopProperty = await page.evaluate(() => 'top' in window);
        expect(hasTopProperty).toBe(true);
    });

    test('get the document object', async ({ page }) => {
        const charset = await page.evaluate(() => document.charset);
        expect(charset).toBe('UTF-8');
    });

    test('get the title', async ({ page }) => {
        const title = await page.title();
        expect(title).toContain('Kitchen Sink');
    });
});