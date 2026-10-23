import { describe, expect, it } from 'vitest';
import { TABS } from '../../../src/domain/board-tabs.ts';
import { STATUSES } from '../../../src/domain/status.ts';
import { ACTION_LABELS, formatDateTime, STATUS_LABELS, TAB_LABELS, timeAgo } from '../../../src/ui/format.ts';

describe('display formats', () => {
  it('FR-07, FR-08: every status and tab has a label and every status an action', () => {
    expect(Object.keys(STATUS_LABELS).sort()).toEqual([...STATUSES].sort());
    expect(Object.keys(ACTION_LABELS).sort()).toEqual([...STATUSES].sort());
    expect(Object.keys(TAB_LABELS).sort()).toEqual([...TABS].sort());
  });

  it('FR-11: formats a time as month, day and clock time in the given zone', () => {
    expect(formatDateTime('2026-10-23T21:10:00Z', 'America/Chicago')).toBe('Oct 23, 4:10 PM');
    expect(formatDateTime('2026-01-05T09:03:00Z', 'UTC')).toBe('Jan 5, 9:03 AM');
  });

  it.each([
    ['2026-10-23T12:00:00Z', 'just now'],
    ['2026-10-23T12:00:30Z', 'just now'], // in the future: clocks can disagree slightly
    ['2026-10-23T11:59:01Z', 'just now'],
    ['2026-10-23T11:59:00Z', '1 min ago'],
    ['2026-10-23T11:01:00Z', '59 min ago'],
    ['2026-10-23T11:00:00Z', '1 h ago'],
    ['2026-10-22T12:00:01Z', '23 h ago'],
    ['2026-10-22T12:00:00Z', '1 d ago'],
    ['2026-10-01T12:00:00Z', '22 d ago'],
  ])('FR-07: %s is shown as "%s" at noon on Oct 23', (iso, expected) => {
    expect(timeAgo(iso, '2026-10-23T12:00:00Z')).toBe(expected);
  });
});
