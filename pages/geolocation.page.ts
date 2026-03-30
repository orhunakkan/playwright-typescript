import { Locator, Page } from '@playwright/test';

export class GeolocationPage {
  readonly locators: {
    heading: Locator;
    getCoordinatesButton: Locator;
    coordinates: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    getCoordinates: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Geolocation' }),
      getCoordinatesButton: page.getByRole('button', { name: 'Get coordinates' }),
      coordinates: page.locator('#coordinates'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${process.env.PRACTICE_E2E_URL}/geolocation.html`);
      },
      getCoordinates: async () => {
        await this.locators.getCoordinatesButton.click();
      },
    };
  }
}
