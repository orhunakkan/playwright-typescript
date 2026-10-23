import type { Status } from './status.ts';

// Board tabs (PLAN.md §5.5, FR-07): which statuses each tab shows and how it is sorted by default.

export const TABS = ['new', 'saved', 'in-progress', 'closed', 'dismissed'] as const;

export type Tab = (typeof TABS)[number];

/** score: best first, unscored last. recent: newest first seen. changed: newest status change. */
export type BoardSort = 'score' | 'recent' | 'changed';

const TAB_STATUSES: Readonly<Record<Tab, readonly Status[]>> = {
  new: ['new'],
  saved: ['saved'],
  'in-progress': ['applied', 'interviewing'],
  closed: ['offer', 'rejected'],
  dismissed: ['dismissed'],
};

const TAB_SORT: Readonly<Record<Tab, BoardSort>> = {
  new: 'score',
  saved: 'score',
  'in-progress': 'changed',
  closed: 'changed',
  dismissed: 'changed',
};

export function statusesForTab(tab: Tab): readonly Status[] {
  return TAB_STATUSES[tab];
}

/** The tab's own order, or score order when no tab is chosen. */
export function defaultSortForTab(tab: Tab | null): BoardSort {
  return tab === null ? 'score' : TAB_SORT[tab];
}
