import { Locator, Page } from '@playwright/test';
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
  readonly actions: {
    goto: () => Promise<void>;
    setDelay: (seconds: string) => Promise<void>;
    pressKeys: (...keys: string[]) => Promise<void>;
    clear: () => Promise<void>;
  };

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
        await this.page.goto(`${process.env.PRACTICE_E2E_URL}/slow-calculator.html`);
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
