import { test, expect } from '@playwright/test';
import { BoardPage, torontoDay } from '../../pages/board.page';

test.describe('Phone and accessibility', () => {
  test('on a phone the columns stack and nothing scrolls sideways', async ({ page }) => {
    const board = new BoardPage(page);
    await board.usePhone();
    // The real backlog's long sprint names are the widest content the board shows.
    await board.open({ today: torontoDay('2026-10-14'), backlog: 'real' });
    await board.moveCardWithDetails('SH-01', 'Done');
    expect(await board.scrollsSideways()).toBe(false);
    expect(await board.columnsStack()).toBe(true);
  });

  test('the keyboard opens a card’s details and returns to the card on Escape', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await board.card('SH-03').focus();
    await page.keyboard.press('Enter');
    await expect(board.details).toBeVisible();
    await expect(board.detailsTitle).toHaveText('Book the market stall');
    await page.keyboard.press('Escape');
    await expect(board.details).toBeHidden();
    await expect(board.card('SH-03')).toBeFocused();
  });

  test('the board and the details meet WCAG 2.2 AA in light and dark', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await board.moveCardWithDetails('SH-02', 'Done');
    await board.expectNoAccessibilityViolations();
    await board.openDetails('SH-02');
    await board.expectNoAccessibilityViolations();
  });
});
