import {expect, test} from '@playwright/test';

test.describe('Network Requests', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/network-requests');
    });

    test('make an XHR request', async ({page}) => {
        const response = await page.request.get('https://jsonplaceholder.cypress.io/comments');
        const body = await response.json();
        expect(response.status()).toBe(200);
        expect(body).toHaveLength(500);
        expect(response.headers()).toBeDefined();
        // expect(response.timing()).toBeDefined();
    });

    test('verify response using BDD syntax', async ({page}) => {
        const response = await page.request.get('https://jsonplaceholder.cypress.io/comments');
        const body = await response.json();
        expect(response.status()).toBe(200);
        expect(body).toHaveLength(500);
        expect(response.headers()).toBeDefined();
        // expect(response.timing()).toBeDefined();
    });

    test('request with query parameters', async ({page}) => {
        const response = await page.request.get('https://jsonplaceholder.cypress.io/comments', {
            params: {postId: 1, id: 3},
        });
        const body = await response.json();
        expect(body).toBeInstanceOf(Array);
        expect(body).toHaveLength(1);
        expect(body[0]).toMatchObject({postId: 1, id: 3});
    });

    test('pass result to the second request', async ({page}) => {
        const userResponse = await page.request.get('https://jsonplaceholder.cypress.io/users?_limit=1');
        const user = (await userResponse.json())[0];
        expect(user.id).toBeDefined();

        const postResponse = await page.request.post('https://jsonplaceholder.cypress.io/posts', {
            data: {
                userId: user.id,
                title: 'Playwright Test Runner',
                body: 'Fast, easy and reliable testing for anything that runs in a browser.',
            },
        });
        const post = await postResponse.json();
        expect(post.id).toBeGreaterThan(100);
        expect(post.userId).toBe(user.id);
    });

    test('save response in the shared test context', async ({page}) => {
        const userResponse = await page.request.get('https://jsonplaceholder.cypress.io/users?_limit=1');
        const user = (await userResponse.json())[0];
        expect(user.id).toBeDefined();

        const postResponse = await page.request.post('https://jsonplaceholder.cypress.io/posts', {
            data: {
                userId: user.id,
                title: 'Playwright Test Runner',
                body: 'Fast, easy and reliable testing for anything that runs in a browser.',
            },
        });
        const post = await postResponse.json();
        expect(post.userId).toBe(user.id);
    });

    test('route responses to matching requests', async ({page}) => {
        const message = 'whoa, this comment does not exist';
        await page.route('**/comments/*', route => route.continue());
        await page.locator('.network-btn').click();
        const getCommentResponse = await page.waitForResponse('**/comments/*');
        expect([200, 304]).toContain(getCommentResponse.status());

        await page.route('**/comments', route => route.continue());
        await page.locator('.network-post').click();
        const postCommentResponse = await page.waitForResponse('**/comments');
        const postCommentBody = await postCommentResponse.json();
        expect(postCommentBody).toHaveProperty('name', 'Using POST in cy.intercept()');

        await page.route('**/comments/*', route => route.fulfill({
            status: 404,
            body: JSON.stringify({error: message}),
            headers: {'access-control-allow-origin': '*'},
            // delay: 500,
        }));
        await page.locator('.network-put').click();
        await page.waitForResponse('**/comments/*');
        await page.locator('.network-put-comment').waitFor({state: 'visible'});
        const putCommentText = await page.locator('.network-put-comment').textContent();
        expect(putCommentText).toContain(message);
    });
});