import { expect, test } from '@playwright/test';

const BASE_URL = process.env.PRACTICE_E2E_URL;

test.describe('Chapter 4 - Browser-Agnostic Features', () => {
  // ─────────────────────────────────────────────────
  //  1. Long Page
  // ─────────────────────────────────────────────────
  test.describe('Long Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/long-page.html`);
      // Content is loaded via jQuery AJAX — wait for it
      await page.locator('#content p').first().waitFor();
    });

    test('should display the long page heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'This is a long page' })).toBeVisible();
    });

    test('should contain multiple paragraphs of Lorem Ipsum text', async ({ page }) => {
      const paragraphs = page.locator('#content p');
      const count = await paragraphs.count();
      expect(count).toBeGreaterThanOrEqual(20);
    });

    test('should have a page height greater than the viewport', async ({ page }) => {
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      const viewportHeight = await page.evaluate(() => window.innerHeight);
      expect(scrollHeight).toBeGreaterThan(viewportHeight);
    });

    test('should scroll to the bottom of the page', async ({ page }) => {
      // Footer should not be in viewport initially
      const footer = page.locator('footer');
      await expect(footer).not.toBeInViewport();

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

      // Footer should now be visible in viewport
      await expect(footer).toBeInViewport();
    });

    test('should scroll to a specific paragraph and verify visibility', async ({ page }) => {
      const lastParagraph = page.locator('#content p').last();
      await expect(lastParagraph).not.toBeInViewport();

      await lastParagraph.scrollIntoViewIfNeeded();
      await expect(lastParagraph).toBeInViewport();
    });

    test('should scroll down and back to the top', async ({ page }) => {
      const heading = page.getByRole('heading', { name: 'This is a long page' });
      await expect(heading).toBeInViewport();

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect(heading).not.toBeInViewport();

      // Scroll back to top
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(heading).toBeInViewport();
    });

    test('should scroll using keyboard (End key)', async ({ page }) => {
      const footer = page.locator('footer');
      await expect(footer).not.toBeInViewport();

      await page.keyboard.press('End');
      await expect(footer).toBeInViewport();
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
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/infinite-scroll.html`);
    });

    test('should display the infinite scroll heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Infinite scroll' })).toBeVisible();
    });

    test('should have initial content loaded', async ({ page }) => {
      // Content is loaded via AJAX — wait for it to appear
      await page.locator('#content p').first().waitFor();
      const paragraphs = page.locator('#content p');
      const initialCount = await paragraphs.count();
      expect(initialCount).toBeGreaterThanOrEqual(1);
    });

    test('should load more content when scrolling to bottom', async ({ page }) => {
      const contentDiv = page.locator('#content');
      const paragraphs = contentDiv.locator('p');

      // Count initial paragraphs
      const initialCount = await paragraphs.count();

      // Scroll to the bottom to trigger infinite scroll
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      // Wait for new content to load via AJAX
      await expect(paragraphs).not.toHaveCount(initialCount);

      const midCount = await paragraphs.count();

      // Scroll again to ensure more content loads
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await expect(paragraphs).not.toHaveCount(midCount);

      // Should have more paragraphs now
      const newCount = await paragraphs.count();
      expect(newCount).toBeGreaterThan(initialCount);
    });

    test('should increase page height after scrolling', async ({ page }) => {
      const initialHeight = await page.evaluate(() => document.documentElement.scrollHeight);

      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForFunction((prevHeight) => document.documentElement.scrollHeight > prevHeight, initialHeight);

      const newHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      expect(newHeight).toBeGreaterThan(initialHeight);
    });

    test('should load content multiple times on successive scrolls', async ({ page }) => {
      const contentDiv = page.locator('#content');
      const paragraphs = contentDiv.locator('p');

      // Scroll multiple times
      for (let scrollAttempt = 0; scrollAttempt < 3; scrollAttempt++) {
        const countBefore = await paragraphs.count();
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await expect(paragraphs).not.toHaveCount(countBefore);
      }

      // Should have significantly more paragraphs
      const finalCount = await paragraphs.count();
      expect(finalCount).toBeGreaterThanOrEqual(40);
    });
  });

  // ─────────────────────────────────────────────────
  //  3. Shadow DOM
  // ─────────────────────────────────────────────────
  test.describe('Shadow DOM', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/shadow-dom.html`);
    });

    test('should display the Shadow DOM heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Shadow DOM' })).toBeVisible();
    });

    test('should access text inside shadow DOM', async ({ page }) => {
      // Playwright automatically pierces open shadow DOMs with getByText
      await expect(page.getByText('Hello Shadow DOM')).toBeVisible();
    });

    test('should locate shadow DOM content via locator', async ({ page }) => {
      // Using the content div that hosts the shadow root
      const shadowContent = page.locator('#content');
      await expect(shadowContent).toBeAttached();

      // Playwright pierces shadow DOM automatically
      const paragraph = page.locator('#content p');
      await expect(paragraph).toHaveText('Hello Shadow DOM');
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
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/cookies.html`);
    });

    test('should display the cookies heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Cookies' })).toBeVisible();
    });

    test('should have "Display cookies" button', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Display cookies' })).toBeVisible();
    });

    test('should display cookies when button is clicked', async ({ page }) => {
      const cookiesDisplay = page.locator('#cookies-list');
      await expect(cookiesDisplay).toHaveText('');

      await page.getByRole('button', { name: 'Display cookies' }).click();

      // Should show cookie text (username and date are set by the page)
      await expect(cookiesDisplay).toContainText('username=John Doe');
      await expect(cookiesDisplay).toContainText('date=10/07/2018');
    });

    test('should read cookies via Playwright context API', async ({ context }) => {
      const cookies = await context.cookies('https://bonigarcia.dev');
      const usernameCookie = cookies.find((cookie) => cookie.name === 'username');
      const dateCookie = cookies.find((cookie) => cookie.name === 'date');

      expect(usernameCookie).toBeDefined();
      expect(usernameCookie?.value).toBe('John Doe');
      expect(dateCookie).toBeDefined();
      expect(dateCookie?.value).toBe('10/07/2018');
    });

    test('should add a new cookie and verify it appears', async ({ page, context }) => {
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
      await page.getByRole('button', { name: 'Display cookies' }).click();

      // Verify the new cookie appears in the list
      const cookiesDisplay = page.locator('#cookies-list');
      await expect(cookiesDisplay).toContainText('test-cookie=playwright-value');
    });

    test('should delete a specific cookie', async ({ page, context }) => {
      // Verify username cookie exists
      let cookies = await context.cookies('https://bonigarcia.dev');
      expect(cookies.find((cookie) => cookie.name === 'username')).toBeDefined();

      // Delete the username cookie
      await context.clearCookies({ name: 'username' });

      // Verify it's gone
      cookies = await context.cookies('https://bonigarcia.dev');
      expect(cookies.find((cookie) => cookie.name === 'username')).toBeUndefined();
    });

    test('should clear all cookies', async ({ page, context }) => {
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

    test('should modify an existing cookie and verify the updated value', async ({ page, context }) => {
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
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/frames.html`);
    });

    test('should load the frameset page', async ({ page }) => {
      await expect(page).toHaveURL(/frames\.html/);
    });

    test('should have three frames', async ({ page }) => {
      // The frameset has 3 frames: header, body, footer
      const frames = page.frames();
      // Main frame + 3 child frames
      expect(frames.length).toBeGreaterThanOrEqual(4);
    });

    test('should access the header frame content', async ({ page }) => {
      const headerFrame = page.frame('frame-header');
      expect(headerFrame).not.toBeNull();

      const heading = headerFrame!.locator('h1.display-6');
      await expect(heading).toHaveText('Frames');
    });

    test('should access the body frame with Lorem Ipsum content', async ({ page }) => {
      const bodyFrame = page.frame('frame-body');
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

    test('should access the footer frame content', async ({ page }) => {
      const footerFrame = page.frame('frame-footer');
      expect(footerFrame).not.toBeNull();

      await expect(footerFrame!.locator('text=Copyright © 2021-2025')).toBeVisible();
      await expect(footerFrame!.getByRole('link', { name: 'Boni García' })).toBeVisible();
    });

    test('should verify frame sources', async ({ page }) => {
      const headerFrame = page.frame('frame-header');
      const bodyFrame = page.frame('frame-body');
      const footerFrame = page.frame('frame-footer');

      expect(headerFrame?.url()).toContain('header.html');
      expect(bodyFrame?.url()).toContain('content.html');
      expect(footerFrame?.url()).toContain('footer.html');
    });

    test('should interact with content across frames', async ({ page }) => {
      // Verify heading in header frame
      const headerFrame = page.frame('frame-header');
      const heading = headerFrame!.locator('h1.display-4');
      await expect(heading).toContainText('Hands-On Selenium WebDriver with Java');

      // Verify footer link
      const footerFrame = page.frame('frame-footer');
      const link = footerFrame!.getByRole('link', { name: 'Boni García' });
      await expect(link).toHaveAttribute('href', 'https://bonigarcia.dev/');
    });
  });

  // ─────────────────────────────────────────────────
  //  6. IFrames
  // ─────────────────────────────────────────────────
  test.describe('IFrames', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/iframes.html`);
    });

    test('should display the IFrame heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'IFrame' })).toBeVisible();
    });

    test('should have an iframe element on the page', async ({ page }) => {
      const iframe = page.locator('#my-iframe');
      await expect(iframe).toBeAttached();
      await expect(iframe).toHaveAttribute('src', 'content.html');
    });

    test('should access iframe content using frameLocator', async ({ page }) => {
      const iframeContent = page.frameLocator('#my-iframe');
      const firstParagraph = iframeContent.locator('p').first();
      await expect(firstParagraph).toContainText('Lorem ipsum');
    });

    test('should count paragraphs inside the iframe', async ({ page }) => {
      const iframeContent = page.frameLocator('#my-iframe');
      // Wait for iframe content to load
      await iframeContent.locator('p').first().waitFor();
      const paragraphs = iframeContent.locator('p');
      const count = await paragraphs.count();
      expect(count).toBeGreaterThanOrEqual(10);
    });

    test('should access specific paragraphs inside the iframe', async ({ page }) => {
      const iframeContent = page.frameLocator('#my-iframe');

      // First paragraph starts with Lorem ipsum
      const firstParagraph = iframeContent.locator('p').first();
      await expect(firstParagraph).toContainText('Lorem ipsum dolor sit amet');

      // Last paragraph should also contain text
      const lastParagraph = iframeContent.locator('p').last();
      const text = await lastParagraph.textContent();
      expect(text!.length).toBeGreaterThan(0);
    });

    test('should verify iframe dimensions via attribute', async ({ page }) => {
      const iframe = page.locator('#my-iframe');
      // The iframe should be rendered with visible dimensions
      const box = await iframe.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    });

    test('should access iframe via frame() method', async ({ page }) => {
      // Wait for iframe to load, then access via frame()
      await page.locator('#my-iframe').waitFor();
      const contentFrame = page.frame({ url: /content/ });
      expect(contentFrame).toBeDefined();

      // Wait for the frame content to fully render
      await contentFrame!.waitForLoadState('domcontentloaded');
      await contentFrame!.locator('p').first().waitFor();

      const paragraphs = contentFrame!.locator('p');
      const count = await paragraphs.count();
      expect(count).toBeGreaterThanOrEqual(10);
    });

    test('should distinguish between main page and iframe content', async ({ page }) => {
      // Main page heading should be visible
      await expect(page.getByRole('heading', { name: 'IFrame' })).toBeVisible();

      // Main page should NOT have Lorem ipsum directly (only in iframe)
      const mainParagraphs = page.locator('main > .container > .row p');
      const count = await mainParagraphs.count();
      expect(count).toBe(0);

      // But iframe should have Lorem ipsum content
      const iframeContent = page.frameLocator('#my-iframe');
      await expect(iframeContent.locator('p').first()).toContainText('Lorem ipsum');
    });
  });

  // ─────────────────────────────────────────────────
  //  7. Dialog Boxes
  // ─────────────────────────────────────────────────
  test.describe('Dialog Boxes', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/dialog-boxes.html`);
    });

    test('should display the dialog boxes heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Dialog boxes' })).toBeVisible();
    });

    test('should have all dialog trigger buttons', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Launch alert' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Launch confirm' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Launch prompt' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Launch modal' })).toBeVisible();
    });

    // --- Alert Dialog ---
    test('should handle alert dialog and accept it', async ({ page }) => {
      // Register dialog handler BEFORE the click so the dialog is handled inline
      let dialogType = '';
      let dialogMessage = '';
      page.once('dialog', async (dialog) => {
        dialogType = dialog.type();
        dialogMessage = dialog.message();
        await dialog.accept();
      });

      await page.getByRole('button', { name: 'Launch alert' }).click();

      expect(dialogType).toBe('alert');
      expect(dialogMessage).toBe('Hello world!');
    });

    // --- Confirm Dialog ---
    test('should handle confirm dialog - accept', async ({ page }) => {
      let dialogType = '';
      let dialogMessage = '';
      page.once('dialog', async (dialog) => {
        dialogType = dialog.type();
        dialogMessage = dialog.message();
        await dialog.accept();
      });

      await page.getByRole('button', { name: 'Launch confirm' }).click();

      expect(dialogType).toBe('confirm');
      expect(dialogMessage).toBe('Is this correct?');

      // Verify confirmation text
      await expect(page.locator('#confirm-text')).toHaveText('You chose: true');
    });

    test('should handle confirm dialog - dismiss', async ({ page }) => {
      let dialogType = '';
      page.once('dialog', async (dialog) => {
        dialogType = dialog.type();
        await dialog.dismiss();
      });

      await page.getByRole('button', { name: 'Launch confirm' }).click();

      expect(dialogType).toBe('confirm');

      // Verify dismiss text
      await expect(page.locator('#confirm-text')).toHaveText('You chose: false');
    });

    // --- Prompt Dialog ---
    test('should handle prompt dialog with text input', async ({ page }) => {
      let dialogType = '';
      let dialogMessage = '';
      page.once('dialog', async (dialog) => {
        dialogType = dialog.type();
        dialogMessage = dialog.message();
        await dialog.accept('Playwright User');
      });

      await page.getByRole('button', { name: 'Launch prompt' }).click();

      expect(dialogType).toBe('prompt');
      expect(dialogMessage).toBe('Please enter your name');

      // Verify prompt result text
      await expect(page.locator('#prompt-text')).toHaveText('You typed: Playwright User');
    });

    test('should handle prompt dialog - dismiss (cancel)', async ({ page }) => {
      page.once('dialog', async (dialog) => {
        await dialog.dismiss();
      });

      await page.getByRole('button', { name: 'Launch prompt' }).click();

      // When dismissed, prompt returns null
      await expect(page.locator('#prompt-text')).toHaveText('You typed: null');
    });

    test('should handle prompt dialog with empty input', async ({ page }) => {
      page.once('dialog', async (dialog) => {
        await dialog.accept('');
      });

      await page.getByRole('button', { name: 'Launch prompt' }).click();

      // Empty string accepted
      await expect(page.locator('#prompt-text')).toHaveText('You typed: ');
    });

    // --- Modal Dialog ---
    test('should open modal and verify its content', async ({ page }) => {
      await page.getByRole('button', { name: 'Launch modal' }).click();

      // Verify modal elements are visible
      const modal = page.locator('#example-modal');
      await expect(modal).toBeVisible();
      await expect(page.getByText('Modal title')).toBeVisible();
      await expect(page.getByText('This is the modal body')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Close' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Save changes' })).toBeVisible();
    });

    test('should close modal by clicking Close button', async ({ page }) => {
      await page.getByRole('button', { name: 'Launch modal' }).click();

      const modal = page.locator('#example-modal');
      await expect(modal).toBeVisible();

      await page.getByRole('button', { name: 'Close' }).click();

      // Modal should be hidden after closing
      await expect(modal).toBeHidden();

      // Verify the result text
      await expect(page.locator('#modal-text')).toHaveText('You chose: Close');
    });

    test('should close modal by clicking Save changes button', async ({ page }) => {
      await page.getByRole('button', { name: 'Launch modal' }).click();

      const modal = page.locator('#example-modal');
      await expect(modal).toBeVisible();

      await page.getByRole('button', { name: 'Save changes' }).click();

      await expect(modal).toBeHidden();

      // Verify the result text
      await expect(page.locator('#modal-text')).toHaveText('You chose: Save changes');
    });

    test('should verify modal title element', async ({ page }) => {
      await page.getByRole('button', { name: 'Launch modal' }).click();

      const modalTitle = page.locator('#exampleModalLabel');
      await expect(modalTitle).toBeVisible();
      await expect(modalTitle).toHaveText('Modal title');
    });

    test('should verify prompt dialog has empty default value', async ({ page }) => {
      let defaultValue = 'NOT_SET';
      page.once('dialog', async (dialog) => {
        defaultValue = dialog.defaultValue();
        await dialog.accept();
      });

      await page.getByRole('button', { name: 'Launch prompt' }).click();

      expect(defaultValue).toBe('');
    });

    test('should close modal by pressing Escape key', async ({ page }) => {
      // Set up a listener for the 'shown.bs.modal' event BEFORE opening
      await page.evaluate(() => {
        const el = document.getElementById('example-modal')!;
        (window as any).__modalShown = false;
        el.addEventListener('shown.bs.modal', () => {
          (window as any).__modalShown = true;
        });
      });

      await page.getByRole('button', { name: 'Launch modal' }).click();

      // Wait until Bootstrap's shown event fires (transition complete)
      await page.waitForFunction(() => (window as any).__modalShown === true);

      const modal = page.locator('#example-modal');
      await expect(modal).toBeVisible();

      // Press Escape to dismiss the modal
      await page.keyboard.press('Escape');

      await expect(modal).toBeHidden();
    });
  });

  // ─────────────────────────────────────────────────
  //  8. Web Storage
  // ─────────────────────────────────────────────────
  test.describe('Web Storage', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/web-storage.html`);
    });

    test('should display the web storage heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Web storage' })).toBeVisible();
    });

    test('should have display buttons for both storage types', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Display local storage' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Display session storage' })).toBeVisible();
    });

    // --- Session Storage ---
    test('should display session storage values', async ({ page }) => {
      await page.getByRole('button', { name: 'Display session storage' }).click();

      const sessionDisplay = page.locator('#session-storage');
      await expect(sessionDisplay).toContainText('John');
      await expect(sessionDisplay).toContainText('Doe');
    });

    test('should read session storage via Playwright evaluate', async ({ page }) => {
      const sessionName = await page.evaluate(() => sessionStorage.getItem('name'));
      const sessionLastname = await page.evaluate(() => sessionStorage.getItem('lastname'));

      expect(sessionName).toBe('John');
      expect(sessionLastname).toBe('Doe');
    });

    test('should set and read session storage items', async ({ page }) => {
      // Set a new item
      await page.evaluate(() => sessionStorage.setItem('role', 'tester'));

      // Read it back
      const role = await page.evaluate(() => sessionStorage.getItem('role'));
      expect(role).toBe('tester');

      // Display and verify
      await page.getByRole('button', { name: 'Display session storage' }).click();
      const sessionDisplay = page.locator('#session-storage');
      await expect(sessionDisplay).toContainText('tester');
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

    test('should clear all session storage', async ({ page }) => {
      // Verify items exist
      let length = await page.evaluate(() => sessionStorage.length);
      expect(length).toBeGreaterThan(0);

      // Clear all
      await page.evaluate(() => sessionStorage.clear());

      // Verify empty
      length = await page.evaluate(() => sessionStorage.length);
      expect(length).toBe(0);

      // Verify display shows empty object
      await page.getByRole('button', { name: 'Display session storage' }).click();
      const sessionDisplay = page.locator('#session-storage');
      await expect(sessionDisplay).toContainText('{}');
    });

    // --- Local Storage ---
    test('should set and read local storage items', async ({ page }) => {
      // Set an item in local storage
      await page.evaluate(() => localStorage.setItem('framework', 'playwright'));

      // Read it back
      const value = await page.evaluate(() => localStorage.getItem('framework'));
      expect(value).toBe('playwright');

      // Display and verify
      await page.getByRole('button', { name: 'Display local storage' }).click();
      const localDisplay = page.locator('#local-storage');
      await expect(localDisplay).toContainText('playwright');
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
    test.beforeEach(async ({ page }) => {
      await page.goto(`${BASE_URL}/index.html`);
    });

    test('should display the Chapter 4 section heading', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Chapter 4. Browser-Agnostic Features' })).toBeVisible();
    });

    test('should have all Chapter 4 links', async ({ page }) => {
      const chapter4Links = ['Long page', 'Infinite scroll', 'Shadow DOM', 'Cookies', 'IFrames', 'Dialog boxes', 'Web storage'];

      for (const linkText of chapter4Links) {
        await expect(page.getByRole('link', { name: linkText })).toBeVisible();
      }

      // 'Frames' needs exact match to avoid matching 'IFrames' as well
      await expect(page.getByRole('link', { name: 'Frames', exact: true })).toBeVisible();
    });

    test('should navigate to each Chapter 4 page and back', async ({ page }) => {
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
        await page.goto(`${BASE_URL}/index.html`);
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
