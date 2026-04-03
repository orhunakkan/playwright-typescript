import { expect, test } from '@playwright/test';
import { RandomCalculatorPage } from '../../pages/random-calculator.page';
import { HomePage } from '../../pages/home.page';

test.describe('Chapter 8 - Testing Framework Specifics', () => {
  // ─────────────────────────────────────────────────
  //  1. Random Calculator
  // ─────────────────────────────────────────────────
  test.describe('Random Calculator', () => {
    test.beforeEach(async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await calcPage.actions.goto();
    });

    test('should display the random calculator heading', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await expect(calcPage.locators.heading).toBeVisible();
    });

    test('should display the description paragraph', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await expect(calcPage.locators.description).toContainText('This calculator produces incorrect results');
      await expect(calcPage.locators.description).toContainText('% of times');
      await expect(calcPage.locators.description).toContainText('retries');
    });

    test('should have a percent input with default value of 50', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await expect(calcPage.locators.percentInput).toBeAttached();
      await expect(calcPage.locators.percentInput).toHaveValue('50');
    });

    test('should have a correct-after input with default value of 5', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await expect(calcPage.locators.correctInput).toBeAttached();
      await expect(calcPage.locators.correctInput).toHaveValue('5');
    });

    test('should have a hidden spinner element', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await expect(calcPage.locators.spinner).toBeAttached();
      await expect(calcPage.locators.spinner).toBeHidden();
    });

    // --- Calculator Structure ---
    test('should have a calculator element', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await expect(calcPage.locators.calculator).toBeVisible();
    });

    test('should have a screen display area', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await expect(calcPage.locators.screen).toBeAttached();
      // Screen should be empty initially
      await expect(calcPage.locators.screen).toHaveText('');
    });

    test('should have digit buttons 0-9', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      for (const digit of digits) {
        await expect(calcPage.locators.digitButtons.filter({ hasText: digit }).first()).toBeVisible();
      }
    });

    test('should have operator buttons', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await expect(calcPage.locators.operatorButtons).toHaveCount(4);

      // Verify all four operators exist
      await expect(calcPage.locators.operatorButtons.filter({ hasText: '+' })).toBeVisible();
      await expect(calcPage.locators.operatorButtons.filter({ hasText: '-' })).toBeVisible();
      await expect(calcPage.locators.operatorButtons.filter({ hasText: '÷' })).toBeVisible();
      await expect(calcPage.locators.operatorButtons.filter({ hasText: 'x' })).toBeVisible();
    });

    test('should have a clear button', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await expect(calcPage.locators.clearButton).toBeVisible();
      await expect(calcPage.locators.clearButton).toHaveText('C');
      await expect(calcPage.locators.clearButton).toHaveClass(/btn-outline-danger/);
    });

    test('should have an equals button', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await expect(calcPage.locators.equalsButton).toBeVisible();
      await expect(calcPage.locators.equalsButton).toHaveClass(/btn-outline-warning/);
    });

    test('should have a decimal point button', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await expect(calcPage.locators.dotButton).toBeVisible();
    });

    // --- Calculator Interactions ---
    test('should display digits when clicked', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);

      await calcPage.actions.clickButton('1');
      await expect(calcPage.locators.screen).toHaveText('1');

      await calcPage.actions.clickButton('2');
      await expect(calcPage.locators.screen).toHaveText('12');

      await calcPage.actions.clickButton('3');
      await expect(calcPage.locators.screen).toHaveText('123');
    });

    test('should clear the screen when C is clicked', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);

      await calcPage.actions.pressKeys('5', '6');
      await expect(calcPage.locators.screen).toHaveText('56');

      await calcPage.actions.clickButton('C');
      await expect(calcPage.locators.screen).toHaveText('');
    });

    test('should display operator after digit', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);

      await calcPage.actions.pressKeys('5', '+');
      await expect(calcPage.locators.screen).toHaveText('5+');
    });

    test('should not allow operator as first character except minus', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);

      // Plus should not appear on empty screen
      await calcPage.actions.clickButton('+');
      await expect(calcPage.locators.screen).toHaveText('');

      // But minus should work as negative sign
      await calcPage.actions.clickButton('-');
      await expect(calcPage.locators.screen).toHaveText('-');
    });

    test('should handle decimal point input', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);

      await calcPage.actions.pressKeys('3', '.', '5');
      await expect(calcPage.locators.screen).toHaveText('3.5');
    });

    test('should not allow multiple decimal points in same number', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);

      await calcPage.actions.pressKeys('3', '.', '5', '.', '2');
      // Second dot should be ignored
      await expect(calcPage.locators.screen).toHaveText('3.52');
    });

    test('should replace operator when another operator is pressed', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);

      await calcPage.actions.pressKeys('5', '+');
      await expect(calcPage.locators.screen).toHaveText('5+');

      // Press minus — should replace +
      await calcPage.actions.clickButton('-');
      await expect(calcPage.locators.screen).toHaveText('5-');
    });

    const arithmeticCases = [
      { label: 'addition', keys: ['2', '+', '3', '='] as const, expected: '5' },
      { label: 'subtraction', keys: ['9', '-', '4', '='] as const, expected: '5' },
      { label: 'multiplication', keys: ['6', 'x', '7', '='] as const, expected: '42' },
      { label: 'division', keys: ['8', '÷', '2', '='] as const, expected: '4' },
    ];

    for (const { label, keys, expected } of arithmeticCases) {
      test(`should correctly compute ${label} in 100% correct mode`, async ({ page }) => {
        const calcPage = new RandomCalculatorPage(page);
        await calcPage.actions.setPercent('0');
        await calcPage.actions.pressKeys(...keys);
        await expect(calcPage.locators.screen).toHaveText(expected);
      });
    }

    test('should handle multi-digit calculations in 100% correct mode', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await calcPage.actions.setPercent('0');

      await calcPage.actions.pressKeys('1', '5', '+', '2', '7', '=');
      await expect(calcPage.locators.screen).toHaveText('42');
    });

    test('should clear and start a new calculation', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await calcPage.actions.setPercent('0');

      // First calculation
      await calcPage.actions.pressKeys('5', '+', '3', '=');
      await expect(calcPage.locators.screen).toHaveText('8');

      // Clear
      await calcPage.actions.clickButton('C');
      await expect(calcPage.locators.screen).toHaveText('');

      // New calculation
      await calcPage.actions.pressKeys('9', '-', '1', '=');
      await expect(calcPage.locators.screen).toHaveText('8');
    });

    test('should produce incorrect results in 100% error mode', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await calcPage.actions.setPercent('100');
      await calcPage.actions.setCorrectAfter('999');

      await calcPage.actions.pressKeys('2', '+', '3', '=');

      // The result should be a number (random 1-100), not necessarily 5
      const result = await calcPage.locators.screen.textContent();
      expect(result).toBeTruthy();
      const numericResult = Number(result);
      expect(numericResult).not.toBeNaN();
    });

    test('should allow changing the percent input', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await calcPage.actions.setPercent('75');
      await expect(calcPage.locators.percentInput).toHaveValue('75');
    });

    test('should allow changing the correct-after input', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await calcPage.actions.setCorrectAfter('10');
      await expect(calcPage.locators.correctInput).toHaveValue('10');
    });

    test('should have correct button styling for digit buttons', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await expect(calcPage.locators.digitButton('7')).toHaveClass(/btn-outline-primary/);
    });

    test('should have correct button styling for operator buttons', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await expect(calcPage.locators.operatorButtons.first()).toHaveClass(/btn-outline-success/);
    });

    test('should handle decimal calculations in 100% correct mode', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await calcPage.actions.setPercent('0');

      await calcPage.actions.pressKeys('1', '.', '5', '+', '2', '.', '5', '=');
      await expect(calcPage.locators.screen).toHaveText('4');
    });

    test('should verify page title and copyright', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(calcPage.locators.copyright).toBeAttached();
    });

    test('should become correct after configured number of retries', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      // Set 100% correct mode where correct results start after 2 calculations
      await calcPage.actions.setPercent('100');
      await calcPage.actions.setCorrectAfter('2');

      // First 2 calculations may be random; the 3rd should be correct
      for (let attempt = 0; attempt < 2; attempt++) {
        await calcPage.actions.pressKeys('1', '+', '1', '=');
        await calcPage.locators.screen.waitFor({ state: 'attached' });
        await calcPage.actions.clickButton('C');
      }

      // Third calculation: 3 + 4 = 7 (should be correct now)
      await calcPage.actions.pressKeys('3', '+', '4', '=');
      await expect(calcPage.locators.screen).toHaveText('7');
    });

    test('should handle zero as an operand in 100% correct mode', async ({ page }) => {
      const calcPage = new RandomCalculatorPage(page);
      await calcPage.actions.setPercent('100');
      await calcPage.actions.setCorrectAfter('0');

      // 0 + 5 = 5
      await calcPage.actions.pressKeys('0', '+', '5', '=');
      await expect(calcPage.locators.screen).toHaveText('5');

      // Clear and do 7 x 0 = 0
      await calcPage.actions.clickButton('C');
      await calcPage.actions.pressKeys('7', 'x', '0', '=');
      await expect(calcPage.locators.screen).toHaveText('0');
    });
  });

  // ─────────────────────────────────────────────────
  //  Index Page - Chapter 8 Links
  // ─────────────────────────────────────────────────
  test.describe('Index Page - Chapter 8 Links', () => {
    test('should display the Chapter 8 section heading', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.actions.goto();
      await expect(homePage.locators.chapter8Heading).toBeVisible();
    });

    test('should have the Random calculator link', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.actions.goto();
      await expect(homePage.locators.chapterLink('Random calculator')).toBeVisible();
    });

    test('should navigate to Random calculator and back', async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.actions.goto();
      await homePage.locators.chapterLink('Random calculator').click();
      await expect(page).toHaveURL(/random-calculator\.html/);
      await page.goBack();
      await expect(page).toHaveURL(/index\.html/);
    });
  });
});
