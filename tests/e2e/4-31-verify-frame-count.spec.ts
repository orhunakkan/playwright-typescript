// spec: tests/e2e/chapter4-browser-agnostic-features-test-plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Frames - HTML Frameset', () => {
  test('Verify Frame Count', async ({ page }) => {
    // 1. Navigate to frames page
    await page.goto('https://bonigarcia.dev/selenium-webdriver-java/frames.html');

    // 2. Count frames and verify each frame has distinct name or id
    const frameInfo = await page.evaluate(() => {
      const frames = document.querySelectorAll('frame');
      const frameDetails = Array.from(frames).map((frame, index) => ({
        index,
        name: frame.name || frame.id || null,
        src: frame.src,
      }));

      return {
        frameCount: window.frames.length,
        framesetExists: document.querySelector('frameset') !== null,
        frameDetails,
      };
    });

    // Verify page contains exactly 3 frames
    expect(frameInfo.frameCount).toBe(3);

    // Verify frameset element exists in HTML structure
    expect(frameInfo.framesetExists).toBe(true);

    // Verify each frame has a distinct name or id
    expect(frameInfo.frameDetails).toHaveLength(3);
    expect(frameInfo.frameDetails[0].name).toBe('frame-header');
    expect(frameInfo.frameDetails[1].name).toBe('frame-body');
    expect(frameInfo.frameDetails[2].name).toBe('frame-footer');

    // Verify frames are properly loaded with src attributes
    expect(frameInfo.frameDetails[0].src).toContain('header.html');
    expect(frameInfo.frameDetails[1].src).toContain('content.html');
    expect(frameInfo.frameDetails[2].src).toContain('footer.html');
  });
});
