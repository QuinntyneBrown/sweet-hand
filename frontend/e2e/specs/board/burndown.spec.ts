import { test, expect } from '@playwright/test';
import { BoardPage, torontoDay } from '../../pages/board.page';

// The fictional Sprint 1 has 13 points over ten working days, Mon 12 Oct to Fri 23 Oct.
test.describe('Burndown', () => {
  test('before the sprint it waits for the first day', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-08'), sprint: 1 });
    await expect(board.pace).toHaveText('Starts Mon 12 Oct');
    await expect(board.burndownStats).toHaveText(['13 of 13 pts left', '0 of 4 stories done', '10 working days left']);
  });

  test('on the first day with nothing done it is on track', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-12') });
    await expect(board.pace).toHaveText('On track');
  });

  test('compares the points left with the ideal line, and counts what is done', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await expect(board.pace).toHaveText('Behind ideal by 3 pts');
    await board.moveCardWithDetails('SH-02', 'Done');
    await expect(board.pace).toHaveText('Ahead by 2 pts');
    await expect(board.burndownStats).toHaveText(['8 of 13 pts left', '1 of 4 stories done', '8 working days left']);
    await expect(board.burndownChart).toHaveAccessibleName('Burndown: 8 of 13 points remaining; Ahead by 2 pts.');
  });

  test('follows the lane filter', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await board.moveCardWithDetails('SH-02', 'Done');
    await board.showLane('Business');
    await expect(board.burndownStats).toHaveText(['5 of 5 pts left', '0 of 2 stories done', '8 working days left']);
    await board.showLane('Engineering');
    await expect(board.burndownStats).toHaveText(['3 of 8 pts left', '1 of 2 stories done', '8 working days left']);
  });

  test('after the sprint it shows what was carried over', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await board.moveCardWithDetails('SH-02', 'Done');
    await board.open({ today: torontoDay('2026-10-28'), sprint: 1 });
    await expect(board.pace).toHaveText('Sprint ended · 8 pts carried');
    await expect(board.burndownStats).toHaveText(['8 of 13 pts left', '1 of 4 stories done', '0 working days left']);
  });
});
