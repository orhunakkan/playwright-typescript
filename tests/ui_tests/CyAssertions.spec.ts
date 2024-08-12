import {expect, test} from '@playwright/test';

test.describe('Assertions', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/assertions');
    });

    test.describe('Implicit Assertions', () => {

        test('.should() - make an assertion about the current subject', async ({page}) => {
        });

        test('.and() - chain multiple assertions together', async ({page}) => {
        });
    });

    test.describe('Explicit Assertions', () => {

        test('expect - make an assertion about a specified subject', async ({page}) => {
        });

        test('pass your own callback function to should()', async ({page}) => {
        });

        test('finds element by class name regex', async ({page}) => {
        });

        test('can throw any error', async ({page}) => {
        });

        test('matches unknown text between two elements', async ({page}) => {
        });

        test('assert - assert shape of an object', async ({page}) => {
        });

        test('retries the should callback until assertions pass', async ({page}) => {
        });
    });
});

