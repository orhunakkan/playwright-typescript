import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { lintFeature } from './lint.ts';
import { runSummary } from './run-summary.ts';
import { fixtureReport, makeRoot, mutate } from './test-helpers.ts';

const lint = (overrides: Record<string, string | null> = {}) => lintFeature(makeRoot(overrides), 'shop-search').map((i) => i.message);
const REQ = 'shop-search/01-requirements.md';
const PLAN = 'shop-search/02-test-plan.md';
const CASES = 'shop-search/03-test-cases.md';
const EXEC = 'shop-search/04-execution.md';
const DEF = 'defects/DEF-001.md';

describe('stlc:lint', () => {
  test('a valid feature has no issues', () => {
    assert.deepEqual(lint(), []);
  });

  test('rejects a non-kebab feature name', () => {
    assert.match(lintFeature(makeRoot(), 'Shop_Search')[0]?.message ?? '', /kebab-case/);
  });

  test('requires 01-requirements.md', () => {
    assert.match(lint({ [REQ]: null })[0] ?? '', /missing/);
  });

  describe('front matter', () => {
    test('feature must match the folder', () => {
      assert.ok(lint(mutate(REQ, 'feature: shop-search', 'feature: other')).some((m) => /"feature" must be "shop-search"/.test(m)));
    });
    test('status must be a known value', () => {
      assert.ok(lint(mutate(PLAN, 'status: approved', 'status: done')).some((m) => /"status" must be one of/.test(m)));
    });
    test('placeholders are allowed in drafts only', () => {
      assert.deepEqual(lint(mutate(EXEC, '# Execution: shop-search', '# Execution: {{feature}}')), []);
      assert.ok(lint(mutate(REQ, '# Requirements: shop-search', '# Requirements: {{feature}}')).some((m) => /unfilled placeholder/.test(m)));
    });
    test('placeholders inside HTML comments are ignored', () => {
      assert.deepEqual(lint(mutate(REQ, '# Requirements: shop-search', '<!-- fill {{these}} in -->')), []);
    });
  });

  describe('01 requirements', () => {
    test('duplicate AC ids', () => {
      assert.ok(lint(mutate(REQ, '### AC-2:', '### AC-1:')).some((m) => /duplicate AC-1/.test(m)));
    });
    test('every AC needs a risk', () => {
      assert.ok(lint(mutate(REQ, 'risk: medium', '')).some((m) => /AC-2 needs a "risk/.test(m)));
    });
    test('source must be provided or inferred', () => {
      assert.ok(lint(mutate(REQ, 'source: inferred', 'source: guessed')).some((m) => /"source"/.test(m)));
    });
  });

  describe('02 test plan', () => {
    test('coverage rows must reference known ACs', () => {
      assert.ok(lint(mutate(PLAN, '| AC-2 | x   |', '| AC-9 | x   |')).some((m) => /AC-9 is not in 01/.test(m)));
    });
    test('every AC must appear in the coverage table', () => {
      assert.ok(lint(mutate(PLAN, '| AC-2 | x   |     |      |      |        |\n', '')).some((m) => /AC-2 is missing from the coverage/.test(m)));
    });
    test('cells are "x" or blank', () => {
      assert.ok(lint(mutate(PLAN, '| AC-2 | x   |', '| AC-2 | yes |')).some((m) => /use "x" or leave blank/.test(m)));
    });
    test('unknown exit criterion keys are reported', () => {
      assert.ok(lint(mutate(PLAN, '- flaky-rate-max: 2%', '- flakiness: 2%')).some((m) => /unknown exit criterion "flakiness"/.test(m)));
    });
  });

  describe('03 test cases', () => {
    test('TC id format', () => {
      assert.ok(lint(mutate(CASES, '| TC-003 |', '| TC-3   |')).some((m) => /must look like TC-001/.test(m)));
    });
    test('duplicate TC ids', () => {
      assert.ok(lint(mutate(CASES, '| TC-003 |', '| TC-001 |')).some((m) => /duplicate TC-001/.test(m)));
    });
    test('title prefix', () => {
      assert.ok(lint(mutate(CASES, 'negative: unknown term', 'unknown term')).some((m) => /title must start with/.test(m)));
    });
    test('a case for an unplanned AC × type is rejected', () => {
      assert.ok(lint(mutate(CASES, '| TC-003 | AC-2 | e2e  |', '| TC-003 | AC-2 | perf |')).some((m) => /AC-2 × perf is not planned/.test(m)));
    });
    test('every planned AC × type needs a case', () => {
      assert.ok(
        lint(mutate(CASES, '| TC-002 | AC-1 | api  |', '| TC-002 | AC-1 | e2e  |')).some((m) => /planned AC-1 × api has no test case/.test(m)),
      );
    });
  });

  describe('04 execution triage', () => {
    test('product verdicts need a DEF', () => {
      assert.ok(lint(mutate(EXEC, '| product | DEF-001 |', '| product |         |')).some((m) => /product verdict needs a DEF/.test(m)));
    });
    test('referenced DEF must exist', () => {
      assert.ok(lint(mutate(EXEC, 'DEF-001 |', 'DEF-404 |')).some((m) => /DEF-404 does not exist/.test(m)));
    });
    test('a complete 04 needs a triage row for every test the run block lists', () => {
      const runBlock = runSummary(fixtureReport(), 'shop-search');
      const exec = (status: string, rows: string) =>
        `---\nfeature: shop-search\nphase: execution\nstatus: ${status}\nupdated: 2026-10-19\n---\n\n${runBlock}\n\n## Triage\n\n| test | verdict | DEF | note |\n| ---- | ------- | --- | ---- |\n${rows}`;
      const flakyRow = '| tests/api/zz-fixture/probe.spec.ts:10 | flaky | DEF-001 | retry passed |\n';
      const failedRow = '| tests/api/zz-fixture/probe.spec.ts:7 | test | | stale locator |\n';
      assert.deepEqual(lint({ [EXEC]: exec('draft', flakyRow) }), [], 'drafts may be partially triaged');
      assert.deepEqual(lint({ [EXEC]: exec('complete', flakyRow) }), [
        'tests/api/zz-fixture/probe.spec.ts:7 needs triage, but has no row in the Triage table',
      ]);
      assert.deepEqual(lint({ [EXEC]: exec('complete', flakyRow + failedRow) }), []);
    });

    test('verdict must be known', () => {
      assert.ok(lint(mutate(EXEC, '| product |', '| bug     |')).some((m) => /verdict must be one of/.test(m)));
    });
  });

  describe('defects', () => {
    test('severity must be known', () => {
      assert.ok(lint(mutate(DEF, 'severity: major', 'severity: huge')).some((m) => /severity must be one of/.test(m)));
    });
    test('ac must exist in the feature', () => {
      assert.ok(lint(mutate(DEF, 'ac: AC-2', 'ac: AC-7')).some((m) => /ac "AC-7" is not in/.test(m)));
    });
  });
});
