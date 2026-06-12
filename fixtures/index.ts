import { test as base } from '@playwright/test';
import { FormsValidationPage } from '../pages/forms-validation.page';
import { AccessibleLocatorsPage } from '../pages/accessible-locators.page';
import { HomePage } from '../pages/homepage.page';
// TODO: import additional page objects here as labs are added

type Fixtures = {
  formsValidationPage: FormsValidationPage;
  accessibleLocatorsPage: AccessibleLocatorsPage;
  homePage: HomePage;
  // TODO: add more fixture types here as labs are added
};

export const test = base.extend<Fixtures>({
  formsValidationPage: async ({ page }, use) => {
    await use(new FormsValidationPage(page));
  },
  accessibleLocatorsPage: async ({ page }, use) => {
    await use(new AccessibleLocatorsPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});

export { expect } from '@playwright/test';
