// Job status workflow (PLAN.md §5.4, FR-08). Anything not listed here is an invalid transition.

export const STATUSES = ['new', 'saved', 'applied', 'interviewing', 'offer', 'rejected', 'dismissed'] as const;

export type Status = (typeof STATUSES)[number];

const TRANSITIONS: Readonly<Record<Status, readonly Status[]>> = {
  new: ['saved', 'applied', 'dismissed'],
  saved: ['applied', 'dismissed'],
  applied: ['interviewing', 'rejected', 'dismissed'],
  interviewing: ['offer', 'rejected', 'dismissed'],
  offer: [],
  rejected: [],
  dismissed: ['new'],
};

export function nextStatuses(from: Status): readonly Status[] {
  return TRANSITIONS[from];
}

export function canTransition(from: Status, to: Status): boolean {
  return TRANSITIONS[from].includes(to);
}
