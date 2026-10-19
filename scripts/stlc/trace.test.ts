import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import type { JsonReport } from './results.ts';
import { fixtureReport, makeRoot, withTemplates } from './test-helpers.ts';
import { traceFeature, writeTrace } from './trace.ts';

// Artifacts that match the fixture report: five api tests for shop-search, TC-001..TC-005.
const FILE = 'tests/api/zz-fixture/probe.spec.ts';
const PLAN = `---
feature: shop-search
phase: test-plan
status: approved
updated: 2026-10-19
---

## Coverage

| AC   | e2e | api | a11y | perf | visual |
| ---- | --- | --- | ---- | ---- | ------ |
| AC-1 |     | x   |      |      |        |
| AC-2 |     | x   |      |      |        |

## Exit criteria

- ac-coverage-min: 100%
- open-critical-max: 0
- flaky-rate-max: 30%
`;
const CASES = `---
feature: shop-search
phase: test-cases
status: approved
updated: 2026-10-19
---

| TC     | AC   | type | title                 | priority |
| ------ | ---- | ---- | --------------------- | -------- |
| TC-001 | AC-1 | api  | positive: passes      | high     |
| TC-002 | AC-1 | api  | negative: fails       | high     |
| TC-003 | AC-2 | api  | positive: flaky       | medium   |
| TC-004 | AC-2 | api  | positive: known       | medium   |
| TC-005 | AC-2 | api  | positive: skipped     | low      |
| TC-006 | AC-2 | api  | positive: not written | low      |
`;
const BASE = { 'shop-search/02-test-plan.md': PLAN, 'shop-search/03-test-cases.md': CASES };
const triage = (rows: string) => ({
  'shop-search/04-execution.md': `---\nfeature: shop-search\nphase: execution\nstatus: complete\nupdated: 2026-10-19\n---\n\n| test | verdict | DEF | note |\n| ---- | ------- | --- | ---- |\n${rows}\n`,
});
const defect = (id: string, ac: string, severity: string, status = 'open', test = 'x:1') => ({
  [`defects/${id}.md`]: `---\nid: ${id}\nfeature: shop-search\nac: ${ac}\nseverity: ${severity}\nstatus: ${status}\nfound: 2026-10-19\nenv: default\ntest: ${test}\n---\n`,
});
const trace = (overrides: Record<string, string | null> = {}, report: JsonReport = fixtureReport()) =>
  traceFeature(makeRoot({ ...BASE, ...overrides }), 'shop-search', report);

describe('stlc:trace', () => {
  test('an untriaged failure leaves its AC uncovered', () => {
    const t = trace();
    assert.match(t.markdown, /^\| AC-1 \| .* \| failing, untriaged \|$/m);
    assert.match(t.markdown, /^\| AC-2 \| .* \| covered \|$/m);
    assert.equal(t.acCoverage, 50);
    assert.equal(t.met, false);
    assert.match(t.markdown, /\| AC coverage \| ≥ 100% \| 50% \(1\/2\) \| FAIL \|/);
  });

  test('a triaged failure linked to an open defect counts as covered', () => {
    const t = trace({ ...triage(`| ${FILE}:7 | product | DEF-002 | real bug |`), ...defect('DEF-002', 'AC-1', 'major') });
    assert.equal(t.acCoverage, 100);
    assert.equal(t.met, true);
    assert.match(t.markdown, new RegExp(`^\\| AC-1 \\| TC-002 \\| api \\| ${FILE}:7 \\| FAIL \\| DEF-002 \\|$`, 'm'));
  });

  test('a defect linked through its own test field also covers the failure', () => {
    assert.equal(trace(defect('DEF-002', 'AC-1', 'minor', 'open', `${FILE}:7`)).acCoverage, 100);
  });

  test('a fixed defect no longer accounts for a failing test', () => {
    assert.equal(trace(defect('DEF-002', 'AC-1', 'minor', 'fixed', `${FILE}:7`)).acCoverage, 50);
  });

  test('an open critical defect fails the exit criteria', () => {
    const t = trace(defect('DEF-002', 'AC-1', 'critical', 'open', `${FILE}:7`));
    assert.equal(t.openCritical, 1);
    assert.equal(t.met, false);
    assert.match(t.markdown, /\| open critical defects \| ≤ 0 \| 1 \| FAIL \|/);
  });

  test('flaky rate over the plan threshold fails the exit criteria', () => {
    const strict = { 'shop-search/02-test-plan.md': PLAN.replace('flaky-rate-max: 30%', 'flaky-rate-max: 2%') };
    const t = trace({ ...strict, ...defect('DEF-002', 'AC-1', 'minor', 'open', `${FILE}:7`) });
    assert.equal(t.flakyRate, 25);
    assert.equal(t.met, false);
    assert.match(t.markdown, /\| flaky rate \| ≤ 2% \| 25% \(1\/4\) \| FAIL \|/);
  });

  test('uncovered ACs, unimplemented TCs and orphan tests are visible', () => {
    const req = readFileSync(join(makeRoot(), 'shop-search', '01-requirements.md'), 'utf8') + '\n### AC-3: Nobody planned this\n\nrisk: low\n';
    const cases = CASES.replace('| TC-005 | AC-2 |', '| TC-007 | AC-2 |');
    const t = trace({ 'shop-search/01-requirements.md': req, 'shop-search/03-test-cases.md': cases });
    assert.match(t.markdown, /^\| AC-3 \| — \| — \| — \| — \| \|$/m, 'AC without any TC');
    assert.match(t.markdown, /^\| AC-2 \| TC-006 \| api \| not implemented \|/m, 'TC without a test');
    assert.match(t.markdown, new RegExp(`- ${FILE}:17 \\(TC-005\\)`), 'test whose TC is not in 03');
    assert.match(t.markdown, /^\| AC-3 \| Nobody planned this \| low \| not run \|$/m);
  });

  test('all green: every AC covered, nothing flaky, criteria met', () => {
    const report = fixtureReport();
    const walk = (s: { specs?: { tests: { status: string }[] }[]; suites?: unknown[] }) => {
      for (const sp of s.specs ?? []) for (const t of sp.tests) if (t.status !== 'skipped') t.status = 'expected';
      for (const c of (s.suites ?? []) as (typeof s)[]) walk(c);
    };
    report.suites.forEach(walk);
    const t = trace({}, report);
    assert.deepEqual([t.acCoverage, t.flakyRate, t.openCritical, t.met], [100, 0, 0, true]);
    assert.match(t.markdown, /\*\*Exit criteria: MET\*\*/);
  });

  test('writes byte-identical output for the same inputs', () => {
    const root = withTemplates(makeRoot({ ...BASE, ...defect('DEF-002', 'AC-1', 'minor', 'open', `${FILE}:7`) }));
    const closure = readFileSync(join(root, '_templates', '05-closure.md'), 'utf8')
      .replaceAll('{{feature}}', 'shop-search')
      .replaceAll('{{date}}', '2026-01-01');
    const file = join(root, 'shop-search', '05-closure.md');
    writeFileSync(file, closure);
    writeTrace(root, 'shop-search', fixtureReport());
    const first = readFileSync(file, 'utf8');
    writeTrace(root, 'shop-search', fixtureReport());
    assert.equal(readFileSync(file, 'utf8'), first);
    assert.match(first, /^updated: 2026-10-19$/m);
    assert.match(first, /## Lessons and recommendations/, 'hand-written sections survive');
  });

  test('prettier leaves the generated block untouched', async () => {
    const root = withTemplates(makeRoot(BASE));
    const closure = readFileSync(join(root, '_templates', '05-closure.md'), 'utf8')
      .replaceAll('{{feature}}', 'shop-search')
      .replaceAll('{{date}}', '2026-01-01');
    const file = join(root, 'shop-search', '05-closure.md');
    writeFileSync(file, closure);
    writeTrace(root, 'shop-search', fixtureReport());
    const generated = readFileSync(file, 'utf8');
    const prettier = await import('prettier');
    const formatted = await prettier.format(generated, { parser: 'markdown', ...(await prettier.resolveConfig(file)) });
    const block = (s: string) => s.slice(s.indexOf('<!-- generated:start -->'), s.indexOf('<!-- generated:end -->'));
    assert.equal(block(formatted), block(generated));
  });
});
