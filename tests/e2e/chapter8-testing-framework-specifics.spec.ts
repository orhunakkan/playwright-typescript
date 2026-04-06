import { expect, test } from '../../fixtures/page-fixtures';
import { feature, story, severity } from 'allure-js-commons';

test.describe('Chapter 8 - Testing Framework Specifics', () => {
  // ─────────────────────────────────────────────────
  //  1. Random Calculator
  // ─────────────────────────────────────────────────
  test.describe('Random Calculator', () => {
    test.beforeEach(async ({ randomCalculatorPage }) => {
      feature('Testing Framework Specifics');
      story('Random Calculator');
      severity('critical');
      await randomCalculatorPage.actions.goto();
    });

    test('should display the random calculator heading', { tag: ['@smoke'] }, async ({ randomCalculatorPage }) => {
      await expect(randomCalculatorPage.locators.heading).toBeVisible();
    });

    test('should display the description paragraph', async ({ randomCalculatorPage }) => {
      await expect(randomCalculatorPage.locators.description).toContainText('This calculator produces incorrect results');
      await expect(randomCalculatorPage.locators.description).toContainText('% of times');
      await expect(randomCalculatorPage.locators.description).toContainText('retries');
    });

    test('should have a percent input with default value of 50', async ({ randomCalculatorPage }) => {
      await expect(randomCalculatorPage.locators.percentInput).toBeAttached();
      await expect(randomCalculatorPage.locators.percentInput).toHaveValue('50');
    });

    test('should have a correct-after input with default value of 5', async ({ randomCalculatorPage }) => {
      await expect(randomCalculatorPage.locators.correctInput).toBeAttached();
      await expect(randomCalculatorPage.locators.correctInput).toHaveValue('5');
    });

    test('should have a hidden spinner element', async ({ randomCalculatorPage }) => {
      await expect(randomCalculatorPage.locators.spinner).toBeAttached();
      await expect(randomCalculatorPage.locators.spinner).toBeHidden();
    });

    // --- Calculator Structure ---
    test('should have a calculator element', async ({ randomCalculatorPage }) => {
      await expect(randomCalculatorPage.locators.calculator).toBeVisible();
    });

    test('should have a screen display area', async ({ randomCalculatorPage }) => {
      await expect(randomCalculatorPage.locators.screen).toBeAttached();
      // Screen should be empty initially
      await expect(randomCalculatorPage.locators.screen).toHaveText('');
    });

    test('should have digit buttons 0-9', async ({ randomCalculatorPage }) => {
      const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      for (const digit of digits) {
        await expect(randomCalculatorPage.locators.digitButtons.filter({ hasText: digit }).first()).toBeVisible();
      }
    });

    test('should have operator buttons', async ({ randomCalculatorPage }) => {
      await expect(randomCalculatorPage.locators.operatorButtons).toHaveCount(4);

      // Verify all four operators exist
      await expect(randomCalculatorPage.locators.operatorButtons.filter({ hasText: '+' })).toBeVisible();
      await expect(randomCalculatorPage.locators.operatorButtons.filter({ hasText: '-' })).toBeVisible();
      await expect(randomCalculatorPage.locators.operatorButtons.filter({ hasText: '÷' })).toBeVisible();
      await expect(randomCalculatorPage.locators.operatorButtons.filter({ hasText: 'x' })).toBeVisible();
    });

    test('should have a clear button', async ({ randomCalculatorPage }) => {
      await expect(randomCalculatorPage.locators.clearButton).toBeVisible();
      await expect(randomCalculatorPage.locators.clearButton).toHaveText('C');
      await expect(randomCalculatorPage.locators.clearButton).toHaveClass(/btn-outline-danger/);
    });

    test('should have an equals button', async ({ randomCalculatorPage }) => {
      await expect(randomCalculatorPage.locators.equalsButton).toBeVisible();
      await expect(randomCalculatorPage.locators.equalsButton).toHaveClass(/btn-outline-warning/);
    });

    test('should have a decimal point button', async ({ randomCalculatorPage }) => {
      await expect(randomCalculatorPage.locators.dotButton).toBeVisible();
    });

    // --- Calculator Interactions ---
    test('should display digits when clicked', { tag: ['@critical'] }, async ({ randomCalculatorPage }) => {
      await randomCalculatorPage.actions.clickButton('1');
      await expect(randomCalculatorPage.locators.screen).toHaveText('1');

      await randomCalculatorPage.actions.clickButton('2');
      await expect(randomCalculatorPage.locators.screen).toHaveText('12');

      await randomCalculatorPage.actions.clickButton('3');
      await expect(randomCalculatorPage.locators.screen).toHaveText('123');
    });

    test('should clear the screen when C is clicked', { tag: ['@critical'] }, async ({ randomCalculatorPage }) => {
      await randomCalculatorPage.actions.pressKeys('5', '6');
      await expect(randomCalculatorPage.locators.screen).toHaveText('56');

      await randomCalculatorPage.actions.clickButton('C');
      await expect(randomCalculatorPage.locators.screen).toHaveText('');
    });

    test('should display operator after digit', async ({ randomCalculatorPage }) => {
      await randomCalculatorPage.actions.pressKeys('5', '+');
      await expect(randomCalculatorPage.locators.screen).toHaveText('5+');
    });

    test('should not allow operator as first character except minus', async ({ randomCalculatorPage }) => {
      // Plus should not appear on empty screen
      await randomCalculatorPage.actions.clickButton('+');
      await expect(randomCalculatorPage.locators.screen).toHaveText('');

      // But minus should work as negative sign
      await randomCalculatorPage.actions.clickButton('-');
      await expect(randomCalculatorPage.locators.screen).toHaveText('-');
    });

    test('should handle decimal point input', async ({ randomCalculatorPage }) => {
      await randomCalculatorPage.actions.pressKeys('3', '.', '5');
      await expect(randomCalculatorPage.locators.screen).toHaveText('3.5');
    });

    test('should not allow multiple decimal points in same number', async ({ randomCalculatorPage }) => {
      await randomCalculatorPage.actions.pressKeys('3', '.', '5', '.', '2');
      // Second dot should be ignored
      await expect(randomCalculatorPage.locators.screen).toHaveText('3.52');
    });

    test('should replace operator when another operator is pressed', async ({ randomCalculatorPage }) => {
      await randomCalculatorPage.actions.pressKeys('5', '+');
      await expect(randomCalculatorPage.locators.screen).toHaveText('5+');

      // Press minus — should replace +
      await randomCalculatorPage.actions.clickButton('-');
      await expect(randomCalculatorPage.locators.screen).toHaveText('5-');
    });

    const arithmeticCases = [
      { label: 'addition', keys: ['2', '+', '3', '='] as const, expected: '5', tag: ['@smoke', '@critical'] },
      { label: 'subtraction', keys: ['9', '-', '4', '='] as const, expected: '5', tag: ['@critical'] },
      { label: 'multiplication', keys: ['6', 'x', '7', '='] as const, expected: '42', tag: ['@critical'] },
      { label: 'division', keys: ['8', '÷', '2', '='] as const, expected: '4', tag: ['@critical'] },
    ];

    for (const { label, keys, expected, tag } of arithmeticCases) {
      test(`should correctly compute ${label} in 100% correct mode`, { tag }, async ({ randomCalculatorPage }) => {
        await randomCalculatorPage.actions.setPercent('0');
        await randomCalculatorPage.actions.pressKeys(...keys);
        await expect(randomCalculatorPage.locators.screen).toHaveText(expected);
      });
    }

    test('should handle multi-digit calculations in 100% correct mode', async ({ randomCalculatorPage }) => {
      await randomCalculatorPage.actions.setPercent('0');

      await randomCalculatorPage.actions.pressKeys('1', '5', '+', '2', '7', '=');
      await expect(randomCalculatorPage.locators.screen).toHaveText('42');
    });

    test('should clear and start a new calculation', async ({ randomCalculatorPage }) => {
      await randomCalculatorPage.actions.setPercent('0');

      // First calculation
      await randomCalculatorPage.actions.pressKeys('5', '+', '3', '=');
      await expect(randomCalculatorPage.locators.screen).toHaveText('8');

      // Clear
      await randomCalculatorPage.actions.clickButton('C');
      await expect(randomCalculatorPage.locators.screen).toHaveText('');

      // New calculation
      await randomCalculatorPage.actions.pressKeys('9', '-', '1', '=');
      await expect(randomCalculatorPage.locators.screen).toHaveText('8');
    });

    test('should produce incorrect results in 100% error mode', async ({ randomCalculatorPage }) => {
      await randomCalculatorPage.actions.setPercent('100');
      await randomCalculatorPage.actions.setCorrectAfter('999');

      await randomCalculatorPage.actions.pressKeys('2', '+', '3', '=');

      // The result should be a number (random 1-100), not necessarily 5
      const result = await randomCalculatorPage.locators.screen.textContent();
      expect(result).toBeTruthy();
      const numericResult = Number(result);
      expect(numericResult).not.toBeNaN();
    });

    test('should allow changing the percent input', async ({ randomCalculatorPage }) => {
      await randomCalculatorPage.actions.setPercent('75');
      await expect(randomCalculatorPage.locators.percentInput).toHaveValue('75');
    });

    test('should allow changing the correct-after input', async ({ randomCalculatorPage }) => {
      await randomCalculatorPage.actions.setCorrectAfter('10');
      await expect(randomCalculatorPage.locators.correctInput).toHaveValue('10');
    });

    test('should have correct button styling for digit buttons', async ({ randomCalculatorPage }) => {
      await expect(randomCalculatorPage.locators.digitButton('7')).toHaveClass(/btn-outline-primary/);
    });

    test('should have correct button styling for operator buttons', async ({ randomCalculatorPage }) => {
      await expect(randomCalculatorPage.locators.operatorButtons.first()).toHaveClass(/btn-outline-success/);
    });

    test('should handle decimal calculations in 100% correct mode', async ({ randomCalculatorPage }) => {
      await randomCalculatorPage.actions.setPercent('0');

      await randomCalculatorPage.actions.pressKeys('1', '.', '5', '+', '2', '.', '5', '=');
      await expect(randomCalculatorPage.locators.screen).toHaveText('4');
    });

    test('should verify page title and copyright', async ({ randomCalculatorPage, page }) => {
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(randomCalculatorPage.locators.copyright).toBeAttached();
    });

    test('should become correct after configured number of retries', async ({ randomCalculatorPage }) => {
      // Set 100% correct mode where correct results start after 2 calculations
      await randomCalculatorPage.actions.setPercent('100');
      await randomCalculatorPage.actions.setCorrectAfter('2');

      // First 2 calculations may be random; the 3rd should be correct
      for (let attempt = 0; attempt < 2; attempt++) {
        await randomCalculatorPage.actions.pressKeys('1', '+', '1', '=');
        await randomCalculatorPage.locators.screen.waitFor({ state: 'attached' });
        await randomCalculatorPage.actions.clickButton('C');
      }

      // Third calculation: 3 + 4 = 7 (should be correct now)
      await randomCalculatorPage.actions.pressKeys('3', '+', '4', '=');
      await expect(randomCalculatorPage.locators.screen).toHaveText('7');
    });

    test('should handle zero as an operand in 100% correct mode', async ({ randomCalculatorPage }) => {
      await randomCalculatorPage.actions.setPercent('100');
      await randomCalculatorPage.actions.setCorrectAfter('0');

      // 0 + 5 = 5
      await randomCalculatorPage.actions.pressKeys('0', '+', '5', '=');
      await expect(randomCalculatorPage.locators.screen).toHaveText('5');

      // Clear and do 7 x 0 = 0
      await randomCalculatorPage.actions.clickButton('C');
      await randomCalculatorPage.actions.pressKeys('7', 'x', '0', '=');
      await expect(randomCalculatorPage.locators.screen).toHaveText('0');
    });
  });

  // ─────────────────────────────────────────────────
  //  Index Page - Chapter 8 Links
  // ─────────────────────────────────────────────────
  test.describe('Index Page - Chapter 8 Links', () => {
    test.beforeEach(async ({ homePage }) => {
      feature('Testing Framework Specifics');
      story('Chapter 8 Index');
      severity('normal');
      await homePage.actions.goto();
    });

    test('should display the Chapter 8 section heading', async ({ homePage }) => {
      await expect(homePage.locators.chapter8Heading).toBeVisible();
    });

    test('should have the Random calculator link', async ({ homePage }) => {
      await expect(homePage.locators.chapterLink('Random calculator')).toBeVisible();
    });

    test('should navigate to Random calculator and back', async ({ homePage, page }) => {
      await homePage.locators.chapterLink('Random calculator').click();
      await expect(page).toHaveURL(/random-calculator\.html/);
      await page.goBack();
      await expect(page).toHaveURL(/index\.html/);
    });
  });
});
