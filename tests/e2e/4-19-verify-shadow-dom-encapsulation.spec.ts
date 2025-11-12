// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shadow DOM - Encapsulated Content', () => {
  test('Verify Shadow DOM Encapsulation', async ({ page }) => {
    // 1. Navigate to shadow DOM page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/shadow-dom.html');

    // 2. Attempt to query shadow DOM content directly from document
    const directQuery = await page.evaluate(() => {
      const paragraph = document.querySelector('p');
      return {
        directQuerySucceeded: !!paragraph,
        result: paragraph ? 'found' : 'null',
      };
    });

    // 3. Verify query returns null/empty - Shadow DOM provides proper encapsulation
    expect(directQuery.directQuerySucceeded).toBe(false);
    expect(directQuery.result).toBe('null');

    // 4. Access via shadow root and verify success
    const shadowHost = page.locator('#content');
    const shadowQuery = await shadowHost.evaluate(el => {
      if (!el.shadowRoot) return { success: false };
      const paragraph = el.shadowRoot.querySelector('p');
      return {
        success: true,
        found: !!paragraph,
        text: paragraph ? paragraph.textContent : null,
      };
    });

    // Only queries through shadowRoot can access shadow content
    expect(shadowQuery.success).toBe(true);
    expect(shadowQuery.found).toBe(true);
    expect(shadowQuery.text).toBe('Hello Shadow DOM');
  });
});
