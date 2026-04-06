import { expect, test } from '../../fixtures/page-fixtures';
import { config } from '../../config/env';

const BASE_URL = config.e2eUrl;

test.describe('Chapter 4 - Browser-Agnostic Features', () => {
  // ─────────────────────────────────────────────────
  //  1. Long Page
  // ─────────────────────────────────────────────────
  test.describe('Long Page', () => {
    test.beforeEach(async ({ longPage }) => {
      await longPage.actions.goto();
      // Content is loaded via jQuery AJAX — wait for it
      await longPage.actions.waitForContent();
    });

    test('should display the long page heading @smoke', async ({ longPage }) => {
      await expect(longPage.locators.heading).toBeVisible();
    });

    test('should contain multiple paragraphs of Lorem Ipsum text', async ({ longPage }) => {
      const count = await longPage.locators.contentParagraphs.count();
      expect(count).toBeGreaterThanOrEqual(20);
    });

    test('should have a page height greater than the viewport', async ({ page }) => {
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      expect(scrollHeight).toBeGreaterThan(viewportHeight);
    });

    test('should scroll to the bottom of the page @critical', async ({ longPage, page }) => {
      // Footer should not be in viewport initially
      await expect(longPage.locators.footer).not.toBeInViewport();

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

      // Footer should now be visible in viewport
      await expect(longPage.locators.footer).toBeInViewport();
    });

    test('should scroll to a specific paragraph and verify visibility', async ({ longPage }) => {
      const lastParagraph = longPage.locators.contentParagraphs.last();
      await expect(lastParagraph).not.toBeInViewport();

      await lastParagraph.scrollIntoViewIfNeeded();
      await expect(lastParagraph).toBeInViewport();
    });

    test('should scroll down and back to the top', async ({ longPage, page }) => {
      await expect(longPage.locators.heading).toBeInViewport();

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect(longPage.locators.heading).not.toBeInViewport();

      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(longPage.locators.heading).toBeInViewport();
    });

    test('should scroll using keyboard (End key)', async ({ longPage, page }) => {
      await expect(longPage.locators.footer).not.toBeInViewport();

      await page.keyboard.press('End');
      await expect(longPage.locators.footer).toBeInViewport();
    });

    test('should verify page title and copyright', async ({ page }) => {
      await expect(page).toHaveTitle('Hands-On Selenium WebDriver with Java');
      await expect(page.getByText('Copyright © 2021-2025')).toBeAttached();
    });

    test('should get scroll position after scrolling', async ({ page }) => {
      // Ensure enough content is loaded for meaningful scrolling
      await page.waitForFunction(() => document.documentElement.scrollHeight > window.innerHeight + 500);

      // Initial scroll should be 0
      const initialScroll = await page.evaluate(() => window.scrollY);
      expect(initialScroll).toBe(0);

      // Scroll down by 500px and wait for the scroll to take effect
      await page.evaluate(() => window.scrollTo(0, 500));
      await page.waitForFunction(() => window.scrollY >= 400);
      const afterScroll = await page.evaluate(() => window.scrollY);
      expect(afterScroll).toBeGreaterThanOrEqual(400);
    });
  });

  // ─────────────────────────────────────────────────
  //  2. Infinite Scroll
  // ─────────────────────────────────────────────────
  test.describe('Infinite Scroll', () => {
    test.beforeEach(async ({ infiniteScrollPage }) => {
      await infiniteScrollPage.actions.goto();
    });

    test('should display the infinite scroll heading @smoke', async ({ infiniteScrollPage }) => {
      await expect(infiniteScrollPage.locators.heading).toBeVisible();
    });

    test('should have initial content loaded', async ({ infiniteScrollPage }) => {
      // Content is loaded via AJAX — wait for it to appear
      await infiniteScrollPage.locators.contentParagraphs.first().waitFor();
      const initialCount = await infiniteScrollPage.locators.contentParagraphs.count();
      expect(initialCount).toBeGreaterThanOrEqual(1);
    });

    test('should load more content when scrolling to bottom @critical', async ({ infiniteScrollPage }) => {
      // Count initial paragraphs
      const initialCount = await infiniteScrollPage.locators.contentParagraphs.count();

      // Scroll to the bottom to trigger infinite scroll
      await infiniteScrollPage.actions.scrollToBottom();
      // Wait for new content to load via AJAX
      await expect(infiniteScrollPage.locators.contentParagraphs).not.toHaveCount(initialCount);

      const midCount = await infiniteScrollPage.locators.contentParagraphs.count();

      // Scroll again to ensure more content loads
      await infiniteScrollPage.actions.scrollToBottom();
      await expect(infiniteScrollPage.locators.contentParagraphs).not.toHaveCount(midCount);

      // Should have more paragraphs now
      const newCount = await infiniteScrollPage.locators.contentParagraphs.count();
      expect(newCount).toBeGreaterThan(initialCount);
    });

    test('should increase page height after scrolling', async ({ infiniteScrollPage, page }) => {
      const initialHeight = await page.evaluate(() => document.documentElement.scrollHeight);

      // Scroll to bottom
      await infiniteScrollPage.actions.scrollToBottom();
      await page.waitForFunction((prevHeight) => document.documentElement.scrollHeight > prevHeight, initialHeight);

      const newHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      expect(newHeight).toBeGreaterThan(initialHeight);
    });

    test('should load content multiple times on successive scrolls', async ({ infiniteScrollPage }) => {
      // Scroll multiple times
      for (let scrollAttempt = 0; scrollAttempt < 3; scrollAttempt++) {
        const countBefore = await infiniteScrollPage.locators.contentParagraphs.count();
        await infiniteScrollPage.actions.scrollToBottom();
        await expect(infiniteScrollPage.locators.contentParagraphs).not.toHaveCount(countBefore);
      }

      // Should have significantly more paragraphs
      const finalCount = await infiniteScrollPage.locators.contentParagraphs.count();
      expect(finalCount).toBeGreaterThanOrEqual(40);
    });
  });

  // ─────────────────────────────────────────────────
  //  3. Shadow DOM
  // ─────────────────────────────────────────────────
  test.describe('Shadow DOM', () => {
    test.beforeEach(async ({ shadowDomPage }) => {
      await shadowDomPage.actions.goto();
    });

    test('should display the Shadow DOM heading @smoke', async ({ shadowDomPage }) => {
      await expect(shadowDomPage.locators.heading).toBeVisible();
    });

    test('should access text inside shadow DOM', async ({ shadowDomPage }) => {
      // Playwright automatically pierces open shadow DOMs with getByText
      await expect(shadowDomPage.locators.helloText).toBeVisible();
    });

    test('should locate shadow DOM content via locator @critical', async ({ shadowDomPage }) => {
      // Using the content div that hosts the shadow root
      await expect(shadowDomPage.locators.shadowContent).toBeAttached();

      // Playwright pierces shadow DOM automatically
      await expect(shadowDomPage.locators.shadowParagraph).toHaveText('Hello Shadow DOM');
    });

    test('should verify shadow root is open mode', async ({ page }) => {
      const shadowRootMode = await page.evaluate(() => {
        const content = document.getElementById('content');
        return content?.shadowRoot?.mode;
      });
      expect(shadowRootMode).toBe('open');
    });

    test('should verify shadow DOM has exactly one paragraph', async ({ page }) => {
      const paragraphCount = await page.evaluate(() => {
        const content = document.getElementById('content');
        return content?.shadowRoot?.querySelectorAll('p').length;
      });
      expect(paragraphCount).toBe(1);
    });

    test('should retrieve shadow DOM text content via evaluate', async ({ page }) => {
      const text = await page.evaluate(() => {
        const content = document.getElementById('content');
        return content?.shadowRoot?.querySelector('p')?.textContent;
      });
      expect(text).toBe('Hello Shadow DOM');
    });
  });

  // ─────────────────────────────────────────────────
  //  4. Cookies
  // ─────────────────────────────────────────────────
  test.describe('Cookies', () => {
    test.beforeEach(async ({ cookiesPage }) => {
      await cookiesPage.actions.goto();
    });

    test('should display the cookies heading @smoke', async ({ cookiesPage }) => {
      await expect(cookiesPage.locators.heading).toBeVisible();
    });

    test('should have "Display cookies" button', async ({ cookiesPage }) => {
      await expect(cookiesPage.locators.displayCookiesButton).toBeVisible();
    });

    test('should display cookies when button is clicked', async ({ cookiesPage }) => {
      await expect(cookiesPage.locators.cookiesList).toHaveText('');

      await cookiesPage.actions.displayCookies();

      // Should show cookie text (username and date are set by the page)
      await expect(cookiesPage.locators.cookiesList).toContainText('username=John Doe');
      await expect(cookiesPage.locators.cookiesList).toContainText('date=10/07/2018');
    });

    test('should read cookies via Playwright context API @critical', async ({ context }) => {
      const cookies = await context.cookies('https://bonigarcia.dev');
      const usernameCookie = cookies.find((cookie) => cookie.name === 'username');
      const dateCookie = cookies.find((cookie) => cookie.name === 'date');

      expect(usernameCookie).toBeDefined();
      expect(usernameCookie?.value).toBe('John Doe');
      expect(dateCookie).toBeDefined();
      expect(dateCookie?.value).toBe('10/07/2018');
    });

    test('should add a new cookie and verify it appears @critical', async ({ cookiesPage, page, context }) => {
      // Add a custom cookie via Playwright API
      await context.addCookies([
        {
          name: 'test-cookie',
          value: 'playwright-value',
          domain: 'bonigarcia.dev',
          path: '/',
        },
      ]);

      // Reload to ensure the cookie is applied
      await page.reload();

      // Click display cookies button
      await cookiesPage.actions.displayCookies();

      // Verify the new cookie appears in the list
      await expect(cookiesPage.locators.cookiesList).toContainText('test-cookie=playwright-value');
    });

    test('should delete a specific cookie', async ({ context }) => {
      // Verify username cookie exists
      let cookies = await context.cookies('https://bonigarcia.dev');
      expect(cookies.find((cookie) => cookie.name === 'username')).toBeDefined();

      // Delete the username cookie
      await context.clearCookies({ name: 'username' });

      // Verify it's gone
      cookies = await context.cookies('https://bonigarcia.dev');
      expect(cookies.find((cookie) => cookie.name === 'username')).toBeUndefined();
    });

    test('should clear all cookies', async ({ context }) => {
      // Verify cookies exist
      let cookies = await context.cookies('https://bonigarcia.dev');
      expect(cookies.length).toBeGreaterThan(0);

      // Clear all cookies
      await context.clearCookies();

      // Verify all cookies are gone
      cookies = await context.cookies('https://bonigarcia.dev');
      expect(cookies.length).toBe(0);

      // After clearing, context should have no cookies
      // (We do NOT reload because the page's inline JS re-sets cookies on load)
    });

    test('should verify cookie properties', async ({ context }) => {
      const cookies = await context.cookies('https://bonigarcia.dev');
      const usernameCookie = cookies.find((cookie) => cookie.name === 'username');

      expect(usernameCookie).toBeDefined();
      expect(usernameCookie!.path).toBe('/');
      expect(usernameCookie!.domain).toContain('bonigarcia.dev');
    });

    test('should modify an existing cookie and verify the updated value', async ({ context }) => {
      // Verify original username cookie
      let cookies = await context.cookies('https://bonigarcia.dev');
      const original = cookies.find((cookie) => cookie.name === 'username');
      expect(original).toBeDefined();

      // Overwrite the cookie with a new value
      await context.addCookies([
        {
          name: 'username',
          value: 'new-user',
          domain: 'bonigarcia.dev',
          path: '/',
        },
      ]);

      // Verify the updated value
      cookies = await context.cookies('https://bonigarcia.dev');
      const updated = cookies.find((cookie) => cookie.name === 'username');
      expect(updated).toBeDefined();
      expect(updated!.value).toBe('new-user');
    });
  });

  // ─────────────────────────────────────────────────
  //  5. Frames (frameset)
  // ─────────────────────────────────────────────────
  test.describe('Frames', () => {
    test.beforeEach(async ({ framesPage }) => {
      await framesPage.actions.goto();
    });

    test('should load the frameset page @smoke', async ({ page }) => {
      await expect(page).toHaveURL(/frames\.html/);
    });

    test('should have three frames', async ({ page }) => {
      // The frameset has 3 frames: header, body, footer
      const frames = page.frames();
      // Main frame + 3 child frames
      expect(frames.length).toBeGreaterThanOrEqual(4);
    });

    test('should access the header frame content', async ({ framesPage }) => {
      const headerFrame = framesPage.locators.headerFrame();
      expect(headerFrame).not.toBeNull();

      const heading = headerFrame!.locator('h1.display-6');
      await expect(heading).toHaveText('Frames');
    });

    test('should access the body frame with Lorem Ipsum content', async ({ framesPage }) => {
      const bodyFrame = framesPage.locators.bodyFrame();
      expect(bodyFrame).not.toBeNull();

      // Wait for the frame content to load
      await bodyFrame!.waitForLoadState('domcontentloaded');
      await bodyFrame!.locator('p').first().waitFor();

      const paragraphs = bodyFrame!.locator('p');
      const count = await paragraphs.count();
      expect(count).toBeGreaterThanOrEqual(1);

      // First paragraph should contain Lorem ipsum text
      const firstParagraph = paragraphs.first();
      await expect(firstParagraph).toContainText('Lorem ipsum');
    });

    test('should access the footer frame content', async ({ framesPage }) => {
      const footerFrame = framesPage.locators.footerFrame();
      expect(footerFrame).not.toBeNull();

      await expect(footerFrame!.locator('text=Copyright © 2021-2025')).toBeVisible();
      await expect(footerFrame!.getByRole('link', { name: 'Boni García' })).toBeVisible();
    });

    test('should verify frame sources', async ({ framesPage }) => {
      const headerFrame = framesPage.locators.headerFrame();
      const bodyFrame = framesPage.locators.bodyFrame();
      const footerFrame = framesPage.locators.footerFrame();

      expect(headerFrame?.url()).toContain('header.html');
      expect(bodyFrame?.url()).toContain('content.html');
      expect(footerFrame?.url()).toContain('footer.html');
    });

    test('should interact with content across frames @critical', async ({ framesPage }) => {
      // Verify heading in header frame
      const headerFrame = framesPage.locators.headerFrame();
      const heading = headerFrame!.locator('h1.display-4');
      await expect(heading).toContainText('Hands-On Selenium WebDriver with Java');

      // Verify footer link
      const footerFrame = framesPage.locators.footerFrame();
      const link = footerFrame!.getByRole('link', { name: 'Boni García' });
      await expect(link).toHaveAttribute('href', 'https://bonigarcia.dev/');
    });
  });

  // ─────────────────────────────────────────────────
  //  6. IFrames
  // ─────────────────────────────────────────────────
  test.describe('IFrames', () => {
    test.beforeEach(async ({ iframesPage }) => {
      await iframesPage.actions.goto();
    });

    test('should display the IFrame heading @smoke', async ({ iframesPage }) => {
      await expect(iframesPage.locators.heading).toBeVisible();
    });

    test('should have an iframe element on the page', async ({ iframesPage }) => {
      await expect(iframesPage.locators.iframe).toBeAttached();
      await expect(iframesPage.locators.iframe).toHaveAttribute('src', 'content.html');
    });

    test('should access iframe content using frameLocator @critical', async ({ iframesPage }) => {
      const firstParagraph = iframesPage.locators.iframeContent.locator('p').first();
      await expect(firstParagraph).toContainText('Lorem ipsum');
    });

    test('should count paragraphs inside the iframe', async ({ iframesPage }) => {
      // Wait for iframe content to load
      await iframesPage.locators.iframeContent.locator('p').first().waitFor();
      const paragraphs = iframesPage.locators.iframeContent.locator('p');
      const count = await paragraphs.count();
      expect(count).toBeGreaterThanOrEqual(10);
    });

    test('should access specific paragraphs inside the iframe', async ({ iframesPage }) => {
      // First paragraph starts with Lorem ipsum
      const firstParagraph = iframesPage.locators.iframeContent.locator('p').first();
      await expect(firstParagraph).toContainText('Lorem ipsum dolor sit amet');

      // Last paragraph should also contain text
      const lastParagraph = iframesPage.locators.iframeContent.locator('p').last();
      const text = await lastParagraph.textContent();
      expect(text!.length).toBeGreaterThan(0);
    });

    test('should verify iframe dimensions via attribute', async ({ iframesPage }) => {
      // The iframe should be rendered with visible dimensions
      const box = await iframesPage.locators.iframe.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    });

    test('should access iframe via frame() method', async ({ iframesPage, page }) => {
      // Wait for iframe to load, then access via frame()
      await iframesPage.locators.iframe.waitFor();
      const contentFrame = page.frame({ url: /content/ });
      expect(contentFrame).toBeDefined();

      // Wait for the frame content to fully render
      await contentFrame!.waitForLoadState('domcontentloaded');
      await contentFrame!.locator('p').first().waitFor();

      const paragraphs = contentFrame!.locator('p');
      const count = await paragraphs.count();
      expect(count).toBeGreaterThanOrEqual(10);
    });

    test('should distinguish between main page and iframe content', async ({ iframesPage }) => {
      // Main page heading should be visible
      await expect(iframesPage.locators.heading).toBeVisible();

      // Main page should NOT have Lorem ipsum directly (only in iframe)
      const count = await iframesPage.locators.mainParagraphs.count();
      expect(count).toBe(0);

      // But iframe should have Lorem ipsum content
      await expect(iframesPage.locators.iframeContent.locator('p').first()).toContainText('Lorem ipsum');
    });
  });

  // ─────────────────────────────────────────────────
  //  7. Dialog Boxes
  // ─────────────────────────────────────────────────
  test.describe('Dialog Boxes', () => {
    test.beforeEach(async ({ dialogBoxesPage }) => {
      await dialogBoxesPage.actions.goto();
    });

    test('should display the dialog boxes heading @smoke', async ({ dialogBoxesPage }) => {
      await expect(dialogBoxesPage.locators.heading).toBeVisible();
    });

    test('should have all dialog trigger buttons', async ({ dialogBoxesPage }) => {
      await expect.soft(dialogBoxesPage.locators.launchAlertButton).toBeVisible();
      await expect.soft(dialogBoxesPage.locators.launchConfirmButton).toBeVisible();
      await expect.soft(dialogBoxesPage.locators.launchPromptButton).toBeVisible();
      await expect.soft(dialogBoxesPage.locators.launchModalButton).toBeVisible();
    });

    // --- Alert Dialog ---
    test('should handle alert dialog and accept it @critical', async ({ dialogBoxesPage, page }) => {
      // Register dialog handler BEFORE the click so the dialog is handled inline
      let dialogType = '';
      let dialogMessage = '';
      page.once('dialog', async (dialog) => {
        dialogType = dialog.type();
        dialogMessage = dialog.message();
        await dialog.accept();
      });

      await dialogBoxesPage.actions.launchAlert();

      expect(dialogType).toBe('alert');
      expect(dialogMessage).toBe('Hello world!');
    });

    // --- Confirm Dialog ---
    test('should handle confirm dialog - accept @critical', async ({ dialogBoxesPage, page }) => {
      let dialogType = '';
      let dialogMessage = '';
      page.once('dialog', async (dialog) => {
        dialogType = dialog.type();
        dialogMessage = dialog.message();
        await dialog.accept();
      });

      await dialogBoxesPage.actions.launchConfirm();

      expect(dialogType).toBe('confirm');
      expect(dialogMessage).toBe('Is this correct?');

      // Verify confirmation text
      await expect(dialogBoxesPage.locators.confirmText).toHaveText('You chose: true');
    });

    test('should handle confirm dialog - dismiss', async ({ dialogBoxesPage, page }) => {
      let dialogType = '';
      page.once('dialog', async (dialog) => {
        dialogType = dialog.type();
        await dialog.dismiss();
      });

      await dialogBoxesPage.actions.launchConfirm();

      expect(dialogType).toBe('confirm');

      // Verify dismiss text
      await expect(dialogBoxesPage.locators.confirmText).toHaveText('You chose: false');
    });

    // --- Prompt Dialog ---
    test('should handle prompt dialog with text input @critical', async ({ dialogBoxesPage, page }) => {
      let dialogType = '';
      let dialogMessage = '';
      page.once('dialog', async (dialog) => {
        dialogType = dialog.type();
        dialogMessage = dialog.message();
        await dialog.accept('Playwright User');
      });

      await dialogBoxesPage.actions.launchPrompt();

      expect(dialogType).toBe('prompt');
      expect(dialogMessage).toBe('Please enter your name');

      // Verify prompt result text
      await expect(dialogBoxesPage.locators.promptText).toHaveText('You typed: Playwright User');
    });

    test('should handle prompt dialog - dismiss (cancel)', async ({ dialogBoxesPage, page }) => {
      page.once('dialog', async (dialog) => {
        await dialog.dismiss();
      });

      await dialogBoxesPage.actions.launchPrompt();

      // When dismissed, prompt returns null
      await expect(dialogBoxesPage.locators.promptText).toHaveText('You typed: null');
    });

    test('should handle prompt dialog with empty input', async ({ dialogBoxesPage, page }) => {
      page.once('dialog', async (dialog) => {
        await dialog.accept('');
      });

      await dialogBoxesPage.actions.launchPrompt();

      // Empty string accepted
      await expect(dialogBoxesPage.locators.promptText).toHaveText('You typed: ');
    });

    // --- Modal Dialog ---
    test('should open modal and verify its content', async ({ dialogBoxesPage }) => {
      await dialogBoxesPage.actions.launchModal();

      // Verify modal elements are visible
      await expect(dialogBoxesPage.locators.modal).toBeVisible();
      await expect.soft(dialogBoxesPage.locators.modalTitle).toBeVisible();
      await expect.soft(dialogBoxesPage.locators.modalBodyText).toBeVisible();
      await expect.soft(dialogBoxesPage.locators.closeButton).toBeVisible();
      await expect.soft(dialogBoxesPage.locators.saveChangesButton).toBeVisible();
    });

    test('should close modal by clicking Close button', async ({ dialogBoxesPage }) => {
      await dialogBoxesPage.actions.launchModal();
      await expect(dialogBoxesPage.locators.modal).toBeVisible();

      await dialogBoxesPage.actions.closeModal();

      // Modal should be hidden after closing
      await expect(dialogBoxesPage.locators.modal).toBeHidden();

      // Verify the result text
      await expect(dialogBoxesPage.locators.modalText).toHaveText('You chose: Close');
    });

    test('should close modal by clicking Save changes button', async ({ dialogBoxesPage }) => {
      await dialogBoxesPage.actions.launchModal();
      await expect(dialogBoxesPage.locators.modal).toBeVisible();

      await dialogBoxesPage.actions.saveModal();

      await expect(dialogBoxesPage.locators.modal).toBeHidden();

      // Verify the result text
      await expect(dialogBoxesPage.locators.modalText).toHaveText('You chose: Save changes');
    });

    test('should verify modal title element', async ({ dialogBoxesPage }) => {
      await dialogBoxesPage.actions.launchModal();

      await expect(dialogBoxesPage.locators.modalTitle).toBeVisible();
      await expect(dialogBoxesPage.locators.modalTitle).toHaveText('Modal title');
    });

    test('should verify prompt dialog has empty default value', async ({ dialogBoxesPage, page }) => {
      let defaultValue = 'NOT_SET';
      page.once('dialog', async (dialog) => {
        defaultValue = dialog.defaultValue();
        await dialog.accept();
      });

      await dialogBoxesPage.actions.launchPrompt();

      expect(defaultValue).toBe('');
    });

    test('should close modal by pressing Escape key', async ({ dialogBoxesPage, page }) => {
      // Set up a listener for the 'shown.bs.modal' event BEFORE opening
      await page.evaluate(() => {
        const el = document.getElementById('example-modal')!;
        (window as any).__modalShown = false;
        el.addEventListener('shown.bs.modal', () => {
          (window as any).__modalShown = true;
        });
      });

      await dialogBoxesPage.actions.launchModal();

      // Wait until Bootstrap's shown event fires (transition complete)
      await page.waitForFunction(() => (window as any).__modalShown === true);

      await expect(dialogBoxesPage.locators.modal).toBeVisible();

      // Press Escape to dismiss the modal
      await page.keyboard.press('Escape');

      await expect(dialogBoxesPage.locators.modal).toBeHidden();
    });
  });

  // ─────────────────────────────────────────────────
  //  8. Web Storage
  // ─────────────────────────────────────────────────
  test.describe('Web Storage', () => {
    test.beforeEach(async ({ webStoragePage }) => {
      await webStoragePage.actions.goto();
    });

    test('should display the web storage heading @smoke', async ({ webStoragePage }) => {
      await expect(webStoragePage.locators.heading).toBeVisible();
    });

    test('should have display buttons for both storage types', async ({ webStoragePage }) => {
      await expect(webStoragePage.locators.displayLocalStorageButton).toBeVisible();
      await expect(webStoragePage.locators.displaySessionStorageButton).toBeVisible();
    });

    // --- Session Storage ---
    test('should display session storage values', async ({ webStoragePage }) => {
      await webStoragePage.actions.displaySessionStorage();
      await expect(webStoragePage.locators.sessionStorageDisplay).toContainText('John');
      await expect(webStoragePage.locators.sessionStorageDisplay).toContainText('Doe');
    });

    test('should read session storage via Playwright evaluate', async ({ page }) => {
      const sessionName = await page.evaluate(() => sessionStorage.getItem('name'));
      const sessionLastname = await page.evaluate(() => sessionStorage.getItem('lastname'));

      expect(sessionName).toBe('John');
      expect(sessionLastname).toBe('Doe');
    });

    test('should set and read session storage items @critical', async ({ webStoragePage, page }) => {
      // Set a new item
      await page.evaluate(() => sessionStorage.setItem('role', 'tester'));

      // Read it back
      const role = await page.evaluate(() => sessionStorage.getItem('role'));
      expect(role).toBe('tester');

      // Display and verify
      await webStoragePage.actions.displaySessionStorage();
      await expect(webStoragePage.locators.sessionStorageDisplay).toContainText('tester');
    });

    test('should remove a session storage item', async ({ page }) => {
      // Verify item exists
      let name = await page.evaluate(() => sessionStorage.getItem('name'));
      expect(name).toBe('John');

      // Remove it
      await page.evaluate(() => sessionStorage.removeItem('name'));

      // Verify it's gone
      name = await page.evaluate(() => sessionStorage.getItem('name'));
      expect(name).toBeNull();
    });

    test('should clear all session storage', async ({ webStoragePage, page }) => {
      // Verify items exist
      let length = await page.evaluate(() => sessionStorage.length);
      expect(length).toBeGreaterThan(0);

      // Clear all
      await page.evaluate(() => sessionStorage.clear());

      // Verify empty
      length = await page.evaluate(() => sessionStorage.length);
      expect(length).toBe(0);

      // Verify display shows empty object
      await webStoragePage.actions.displaySessionStorage();
      await expect(webStoragePage.locators.sessionStorageDisplay).toContainText('{}');
    });

    // --- Local Storage ---
    test('should set and read local storage items @critical', async ({ webStoragePage, page }) => {
      // Set an item in local storage
      await page.evaluate(() => localStorage.setItem('framework', 'playwright'));

      // Read it back
      const value = await page.evaluate(() => localStorage.getItem('framework'));
      expect(value).toBe('playwright');

      // Display and verify
      await webStoragePage.actions.displayLocalStorage();
      await expect(webStoragePage.locators.localStorageDisplay).toContainText('playwright');
    });

    test('should remove a local storage item', async ({ page }) => {
      // Set an item
      await page.evaluate(() => localStorage.setItem('testKey', 'testValue'));
      let value = await page.evaluate(() => localStorage.getItem('testKey'));
      expect(value).toBe('testValue');

      // Remove it
      await page.evaluate(() => localStorage.removeItem('testKey'));
      value = await page.evaluate(() => localStorage.getItem('testKey'));
      expect(value).toBeNull();
    });

    test('should clear all local storage', async ({ page }) => {
      // Set some items
      await page.evaluate(() => {
        localStorage.setItem('key1', 'value1');
        localStorage.setItem('key2', 'value2');
      });

      let length = await page.evaluate(() => localStorage.length);
      expect(length).toBeGreaterThanOrEqual(2);

      // Clear all
      await page.evaluate(() => localStorage.clear());
      length = await page.evaluate(() => localStorage.length);
      expect(length).toBe(0);
    });

    test('should verify session storage is separate from local storage', async ({ page }) => {
      // Session storage has predefined items
      const sessionName = await page.evaluate(() => sessionStorage.getItem('name'));
      expect(sessionName).toBe('John');

      // Local storage should not have the session item
      const localName = await page.evaluate(() => localStorage.getItem('name'));
      expect(localName).toBeNull();
    });

    test('should get session storage length', async ({ page }) => {
      const length = await page.evaluate(() => sessionStorage.length);
      // Page sets 'name' and 'lastname'
      expect(length).toBeGreaterThanOrEqual(2);
    });

    test('should iterate session storage keys', async ({ page }) => {
      const keys = await page.evaluate(() => {
        const allKeys: string[] = [];
        for (let storageIndex = 0; storageIndex < sessionStorage.length; storageIndex++) {
          const key = sessionStorage.key(storageIndex);
          if (key) allKeys.push(key);
        }
        return allKeys;
      });

      expect(keys).toContain('name');
      expect(keys).toContain('lastname');
    });
  });

  // ─────────────────────────────────────────────────
  //  Cross-page: Index Page Links
  // ─────────────────────────────────────────────────
  test.describe('Index Page - Chapter 4 Links', () => {
    test.beforeEach(async ({ homePage }) => {
      await homePage.actions.goto();
    });

    test('should display the Chapter 4 section heading', async ({ homePage }) => {
      await expect(homePage.locators.chapter4Heading).toBeVisible();
    });

    test('should have all Chapter 4 links', async ({ homePage }) => {
      const chapter4Links = ['Long page', 'Infinite scroll', 'Shadow DOM', 'Cookies', 'IFrames', 'Dialog boxes', 'Web storage'];

      for (const linkText of chapter4Links) {
        await expect.soft(homePage.locators.chapterLink(linkText)).toBeVisible();
      }

      // 'Frames' needs exact match to avoid matching 'IFrames' as well
      await expect.soft(homePage.locators.chapterLink('Frames', { exact: true })).toBeVisible();
    });

    test('should navigate to each Chapter 4 page and back', async ({ homePage, page }) => {
      const chapter4Pages = [
        { name: 'Long page', url: 'long-page.html', heading: 'This is a long page' },
        { name: 'Infinite scroll', url: 'infinite-scroll.html', heading: 'Infinite scroll' },
        { name: 'Shadow DOM', url: 'shadow-dom.html', heading: 'Shadow DOM' },
        { name: 'Cookies', url: 'cookies.html', heading: 'Cookies' },
        { name: 'Frames', url: 'frames.html', heading: '', exact: true },
        { name: 'IFrames', url: 'iframes.html', heading: 'IFrame' },
        { name: 'Dialog boxes', url: 'dialog-boxes.html', heading: 'Dialog boxes' },
        { name: 'Web storage', url: 'web-storage.html', heading: 'Web storage' },
      ];

      for (const pageInfo of chapter4Pages) {
        await homePage.actions.goto();
        const linkOptions: { name: string; exact?: boolean } = { name: pageInfo.name };
        if (pageInfo.exact) linkOptions.exact = true;
        await page.getByRole('link', linkOptions).click();
        await expect(page).toHaveURL(new RegExp(pageInfo.url));

        if (pageInfo.heading) {
          await expect(page.getByRole('heading', { name: pageInfo.heading })).toBeVisible();
        }
      }
    });
  });
});
