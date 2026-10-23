// Phase 0 placeholder: proves the api project runs with the built-in fetch. Real tests arrive in Phase 4.
import { describe, expect, it } from 'vitest';

describe('toolchain', () => {
  it('has the built-in fetch API', () => {
    expect(typeof fetch).toBe('function');
    expect(new Response('{}', { status: 201 }).status).toBe(201);
  });
});
