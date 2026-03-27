import { Locator, Page } from '@playwright/test';
import { BASE_URL } from './base-url';

export class DragAndDropPage {
  readonly locators: {
    heading: Locator;
    draggable: Locator;
    target: Locator;
    draggableHeading: Locator;
    dragMeText: Locator;
  };
  readonly actions: Record<string, (...args: any[]) => Promise<void>>;

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
        await this.page.goto(`${BASE_URL}/drag-and-drop.html`);
      },
      dragToTarget: async () => {
        await this.locators.draggable.dragTo(this.locators.target);
      },
    };
  }
}
