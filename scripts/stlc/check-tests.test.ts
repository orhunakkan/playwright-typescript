import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import type { TestCase } from './artifacts.ts';
import { checkTests } from './check-tests.ts';
import type { Outcome } from './results.ts';

const tc = (id: string, ac: string, type: string, line = 10): TestCase => ({ id, ac, type, title: 'positive: x', priority: 'high', line });
const CASES = [tc('TC-001', 'AC-1', 'e2e', 10), tc('TC-002', 'AC-1', 'api', 11)];

const test_ = (path: string, tags: string[], title = 'positive: works', project = 'chromium'): Outcome => ({
  test: path,
  title,
  project,
  status: 'skipped',
  knownDefect: false,
  tags,
  feature: tags.find((t) => t.startsWith('REQ-'))?.slice(4),
  ac: tags.find((t) => t.startsWith('AC-')),
  tc: tags.find((t) => t.startsWith('TC-')),
  issues: [],
  error: undefined,
});
const GOOD = [
  test_('tests/e2e/shop/TC-001-search.spec.ts:5', ['REQ-shop', 'AC-1', 'TC-001']),
  test_('tests/e2e/shop/TC-001-search.spec.ts:5', ['REQ-shop', 'AC-1', 'TC-001'], 'positive: works', 'firefox'),
  test_('tests/api/shop/TC-002-search.spec.ts:4', ['REQ-shop', 'AC-1', 'TC-002'], 'positive: works', 'api'),
  test_('tests/e2e/examples/search.spec.ts:13', ['example']),
];
const check = (outcomes: Outcome[], cases = CASES) => checkTests('shop', cases, outcomes).map((i) => i.message);

describe('stlc:check-tests', () => {
  test('matching tests pass, and tests run in several projects are checked once', () => {
    assert.deepEqual(check(GOOD), []);
  });

  test('every TC needs a test', () => {
    assert.deepEqual(check(GOOD.slice(0, 2)), ['TC-002 has no test']);
  });

  test('a feature test outside tests/<type>/<feature>/', () => {
    assert.ok(
      check([...GOOD, test_('tests/e2e/other/x.spec.ts:1', ['REQ-shop', 'AC-1', 'TC-001'])]).some((m) => /not under tests\/<type>\/shop\//.test(m)),
    );
  });

  test('a test in the feature folder without the feature tag', () => {
    assert.ok(check([...GOOD, test_('tests/e2e/shop/untagged.spec.ts:1', [])]).some((m) => /not tagged @REQ-shop/.test(m)));
  });

  test('missing or duplicate AC/TC tags', () => {
    const msgs = check([...GOOD, test_('tests/e2e/shop/x.spec.ts:1', ['REQ-shop', 'TC-001', 'TC-002'])]);
    assert.ok(msgs.includes('needs exactly one @AC-<n> tag, has 0'));
    assert.ok(msgs.includes('needs exactly one @TC-<nnn> tag, has 2'));
  });

  test('unknown TC, wrong AC, wrong type folder, bad title', () => {
    assert.ok(check([...GOOD, test_('tests/e2e/shop/x.spec.ts:1', ['REQ-shop', 'AC-1', 'TC-009'])]).includes('TC-009 is not in 03-test-cases.md'));
    assert.ok(
      check([...GOOD, test_('tests/e2e/shop/x.spec.ts:1', ['REQ-shop', 'AC-2', 'TC-001'])]).includes(
        'TC-001 belongs to AC-1, but the test is tagged @AC-2',
      ),
    );
    assert.ok(
      check([...GOOD, test_('tests/a11y/shop/x.spec.ts:1', ['REQ-shop', 'AC-1', 'TC-001'])]).includes(
        'TC-001 is a e2e case, but the test is under tests/a11y/',
      ),
    );
    assert.ok(
      check([...GOOD, test_('tests/e2e/shop/x.spec.ts:1', ['REQ-shop', 'AC-1', 'TC-001'], 'works')]).some((m) => /title must start with/.test(m)),
    );
  });

  test('reports file and line', () => {
    const [issue] = checkTests('shop', CASES, [...GOOD, test_('tests/e2e/shop/x.spec.ts:42', ['REQ-shop', 'AC-1', 'TC-009'])]);
    assert.deepEqual([issue?.file, issue?.line], ['tests/e2e/shop/x.spec.ts', 42]);
  });
});
