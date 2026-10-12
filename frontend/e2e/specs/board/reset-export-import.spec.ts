import { readFileSync, writeFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { BoardPage, torontoDay } from '../../pages/board.page';

test.describe('Reset, export and import', () => {
  test('reset asks first, then sends only this sprint’s cards back to To do', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14'), sprint: 2 });
    await board.moveCardWithDetails('SH-05', 'Review');
    await board.chooseSprint('Sprint 1 · Fire up the kitchen');
    await board.moveCardWithDetails('SH-01', 'Done');
    await board.openDetails('SH-02');
    await board.task('Cost the channa').check();
    await board.closeDetails();
    await board.resetButton.click();
    await expect(board.resetButton).toHaveText('Move this sprint’s cards back to To do?');
    await expect(board.cardIds('Done')).toHaveText(['SH-01']);
    await board.resetButton.click();
    await expect(board.cardIds('To do')).toHaveText(['SH-01', 'SH-02', 'SH-03', 'SH-04']);
    await expect(board.card('SH-02')).toContainText('0/2 tasks');
    await expect(board.status).toHaveText('Sprint 1 reset');
    await board.chooseSprint('Sprint 2 · Open the stall');
    await expect(board.cardIds('Review')).toHaveText(['SH-05']);
  });

  test('an export brings the board back in a browser that has lost it', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await board.moveCardWithDetails('SH-01', 'Done');
    await board.openDetails('SH-02');
    await board.task('Cost the channa').check();
    await board.closeDetails();
    const file = await board.exportBoard();
    expect(file.name).toBe('sweet-hand-board-2026-10-14.json');
    await board.forgetSavedBoard();
    await expect(board.cardIds('Done')).toHaveCount(0);
    await board.importBoard(file.path);
    await expect(board.status).toHaveText('Board imported');
    await expect(board.cardIds('Done')).toHaveText(['SH-01']);
    await expect(board.card('SH-02')).toContainText('1/2 tasks');
    await board.reload();
    await expect(board.cardIds('Done')).toHaveText(['SH-01']);
    expect(JSON.parse(readFileSync(file.path, 'utf8')).cards['SH-01'].col).toBe('done');
  });

  test('a file that isn’t an export changes nothing', async ({ page }, testInfo) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await board.moveCardWithDetails('SH-01', 'Review');
    const path = testInfo.outputPath('not-a-board.json');
    writeFileSync(path, '{"hello": "world"}');
    await board.importBoard(path);
    await expect(board.status).toHaveText('That file isn’t a board export. Nothing changed.');
    await expect(board.cardIds('Review')).toHaveText(['SH-01']);
  });
});
