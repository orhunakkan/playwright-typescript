// Phase 0 placeholder: proves the unit project runs. Real unit tests arrive in Phase 1.
import { describe, expect, it } from 'vitest';

describe('toolchain', () => {
  it('NFR-10: runs on Node 24 or newer', () => {
    const major = Number(process.versions.node.split('.')[0]);
    expect(major).toBeGreaterThanOrEqual(24);
  });
});
