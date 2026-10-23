// Phase 0 placeholder: proves the integration project can load node:sqlite. Real tests arrive in Phase 3.
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';

describe('toolchain', () => {
  it('opens an in-memory node:sqlite database', () => {
    const db = new DatabaseSync(':memory:');
    try {
      const row = db.prepare('SELECT ? AS answer').get(42);
      expect(row).toEqual({ answer: 42 });
    } finally {
      db.close();
    }
  });
});
