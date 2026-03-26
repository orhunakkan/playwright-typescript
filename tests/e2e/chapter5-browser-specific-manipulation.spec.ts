import { expect, test } from '@playwright/test';

const BASE_URL = process.env.PRACTICE_E2E_URL;

test.describe('Chapter 5 - Browser-Specific Manipulation', () => {
  // ─────────────────────────────────────────────────
  //  1. Geolocation
  // ─────────────────────────────────────────────────
  test.describe('Geolocation', () => {
    test('should display the geolocation heading', async ({ page }) => {
      await page.goto(`${BASE_URL}/geolocation.html`);
      await expect(page.getByRole('heading', { name: 'Geolocation' })).toBeVisible();
    });

    test('should have a "Get coordinates" button', async ({ page }) => {
      await page.goto(`${BASE_URL}/geolocation.html`);
      const button = page.getByRole('button', { name: 'Get coordinates' });
      await expect(button).toBeVisible();
      await expect(button).toHaveId('get-coordinates');
    });

    test('should have an empty coordinates display initially', async ({ page }) => {
      await page.goto(`${BASE_URL}/geolocation.html`);
      const coordinates = page.locator('#coordinates');
      await expect(coordinates).toBeAttached();
      await expect(coordinates).toHaveText('');
    });

    test('should display coordinates when geolocation is granted', async ({ context, page }) => {
      // Grant geolocation permission and set a fake position
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 48.8584, longitude: 2.2945 });

      await page.goto(`${BASE_URL}/geolocation.html`);
      await page.getByRole('button', { name: 'Get coordinates' }).click();

      // Wait for coordinates to appear
      const coordinates = page.locator('#coordinates');
      await expect(coordinates).toContainText('Latitude');
      await expect(coordinates).toContainText('Longitude');
    });

    test('should display the correct mocked latitude and longitude', async ({ context, page }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });

      await page.goto(`${BASE_URL}/geolocation.html`);
      await page.getByRole('button', { name: 'Get coordinates' }).click();

      const coordinates = page.locator('#coordinates');
      await expect(coordinates).toContainText('40.7128');
      await expect(coordinates).toContainText('-74.006');
    });

    test('should update coordinates when geolocation changes', async ({ context, page }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 });

      await page.goto(`${BASE_URL}/geolocation.html`);
      await page.getByRole('button', { name: 'Get coordinates' }).click();

      const coordinates = page.locator('#coordinates');
      await expect(coordinates).toContainText('51.5074');

      // Change geolocation and click again
      await context.setGeolocation({ latitude: 35.6762, longitude: 139.6503 });
      await page.getByRole('button', { name: 'Get coordinates' }).click();

      await expect(coordinates).toContainText('35.6762');
      await expect(coordinates).toContainText('139.6503');
    });

    test('should display latitude with degree symbol', async ({ context, page }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 48.8584, longitude: 2.2945 });

      await page.goto(`${BASE_URL}/geolocation.html`);
      await page.getByRole('button', { name: 'Get coordinates' }).click();

      const coordinates = page.locator('#coordinates');
      await expect(coordinates).toContainText('°');
    });

    test('should verify page title and copyright', async ({ page }) => {
      await page.goto(`${BASE_URL}/geolocation.html`);
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(page.getByText('Copyright © 2021-2025')).toBeAttached();
    });

    test('should handle geolocation permission denied', async ({ browser }) => {
      const context = await browser.newContext({
        geolocation: undefined,
        permissions: [],
      });
      const page = await context.newPage();

      // Mock geolocation to simulate denial
      await page.addInitScript(() => {
        navigator.geolocation.getCurrentPosition = (_success, error) => {
          error!({ code: 1, message: 'User denied Geolocation', PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 });
        };
      });

      await page.goto(`${BASE_URL}/geolocation.html`);
      await page.getByRole('button', { name: 'Get coordinates' }).click();

      // Coordinates should show an error message when permission is denied
      const coordinates = page.locator('#coordinates');
      await expect(coordinates).toContainText('Error');

      await context.close();
    });
  });

  // ─────────────────────────────────────────────────
  //  2. Notifications
  // ─────────────────────────────────────────────────
  test.describe('Notifications', () => {
    test('should display the notifications heading', async ({ page }) => {
      await page.goto(`${BASE_URL}/notifications.html`);
      await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();
    });

    test('should have a "Notify me" button', async ({ page }) => {
      await page.goto(`${BASE_URL}/notifications.html`);
      const button = page.getByRole('button', { name: 'Notify me' });
      await expect(button).toBeVisible();
      await expect(button).toHaveId('notify-me');
    });

    test('should have correct button styling', async ({ page }) => {
      await page.goto(`${BASE_URL}/notifications.html`);
      const button = page.locator('#notify-me');
      await expect(button).toHaveClass(/btn-outline-primary/);
    });

    test('should trigger notification when permission is granted', async ({ context, page }) => {
      // Grant notification permission
      await context.grantPermissions(['notifications']);

      await page.goto(`${BASE_URL}/notifications.html`);

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
          (window as any).Notification.requestPermission = OriginalNotification.requestPermission;
          document.getElementById('notify-me')!.click();
        });
      });

      expect(notificationFired).toBe(true);
    });

    test('should create notification with correct title and body', async ({ context, page }) => {
      await context.grantPermissions(['notifications']);

      await page.goto(`${BASE_URL}/notifications.html`);

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
      await page.goto(`${BASE_URL}/notifications.html`);
      await expect(page.getByText('Copyright © 2021-2025')).toBeAttached();
      await expect(page.getByRole('link', { name: 'Boni García' })).toBeVisible();
    });

    test('should handle notification permission denied', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

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

      await page.goto(`${BASE_URL}/notifications.html`);
      await page.getByRole('button', { name: 'Notify me' }).click();

      // No notification should be created — page should remain unchanged
      await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible();

      await context.close();
    });
  });

  // ─────────────────────────────────────────────────
  //  3. Get User Media
  // ─────────────────────────────────────────────────
  test.describe('Get User Media', () => {
    test('should display the get user media heading', async ({ page }) => {
      await page.goto(`${BASE_URL}/get-user-media.html`);
      await expect(page.getByRole('heading', { name: 'Get user media' })).toBeVisible();
    });

    test('should have a "Start" button', async ({ page }) => {
      await page.goto(`${BASE_URL}/get-user-media.html`);
      const button = page.getByRole('button', { name: 'Start' });
      await expect(button).toBeVisible();
      await expect(button).toHaveId('start');
    });

    test('should have a video element on the page', async ({ page }) => {
      await page.goto(`${BASE_URL}/get-user-media.html`);
      const video = page.locator('#my-video');
      await expect(video).toBeAttached();
      await expect(video).toHaveAttribute('autoplay', '');
      await expect(video).toHaveAttribute('playsinline', '');
    });

    test('should have an empty video device label initially', async ({ page }) => {
      await page.goto(`${BASE_URL}/get-user-media.html`);
      const videoDevice = page.locator('#video-device');
      await expect(videoDevice).toBeAttached();
      await expect(videoDevice).toHaveText('');
    });

    test('should have correct button styling', async ({ page }) => {
      await page.goto(`${BASE_URL}/get-user-media.html`);
      const button = page.locator('#start');
      await expect(button).toHaveClass(/btn-outline-primary/);
    });

    test('should display video device info when media is granted', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      // Mock getUserMedia to return a fake stream
      await page.addInitScript(() => {
        const fakeStream = {
          getVideoTracks: () => [{ label: 'fake-video-device-0' }],
          getAudioTracks: () => [{ label: 'fake-audio-device-0' }],
          getTracks: () => [],
        };
        navigator.mediaDevices.getUserMedia = async () => fakeStream as unknown as MediaStream;
      });

      await page.goto(`${BASE_URL}/get-user-media.html`);
      await page.getByRole('button', { name: 'Start' }).click();

      // Wait for video device info to appear
      const videoDevice = page.locator('#video-device');
      await expect(videoDevice).toContainText('Using video device');
      await expect(videoDevice).toContainText('fake-video-device-0');

      await context.close();
    });

    test('should disable the Start button after clicking', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      await page.addInitScript(() => {
        const fakeStream = {
          getVideoTracks: () => [{ label: 'fake-video-device' }],
          getAudioTracks: () => [{ label: 'fake-audio-device' }],
          getTracks: () => [],
        };
        navigator.mediaDevices.getUserMedia = async () => fakeStream as unknown as MediaStream;

        // Prevent video.srcObject assignment from throwing with a fake stream
        Object.defineProperty(HTMLVideoElement.prototype, 'srcObject', {
          set: () => {},
          get: () => null,
        });
      });

      await page.goto(`${BASE_URL}/get-user-media.html`);
      const startButton = page.getByRole('button', { name: 'Start' });

      await expect(startButton).toBeEnabled();
      await startButton.click();

      // Button should become disabled after successful media access
      await expect(startButton).toBeDisabled();

      await context.close();
    });

    test('should have video element with border and rounded styling', async ({ page }) => {
      await page.goto(`${BASE_URL}/get-user-media.html`);
      const video = page.locator('#my-video');
      await expect(video).toHaveClass(/border/);
      await expect(video).toHaveClass(/rounded/);
    });

    test('should handle getUserMedia permission denied', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      // Mock getUserMedia to throw a NotAllowedError
      await page.addInitScript(() => {
        navigator.mediaDevices.getUserMedia = async () => {
          throw new DOMException('Permission denied', 'NotAllowedError');
        };
      });

      await page.goto(`${BASE_URL}/get-user-media.html`);

      // Listen for page errors caused by the unhandled rejection
      const errors: Error[] = [];
      page.on('pageerror', (err) => errors.push(err));

      await page.getByRole('button', { name: 'Start' }).click();

      // Video device label should remain empty since media access was denied
      await expect(page.locator('#video-device')).toHaveText('');

      await context.close();
    });
  });

  // ─────────────────────────────────────────────────
  //  4. Multilanguage
  // ─────────────────────────────────────────────────
  test.describe('Multilanguage', () => {
    test('should display the multilanguage heading', async ({ page }) => {
      await page.goto(`${BASE_URL}/multilanguage.html`);
      // The heading text depends on browser locale, check structure
      const heading = page.locator('h1.display-6');
      await expect(heading).toBeVisible();
      await expect(heading).toHaveAttribute('key', '_title');
    });

    test('should have four list items', async ({ page }) => {
      await page.goto(`${BASE_URL}/multilanguage.html`);
      const listItems = page.locator('#content li');
      await expect(listItems).toHaveCount(4);
    });

    test('should display English content with en locale', async ({ browser }) => {
      const context = await browser.newContext({ locale: 'en-US' });
      const page = await context.newPage();

      await page.goto(`${BASE_URL}/multilanguage.html`);

      await expect(page.locator('h1.display-6')).toHaveText('Multilanguage page');
      await expect(page.getByText('Home')).toBeVisible();
      await expect(page.getByText('Content')).toBeVisible();
      await expect(page.getByText('About us')).toBeVisible();
      await expect(page.getByText('Contact us')).toBeVisible();

      await context.close();
    });

    test('should display Spanish content with es locale', async ({ browser }) => {
      const context = await browser.newContext({ locale: 'es-ES' });
      const page = await context.newPage();

      await page.goto(`${BASE_URL}/multilanguage.html`);

      await expect(page.locator('h1.display-6')).toHaveText('Página multilenguage');
      await expect(page.getByText('Inicio')).toBeVisible();
      await expect(page.getByText('Contenido')).toBeVisible();
      await expect(page.getByText('Acerca de')).toBeVisible();
      await expect(page.getByText('Contacto')).toBeVisible();

      await context.close();
    });

    test('should have lang class and key attributes on all translatable elements', async ({ page }) => {
      await page.goto(`${BASE_URL}/multilanguage.html`);

      const langElements = page.locator('.lang');
      const count = await langElements.count();
      // heading + 4 list items = 5
      expect(count).toBe(5);

      // Each should have a key attribute
      for (let langIndex = 0; langIndex < count; langIndex++) {
        const key = await langElements.nth(langIndex).getAttribute('key');
        expect(key).toBeTruthy();
        expect(key).toMatch(/^_/);
      }
    });

    test('should verify list items have correct key attributes', async ({ page }) => {
      await page.goto(`${BASE_URL}/multilanguage.html`);

      const listItems = page.locator('#content li.lang');
      await expect(listItems.nth(0)).toHaveAttribute('key', '_home');
      await expect(listItems.nth(1)).toHaveAttribute('key', '_content');
      await expect(listItems.nth(2)).toHaveAttribute('key', '_about');
      await expect(listItems.nth(3)).toHaveAttribute('key', '_contact');
    });

    test('should switch from English to Spanish by changing locale', async ({ browser }) => {
      // First verify English
      const enContext = await browser.newContext({ locale: 'en-US' });
      const enPage = await enContext.newPage();
      await enPage.goto(`${BASE_URL}/multilanguage.html`);
      await expect(enPage.locator('h1.display-6')).toHaveText('Multilanguage page');
      await enContext.close();

      // Then verify Spanish
      const esContext = await browser.newContext({ locale: 'es-ES' });
      const esPage = await esContext.newPage();
      await esPage.goto(`${BASE_URL}/multilanguage.html`);
      await expect(esPage.locator('h1.display-6')).toHaveText('Página multilenguage');
      await esContext.close();
    });

    test('should have correct page title', async ({ page }) => {
      await page.goto(`${BASE_URL}/multilanguage.html`);
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
    });

    test('should verify the content section structure', async ({ page }) => {
      await page.goto(`${BASE_URL}/multilanguage.html`);
      const contentDiv = page.locator('#content');
      await expect(contentDiv).toBeAttached();

      const ul = contentDiv.locator('ul');
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
      await page.goto(`${BASE_URL}/console-logs.html`);
      await expect(page.getByRole('heading', { name: 'Console logs' })).toBeVisible();
    });

    test('should display the description paragraph', async ({ page }) => {
      await page.goto(`${BASE_URL}/console-logs.html`);
      await expect(page.getByText("This page makes call to JavaScript's console (log, info, warn, error).")).toBeVisible();
    });

    test('should capture all four console message types', async ({ page }) => {
      const messages: { type: string; text: string }[] = [];
      page.on('console', (msg) => {
        messages.push({ type: msg.type(), text: msg.text() });
      });

      await page.goto(`${BASE_URL}/console-logs.html`);

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

      await page.goto(`${BASE_URL}/console-logs.html`);

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

      await page.goto(`${BASE_URL}/console-logs.html`);

      expect(logMessages).toContain("This a call to 'console.log'");
    });

    test('should verify exact console.warn message text', async ({ page }) => {
      const warnMessages: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'warning') {
          warnMessages.push(msg.text());
        }
      });

      await page.goto(`${BASE_URL}/console-logs.html`);

      expect(warnMessages).toContain("This a call to 'console.warn'");
    });

    test('should verify exact console.error message text', async ({ page }) => {
      const errorMessages: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          errorMessages.push(msg.text());
        }
      });

      await page.goto(`${BASE_URL}/console-logs.html`);

      expect(errorMessages).toContain("This a call to 'console.error'");
    });

    test('should capture console messages with source URLs', async ({ page }) => {
      const locations: { url: string; lineNumber: number }[] = [];
      page.on('console', (msg) => {
        const location = msg.location();
        locations.push({ url: location.url, lineNumber: location.lineNumber });
      });

      await page.goto(`${BASE_URL}/console-logs.html`);

      // All messages should come from the console-logs.html page
      expect(locations.length).toBeGreaterThanOrEqual(4);
      for (const loc of locations) {
        expect(loc.url).toContain('console-logs.html');
      }
    });

    test('should have correct page structure', async ({ page }) => {
      await page.goto(`${BASE_URL}/console-logs.html`);
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

      await page.goto(`${BASE_URL}/console-logs.html`);

      expect(infoMessages.length).toBe(1);
      expect(infoMessages[0]).toBe("This a call to 'console.info'");
    });
  });

  // ─────────────────────────────────────────────────
  //  Index Page - Chapter 5 Links
  // ─────────────────────────────────────────────────
  test.describe('Index Page - Chapter 5 Links', () => {
    test('should display the Chapter 5 section heading', async ({ page }) => {
      await page.goto(`${BASE_URL}/index.html`);
      await expect(page.getByRole('heading', { name: 'Chapter 5. Browser-Specific Manipulation' })).toBeVisible();
    });

    test('should have all Chapter 5 links', async ({ page }) => {
      await page.goto(`${BASE_URL}/index.html`);

      await expect(page.getByRole('link', { name: 'Geolocation' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Notifications' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Get user media' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Multilanguage' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Console logs' })).toBeVisible();
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
        await page.goto(`${BASE_URL}/index.html`);
        await page.getByRole('link', { name: link.name }).click();
        await expect(page).toHaveURL(new RegExp(link.url.replace('.', '\\.')));
        await page.goBack();
        await expect(page).toHaveURL(/index\.html/);
      }
    });
  });
});
