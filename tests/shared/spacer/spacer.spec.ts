import {expect, test} from '@playwright/test';
import {acceptCookies} from '../../../utilities/cookies';

const spacerPath = '/united-states/test/qa/premier/spacer';

test.beforeEach(async ({page}) => {
    await page.goto(spacerPath);
});

test('Spacer XXXL Component should be visible', async ({page}) => {
    await expect(page.locator('.prem-spacer--xxxl')).toBeVisible();
});

test('Spacer XXL Component should be visible', async ({page}) => {
    await expect(page.locator('.prem-spacer--xxl')).toBeVisible();
});

test('Spacer XL Component should be visible', async ({page}) => {
    await expect(page.locator('.prem-spacer--xl')).toBeVisible();
});

test('Spacer Large Component should be visible', async ({page}) => {
    await expect(page.locator('.prem-spacer--large')).toBeVisible();
});

test('Spacer Small Component should be visible', async ({page}) => {
    await expect(page.locator('.prem-spacer--small')).toBeVisible();
});

test('Spacer XXS Component should be visible', async ({page}) => {
    await expect(page.locator('.prem-spacer--xxs')).toBeVisible();
});

test('Spacer Regular Component should be visible', async ({page}) => {
    await expect(page.locator('.prem-spacer--regular')).toBeVisible();
});

test('Spacer Component Visual Regression', async ({page}) => {
    await acceptCookies(page);
    await expect(page).toHaveScreenshot({threshold: 1});
});
