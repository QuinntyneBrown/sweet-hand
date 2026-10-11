import { test, expect } from '../../../support/test';
import { RecentChangesPage } from '../../../pages/recent-changes.page';
import { RevertDialog } from '../../../pages/revert-dialog';
import { CatererPage } from '../../../pages/caterer.page';

const OLD = 'Everything is cooked the morning of your event and arrives hot, with chafing dishes.';
const NEW = 'Everything is cooked the morning of your event and arrives hot, with chafing dishes and serving spoons. Doubles and aloo pie are made to order for groups of 40 or more.';

test.describe('Recent changes', () => {
  test('L2-047.4 L2-044.1: edits to published profiles from the last 30 days, newest first, with old and new values', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const changes = new RecentChangesPage(page);

    await changes.goto();

    await expect(changes.heading).toHaveText('Recent changes');
    await expect(changes.subtitle).toHaveText('24 changes · last 30 days · newest first');
    await expect(changes.entries).toHaveCount(20);
    await expect(changes.headings.nth(0)).toHaveText('Pelau House · Description');
    await expect(changes.byline('Pelau House · Description')).toHaveText('Kendra Baptiste · Today, 8:15 a.m.');
    await expect(changes.was('Pelau House · Description')).toHaveText(OLD);
    await expect(changes.now('Pelau House · Description')).toHaveText(NEW);
    await expect(changes.revert('Pelau House · Description')).toHaveAccessibleName('Revert Pelau House description');
    await expect(changes.byline('Cou-Cou · Guests')).toHaveText('Desmond Greaves · Yesterday, 6:40 p.m.');
    await expect(changes.was('Cou-Cou · Guests')).toHaveText('Serves 20–150 guests');
    await expect(changes.now('Cou-Cou · Guests')).toHaveText('Serves 20–200 guests');
    await expect(changes.was('Scotch Bonnet Social · Menu')).toHaveText('Nothing');
    await expect(changes.now('Scotch Bonnet Social · Menu')).toHaveText('Escovitch fish · From $19 per person · Gluten-free');
    await expect(changes.photos('Ti Kay · Cover photo')).toHaveCount(2);
    await expect(changes.reverted('Maracas Bay · Description')).toHaveText('Reverted by Leah Mohammed · Tue 6 Oct');
    await expect(changes.revert('Maracas Bay · Description')).toHaveCount(0);
    await expect(changes.was('Demerara Kitchen · Areas')).toHaveText('Brampton, Mississauga');
    await expect(changes.resultCount).toHaveText('Showing 1–20 of 24');
    await changes.expectNoAccessibilityViolations();

    await changes.pageLink(2).click();
    await expect(page).toHaveURL(/\/admin\/changes\?page=2$/);
    await expect(changes.entries).toHaveCount(4);
  });

  test('L2-057.3: Revert puts the earlier value back, with a reason, and is audited', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const changes = new RecentChangesPage(page);
    const dialog = new RevertDialog(page);
    await changes.goto();
    const audit = await backend.watchAudit();

    await changes.revert('Pelau House · Description').click();

    await expect(dialog.heading).toHaveText('Revert Pelau House’s description?');
    await expect(dialog.description).toHaveText('The public page goes back to the earlier text within a minute. Kendra Baptiste is emailed your reason.');
    await expect(dialog.goesBackTo).toHaveText(`Goes back to${OLD}`);
    await expect(dialog.replaces).toHaveText(`Replaces${NEW}`);
    await expect(dialog.reasonHelp).toHaveText('Sent to the caterer and kept in the audit log.');
    await dialog.submit.click();
    await expect(dialog.summary.locator('h3')).toHaveText('Fix 1 thing to revert the change');
    await expect(dialog.reasonError).toHaveText('Add a reason for this change');
    await changes.expectNoAccessibilityViolations();

    await dialog.reason.fill('Restoring the earlier wording while we check the new delivery claim with Kendra.');
    await dialog.submit.click();

    await expect(dialog.dialog).toBeHidden();
    await expect(changes.reverted('Pelau House · Description')).toHaveText('Reverted by Leah Mohammed · Sat 10 Oct');
    await expect(changes.toasts.titled('Change reverted')).toBeVisible();
    expect(await audit.appended()).toEqual([
      expect.objectContaining({ action: 'Revert change', targetType: 'ProfileEdit', reason: 'Restoring the earlier wording while we check the new delivery claim with Kendra.' }),
    ]);
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await expect(page.getByText(OLD, { exact: true })).toBeVisible();
  });

  test('revert-change busy and failed: the reason stays for Try again', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('POST /api/operator/recent-changes/*/revert', { status: 500, times: 1 });
    const changes = new RecentChangesPage(page);
    const dialog = new RevertDialog(page);
    await changes.goto();
    await changes.revert('Cou-Cou · Guests').click();
    await dialog.reason.fill('Desmond asked us to undo it.');

    await dialog.submit.click();

    await expect(dialog.alert).toContainText('We couldn’t revert the change');
    await expect(dialog.submit).toHaveText('Try again');
    await expect(dialog.reason).toHaveValue('Desmond asked us to undo it.');
    await backend.hold('POST /api/operator/recent-changes/*/revert');
    await dialog.submit.click();
    await expect(dialog.submit).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.status).toHaveText('Reverting the change');
    await expect(dialog.cancel).toBeDisabled();
    await backend.release();
    await expect(changes.reverted('Cou-Cou · Guests')).toBeVisible();
  });

  test('empty: no edits in the last 30 days', async ({ page, backend }) => {
    await backend.scenario('no-recent-changes');
    await backend.signInAs('leah');
    const changes = new RecentChangesPage(page);

    await changes.goto();

    await expect(changes.subtitle).toHaveText('Last 30 days');
    await expect(changes.empty.locator('.empty__title')).toHaveText('No changes in the last 30 days');
    await expect(changes.empty.locator('.empty__text')).toHaveText('When a published caterer edits their description, menu, photos or areas, the edit shows here so you can check it.');
    await expect(changes.emptyAction('Go to the review queue')).toHaveAttribute('href', '/admin/queue');
    await changes.expectNoAccessibilityViolations();
  });

  test('error: the feed fails to load; nothing changed and Try again loads it', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('GET /api/operator/recent-changes', { status: 504, times: 1, body: { title: 'Timeout', correlationId: '7c2e-41af-9b08' } });
    const changes = new RecentChangesPage(page);

    await changes.goto();

    await expect(changes.empty.locator('.empty__title')).toHaveText('We couldn’t load recent changes');
    await expect(changes.empty).toContainText('The server didn’t answer in time. Nothing has been changed. Try again in a moment.');
    await expect(changes.empty).toContainText('Reference 7c2e-41af-9b08');
    await expect(changes.emptyAction('Back to the queue')).toHaveAttribute('href', '/admin/queue');
    await changes.expectNoAccessibilityViolations();
    await changes.emptyAction('Try again').click();
    await expect(changes.entries).toHaveCount(20);
  });

  test('loading: skeleton entries while the feed loads', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('GET /api/operator/recent-changes');
    const changes = new RecentChangesPage(page);

    await changes.goto();

    await expect(changes.skeletons).toHaveCount(4);
    await expect(changes.list).toHaveAttribute('aria-busy', 'true');
    await expect(changes.loadingStatus).toBeAttached();
    await changes.expectNoAccessibilityViolations();
    await backend.release();
    await expect(changes.entries).toHaveCount(20);
  });

  test('L2-064: on a phone the feed fits without scrolling sideways', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const changes = new RecentChangesPage(page);
    await changes.usePhone();

    await changes.goto();

    await expect(changes.entries).toHaveCount(20);
    await changes.expectNoHorizontalScroll();
    await changes.expectNoAccessibilityViolations();
  });
});
