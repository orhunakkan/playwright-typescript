import {expect, test} from '@playwright/test';

test.describe('Traversal', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/traversal');
    });

    test('.children() - get child DOM elements', async ({page}) => {
        const element = page.locator('.traversal-breadcrumb').locator('.active');
        await expect(element).toContainText('Data');
    });

    test('.closest() - get closest ancestor DOM element', async ({page}) => {
    });

    test('.eq() - get a DOM element at a specific index', async ({page}) => {
        const element = page.locator('.traversal-list>li').nth(1);
        await expect(element).toContainText('siamese');
    });

    test('.filter() - get DOM elements that match the selector', async ({page}) => {
        const element = page.locator('.traversal-nav>li').filter({hasText: 'About'});
        await expect(element).toContainText('About');
    });

    test('.find() - get descendant DOM elements of the selector', async ({page}) => {
        const elements = page.locator('.traversal-pagination').locator('li').locator('a');
        await expect(elements).toHaveCount(7);
    });

    test('.first() - get first DOM element', async ({page}) => {
        const element = page.locator('.traversal-table td').first();
        await expect(element).toContainText('1');
    });

    test('.last() - get last DOM element', async ({page}) => {
        const element = page.locator('.traversal-buttons .btn').last();
        await expect(element).toContainText('Submit');
    });

    test('.next() - get next sibling DOM element', async ({page}) => {
        const element = page.locator('.traversal-ul').locator('text=apples').locator('..').locator('li').nth(1);
        await expect(element).toContainText('oranges');
    });

    test('.nextAll() - get all next sibling DOM elements', async ({page}) => {
        const elements = page.locator('.traversal-next-all').locator('text=oranges').locator('..').locator('li').nth(1).locator('~ li');
        await expect(elements).toHaveCount(3);
    });

    test('.nextUntil() - get next sibling DOM elements until next el', async ({page}) => {
    });

    test('.not() - remove DOM elements from set of DOM elements', async ({page}) => {
    });

    test('.parent() - get parent DOM element from DOM elements', async ({page}) => {
        const element = page.locator('.traversal-mark').locator('..');
        await expect(element).toContainText('Morbi leo risus');
    });

    test('.parents() - get parent DOM elements from DOM elements', async ({page}) => {
    });

    test('.parentsUntil() - get parent DOM elements from DOM elements until el', async ({page}) => {
    });

    test('.prev() - get previous sibling DOM element', async ({page}) => {
    });

    test('.prevAll() - get all previous sibling DOM elements', async ({page}) => {
    });

    test('.prevUntil() - get all previous sibling DOM elements until el', async ({page}) => {
    });

    test('.siblings() - get all sibling DOM elements', async ({page}) => {
    });
});