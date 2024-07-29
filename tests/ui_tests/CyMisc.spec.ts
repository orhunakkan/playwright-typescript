// import { test, expect } from '@playwright/test';
//
// test.describe('Misc', () => {
//     test.beforeEach(async ({ page }) => {
//         await page.goto('https://example.cypress.io/commands/misc');
//     });
//
//     test('execute a system command', async ({ page }) => {
//         const platform = await page.evaluate(() => navigator.platform);
//         const isCircleOnWindows = platform === 'Win32' && process.env.CIRCLE;
//         if (isCircleOnWindows) {
//             console.log('Skipping test on CircleCI');
//             return;
//         }
//         const isShippable = platform === 'Linux' && process.env.SHIPPABLE;
//         if (isShippable) {
//             console.log('Skipping test on ShippableCI');
//             return;
//         }
//
//         const execResult = await page.evaluate(() => {
//             return new Promise((resolve) => {
//                 const exec = require('child_process').exec;
//                 exec('echo Jane Lane', (error: any, stdout: any, stderr: any) => {
//                     resolve({ stdout, stderr });
//                 });
//             });
//         });
//
//         expect(execResult.stdout).toContain('Jane Lane');
//         if (platform === 'Win32') {
//             const printResult = await page.evaluate(() => {
//                 return new Promise((resolve) => {
//                     const exec = require('child_process').exec;
//                     exec(`print ${process.env.CONFIG_FILE}`, (error: any, stdout: any, stderr: any) => {
//                         resolve({ stdout, stderr });
//                     });
//                 });
//             });
//             expect(printResult.stderr).toBe('');
//         } else {
//             const catResult = await page.evaluate(() => {
//                 return new Promise((resolve) => {
//                     const exec = require('child_process').exec;
//                     exec(`cat ${process.env.CONFIG_FILE}`, (error: any, stdout: any, stderr: any) => {
//                         resolve({ stdout, stderr });
//                     });
//                 });
//             });
//             expect(catResult.stderr).toBe('');
//             const pwdResult = await page.evaluate(() => {
//                 return new Promise((resolve) => {
//                     const exec = require('child_process').exec;
//                     exec('pwd', (error, stdout, stderr) => {
//                         resolve({ code: error ? error.code : 0 });
//                     });
//                 });
//             });
//             expect(pwdResult.code).toBe(0);
//         }
//     });
//
//     test('get the DOM element that has focus', async ({ page }) => {
//         await page.locator('.misc-form #name').click();
//         const focusedElement = await page.evaluate(() => document.activeElement.id);
//         expect(focusedElement).toBe('name');
//         await page.locator('.misc-form #description').click();
//         const focusedElementDesc = await page.evaluate(() => document.activeElement.id);
//         expect(focusedElementDesc).toBe('description');
//     });
//
//     test.describe('Screenshot', () => {
//         test('take a screenshot', async ({ page }) => {
//             await page.screenshot({ path: 'my-image.png' });
//         });
//
//         test('change default config of screenshots', async ({ page }) => {
//             await page.evaluate(() => {
//                 // Change screenshot defaults
//                 window.screenshotDefaults = {
//                     blackout: ['.foo'],
//                     capture: 'viewport',
//                     clip: { x: 0, y: 0, width: 200, height: 200 },
//                     scale: false,
//                     disableTimersAndAnimations: true,
//                     screenshotOnRunFailure: true,
//                     onBeforeScreenshot: () => {},
//                     onAfterScreenshot: () => {},
//                 };
//             });
//         });
//     });
//
//     test('wrap an object', async ({ page }) => {
//         const wrappedObject = { foo: 'bar' };
//         expect(wrappedObject).toHaveProperty('foo', 'bar');
//     });
// });