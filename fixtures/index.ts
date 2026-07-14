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
import { ScrollLazyLoadingPage } from '../pages/scroll-lazy-loading.page';
import { AriaSnapshotsPage } from '../pages/aria-snapshots.page';
import { FramesContextsPage } from '../pages/frames-contexts.page';
import { StorageStatePage } from '../pages/storage-state.page';
import { ClockTimersPage } from '../pages/clock-timers.page';
import { WebsocketInterceptionPage } from '../pages/websocket-interception.page';
import { HarRecordingPage } from '../pages/har-recording.page';
import { ServiceWorkersPage } from '../pages/service-workers.page';
import { VisualRegressionPage } from '../pages/visual-regression.page';
import { MediaLocalePage } from '../pages/media-locale.page';
import { GeolocationPermissionsPage } from '../pages/geolocation-permissions.page';
import { AccessibilityScanningPage } from '../pages/accessibility-scanning.page';
import { LocatorHandlersPage } from '../pages/locator-handlers.page';
import { ShadowDomPage } from '../pages/shadow-dom.page';
import { ServerSentEventsPage } from '../pages/server-sent-events.page';

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
  scrollLazyLoadingPage: ScrollLazyLoadingPage;
  ariaSnapshotsPage: AriaSnapshotsPage;
  framesContextsPage: FramesContextsPage;
  storageStatePage: StorageStatePage;
  clockTimersPage: ClockTimersPage;
  websocketInterceptionPage: WebsocketInterceptionPage;
  harRecordingPage: HarRecordingPage;
  serviceWorkersPage: ServiceWorkersPage;
  visualRegressionPage: VisualRegressionPage;
  mediaLocalePage: MediaLocalePage;
  geolocationPermissionsPage: GeolocationPermissionsPage;
  accessibilityScanningPage: AccessibilityScanningPage;
  locatorHandlersPage: LocatorHandlersPage;
  shadowDomPage: ShadowDomPage;
  serverSentEventsPage: ServerSentEventsPage;
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
  scrollLazyLoadingPage: async ({ page }, use) => {
    await use(new ScrollLazyLoadingPage(page));
  },
  ariaSnapshotsPage: async ({ page }, use) => {
    await use(new AriaSnapshotsPage(page));
  },
  framesContextsPage: async ({ page }, use) => {
    await use(new FramesContextsPage(page));
  },
  storageStatePage: async ({ page }, use) => {
    await use(new StorageStatePage(page));
  },
  clockTimersPage: async ({ page }, use) => {
    await use(new ClockTimersPage(page));
  },
  websocketInterceptionPage: async ({ page }, use) => {
    await use(new WebsocketInterceptionPage(page));
  },
  harRecordingPage: async ({ page }, use) => {
    await use(new HarRecordingPage(page));
  },
  serviceWorkersPage: async ({ page }, use) => {
    await use(new ServiceWorkersPage(page));
  },
  visualRegressionPage: async ({ page }, use) => {
    await use(new VisualRegressionPage(page));
  },
  mediaLocalePage: async ({ page }, use) => {
    await use(new MediaLocalePage(page));
  },
  geolocationPermissionsPage: async ({ page }, use) => {
    await use(new GeolocationPermissionsPage(page));
  },
  accessibilityScanningPage: async ({ page }, use) => {
    await use(new AccessibilityScanningPage(page));
  },
  locatorHandlersPage: async ({ page }, use) => {
    await use(new LocatorHandlersPage(page));
  },
  shadowDomPage: async ({ page }, use) => {
    await use(new ShadowDomPage(page));
  },
  serverSentEventsPage: async ({ page }, use) => {
    await use(new ServerSentEventsPage(page));
  },
});

export { expect } from '@playwright/test';
