import { Locator, Page } from '@playwright/test';

export class MouseOverPage {
  readonly locators: {
    heading: Locator;
    figures: Locator;
    images: Locator;
    captions: Locator;
    compassImage: Locator;
    calendarImage: Locator;
    awardImage: Locator;
    landscapeImage: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    hoverImage: (index: number) => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Mouse over' }),
      figures: page.locator('.figure'),
      images: page.locator('.figure img'),
      captions: page.locator('.figure .caption'),
      compassImage: page.locator('img[src="img/compass.png"]'),
      calendarImage: page.locator('img[src="img/calendar.png"]'),
      awardImage: page.locator('img[src="img/award.png"]'),
      landscapeImage: page.locator('img[src="img/landscape.png"]'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${process.env.PRACTICE_E2E_URL}/mouse-over.html`);
      },
      hoverImage: async (index: number) => {
        await this.locators.figures.nth(index).locator('img').hover();
      },
    };
  }
}
