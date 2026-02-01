import { Page } from '@playwright/test';

/**
 * Waits until the DOM has been stable (no mutations) for at least the specified duration.
 *
 * @param page Playwright Page object
 * @param stableMs Number of milliseconds the DOM must be stable (default: 2000)
 */
export async function waitForDomStability(page: Page, stableMs = 2000) {
  await page.waitForFunction((stableMsInner: number) => {
    const now = Date.now();
    const domStateWindow = window as Window & {
      __lastChangeTime?: number;
      __observer?: MutationObserver;
    };

    domStateWindow.__lastChangeTime = domStateWindow.__lastChangeTime || now;

    const observer =
      domStateWindow.__observer ||
      new MutationObserver(() => {
        domStateWindow.__lastChangeTime = Date.now();
      });

    if (!domStateWindow.__observer) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
      domStateWindow.__observer = observer;
    }

    return now - domStateWindow.__lastChangeTime > stableMsInner;
  }, stableMs);
}

/**
 * Navigates to the specified URL and returns the page load time.
 *
 * @param page Playwright Page
 * @param url The URL to navigate to
 */
export async function expectedPageLoadTime(page: Page, url: string) {
  const start = Date.now();
  await page.goto(url);
  const loadTime = Date.now() - start;
  return loadTime;
}
