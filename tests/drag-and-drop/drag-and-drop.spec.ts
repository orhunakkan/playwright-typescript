import { test, expect } from '../../fixtures/index';
import { scanWcag } from '../../utilities/accessibility';

// JIRA: https://orhunakkan.atlassian.net/browse/TAB1-30 — Drag & Drop

const LAB_URL = '/practice/drag-and-drop';

test.describe('Drag & Drop', () => {
  test.beforeEach(async ({ page, dragAndDropPage }) => {
    await page.goto(LAB_URL);
    // The board and sortable list hydrate client-side after load — wait for both to be
    // populated before any test reads counts/text, or reads taken immediately after
    // goto() race an empty DOM.
    await expect(dragAndDropPage.columnCards('todo')).toHaveCount(3);
    await expect(dragAndDropPage.sortableListItems).toHaveCount(5);
  });

  // AC-1 & AC-2 (TAB1-30): locator.dragTo() moves a Kanban card between columns; both the
  // membership (present in target, absent from source) and the card-count badges must update.
  test.describe('AC-1 & AC-2 — Kanban board drag between columns', () => {
    test('positive: dragTo() moves a card from To Do to In Progress; present in target, absent from source', async ({ dragAndDropPage }) => {
      const card = dragAndDropPage.card('Write Playwright tests');
      // Drop onto an existing card rather than the empty column area — dropping on the bare
      // column container is unreliable on Chromium engines for this lab's drop handling.
      await card.dragTo(dragAndDropPage.columnCards('in-progress').first());

      await expect(dragAndDropPage.column('in-progress').locator('[aria-label="Write Playwright tests"]')).toBeVisible();
      await expect(dragAndDropPage.column('todo').locator('[aria-label="Write Playwright tests"]')).toHaveCount(0);
    });

    test('positive: card counts update correctly after a drag (source -1, target +1)', async ({ dragAndDropPage }) => {
      const todoCards = dragAndDropPage.columnCards('todo');
      const inProgressCards = dragAndDropPage.columnCards('in-progress');
      await expect(todoCards).toHaveCount(3);
      await expect(inProgressCards).toHaveCount(2);
      const todoBefore = await todoCards.count();
      const inProgressBefore = await inProgressCards.count();

      await dragAndDropPage.card('Review pull request').dragTo(dragAndDropPage.inProgressColumn);

      await expect(dragAndDropPage.columnCards('todo')).toHaveCount(todoBefore - 1);
      await expect(dragAndDropPage.columnCards('in-progress')).toHaveCount(inProgressBefore + 1);
      await expect(dragAndDropPage.columnCountBadge('todo')).toHaveText(String(todoBefore - 1));
      await expect(dragAndDropPage.columnCountBadge('in-progress')).toHaveText(String(inProgressBefore + 1));
    });

    test('negative/AC-1a: dragging a card within its own column is a no-op — order and count unchanged', async ({ dragAndDropPage }) => {
      const before = await dragAndDropPage.columnCards('todo').allTextContents();

      await dragAndDropPage.card('Review pull request').dragTo(dragAndDropPage.todoColumn);

      await expect(dragAndDropPage.columnCards('todo')).toHaveCount(before.length);
      await expect(dragAndDropPage.columnCards('todo')).toHaveText(before);
    });

    test('boundary/AC-1c: a card dropped anywhere in the target column lands inside that column', async ({ dragAndDropPage }) => {
      // Target the column container itself (not a specific card) — the drop should still resolve
      // to the intended column rather than being rejected or misplaced.
      await dragAndDropPage.card('Update documentation').dragTo(dragAndDropPage.doneColumn);

      await expect(dragAndDropPage.column('done').locator('[aria-label="Update documentation"]')).toBeVisible();
      await expect(dragAndDropPage.column('todo').locator('[aria-label="Update documentation"]')).toHaveCount(0);
    });

    test('boundary/AC-2a: draining the last card from a column leaves its count at 0', async ({ dragAndDropPage }) => {
      await expect(dragAndDropPage.columnCards('done')).toHaveCount(1);

      await dragAndDropPage.card('Set up CI pipeline').dragTo(dragAndDropPage.columnCards('in-progress').first());

      await expect(dragAndDropPage.columnCards('done')).toHaveCount(0);
      await expect(dragAndDropPage.doneColumn.locator('h3')).toContainText('0');
    });

    test('boundary/AC-2b: multiple sequential drags accumulate counts correctly', async ({ dragAndDropPage }) => {
      // "Set up CI pipeline" is the stable anchor card in Done throughout — it never moves,
      // so every sequential drop can target an existing card rather than the column container.
      const doneAnchor = dragAndDropPage.card('Set up CI pipeline');

      await dragAndDropPage.card('Write Playwright tests').dragTo(doneAnchor);
      await expect(dragAndDropPage.columnCards('todo')).toHaveCount(2);
      await expect(dragAndDropPage.columnCards('done')).toHaveCount(2);

      await dragAndDropPage.card('Review pull request').dragTo(doneAnchor);
      await expect(dragAndDropPage.columnCards('todo')).toHaveCount(1);
      await expect(dragAndDropPage.columnCards('done')).toHaveCount(3);

      await dragAndDropPage.card('Update documentation').dragTo(doneAnchor);
      await expect(dragAndDropPage.columnCards('todo')).toHaveCount(0);
      await expect(dragAndDropPage.columnCards('done')).toHaveCount(4);
    });

    test('negative/AC-1b: dragging via a stale/non-existent card locator fails gracefully instead of silently no-oping', async ({
      dragAndDropPage,
    }) => {
      const ghostCard = dragAndDropPage.card('Nonexistent Card');
      await expect(ghostCard.dragTo(dragAndDropPage.inProgressColumn, { timeout: 3000 })).rejects.toThrow();
    });
  });

  // AC-5 (TAB1-30): the current lab markup renders Kanban cards as plain draggable elements with
  // no nested buttons/links, so "targeting the handle specifically" is validated as locator
  // precision (an aria-label-scoped locator resolves to exactly one element) and as a
  // non-interference check (dragging a card must not activate unrelated controls on the page).
  test.describe('AC-5 — drag targeting does not interfere with other interactive elements', () => {
    test('positive: the card locator resolves to exactly one unambiguous draggable element', async ({ dragAndDropPage }) => {
      await expect(dragAndDropPage.card('Fix flaky tests')).toHaveCount(1);
    });

    test('negative/AC-5a: dragging a card does not activate unrelated controls (Mark complete stays untouched)', async ({ dragAndDropPage }) => {
      await expect(dragAndDropPage.markCompleteButton).toHaveText('Mark complete');

      await dragAndDropPage.card('Fix flaky tests').dragTo(dragAndDropPage.doneColumn);

      await expect(dragAndDropPage.markCompleteButton).toHaveText('Mark complete');
    });
  });

  // AC-3 (TAB1-30): locator.drop({ files }) simulates an external file drop — Playwright builds
  // the DataTransfer in the page context internally from the supplied file buffer.
  test.describe('AC-3 — file drop zone', () => {
    test('positive: dropping a file buffer surfaces the filename in the drop zone', async ({ dragAndDropPage }) => {
      await dragAndDropPage.dropZone.drop({
        files: { name: 'test-file.txt', mimeType: 'text/plain', buffer: Buffer.from('hello world') },
      });

      await expect(dragAndDropPage.droppedFileText).toContainText('test-file.txt');
    });

    test('negative/AC-3a: dropping with no files is rejected rather than silently accepted', async ({ dragAndDropPage }) => {
      await expect(dragAndDropPage.dropZone.drop({ files: [] })).rejects.toThrow();
      await expect(dragAndDropPage.droppedFileText).toHaveCount(0);
    });
  });

  // AC-4 (TAB1-30): the sortable list is reordered via raw dispatchEvent (see manualDragReorder);
  // the resulting order is asserted with toHaveText against the full expected list.
  test.describe('AC-4 — sortable list reorder', () => {
    test('positive: reordering by drag produces the expected new order', async ({ dragAndDropPage, page }) => {
      await dragAndDropPage.manualDragReorder(dragAndDropPage.sortableItem('Alpha'), dragAndDropPage.sortableItem('Gamma'));

      await expect(dragAndDropPage.sortableListItems).toHaveText(['⠿Beta', '⠿Gamma', '⠿Alpha', '⠿Delta', '⠿Epsilon']);
    });

    test('negative/AC-4a: dragging an item onto its own position preserves the original order', async ({ dragAndDropPage, page }) => {
      const before = await dragAndDropPage.sortableListItems.allTextContents();

      await dragAndDropPage.manualDragReorder(dragAndDropPage.sortableItem('Beta'), dragAndDropPage.sortableItem('Beta'));

      await expect(dragAndDropPage.sortableListItems).toHaveText(before);
    });

    test('boundary/AC-4b: dragging the first item to the last position reorders correctly', async ({ dragAndDropPage, page }) => {
      await dragAndDropPage.manualDragReorder(dragAndDropPage.sortableItem('Alpha'), dragAndDropPage.sortableItem('Epsilon'));

      await expect(dragAndDropPage.sortableListItems).toHaveText(['⠿Beta', '⠿Gamma', '⠿Delta', '⠿Epsilon', '⠿Alpha']);
    });
  });

  test.describe('accessibility (WCAG 2.x, axe)', () => {
    test('no violations at initial load', async ({ page }) => {
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations mid-interaction (after a Kanban drag)', async ({ dragAndDropPage, page }) => {
      await dragAndDropPage.card('Write Playwright tests').dragTo(dragAndDropPage.inProgressColumn);
      expect((await scanWcag(page)).violations).toEqual([]);
    });

    test('no violations in the post-drop success state (file dropped)', async ({ dragAndDropPage, page }) => {
      await dragAndDropPage.dropZone.drop({
        files: { name: 'a11y-check.txt', mimeType: 'text/plain', buffer: Buffer.from('a11y') },
      });
      await expect(dragAndDropPage.droppedFileText).toBeVisible();
      expect((await scanWcag(page)).violations).toEqual([]);
    });
  });
});

// Performance — a single drag-and-drop operation must complete within budget
test.describe('performance @performance', () => {
  test('a single Kanban drag-and-drop operation completes within budget', async ({ dragAndDropPage, page }) => {
    await page.goto(LAB_URL);
    await expect(dragAndDropPage.columnCards('todo')).toHaveCount(3);
    const start = Date.now();

    await dragAndDropPage.card('Write Playwright tests').dragTo(dragAndDropPage.columnCards('in-progress').first());
    await expect(dragAndDropPage.column('in-progress').locator('[aria-label="Write Playwright tests"]')).toBeVisible();

    expect(Date.now() - start).toBeLessThan(5000);
  });
});
