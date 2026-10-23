import type { JobRecord } from '../../db/repositories/jobs.ts';
import { TABS, type BoardSort, type Tab } from '../../domain/board-tabs.ts';
import { BOARD_SORTS } from '../../schemas/pages.ts';
import { flags, linkedinLink, notice, scoreBadge, statusButtons } from '../components.ts';
import { STATUS_LABELS, TAB_LABELS, timeAgo } from '../format.ts';
import { html, raw, type SafeHtml } from '../html.ts';
import { CURRENT } from '../layout.ts';

// The board (FR-07, PLAN.md §6.3): tabs with counts, filters, ranked job cards with status actions, paging.

export interface BoardView {
  tab: Tab;
  minScore: number | undefined;
  q: string | undefined;
  sort: BoardSort;
  page: number;
  pageSize: number;
  items: readonly JobRecord[];
  total: number;
  counts: Readonly<Record<Tab, number>>;
  changed: JobRecord | null;
  now: string;
}

const MIN_SCORES = [50, 60, 70, 75, 80, 90] as const;
const SORT_LABELS: Readonly<Record<BoardSort, string>> = {
  score: 'Score',
  recent: 'Newest',
  changed: 'Last status change',
};

export function boardPage(view: BoardView): SafeHtml {
  const hasFilters = view.minScore !== undefined || (view.q ?? '') !== '';
  const first = (view.page - 1) * view.pageSize + 1;
  const last = first + view.items.length - 1;
  const returnTo = boardHref(view, { page: view.page });

  return html`
    <h1>Board</h1>
    ${
      view.changed !== null &&
      notice(
        html`<a href="/jobs/${view.changed.id}">${view.changed.title}</a> is now ${STATUS_LABELS[view.changed.status]}.`,
      )
    }
    <nav aria-label="Board tabs">
      <ul class="tabs">
        ${TABS.map(
          (tab) =>
            html`<li>
              <a href="/?tab=${tab}" ${tab === view.tab && CURRENT}
                >${TAB_LABELS[tab]} <span class="count">${view.counts[tab]}</span></a
              >
            </li>`,
        )}
      </ul>
    </nav>

    <form class="filters" method="get" action="/" role="search" aria-label="Filter jobs">
      <input type="hidden" name="tab" value="${view.tab}" />
      <div class="field">
        <label for="minScore">Min score</label>
        <select id="minScore" name="minScore">
          <option value="">Any</option>
          ${MIN_SCORES.map(
            (score) => html`<option value="${score}" ${score === view.minScore && SELECTED}>${score}+</option>`,
          )}
        </select>
      </div>
      <div class="field field-grow">
        <label for="q">Search</label>
        <input id="q" name="q" type="search" value="${view.q ?? ''}" placeholder="Title or company" maxlength="200" />
      </div>
      <div class="field">
        <label for="sort">Sort</label>
        <select id="sort" name="sort">
          ${BOARD_SORTS.map(
            (sort) => html`<option value="${sort}" ${sort === view.sort && SELECTED}>${SORT_LABELS[sort]}</option>`,
          )}
        </select>
      </div>
      <button type="submit" class="button">Apply</button>
      ${hasFilters && html`<a class="clear" href="/?tab=${view.tab}">Clear filters</a>`}
    </form>

    <h2 class="visually-hidden">${TAB_LABELS[view.tab]} jobs</h2>
    ${
      view.items.length === 0
        ? emptyState(view, hasFilters)
        : html`<p class="results">Showing ${first}–${last} of ${view.total}</p>
            <ol class="cards">
              ${view.items.map((job) => card(job, view.now, returnTo))}
            </ol>
            ${pager(view)}`
    }
  `;
}

const SELECTED = raw('selected');

function card(job: JobRecord, now: string, returnTo: string): SafeHtml {
  const titleId = `job-${String(job.id)}-title`;
  return html`<li>
    <article class="card" aria-labelledby="${titleId}">
      <div class="card-score">${scoreBadge(job)}</div>
      <div class="card-body">
        <h3 class="card-title" id="${titleId}"><a href="/jobs/${job.id}">${job.title}</a></h3>
        <p class="card-meta">
          ${job.company}${job.location !== '' && html` · ${job.location}`}${
            job.status !== 'new' && html` · <span class="status">${STATUS_LABELS[job.status]}</span>`
          }${flags(job)}
        </p>
        ${job.scoreReason !== null && html`<p class="card-reason">${job.scoreReason}</p>`}
        <div class="card-actions">
          ${statusButtons(job, returnTo)} ${linkedinLink(job)}
          <span class="card-seen">Seen ${job.seenCount}× · ${timeAgo(job.firstSeenAt, now)}</span>
        </div>
      </div>
    </article>
  </li>`;
}

function emptyState(view: BoardView, hasFilters: boolean): SafeHtml {
  if (hasFilters) {
    return html`<p class="empty">No jobs match these filters. <a href="/?tab=${view.tab}">Clear filters</a></p>`;
  }
  if (view.tab === 'new') {
    return html`<p class="empty">
      No new jobs. Run <code>/find-jobs</code> in Claude Code to read your latest LinkedIn alerts.
    </p>`;
  }
  return html`<p class="empty">No jobs in ${TAB_LABELS[view.tab]}.</p>`;
}

function pager(view: BoardView): SafeHtml | false {
  const pages = Math.ceil(view.total / view.pageSize);
  if (pages <= 1) return false;
  return html`<nav class="pager" aria-label="Pages">
    ${view.page > 1 && html`<a href="${boardHref(view, { page: view.page - 1 })}" rel="prev">← Previous</a>`}
    <span>Page ${view.page} of ${pages}</span>
    ${view.page < pages && html`<a href="${boardHref(view, { page: view.page + 1 })}" rel="next">Next →</a>`}
  </nav>`;
}

/** The board URL with the current tab, filters and sort, for links and for forms to come back to. */
function boardHref(view: BoardView, change: { page: number }): string {
  const params = new URLSearchParams({ tab: view.tab });
  if (view.minScore !== undefined) params.set('minScore', String(view.minScore));
  if (view.q !== undefined && view.q !== '') params.set('q', view.q);
  params.set('sort', view.sort);
  if (change.page > 1) params.set('page', String(change.page));
  return `/?${params.toString()}`;
}
