import {expect, test} from '@playwright/test';

test.describe('example to-do app', () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/todo');
    });

    test('displays two todo items by default', async ({page}) => {
        const todoItems = page.locator('.todo-list li');
        await expect(todoItems).toHaveCount(2);
        await expect(todoItems.first()).toHaveText('Pay electric bill');
        await expect(todoItems.last()).toHaveText('Walk the dog');
    });

    test('can add new todo items', async ({page}) => {
        const newItem = 'Feed the cat';
        await page.locator('[data-test=new-todo]').fill(`${newItem}{enter}`);
        const todoItems = page.locator('.todo-list li');
        await expect(todoItems).toHaveCount(3);
        await expect(todoItems.last()).toHaveText(newItem);
    });

    test('can check off an item as completed', async ({page}) => {
        await page.locator('text=Pay electric bill').locator('..').locator('input[type=checkbox]').check();
        await expect(page.locator('text=Pay electric bill').locator('..')).toHaveClass(/completed/);
    });

    test.describe('with a checked task', () => {
        test.beforeEach(async ({page}) => {
            await page.locator('text=Pay electric bill').locator('..').locator('input[type=checkbox]').check();
        });

        test('can filter for uncompleted tasks', async ({page}) => {
            await page.locator('text=Active').click();
            const todoItems = page.locator('.todo-list li');
            await expect(todoItems).toHaveCount(1);
            await expect(todoItems.first()).toHaveText('Walk the dog');
            await expect(page.locator('text=Pay electric bill')).not.toBeVisible();
        });

        test('can filter for completed tasks', async ({page}) => {
            await page.locator('text=Completed').click();
            const todoItems = page.locator('.todo-list li');
            await expect(todoItems).toHaveCount(1);
            await expect(todoItems.first()).toHaveText('Pay electric bill');
            await expect(page.locator('text=Walk the dog')).not.toBeVisible();
        });

        test('can delete all completed tasks', async ({page}) => {
            await page.locator('text=Clear completed').click();
            const todoItems = page.locator('.todo-list li');
            await expect(todoItems).toHaveCount(1);
            await expect(todoItems).not.toHaveText('Pay electric bill');
            await expect(page.locator('text=Clear completed')).not.toBeVisible();
        });
    });
});