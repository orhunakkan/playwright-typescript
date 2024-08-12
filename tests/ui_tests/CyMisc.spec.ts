import {expect, test} from '@playwright/test';
import {exec} from 'child_process';
import util from 'util';

test.describe('Misc', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/misc');
    });

    test('execute a system command', async ({page}) => {
    });

    test('get the DOM element that has focus', async ({page}) => {
    });

    test.describe('Screenshot', () => {
        test('take a screenshot', async ({page}) => {
        });

        test('change default config of screenshots', async ({page}) => {
        });
    });

    test('wrap an object', async () => {
    });
});