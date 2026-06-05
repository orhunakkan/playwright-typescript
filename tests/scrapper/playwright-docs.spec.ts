import { test, expect } from '@playwright/test';
import fs from 'fs';
import sidebarLinks from '../../fixtures/playwright-docs-links/sidebar-links.json' with { type: 'json' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts a URL into a safe filesystem slug for snapshot file names. */
function urlToSlug(url: string): string {
  return url
    .replace(/https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Produces a readable sentence-level diff between two normalized text strings. */
function computeTextDiff(before: string, after: string): string {
  const split = (t: string) => t.split(/(?<=[.!?])\s+/).filter(Boolean);
  const beforeParts = split(before);
  const afterParts = split(after);
  const beforeSet = new Set(beforeParts);
  const afterSet = new Set(afterParts);
  const removed = beforeParts.filter((s) => !afterSet.has(s));
  const added = afterParts.filter((s) => !beforeSet.has(s));
  const lines: string[] = [
    `Baseline sentences: ${beforeParts.length}`,
    `Live sentences:     ${afterParts.length}`,
    '',
  ];
  if (removed.length) lines.push('━━━ REMOVED ━━━', ...removed.map((s) => `- ${s}`), '');
  if (added.length) lines.push('━━━ ADDED ━━━', ...added.map((s) => `+ ${s}`));
  return lines.join('\n');
}

type SidebarLinksFixture = string[] | Record<string, string[]>;

function getStoredUrls(links: SidebarLinksFixture): string[] {
  const urls = Array.isArray(links) ? links : Object.values(links).flat();
  return [...new Set(urls)];
}

// Parsed once at module level so dynamic test titles are available at collection time.
const allStoredUrls = getStoredUrls(sidebarLinks);

// ─── Tests ────────────────────────────────────────────────────────────────────

test.describe('Playwright Docs Snapshots', () => {
  // 15-second gap between tests; skipped tests (non-Chrome) bypass the delay.
  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === 'skipped') return;
    await new Promise((resolve) => setTimeout(resolve, 15_000));
  });

  /*
   Page Content Snapshots

   Visits every URL in the baseline and snapshots the text content of the
   <article> element (the main documentation body). On the first run,
   baseline .txt files are created automatically. On subsequent runs, any
   text change in the article body triggers a soft-assertion failure.

   To accept intentional changes: npx playwright test --update-snapshots

   Runs on Chromium only to avoid duplicate baselines per browser
   (content is identical across browsers for this static doc site).
  */
  test.describe('Page Content Snapshots', () => {
    test.beforeEach(({}, testInfo) => {
      test.skip(testInfo.project.name !== 'Desktop Chrome', 'Only runs on Desktop Chrome');
    });

    for (const url of allStoredUrls) {
      test(`content unchanged — ${urlToSlug(url)}`, async ({ page }, testInfo) => {
        const slug = urlToSlug(url);

        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const mainArticle = page.locator('article:not(.yt-lite)');
        await mainArticle.waitFor({ state: 'visible' });
        const raw = (await mainArticle.textContent()) ?? '';
        const normalized = raw.replace(/\s+/g, ' ').trim();

        const snapshotPath = testInfo.snapshotPath(`${slug}.txt`);
        if (fs.existsSync(snapshotPath)) {
          const baseline = fs.readFileSync(snapshotPath, 'utf-8').trim();
          if (baseline !== normalized) {
            const diff = computeTextDiff(baseline, normalized);
            await testInfo.attach('content-diff.txt', { body: diff, contentType: 'text/plain' });
          }
        }

        expect.soft(normalized).toMatchSnapshot(`${slug}.txt`);
      });
    }
  });
});
