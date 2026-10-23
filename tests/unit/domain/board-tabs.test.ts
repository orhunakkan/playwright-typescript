import { describe, expect, it } from 'vitest';
import {
  defaultSortForTab,
  statusesForTab,
  tabForStatus,
  TABS,
  type BoardSort,
  type Tab,
} from '../../../src/domain/board-tabs.ts';
import { STATUSES, type Status } from '../../../src/domain/status.ts';

// PLAN.md §5.5, written out in full.
const EXPECTED: Record<Tab, { statuses: Status[]; sort: BoardSort }> = {
  new: { statuses: ['new'], sort: 'score' },
  saved: { statuses: ['saved'], sort: 'score' },
  'in-progress': { statuses: ['applied', 'interviewing'], sort: 'changed' },
  closed: { statuses: ['offer', 'rejected'], sort: 'changed' },
  dismissed: { statuses: ['dismissed'], sort: 'changed' },
};

describe('board tabs', () => {
  it('FR-07: has the five tabs of the plan, in order', () => {
    expect(TABS).toEqual(['new', 'saved', 'in-progress', 'closed', 'dismissed']);
  });

  it.each(TABS)('FR-07: the %s tab shows its statuses with its default sort', (tab) => {
    expect(statusesForTab(tab)).toEqual(EXPECTED[tab].statuses);
    expect(defaultSortForTab(tab)).toBe(EXPECTED[tab].sort);
  });

  it('FR-07: every status appears on exactly one tab', () => {
    const shown = TABS.flatMap((tab) => statusesForTab(tab));

    expect([...shown].sort()).toEqual([...STATUSES].sort());
  });

  it.each(STATUSES)('FR-10: a %s job links back to the tab that lists it', (status) => {
    expect(statusesForTab(tabForStatus(status))).toContain(status);
  });

  it('FR-07: with no tab, the list is sorted by score', () => {
    expect(defaultSortForTab(null)).toBe('score');
  });
});
