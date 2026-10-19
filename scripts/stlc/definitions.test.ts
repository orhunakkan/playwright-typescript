// Static checks for the agent and skill definitions in .claude/, since their behaviour can only be
// exercised in a live Claude Code session: names match files, tools exist, and every command a
// definition tells Claude to run is a real npm script.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';

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
