import { Page } from '@playwright/test';

/**
 * Clicks a calculator button by its label text.
 * Works for both slow-calculator.html and random-calculator.html.
 */
export async function clickCalcButton(page: Page, key: string) {
  if (key === 'C') {
    await page.locator('#calculator .clear').click();
  } else if (['+', '-', '÷', 'x'].includes(key)) {
    await page.locator('#calculator .keys .operator').filter({ hasText: key }).click();
  } else {
    await page.locator('#calculator .keys span').filter({ hasText: key }).first().click();
  }
}

/**
 * Types a sequence of calculator keys.
 * Example: pressCalcKeys(page, '1', '+', '3', '=')
 */
export async function pressCalcKeys(page: Page, ...keys: string[]) {
  for (const key of keys) {
    await clickCalcButton(page, key);
  }
}
