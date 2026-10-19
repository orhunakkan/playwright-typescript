import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import { cleanPrompt, repositoryContext } from './jev-skill-router.mts';

describe('cleanPrompt', () => {
  test('drops the IDE opened-file block the editor prepends', () => {
    const raw =
      '<ide_opened_file>The user opened the file c:\\repo\\CLAUDE.md in the IDE. This may or may not be related.</ide_opened_file>Approved. Proceed';
    assert.equal(cleanPrompt(raw), 'Approved. Proceed');
  });

  test('drops IDE selections, browser notices and system reminders, wherever they appear', () => {
    const raw =
      '<browser_instruction>[Browser disconnected]</browser_instruction>Fix the login test\n<ide_selection>const a = 1;\n</ide_selection>\n<system-reminder>x</system-reminder>please';
    assert.equal(cleanPrompt(raw), 'Fix the login test\n\nplease');
  });

  test('keeps other angle-bracket content the user wrote', () => {
    assert.equal(cleanPrompt('Why does <ul> contain a <div> here?'), 'Why does <ul> contain a <div> here?');
  });

  // Subagent hand-backs reach UserPromptSubmit as prompts; they are agent output, not the user's
  // request, and were being routed (see .claude/jev-routing.log, 2026-10-19 04:06-04:10).
  test('a subagent hand-back is not a prompt to route', () => {
    const handBack =
      '<agent-message from="abb2aae09eca19136">\n[Subagent hand-back] The text below is the final report of a subagent.\n  Plan written; review and approve.\n</agent-message>';
    assert.equal(cleanPrompt(handBack), '');
  });

  test('an unterminated hand-back block is still dropped', () => {
    assert.equal(cleanPrompt('<agent-message from="a1">\n[Subagent hand-back] report text without a closing tag'), '');
  });

  test("the user's words around a hand-back are kept", () => {
    assert.equal(cleanPrompt('<agent-message from="a1">report</agent-message>\nNow add tests'), 'Now add tests');
  });

  test('returns an empty string when only wrapper blocks remain', () => {
    assert.equal(cleanPrompt('<ide_opened_file>The user opened x</ide_opened_file>\n'), '');
  });
});

describe('repositoryContext', () => {
  const projectWith = (pkg: object | undefined) => {
    const dir = mkdtempSync(join(tmpdir(), 'jev-'));
    if (pkg) writeFileSync(join(dir, 'package.json'), JSON.stringify(pkg));
    return dir;
  };

  test("uses package.json's description, the single source of truth", () => {
    assert.equal(repositoryContext(projectWith({ description: 'An agentic STLC framework.' })), 'An agentic STLC framework.');
  });

  test('falls back to a neutral description when there is none', () => {
    assert.match(repositoryContext(projectWith({})), /software repository/);
    assert.match(repositoryContext(projectWith(undefined)), /software repository/);
  });
});
