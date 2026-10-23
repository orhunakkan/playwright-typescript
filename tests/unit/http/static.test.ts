import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import { HttpError } from '../../../src/http/respond.ts';
import { loadStaticFiles, staticRoutes } from '../../../src/http/static.ts';

describe('static files', () => {
  let dir = '';
  afterEach(() => {
    if (dir !== '') rmSync(dir, { recursive: true, force: true });
  });

  function folder(files: Record<string, string>): URL {
    dir = mkdtempSync(join(tmpdir(), 'static-'));
    for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
    return pathToFileURL(`${dir}/`);
  }

  it('NFR-08: loads only kebab-case CSS and SVG files from the folder', () => {
    const files = loadStaticFiles(
      folder({
        'app.css': 'a{}',
        'icon.svg': '<svg/>',
        'secret.json': '{}',
        'Upper.css': 'x',
        '.env': 'X=1',
        'x.js': '',
      }),
    );

    expect([...files.keys()].sort()).toEqual(['app.css', 'icon.svg']);
    expect(files.get('app.css')).toMatchObject({ status: 200, text: 'a{}', contentType: 'text/css; charset=utf-8' });
  });

  it('NFR-08: the route answers only names in the allowlist', () => {
    const [route] = staticRoutes(loadStaticFiles(folder({ 'app.css': 'a{}' })));
    const get = (file: string) =>
      route?.handler({ method: 'GET', path: '', params: { file }, query: new URLSearchParams(), body: undefined });

    expect(get('app.css')).toMatchObject({ text: 'a{}' });
    expect(() => get('../package.json')).toThrow(HttpError);
    expect(() => get('')).toThrow(HttpError);
  });

  it('FR-07: the real public folder has the stylesheet and the icon', () => {
    expect([...loadStaticFiles().keys()].sort()).toEqual(['app.css', 'favicon.svg']);
  });
});
