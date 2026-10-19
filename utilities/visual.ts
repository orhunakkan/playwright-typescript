import type { Locator, Page } from '@playwright/test';

/**
 * Regions whose pixels change between runs for reasons unrelated to the UI under test (live widgets,
 * rotating banners). Masked in every screenshot. Target-specific: update this list for a new target.
 */
export const dynamicRegions = (page: Page): Locator[] => [
  page.getByTestId('chat-toggle'),
  page.getByTestId('live-activity-toggle'),
  page.getByTestId('notification-bar'),
  // Footer build stamp ("v2.5 | Built 2026-10-11 | Angular 20.0.5") changes on every deploy.
  page.getByText(/Built \d{4}-\d{2}-\d{2}/),
];
