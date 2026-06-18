import { test as base } from '@playwright/test';
import { FormsValidationPage } from '../pages/forms-validation.page';
import { AccessibleLocatorsPage } from '../pages/accessible-locators.page';
import { HomePage } from '../pages/homepage.page';
import { ApiRequestContextPage } from '../pages/api-request-context.page';
import { NetworkApiPage } from '../pages/network-api.page';
import { AsyncUiPage } from '../pages/async-ui.page';
import { TablesFilteringPage } from '../pages/tables-filtering.page';
import { BrowserEventsPage } from '../pages/browser-events.page';

type Fixtures = {
  formsValidationPage: FormsValidationPage;
  accessibleLocatorsPage: AccessibleLocatorsPage;
  homePage: HomePage;
  apiRequestContextPage: ApiRequestContextPage;
  networkApiPage: NetworkApiPage;
  asyncUiPage: AsyncUiPage;
  tablesFilteringPage: TablesFilteringPage;
  browserEventsPage: BrowserEventsPage;
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
  apiRequestContextPage: async ({ page }, use) => {
    await use(new ApiRequestContextPage(page));
  },
  networkApiPage: async ({ page }, use) => {
    await use(new NetworkApiPage(page));
  },
  asyncUiPage: async ({ page }, use) => {
    await use(new AsyncUiPage(page));
  },
  tablesFilteringPage: async ({ page }, use) => {
    await use(new TablesFilteringPage(page));
  },
  browserEventsPage: async ({ page }, use) => {
    await use(new BrowserEventsPage(page));
  },
});

export { expect } from '@playwright/test';
