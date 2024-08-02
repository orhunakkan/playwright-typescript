// context('Actions', () => {
//
//     beforeEach(() => {
//         cy.visit('https://example.cypress.io/commands/actions')
//     })
//
//     it('.type() - type into a DOM element', () => {
//         cy.get('.action-email').type('fake@email.com')
//         cy.get('.action-email').should('have.value', 'fake@email.com')
//         cy.get('.action-email').type('{leftarrow}{rightarrow}{uparrow}{downarrow}')
//         cy.get('.action-email').type('{del}{selectall}{backspace}')
//         cy.get('.action-email').type('{alt}{option}')
//         cy.get('.action-email').type('{ctrl}{control}')
//         cy.get('.action-email').type('{meta}{command}{cmd}')
//         cy.get('.action-email').type('{shift}')
//         cy.get('.action-email').type('slow.typing@email.com', {delay: 100})
//         cy.get('.action-email').should('have.value', 'slow.typing@email.com')
//         cy.get('.action-disabled').type('disabled error checking', {force: true})
//         cy.get('.action-disabled').should('have.value', 'disabled error checking')
//     })

// it('.focus() - focus on a DOM element', () => {
//     cy.get('.action-focus').focus()
//     cy.get('.action-focus').should('have.class', 'focus').prev().should('have.attr', 'style', 'color: orange;')
// })

// it('.blur() - blur off a DOM element', () => {
//     cy.get('.action-blur').type('About to blur')
//     cy.get('.action-blur').blur()
//     cy.get('.action-blur').should('have.class', 'error').prev().should('have.attr', 'style', 'color: red;')
// })

// it('.clear() - clears an input or textarea element', () => {
//     cy.get('.action-clear').type('Clear this text')
//     cy.get('.action-clear').should('have.value', 'Clear this text')
//     cy.get('.action-clear').clear()
//     cy.get('.action-clear').should('have.value', '')
// })

// it('.submit() - submit a form', () => {
//     cy.get('.action-form').find('[type="text"]').type('HALFOFF')
//     cy.get('.action-form').submit()
//     cy.get('.action-form').next().should('contain', 'Your form has been submitted!')
// })
// })

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
});
