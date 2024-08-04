import {expect, test} from '@playwright/test';
import {fillWithDelay} from "../../helpers/CyHelperFunctions";

test.describe('Actions', () => {

    test.beforeEach(async ({page}) => {
        await page.goto('https://example.cypress.io/commands/actions');
    });

    test('type into a DOM element', async ({page}) => {
        const emailBox = page.locator('.action-email');
        await emailBox.fill('fake@email.com');
        expect(await emailBox.inputValue()).toBe('fake@email.com');
        await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowUp');
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Delete');
        await page.keyboard.press('Control+A');
        await page.keyboard.press('Backspace');
        await page.keyboard.press('Alt');
        await page.keyboard.press('Control');
        await page.keyboard.press('Meta');
        await page.keyboard.press('Shift');
        await fillWithDelay(emailBox, 'slow.typing@email.com', 100);
        expect(await emailBox.inputValue()).toBe('slow.typing@email.com');
        await emailBox.fill('disabled error checking', {force: true});
        expect(await emailBox.inputValue()).toBe('disabled error checking');
    });

    test('focus on a DOM element', async ({page}) => {
        const focusBox = page.locator('.action-focus');
        await focusBox.focus();
        expect(await focusBox.getAttribute('class')).toContain('action-focus focus');
        const previousSibling = focusBox.locator('xpath=preceding-sibling::*[1]');
        expect(await previousSibling.getAttribute('style')).toBe('color: orange;');
    });

    test('blur off a DOM element', async ({page}) => {
        const blurBox = page.locator('.action-blur');
        await blurBox.fill('About to blur');
        await blurBox.blur();
        expect(await blurBox.getAttribute('class')).toContain('action-blur error');
        const previousSibling = blurBox.locator('xpath=preceding-sibling::*[1]');
        expect(await previousSibling.getAttribute('style')).toBe('color: red;');
    });

    test('clears an input or textarea element', async ({page}) => {
        const clearBox = page.locator('.action-clear');
        await clearBox.fill('Clear this text');
        expect(await clearBox.inputValue()).toBe('Clear this text');
        await clearBox.clear();
        expect(await clearBox.inputValue()).toBe('');
    });

    test('submit a form', async ({page}) => {
    });

    test('click on a DOM element', async ({page}) => {
    });

    test('double click on a DOM element', async ({page}) => {
        const div = page.locator('.action-div');
        await div.dblclick();
        expect(await div.isVisible()).toBe(false);
        const hiddenInput = page.locator('.action-input-hidden');
        expect(await hiddenInput.isVisible()).toBe(true);
    });

    test('right click on a DOM element', async ({page}) => {
        const div = page.locator('.rightclick-action-div');
        await div.click({button: 'right'});
        expect(await div.isVisible()).toBe(false);
        const hiddenInput = page.locator('.rightclick-action-input-hidden');
        expect(await hiddenInput.isVisible()).toBe(true);
    });

    test('check a checkbox or radio element', async ({page}) => {
    });

    test('uncheck a checkbox element', async ({page}) => {
    });

    test('select an option in an <select> element', async ({page}) => {
    });

    test('scroll an element into view', async ({page}) => {
    });

    test('trigger an event on a DOM element', async ({page}) => {
    });

    test('scroll the window or element to a position', async ({page}) => {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        const scrollableHorizontal = page.locator('#scrollable-horizontal');
        await scrollableHorizontal.evaluate((el) => el.scrollLeft = el.scrollWidth);
        const scrollableVertical = page.locator('#scrollable-vertical');
        await scrollableVertical.evaluate((el) => {
            el.scrollTop = 250;
            el.scrollLeft = 250;
        });
        const scrollableBoth = page.locator('#scrollable-both');
        await scrollableBoth.evaluate((el) => {
            el.scrollTop = el.scrollHeight * 0.25;
            el.scrollLeft = el.scrollWidth * 0.75;
        });
        await scrollableVertical.evaluate((el) => el.scrollIntoView({block: 'center', behavior: 'smooth'}));
        await scrollableBoth.evaluate((el) => el.scrollIntoView({block: 'center', behavior: 'smooth'}));
    });
});
