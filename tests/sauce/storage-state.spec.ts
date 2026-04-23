import { expect } from '@playwright/test';
import { test } from '../../fixtures/page-fixtures';
import { config } from '../../config/env';

test.describe('Authentication State Reuse — storageState', () => {
  test('navigating to protected page lands on inventory without login redirect', async ({ sauceInventoryPage, page }) => {
    await sauceInventoryPage.actions.goto();
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(sauceInventoryPage.locators.title).toHaveText('Products');
  });

  test('inventory page shows all 6 products when pre-authenticated', async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.actions.goto();
    await expect(sauceInventoryPage.locators.inventoryItems).toHaveCount(6);
  });

  test('adding an item to cart updates the cart badge', async ({ sauceInventoryPage }) => {
    await sauceInventoryPage.actions.goto();
    await sauceInventoryPage.actions.addItemToCart('Sauce Labs Backpack');
    await expect(sauceInventoryPage.locators.cartBadge).toHaveText('1');
  });

  test('cart page is accessible and shows added item', async ({ sauceInventoryPage, page }) => {
    await sauceInventoryPage.actions.goto();
    await sauceInventoryPage.actions.addItemToCart('Sauce Labs Backpack');
    await sauceInventoryPage.actions.gotoCart();
    await expect(page).toHaveURL(/cart\.html/);
    await expect(sauceInventoryPage.locators.cartItems).toHaveCount(1);
  });
});
