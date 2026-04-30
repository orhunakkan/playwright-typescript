import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class DropdownMenuPage {
  readonly locators: {
    heading: Locator;
    leftClickButton: Locator;
    rightClickButton: Locator;
    doubleClickButton: Locator;
    leftClickMenu: Locator;
    rightClickMenu: Locator;
    doubleClickMenu: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    openLeftClickDropdown: () => Promise<void>;
    openRightClickDropdown: () => Promise<void>;
    openDoubleClickDropdown: () => Promise<void>;
    dismiss: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Dropdown menu' }),
      leftClickButton: page.getByRole('button', { name: 'Use left-click here' }),
      rightClickButton: page.getByRole('button', { name: 'Use right-click here' }),
      doubleClickButton: page.getByRole('button', { name: 'Use double-click here' }),
      leftClickMenu: page.locator('#my-dropdown-1 + .dropdown-menu'),
      rightClickMenu: page.locator('#context-menu-2'),
      doubleClickMenu: page.locator('#context-menu-3'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/dropdown-menu.html`);
      },
      openLeftClickDropdown: async () => {
        await this.locators.leftClickButton.click();
      },
      openRightClickDropdown: async () => {
        await this.locators.rightClickButton.click({ button: 'right' });
      },
      openDoubleClickDropdown: async () => {
        await this.locators.doubleClickButton.dblclick();
      },
      dismiss: async () => {
        await this.page.locator('body').click();
      },
    };
  }
}
