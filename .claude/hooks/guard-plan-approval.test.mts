import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import { decide, type HookInput } from './guard-plan-approval.mts';

const PLAN = 'C:\\repo\\stlc\\shop\\02-test-plan.md';
const DRAFT = '---\nfeature: shop\nphase: test-plan\nstatus: draft\n---\n\n| AC-1 | x |\n';
const APPROVED = DRAFT.replace('status: draft', 'status: approved');
const on = (content: string | undefined) => () => content;

describe('guard-plan-approval', () => {
  test('blocks an Edit that sets status: approved', () => {
    const input: HookInput = { tool_name: 'Edit', tool_input: { file_path: PLAN, old_string: 'status: draft', new_string: 'status: approved' } };
    assert.match(decide(input, on(DRAFT)) ?? '', /only a human approves/);
  });

  test('allows ordinary edits to a draft plan', () => {
    const input: HookInput = { tool_name: 'Edit', tool_input: { file_path: PLAN, old_string: '| AC-1 | x |', new_string: '| AC-1 | x | x |' } };
    assert.equal(decide(input, on(DRAFT)), undefined);
  });

  test('blocks changing an already approved plan without resetting it to draft', () => {
    const input: HookInput = { tool_name: 'Edit', tool_input: { file_path: PLAN, old_string: '| AC-1 | x |', new_string: '| AC-1 | x | x |' } };
    assert.ok(decide(input, on(APPROVED)));
  });

  test('allows setting an approved plan back to draft (re-approval needed)', () => {
    const input: HookInput = { tool_name: 'Edit', tool_input: { file_path: PLAN, old_string: 'status: approved', new_string: 'status: draft' } };
    assert.equal(decide(input, on(APPROVED)), undefined);
  });

  test('blocks a Write of an approved plan, allows a Write of a draft', () => {
    assert.ok(decide({ tool_name: 'Write', tool_input: { file_path: PLAN, content: APPROVED } }, on(undefined)));
    assert.equal(decide({ tool_name: 'Write', tool_input: { file_path: PLAN, content: DRAFT } }, on(undefined)), undefined);
  });

  test('blocks MultiEdit that ends approved', () => {
    const input: HookInput = { tool_name: 'MultiEdit', tool_input: { file_path: PLAN, edits: [{ old_string: 'draft', new_string: 'approved' }] } };
    assert.ok(decide(input, on(DRAFT)));
  });

  test('blocks shell commands that touch the plan with "approved"', () => {
    assert.ok(decide({ tool_name: 'Bash', tool_input: { command: "sed -i 's/draft/approved/' stlc/shop/02-test-plan.md" } }, on(DRAFT)));
    assert.ok(decide({ tool_name: 'PowerShell', tool_input: { command: "(gc stlc/shop/02-test-plan.md) -replace 'draft','approved'" } }, on(DRAFT)));
    assert.equal(decide({ tool_name: 'Bash', tool_input: { command: 'npm run stlc:gate -- shop plan' } }, on(DRAFT)), undefined);
  });

  test('ignores other files, including other artifacts and POSIX paths', () => {
    assert.equal(
      decide({ tool_name: 'Write', tool_input: { file_path: 'C:\\repo\\stlc\\shop\\01-requirements.md', content: APPROVED } }, on(undefined)),
      undefined,
    );
    assert.ok(decide({ tool_name: 'Write', tool_input: { file_path: '/repo/stlc/shop/02-test-plan.md', content: APPROVED } }, on(undefined)));
  });

  test('as a process: exit 2 with the reason on stderr, exit 0 otherwise', () => {
    const run = (input: HookInput) =>
      spawnSync(process.execPath, [join(import.meta.dirname, 'guard-plan-approval.mts')], { input: JSON.stringify(input), encoding: 'utf8' });
    const blocked = run({ tool_name: 'Write', tool_input: { file_path: '/nowhere/stlc/x/02-test-plan.md', content: APPROVED } });
    assert.equal(blocked.status, 2);
    assert.match(blocked.stderr, /only a human approves/);
    assert.equal(run({ tool_name: 'Read', tool_input: { file_path: '/x' } }).status, 0);
  });
});
