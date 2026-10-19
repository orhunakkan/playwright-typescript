import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import { createDefect, nextDefectId } from './defect.ts';
import { lintFeature } from './lint.ts';
import { envLabel, outcomes } from './results.ts';
import { runSummary, writeRunSummary } from './run-summary.ts';
import { fixtureReport, makeRoot, withTemplates } from './test-helpers.ts';

const FILE = 'tests/api/zz-fixture/probe.spec.ts';

describe('results reader (real 1.64 report)', () => {
  const all = outcomes(fixtureReport());
  const at = (line: number) => all.find((o) => o.test === `${FILE}:${line}`);

  test('reads every test with a repo-relative file:line', () => {
    assert.equal(all.length, 7);
    assert.ok(all.every((o) => o.test.startsWith(`${FILE}:`)));
  });

  test('describe-level tags give the feature; test tags give AC and TC', () => {
    assert.deepEqual([at(7)?.feature, at(7)?.ac, at(7)?.tc], ['shop-search', 'AC-1', 'TC-002']);
    assert.equal(at(19)?.feature, 'other');
    assert.equal(at(20)?.feature, undefined);
  });

  test('statuses, known defects, issues and the first error line', () => {
    assert.equal(at(4)?.status, 'expected');
    assert.equal(at(7)?.status, 'unexpected');
    assert.match(at(7)?.error ?? '', /deliberate failure/);
    assert.equal(at(10)?.status, 'flaky');
    assert.deepEqual([at(13)?.status, at(13)?.knownDefect, at(13)?.issues], ['expected', true, ['DEF-001']]);
    assert.equal(at(17)?.status, 'skipped');
  });

  test('env label comes from the run metadata', () => {
    assert.equal(envLabel(fixtureReport()), 'default https://practicesoftwaretesting.com');
    assert.equal(envLabel(undefined), 'unknown');
  });
});

describe('stlc:run-summary', () => {
  test('counts per project and lists only failed and flaky tests of the feature', () => {
    const block = runSummary(fixtureReport(), 'shop-search');
    assert.match(block, /^\| api \| 1 \| 1 \| 1 \| 1 \| 1 \|$/m);
    assert.match(block, new RegExp(`^\\| ${FILE}:7 \\| api \\| failed \\| TC-002 \\| AC-1 \\| .*deliberate failure`, 'm'));
    assert.match(block, new RegExp(`^\\| ${FILE}:10 \\| api \\| flaky \\| TC-003 \\| AC-2 \\|`, 'm'));
    assert.doesNotMatch(block, new RegExp(`${FILE}:(13|19|20)`), 'known defect, other feature and untagged are not triage items');
  });

  test('orders triage rows by line numerically and shows a flaky test its failing attempt error', () => {
    const block = runSummary(fixtureReport(), 'shop-search');
    assert.ok(block.indexOf(`${FILE}:7 `) < block.indexOf(`${FILE}:10 `), ':7 before :10');
    assert.match(block, new RegExp(`^\\| ${FILE}:10 \\| api \\| flaky \\| TC-003 \\| AC-2 \\| .*toBeGreaterThan`, 'm'));
  });

  test('is deterministic', () => {
    assert.equal(runSummary(fixtureReport(), 'shop-search'), runSummary(fixtureReport(), 'shop-search'));
  });

  test('says so when the feature has no tests in the run', () => {
    assert.match(runSummary(fixtureReport(), 'nothing-here'), /No tests tagged `@REQ-nothing-here`/);
  });

  test('rewrites only the generated block and the updated date', () => {
    const root = withTemplates(makeRoot({ 'shop-search/04-execution.md': null }));
    const template = readFileSync(join(root, '_templates', '04-execution.md'), 'utf8')
      .replaceAll('{{feature}}', 'shop-search')
      .replaceAll('{{date}}', '2026-01-01');
    const file = join(root, 'shop-search', '04-execution.md');
    // Seed a 04 with a triage row that must survive the rewrite.
    writeFileSync(file, template.replace('| ---- | ------- | --- | ---- |', '| ---- | ------- | --- | ---- |\n| keep-me | test |  | healed |'));
    writeRunSummary(root, 'shop-search', fixtureReport());
    const out = readFileSync(file, 'utf8');
    assert.match(out, /^updated: 2026-10-19$/m);
    assert.match(out, /\| api \| 1 \| 1 \| 1 \| 1 \| 1 \|/);
    assert.match(out, /\| keep-me \| test \|/);
    assert.doesNotMatch(out, /Not run yet/);
  });
});

describe('stlc:defect', () => {
  test('numbers defects globally', () => {
    assert.equal(nextDefectId(makeRoot()), 'DEF-002');
    assert.equal(nextDefectId(makeRoot({ 'defects/DEF-001.md': null })), 'DEF-001');
  });

  test('creates a lint-clean defect from the template', () => {
    const root = withTemplates(makeRoot());
    const file = createDefect(root, 'shop-search', 'AC-1', `${FILE}:7`, 'default https://example.test', '2026-10-19');
    const text = readFileSync(file, 'utf8');
    assert.match(file, /DEF-002\.md$/);
    assert.match(text, /^id: DEF-002$/m);
    assert.match(text, /^ac: AC-1$/m);
    assert.match(text, new RegExp(`^test: ${FILE}:7$`, 'm'));
    assert.deepEqual(lintFeature(root, 'shop-search'), []);
  });

  test('rejects an AC the feature does not have', () => {
    assert.throws(() => createDefect(withTemplates(makeRoot()), 'shop-search', 'AC-9', 'x:1', 'env'), /AC-9 is not in/);
  });
});
