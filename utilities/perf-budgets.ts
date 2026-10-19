// Google's "good" thresholds: LCP and CLS from https://web.dev/articles/vitals, TTFB from
// https://web.dev/articles/ttfb. These are the targets every page should meet.
export const GOOD = { lcp: 2500, cls: 0.1, ttfb: 800 } as const;

// Current-state ceilings for metrics that already miss GOOD, so they cannot silently get worse while
// the finding is open. Worst of 5 calibration runs (2026-10-19) plus ~15%. Ask before raising them.
// Home on slow 4G measured LCP 2760–2936 ms and CLS 0.258 on every run.
export const HOME_SLOW_4G_CEILING = { lcp: 3400, cls: 0.3 } as const;
