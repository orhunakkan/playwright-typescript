import { readdirSync, readFileSync } from 'node:fs';
import { HttpError, type TextReply } from './respond.ts';
import type { Route } from './router.ts';

// GET /static/<file> (PLAN.md Phase 6 task 6). The files in public/ are read once at start-up into an allowlist;
// a request only ever looks a name up in that list, so no request path reaches the file system and path
// traversal ("../", encoded or not) can only miss.

const TYPES: Readonly<Record<string, string>> = {
  css: 'text/css; charset=utf-8',
  svg: 'image/svg+xml',
};
const FILE_NAME = /^[a-z0-9-]+\.([a-z0-9]+)$/;

export const PUBLIC_DIR = new URL('../../public/', import.meta.url);

export function loadStaticFiles(dir: URL = PUBLIC_DIR): ReadonlyMap<string, TextReply> {
  const files = new Map<string, TextReply>();
  for (const name of readdirSync(dir)) {
    const contentType = TYPES[FILE_NAME.exec(name)?.[1] ?? ''];
    if (contentType === undefined) continue;
    files.set(name, {
      status: 200,
      text: readFileSync(new URL(name, dir), 'utf8'),
      contentType,
      // Revalidate on every load, so an edited stylesheet shows up after a restart without a stale cache.
      headers: { 'Cache-Control': 'no-cache' },
    });
  }
  return files;
}

export function staticRoutes(files: ReadonlyMap<string, TextReply> = loadStaticFiles()): Route[] {
  return [
    {
      method: 'GET',
      path: '/static/:file',
      handler: (request) => {
        const file = files.get(request.params['file'] ?? '');
        if (file === undefined) throw new HttpError(404, 'not_found', 'There is nothing at this path');
        return file;
      },
    },
  ];
}
