import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export class HomePage {
  readonly locators: {
    heading: Locator;
    chapter3Heading: Locator;
    chapter4Heading: Locator;
    chapter5Heading: Locator;
    chapter7Heading: Locator;
    chapter8Heading: Locator;
    chapter9Heading: Locator;
    chapterLink: (name: string, options?: { exact?: boolean }) => Locator;
  };
  readonly actions: {
    goto: () => Promise<void>;
    navigateToLink: (name: string) => Promise<void>;
  };

  constructor(private readonly page: Page) {
    this.locators = {
      heading: page.getByRole('heading', { name: 'Hands-On Selenium WebDriver with Java' }),
      chapter3Heading: page.getByRole('heading', { name: 'Chapter 3. WebDriver Fundamentals' }),
      chapter4Heading: page.getByRole('heading', { name: 'Chapter 4. Browser-Agnostic Features' }),
      chapter5Heading: page.getByRole('heading', { name: 'Chapter 5. Browser-Specific Manipulation' }),
      chapter7Heading: page.getByRole('heading', { name: 'Chapter 7. The Page Object Model (POM)' }),
      chapter8Heading: page.getByRole('heading', { name: 'Chapter 8. Testing Framework Specifics' }),
      chapter9Heading: page.getByRole('heading', { name: 'Chapter 9. Third-Party Integrations' }),
      chapterLink: (name: string, options?: { exact?: boolean }) => page.getByRole('link', { name, ...options }),
    };

    this.actions = {
      goto: async () => {
        await this.page.goto(`${config.e2eUrl}/index.html`);
      },
      navigateToLink: async (name: string) => {
        await this.locators.chapterLink(name).click();
      },
    };
  }
}
