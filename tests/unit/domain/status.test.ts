import { describe, expect, it } from 'vitest';
import { canTransition, nextStatuses, STATUSES, type Status } from '../../../src/domain/status.ts';

// PLAN.md §5.4, written out in full so the test doesn't share a table with the code under test.
const ALLOWED: Record<Status, Status[]> = {
  new: ['saved', 'applied', 'dismissed'],
  saved: ['applied', 'dismissed'],
  applied: ['interviewing', 'rejected', 'dismissed'],
  interviewing: ['offer', 'rejected', 'dismissed'],
  offer: [],
  rejected: [],
  dismissed: ['new'],
};

const PAIRS = STATUSES.flatMap((from) => STATUSES.map((to) => [from, to, ALLOWED[from].includes(to)] as const));

describe('status workflow', () => {
  it('FR-08: has exactly the seven statuses of the plan', () => {
    expect(STATUSES).toEqual(['new', 'saved', 'applied', 'interviewing', 'offer', 'rejected', 'dismissed']);
  });

  it('FR-08: covers all 49 from/to pairs', () => {
    expect(PAIRS).toHaveLength(49);
  });

  it.each(PAIRS)('FR-08: %s → %s allowed = %s', (from, to, allowed) => {
    expect(canTransition(from, to)).toBe(allowed);
  });

  it('FR-08: never allows staying in the same status', () => {
    expect(STATUSES.filter((status) => canTransition(status, status))).toEqual([]);
  });

  it('FR-08: offer and rejected are terminal', () => {
    expect(nextStatuses('offer')).toEqual([]);
    expect(nextStatuses('rejected')).toEqual([]);
  });

  it.each(STATUSES)('FR-08: nextStatuses(%s) lists exactly the allowed targets', (from) => {
    expect(nextStatuses(from)).toEqual(ALLOWED[from]);
  });
});
