import { test, expect } from '@playwright/test';
import { BoardPage, torontoDay } from '../../pages/board.page';

test.describe('Lane filter', () => {
  test('shows one lane’s cards and points, and is remembered', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await expect(board.laneFilter('All')).toHaveAttribute('aria-pressed', 'true');
    await board.showLane('Business');
    await expect(board.laneFilter('Business')).toHaveAttribute('aria-pressed', 'true');
    await expect(board.laneFilter('All')).toHaveAttribute('aria-pressed', 'false');
    await expect(board.cardIds('To do')).toHaveText(['SH-03', 'SH-04']);
    await expect(board.columnSummary('To do')).toHaveText('2 · 5 pts');
    await board.reload();
    await expect(board.laneFilter('Business')).toHaveAttribute('aria-pressed', 'true');
    await expect(board.cardIds('To do')).toHaveText(['SH-03', 'SH-04']);
    await board.showLane('Engineering');
    await expect(board.cardIds('To do')).toHaveText(['SH-01', 'SH-02']);
    await board.showLane('All');
    await expect(board.cardIds('To do')).toHaveText(['SH-01', 'SH-02', 'SH-03', 'SH-04']);
  });
});
