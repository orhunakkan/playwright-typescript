import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class DragAndDropPage {
  readonly locators: {
    heading: Locator;
    draggable: Locator;
    target: Locator;
    draggableHeading: Locator;
    dragMeText: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    dragToTarget: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Drag and drop' }),
      draggable: page.locator('#draggable'),
      target: page.locator('#target'),
      draggableHeading: page.getByRole('heading', { name: 'Draggable panel' }),
      dragMeText: page.getByText('Drag me'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/drag-and-drop.html`);
      },
      dragToTarget: async () => {
        await this.locators.draggable.dragTo(this.locators.target);
      },
    };
  }
}
