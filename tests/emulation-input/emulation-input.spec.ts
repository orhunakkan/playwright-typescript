import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';
import { devices } from '@playwright/test';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-18 — Emulation & Input

const URL = '/practice/emulation-input';

// Viewport widths for data-driven responsive layout tests (AC-5)
const viewportCases: { width: number; height: number; label: string; mobile: boolean }[] = [
  { width: 1280, height: 720, label: 'desktop (1280px)', mobile: false },
  { width: 375, height: 667, label: 'mobile (375px)', mobile: true },
  { width: 768, height: 1024, label: 'tablet-wide (768px)', mobile: false },
];

// Scroll delta boundary cases (AC-6)
const scrollCases: { deltaY: number; label: string; expectsButton: boolean }[] = [
  { deltaY: 10, label: 'minimal (10px)', expectsButton: false },
  { deltaY: 500, label: 'sufficient (500px)', expectsButton: true },
];

test.describe('Emulation & Input', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    // Click the non-link heading to give the page focus before dispatching keyboard events
    await page.getByRole('heading', { name: 'Emulation & Input' }).click();
  });

  // AC-1 (TAB1-18): Tests open the command palette using page.keyboard.press("Control+K") and assert it becomes visible
  test.describe('AC-1 — keyboard shortcut opens command palette', () => {
    test('positive: Control+K opens the command palette', async ({ page, emulationInputPage }) => {
      await expect(emulationInputPage.commandPaletteDialog).not.toBeVisible();
      await page.keyboard.press('Control+K');
      await expect(emulationInputPage.commandPaletteDialog).toBeVisible();
    });

    test('negative: command palette is not visible on initial page load', async ({ emulationInputPage }) => {
      await expect(emulationInputPage.commandPaletteDialog).not.toBeVisible();
    });
  });

  // AC-2 (TAB1-18): Tests navigate palette items with arrow keys and confirm a selection with Enter, asserting the correct command name appears in the result area
  test.describe('AC-2 — arrow key navigation and Enter selection', () => {
    test('positive: ArrowDown then Enter selects second command and shows result', async ({ page, emulationInputPage }) => {
      await page.keyboard.press('Control+K');
      await expect(emulationInputPage.commandPaletteDialog).toBeVisible();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      await expect(emulationInputPage.executionResult).toContainText('Executed: Open file');
    });

    // role="status" element is injected into the DOM only after the first command execution
    test('negative: result status element is absent before any command is executed', async ({ page }) => {
      await expect(page.getByRole('status')).toHaveCount(0);
    });

    test('boundary: ArrowUp from first item keeps first item selected', async ({ page, emulationInputPage }) => {
      await page.keyboard.press('Control+K');
      await expect(emulationInputPage.commandPaletteDialog).toBeVisible();
      await expect(emulationInputPage.selectedCommand).toHaveText(/New file/);
      await page.keyboard.press('ArrowUp');
      await expect(emulationInputPage.selectedCommand).toHaveText(/New file/);
    });

    test('boundary: ArrowDown from last item stays on last or wraps without error', async ({ page, emulationInputPage }) => {
      await page.keyboard.press('Control+K');
      // Navigate to last item (Open terminal — 7 ArrowDowns from default first)
      for (let i = 0; i < 7; i++) {
        await page.keyboard.press('ArrowDown');
      }
      await expect(emulationInputPage.selectedCommand).toHaveText(/Open terminal/);
      await page.keyboard.press('ArrowDown');
      // Either stays on last or wraps; assert something is still selected and no error
      await expect(emulationInputPage.selectedCommand).toBeVisible();
    });
  });

  // AC-3 (TAB1-18): Tests dismiss the palette with Escape and assert it is no longer visible
  test.describe('AC-3 — Escape dismisses the command palette', () => {
    test('positive: Escape closes the open palette', async ({ page, emulationInputPage }) => {
      await page.keyboard.press('Control+K');
      await expect(emulationInputPage.commandPaletteDialog).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(emulationInputPage.commandPaletteDialog).not.toBeVisible();
    });

    test('negative: Escape when palette is closed causes no visible error', async ({ page, emulationInputPage }) => {
      await expect(emulationInputPage.commandPaletteDialog).not.toBeVisible();
      await page.keyboard.press('Escape');
      await expect(emulationInputPage.commandPaletteDialog).not.toBeVisible();
    });
  });

  // AC-4 (TAB1-18): Tests trigger the hover tooltip using locator.hover() or page.mouse.move() and assert the tooltip becomes visible
  test.describe('AC-4 — hover tooltip visibility', () => {
    test('positive: hovering the trigger shows the tooltip', async ({ emulationInputPage }) => {
      await expect(emulationInputPage.hoverTooltip).not.toBeVisible();
      await emulationInputPage.hoverTriggerButton.hover();
      await expect(emulationInputPage.hoverTooltip).toBeVisible();
      await expect(emulationInputPage.hoverTooltip).toContainText('You found the tooltip');
    });

    test('negative: tooltip is not visible on initial page load', async ({ emulationInputPage }) => {
      await expect(emulationInputPage.hoverTooltip).not.toBeVisible();
    });

    test('negative: tooltip disappears after moving mouse away', async ({ page, emulationInputPage }) => {
      await emulationInputPage.hoverTriggerButton.hover();
      await expect(emulationInputPage.hoverTooltip).toBeVisible();
      await page.mouse.move(0, 0);
      await expect(emulationInputPage.hoverTooltip).not.toBeVisible();
    });
  });

  // AC-5 (TAB1-18): Tests resize the viewport to a narrow mobile width using page.setViewportSize() and assert the layout switches to the mobile (stacked) state
  test.describe('AC-5 — viewport resize switches responsive layout', () => {
    test('positive: 375px viewport shows mobile (stacked) layout', async ({ page, emulationInputPage }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(emulationInputPage.responsiveCardMobileLabel).toBeVisible();
      await expect(emulationInputPage.responsiveCardDesktopLabel).not.toBeVisible();
    });

    test('negative: desktop viewport (1280px) shows side-by-side layout', async ({ page, emulationInputPage }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await expect(emulationInputPage.responsiveCardDesktopLabel).toBeVisible();
      await expect(emulationInputPage.responsiveCardMobileLabel).not.toBeVisible();
    });

    for (const { width, height, label, mobile } of viewportCases) {
      test(`data-driven: ${label} → ${mobile ? 'mobile (stacked)' : 'desktop (side-by-side)'}`, async ({ page, emulationInputPage }) => {
        await page.setViewportSize({ width, height });
        if (mobile) {
          await expect(emulationInputPage.responsiveCardMobileLabel).toBeVisible();
          await expect(emulationInputPage.responsiveCardDesktopLabel).not.toBeVisible();
        } else {
          await expect(emulationInputPage.responsiveCardDesktopLabel).toBeVisible();
          await expect(emulationInputPage.responsiveCardMobileLabel).not.toBeVisible();
        }
      });
    }
  });

  // AC-6 (TAB1-18): Tests use page.mouse.wheel() to scroll the scrollable container and assert the "Scroll to top" button appears only after scrolling
  test.describe('AC-6 — mouse wheel scroll reveals Scroll to top button', () => {
    test('positive: scrolling the container reveals the Scroll to top button', async ({ page, emulationInputPage }) => {
      await expect(emulationInputPage.scrollToTopButton).not.toBeVisible();
      await emulationInputPage.scrollContainer.scrollIntoViewIfNeeded();
      const box = await emulationInputPage.scrollContainer.boundingBox();
      await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
      await page.mouse.wheel(0, 500);
      await expect(emulationInputPage.scrollToTopButton).toBeVisible();
    });

    test('negative: Scroll to top button is not visible on initial load', async ({ emulationInputPage }) => {
      await expect(emulationInputPage.scrollToTopButton).not.toBeVisible();
    });

    for (const { deltaY, label, expectsButton } of scrollCases) {
      test(`boundary: ${label} scroll — button ${expectsButton ? 'appears' : 'stays hidden'}`, async ({ page, emulationInputPage }) => {
        await emulationInputPage.scrollContainer.scrollIntoViewIfNeeded();
        const box = await emulationInputPage.scrollContainer.boundingBox();
        await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await page.mouse.wheel(0, deltaY);
        if (expectsButton) {
          await expect(emulationInputPage.scrollToTopButton).toBeVisible();
        } else {
          await expect(emulationInputPage.scrollToTopButton).not.toBeVisible();
        }
      });
    }
  });

  // Accessibility — axe-core, all rendered states (load + palette open + tooltip + mobile)
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial page load', async ({ page }) => {
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations while command palette is open', async ({ page }) => {
      await page.keyboard.press('Control+K');
      await page.getByRole('dialog', { name: 'Command palette' }).waitFor({ state: 'visible' });
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations while hover tooltip is visible', async ({ page }) => {
      await page.getByRole('button', { name: 'Hover over me' }).hover();
      await page.locator('#hover-tooltip').waitFor({ state: 'visible' });
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });

    test('no violations in mobile layout (375px viewport)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      const results = await scanWcag(page);
      expect(results.violations).toEqual([]);
    });
  });

  // Performance — initial load budget
  test.describe('performance @performance', () => {
    test('initial load is within budget', async ({ page }) => {
      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
      });
      // Budgets are intentionally generous — tighten in a controlled performance environment.
      expect(timing.domContentLoaded).toBeLessThan(6000);
      expect(timing.load).toBeLessThan(12000);
    });
  });
});

// AC-5 — Gap #10: iPhone 14 device emulation (mobile-specific describe block)
// defaultBrowserType is excluded — it forces a new worker; viewport + userAgent are sufficient here.
// TODO: run framework-scaffolder for gap #10 to enable full mobile gesture coverage
test.describe('AC-5 — iPhone 14 device emulation (Gap #10)', () => {
  test.use({
    viewport: devices['iPhone 14'].viewport,
    userAgent: devices['iPhone 14'].userAgent,
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('positive: iPhone 14 viewport shows mobile (stacked) layout', async ({ emulationInputPage }) => {
    await expect(emulationInputPage.responsiveCardMobileLabel).toBeVisible();
    await expect(emulationInputPage.responsiveCardDesktopLabel).not.toBeVisible();
  });
});
