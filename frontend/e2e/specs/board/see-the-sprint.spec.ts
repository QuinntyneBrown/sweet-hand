import { test, expect } from '@playwright/test';
import { BoardPage, torontoDay } from '../../pages/board.page';

test.describe('See the sprint', () => {
  test('opens on the sprint that holds today, with its goal and every story still to do', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await expect(board.sprintName).toHaveText('Fire up the kitchen');
    await expect(board.sprintDates).toHaveText('Sprint 1 · Mon 12 Oct – Fri 23 Oct 2026');
    await expect(board.goal).toHaveText(['The menu is written.', 'The market stall is booked.']);
    await expect(board.cardIds('To do')).toHaveText(['SH-01', 'SH-02', 'SH-03', 'SH-04']);
    await expect(board.columnSummary('To do')).toHaveText('4 · 13 pts');
    for (const column of ['In progress', 'Review', 'Done'] as const) {
      await expect(board.cardIds(column)).toHaveCount(0);
      await expect(board.columnSummary(column)).toHaveText('0 · 0 pts');
    }
    await expect(board.card('SH-01')).toContainText('Write the menu page');
    await expect(board.card('SH-01')).toContainText('Engineering');
    await expect(board.card('SH-01')).toContainText('0/3 tasks');
  });

  test('opens on the next sprint between sprints, the first before them and the last after them', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-25') });
    await expect(board.sprintName).toHaveText('Open the stall');
    await board.open({ today: torontoDay('2026-10-01') });
    await expect(board.sprintName).toHaveText('Fire up the kitchen');
    await board.open({ today: torontoDay('2026-12-15') });
    await expect(board.sprintName).toHaveText('Open the stall');
  });

  test('the address and the sprint picker choose the sprint', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14'), sprint: 2 });
    await expect(board.sprintName).toHaveText('Open the stall');
    await expect(board.cardIds('To do')).toHaveText(['SH-05', 'SH-06']);
    await board.chooseSprint('Sprint 1 · Fire up the kitchen');
    await expect(board.sprintName).toHaveText('Fire up the kitchen');
    await expect(page).toHaveURL(/\?sprint=1$/);
  });
});
