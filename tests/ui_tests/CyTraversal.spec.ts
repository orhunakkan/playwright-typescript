import {expect, test} from '@playwright/test';

test.describe('Traversal', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/traversal');
    });

    test('children() - get child DOM elements', async ({page}) => {
        const children = page.locator('.traversal-breadcrumb').locator('.active');
        await expect(children).toContainText('Data');
    });

    test('closest() - get closest ancestor DOM element', async ({page}) => {
        const closest = page.locator('.traversal-badge').locator('ul');
        await expect(closest).toHaveClass('list-group');
    });

    test('eq() - get a DOM element at a specific index', async ({page}) => {
        const eqElement = page.locator('.traversal-list>li').nth(1);
        await expect(eqElement).toContainText('siamese');
    });

    test('filter() - get DOM elements that match the selector', async ({page}) => {
        const filtered = page.locator('.traversal-nav>li').filter({hasText: 'About'});
        await expect(filtered).toContainText('About');
    });

    test('find() - get descendant DOM elements of the selector', async ({page}) => {
        const found = page.locator('.traversal-pagination').locator('li a');
        await expect(found).toHaveCount(7);
    });

    test('first() - get first DOM element', async ({page}) => {
        const first = page.locator('.traversal-table td').first();
        await expect(first).toContainText('1');
    });

    test('last() - get last DOM element', async ({page}) => {
        const last = page.locator('.traversal-buttons .btn').last();
        await expect(last).toContainText('Submit');
    });

    test('next() - get next sibling DOM element', async ({page}) => {
        const next = page.locator('.traversal-ul').locator('text=apples').locator('..').locator('li').nth(1);
        await expect(next).toContainText('oranges');
    });

    test('nextAll() - get all next sibling DOM elements', async ({page}) => {
        const nextAll = page.locator('.traversal-next-all').locator('text=oranges').locator('..').locator('li').nth(1).locator('~ li');
        await expect(nextAll).toHaveCount(3);
    });

    test('nextUntil() - get next sibling DOM elements until next el', async ({page}) => {
        const nextUntil = page.locator('#veggies').locator('~ *').locator(':not(#nuts)');
        await expect(nextUntil).toHaveCount(3);
    });

    test('not() - remove DOM elements from set of DOM elements', async ({page}) => {
        const notDisabled = page.locator('.traversal-disabled .btn').filter({hasNot: page.locator('[disabled]')});
        await expect(notDisabled).not.toContainText('Disabled');
    });

    test('parent() - get parent DOM element from DOM elements', async ({page}) => {
        const parent = page.locator('.traversal-mark').locator('..');
        await expect(parent).toContainText('Morbi leo risus');
    });

    test('parents() - get parent DOM elements from DOM elements', async ({page}) => {
        const parents = page.locator('.traversal-cite').locator('..').locator('..');
        await expect(parents).toHaveClass('blockquote');
    });

    test('parentsUntil() - get parent DOM elements from DOM elements until el', async ({page}) => {
        const parentsUntil = page.locator('.clothes-nav').locator('.active').locator('..').locator('..').locator(':not(.clothes-nav)');
        await expect(parentsUntil).toHaveCount(2);
    });

    test('prev() - get previous sibling DOM element', async ({page}) => {
        const prev = page.locator('.birds .active').locator('..').locator('li').nth(0);
        await expect(prev).toContainText('Lorikeets');
    });

    test('prevAll() - get all previous sibling DOM elements', async ({page}) => {
        const prevAll = page.locator('.fruits-list .third').locator('..').locator('li').nth(0).locator('~ li');
        await expect(prevAll).toHaveCount(2);
    });

    test('prevUntil() - get all previous sibling DOM elements until el', async ({page}) => {
        const prevUntil = page.locator('.foods-list #nuts').locator('~ *').locator(':not(#veggies)');
        await expect(prevUntil).toHaveCount(3);
    });

    test('siblings() - get all sibling DOM elements', async ({page}) => {
        const siblings = page.locator('.traversal-pills .active').locator('..').locator('li').nth(0).locator('~ li');
        await expect(siblings).toHaveCount(2);
    });
});