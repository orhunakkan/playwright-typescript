import { type Locator, type Page, test, expect } from '@playwright/test';
import fs from 'fs';
import sidebarLinks from '../../fixtures/typescript-docs-links/sidebar-links.json' with { type: 'json' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converts a URL into a safe filesystem slug for snapshot file names. */
function urlToSlug(url: string): string {
  return url
    .replace(/https?:\/\//, '')
    .replace(/\*/g, '-star')
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

async function gotoWithRetry(
  page: Page,
  url: string,
  waitUntil: 'load' | 'domcontentloaded',
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(url, { waitUntil, timeout: 45_000 });
      return;
    } catch (error) {
      lastError = error;
      if (attempt < 3) await page.waitForTimeout(attempt * 1_000);
    }
  }

  throw lastError;
}

async function firstVisibleLocator(locators: Locator[]): Promise<Locator> {
  for (const locator of locators) {
    if ((await locator.count()) === 0) continue;
    const first = locator.first();
    if (await first.isVisible()) return first;
  }

  throw new Error('No visible TypeScript docs content locator found');
}

// Parsed once at module level so dynamic test titles are available at collection time.
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

// Wide viewport so the TypeScript site renders the full docs sidebar.
test.use({
  viewport: { width: 1920, height: 1080 },
  launchOptions: { args: ['--window-size=1920,1080'] },
});

test.describe('TypeScript Docs Link Monitoring', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'Desktop Chrome', 'Only runs on Desktop Chrome');
  });

  test.afterAll(async () => {
    if (failureRecords.length === 0) return;

    const escape = (s: string) => s.replace(/\|/g, '\\|');
    const rows = failureRecords.map(
      (r, i) =>
        `| ${i + 1} | ${escape(r.testName)} | ${escape(r.url)} | ${escape(r.expected)} | ${escape(r.actual)} |`,
    );
    const content = [
      '# TS-DOCS-CHECK',
      '',
      `Generated: ${new Date().toISOString()}`,
      `Failed tests: ${failureRecords.length}`,
      '',
      '| # | Test Name | URL | Expected | Actual |',
      '|---|-----------|-----|----------|--------|',
      ...rows,
      '',
    ].join('\n');

    fs.writeFileSync('TS-DOCS-CHECK.md', content, 'utf-8');
  });

  // ────────────────────────────────────────────────────────────────────────────
  //  Page Content Snapshots
  //
  //  Visits every URL in the baseline and snapshots the text content of the
  //  documentation body. On the first run, baseline .txt files are created
  //  automatically. On subsequent runs, any text change in the docs body
  //  triggers a soft-assertion failure.
  //
  //  To accept intentional changes: npx playwright test --update-snapshots
  // ────────────────────────────────────────────────────────────────────────────
  test.describe('Page Content Snapshots', { tag: ['@regression'] }, () => {
    test.setTimeout(60_000);

    for (const url of allStoredUrls) {
      test(`content unchanged — ${urlToSlug(url)}`, async ({ page }, testInfo) => {
        await gotoWithRetry(page, url, 'domcontentloaded');

        const docsContent = await firstVisibleLocator([
          page.locator('#handbook-content article'),
          page.locator('main'),
        ]);
        await docsContent.waitFor({ state: 'visible' });
        const raw = (await docsContent.textContent()) ?? '';
        const normalized = raw.replace(/\s+/g, ' ').trim();

        const snapshotPath = testInfo.snapshotPath(`${urlToSlug(url)}.txt`);
        if (testInfo.config.updateSnapshots === 'none' && fs.existsSync(snapshotPath)) {
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
