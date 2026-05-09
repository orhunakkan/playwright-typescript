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
  const lines: string[] = [`Baseline sentences: ${beforeParts.length}`, `Live sentences:     ${afterParts.length}`, ''];
  if (removed.length) lines.push('━━━ REMOVED ━━━', ...removed.map((s) => `- ${s}`), '');
  if (added.length) lines.push('━━━ ADDED ━━━', ...added.map((s) => `+ ${s}`));
  return lines.join('\n');
}

// Parsed once at module level so dynamic test titles are available at collection time.
const storedLinks = new Map<string, string[]>(Object.entries(sidebarLinks));
const allStoredUrls = [...new Set(Object.values(sidebarLinks).flat())];

// ─── Failure Report ───────────────────────────────────────────────────────────

interface FailureRecord {
  testName: string;
  url: string;
  expected: string;
  actual: string;
}
const failureRecords: FailureRecord[] = [];

// ─── Tests ────────────────────────────────────────────────────────────────────

// Wide viewport so the sidebar is fully visible in headed mode.
test.use({ viewport: { width: 1920, height: 1080 }, launchOptions: { args: ['--window-size=1920,1080'] } });

test.describe('Playwright Docs Link Monitoring', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'Only runs on Desktop Chrome');
  });

  // 15-second gap between tests; skipped tests (non-Chrome) bypass the delay.
  test.afterEach(async ({}, testInfo) => {
    if (testInfo.status === 'skipped') return;
    await new Promise((resolve) => setTimeout(resolve, 15_000));
  });

  // Write PW-DOCS-CHECK.md at the project root for any failed tests.
  test.afterAll(async () => {
    if (failureRecords.length === 0) return;

    const escape = (s: string) => s.replace(/\|/g, '\\|');
    const rows = failureRecords.map((r, i) => `| ${i + 1} | ${escape(r.testName)} | ${escape(r.url)} | ${escape(r.expected)} | ${escape(r.actual)} |`);
    const content = [
      '# PW-DOCS-CHECK',
      '',
      `Generated: ${new Date().toISOString()}`,
      `Failed tests: ${failureRecords.length}`,
      '',
      '| # | Test Name | URL | Expected | Actual |',
      '|---|-----------|-----|----------|--------|',
      ...rows,
      '',
    ].join('\n');

    fs.writeFileSync('PW-DOCS-CHECK.md', content, 'utf-8');
  });

  // ────────────────────────────────────────────────────────────────────────────
  //  1. Sidebar URL Drift
  //
  //  For each of the 4 source pages, navigates to the live page and reads
  //  every link from the "Docs sidebar" ARIA region. Soft-asserts that the
  //  live set exactly matches the baseline in sidebar-links.json.
  //
  //  Failures mean:
  //    • "URLs added"   → a new link appeared; add it to sidebar-links.json.
  //    • "URLs removed" → an existing link was taken down; remove it from sidebar-links.json.
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

        if (added.length > 0 || removed.length > 0) {
          failureRecords.push({
            testName: `sidebar links match baseline — ${sourcePage}`,
            url: sourcePage,
            expected: '0 URL changes',
            actual: [added.length ? `Added (${added.length}): ${added.join(', ')}` : '', removed.length ? `Removed (${removed.length}): ${removed.join(', ')}` : ''].filter(Boolean).join(' | '),
          });
        }

        expect.soft(added, `URLs added to sidebar — add to sidebar-links.json:\n  ${added.join('\n  ')}`).toHaveLength(0);

        expect.soft(removed, `URLs removed from sidebar — remove from sidebar-links.json:\n  ${removed.join('\n  ')}`).toHaveLength(0);
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
      test(`content unchanged — ${urlToSlug(url)}`, async ({ page }, testInfo) => {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const mainArticle = page.locator('article:not(.yt-lite)');
        await mainArticle.waitFor({ state: 'visible' });
        const raw = (await mainArticle.textContent()) ?? '';
        const normalized = raw.replace(/\s+/g, ' ').trim();

        const snapshotPath = testInfo.snapshotPath(`${urlToSlug(url)}.txt`);
        if (fs.existsSync(snapshotPath)) {
          const baseline = fs.readFileSync(snapshotPath, 'utf-8').trim();
          if (baseline !== normalized) {
            const diff = computeTextDiff(baseline, normalized);
            await testInfo.attach('content-diff.txt', { body: diff, contentType: 'text/plain' });
            const diffSummary = diff.split('\n').slice(0, 2).join(' | ');
            failureRecords.push({
              testName: `content unchanged — ${urlToSlug(url)}`,
              url,
              expected: 'Content matches baseline',
              actual: diffSummary,
            });
          }
        }

        expect.soft(normalized).toMatchSnapshot(`${urlToSlug(url)}.txt`);
      });
    }
  });
});
