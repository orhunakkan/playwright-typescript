import { Locator, Page } from '@playwright/test';

export class DownloadPage {
  readonly locators: {
    heading: Locator;
    downloadLinks: Locator;
    webDriverManagerLogo: Locator;
    webDriverManagerDoc: Locator;
    seleniumJupiterLogo: Locator;
    seleniumJupiterDoc: Locator;
    copyright: Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Download files' }),
      downloadLinks: page.locator('a[download]'),
      webDriverManagerLogo: page.getByRole('link', { name: 'WebDriverManager logo' }),
      webDriverManagerDoc: page.getByRole('link', { name: 'WebDriverManager doc' }),
      seleniumJupiterLogo: page.getByRole('link', { name: 'Selenium-Jupiter logo' }),
      seleniumJupiterDoc: page.getByRole('link', { name: 'Selenium-Jupiter doc' }),
      copyright: page.getByText('Copyright © 2021-2025'),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${process.env.PRACTICE_E2E_URL}/download.html`);
      },
    };
  }
}
