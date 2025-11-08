// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Shadow DOM - Encapsulated Content', () => {
  test('Interact with Shadow DOM Content', async ({ page }) => {
    // 1. Navigate to shadow DOM page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/shadow-dom.html');

    // 2. Access shadow root
    const shadowHost = page.locator('#content');
    await expect(shadowHost).toBeAttached();

    // 3. Locate interactive elements within shadow DOM (if any)
    const interactiveCheck = await shadowHost.evaluate((el) => {
      if (!el.shadowRoot) return { found: false };
      const shadowRoot = el.shadowRoot;
      const allElements = shadowRoot.querySelectorAll('*');
      const interactiveElements = [];
      allElements.forEach(elem => {
        if (elem.tagName === 'BUTTON' || elem.tagName === 'INPUT' || elem.tagName === 'A' || elem.tagName === 'SELECT') {
          interactiveElements.push({
            tag: elem.tagName,
            text: elem.textContent || elem.value || ''
          });
        }
      });
      return {
        found: true,
        totalElements: allElements.length,
        interactiveElements: interactiveElements,
        hasInteractiveElements: interactiveElements.length > 0
      };
    });

    expect(interactiveCheck.found).toBe(true);
    
    // 4. Verify we can access elements and their properties within shadow DOM
    const elementAccess = await shadowHost.evaluate((el) => {
      if (!el.shadowRoot) return { found: false };
      const shadowRoot = el.shadowRoot;
      const paragraph = shadowRoot.querySelector('p');
      if (!paragraph) return { found: false };
      return {
        found: true,
        elementText: paragraph.textContent,
        elementTag: paragraph.tagName,
        canAccessElement: true
      };
    });

    // Shadow DOM behaves as regular DOM for interactions
    expect(elementAccess.found).toBe(true);
    expect(elementAccess.canAccessElement).toBe(true);
    expect(elementAccess.elementText).toBe('Hello Shadow DOM');
    expect(elementAccess.elementTag).toBe('P');
  });
});
