import { test, expect } from '@playwright/test';

test.describe('Actions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('https://example.cypress.io/commands/actions');
    });

    test('type into a DOM element', async ({ page }) => {
        const emailInput = page.locator('.action-email');
        await emailInput.fill('fake@email.com');
        await expect(emailInput).toHaveValue('fake@email.com');
        await emailInput.press('ArrowLeft');
        await emailInput.press('ArrowRight');
        await emailInput.press('ArrowUp');
        await emailInput.press('ArrowDown');
        await emailInput.press('Delete');
        await emailInput.press('Control+A');
        await emailInput.press('Backspace');
        await emailInput.press('Alt');
        await emailInput.press('Control');
        await emailInput.press('Meta');
        await emailInput.press('Shift');
        await emailInput.fill('slow.typing@email.com');
        await expect(emailInput).toHaveValue('slow.typing@email.com');
        const disabledInput = page.locator('.action-disabled');
        await disabledInput.fill('disabled error checking', { force: true });
        await expect(disabledInput).toHaveValue('disabled error checking');
    });

    test('focus on a DOM element', async ({ page }) => {
        const focusInput = page.locator('.action-focus');
        await focusInput.focus();
        await expect(focusInput).toHaveClass('focus');
        await expect(focusInput.locator('preceding-sibling::*')).toHaveAttribute('style', 'color: orange;');
    });

    test('blur off a DOM element', async ({ page }) => {
        const blurInput = page.locator('.action-blur');
        await blurInput.fill('About to blur');
        await blurInput.blur();
        await expect(blurInput).toHaveClass('error');
        await expect(blurInput.locator('preceding-sibling::*')).toHaveAttribute('style', 'color: red;');
    });

    test('clears an input or textarea element', async ({ page }) => {
        const clearInput = page.locator('.action-clear');
        await clearInput.fill('Clear this text');
        await expect(clearInput).toHaveValue('Clear this text');
        await clearInput.clear();
        await expect(clearInput).toHaveValue('');
    });

    // test('submit a form', async ({ page }) => {
    //     const form = page.locator('.action-form');
    //     await form.locator('[type="text"]').type('HALFOFF');
    //     await form.evaluate(form => form.submit());
    //     await expect(form.nextSibling()).toContainText('Your form has been submitted!');
    // });

    // test('click on a DOM element', async ({ page }) => {
    //     await page.locator('.action-btn').click();
    //     const canvas = page.locator('#action-canvas');
    //     await canvas.click();
    //     await canvas.click({ position: { x: 0, y: 0 } });
    //     await canvas.click({ position: { x: canvas.boundingBox().width / 2, y: 0 } });
    //     await canvas.click({ position: { x: canvas.boundingBox().width, y: 0 } });
    //     await canvas.click({ position: { x: 0, y: canvas.boundingBox().height / 2 } });
    //     await canvas.click({ position: { x: canvas.boundingBox().width, y: canvas.boundingBox().height / 2 } });
    //     await canvas.click({ position: { x: 0, y: canvas.boundingBox().height } });
    //     await canvas.click({ position: { x: canvas.boundingBox().width / 2, y: canvas.boundingBox().height } });
    //     await canvas.click({ position: { x: canvas.boundingBox().width, y: canvas.boundingBox().height } });
    //     await canvas.click({ position: { x: 80, y: 75 } });
    //     await canvas.click({ position: { x: 170, y: 75 } });
    //     await canvas.click({ position: { x: 80, y: 165 } });
    //     await canvas.click({ position: { x: 100, y: 185 } });
    //     await canvas.click({ position: { x: 125, y: 190 } });
    //     await canvas.click({ position: { x: 150, y: 185 } });
    //     await canvas.click({ position: { x: 170, y: 165 } });
    //     await page.locator('.action-labels>.label').click({ clickCount: 1 });
    //     await page.locator('.action-opacity>.btn').click({ force: true });
    // });

    test('double click on a DOM element', async ({ page }) => {
        const actionDiv = page.locator('.action-div');
        await actionDiv.dblclick();
        await expect(actionDiv).not.toBeVisible();
        await expect(page.locator('.action-input-hidden')).toBeVisible();
    });

    test('right click on a DOM element', async ({ page }) => {
        const rightClickDiv = page.locator('.rightclick-action-div');
        await rightClickDiv.click({ button: 'right' });
        await expect(rightClickDiv).not.toBeVisible();
        await expect(page.locator('.rightclick-action-input-hidden')).toBeVisible();
    });

    // test('check a checkbox or radio element', async ({ page }) => {
    //     const checkboxes = page.locator('.action-checkboxes [type="checkbox"]').filter({ hasNot: page.locator('[disabled]') });
    //     await checkboxes.check();
    //     await expect(checkboxes).toBeChecked();
    //     const radios = page.locator('.action-radios [type="radio"]').filter({ hasNot: page.locator('[disabled]') });
    //     await radios.check();
    //     await expect(radios).toBeChecked();
    //     await radios.check('radio1');
    //     await expect(radios).toBeChecked();
    //     const multipleCheckboxes = page.locator('.action-multiple-checkboxes [type="checkbox"]');
    //     await multipleCheckboxes.check(['checkbox1', 'checkbox2']);
    //     await expect(multipleCheckboxes).toBeChecked();
    //     await page.locator('.action-checkboxes [disabled]').check({ force: true });
    //     await expect(page.locator('.action-checkboxes [disabled]')).toBeChecked();
    //     await page.locator('.action-radios [type="radio"]').check('radio3', { force: true });
    //     await expect(page.locator('.action-radios [type="radio"]')).toBeChecked();
    // });

    // test('uncheck a checkbox element', async ({ page }) => {
    //     const checkboxes = page.locator('.action-check [type="checkbox"]').filter({ hasNot: page.locator('[disabled]') });
    //     await checkboxes.uncheck();
    //     await expect(checkboxes).not.toBeChecked();
    //     await checkboxes.check('checkbox1');
    //     await checkboxes.uncheck('checkbox1');
    //     await expect(page.locator('.action-check [type="checkbox"][value="checkbox1"]')).not.toBeChecked();
    //     await checkboxes.check(['checkbox1', 'checkbox3']);
    //     await checkboxes.uncheck(['checkbox1', 'checkbox3']);
    //     await expect(page.locator('.action-check [type="checkbox"][value="checkbox1"]')).not.toBeChecked();
    //     await expect(page.locator('.action-check [type="checkbox"][value="checkbox3"]')).not.toBeChecked();
    //     await page.locator('.action-check [disabled]').uncheck({ force: true });
    //     await expect(page.locator('.action-check [disabled]')).not.toBeChecked();
    // });

    test('select an option in an <select> element', async ({ page }) => {
        const select = page.locator('.action-select');
        await expect(select).toHaveValue('--Select a fruit--');
        await select.selectOption('apples');
        await expect(select).toHaveValue('fr-apples');
        const selectMultiple = page.locator('.action-select-multiple');
        await selectMultiple.selectOption(['apples', 'oranges', 'bananas']);
        await expect(selectMultiple).toHaveJSProperty('value', ['fr-apples', 'fr-oranges', 'fr-bananas']);
        await select.selectOption('fr-bananas');
        await expect(select).toHaveValue('fr-bananas');
        await selectMultiple.selectOption(['fr-apples', 'fr-oranges', 'fr-bananas']);
        await expect(selectMultiple).toHaveJSProperty('value', ['fr-apples', 'fr-oranges', 'fr-bananas']);
        await expect(selectMultiple).toHaveJSProperty('value', ['fr-apples', 'fr-oranges', 'fr-bananas']);
        await expect(selectMultiple).toHaveJSProperty('value', expect.arrayContaining(['fr-oranges']));
    });

    test('scroll an element into view', async ({ page }) => {
        const buttonHorizontal = page.locator('#scroll-horizontal button');
        await expect(buttonHorizontal).not.toBeVisible();
        await buttonHorizontal.scrollIntoViewIfNeeded();
        await expect(buttonHorizontal).toBeVisible();
        const buttonVertical = page.locator('#scroll-vertical button');
        await expect(buttonVertical).not.toBeVisible();
        await buttonVertical.scrollIntoViewIfNeeded();
        await expect(buttonVertical).toBeVisible();
        const buttonBoth = page.locator('#scroll-both button');
        await expect(buttonBoth).not.toBeVisible();
        await buttonBoth.scrollIntoViewIfNeeded();
        await expect(buttonBoth).toBeVisible();
    });

    // test('trigger an event on a DOM element', async ({ page }) => {
    //     const inputRange = page.locator('.trigger-input-range');
    //     await inputRange.evaluate(input => input.value = '25');
    //     await inputRange.dispatchEvent('change');
    //     await expect(page.locator('input[type=range]').sibling('p')).toHaveText('25');
    // });

    test('scroll the window or element to a position', async ({ page }) => {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        const scrollableHorizontal = page.locator('#scrollable-horizontal');
        await scrollableHorizontal.evaluate(node => node.scrollLeft = node.scrollWidth);
        const scrollableVertical = page.locator('#scrollable-vertical');
        await scrollableVertical.evaluate(node => node.scrollTop = 250);
        const scrollableBoth = page.locator('#scrollable-both');
        await scrollableBoth.evaluate(node => {
            node.scrollLeft = node.scrollWidth * 0.75;
            node.scrollTop = node.scrollHeight * 0.25;
        });
        await scrollableVertical.evaluate(node => node.scrollTop = node.scrollHeight / 2);
        await scrollableBoth.evaluate(node => {
            node.scrollLeft = node.scrollWidth / 2;
            node.scrollTop = node.scrollHeight / 2;
        }, { duration: 2000 });
    });
});
