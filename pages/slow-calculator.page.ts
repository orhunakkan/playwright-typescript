import { Locator, Page } from '@playwright/test';
import { BASE_URL } from './base-url';
import { pressCalcKeys } from '../utilities/calculator';

export class SlowCalculatorPage {
  readonly locators: {
    heading: Locator;
    screen: Locator;
    spinner: Locator;
    delayInput: Locator;
    clearButton: Locator;
    equalsButton: Locator;
  };
  readonly actions: Record<string, (...args: any[]) => Promise<void>>;

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Slow calculator' }),
      screen: page.locator('#calculator .screen'),
      spinner: page.locator('#spinner'),
      delayInput: page.locator('#delay'),
      clearButton: page.locator('#calculator .clear'),
      equalsButton: page.locator('#calculator .keys span').filter({ hasText: '=' }),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${BASE_URL}/slow-calculator.html`);
      },
      setDelay: async (seconds: string) => {
        await this.locators.delayInput.fill(seconds);
      },
      pressKeys: async (...keys: string[]) => {
        await pressCalcKeys(this.page, ...keys);
      },
      clear: async () => {
        await this.locators.clearButton.click();
      },
    };
  }
}
