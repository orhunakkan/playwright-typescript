// import { test, expect } from '@playwright/test';
//
// test.describe('Spies, Stubs, and Clock', () => {
//     test.beforeEach(async ({ page }) => {
//         await page.goto('https://example.cypress.io/commands/spies-stubs-clocks');
//     });
//
//     test('wrap a method in a spy', async ({ page }) => {
//         const obj = { foo: () => {} };
//         await page.exposeFunction('foo', obj.foo);
//         const spy = await page.evaluate(() => {
//             const original = window.foo;
//             let called = false;
//             window.foo = function() {
//                 called = true;
//                 return original.apply(this, arguments);
//             };
//             return { called };
//         });
//         await page.evaluate(() => window.foo());
//         expect(spy.called).toBeTruthy();
//     });
//
//     test('spy retries until assertions pass', async ({ page }) => {
//         const obj = { foo: (x) => console.log('obj.foo called with', x) };
//         await page.exposeFunction('foo', obj.foo);
//         const spy = await page.evaluate(() => {
//             const original = window.foo;
//             let callCount = 0;
//             window.foo = function() {
//                 callCount++;
//                 return original.apply(this, arguments);
//             };
//             setTimeout(() => window.foo('first'), 500);
//             setTimeout(() => window.foo('second'), 2500);
//             return { callCount };
//         });
//         await page.waitForFunction(spy => spy.callCount === 2, spy);
//     });
//
//     test('create a stub and/or replace a function with stub', async ({ page }) => {
//         const obj = { foo: (a, b) => console.log('a', a, 'b', b) };
//         await page.exposeFunction('foo', obj.foo);
//         const stub = await page.evaluate(() => {
//             const original = window.foo;
//             let called = false;
//             window.foo = function() {
//                 called = true;
//                 return;
//             };
//             return { called };
//         });
//         await page.evaluate(() => window.foo('foo', 'bar'));
//         expect(stub.called).toBeTruthy();
//     });
//
//     test('control time in the browser', async ({ page }) => {
//         const now = new Date(Date.UTC(2017, 2, 14)).getTime();
//         await page.evaluate(now => {
//             const originalDate = Date;
//             window.Date = function(...args) {
//                 if (args.length === 0) {
//                     return new originalDate(now);
//                 }
//                 return new originalDate(...args);
//             };
//             window.Date.now = () => now;
//         }, now);
//         await page.locator('#clock-div').click();
//         await expect(page.locator('#clock-div')).toHaveText('1489449600');
//     });
//
//     test('move time in the browser', async ({ page }) => {
//         const now = new Date(Date.UTC(2017, 2, 14)).getTime();
//         await page.evaluate(now => {
//             const originalDate = Date;
//             let currentTime = now;
//             window.Date = function(...args) {
//                 if (args.length === 0) {
//                     return new originalDate(currentTime);
//                 }
//                 return new originalDate(...args);
//             };
//             window.Date.now = () => currentTime;
//             window.tick = (ms) => { currentTime += ms; };
//         }, now);
//         await page.locator('#tick-div').click();
//         await expect(page.locator('#tick-div')).toHaveText('1489449600');
//         await page.evaluate(() => window.tick(10000)); // 10 seconds passed
//         await page.locator('#tick-div').click();
//         await expect(page.locator('#tick-div')).toHaveText('1489449610');
//     });
//
//     test('stub matches depending on arguments', async ({ page }) => {
//         const greeter = { greet: (name) => `Hello, ${name}!` };
//         await page.exposeFunction('greet', greeter.greet);
//         const stub = await page.evaluate(() => {
//             const original = window.greet;
//             window.greet = function(name) {
//                 if (typeof name === 'string') {
//                     return 'Hi';
//                 } else if (typeof name === 'number') {
//                     throw new Error('Invalid name');
//                 }
//                 return original.apply(this, arguments);
//             };
//             return { calledTwice: false };
//         });
//         expect(await page.evaluate(() => window.greet('World'))).toBe('Hi');
//         await expect(page.evaluate(() => window.greet(42))).rejects.toThrow('Invalid name');
//         expect(stub.calledTwice).toBeTruthy();
//         expect(await page.evaluate(() => window.greet())).toBe('Hello, undefined!');
//     });
//
//     test('matches call arguments using custom matchers', async ({ page }) => {
//         const calculator = { add: (a, b) => a + b };
//         await page.exposeFunction('add', calculator.add);
//         const spy = await page.evaluate(() => {
//             const original = window.add;
//             let calls = [];
//             window.add = function(...args) {
//                 calls.push(args);
//                 return original.apply(this, args);
//             };
//             return { calls };
//         });
//         expect(await page.evaluate(() => window.add(2, 3))).toBe(5);
//         expect(spy.calls).toContainEqual([2, 3]);
//         expect(spy.calls).toContainEqual([expect.any(Number), expect.any(Number)]);
//         expect(spy.calls).toContainEqual([2, 3]);
//         expect(spy.calls).toContainEqual([expect.anything(), 3]);
//         expect(spy.calls).toContainEqual([expect.arrayContaining([1, 2, 3]), 3]);
//         const isEven = (x) => x % 2 === 0;
//         expect(spy.calls).toContainEqual([expect(isEven), 3]);
//         const isGreaterThan = (limit) => (x) => x > limit;
//         const isLessThan = (limit) => (x) => x < limit;
//         expect(spy.calls).toContainEqual([expect.any(Number), expect(isGreaterThan(2)).and(isLessThan(4))]);
//         expect(spy.calls).toContainEqual([expect.any(Number), expect(isGreaterThan(200)).or(3)]);
//     });
// });