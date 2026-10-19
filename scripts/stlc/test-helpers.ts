// Builds throwaway STLC roots for unit tests. A valid feature is the baseline; each test mutates one
// file so a failure points at exactly one rule.
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

const fm = (phase: string, status = 'approved', extra = '') =>
  `---\nfeature: shop-search\nphase: ${phase}\nstatus: ${status}\nupdated: 2026-10-19\n${extra}---\n`;

export const VALID: Record<string, string> = {
  'shop-search/01-requirements.md': `${fm('requirements', 'approved', 'source: inferred\n')}
# Requirements: shop-search

## Acceptance criteria

### AC-1: Search lists only matching products

risk: high

### AC-2: A term with no match shows the empty state

risk: medium
`,
  'shop-search/02-test-plan.md': `${fm('test-plan')}
# Test plan: shop-search

## Coverage

| AC   | e2e | api | a11y | perf | visual |
| ---- | --- | --- | ---- | ---- | ------ |
| AC-1 | x   | x   |      |      |        |
| AC-2 | x   |     |      |      |        |

## Exit criteria

- ac-coverage-min: 100%
- open-critical-max: 0
- flaky-rate-max: 2%
`,
  'shop-search/03-test-cases.md': `${fm('test-cases')}
# Test cases: shop-search

| TC     | AC   | type | title                                   | priority |
| ------ | ---- | ---- | --------------------------------------- | -------- |
| TC-001 | AC-1 | e2e  | positive: matching term lists matches   | high     |
| TC-002 | AC-1 | api  | positive: search endpoint filters names | medium   |
| TC-003 | AC-2 | e2e  | negative: unknown term shows empty state | medium  |
`,
  'shop-search/04-execution.md': `${fm('execution', 'draft')}
# Execution: shop-search

## Triage

| test                                   | verdict | DEF     | note            |
| -------------------------------------- | ------- | ------- | --------------- |
| tests/e2e/shop-search/empty.spec.ts:4  | product | DEF-001 | empty state missing |
`,
  'defects/DEF-001.md': `---
id: DEF-001
feature: shop-search
ac: AC-2
severity: major
status: open
found: 2026-10-19
env: default https://example.test
test: tests/e2e/shop-search/empty.spec.ts:4
---

# DEF-001: empty state missing
`,
};

/** Writes VALID (with per-file overrides; `null` deletes a file) into a fresh temp root. */
export function makeRoot(overrides: Record<string, string | null> = {}): string {
  const root = mkdtempSync(join(tmpdir(), 'apf-stlc-'));
  for (const [path, content] of Object.entries({ ...VALID, ...overrides })) {
    if (content === null) continue;
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), content);
  }
  return root;
}

/** VALID file with one substring replaced; throws if the substring is absent so tests can't go stale. */
export function mutate(path: string, from: string, to: string): Record<string, string> {
  const original = VALID[path];
  if (!original?.includes(from)) throw new Error(`"${from}" not found in ${path}`);
  return { [path]: original.replace(from, to) };
}
