import { expect, test } from '@playwright/test';
import { clickCalcButton, pressCalcKeys } from '../../utilities/calculator';

const BASE_URL = process.env.PRACTICE_E2E_URL;

test.describe('Chapter 8 - Testing Framework Specifics', () => {
  // ─────────────────────────────────────────────────
  //  1. Random Calculator
  // ─────────────────────────────────────────────────
  test.describe('Random Calculator', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/random-calculator.html`);
    });

    test('should display the random calculator heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Random calculator' })).toBeVisible();
    });

    test('should display the description paragraph', async ({ page }) => {
      const description = page.locator('p.lead');
      await expect(description).toContainText('This calculator produces incorrect results');
      await expect(description).toContainText('% of times');
      await expect(description).toContainText('retries');
    });

    test('should have a percent input with default value of 50', async ({ page }) => {
      const percent = page.locator('#percent');
      await expect(percent).toBeAttached();
      await expect(percent).toHaveValue('50');
    });

    test('should have a correct-after input with default value of 5', async ({ page }) => {
      const correct = page.locator('#correct');
      await expect(correct).toBeAttached();
      await expect(correct).toHaveValue('5');
    });

    test('should have a hidden spinner element', async ({ page }) => {
      const spinner = page.locator('#spinner');
      await expect(spinner).toBeAttached();
      await expect(spinner).toBeHidden();
    });

    // --- Calculator Structure ---
    test('should have a calculator element', async ({ page }) => {
      const calculator = page.locator('#calculator');
      await expect(calculator).toBeVisible();
    });

    test('should have a screen display area', async ({ page }) => {
      const screen = page.locator('#calculator .screen');
      await expect(screen).toBeAttached();
      // Screen should be empty initially
      await expect(screen).toHaveText('');
    });

    test('should have digit buttons 0-9', async ({ page }) => {
      const keys = page.locator('#calculator .keys span.btn-outline-primary');
      const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      for (const digit of digits) {
        await expect(keys.filter({ hasText: digit }).first()).toBeVisible();
      }
    });

    test('should have operator buttons', async ({ page }) => {
      const operators = page.locator('#calculator .keys .operator');
      await expect(operators).toHaveCount(4);

      // Verify all four operators exist
      await expect(page.locator('#calculator .keys .operator').filter({ hasText: '+' })).toBeVisible();
      await expect(page.locator('#calculator .keys .operator').filter({ hasText: '-' })).toBeVisible();
      await expect(page.locator('#calculator .keys .operator').filter({ hasText: '÷' })).toBeVisible();
      await expect(page.locator('#calculator .keys .operator').filter({ hasText: 'x' })).toBeVisible();
    });

    test('should have a clear button', async ({ page }) => {
      const clearBtn = page.locator('#calculator .clear');
      await expect(clearBtn).toBeVisible();
      await expect(clearBtn).toHaveText('C');
      await expect(clearBtn).toHaveClass(/btn-outline-danger/);
    });

    test('should have an equals button', async ({ page }) => {
      const equalsBtn = page.locator('#calculator .keys span').filter({ hasText: '=' });
      await expect(equalsBtn).toBeVisible();
      await expect(equalsBtn).toHaveClass(/btn-outline-warning/);
    });

    test('should have a decimal point button', async ({ page }) => {
      const dotBtn = page.locator('#calculator .keys span').filter({ hasText: '.' });
      await expect(dotBtn).toBeVisible();
    });

    // --- Calculator Interactions ---
    test('should display digits when clicked', async ({ page }) => {
      const screen = page.locator('#calculator .screen');

      await clickCalcButton(page, '1');
      await expect(screen).toHaveText('1');

      await clickCalcButton(page, '2');
      await expect(screen).toHaveText('12');

      await clickCalcButton(page, '3');
      await expect(screen).toHaveText('123');
    });

    test('should clear the screen when C is clicked', async ({ page }) => {
      const screen = page.locator('#calculator .screen');

      await pressCalcKeys(page, '5', '6');
      await expect(screen).toHaveText('56');

      await clickCalcButton(page, 'C');
      await expect(screen).toHaveText('');
    });

    test('should display operator after digit', async ({ page }) => {
      const screen = page.locator('#calculator .screen');

      await pressCalcKeys(page, '5', '+');
      await expect(screen).toHaveText('5+');
    });

    test('should not allow operator as first character except minus', async ({ page }) => {
      const screen = page.locator('#calculator .screen');

      // Plus should not appear on empty screen
      await clickCalcButton(page, '+');
      await expect(screen).toHaveText('');

      // But minus should work as negative sign
      await clickCalcButton(page, '-');
      await expect(screen).toHaveText('-');
    });

    test('should handle decimal point input', async ({ page }) => {
      const screen = page.locator('#calculator .screen');

      await pressCalcKeys(page, '3', '.', '5');
      await expect(screen).toHaveText('3.5');
    });

    test('should not allow multiple decimal points in same number', async ({ page }) => {
      const screen = page.locator('#calculator .screen');

      await pressCalcKeys(page, '3', '.', '5', '.', '2');
      // Second dot should be ignored
      await expect(screen).toHaveText('3.52');
    });

    test('should replace operator when another operator is pressed', async ({ page }) => {
      const screen = page.locator('#calculator .screen');

      await pressCalcKeys(page, '5', '+');
      await expect(screen).toHaveText('5+');

      // Press minus — should replace +
      await clickCalcButton(page, '-');
      await expect(screen).toHaveText('5-');
    });

    test('should produce a result when equals is clicked (100% correct mode)', async ({ page }) => {
      await page.locator('#percent').fill('0');
      const screen = page.locator('#calculator .screen');

      await pressCalcKeys(page, '2', '+', '3', '=');
      await expect(screen).toHaveText('5');
    });

    test('should correctly subtract in 100% correct mode', async ({ page }) => {
      await page.locator('#percent').fill('0');
      const screen = page.locator('#calculator .screen');

      await pressCalcKeys(page, '9', '-', '4', '=');
      await expect(screen).toHaveText('5');
    });

    test('should correctly multiply in 100% correct mode', async ({ page }) => {
      await page.locator('#percent').fill('0');
      const screen = page.locator('#calculator .screen');

      await pressCalcKeys(page, '6', 'x', '7', '=');
      await expect(screen).toHaveText('42');
    });

    test('should correctly divide in 100% correct mode', async ({ page }) => {
      await page.locator('#percent').fill('0');
      const screen = page.locator('#calculator .screen');

      await pressCalcKeys(page, '8', '÷', '2', '=');
      await expect(screen).toHaveText('4');
    });

    test('should handle multi-digit calculations in 100% correct mode', async ({ page }) => {
      await page.locator('#percent').fill('0');
      const screen = page.locator('#calculator .screen');

      await pressCalcKeys(page, '1', '5', '+', '2', '7', '=');
      await expect(screen).toHaveText('42');
    });

    test('should clear and start a new calculation', async ({ page }) => {
      await page.locator('#percent').fill('0');
      const screen = page.locator('#calculator .screen');

      // First calculation
      await pressCalcKeys(page, '5', '+', '3', '=');
      await expect(screen).toHaveText('8');

      // Clear
      await clickCalcButton(page, 'C');
      await expect(screen).toHaveText('');

      // New calculation
      await pressCalcKeys(page, '9', '-', '1', '=');
      await expect(screen).toHaveText('8');
    });

    test('should produce incorrect results in 100% error mode', async ({ page }) => {
      await page.locator('#percent').fill('100');
      await page.locator('#correct').fill('999');
      const screen = page.locator('#calculator .screen');

      await pressCalcKeys(page, '2', '+', '3', '=');

      // The result should be a number (random 1-100), not necessarily 5
      const result = await screen.textContent();
      expect(result).toBeTruthy();
      const numericResult = Number(result);
      expect(numericResult).not.toBeNaN();
    });

    test('should allow changing the percent input', async ({ page }) => {
      const percentInput = page.locator('#percent');
      await percentInput.fill('75');
      await expect(percentInput).toHaveValue('75');
    });

    test('should allow changing the correct-after input', async ({ page }) => {
      const correctInput = page.locator('#correct');
      await correctInput.fill('10');
      await expect(correctInput).toHaveValue('10');
    });

    test('should have correct button styling for digit buttons', async ({ page }) => {
      const digitButton = page.locator('#calculator .keys span').filter({ hasText: '7' }).first();
      await expect(digitButton).toHaveClass(/btn-outline-primary/);
    });

    test('should have correct button styling for operator buttons', async ({ page }) => {
      const operatorButton = page.locator('#calculator .keys .operator').first();
      await expect(operatorButton).toHaveClass(/btn-outline-success/);
    });

    test('should handle decimal calculations in 100% correct mode', async ({ page }) => {
      await page.locator('#percent').fill('0');
      const screen = page.locator('#calculator .screen');

      await pressCalcKeys(page, '1', '.', '5', '+', '2', '.', '5', '=');
      await expect(screen).toHaveText('4');
    });

    test('should verify page title and copyright', async ({ page }) => {
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(page.getByText('Copyright © 2021-2025')).toBeAttached();
    });

    test('should become correct after configured number of retries', async ({ page }) => {
      // Set 100% correct mode where correct results start after 2 calculations
      await page.locator('#percent').fill('100');
      await page.locator('#correct').fill('2');

      const screen = page.locator('#calculator .screen');

      // First 2 calculations may be random; the 3rd should be correct
      for (let attempt = 0; attempt < 2; attempt++) {
        await pressCalcKeys(page, '1', '+', '1', '=');
        await screen.waitFor({ state: 'attached' });
        await clickCalcButton(page, 'C');
      }

      // Third calculation: 3 + 4 = 7 (should be correct now)
      await pressCalcKeys(page, '3', '+', '4', '=');
      await expect(screen).toHaveText('7');
    });

    test('should handle zero as an operand in 100% correct mode', async ({ page }) => {
      await page.locator('#percent').fill('100');
      await page.locator('#correct').fill('0');
      const screen = page.locator('#calculator .screen');

      // 0 + 5 = 5
      await pressCalcKeys(page, '0', '+', '5', '=');
      await expect(screen).toHaveText('5');

      // Clear and do 7 x 0 = 0
      await clickCalcButton(page, 'C');
      await pressCalcKeys(page, '7', 'x', '0', '=');
      await expect(screen).toHaveText('0');
    });
  });

  // ─────────────────────────────────────────────────
  //  Index Page - Chapter 8 Links
  // ─────────────────────────────────────────────────
  test.describe('Index Page - Chapter 8 Links', () => {
    test('should display the Chapter 8 section heading', async ({ page }) => {
      await page.goto(`${BASE_URL}/index.html`);
      await expect(page.getByRole('heading', { name: 'Chapter 8. Testing Framework Specifics' })).toBeVisible();
    });

    test('should have the Random calculator link', async ({ page }) => {
      await page.goto(`${BASE_URL}/index.html`);
      await expect(page.getByRole('link', { name: 'Random calculator' })).toBeVisible();
    });

    test('should navigate to Random calculator and back', async ({ page }) => {
      await page.goto(`${BASE_URL}/index.html`);
      await page.getByRole('link', { name: 'Random calculator' }).click();
      await expect(page).toHaveURL(/random-calculator\.html/);
      await page.goBack();
      await expect(page).toHaveURL(/index\.html/);
    });
  });
});
