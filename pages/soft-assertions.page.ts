import { Page, Locator } from '@playwright/test';

export class SoftAssertionsPage {
  // ── Heading & Meta ────────────────────────────────────────────────────
  readonly pageHeading: Locator;
  readonly markCompleteButton: Locator;

  // ── Activity Score Widget ────────────────────────────────────────────
  readonly activityScoreValue: Locator;

  // ── Account Status Widget ────────────────────────────────────────────
  readonly accountStatusBadge: Locator;

  // ── Profile Widget ───────────────────────────────────────────────────
  readonly profileList: Locator;
  readonly profileNameField: Locator;
  readonly profileEmailField: Locator;
  readonly profileRoleField: Locator;

  // ── Notifications Widget ─────────────────────────────────────────────
  readonly notificationCount: Locator;

  constructor(page: Page) {
    // ── Heading & Meta ─────────────────────────────────────────────────
    this.pageHeading = page.getByRole('heading', { name: 'Soft Assertions & Test Steps' });
    this.markCompleteButton = page.getByRole('button', { name: 'Mark complete' });

    // ── Activity Score Widget — data-testid backs the polled read ───────
    this.activityScoreValue = page.getByTestId('activity-score');

    // ── Account Status Widget — no role/id, animated badge ──────────────
    this.accountStatusBadge = page.getByLabel('Status badge');

    // ── Profile Widget ───────────────────────────────────────────────────
    this.profileList = page.getByRole('list', { name: 'Profile completeness' });
    this.profileNameField = page.getByRole('listitem', { name: 'Name field' });
    this.profileEmailField = page.getByRole('listitem', { name: 'Email field' });
    this.profileRoleField = page.getByRole('listitem', { name: 'Role field' });

    // ── Notifications Widget — data-testid backs the assertion ──────────
    this.notificationCount = page.getByTestId('notification-count');
  }
}
