import { test as base, expect } from '@playwright/test';
import { SauceLoginPage } from '../../pages/sauce-login.page';
import { SauceInventoryPage } from '../../pages/sauce-inventory.page';
import { ABTestingPage } from '../../pages/ab-testing.page';
import { ConsoleLogsPage } from '../../pages/console-logs.page';
import { CookiesPage } from '../../pages/cookies.page';
import { DataTypesPage } from '../../pages/data-types.page';
import { DialogBoxesPage } from '../../pages/dialog-boxes.page';
import { DownloadPage } from '../../pages/download.page';
import { DragAndDropPage } from '../../pages/drag-and-drop.page';
import { DrawInCanvasPage } from '../../pages/draw-in-canvas.page';
import { DropdownMenuPage } from '../../pages/dropdown-menu.page';
import { FramesPage } from '../../pages/frames.page';
import { GeolocationPage } from '../../pages/geolocation.page';
import { GetUserMediaPage } from '../../pages/get-user-media.page';
import { HomePage } from '../../pages/home.page';
import { IframesPage } from '../../pages/iframes.page';
import { InfiniteScrollPage } from '../../pages/infinite-scroll.page';
import { LoadingImagesPage } from '../../pages/loading-images.page';
import { LoginFormPage } from '../../pages/login-form.page';
import { LongPage } from '../../pages/long-page.page';
import { MouseOverPage } from '../../pages/mouse-over.page';
import { MultilanguagePage } from '../../pages/multilanguage.page';
import { NavigationPage } from '../../pages/navigation.page';
import { NotificationsPage } from '../../pages/notifications.page';
import { RandomCalculatorPage } from '../../pages/random-calculator.page';
import { ShadowDomPage } from '../../pages/shadow-dom.page';
import { SlowCalculatorPage } from '../../pages/slow-calculator.page';
import { SlowLoginFormPage } from '../../pages/slow-login-form.page';
import { SubmittedFormPage } from '../../pages/submitted-form.page';
import { WebFormPage } from '../../pages/web-form.page';
import { WebStoragePage } from '../../pages/web-storage.page';

type PageFixtures = {
  abTestingPage: ABTestingPage;
  consoleLogsPage: ConsoleLogsPage;
  cookiesPage: CookiesPage;
  dataTypesPage: DataTypesPage;
  dialogBoxesPage: DialogBoxesPage;
  downloadPage: DownloadPage;
  dragAndDropPage: DragAndDropPage;
  drawInCanvasPage: DrawInCanvasPage;
  dropdownMenuPage: DropdownMenuPage;
  framesPage: FramesPage;
  geolocationPage: GeolocationPage;
  getUserMediaPage: GetUserMediaPage;
  homePage: HomePage;
  iframesPage: IframesPage;
  infiniteScrollPage: InfiniteScrollPage;
  loadingImagesPage: LoadingImagesPage;
  loginFormPage: LoginFormPage;
  longPage: LongPage;
  mouseOverPage: MouseOverPage;
  multilanguagePage: MultilanguagePage;
  navigationPage: NavigationPage;
  notificationsPage: NotificationsPage;
  randomCalculatorPage: RandomCalculatorPage;
  shadowDomPage: ShadowDomPage;
  slowCalculatorPage: SlowCalculatorPage;
  slowLoginFormPage: SlowLoginFormPage;
  submittedFormPage: SubmittedFormPage;
  webFormPage: WebFormPage;
  webStoragePage: WebStoragePage;
  sauceLoginPage: SauceLoginPage;
  sauceInventoryPage: SauceInventoryPage;
};

const test = base.extend<PageFixtures>({
  abTestingPage: async ({ page }, use) => {
    await use(new ABTestingPage(page));
  },
  consoleLogsPage: async ({ page }, use) => {
    await use(new ConsoleLogsPage(page));
  },
  cookiesPage: async ({ page }, use) => {
    await use(new CookiesPage(page));
  },
  dataTypesPage: async ({ page }, use) => {
    await use(new DataTypesPage(page));
  },
  dialogBoxesPage: async ({ page }, use) => {
    await use(new DialogBoxesPage(page));
  },
  downloadPage: async ({ page }, use) => {
    await use(new DownloadPage(page));
  },
  dragAndDropPage: async ({ page }, use) => {
    await use(new DragAndDropPage(page));
  },
  drawInCanvasPage: async ({ page }, use) => {
    await use(new DrawInCanvasPage(page));
  },
  dropdownMenuPage: async ({ page }, use) => {
    await use(new DropdownMenuPage(page));
  },
  framesPage: async ({ page }, use) => {
    await use(new FramesPage(page));
  },
  geolocationPage: async ({ page }, use) => {
    await use(new GeolocationPage(page));
  },
  getUserMediaPage: async ({ page }, use) => {
    await use(new GetUserMediaPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  iframesPage: async ({ page }, use) => {
    await use(new IframesPage(page));
  },
  infiniteScrollPage: async ({ page }, use) => {
    await use(new InfiniteScrollPage(page));
  },
  loadingImagesPage: async ({ page }, use) => {
    await use(new LoadingImagesPage(page));
  },
  loginFormPage: async ({ page }, use) => {
    await use(new LoginFormPage(page));
  },
  longPage: async ({ page }, use) => {
    await use(new LongPage(page));
  },
  mouseOverPage: async ({ page }, use) => {
    await use(new MouseOverPage(page));
  },
  multilanguagePage: async ({ page }, use) => {
    await use(new MultilanguagePage(page));
  },
  navigationPage: async ({ page }, use) => {
    await use(new NavigationPage(page));
  },
  notificationsPage: async ({ page }, use) => {
    await use(new NotificationsPage(page));
  },
  randomCalculatorPage: async ({ page }, use) => {
    await use(new RandomCalculatorPage(page));
  },
  shadowDomPage: async ({ page }, use) => {
    await use(new ShadowDomPage(page));
  },
  slowCalculatorPage: async ({ page }, use) => {
    await use(new SlowCalculatorPage(page));
  },
  slowLoginFormPage: async ({ page }, use) => {
    await use(new SlowLoginFormPage(page));
  },
  submittedFormPage: async ({ page }, use) => {
    await use(new SubmittedFormPage(page));
  },
  webFormPage: async ({ page }, use) => {
    await use(new WebFormPage(page));
  },
  webStoragePage: async ({ page }, use) => {
    await use(new WebStoragePage(page));
  },
  sauceLoginPage: async ({ page }, use) => {
    await use(new SauceLoginPage(page));
  },
  sauceInventoryPage: async ({ page }, use) => {
    await use(new SauceInventoryPage(page));
  },
});

export { test, expect };
