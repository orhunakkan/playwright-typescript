import { expect, test } from '@playwright/test';
import { GeolocationPage } from '../../pages/geolocation.page';
import { NotificationsPage } from '../../pages/notifications.page';
import { GetUserMediaPage } from '../../pages/get-user-media.page';
import { MultilanguagePage } from '../../pages/multilanguage.page';
import { ConsoleLogsPage } from '../../pages/console-logs.page';
import { HomePage } from '../../pages/home.page';

const BASE_URL = process.env.PRACTICE_E2E_URL;

test.describe('Chapter 5 - Browser-Specific Manipulation', () => {
  // ─────────────────────────────────────────────────
  //  1. Geolocation
  // ─────────────────────────────────────────────────
  test.describe('Geolocation', () => {
    test('should display the geolocation heading', async ({ page }) => {
      const geoPage = new GeolocationPage(page);
      await geoPage.actions.goto();
      await expect(geoPage.locators.heading).toBeVisible();
    });

    test('should have a "Get coordinates" button', async ({ page }) => {
      const geoPage = new GeolocationPage(page);
      await geoPage.actions.goto();
      await expect(geoPage.locators.getCoordinatesButton).toBeVisible();
      await expect(geoPage.locators.getCoordinatesButton).toHaveId('get-coordinates');
    });

    test('should have an empty coordinates display initially', async ({ page }) => {
      const geoPage = new GeolocationPage(page);
      await geoPage.actions.goto();
      await expect(geoPage.locators.coordinates).toBeAttached();
      await expect(geoPage.locators.coordinates).toHaveText('');
    });

    test('should display coordinates when geolocation is granted', async ({ context, page }) => {
      // Grant geolocation permission and set a fake position
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 48.8584, longitude: 2.2945 });

      const geoPage = new GeolocationPage(page);
      await geoPage.actions.goto();
      await geoPage.actions.getCoordinates();

      // Wait for coordinates to appear
      await expect(geoPage.locators.coordinates).toContainText('Latitude');
      await expect(geoPage.locators.coordinates).toContainText('Longitude');
    });

    test('should display the correct mocked latitude and longitude', async ({ context, page }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

      const geoPage = new GeolocationPage(page);
      await geoPage.actions.goto();
      await geoPage.actions.getCoordinates();

      await expect(geoPage.locators.coordinates).toContainText('40.7128');
      await expect(geoPage.locators.coordinates).toContainText('-74.006');
    });

    test('should update coordinates when geolocation changes', async ({ context, page }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 });

      const geoPage = new GeolocationPage(page);
      await geoPage.actions.goto();
      await geoPage.actions.getCoordinates();

      await expect(geoPage.locators.coordinates).toContainText('51.5074');

      // Change geolocation and click again
      await context.setGeolocation({ latitude: 35.6762, longitude: 139.6503 });
      await geoPage.actions.getCoordinates();

      await expect(geoPage.locators.coordinates).toContainText('35.6762');
      await expect(geoPage.locators.coordinates).toContainText('139.6503');
    });

    test('should display latitude with degree symbol', async ({ context, page }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 48.8584, longitude: 2.2945 });

      const geoPage = new GeolocationPage(page);
      await geoPage.actions.goto();
      await geoPage.actions.getCoordinates();

      await expect(geoPage.locators.coordinates).toContainText('°');
    });

    test('should verify page title and copyright', async ({ page }) => {
      const geoPage = new GeolocationPage(page);
      await geoPage.actions.goto();
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(page.getByText('Copyright © 2021-2025')).toBeAttached();
    });

    test('should handle geolocation permission denied', async ({ browser }) => {
      const context = await browser.newContext({
        geolocation: undefined,
        permissions: [],
      });
      const page = await context.newPage();
      const geoPage = new GeolocationPage(page);

      // Mock geolocation to simulate denial
      await page.addInitScript(() => {
        navigator.geolocation.getCurrentPosition = (_success, error) => {
          error!({ code: 1, message: 'User denied Geolocation', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
        };
      });

      await geoPage.actions.goto();
      await geoPage.actions.getCoordinates();

      // Coordinates should show an error message when permission is denied
      await expect(geoPage.locators.coordinates).toContainText('Error');

      await context.close();
    });
  });

  // ─────────────────────────────────────────────────
  //  2. Notifications
  // ─────────────────────────────────────────────────
  test.describe('Notifications', () => {
    test('should display the notifications heading', async ({ page }) => {
      const notifPage = new NotificationsPage(page);
      await notifPage.actions.goto();
      await expect(notifPage.locators.heading).toBeVisible();
    });

    test('should have a "Notify me" button', async ({ page }) => {
      const notifPage = new NotificationsPage(page);
      await notifPage.actions.goto();
      await expect(notifPage.locators.notifyMeButton).toBeVisible();
      await expect(notifPage.locators.notifyMeButton).toHaveId('notify-me');
    });

    test('should have correct button styling', async ({ page }) => {
      const notifPage = new NotificationsPage(page);
      await notifPage.actions.goto();
      await expect(notifPage.locators.notifyMeButton).toHaveClass(/btn-outline-primary/);
    });

    test('should trigger notification when permission is granted', async ({ context, page }) => {
      // Grant notification permission
      await context.grantPermissions(['notifications']);

      const notifPage = new NotificationsPage(page);
      await notifPage.actions.goto();

      // Mock the Notification constructor to track it was called
      const notificationFired = await page.evaluate(() => {
        return new Promise<boolean>((resolve) => {
          const OriginalNotification = window.Notification;
          (window as any).Notification = function (title: string, options: any) {
            resolve(true);
            return {} as Notification;
          };
          // Preserve the permission property
          Object.defineProperty((window as any).Notification, 'permission', {
            get: () => 'granted',
          });
          (window as any).Notification.requestPermission = OriginalNotification?.requestPermission ?? (() => Promise.resolve('granted' as NotificationPermission));
          document.getElementById('notify-me')!.click();
        });
      });

      expect(notificationFired).toBe(true);
    });

    test('should create notification with correct title and body', async ({ context, page }) => {
      await context.grantPermissions(['notifications']);

      const notifPage = new NotificationsPage(page);
      await notifPage.actions.goto();

      // Mock Notification to capture its arguments
      const notificationData = await page.evaluate(() => {
        return new Promise<{ title: string; body: string; icon: string }>((resolve) => {
          (window as any).Notification = function (title: string, options: any) {
            resolve({ title, body: options.body, icon: options.icon });
            return {} as Notification;
          };
          Object.defineProperty((window as any).Notification, 'permission', {
            get: () => 'granted',
          });
          document.getElementById('notify-me')!.click();
        });
      });

      expect(notificationData.title).toBe('This is a notification');
      expect(notificationData.body).toBe('Hey there!');
      expect(notificationData.icon).toContain('hands-on-icon.png');
    });

    test('should verify page has copyright footer', async ({ page }) => {
      const notifPage = new NotificationsPage(page);
      await notifPage.actions.goto();
      await expect(page.getByText('Copyright © 2021-2025')).toBeAttached();
      await expect(page.getByRole('link', { name: 'Boni García' })).toBeVisible();
    });

    test('should handle notification permission denied', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const notifPage = new NotificationsPage(page);

      // Mock Notification.permission as 'denied'
      await page.addInitScript(() => {
        Object.defineProperty(window, 'Notification', {
          value: class {
            static permission = 'denied';
            static requestPermission = async () => 'denied';
          },
          writable: true,
        });
      });

      await notifPage.actions.goto();
      await notifPage.actions.clickNotifyMe();

      // No notification should be created — page should remain unchanged
      await expect(notifPage.locators.heading).toBeVisible();

      await context.close();
    });
  });

  // ─────────────────────────────────────────────────
  //  3. Get User Media
  // ─────────────────────────────────────────────────
  test.describe('Get User Media', () => {
    test('should display the get user media heading', async ({ page }) => {
      const mediaPage = new GetUserMediaPage(page);
      await mediaPage.actions.goto();
      await expect(mediaPage.locators.heading).toBeVisible();
    });

    test('should have a "Start" button', async ({ page }) => {
      const mediaPage = new GetUserMediaPage(page);
      await mediaPage.actions.goto();
      await expect(mediaPage.locators.startButton).toBeVisible();
      await expect(mediaPage.locators.startButton).toHaveId('start');
    });

    test('should have a video element on the page', async ({ page }) => {
      const mediaPage = new GetUserMediaPage(page);
      await mediaPage.actions.goto();
      await expect(mediaPage.locators.video).toBeAttached();
      await expect(mediaPage.locators.video).toHaveAttribute('autoplay', '');
      await expect(mediaPage.locators.video).toHaveAttribute('playsinline', '');
    });

    test('should have an empty video device label initially', async ({ page }) => {
      const mediaPage = new GetUserMediaPage(page);
      await mediaPage.actions.goto();
      await expect(mediaPage.locators.videoDevice).toBeAttached();
      await expect(mediaPage.locators.videoDevice).toHaveText('');
    });

    test('should have correct button styling', async ({ page }) => {
      const mediaPage = new GetUserMediaPage(page);
      await mediaPage.actions.goto();
      await expect(mediaPage.locators.startButton).toHaveClass(/btn-outline-primary/);
    });

    test('should display video device info when media is granted', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const mediaPage = new GetUserMediaPage(page);

      // Mock getUserMedia to return a fake stream
      await page.addInitScript(() => {
        const fakeStream = {
          getVideoTracks: () => [{ label: 'fake-video-device-0' }],
          getAudioTracks: () => [{ label: 'fake-audio-device-0' }],
          getTracks: () => [],
        };
        if (!navigator.mediaDevices) {
          Object.defineProperty(navigator, 'mediaDevices', { value: {}, writable: true, configurable: true });
        }
        navigator.mediaDevices.getUserMedia = async () => fakeStream as unknown as MediaStream;
      });

      await mediaPage.actions.goto();
      await mediaPage.actions.clickStart();

      // Wait for video device info to appear
      await expect(mediaPage.locators.videoDevice).toContainText('Using video device');
      await expect(mediaPage.locators.videoDevice).toContainText('fake-video-device-0');

      await context.close();
    });

    test('should disable the Start button after clicking', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const mediaPage = new GetUserMediaPage(page);

      await page.addInitScript(() => {
        const fakeStream = {
          getVideoTracks: () => [{ label: 'fake-video-device' }],
          getAudioTracks: () => [{ label: 'fake-audio-device' }],
          getTracks: () => [],
        };
        if (!navigator.mediaDevices) {
          Object.defineProperty(navigator, 'mediaDevices', { value: {}, writable: true, configurable: true });
        }
        navigator.mediaDevices.getUserMedia = async () => fakeStream as unknown as MediaStream;

        // Prevent video.srcObject assignment from throwing with a fake stream
        Object.defineProperty(HTMLVideoElement.prototype, 'srcObject', {
          set: () => {},
          get: () => null,
        });
      });

      await mediaPage.actions.goto();
      await expect(mediaPage.locators.startButton).toBeEnabled();
      await mediaPage.actions.clickStart();

      // Button should become disabled after successful media access
      await expect(mediaPage.locators.startButton).toBeDisabled();

      await context.close();
    });

    test('should have video element with border and rounded styling', async ({ page }) => {
      const mediaPage = new GetUserMediaPage(page);
      await mediaPage.actions.goto();
      await expect(mediaPage.locators.video).toHaveClass(/border/);
      await expect(mediaPage.locators.video).toHaveClass(/rounded/);
    });

    test('should handle getUserMedia permission denied', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const mediaPage = new GetUserMediaPage(page);

      // Mock getUserMedia to throw a NotAllowedError
      await page.addInitScript(() => {
        navigator.mediaDevices.getUserMedia = async () => {
          throw new DOMException('Permission denied', 'NotAllowedError');
        };
      });

      await mediaPage.actions.goto();

      // Listen for page errors caused by the unhandled rejection
      const errors: Error[] = [];
      page.on('pageerror', (err) => errors.push(err));

      await mediaPage.actions.clickStart();

      // Video device label should remain empty since media access was denied
      await expect(mediaPage.locators.videoDevice).toHaveText('');

      await context.close();
    });
  });

  // ─────────────────────────────────────────────────
  //  4. Multilanguage
  // ─────────────────────────────────────────────────
  test.describe('Multilanguage', () => {
    test('should display the multilanguage heading', async ({ page }) => {
      const multiPage = new MultilanguagePage(page);
      await multiPage.actions.goto();
      // The heading text depends on browser locale, check structure
      await expect(multiPage.locators.heading).toBeVisible();
      await expect(multiPage.locators.heading).toHaveAttribute('key', '_title');
    });

    test('should have four list items', async ({ page }) => {
      const multiPage = new MultilanguagePage(page);
      await multiPage.actions.goto();
      await expect(multiPage.locators.contentListItems).toHaveCount(4);
    });

    test('should display English content with en locale', async ({ browser }) => {
      const context = await browser.newContext({ locale: 'en-US' });
      const page = await context.newPage();
      const multiPage = new MultilanguagePage(page);

      await multiPage.actions.goto();

      await expect(multiPage.locators.heading).toHaveText('Multilanguage page');
      await expect(page.getByText('Home')).toBeVisible();
      await expect(page.getByText('Content')).toBeVisible();
      await expect(page.getByText('About us')).toBeVisible();
      await expect(page.getByText('Contact us')).toBeVisible();

      await context.close();
    });

    test('should display Spanish content with es locale', async ({ browser }) => {
      const context = await browser.newContext({ locale: 'es-ES' });
      const page = await context.newPage();
      const multiPage = new MultilanguagePage(page);

      await multiPage.actions.goto();

      await expect(multiPage.locators.heading).toHaveText('Página multilenguage');
      await expect(page.getByText('Inicio')).toBeVisible();
      await expect(page.getByText('Contenido')).toBeVisible();
      await expect(page.getByText('Acerca de')).toBeVisible();
      await expect(page.getByText('Contacto')).toBeVisible();

      await context.close();
    });

    test('should have lang class and key attributes on all translatable elements', async ({ page }) => {
      const multiPage = new MultilanguagePage(page);
      await multiPage.actions.goto();

      const count = await multiPage.locators.langElements.count();
      // heading + 4 list items = 5
      expect(count).toBe(5);

      // Each should have a key attribute
      for (let langIndex = 0; langIndex < count; langIndex++) {
        const key = await multiPage.locators.langElements.nth(langIndex).getAttribute('key');
        expect(key).toBeTruthy();
        expect(key).toMatch(/^_/);
      }
    });

    test('should verify list items have correct key attributes', async ({ page }) => {
      const multiPage = new MultilanguagePage(page);
      await multiPage.actions.goto();

      await expect(multiPage.locators.langListItems.nth(0)).toHaveAttribute('key', '_home');
      await expect(multiPage.locators.langListItems.nth(1)).toHaveAttribute('key', '_content');
      await expect(multiPage.locators.langListItems.nth(2)).toHaveAttribute('key', '_about');
      await expect(multiPage.locators.langListItems.nth(3)).toHaveAttribute('key', '_contact');
    });

    test('should switch from English to Spanish by changing locale', async ({ browser }) => {
      // First verify English
      const enContext = await browser.newContext({ locale: 'en-US' });
      const enPage = await enContext.newPage();
      const enMultiPage = new MultilanguagePage(enPage);
      await enMultiPage.actions.goto();
      await expect(enMultiPage.locators.heading).toHaveText('Multilanguage page');
      await enContext.close();

      // Then verify Spanish
      const esContext = await browser.newContext({ locale: 'es-ES' });
      const esPage = await esContext.newPage();
      const esMultiPage = new MultilanguagePage(esPage);
      await esMultiPage.actions.goto();
      await expect(esMultiPage.locators.heading).toHaveText('Página multilenguage');
      await esContext.close();
    });

    test('should have correct page title', async ({ page }) => {
      const multiPage = new MultilanguagePage(page);
      await multiPage.actions.goto();
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
    });

    test('should verify the content section structure', async ({ page }) => {
      const multiPage = new MultilanguagePage(page);
      await multiPage.actions.goto();
      await expect(multiPage.locators.contentDiv).toBeAttached();

      const ul = multiPage.locators.contentDiv.locator('ul');
      await expect(ul).toBeAttached();

      const items = ul.locator('li');
      await expect(items).toHaveCount(4);
    });
  });

  // ─────────────────────────────────────────────────
  //  5. Console Logs
  // ─────────────────────────────────────────────────
  test.describe('Console Logs', () => {
    test('should display the console logs heading', async ({ page }) => {
      const consolePage = new ConsoleLogsPage(page);
      await consolePage.actions.goto();
      await expect(consolePage.locators.heading).toBeVisible();
    });

    test('should display the description paragraph', async ({ page }) => {
      const consolePage = new ConsoleLogsPage(page);
      await consolePage.actions.goto();
      await expect(consolePage.locators.description).toBeVisible();
    });

    test('should capture all four console message types', async ({ page }) => {
      const messages: { type: string; text: string }[] = [];
      page.on('console', (msg) => {
        messages.push({ type: msg.type(), text: msg.text() });
      });

      const consolePage = new ConsoleLogsPage(page);
      await consolePage.actions.goto();

      const types = messages.map((message) => message.type);
      expect(types).toContain('log');
      expect(types).toContain('info');
      expect(types).toContain('warning');
      expect(types).toContain('error');
    });

    test('should capture the thrown error as a page error', async ({ page }) => {
      const pageErrors: Error[] = [];
      page.on('pageerror', (error) => {
        pageErrors.push(error);
      });

      const consolePage = new ConsoleLogsPage(page);
      await consolePage.actions.goto();

      expect(pageErrors.length).toBeGreaterThanOrEqual(1);
      expect(pageErrors[0].message).toContain('This a forced error');
    });

    test('should verify exact console.log message text', async ({ page }) => {
      const logMessages: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'log') {
          logMessages.push(msg.text());
        }
      });

      const consolePage = new ConsoleLogsPage(page);
      await consolePage.actions.goto();

      expect(logMessages).toContain("This a call to 'console.log'");
    });

    test('should verify exact console.warn message text', async ({ page }) => {
      const warnMessages: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'warning') {
          warnMessages.push(msg.text());
        }
      });

      const consolePage = new ConsoleLogsPage(page);
      await consolePage.actions.goto();

      expect(warnMessages).toContain("This a call to 'console.warn'");
    });

    test('should verify exact console.error message text', async ({ page }) => {
      const errorMessages: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errorMessages.push(msg.text());
        }
      });

      const consolePage = new ConsoleLogsPage(page);
      await consolePage.actions.goto();

      expect(errorMessages).toContain("This a call to 'console.error'");
    });

    test('should capture console messages with source URLs', async ({ page }) => {
      const locations: { url: string; lineNumber: number }[] = [];
      page.on('console', (msg) => {
        const location = msg.location();
        locations.push({ url: location.url, lineNumber: location.lineNumber });
      });

      const consolePage = new ConsoleLogsPage(page);
      await consolePage.actions.goto();

      // All messages should come from the console-logs.html page
      expect(locations.length).toBeGreaterThanOrEqual(4);
      for (const loc of locations) {
        expect(loc.url).toContain('console-logs.html');
      }
    });

    test('should have correct page structure', async ({ page }) => {
      const consolePage = new ConsoleLogsPage(page);
      await consolePage.actions.goto();
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(page.getByText('Copyright © 2021-2025')).toBeAttached();
    });

    test('should verify exact console.info message text', async ({ page }) => {
      const infoMessages: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'info') {
          infoMessages.push(msg.text());
        }
      });

      const consolePage = new ConsoleLogsPage(page);
      await consolePage.actions.goto();

      expect(infoMessages.length).toBe(1);
      expect(infoMessages[0]).toBe("This a call to 'console.info'");
    });
  });

  // ─────────────────────────────────────────────────
  //  Index Page - Chapter 5 Links
  // ─────────────────────────────────────────────────
  test.describe('Index Page - Chapter 5 Links', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
      homePage = new HomePage(page);
      await homePage.actions.goto();
    });

    test('should display the Chapter 5 section heading', async () => {
      await expect(homePage.locators.chapter5Heading).toBeVisible();
    });

    test('should have all Chapter 5 links', async () => {
      await expect(homePage.locators.chapterLink('Geolocation')).toBeVisible();
      await expect(homePage.locators.chapterLink('Notifications')).toBeVisible();
      await expect(homePage.locators.chapterLink('Get user media')).toBeVisible();
      await expect(homePage.locators.chapterLink('Multilanguage')).toBeVisible();
      await expect(homePage.locators.chapterLink('Console logs')).toBeVisible();
    });

    test('should navigate to each Chapter 5 page and back', async ({ page }) => {
      const links = [
        { name: 'Geolocation', url: 'geolocation.html' },
        { name: 'Notifications', url: 'notifications.html' },
        { name: 'Get user media', url: 'get-user-media.html' },
        { name: 'Multilanguage', url: 'multilanguage.html' },
        { name: 'Console logs', url: 'console-logs.html' },
      ];

      for (const link of links) {
        await homePage.actions.goto();
        await homePage.actions.navigateToLink(link.name);
        await expect(page).toHaveURL(new RegExp(link.url.replace('.', '\\.')));
        await page.goBack();
        await expect(page).toHaveURL(/index\.html/);
      }
    });
  });
});
