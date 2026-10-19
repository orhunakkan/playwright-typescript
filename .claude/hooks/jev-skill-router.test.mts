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
