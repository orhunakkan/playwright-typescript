// The playwright-test MCP server (analyst, planner, generator) runs a seed with pauseAtEnd and no
// timeout, so its browser stays open and records video into the output dir. On Windows a host run
// then blocks on clearing that dir (contact-form smoke run). MCP sessions get their own dir.
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import type { PlaywrightTestConfig } from '@playwright/test';

const CONFIG = pathToFileURL(join(import.meta.dirname, '..', 'playwright.config.ts')).href;
const FLAG = 'APF_MCP_SESSION';

async function loadConfig(argv: string[], flag?: string): Promise<PlaywrightTestConfig> {
  const saved = { argv: process.argv, flag: process.env[FLAG] };
  process.argv = argv;
  if (flag === undefined) delete process.env[FLAG];
  else process.env[FLAG] = flag;
  try {
    return ((await import(`${CONFIG}?case=${Math.random()}`)) as { default: PlaywrightTestConfig }).default;
  } finally {
    process.argv = saved.argv;
    if (saved.flag === undefined) delete process.env[FLAG];
    else process.env[FLAG] = saved.flag;
  }
}

describe('playwright.config.ts output dir', () => {
  test('a host run writes to test-results with video on failure', async () => {
    const config = await loadConfig(['node', 'cli.js', 'test']);
    assert.equal(config.outputDir, 'test-results');
    assert.equal(config.use?.video, 'retain-on-failure');
  });

  test('the MCP test server writes to test-results-mcp without video', async () => {
    const config = await loadConfig(['node', 'cli.js', 'run-test-mcp-server']);
    assert.equal(config.outputDir, 'test-results-mcp');
    assert.equal(config.use?.video, 'off');
    assert.equal(process.env[FLAG], undefined, 'the test restores the env');
  });

  test("the MCP server's workers, which load the config again, agree", async () => {
    const config = await loadConfig(['node', 'workerProcessEntry.js'], '1');
    assert.equal(config.outputDir, 'test-results-mcp');
    assert.equal(config.use?.video, 'off');
  });
});
