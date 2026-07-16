import { test, expect } from '../../fixtures/index';
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import type { DomMemoryDiagnosticsPage } from '../../pages/dom-memory-diagnostics.page';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-63 — Memory & DOM Leak Diagnostics

const URL = '/practice/dom-memory-diagnostics';
const SPAWN_COUNT = 50;

const scan = (page: Page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();

// Shared setup (Phase 4b): spawn the fixed 50-toast batch and wait for every toast to auto-dismiss
// into the graveyard. Verified live: all 50 toasts dismiss within ~1.6s of spawning (independent
// per-toast timers, not a sequential 50 * 1.5s queue), so a 10s poll timeout is generous.
async function spawnAndWaitForGraveyard(page: Page, domMemoryDiagnosticsPage: DomMemoryDiagnosticsPage) {
  await domMemoryDiagnosticsPage.spawnToastsButton.click();
  await expect.poll(() => domMemoryDiagnosticsPage.graveyardItems.count(), { timeout: 10_000 }).toBe(SPAWN_COUNT);
}

// Data-driven table (Phase 4b) — idle no-op actions that must never mutate the counters when
// nothing has been spawned yet. Verified live: both are safe no-ops against the idle app state.
const idleNoOpActions = [
  { label: 'calling page.requestGC() while idle', act: (page: Page) => page.requestGC() },
  {
    label: 'clicking "Clear leaked nodes" while idle',
    act: (_page: Page, pom: DomMemoryDiagnosticsPage) => pom.clearLeakedNodesButton.click(),
  },
];

test.describe('Memory & DOM Leak Diagnostics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // AC-1 (TAB1-63): Tests click "Spawn 50 toasts", wait for auto-dismiss (~1.5s each), and assert
  // the graveyard count reaches 50 using expect.poll / locator.count
  test.describe('AC-1 — spawning 50 toasts fills the graveyard after auto-dismiss', () => {
    test('positive: graveyard count and item count both reach 50 once all toasts auto-dismiss', async ({ page, domMemoryDiagnosticsPage }) => {
      await spawnAndWaitForGraveyard(page, domMemoryDiagnosticsPage);
      await expect(domMemoryDiagnosticsPage.graveyardCount).toHaveText('50 retained nodes');
      await expect(domMemoryDiagnosticsPage.graveyardItems).toHaveCount(SPAWN_COUNT);
    });

    test('negative: the graveyard is empty before any toast has been spawned', async ({ domMemoryDiagnosticsPage }) => {
      await expect(domMemoryDiagnosticsPage.graveyardCount).toHaveText('0 retained nodes');
      await expect(domMemoryDiagnosticsPage.graveyardItems).toHaveCount(0);
    });

    test('boundary: the graveyard is still empty immediately after spawn, before the dismiss timer elapses', async ({ domMemoryDiagnosticsPage }) => {
      await domMemoryDiagnosticsPage.spawnToastsButton.click();
      await expect(domMemoryDiagnosticsPage.graveyardCount).toHaveText('0 retained nodes');
    });
  });

  // AC-2 (TAB1-63): Tests call page.requestGC() immediately after the toasts dismiss (before
  // clearing) and assert the graveyard count is unchanged, demonstrating reachable nodes are not
  // collected as garbage
  test.describe('AC-2 — requestGC() cannot release reachable graveyard nodes', () => {
    test('positive: graveyard count is unchanged immediately after requestGC()', async ({ page, domMemoryDiagnosticsPage }) => {
      await spawnAndWaitForGraveyard(page, domMemoryDiagnosticsPage);
      await page.requestGC();
      await expect(domMemoryDiagnosticsPage.graveyardCount).toHaveText('50 retained nodes');
      await expect(domMemoryDiagnosticsPage.graveyardItems).toHaveCount(SPAWN_COUNT);
    });

    test('negative: repeated requestGC() calls still do not reduce the graveyard count', async ({ page, domMemoryDiagnosticsPage }) => {
      await spawnAndWaitForGraveyard(page, domMemoryDiagnosticsPage);
      await page.requestGC();
      await page.requestGC();
      await page.requestGC();
      await expect(domMemoryDiagnosticsPage.graveyardCount).toHaveText('50 retained nodes');
    });
  });

  // AC-3 (TAB1-63): Tests click "Clear leaked nodes" and assert the graveyard count returns to 0,
  // confirming that removing the last reference — not requestGC() — is the actual fix
  test.describe('AC-3 — "Clear leaked nodes" is the actual fix for the retained nodes', () => {
    test('positive: clicking "Clear leaked nodes" returns the graveyard count and item count to 0', async ({ page, domMemoryDiagnosticsPage }) => {
      await spawnAndWaitForGraveyard(page, domMemoryDiagnosticsPage);
      await page.requestGC(); // proves the earlier GC call had no effect before the real fix runs
      await domMemoryDiagnosticsPage.clearLeakedNodesButton.click();
      await expect(domMemoryDiagnosticsPage.graveyardCount).toHaveText('0 retained nodes');
      await expect(domMemoryDiagnosticsPage.graveyardItems).toHaveCount(0);
    });

    for (const { label, act } of idleNoOpActions) {
      test(`negative: ${label} before any spawn leaves both counters at their idle 0 value`, async ({ page, domMemoryDiagnosticsPage }) => {
        await act(page, domMemoryDiagnosticsPage);
        await expect(domMemoryDiagnosticsPage.graveyardCount).toHaveText('0 retained nodes');
        await expect(domMemoryDiagnosticsPage.activeToastCount).toHaveText('0 active');
      });
    }
  });

  // AC-4 (TAB1-63): Tests spawn a new batch and assert the active-toast count matches the spawned
  // count before dismissal, then assert it drops back to 0 after dismissal
  test.describe('AC-4 — active-toast count tracks the full spawn-to-dismiss lifecycle', () => {
    test('positive: active count matches the spawned batch size immediately after spawn, then drops to 0 after dismissal', async ({
      domMemoryDiagnosticsPage,
    }) => {
      await domMemoryDiagnosticsPage.spawnToastsButton.click();
      await expect(domMemoryDiagnosticsPage.activeToastCount).toHaveText(`${SPAWN_COUNT} active`);

      await expect.poll(() => domMemoryDiagnosticsPage.graveyardItems.count(), { timeout: 10_000 }).toBe(SPAWN_COUNT);
      await expect(domMemoryDiagnosticsPage.activeToastCount).toHaveText('0 active');
    });

    test('negative: the active count is 0 before any batch has been spawned', async ({ domMemoryDiagnosticsPage }) => {
      await expect(domMemoryDiagnosticsPage.activeToastCount).toHaveText('0 active');
    });

    test('boundary: at the moment the graveyard reaches its full count, the active count is exactly 0 — the two counters are complementary', async ({
      page,
      domMemoryDiagnosticsPage,
    }) => {
      await spawnAndWaitForGraveyard(page, domMemoryDiagnosticsPage);
      await expect(domMemoryDiagnosticsPage.activeToastCount).toHaveText('0 active');
      await expect(domMemoryDiagnosticsPage.graveyardCount).toHaveText(`${SPAWN_COUNT} retained nodes`);
    });
  });

  // AC-5 (TAB1-63): Tests use page.evaluate(() => document.querySelectorAll("*").length) before
  // and after a repeated mount/unmount cycle to assert no unbounded node growth, as a
  // general-purpose leak check
  test.describe('AC-5 — total DOM node count does not grow unbounded across repeated spawn/dismiss/clear cycles', () => {
    const countAllNodes = (page: Page) => page.evaluate(() => document.querySelectorAll('*').length);

    test('positive: total node count after one full spawn → dismiss → clear cycle matches the pre-cycle baseline', async ({
      page,
      domMemoryDiagnosticsPage,
    }) => {
      // Wait for the SPA to finish hydrating before measuring the baseline — otherwise the count
      // races React's initial render and reads a partially-mounted DOM.
      await domMemoryDiagnosticsPage.graveyardCount.waitFor();
      const baseline = await countAllNodes(page);

      await spawnAndWaitForGraveyard(page, domMemoryDiagnosticsPage);
      await domMemoryDiagnosticsPage.clearLeakedNodesButton.click();
      await expect(domMemoryDiagnosticsPage.graveyardItems).toHaveCount(0);

      const afterOneCycle = await countAllNodes(page);
      expect(afterOneCycle).toBe(baseline);
    });

    test('negative: without clicking "Clear leaked nodes", the retained graveyard nodes keep the node count elevated above baseline', async ({
      page,
      domMemoryDiagnosticsPage,
    }) => {
      // Wait for the SPA to finish hydrating before measuring the baseline — otherwise the count
      // races React's initial render and reads a partially-mounted DOM.
      await domMemoryDiagnosticsPage.graveyardCount.waitFor();
      const baseline = await countAllNodes(page);
      await spawnAndWaitForGraveyard(page, domMemoryDiagnosticsPage);
      const afterDismissNoClear = await countAllNodes(page);
      expect(afterDismissNoClear).toBeGreaterThan(baseline);
    });

    test('boundary: two consecutive full cycles both return to the same baseline — the fix is repeatable, not a one-time coincidence', async ({
      page,
      domMemoryDiagnosticsPage,
    }) => {
      // Wait for the SPA to finish hydrating before measuring the baseline — otherwise the count
      // races React's initial render and reads a partially-mounted DOM.
      await domMemoryDiagnosticsPage.graveyardCount.waitFor();
      const baseline = await countAllNodes(page);

      await spawnAndWaitForGraveyard(page, domMemoryDiagnosticsPage);
      await domMemoryDiagnosticsPage.clearLeakedNodesButton.click();
      await expect(domMemoryDiagnosticsPage.graveyardItems).toHaveCount(0);
      expect(await countAllNodes(page)).toBe(baseline);

      await spawnAndWaitForGraveyard(page, domMemoryDiagnosticsPage);
      await domMemoryDiagnosticsPage.clearLeakedNodesButton.click();
      await expect(domMemoryDiagnosticsPage.graveyardItems).toHaveCount(0);
      expect(await countAllNodes(page)).toBe(baseline);
    });
  });

  // Accessibility — scan load + graveyard-populated + post-clear states (Phase 5)
  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations on initial page load', async ({ page }) => {
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations while the graveyard list is fully populated with 50 retained nodes', async ({ page, domMemoryDiagnosticsPage }) => {
      await spawnAndWaitForGraveyard(page, domMemoryDiagnosticsPage);
      expect((await scan(page)).violations).toEqual([]);
    });

    test('no violations after "Clear leaked nodes" empties the graveyard', async ({ page, domMemoryDiagnosticsPage }) => {
      await spawnAndWaitForGraveyard(page, domMemoryDiagnosticsPage);
      await domMemoryDiagnosticsPage.clearLeakedNodesButton.click();
      await expect(domMemoryDiagnosticsPage.graveyardItems).toHaveCount(0);
      expect((await scan(page)).violations).toEqual([]);
    });
  });
});

// Performance — navigates independently so timing reflects cold initial load, not post-beforeEach
// warm load.
test.describe('performance @performance', () => {
  test('initial load is within budget', async ({ page }) => {
    await page.goto(URL);
    const timing = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return { domContentLoaded: nav.domContentLoadedEventEnd, load: nav.loadEventEnd };
    });
    // Budgets are intentionally generous so they don't flake against a live site.
    expect(timing.domContentLoaded).toBeLessThan(6000);
    expect(timing.load).toBeLessThan(12000);
  });
});
