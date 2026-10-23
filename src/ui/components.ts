import type { JobRecord } from '../db/repositories/jobs.ts';
import { nextStatuses } from '../domain/status.ts';
import { ACTION_LABELS } from './format.ts';
import { html, type SafeHtml } from './html.ts';

// Pieces shared by the board and the job detail page (PLAN.md §6.3).

const LABEL_TEXT = { strong: 'Strong', possible: 'Possible', weak: 'Weak' } as const;

/** The score as a number and a word: color is never the only signal (§6.3). */
export function scoreBadge(job: Pick<JobRecord, 'score' | 'scoreLabel'>): SafeHtml {
  if (job.score === null || job.scoreLabel === null) return html`<span class="score score-none">Unscored</span>`;
  return html`<span class="score score-${job.scoreLabel}"
    ><span class="score-value">${job.score}</span> <span class="score-label">${LABEL_TEXT[job.scoreLabel]}</span></span
  >`;
}

/** The canonical LinkedIn link (§5.3), opened by the owner; the app itself never fetches it (NFR-03). */
export function linkedinLink(job: Pick<JobRecord, 'url'>): SafeHtml {
  return html`<a class="external" href="${job.url}" target="_blank" rel="noopener noreferrer"
    >Open on LinkedIn<span aria-hidden="true"> ↗</span><span class="visually-hidden"> (opens in a new tab)</span></a
  >`;
}

export function flags(job: Pick<JobRecord, 'activelyHiring' | 'easyApply'>): SafeHtml {
  return html`${job.activelyHiring && html` <span class="flag">Actively hiring</span>`}${
    job.easyApply && html` <span class="flag">Easy Apply</span>`
  }`;
}

/** One small form per allowed next status (§5.4); the server checks the transition again. */
export function statusButtons(job: Pick<JobRecord, 'id' | 'status'>, returnTo: string): SafeHtml {
  return html`${nextStatuses(job.status).map(
    (status) =>
      html`<form class="inline-form" method="post" action="/jobs/${job.id}/status">
        <input type="hidden" name="status" value="${status}" />
        <input type="hidden" name="return" value="${returnTo}" />
        <button type="submit" class="button${status === 'dismissed' ? ' button-quiet' : ''}">
          ${ACTION_LABELS[status]}
        </button>
      </form>`,
  )}`;
}

/** A polite status message after a form post, announced by screen readers. */
export function notice(message: SafeHtml | string): SafeHtml {
  return html`<p class="notice" role="status">${message}</p>`;
}
