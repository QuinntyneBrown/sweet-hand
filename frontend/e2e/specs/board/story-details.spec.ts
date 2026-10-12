import { test, expect } from '@playwright/test';
import { BoardPage, torontoDay } from '../../pages/board.page';

test.describe('Story details', () => {
  test('show the description, the definition of done, the lane’s Definition of Done and the traces', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await board.openDetails('SH-01');
    await expect(board.detailsTitle).toHaveText('Write the menu page');
    await expect(board.details).toContainText('As a customer, I want the menu online, so that I know what to order.');
    await expect(board.definitionOfDone).toHaveText(['The menu lists:', 'Doubles and pepper choices.', 'Prices are in CAD.']);
    await expect(board.details).toContainText('Sprint 1 · Traces: M-1');
    await board.showLaneDefinitionOfDone('Engineering');
    await expect(board.laneDefinitionOfDone('Engineering')).toHaveText(['Tested with npm test', 'Reviewed by a second cook']);
  });

  test('ticking tasks shows progress on the card and survives a reload', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await board.openDetails('SH-01');
    await expect(board.taskProgress).toHaveText('0 of 3');
    await board.task('Draft the menu').check();
    await expect(board.taskProgress).toHaveText('1 of 3');
    await board.closeDetails();
    await expect(board.card('SH-01')).toContainText('1/3 tasks');
    await board.reload();
    await expect(board.card('SH-01')).toContainText('1/3 tasks');
    await board.openDetails('SH-01');
    await expect(board.task('Draft the menu')).toBeChecked();
    await expect(board.task('Publish the page')).not.toBeChecked();
  });

  test('a done card’s date can be changed within the sprint', async ({ page }) => {
    const board = new BoardPage(page);
    await board.open({ today: torontoDay('2026-10-14') });
    await board.openDetails('SH-01');
    await expect(board.doneOn).toBeHidden();
    await board.detailsColumn.selectOption({ label: 'Done' });
    await expect(board.doneOn).toHaveValue('2026-10-14');
    await expect(board.doneOn).toHaveAttribute('min', '2026-10-12');
    await expect(board.doneOn).toHaveAttribute('max', '2026-10-23');
    await board.doneOn.fill('2026-10-13');
    await board.closeDetails();
    await expect(board.card('SH-01')).toContainText('Done Tue 13 Oct');
  });
});
