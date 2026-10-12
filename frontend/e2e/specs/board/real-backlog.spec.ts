import { test, expect } from '@playwright/test';
import { BoardPage, torontoDay } from '../../pages/board.page';

test.describe('The launch backlog', () => {
  test('the board shows the sprints and stories of docs/plans/launch-backlog.md', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14'), backlog: 'real' });
    await expect(board.sprintPicker.locator('option')).toHaveText([
      'Sprint 1 · Decide and start',
      'Sprint 2 · Founding caterers build their pages on production',
      'Sprint 3 · The directory is full and the release is frozen',
      'Sprint 4 · Launch and hold',
    ]);
    await expect(board.sprintName).toHaveText('Decide and start');
    await expect(board.cardIds('To do').first()).toHaveText('SH-01');
  });
});
