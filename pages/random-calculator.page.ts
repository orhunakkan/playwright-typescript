import { Locator, Page } from '@playwright/test';
import { clickCalcButton, pressCalcKeys } from '../utilities/calculator';

export class RandomCalculatorPage {
  readonly locators: {
    heading: Locator;
    description: Locator;
    percentInput: Locator;
    correctInput: Locator;
    spinner: Locator;
    calculator: Locator;
    screen: Locator;
    digitButtons: Locator;
    operatorButtons: Locator;
    clearButton: Locator;
    equalsButton: Locator;
    dotButton: Locator;
    digitButton: (digit: string) => Locator;
    copyright: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    pressKeys: (...keys: string[]) => Promise<void>;
    clickButton: (key: string) => Promise<void>;
    clear: () => Promise<void>;
    setPercent: (value: string) => Promise<void>;
    setCorrectAfter: (value: string) => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Random calculator' }),
      description: page.locator('p.lead'),
      percentInput: page.locator('#percent'),
      correctInput: page.locator('#correct'),
      spinner: page.locator('#spinner'),
      calculator: page.locator('#calculator'),
      screen: page.locator('#calculator .screen'),
      digitButtons: page.locator('#calculator .keys span.btn-outline-primary'),
      operatorButtons: page.locator('#calculator .keys .operator'),
      clearButton: page.locator('#calculator .clear'),
      equalsButton: page.locator('#calculator .keys span').filter({ hasText: '=' }),
      dotButton: page.locator('#calculator .keys span').filter({ hasText: '.' }),
      digitButton: (digit: string) => page.locator('#calculator .keys span').filter({ hasText: digit }).first(),
      copyright: page.getByText('Copyright © 2021-2025'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${process.env.PRACTICE_E2E_URL}/random-calculator.html`);
      },
      pressKeys: async (...keys: string[]) => {
        await pressCalcKeys(this.page, ...keys);
      },
      clickButton: async (key: string) => {
        await clickCalcButton(this.page, key);
      },
      clear: async () => {
        await this.locators.clearButton.click();
      },
      setPercent: async (value: string) => {
        await this.locators.percentInput.fill(value);
      },
      setCorrectAfter: async (value: string) => {
        await this.locators.correctInput.fill(value);
      },
    };
  }
}
