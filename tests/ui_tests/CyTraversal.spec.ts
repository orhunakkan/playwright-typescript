import {expect, test} from '@playwright/test';

test.describe('Traversal', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/traversal');
    });

    test('.children() - get child DOM elements', async ({page}) => {
    });

    test('.closest() - get closest ancestor DOM element', async ({page}) => {
    });

    test('.eq() - get a DOM element at a specific index', async ({page}) => {
    });

    test('.filter() - get DOM elements that match the selector', async ({page}) => {
    });

    test('.find() - get descendant DOM elements of the selector', async ({page}) => {
    });

    test('.first() - get first DOM element', async ({page}) => {
    });

    test('.last() - get last DOM element', async ({page}) => {
    });

    test('.next() - get next sibling DOM element', async ({page}) => {
    });

    test('.nextAll() - get all next sibling DOM elements', async ({page}) => {
    });

    test('.nextUntil() - get next sibling DOM elements until next el', async ({page}) => {
    });

    test('.not() - remove DOM elements from set of DOM elements', async ({page}) => {
    });

    test('.parent() - get parent DOM element from DOM elements', async ({page}) => {
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