import { Page, Locator } from '@playwright/test';

export class AsyncUiPage {
  readonly page: Page;

  // ── Delayed content — actions ────────────────────────────
  readonly loadArticlesButton: Locator;
  readonly loadWithErrorButton: Locator;
  readonly retryButton: Locator;

  // ── Delayed content — loading state ──────────────────────
  // Transient indicator injected while the ~1.5 s fetch is in flight.
  // The div carries text "Loading articles…"; inner .animate-spin span is the spinner.
  readonly loadingIndicator: Locator;

  // ── Delayed content — success state ──────────────────────
  // Four <article> elements rendered inside div.space-y-3 after load settles.
  readonly articleItems: Locator;

  // ── Delayed content — error state ────────────────────────
  // role="alert" injected by "Load with error"; filtered by text to distinguish from toast.
  readonly errorAlert: Locator;

  // ── Auto-polling ticker ───────────────────────────────────
  // data-testid is the most stable hook — the price text changes every 2 s.
  // aria-label on stockPrice follows the pattern "Stock price $XXX".
  readonly stockPrice: Locator;
  readonly lastUpdated: Locator;

  // ── Transient notification (toast) ───────────────────────
  // Fixed-position role="alert" with aria-live="assertive"; auto-dismisses after 800 ms.
  readonly triggerNotificationButton: Locator;
  readonly toastNotification: Locator;
  readonly toastTitle: Locator;
  readonly toastBody: Locator;
  readonly dismissNotificationButton: Locator;

  // ── Nav ───────────────────────────────────────────────────
  readonly markCompleteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // ── Delayed content — actions ──────────────────────────
    this.loadArticlesButton = page.getByRole('button', { name: 'Load articles' });
    this.loadWithErrorButton = page.getByRole('button', { name: 'Load with error' });
    this.retryButton = page.getByRole('button', { name: 'Retry' });

    // ── Delayed content — loading state ────────────────────
    this.loadingIndicator = page.getByText('Loading articles', { exact: false });

    // ── Delayed content — success state ────────────────────
    this.articleItems = page.getByRole('article');

    // ── Delayed content — error state ──────────────────────
    this.errorAlert = page.getByRole('alert').filter({ hasText: 'Failed to load articles' });

    // ── Auto-polling ticker ────────────────────────────────
    this.stockPrice = page.getByTestId('stock-price');
    this.lastUpdated = page.getByTestId('last-updated');

    // ── Transient notification (toast) ─────────────────────
    this.triggerNotificationButton = page.getByRole('button', { name: 'Trigger notification' });
    // aria-live="assertive" distinguishes the toast alert from the error alert
    this.toastNotification = page.locator('[role="alert"][aria-live="assertive"]');
    this.toastTitle = this.toastNotification.getByText('Notification sent');
    this.toastBody = this.toastNotification.getByText('Your request was processed.');
    this.dismissNotificationButton = page.getByRole('button', { name: 'Dismiss notification' });

    // ── Nav ───────────────────────────────────────────────
    this.markCompleteButton = page.getByRole('button', { name: 'Mark complete' });
  }
}
