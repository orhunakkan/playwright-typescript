import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

// NFR-02: the dependency list is exactly the one approved in PLAN.md §7, with no overrides.
// NFR-03: the app never makes an outbound request, so it can't reach linkedin.com (or anything else) by itself.

const root = fileURLToPath(new URL('../../', import.meta.url));

const PackageSchema = z.object({
  dependencies: z.record(z.string(), z.string()),
  devDependencies: z.record(z.string(), z.string()),
  overrides: z.unknown().optional(),
});

describe('dependencies (NFR-02)', () => {
  const packageJson = PackageSchema.parse(JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')));

  it('NFR-02: the runtime dependency is zod only', () => {
    expect(Object.keys(packageJson.dependencies)).toEqual(['zod']);
  });

  it('NFR-02: the dev dependencies are exactly the approved list', () => {
    expect(Object.keys(packageJson.devDependencies).sort()).toEqual(
      [
        'typescript',
        '@types/node',
        'eslint',
        '@eslint/js',
        'typescript-eslint',
        'prettier',
        'vite',
        'vitest',
        '@vitest/coverage-v8',
        '@playwright/test',
        '@axe-core/playwright',
        '@types/k6',
      ].sort(),
    );
    expect(packageJson.devDependencies['typescript']).toBe('~6.0.3');
  });

  it('NFR-02: package.json has no overrides', () => {
    expect(packageJson.overrides).toBeUndefined();
  });
});

describe('no outbound requests (NFR-03)', () => {
  function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const path = join(dir, name);
      return statSync(path).isDirectory() ? sourceFiles(path) : path.endsWith('.ts') ? [path] : [];
    });
  }
  const files = sourceFiles(join(root, 'src'));

  it('NFR-03: the app code has files to check', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  it.each(files.map((path) => [path.slice(root.length).replaceAll('\\', '/'), path] as const))(
    'NFR-03: %s makes no outbound request',
    (_name, path) => {
      const code = readFileSync(path, 'utf8');

      // No HTTP client, socket or child process: the server only answers requests, it never sends one.
      expect(code).not.toMatch(/\bfetch\(|XMLHttpRequest|WebSocket|node:https|node:net|node:tls|node:child_process/);
      // node:http is only used for the server: its client functions are never imported.
      const httpImports = /import (?:type )?\{([^}]*)\} from 'node:http'/.exec(code)?.[1] ?? '';
      expect(httpImports).not.toMatch(/\b(?:request|get)\b/);
    },
  );
});
