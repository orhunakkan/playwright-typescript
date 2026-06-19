import { Page, Locator } from '@playwright/test';

export class DebuggingReportingPage {
  private readonly page: Page;

  // ── Flaky Component ───────────────────────────────────────
  readonly flakyButton: Locator;
  readonly clickCountText: Locator;
  // Injected after click: role="status" aria-live="polite" on success
  readonly flakySuccess: Locator;
  // Injected after click: role="alert" on failure (clicks 3, 6, 9…)
  readonly flakyError: Locator;

  // ── Slow Component ────────────────────────────────────────
  readonly slowButton: Locator;
  // Injected ~2 s after click: role="status" aria-live="polite"
  readonly slowResult: Locator;

  // ── Non-deterministic Content ─────────────────────────────
  // Updates every second; assert with regex, never exact text
  readonly liveCounter: Locator;

  // ── Screenshot Attachment Panel ───────────────────────────
  // Button label toggles between "Expand panel" / "Collapse panel"
  readonly expandPanelButton: Locator;
  readonly expandablePanel: Locator;

  constructor(page: Page) {
    this.page = page;

    // ── Flaky Component ───────────────────────────────────────
    this.flakyButton = page.getByTestId('flaky-button');
    this.clickCountText = page.locator('p', { hasText: 'Click count:' });
    this.flakySuccess = page.getByTestId('flaky-success');
    this.flakyError = page.getByTestId('flaky-error');

    // ── Slow Component ────────────────────────────────────────
    this.slowButton = page.getByTestId('slow-button');
    this.slowResult = page.getByTestId('slow-result');

    // ── Non-deterministic Content ─────────────────────────────
    this.liveCounter = page.getByTestId('live-counter');

    // ── Screenshot Attachment Panel ───────────────────────────
    this.expandPanelButton = page.getByRole('button', { name: /expand panel|collapse panel/i });
    this.expandablePanel = page.getByTestId('expandable-panel');
  }

  async goto() {
    await this.page.goto('/practice/debugging-reporting');
  }

  async clickFlakyButton() {
    await this.flakyButton.click();
  }

  async triggerSlowOperation() {
    await this.slowButton.click();
  }

  async togglePanel() {
    await this.expandPanelButton.click();
  }

  isPanelExpanded(): Promise<string | null> {
    return this.expandPanelButton.getAttribute('aria-expanded');
  }
}
