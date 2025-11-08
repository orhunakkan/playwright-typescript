// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shadow DOM - Encapsulated Content', () => {
  test('Access Shadow DOM Root', async ({ page }) => {
    // 1. Navigate to shadow DOM page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/shadow-dom.html');

    // 2. Use JavaScript to locate shadow host element
    const shadowHost = page.locator('#content');
    await expect(shadowHost).toBeAttached();

    // 3. Access shadowRoot property and verify shadow root exists
    const shadowRootInfo = await shadowHost.evaluate((el) => {
      if (!el.shadowRoot) return { found: false };
      return {
        found: true,
        hasShadowRoot: true,
        mode: el.shadowRoot.mode,
        content: el.shadowRoot.textContent,
        childrenCount: el.shadowRoot.children.length
      };
    });

    // 4. Verify shadow root exists
    expect(shadowRootInfo.found).toBe(true);
    expect(shadowRootInfo.hasShadowRoot).toBe(true);
    expect(shadowRootInfo.mode).toBe('open');
    expect(shadowRootInfo.content).toContain('Hello Shadow DOM');
    expect(shadowRootInfo.childrenCount).toBeGreaterThan(0);
  });
});
