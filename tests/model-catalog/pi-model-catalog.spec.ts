import fs from 'fs';
import path from 'path';
import { expect, test, type Page } from '@playwright/test';

const MODEL_CATALOG_URL = 'https://pi.dev/models';
const BASELINE_SNAPSHOT_NAME = 'pi-model-catalog-baseline.json';
const EXPECTED_COLUMNS = ['Model', 'Context', 'Input $/M', 'Output $/M', 'Cache read $/M', 'Cache write $/M'] as const;

function normalizeText(value: string | null | undefined): string {
  return value?.replace(/\s+/g, ' ').trim() ?? '';
}

function computeLineDiff(before: string, after: string): string {
  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const beforeSet = new Set(beforeLines);
  const afterSet = new Set(afterLines);
  const removed = beforeLines.filter((line) => !afterSet.has(line));
  const added = afterLines.filter((line) => !beforeSet.has(line));
  const lines = [`Baseline lines: ${beforeLines.length}`, `Live lines:     ${afterLines.length}`, ''];

  if (removed.length) {
    lines.push('━━━ REMOVED ━━━', ...removed, '');
  }

  if (added.length) {
    lines.push('━━━ ADDED ━━━', ...added);
  }

  return lines.join('\n');
}

async function waitForCatalogToLoad(page: Page): Promise<void> {
  const table = page.getByRole('table');
  const progress = page
    .getByRole('main')
    .getByText(/\d[\d,]*\s*\/\s*\d[\d,]*/)
    .first();

  await expect(page.getByRole('heading', { name: 'Model Catalog' })).toBeVisible();
  await expect(table).toBeVisible();

  await expect
    .poll(
      async () => {
        const progressText = normalizeText(await progress.textContent());
        const match = progressText.match(/^([\d,]+)\s*\/\s*([\d,]+)$/);
        return match ? match[1] === match[2] : false;
      },
      { message: 'Expected the model catalog to finish loading' }
    )
    .toBe(true);

  await expect.poll(async () => table.locator('tbody tr td:first-child').count(), { message: 'Expected model rows to be visible in the catalog table' }).toBeGreaterThan(0);
}

async function getColumnHeaders(page: Page): Promise<string[]> {
  return page
    .getByRole('table')
    .locator('tr')
    .first()
    .locator('th')
    .evaluateAll((headers) => headers.map((header) => header.textContent?.replace(/\s+/g, ' ').trim() ?? ''));
}

async function getModelCatalogRows(page: Page): Promise<
  Array<{
    model: string;
    context: string;
    inputPerMillion: string;
    outputPerMillion: string;
    cacheReadPerMillion: string;
    cacheWritePerMillion: string;
  }>
> {
  const rawRows = await page
    .getByRole('table')
    .locator('tbody tr')
    .evaluateAll((rows) => rows.map((row) => Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.replace(/\s+/g, ' ').trim() ?? '')));

  return rawRows
    .filter((cells) => cells.length === EXPECTED_COLUMNS.length)
    .map(([model, context, inputPerMillion, outputPerMillion, cacheReadPerMillion, cacheWritePerMillion]) => ({
      model,
      context,
      inputPerMillion,
      outputPerMillion,
      cacheReadPerMillion,
      cacheWritePerMillion,
    }));
}

test.use({ viewport: { width: 1920, height: 1080 }, launchOptions: { args: ['--window-size=1920,1080'] } });

test.describe('PI Model Catalog Monitoring', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(MODEL_CATALOG_URL, { waitUntil: 'domcontentloaded' });
    await waitForCatalogToLoad(page);
  });

  test('should display the expected pricing columns', async ({ page }) => {
    const columnHeaders = await getColumnHeaders(page);

    expect(columnHeaders).toEqual([...EXPECTED_COLUMNS]);
  });

  test('should create a baseline on first run and detect model catalog changes later', async ({ page }, testInfo) => {
    const columnHeaders = await getColumnHeaders(page);
    const modelCatalogRows = await getModelCatalogRows(page);
    const serializedCatalog = JSON.stringify(
      {
        columns: columnHeaders,
        rows: modelCatalogRows,
      },
      null,
      2
    );

    expect(columnHeaders).toEqual([...EXPECTED_COLUMNS]);
    expect(modelCatalogRows.length).toBeGreaterThan(0);

    const snapshotPath = testInfo.snapshotPath(BASELINE_SNAPSHOT_NAME);
    if (!fs.existsSync(snapshotPath)) {
      fs.mkdirSync(path.dirname(snapshotPath), { recursive: true });
      fs.writeFileSync(snapshotPath, serializedCatalog, 'utf-8');

      await testInfo.attach('model-catalog-baseline-created.json', {
        body: serializedCatalog,
        contentType: 'application/json',
      });

      return;
    }

    const baseline = fs.readFileSync(snapshotPath, 'utf-8');
    if (baseline !== serializedCatalog) {
      await testInfo.attach('model-catalog-diff.txt', {
        body: computeLineDiff(baseline, serializedCatalog),
        contentType: 'text/plain',
      });

      await testInfo.attach('model-catalog-current.json', {
        body: serializedCatalog,
        contentType: 'application/json',
      });
    }

    expect(serializedCatalog).toBe(baseline);
  });
});
