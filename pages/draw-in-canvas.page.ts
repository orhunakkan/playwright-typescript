import { Locator, Page } from '@playwright/test';
import { BASE_URL } from './base-url';

export class DrawInCanvasPage {
  readonly locators: {
    heading: Locator;
    instructions: Locator;
    canvas: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Drawing in canvas' }),
      instructions: page.getByText('Click to draw.'),
      canvas: page.locator('#my-canvas'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${BASE_URL}/draw-in-canvas.html`);
      },
    };
  }
}
