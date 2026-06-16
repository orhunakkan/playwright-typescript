import { Page, Locator } from '@playwright/test';

export class NetworkApiPage {
  readonly page: Page;

  // ── Form ────────────────────────────────────────────────────
  readonly noteInput: Locator;
  readonly addButton: Locator;

  // ── Notes list ──────────────────────────────────────────────
  // ul[aria-label="Notes list"] — aria-label confirmed by DOM inspection
  readonly notesList: Locator;

  // ── Dynamic regions ─────────────────────────────────────────
  // div[role="alert"] injected when the API request fails (e.g. HTTP 500).
  // Confirmed by Chrome DevTools initScript override that returned 500.
  readonly errorRegion: Locator;
  // Placeholder shown when GET /api/notes returns [] — the <ul> is not rendered at all.
  // Confirmed by DOM inspection: notesListExists=false, emptyStateEl="No notes yet. Add one above."
  readonly emptyStateText: Locator;

  // ── Navigation / misc ───────────────────────────────────────
  readonly markCompleteButton: Locator;
  readonly allLabsLink: Locator;
  readonly playwrightDocsLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // ── Form ──────────────────────────────────────────────────
    // Accessible name "Add note" comes from the visible <label> sibling confirmed in a11y snapshot.
    this.noteInput = page.getByRole('textbox', { name: 'Add note' });
    // type="submit" + text "Add"; disabled while input is empty (gated by JS)
    this.addButton = page.getByRole('button', { name: 'Add' });

    // ── Notes list ────────────────────────────────────────────
    this.notesList = page.getByRole('list', { name: 'Notes list' });

    // ── Dynamic regions ───────────────────────────────────────
    this.errorRegion = page.getByRole('alert');
    this.emptyStateText = page.getByText('No notes yet. Add one above.');

    // ── Navigation / misc ─────────────────────────────────────
    this.markCompleteButton = page.getByRole('button', { name: 'Mark complete' });
    this.allLabsLink = page.getByRole('link', { name: '← All labs' });
    this.playwrightDocsLink = page.getByRole('link', { name: 'Playwright Docs' });
  }

  /** Returns the list item for a specific note text. */
  noteItem(text: string): Locator {
    return this.notesList.locator('li').filter({ hasText: text });
  }

  /** Returns the delete button for a specific note (aria-label pattern confirmed by DOM inspection). */
  deleteNoteButton(text: string): Locator {
    return this.page.getByRole('button', { name: `Delete note: ${text}` });
  }
}
