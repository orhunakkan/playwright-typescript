import {expect, test} from '@playwright/test';

test.describe('Network Requests', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/network-requests');
    });

    test('make an XHR request', async ({request}) => {
    });

    test('verify response using BDD syntax', async ({request}) => {
    });

    test('request with query parameters', async ({request}) => {
    });

    test('pass result to the second request', async ({request}) => {
    });

    test('save response in the shared test context', async ({request}) => {
    });

    test('route responses to matching requests', async ({page, request}) => {
    });
});