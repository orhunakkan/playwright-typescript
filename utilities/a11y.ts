import { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export interface A11yScanOptions {
  include?: string;
  exclude?: string;
  tags?: string[];
}

/**
 * Runs an axe-core accessibility scan on the current page.
 * Defaults to WCAG 2.0 A/AA + WCAG 2.1 AA tags.
 */
export async function runA11yScan(page: Page, options: A11yScanOptions = {}) {
  let builder = new AxeBuilder({ page }).withTags(options.tags ?? ['wcag2a', 'wcag2aa', 'wcag21aa']);
  if (options.include) builder = builder.include(options.include);
  if (options.exclude) builder = builder.exclude(options.exclude);
  return builder.analyze();
}
