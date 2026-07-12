import { test as base } from '@playwright/test';
import { FakeAuthPage } from '../pages/fake-auth.page';
import { DebuggingReportingPage } from '../pages/debugging-reporting.page';
import { EmulationInputPage } from '../pages/emulation-input.page';
import { FormsValidationPage } from '../pages/forms-validation.page';
import { AccessibleLocatorsPage } from '../pages/accessible-locators.page';
import { HomePage } from '../pages/homepage.page';
import { ApiRequestContextPage } from '../pages/api-request-context.page';
import { NetworkApiPage } from '../pages/network-api.page';
import { AsyncUiPage } from '../pages/async-ui.page';
import { TablesFilteringPage } from '../pages/tables-filtering.page';
import { BrowserEventsPage } from '../pages/browser-events.page';
import { SoftAssertionsPage } from '../pages/soft-assertions.page';
import { MultiTabPage } from '../pages/multi-tab.page';
import { DragAndDropPage } from '../pages/drag-and-drop.page';

type Fixtures = {
  fakeAuthPage: FakeAuthPage;
  debuggingReportingPage: DebuggingReportingPage;
  emulationInputPage: EmulationInputPage;
  formsValidationPage: FormsValidationPage;
  accessibleLocatorsPage: AccessibleLocatorsPage;
  homePage: HomePage;
  apiRequestContextPage: ApiRequestContextPage;
  networkApiPage: NetworkApiPage;
  asyncUiPage: AsyncUiPage;
  tablesFilteringPage: TablesFilteringPage;
  browserEventsPage: BrowserEventsPage;
  softAssertionsPage: SoftAssertionsPage;
  multiTabPage: MultiTabPage;
  dragAndDropPage: DragAndDropPage;
};

export const test = base.extend<Fixtures>({
  fakeAuthPage: async ({ page }, use) => {
    await use(new FakeAuthPage(page));
  },
  debuggingReportingPage: async ({ page }, use) => {
    await use(new DebuggingReportingPage(page));
  },
  emulationInputPage: async ({ page }, use) => {
    await use(new EmulationInputPage(page));
  },
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
  softAssertionsPage: async ({ page }, use) => {
    await use(new SoftAssertionsPage(page));
  },
  multiTabPage: async ({ page }, use) => {
    await use(new MultiTabPage(page));
  },
  dragAndDropPage: async ({ page }, use) => {
    await use(new DragAndDropPage(page));
  },
});

export { expect } from '@playwright/test';
