import { test, expect } from '@playwright/test';
import { BoardPage, torontoDay } from '../../pages/board.page';

test.describe('Move cards', () => {
  test('dragging a card to another column moves it and its points', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await board.dragCard('SH-01', 'In progress');
    await expect(board.details).toBeHidden();
    await expect(board.cardIds('In progress')).toHaveText(['SH-01']);
    await expect(board.cardIds('To do')).toHaveText(['SH-02', 'SH-03', 'SH-04']);
    await expect(board.columnSummary('To do')).toHaveText('3 · 10 pts');
    await expect(board.columnSummary('In progress')).toHaveText('1 · 3 pts');
  });

  test('the details move a card from the keyboard; Done stamps today and leaving Done clears it', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await board.moveCardWithDetails('SH-02', 'Done');
    await expect(board.cardIds('Done')).toHaveText(['SH-02']);
    await expect(board.columnSummary('Done')).toHaveText('1 · 5 pts');
    await expect(board.card('SH-02')).toContainText('Done Wed 14 Oct');
    await board.moveCardWithDetails('SH-02', 'Review');
    await expect(board.cardIds('Review')).toHaveText(['SH-02']);
    await expect(board.card('SH-02')).toContainText('0/2 tasks');
  });

  test('cards stay where they were put after a reload', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await board.moveCardWithDetails('SH-03', 'Review');
    await board.moveCardWithDetails('SH-04', 'Done');
    await board.reload();
    await expect(board.cardIds('Review')).toHaveText(['SH-03']);
    await expect(board.cardIds('Done')).toHaveText(['SH-04']);
    await expect(board.card('SH-04')).toContainText('Done Wed 14 Oct');
  });
});
