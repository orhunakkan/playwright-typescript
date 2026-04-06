import { expect, test } from '../../fixtures/page-fixtures';
import { config } from '../../config/env';

test.describe('Chapter 11 - Mobile-Specific Testing', () => {
  // ─────────────────────────────────────────────────
  //  1. Touch Interactions
  // ─────────────────────────────────────────────────
  test.describe('Touch Interactions', () => {
    test.beforeEach(({ isMobile }) => {
      test.skip(!isMobile, 'Mobile-only');
    });

    test('should tap a text input to focus and type a value @critical', async ({ webFormPage, page }) => {
      await webFormPage.actions.goto();
      await webFormPage.locators.textInput.tap();
      await page.keyboard.type('Hello Mobile');
      await expect(webFormPage.locators.textInput).toHaveValue('Hello Mobile');
    });

    test('should draw on the canvas using raw touchscreen coordinates @critical', async ({ drawInCanvasPage, page }) => {
      await drawInCanvasPage.actions.goto();
      const box = await drawInCanvasPage.locators.canvas.boundingBox();
      expect(box).not.toBeNull();
      await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
      const hasDrawing = await page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>('#my-canvas');
        const data = canvas?.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height).data;
        return data?.some((b) => b !== 0) ?? false;
      });
      expect(hasDrawing).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────
  //  2. Viewport & Device Detection
  // ─────────────────────────────────────────────────
  test.describe('Viewport and Device Detection', () => {
    test.beforeEach(({ isMobile }) => {
      test.skip(!isMobile, 'Mobile-only');
    });

    test('should report mobile viewport dimensions @smoke', async ({ webFormPage, page }) => {
      await webFormPage.actions.goto();
      const vp = page.viewportSize();
      expect(vp).not.toBeNull();
      expect(vp!.width).toBeLessThan(500);
      expect(vp!.height).toBeGreaterThan(700);
    });

    test('should match mobile breakpoint via window.matchMedia', async ({ webFormPage, page }) => {
      await webFormPage.actions.goto();
      const matches = await page.evaluate(() => window.matchMedia('(max-width: 768px)').matches);
      expect(matches).toBe(true);
    });

    test('should confirm coarse pointer on touch device', async ({ webFormPage, page }) => {
      await webFormPage.actions.goto();
      const isCoarse = await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches);
      expect(isCoarse).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────
  //  3. Media Emulation
  // ─────────────────────────────────────────────────
  test.describe('Media Emulation', () => {
    test('should emulate dark color scheme and detect it via matchMedia @smoke', async ({ webFormPage, page }) => {
      await webFormPage.actions.goto();
      await page.emulateMedia({ colorScheme: 'dark' });
      const isDark = await page.evaluate(() => window.matchMedia('(prefers-color-scheme: dark)').matches);
      expect(isDark).toBe(true);
    });

    test('should emulate reduced motion and detect it via matchMedia @critical', async ({ webFormPage, page }) => {
      await webFormPage.actions.goto();
      await page.emulateMedia({ reducedMotion: 'reduce' });
      const isReduced = await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      expect(isReduced).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────
  //  4. Geolocation on Mobile
  // ─────────────────────────────────────────────────
  test.describe('Geolocation on Mobile', () => {
    test.beforeEach(({ isMobile }) => {
      test.skip(!isMobile, 'Mobile-only');
    });

    test('should grant geolocation and retrieve mocked coordinates via tap @critical', async ({ geolocationPage, context }) => {
      await context.grantPermissions(['geolocation']);
      await context.setGeolocation({ latitude: 37.7749, longitude: -122.4194 });
      await geolocationPage.actions.goto();
      await geolocationPage.locators.getCoordinatesButton.tap();
      await expect(geolocationPage.locators.coordinates).toContainText('37.7749');
      await expect(geolocationPage.locators.coordinates).toContainText('-122.4194');
    });
  });

  // ─────────────────────────────────────────────────
  //  5. Network State
  // ─────────────────────────────────────────────────
  test.describe('Network State', () => {
    test.beforeEach(({ isMobile }) => {
      test.skip(!isMobile, 'Mobile-only');
    });

    test('should fail navigation when the network is offline @critical', async ({ webFormPage, page }) => {
      await webFormPage.actions.goto();
      await page.context().setOffline(true);
      await expect(page.goto(`${config.e2eUrl}/geolocation.html`)).rejects.toThrow();
      await page.context().setOffline(false);
    });
  });

  // ─────────────────────────────────────────────────
  //  6. Native Input Types
  // ─────────────────────────────────────────────────
  test.describe('Native Input Types', () => {
    test('should verify color picker uses native color input type', async ({ webFormPage }) => {
      await webFormPage.actions.goto();
      const inputType = await webFormPage.locators.colorPicker.getAttribute('type');
      expect(inputType).toBe('color');
    });
  });
});
