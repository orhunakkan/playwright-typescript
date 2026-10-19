import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import { checkGate, resolvePhase } from './gate.ts';
import { lintFeature } from './lint.ts';
import { createFeature } from './new.ts';
import { makeRoot, mutate, withTemplates } from './test-helpers.ts';

const REQ = 'shop-search/01-requirements.md';
const PLAN = 'shop-search/02-test-plan.md';
const EXEC = 'shop-search/04-execution.md';

describe('stlc:gate', () => {
  test('resolves phases by number and name', () => {
    assert.equal(resolvePhase('3'), 3);
    assert.equal(resolvePhase('design'), 3);
    assert.equal(resolvePhase('9'), undefined);
    assert.equal(resolvePhase('nope'), undefined);
  });

  test('phase 1 is always open for a lint-clean feature', () => {
    assert.deepEqual(checkGate(makeRoot(), 'shop-search', 1), []);
  });

  test('design is closed while the plan is a draft (the human gate)', () => {
    const reasons = checkGate(makeRoot(mutate(PLAN, 'status: approved', 'status: draft')), 'shop-search', 3);
    assert.deepEqual(reasons, ['test-plan is "draft"; it must be approved or complete']);
  });

  test('design opens once requirements and plan are approved', () => {
    assert.deepEqual(checkGate(makeRoot(), 'shop-search', 3), []);
  });

  test('a missing artifact closes the gate', () => {
    assert.ok(checkGate(makeRoot({ 'shop-search/03-test-cases.md': null }), 'shop-search', 5).includes('test-cases artifact is missing'));
  });

  test('triage needs an execution artifact', () => {
    assert.ok(checkGate(makeRoot({ [EXEC]: null }), 'shop-search', 7).some((r) => /execution artifact is missing/.test(r)));
  });

  test('report needs execution approved or complete', () => {
    assert.ok(checkGate(makeRoot(), 'shop-search', 8).includes('execution is "draft"; it must be approved or complete'));
    assert.deepEqual(checkGate(makeRoot(mutate(EXEC, 'status: draft', 'status: complete')), 'shop-search', 8), []);
  });

  test('lint issues close every gate, even when statuses are fine', () => {
    const reasons = checkGate(makeRoot(mutate(REQ, 'risk: medium', '')), 'shop-search', 2);
    assert.equal(reasons.length, 1);
    assert.match(reasons[0] ?? '', /stlc:lint reports 1 issue/);
  });
});

describe('stlc:new', () => {
  const rootWithTemplates = () => withTemplates(makeRoot());

  test('creates all five artifacts with feature and date filled in, and they pass lint', () => {
    const root = rootWithTemplates();
    const files = createFeature(root, 'demo', '2026-10-19');
    assert.equal(files.length, 5);
    for (const f of files) assert.ok(existsSync(f));
    const req = readFileSync(join(root, 'demo', '01-requirements.md'), 'utf8');
    assert.match(req, /^feature: demo$/m);
    assert.match(req, /^updated: 2026-10-19$/m);
    assert.doesNotMatch(req, /\{\{(feature|date)\}\}/);
    assert.deepEqual(lintFeature(root, 'demo'), []);
  });

  test('a fresh feature is not ready for planning until requirements are approved', () => {
    const root = rootWithTemplates();
    createFeature(root, 'demo', '2026-10-19');
    assert.deepEqual(checkGate(root, 'demo', 2), ['requirements is "draft"; it must be approved or complete']);
  });

  test('refuses to overwrite an existing feature', () => {
    assert.throws(() => createFeature(rootWithTemplates(), 'shop-search'), /already exists/);
  });

  test('rejects a non-kebab name', () => {
    assert.throws(() => createFeature(rootWithTemplates(), 'Shop Search'), /kebab-case/);
  });
});
