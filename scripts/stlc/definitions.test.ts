// Static checks for the agent and skill definitions in .claude/, since their behaviour can only be
// exercised in a live Claude Code session: names match files, tools exist, and every command a
// definition tells Claude to run is a real npm script.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import { PHASES } from './gate.ts';

const ROOT = join(import.meta.dirname, '..', '..');
const AGENTS = join(ROOT, '.claude', 'agents');
const scripts = Object.keys((JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { scripts: Record<string, string> }).scripts);

const frontMatter = (text: string): Record<string, string> => {
  const m = /^---\n([\s\S]*?)\n---/.exec(text.replace(/\r\n/g, '\n'));
  return Object.fromEntries((m?.[1] ?? '').split('\n').map((l) => [l.slice(0, l.indexOf(':')).trim(), l.slice(l.indexOf(':') + 1).trim()]));
};
const npmScriptsUsed = (text: string) => [...text.matchAll(/npm run (?:-s )?([\w:-]+)/g)].map((m) => m[1] ?? '');

const BUILT_IN_TOOLS = new Set(['Read', 'Glob', 'Grep', 'Write', 'Edit', 'Bash']);
// MCP tool names the Playwright generator put in its own agent files are the ones that exist.
const generated = readdirSync(AGENTS).filter((f) => f.startsWith('playwright-test-'));
const mcpTools = new Set(
  generated.flatMap((f) => (frontMatter(readFileSync(join(AGENTS, f), 'utf8'))['tools'] ?? '').split(',').map((t) => t.trim())),
);

const customAgents = readdirSync(AGENTS).filter((f) => f.startsWith('stlc-'));
const SKILLS = join(ROOT, '.claude', 'skills');
const skills = readdirSync(SKILLS).filter((d) => d === 'stlc' || d.startsWith('stlc-'));
const agentNames = new Set(readdirSync(AGENTS).map((f) => f.replace(/\.md$/, '')));
const phaseNames = new Set(Object.values(PHASES).map((p) => p.name));

describe('agent definitions', () => {
  test('the three Playwright agents and six stlc agents exist', () => {
    assert.deepEqual(generated.sort(), ['playwright-test-generator.md', 'playwright-test-healer.md', 'playwright-test-planner.md']);
    assert.deepEqual(customAgents.sort(), [
      'stlc-analyst.md',
      'stlc-author.md',
      'stlc-designer.md',
      'stlc-reporter.md',
      'stlc-strategist.md',
      'stlc-triager.md',
    ]);
  });

  for (const file of customAgents) {
    test(`${file}: name, description, least-privilege tools, real npm scripts`, () => {
      const text = readFileSync(join(AGENTS, file), 'utf8');
      const fm = frontMatter(text);
      assert.equal(fm['name'], file.replace(/\.md$/, ''));
      assert.ok((fm['description'] ?? '').length > 40, 'description says when to use it');
      const tools = (fm['tools'] ?? '').split(',').map((t) => t.trim());
      for (const t of tools) assert.ok(BUILT_IN_TOOLS.has(t) || (t.startsWith('mcp__playwright-test__') && mcpTools.has(t)), `unknown tool ${t}`);
      assert.ok(!tools.includes('Agent'), 'stlc agents do not spawn agents; skills orchestrate');
      for (const s of npmScriptsUsed(text)) assert.ok(scripts.includes(s), `npm run ${s} is not a script`);
    });
  }
});

describe('skill definitions', () => {
  test('the orchestrator and one skill per STLC phase exist', () => {
    assert.deepEqual(skills.sort(), ['stlc', ...[...phaseNames].map((p) => `stlc-${p}`)].sort());
  });

  for (const dir of skills) {
    test(`${dir}: user-invoked only, real scripts, agents and gate phases`, () => {
      const text = readFileSync(join(SKILLS, dir, 'SKILL.md'), 'utf8');
      const fm = frontMatter(text);
      assert.equal(fm['name'], dir);
      assert.equal(fm['disable-model-invocation'], 'true', 'STLC skills run only when the user types them');
      assert.ok(fm['argument-hint']?.startsWith('<feature>'));
      for (const s of npmScriptsUsed(text)) assert.ok(scripts.includes(s), `npm run ${s} is not a script`);
      for (const [, agent] of text.matchAll(/\*\*([a-z-]+)\*\* agent/g)) assert.ok(agentNames.has(agent ?? ''), `unknown agent ${agent}`);
      for (const [, phase] of text.matchAll(/stlc:gate -- \$0 ([a-z]+)/g)) assert.ok(phaseNames.has(phase ?? ''), `unknown gate phase ${phase}`);
      for (const [, ref] of text.matchAll(/\.claude\/skills\/(stlc-[a-z]+)\/SKILL\.md/g))
        assert.ok(skills.includes(ref ?? ''), `missing skill ${ref}`);
    });
  }

  // The planner sets up one page from one seed. A feature with signed-out and signed-in e2e ACs
  // (the contact-form smoke run) needs one planner run per seed, each with its own plan file.
  test('stlc-design plans signed-out and signed-in scenarios in separate planner runs', () => {
    const design = readFileSync(join(SKILLS, 'stlc-design', 'SKILL.md'), 'utf8');
    for (const [seed, plan] of [
      ['tests/e2e/seed.spec.ts', 'stlc/$0/ui-scenarios.md'],
      ['tests/e2e/seed-signed-in.spec.ts', 'stlc/$0/ui-scenarios-signed-in.md'],
    ]) {
      assert.ok(design.includes(`<seed-file>${seed}</seed-file>`), `a planner run seeded with ${seed}`);
      assert.ok(design.includes(`<plan-file>${plan}</plan-file>`), `writing ${plan}`);
    }
    const designer = readFileSync(join(AGENTS, 'stlc-designer.md'), 'utf8');
    assert.ok(designer.includes('ui-scenarios-signed-in.md'), 'the designer reads the signed-in scenarios');
  });

  // stlc/<feature>/ stays uncommitted until the run ends, and `git diff` ignores untracked files,
  // so a diff-based "rerun changed nothing" check always passed (contact-form smoke run).
  test('stlc-report proves the generated block is untouched without relying on git tracking', () => {
    const report = readFileSync(join(SKILLS, 'stlc-report', 'SKILL.md'), 'utf8');
    assert.ok(!/git diff[^\n]*stlc\/\$0/.test(report), 'git diff is blind to an untracked 05');
    assert.ok(report.includes('git hash-object stlc/$0/05-closure.md'), 'compare content hashes instead');
  });

  test('every phase skill checks its own gate first', () => {
    for (const phase of phaseNames) {
      const text = readFileSync(join(SKILLS, `stlc-${phase}`, 'SKILL.md'), 'utf8');
      assert.ok(text.includes(`npm run stlc:gate -- $0 ${phase}\``), `stlc-${phase} must check its gate`);
    }
  });
});
