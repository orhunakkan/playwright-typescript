import { expect, test } from '@playwright/test';
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

test.describe('Chapter 10 - Accessibility Testing (a11y)', () => {
  // ─────────────────────────────────────────────────
  //  Home
  // ─────────────────────────────────────────────────
  test.describe('Home', () => {
    test.beforeEach(async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Web Form
  // ─────────────────────────────────────────────────
  test.describe('Web Form', () => {
    test.beforeEach(async ({ page }) => {
      const webFormPage = new WebFormPage(page);
      await webFormPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Login Form
  // ─────────────────────────────────────────────────
  test.describe('Login Form', () => {
    test.beforeEach(async ({ page }) => {
      const loginFormPage = new LoginFormPage(page);
      await loginFormPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Slow Login Form
  // ─────────────────────────────────────────────────
  test.describe('Slow Login Form', () => {
    test.beforeEach(async ({ page }) => {
      const slowLoginFormPage = new SlowLoginFormPage(page);
      await slowLoginFormPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Submitted Form
  // ─────────────────────────────────────────────────
  test.describe('Submitted Form', () => {
    test.beforeEach(async ({ page }) => {
      const submittedFormPage = new SubmittedFormPage(page);
      await submittedFormPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Dropdown Menu
  // ─────────────────────────────────────────────────
  test.describe('Dropdown Menu', () => {
    test.beforeEach(async ({ page }) => {
      const dropdownMenuPage = new DropdownMenuPage(page);
      await dropdownMenuPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Data Types
  // ─────────────────────────────────────────────────
  test.describe('Data Types', () => {
    test.beforeEach(async ({ page }) => {
      const dataTypesPage = new DataTypesPage(page);
      await dataTypesPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Dialog Boxes
  // ─────────────────────────────────────────────────
  test.describe('Dialog Boxes', () => {
    test.beforeEach(async ({ page }) => {
      const dialogBoxesPage = new DialogBoxesPage(page);
      await dialogBoxesPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Web Storage
  // ─────────────────────────────────────────────────
  test.describe('Web Storage', () => {
    test.beforeEach(async ({ page }) => {
      const webStoragePage = new WebStoragePage(page);
      await webStoragePage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Notifications
  // ─────────────────────────────────────────────────
  test.describe('Notifications', () => {
    test.beforeEach(async ({ page }) => {
      const notificationsPage = new NotificationsPage(page);
      await notificationsPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Drag and Drop
  // ─────────────────────────────────────────────────
  test.describe('Drag and Drop', () => {
    test.beforeEach(async ({ page }) => {
      const dragAndDropPage = new DragAndDropPage(page);
      await dragAndDropPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Draw in Canvas
  // ─────────────────────────────────────────────────
  test.describe('Draw in Canvas', () => {
    test.beforeEach(async ({ page }) => {
      const drawInCanvasPage = new DrawInCanvasPage(page);
      await drawInCanvasPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Frames
  // ─────────────────────────────────────────────────
  test.describe('Frames', () => {
    test.beforeEach(async ({ page }) => {
      const framesPage = new FramesPage(page);
      await framesPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Iframes
  // ─────────────────────────────────────────────────
  test.describe('Iframes', () => {
    test.beforeEach(async ({ page }) => {
      const iframesPage = new IframesPage(page);
      await iframesPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Shadow DOM
  // ─────────────────────────────────────────────────
  test.describe('Shadow DOM', () => {
    test.beforeEach(async ({ page }) => {
      const shadowDomPage = new ShadowDomPage(page);
      await shadowDomPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Mouse Over
  // ─────────────────────────────────────────────────
  test.describe('Mouse Over', () => {
    test.beforeEach(async ({ page }) => {
      const mouseOverPage = new MouseOverPage(page);
      await mouseOverPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Geolocation
  // ─────────────────────────────────────────────────
  test.describe('Geolocation', () => {
    test.beforeEach(async ({ page }) => {
      const geolocationPage = new GeolocationPage(page);
      await geolocationPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Get User Media
  // ─────────────────────────────────────────────────
  test.describe('Get User Media', () => {
    test.beforeEach(async ({ page }) => {
      const getUserMediaPage = new GetUserMediaPage(page);
      await getUserMediaPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Download
  // ─────────────────────────────────────────────────
  test.describe('Download', () => {
    test.beforeEach(async ({ page }) => {
      const downloadPage = new DownloadPage(page);
      await downloadPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  A/B Testing
  // ─────────────────────────────────────────────────
  test.describe('A/B Testing', () => {
    test.beforeEach(async ({ page }) => {
      const abTestingPage = new ABTestingPage(page);
      await abTestingPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Multilanguage
  // ─────────────────────────────────────────────────
  test.describe('Multilanguage', () => {
    test.beforeEach(async ({ page }) => {
      const multilanguagePage = new MultilanguagePage(page);
      await multilanguagePage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Infinite Scroll
  // ─────────────────────────────────────────────────
  test.describe('Infinite Scroll', () => {
    test.beforeEach(async ({ page }) => {
      const infiniteScrollPage = new InfiniteScrollPage(page);
      await infiniteScrollPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Loading Images
  // ─────────────────────────────────────────────────
  test.describe('Loading Images', () => {
    test.beforeEach(async ({ page }) => {
      const loadingImagesPage = new LoadingImagesPage(page);
      await loadingImagesPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Console Logs
  // ─────────────────────────────────────────────────
  test.describe('Console Logs', () => {
    test.beforeEach(async ({ page }) => {
      const consoleLogsPage = new ConsoleLogsPage(page);
      await consoleLogsPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Cookies
  // ─────────────────────────────────────────────────
  test.describe('Cookies', () => {
    test.beforeEach(async ({ page }) => {
      const cookiesPage = new CookiesPage(page);
      await cookiesPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Long Page
  // ─────────────────────────────────────────────────
  test.describe('Long Page', () => {
    test.beforeEach(async ({ page }) => {
      const longPagePage = new LongPage(page);
      await longPagePage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Navigation
  // ─────────────────────────────────────────────────
  test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
      const navigationPage = new NavigationPage(page);
      await navigationPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Slow Calculator
  // ─────────────────────────────────────────────────
  test.describe('Slow Calculator', () => {
    test.beforeEach(async ({ page }) => {
      const slowCalculatorPage = new SlowCalculatorPage(page);
      await slowCalculatorPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────
  //  Random Calculator
  // ─────────────────────────────────────────────────
  test.describe('Random Calculator', () => {
    test.beforeEach(async ({ page }) => {
      const randomCalculatorPage = new RandomCalculatorPage(page);
      await randomCalculatorPage.actions.goto();
    });

    test('should have no accessibility violations', async ({ page }, testInfo) => {
      const results = await runA11yScan(page);
      if (results.violations.length > 0) {
        await testInfo.attach('a11y-violations', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
      }
      expect(results.violations).toEqual([]);
    });
  });
});
