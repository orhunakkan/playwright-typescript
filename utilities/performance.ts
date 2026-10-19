// Single-user page-load metrics (not load testing). LCP and layout-shift entries are Chromium-only,
// which is why the perf project runs on Desktop Chrome.
import type { Page, TestInfo } from '@playwright/test';

export type PageLoadMetrics = {
  /** Time to first byte of the document (ms). */
  ttfb: number;
  /** First contentful paint (ms). */
  fcp: number;
  /** Largest contentful paint so far (ms). */
  lcp: number;
  /** Cumulative layout shift, excluding shifts after user input. */
  cls: number;
  domContentLoaded: number;
  /** Bytes over the network for the document and same-origin/TAO resources (cross-origin without TAO report 0). */
  transferSize: number;
};

/** Network profile in CDP units (bytes/sec, ms). */
export type NetworkProfile = { latency: number; downloadThroughput: number; uploadThroughput: number };

// Lighthouse's mobile network values: 150 ms RTT, 1.6 Mbps down, 750 Kbps up.
// https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md
export const SLOW_4G: NetworkProfile = { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 };

/**
 * Throttles every request of the page (Chromium only). Uses Network.emulateNetworkConditionsByRule
 * with a global (empty) pattern; Network.emulateNetworkConditions is deprecated in the CDP version
 * Playwright 1.64 ships.
 */
export async function throttle(page: Page, profile: NetworkProfile): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditionsByRule', { matchedNetworkConditions: [{ urlPattern: '', ...profile }] });
}

/** Reads load metrics for the current document. Call after the page shows its main content. */
export async function measurePageLoad(page: Page, testInfo?: TestInfo): Promise<PageLoadMetrics> {
  const metrics = await page.evaluate(
    () =>
      new Promise<PageLoadMetrics>((resolve) => {
        let lcp = 0;
        let cls = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) lcp = entry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
            if (!entry.hadRecentInput) cls += entry.value;
          }
        }).observe({ type: 'layout-shift', buffered: true });

        // Buffered entries are delivered asynchronously; one task later both observers have reported.
        setTimeout(() => {
          const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
          resolve({
            ttfb: nav.responseStart - nav.startTime,
            fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? 0,
            lcp,
            cls,
            domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
            transferSize: nav.transferSize + resources.reduce((sum, r) => sum + r.transferSize, 0),
          });
        }, 0);
      }),
  );
  await testInfo?.attach('page-load-metrics', { body: JSON.stringify(metrics, null, 2), contentType: 'application/json' });
  return metrics;
}
