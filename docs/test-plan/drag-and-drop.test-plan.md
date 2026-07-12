# Test Plan: Drag & Drop

**JIRA Story:** [TAB1-30](https://orhunakkan.atlassian.net/browse/TAB1-30)
**Lab URL:** https://stagecraftlabs.com/practice/drag-and-drop
**Date:** 2026-07-11
**Author:** Orhun Akkan

---

## 1. Scope

### In Scope

- `locator.dragTo()` moving a Kanban card from "To Do" to "In Progress", asserting presence in
  the target column and absence from the source column
- Card-count assertions on both source and target columns after a drag (source −1, target +1)
- Constructing a `DataTransfer` with a file buffer in page context (`page.evaluateHandle`) and
  calling `locator.drop({ dataTransfer })` on the file drop zone, asserting the filename appears
- Reordering a sortable list by drag and asserting the resulting order with
  `expect(locator).toHaveText(expectedOrder)`
- Targeting drag handles specifically on cards that contain nested interactive elements (buttons,
  links), to avoid the drag operation accidentally clicking/activating them
- Negative/boundary coverage: same-column no-op drag, boundary-edge drops, draining a column to 0,
  invalid/empty file drop, own-position reorder, first↔last reorder, handle-vs-inner-element
  isolation
- Accessibility scan across load, mid-interaction, and post-drop states
- Performance budget for a single drag-and-drop operation

### Out of Scope

- Touch/mobile drag gestures (covered by the separate Touch & Mobile Gestures lab, TAB1-41)
- Multi-select drag (selecting several cards and dragging as a group), if not present in this lab
- Cross-window or cross-context drag-and-drop

---

## 2. Test Objectives

| #   | Objective                                                                                     |
| --- | ---------------------------------------------------------------------------------------------- |
| 1   | `locator.dragTo()` reliably moves a Kanban card between columns and updates both column states |
| 2   | Column card counts stay accurate after single and multiple sequential drags                    |
| 3   | A file can be dropped onto a drop zone via a page-context `DataTransfer` and is reflected in UI |
| 4   | A sortable list can be reordered by drag and the resulting order is asserted deterministically  |
| 5   | Drag handles isolate the drag gesture from nested interactive elements inside draggable cards   |

---

## 3. Browser Matrix

| Browser         | Playwright Project | Priority |
| --------------- | ------------------- | -------- |
| Chromium        | Desktop Chrome      | P1       |
| Firefox         | Desktop Firefox     | P1       |
| WebKit (Safari) | Desktop Safari      | P2       |
| Edge            | Desktop Edge        | P2       |

Source: `playwright.config.ts` — 4 desktop projects configured.

---

## 4. Environments

| Environment | Base URL                   |
| ----------- | --------------------------- |
| Default     | https://stagecraftlabs.com  |
| QA          | `.env.qa` → `BASE_URL`      |
| UAT         | `.env.uat` → `BASE_URL`     |

---

## 5. Risk Table

| Risk                                                                                          | Priority | Mitigation                                                                                     |
| ----------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `dragTo()` fires on the card container instead of the intended handle, activating a nested button | P1       | Locate and drag the dedicated handle element; assert nested button state is unchanged afterward |
| Native HTML5 file drop requires a real `DataTransfer`, which cannot be constructed off-page       | P1       | Build the `DataTransfer` inside `page.evaluateHandle()` so it's a real page-context object        |
| Sequential drags leave stale locator handles pointing at reflowed DOM nodes                       | P2       | Re-query locators after each drag rather than caching references across drags                     |
| Column/list order assertions are flaky if drop coordinates land on a boundary between two slots   | P2       | Use Playwright's element-center auto-targeting and assert via explicit `toHaveText` order checks  |
| WebKit HTML5 drag-and-drop event sequencing differs from Chromium/Firefox                          | P2       | Prefer Playwright's `dragTo`/`drop` APIs (which simulate the full event sequence) over raw mouse moves |

---

## 6. Entry Criteria

- `https://stagecraftlabs.com/practice/drag-and-drop` is reachable and returns HTTP 200
- The lab page exposes a Kanban board, a file drop zone, and a sortable list
- `test-results/` output directory is writable

## 7. Exit Criteria

- All 5 ACs covered by at least one positive test case
- Each AC has at least one negative or boundary test where applicable
- Axe scan passes across load, mid-interaction, and post-drop states
- Performance test asserts a single drag-and-drop operation completes within budget
- All tests pass locally on Desktop Chrome
- CI run passes across all 4 configured browsers (gates story → Done)

---

## 8. Test Case Summary

| AC     | Test Cases                                                                                  | Types         |
| ------ | ---------------------------------------------------------------------------------------------- | ------------- |
| AC-1   | `dragTo()` moves a card from "To Do" to "In Progress"; present in target, absent from source   | Positive      |
| AC-1-N | Dragging a card within its own column is a no-op — order/column unchanged                       | Negative      |
| AC-1-B | Card dropped near a column boundary still lands inside the intended target column               | Boundary      |
| AC-2   | Card counts update correctly after a drag (source −1, target +1)                                | Positive      |
| AC-2-B | Draining the last card from a column leaves its count at 0                                      | Boundary      |
| AC-2-B | Multiple sequential drags accumulate counts correctly                                           | Boundary      |
| AC-3   | Page-context `DataTransfer` + `locator.drop()` on the file zone surfaces the dropped filename    | Positive      |
| AC-3-N | Dropping an empty/unsupported file shows no filename or a graceful error state                   | Negative      |
| AC-4   | Reordering the sortable list by drag produces the expected order via `toHaveText`                | Positive      |
| AC-4-N | Dragging an item onto its own position preserves the original order                              | Negative      |
| AC-4-B | Dragging the first item to the last position (and vice versa) reorders correctly                | Boundary      |
| AC-5   | Drag handle is targeted specifically on cards with nested interactive elements                   | Positive      |
| AC-5-N | Dragging via the handle does not trigger a nested button's click/nav handler                     | Negative      |
| A11Y   | Axe WCAG 2.1 AA scan across load, mid-interaction, and post-drop states                          | Accessibility |
| PERF   | A single drag-and-drop operation completes within budget                                        | Performance   |
