import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class SauceInventoryPage {
  readonly locators: {
    title: Locator;
    inventoryItems: Locator;
    cartBadge: Locator;
    cartLink: Locator;
    cartItems: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    gotoCart: () => Promise<void>;
    addItemToCart: (itemName: string) => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      title: page.locator('.title'),
      inventoryItems: page.locator('.inventory_item'),
      cartBadge: page.locator('.shopping_cart_badge'),
      cartLink: page.locator('.shopping_cart_link'),
      cartItems: page.locator('.cart_item'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.sauceDemoUrl}/inventory.html`);
      },
      gotoCart: async () => {
        await this.page.goto(`${config.sauceDemoUrl}/cart.html`);
      },
      addItemToCart: async (itemName: string) => {
        const slug = itemName.toLowerCase().replace(/\s+/g, '-');
        await this.page.locator(`[data-test="add-to-cart-${slug}"]`).click();
      },
    };
  }
}
