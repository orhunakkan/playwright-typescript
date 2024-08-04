import {expect, test} from '@playwright/test';

test.describe('Viewport', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/viewport');
    });

    test('set the viewport size and dimension', async ({page}) => {
        await expect(page.locator('#navbar')).toBeVisible();
        await page.setViewportSize({width: 320, height: 480});
        await expect(page.locator('#navbar')).not.toBeVisible();
        await expect(page.locator('.navbar-toggle')).toBeVisible();
        await page.click('.navbar-toggle');
        // await expect(page.locator('.nav a')).toBeVisible();

        await page.setViewportSize({width: 2999, height: 2999});
        await page.setViewportSize({width: 1440, height: 900}); // macbook-15
        await page.waitForTimeout(200);
        await page.setViewportSize({width: 1280, height: 800}); // macbook-13
        await page.waitForTimeout(200);
        await page.setViewportSize({width: 1366, height: 768}); // macbook-11
        await page.waitForTimeout(200);
        await page.setViewportSize({width: 768, height: 1024}); // ipad-2
        await page.waitForTimeout(200);
        await page.setViewportSize({width: 768, height: 1024}); // ipad-mini
        await page.waitForTimeout(200);
        await page.setViewportSize({width: 414, height: 736}); // iphone-6+
        await page.waitForTimeout(200);
        await page.setViewportSize({width: 375, height: 667}); // iphone-6
        await page.waitForTimeout(200);
        await page.setViewportSize({width: 320, height: 568}); // iphone-5
        await page.waitForTimeout(200);
        await page.setViewportSize({width: 320, height: 480}); // iphone-4
        await page.waitForTimeout(200);
        await page.setViewportSize({width: 320, height: 480}); // iphone-3
        await page.waitForTimeout(200);
        await page.emulateMedia({media: 'screen', colorScheme: 'light'}); // ipad-2 portrait
        await page.waitForTimeout(200);
        await page.emulateMedia({media: 'screen', colorScheme: 'dark'}); // iphone-4 landscape
        await page.waitForTimeout(200);
    });
});