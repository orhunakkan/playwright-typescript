import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MD_FILE = path.resolve('playwright-docs-sidebar-links.md');

/**
 * Parses playwright-docs-sidebar-links.md and returns a Map of
 * sourcePage URL → array of sidebar URLs stored for that page.
 */
function parseMarkdownLinks(): Map<string, string[]> {
  const content = fs.readFileSync(MD_FILE, 'utf-8');
  const groups = new Map<string, string[]>();
  let current = '';

  for (const line of content.split('\n')) {
    const sourceMatch = line.match(/^## `(https:\/\/[^`]+)`/);
    if (sourceMatch) {
      current = sourceMatch[1];
      groups.set(current, []);
    } else if (line.startsWith('- https://') && current) {
      groups.get(current)!.push(line.slice(2).trim());
    }
  }
  return groups;
}

/** Converts a URL into a safe filesystem slug for snapshot file names. */
function urlToSlug(url: string): string {
  return url
    .replace(/https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Parsed once at module level so dynamic test titles are available at collection time.
const storedLinks = parseMarkdownLinks();
const allStoredUrls = [...new Set([...storedLinks.values()].flat())];

// ─── Tests ────────────────────────────────────────────────────────────────────

// Full-screen viewport + maximized window — launchOptions must be file-level.
// viewport: null conflicts with the deviceScaleFactor set by the Desktop Chrome device profile,
// so we use an explicit 1920x1080 viewport instead.
test.use({ viewport: { width: 1920, height: 1080 }, launchOptions: { args: ['--start-maximized'] } });

test.describe('Playwright Docs Link Monitoring', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'Only runs on Desktop Chrome');
  });

  // ────────────────────────────────────────────────────────────────────────────
  //  1. Sidebar URL Drift
  //
  //  For each of the 4 source pages, navigates to the live page and reads
  //  every link from the "Docs sidebar" ARIA region. Soft-asserts that the
  //  live set exactly matches the baseline in playwright-docs-sidebar-links.md.
  //
  //  Failures mean:
  //    • "URLs added"   → a new link appeared; add it to the MD file.
  //    • "URLs removed" → an existing link was taken down; remove it from the MD file.
  // ────────────────────────────────────────────────────────────────────────────
  test.describe('Sidebar URL Drift', { tag: ['@regression'] }, () => {
    for (const [sourcePage, storedUrls] of storedLinks) {
      test(`sidebar links match baseline — ${sourcePage}`, async ({ page }) => {
        test.setTimeout(60_000);

        await page.goto(sourcePage, { waitUntil: 'load' });
        await page.getByLabel('Docs sidebar').waitFor({ state: 'visible' });

        // Expand all collapsed accordion sections so hidden links are included
        for (const btn of await page.getByLabel('Docs sidebar').getByRole('button').all()) {
          if ((await btn.getAttribute('aria-expanded')) !== 'true') {
            await btn.click();
            await page.waitForTimeout(300);
          }
        }

        const liveUrls: string[] = await page
          .getByLabel('Docs sidebar')
          .getByRole('link')
          .evaluateAll((links: Element[]) => (links as HTMLAnchorElement[]).map((a) => a.href));

        const normalize = (u: string) => u.replace(/\/$/, '').toLowerCase();
        const storedSet = storedUrls.map(normalize);
        const liveSet = liveUrls.map(normalize);

        const added = liveSet.filter((u) => !storedSet.includes(u));
        const removed = storedSet.filter((u) => !liveSet.includes(u));

        expect.soft(added, `URLs added to sidebar — add to playwright-docs-sidebar-links.md:\n  ${added.join('\n  ')}`).toHaveLength(0);

        expect.soft(removed, `URLs removed from sidebar — remove from playwright-docs-sidebar-links.md:\n  ${removed.join('\n  ')}`).toHaveLength(0);
      });
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  //  2. Page Content Snapshots
  //
  //  Visits every URL in the baseline and snapshots the text content of the
  //  <article> element (the main documentation body). On the first run,
  //  baseline .txt files are created automatically. On subsequent runs, any
  //  text change in the article body triggers a soft-assertion failure.
  //
  //  To accept intentional changes: npx playwright test --update-snapshots
  //
  //  Runs on Chromium only to avoid duplicate baselines per browser
  //  (content is identical across browsers for this static doc site).
  // ────────────────────────────────────────────────────────────────────────────
  test.describe('Page Content Snapshots', { tag: ['@regression'] }, () => {
    test.setTimeout(60_000);

    for (const url of allStoredUrls) {
      test(`content unchanged — ${urlToSlug(url)}`, async ({ page }) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const mainArticle = page.locator('article:not(.yt-lite)');
        await mainArticle.waitFor({ state: 'visible' });
        const raw = (await mainArticle.textContent()) ?? '';
        const normalized = raw.replace(/\s+/g, ' ').trim();

        expect.soft(normalized).toMatchSnapshot(`${urlToSlug(url)}.txt`);
      });
    }
  });
});
