import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';
import { pressCalcKeys } from '../utilities/calculator';

export class SlowCalculatorPage {
  readonly locators: {
    heading: Locator;
    screen: Locator;
    spinner: Locator;
    delayInput: Locator;
    clearButton: Locator;
    equalsButton: Locator;
    key: (label: string) => Locator;
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
      key: (label: string) => page.locator('#calculator .keys').getByText(label, { exact: true }),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/slow-calculator.html`);
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
