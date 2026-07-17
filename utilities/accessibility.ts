import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';

// Result shapes are derived from AxeBuilder rather than imported from axe-core
// (a transitive dependency), so this stays dependency-safe.
type AxeResults = Awaited<ReturnType<AxeBuilder['analyze']>>;
type Violation = AxeResults['violations'][number];

export interface A11yScanOptions {
  include?: string | string[];
  exclude?: string | string[];
  tags?: string[];
}

// Framework-agnostic axe accessibility scan shared across every lab. Options map
// directly to AxeBuilder's .include()/.exclude()/.withTags() chain.
export async function scanA11y(page: Page, options: A11yScanOptions = {}): Promise<AxeResults> {
  let builder = new AxeBuilder({ page });
  if (options.include) builder = builder.include(options.include);
  if (options.exclude) builder = builder.exclude(options.exclude);
  if (options.tags) builder = builder.withTags(options.tags);
  return builder.analyze();
}

// Convenience wrapper for the project's standard WCAG 2.x accessibility gate.
export function scanWcag(page: Page): Promise<AxeResults> {
  return scanA11y(page, { tags: ['wcag2a', 'wcag2aa', 'wcag21aa'] });
}

// Filters out violations by rule id (e.g. ignoring a known 'color-contrast' issue).
export function violationsExcluding(results: AxeResults, ignoreRuleIds: string[]): Violation[] {
  return results.violations.filter((v) => !ignoreRuleIds.includes(v.id));
}
