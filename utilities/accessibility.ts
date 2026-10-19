// axe-core scans against WCAG 2.2 A/AA. Pattern per https://playwright.dev/docs/accessibility-testing
import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';

export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

export type ScanOptions = {
  /** Limit the scan to these selectors (e.g. a dialog in a specific state). */
  include?: string[];
  /** Skip these selectors and their descendants. */
  exclude?: string[];
  /** Rule ids to skip. Each one needs a comment saying why, or it hides a real defect. */
  disableRules?: string[];
};

export type Violation = { id: string; impact: string | null | undefined; help: string; targets: string[] };

/** A known, tracked violation: one rule on matching elements, linked to its finding or DEF id. */
export type KnownViolation = { id: string; target: RegExp; issue: string };

/**
 * Drops only the exact (rule, element) pairs that are already tracked, so every other violation on
 * the page still fails the test. Narrower than disableRules (whole rule) or exclude (whole element).
 */
export function withoutKnown(violations: Violation[], known: KnownViolation[]): Violation[] {
  return violations
    .map((v) => ({ ...v, targets: v.targets.filter((t) => !known.some((k) => k.id === v.id && k.target.test(t))) }))
    .filter((v) => v.targets.length > 0);
}

/** A WCAG-tagged AxeBuilder for custom scans; prefer scanWcag for the common case. */
export const wcagBuilder = (page: Page) => new AxeBuilder({ page }).withTags(WCAG_TAGS);

/**
 * Scans the page as it is now, attaches the full axe results to the report and returns a compact
 * violation list, so `expect(violations).toEqual([])` fails with a readable diff.
 */
export async function scanWcag(page: Page, testInfo: TestInfo, options: ScanOptions = {}): Promise<Violation[]> {
  let builder = wcagBuilder(page);
  for (const selector of options.include ?? []) builder = builder.include(selector);
  for (const selector of options.exclude ?? []) builder = builder.exclude(selector);
  if (options.disableRules?.length) builder = builder.disableRules(options.disableRules);

  const results = await builder.analyze();
  await testInfo.attach('accessibility-scan-results', { body: JSON.stringify(results, null, 2), contentType: 'application/json' });

  return results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    targets: v.nodes.map((n) => n.target.join(' ')),
  }));
}
