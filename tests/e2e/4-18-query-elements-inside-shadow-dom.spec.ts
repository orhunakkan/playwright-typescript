// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shadow DOM - Encapsulated Content', () => {
  test('Query Elements Inside Shadow DOM', async ({ page }) => {
    // 1. Navigate to shadow DOM page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/shadow-dom.html');

    // 2. Access shadow root
    const shadowHost = page.locator('#content');
    await expect(shadowHost).toBeAttached();

    // 3. Query for elements within shadow DOM
    const shadowContent = await shadowHost.evaluate(el => {
      if (!el.shadowRoot) return { found: false };
      const shadowRoot = el.shadowRoot;
      const paragraph = shadowRoot.querySelector('p');
      return {
        found: true,
        elementFound: !!paragraph,
        text: paragraph ? paragraph.textContent : null,
        tagName: paragraph ? paragraph.tagName : null,
      };
    });

    // 4. Verify content can be retrieved
    expect(shadowContent.found).toBe(true);
    expect(shadowContent.elementFound).toBe(true);
    expect(shadowContent.text).toBe('Hello Shadow DOM');
    expect(shadowContent.tagName).toBe('P');

    // Verify shadow DOM elements are isolated from main DOM
    const directQuery = await page.evaluate(() => {
      const paragraph = document.querySelector('p');
      return !!paragraph;
    });
    expect(directQuery).toBe(false);
  });
});
