import { expect } from '@playwright/test';

export async function acceptCookies(page) {
    await page.getByRole('button', { name: 'Accept All Cookies' }).click();
    await expect(page.getByRole('button', { name: 'Accept All Cookies' })).toBeHidden();
}

export async function rejectCookies(page) {
    await page.getByRole('button', { name: 'Reject All Cookies' }).click();
    await expect(page.getByRole('button', { name: 'Reject All Cookies' })).toBeHidden();
}
