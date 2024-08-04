import {expect, test} from '@playwright/test';

test.describe('Network Requests', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/network-requests');
    });

    test('make an XHR request', async ({request}) => {
        const response = await request.get('https://jsonplaceholder.cypress.io/comments');
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toHaveLength(500);
        expect(response.headers()).toBeDefined();
        // expect(response.timing()).toBeDefined();
    });

    test('verify response using BDD syntax', async ({request}) => {
        const response = await request.get('https://jsonplaceholder.cypress.io/comments');
        expect(response.status()).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toHaveLength(500);
        expect(response.headers()).toBeDefined();
        // expect(response.timing()).toBeDefined();
    });

    test('request with query parameters', async ({request}) => {
        const response = await request.get('https://jsonplaceholder.cypress.io/comments', {
            params: {
                postId: 1,
                id: 3,
            },
        });
        const responseBody = await response.json();
        expect(responseBody).toBeInstanceOf(Array);
        expect(responseBody).toHaveLength(1);
        expect(responseBody[0]).toMatchObject({
            postId: 1,
            id: 3,
        });
    });

    test('pass result to the second request', async ({request}) => {
        const userResponse = await request.get('https://jsonplaceholder.cypress.io/users?_limit=1');
        const user = (await userResponse.json())[0];
        expect(user.id).toBeGreaterThan(0);

        const postResponse = await request.post('https://jsonplaceholder.cypress.io/posts', {
            data: {
                userId: user.id,
                title: 'Cypress Test Runner',
                body: 'Fast, easy and reliable testing for anything that runs in a browser.',
            },
        });
        const post = await postResponse.json();
        expect(postResponse.status()).toBe(201);
        expect(post).toMatchObject({
            title: 'Cypress Test Runner',
            userId: user.id,
        });
        expect(post.id).toBeGreaterThan(100);
    });

    test('save response in the shared test context', async ({request}) => {
        const userResponse = await request.get('https://jsonplaceholder.cypress.io/users?_limit=1');
        const user = (await userResponse.json())[0];
        expect(user.id).toBeGreaterThan(0);

        const postResponse = await request.post('https://jsonplaceholder.cypress.io/posts', {
            data: {
                userId: user.id,
                title: 'Cypress Test Runner',
                body: 'Fast, easy and reliable testing for anything that runs in a browser.',
            },
        });
        const post = await postResponse.json();
        expect(post.userId).toBe(user.id);
    });

    test('route responses to matching requests', async ({page, request}) => {
    });
});