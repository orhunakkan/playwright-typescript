import {expect, test} from '@playwright/test';
import {exec} from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

test.describe('Misc', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/misc');
    });

    test('execute a system command', async ({page}) => {
        console.log(`Platform ${process.platform} architecture ${process.arch}`);
        const isCircleOnWindows = process.platform === 'win32' && process.env.CIRCLE;
        if (isCircleOnWindows) {
            console.log('Skipping test on CircleCI');
            return;
        }
        const isShippable = process.platform === 'linux' && process.env.SHIPPABLE;
        if (isShippable) {
            console.log('Skipping test on ShippableCI');
            return;
        }

        const {stdout: echoStdout} = await execPromise('echo Jane Lane');
        expect(echoStdout).toContain('Jane Lane');

        if (process.platform === 'win32') {
            const {stderr: printStderr} = await execPromise(`print ${process.env.CONFIG_FILE}`);
            expect(printStderr).toBe('');
        } else {
            const {stderr: catStderr} = await execPromise(`cat ${process.env.CONFIG_FILE}`);
            expect(catStderr).toBe('');
            // const { code: pwdCode } = await execPromise('pwd');
            // expect(pwdCode).toBe(0);
        }
    });

    test('get the DOM element that has focus', async ({page}) => {
    });

    test.describe('Screenshot', () => {
        test('take a screenshot', async ({page}) => {
            await page.screenshot({path: 'my-image.png'});
        });

        test('change default config of screenshots', async ({page}) => {
        });
    });

    test('wrap an object', async () => {
        const obj = {foo: 'bar'};
        expect(obj).toHaveProperty('foo', 'bar');
    });
});