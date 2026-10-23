// Phase 0 placeholder: proves the contract project can validate with Zod. Real tests arrive in Phase 4.
import { z } from 'zod';
import { describe, expect, it } from 'vitest';

describe('toolchain', () => {
  it('validates the API error envelope shape with Zod', () => {
    const ErrorEnvelope = z.object({
      error: z.object({ code: z.string(), message: z.string(), details: z.unknown().optional() }),
    });

    expect(ErrorEnvelope.safeParse({ error: { code: 'not_found', message: 'Job 7 not found' } }).success).toBe(true);
    expect(ErrorEnvelope.safeParse({ error: { code: 404 } }).success).toBe(false);
  });
});
