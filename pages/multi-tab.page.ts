import { Page, Locator } from '@playwright/test';

export class MultiTabPage {
  // ── Heading & Meta ────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly markCompleteButton: Locator;

  // ── Challenge 1 — New tab ────────────────────────────────────────────
  readonly openNewTabButton: Locator;

  // ── Challenge 2 — Popup window ───────────────────────────────────────
  readonly openPopupButton: Locator;
  readonly openerResultStatus: Locator;

  // ── Challenge 3 — Cross-tab storage ──────────────────────────────────
  readonly sharedStorageValue: Locator;
  readonly reloadStorageButton: Locator;

  constructor(page: Page) {
    // ── Heading & Meta ─────────────────────────────────────────────────
    this.pageHeading = page.getByRole('heading', { name: 'Multi-Tab', exact: true });
    this.markCompleteButton = page.getByRole('button', { name: 'Mark complete' });

    // ── Challenge 1 — New tab ──────────────────────────────────────────
    this.openNewTabButton = page.getByRole('button', { name: 'Open dashboard in new tab' });

    // ── Challenge 2 — Popup window — status region is a dynamically-injected,
    // aria-live announcement of the popup's postMessage result ───────────
    this.openPopupButton = page.getByRole('button', { name: 'Open popup window' });
    this.openerResultStatus = page.locator('#opener-result');

    // ── Challenge 3 — Cross-tab storage — data-testid backs the polled read ─
    this.sharedStorageValue = page.getByTestId('shared-storage-value');
    this.reloadStorageButton = page.getByRole('button', { name: 'Reload to refresh value' });
  }

  // ── Dashboard (new tab) locators — scoped to whichever Page object was
  // captured via context.waitForEvent('page') ─────────────────────────────
  newTabHeading(newTabPage: Page): Locator {
    return newTabPage.getByRole('heading', { name: 'Dashboard (New Tab)' });
  }

  newTabCounter(newTabPage: Page): Locator {
    return newTabPage.getByTestId('tab-counter');
  }

  newTabIncrementButton(newTabPage: Page): Locator {
    return newTabPage.getByRole('button', { name: 'Increment' });
  }

  newTabWriteStorageButton(newTabPage: Page): Locator {
    return newTabPage.getByTestId('write-storage');
  }

  // ── Popup window locators — scoped to the Page object captured via
  // page.waitForEvent('popup') ─────────────────────────────────────────────
  popupHeading(popupPage: Page): Locator {
    return popupPage.getByRole('heading', { name: 'Popup Window' });
  }

  popupValueInput(popupPage: Page): Locator {
    return popupPage.getByRole('textbox', { name: 'Value to send to opener' });
  }

  popupSendResultButton(popupPage: Page): Locator {
    return popupPage.getByRole('button', { name: 'Send result to opener' });
  }
}
