import { expect, test } from '../../fixtures/page-fixtures';
import type { Page } from '@playwright/test';
import { feature, story, severity } from 'allure-js-commons';
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
import { runA11yScan } from '../../utilities/a11y';

type PageFactory = (page: Page) => { actions: { goto: () => Promise<void> } };

const a11yPages: { name: string; factory: PageFactory }[] = [
  { name: 'Home', factory: (page) => new HomePage(page) },
  { name: 'Web Form', factory: (page) => new WebFormPage(page) },
  { name: 'Login Form', factory: (page) => new LoginFormPage(page) },
  { name: 'Slow Login Form', factory: (page) => new SlowLoginFormPage(page) },
  { name: 'Submitted Form', factory: (page) => new SubmittedFormPage(page) },
  { name: 'Dropdown Menu', factory: (page) => new DropdownMenuPage(page) },
  { name: 'Data Types', factory: (page) => new DataTypesPage(page) },
  { name: 'Dialog Boxes', factory: (page) => new DialogBoxesPage(page) },
  { name: 'Web Storage', factory: (page) => new WebStoragePage(page) },
  { name: 'Notifications', factory: (page) => new NotificationsPage(page) },
  { name: 'Drag and Drop', factory: (page) => new DragAndDropPage(page) },
  { name: 'Draw in Canvas', factory: (page) => new DrawInCanvasPage(page) },
  { name: 'Frames', factory: (page) => new FramesPage(page) },
  { name: 'Iframes', factory: (page) => new IframesPage(page) },
  { name: 'Shadow DOM', factory: (page) => new ShadowDomPage(page) },
  { name: 'Mouse Over', factory: (page) => new MouseOverPage(page) },
  { name: 'Geolocation', factory: (page) => new GeolocationPage(page) },
  { name: 'Get User Media', factory: (page) => new GetUserMediaPage(page) },
  { name: 'Download', factory: (page) => new DownloadPage(page) },
  { name: 'A/B Testing', factory: (page) => new ABTestingPage(page) },
  { name: 'Multilanguage', factory: (page) => new MultilanguagePage(page) },
  { name: 'Infinite Scroll', factory: (page) => new InfiniteScrollPage(page) },
  { name: 'Loading Images', factory: (page) => new LoadingImagesPage(page) },
  { name: 'Console Logs', factory: (page) => new ConsoleLogsPage(page) },
  { name: 'Cookies', factory: (page) => new CookiesPage(page) },
  { name: 'Long Page', factory: (page) => new LongPage(page) },
  { name: 'Navigation', factory: (page) => new NavigationPage(page) },
  { name: 'Slow Calculator', factory: (page) => new SlowCalculatorPage(page) },
  { name: 'Random Calculator', factory: (page) => new RandomCalculatorPage(page) },
];

test.describe('Chapter 10 - Accessibility Testing (a11y)', { tag: ['@a11y'] }, () => {
  for (const { name, factory } of a11yPages) {
    test(`${name} - should have no accessibility violations`, async ({ page }) => {
      await feature('Accessibility Testing');
      await story('WCAG 2.1 AA Compliance');
      await severity('normal');
      await factory(page).actions.goto();
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await test.info().attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  }
});
