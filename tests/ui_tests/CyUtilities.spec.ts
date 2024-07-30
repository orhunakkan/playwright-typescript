// import { test, expect } from '@playwright/test';
// import _ from 'lodash';
// import minimatch from 'minimatch';
// import { Blob } from 'buffer';
// import { JSDOM } from 'jsdom';
//
// test.describe('Utilities', () => {
//     test.beforeEach(async ({ page }) => {
//         await page.goto('https://example.cypress.io/utilities');
//     });
//
//     test('Playwright - call a lodash method', async ({ page, request }) => {
//         const response = await request.get('https://jsonplaceholder.cypress.io/users');
//         const responseBody = await response.json();
//         const ids = _.chain(responseBody).map('id').take(3).value();
//         expect(ids).toEqual([1, 2, 3]);
//     });
//
//     test('Playwright - call a jQuery method', async ({ page }) => {
//         const $li = await page.evaluateHandle(() => {
//             return window.$('.utility-jquery li:first');
//         });
//         await expect($li).not.toHaveClass('active');
//         await $li.click();
//         await expect($li).toHaveClass('active');
//     });
//
//     test('Playwright - blob utilities and base64 string conversion', async ({ page }) => {
//         const dataUrl = await page.evaluate(async () => {
//             const response = await fetch('https://example.cypress.io/assets/img/javascript-logo.png');
//             const blob = await response.blob();
//             return new Promise((resolve) => {
//                 const reader = new FileReader();
//                 reader.onloadend = () => resolve(reader.result);
//                 reader.readAsDataURL(blob);
//             });
//         });
//         await page.evaluate((dataUrl) => {
//             const img = document.createElement('img');
//             img.src = dataUrl;
//             document.querySelector('.utility-blob').appendChild(img);
//         }, dataUrl);
//         await page.locator('.utility-blob img').click();
//         await expect(page.locator('.utility-blob img')).toHaveAttribute('src', dataUrl);
//     });
//
//     test('Playwright - test out glob patterns against strings', async ({ page }) => {
//         let matching = minimatch('/users/1/comments', '/users/*/comments', { matchBase: true });
//         expect(matching).toBe(true);
//         matching = minimatch('/users/1/comments/2', '/users/*/comments', { matchBase: true });
//         expect(matching).toBe(false);
//         matching = minimatch('/foo/bar/baz/123/quux?a=b&c=2', '/foo/**', { matchBase: true });
//         expect(matching).toBe(true);
//         matching = minimatch('/foo/bar/baz/123/quux?a=b&c=2', '/foo/*', { matchBase: false });
//         expect(matching).toBe(false);
//     });
//
//     test('Playwright - instantiate a bluebird promise', async ({ page }) => {
//         let waited = false;
//         function waitOneSecond() {
//             return new Promise((resolve) => {
//                 setTimeout(() => {
//                     waited = true;
//                     resolve('foo');
//                 }, 1000);
//             });
//         }
//
//         const result = await waitOneSecond();
//         expect(result).toBe('foo');
//         expect(waited).toBe(true);
//     });
// });