import { test, expect } from '../../../support/test';
import { CatererRecordPage } from '../../../pages/caterer-record.page';
import { ReinstateDialog, RemoveDialog, SuspendDialog } from '../../../pages/moderation-dialogs';
import { CatererPage } from '../../../pages/caterer.page';
import { ListingPage } from '../../../pages/listing.page';

const REASON = 'Food safety concern under investigation after report R-2047. Please send your latest inspection notice.';

test.describe('Suspending, reinstating and removing caterers', () => {
  test('L2-058.1 L2-058.2 L2-060.1 L2-001.3: suspending hides the caterer, closes open enquiries, emails everyone and is audited', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);
    const dialog = new SuspendDialog(page);
    await record.goto('cat-001');
    const audit = await backend.watchAudit();

    await record.action('Suspend').click();

    await expect(dialog.heading).toHaveText('Suspend Pelau House?');
    await expect(dialog.description).toHaveText('It leaves the listing within a minute and its page returns “not found”. You can reinstate it later.');
    await expect(dialog.checklist).toHaveText(['Kendra gets an email with your reason.', '4 open enquiries close; those customers are told Pelau House is no longer available.']);
    await expect(dialog.reason).toBeFocused();
    await expect(dialog.reasonHelp).toHaveText('Be specific: what happened and what they can do about it.');
    await expect(dialog.submit).toHaveText('Suspend caterer');
    await expect(dialog.submit).toHaveClass(/btn--danger/);
    await record.expectNoAccessibilityViolations();

    await dialog.submit.click();
    await expect(dialog.summary).toBeFocused();
    await expect(dialog.summary.locator('h3')).toHaveText('Fix 1 thing to suspend Pelau House');
    await expect(dialog.reasonError).toHaveText('Add a reason for this change');
    await record.expectNoAccessibilityViolations();

    await dialog.reason.fill(REASON);
    await dialog.submit.click();

    await expect(dialog.dialog).toBeHidden();
    await expect(record.status).toHaveText('Suspended');
    await expect(record.noticeTitle).toHaveText('Suspended since Sat 10 Oct, 10:00 a.m.');
    await expect(record.notice).toContainText('4 open enquiries were closed and the customers were emailed.');
    await expect(record.toasts.titled('Pelau House is suspended')).toBeVisible();
    await expect(record.history.first()).toContainText(`Suspended · Leah Mohammed“${REASON}”`);

    const state = await backend.state();
    expect(await audit.appended()).toEqual([
      expect.objectContaining({ operatorId: 'user-leah', action: 'Suspend', targetType: 'CatererProfile', targetId: 'cat-001', reason: REASON, before: { status: 'Published' }, after: { status: 'Suspended' } }),
    ]);
    const pelau = state.enquiries.filter((e: { catererId: string }) => e.catererId === 'cat-001');
    expect(pelau.filter((e: { status: string }) => e.status === 'Open' || e.status === 'Replied')).toEqual([]);
    expect(state.operator.moderation.emails).toContainEqual(expect.objectContaining({ to: 'kendra@pelauhouse.example', kind: 'caterer-suspended', reason: REASON }));
    expect(state.operator.moderation.emails).toContainEqual(expect.objectContaining({ to: 'marcia.t@example.com', kind: 'caterer-unavailable' }));

    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await expect(caterer.heading).toHaveText('Page not found');
    const listing = new ListingPage(page);
    await listing.open();
    await expect(listing.resultCount).toHaveText('59 caterers');
  });

  test('suspend-caterer busy and failed: the reason is kept, and nothing changes until it saves', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('POST /api/operator/profiles/cat-001/suspend', { status: 500, times: 1 });
    const record = new CatererRecordPage(page);
    const dialog = new SuspendDialog(page);
    await record.goto('cat-001');
    await record.action('Suspend').click();
    await dialog.reason.fill(REASON);

    await dialog.submit.click();

    await expect(dialog.alert).toContainText('We couldn’t suspend Pelau House');
    await expect(dialog.alert).toContainText('Nothing has changed. Check your connection and try again; your reason is kept.');
    await expect(dialog.reason).toHaveValue(REASON);
    await record.expectNoAccessibilityViolations();

    await backend.hold('POST /api/operator/profiles/cat-001/suspend');
    await dialog.submit.click();
    await expect(dialog.submit).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.reason).toHaveAttribute('readonly', '');
    await expect(dialog.cancel).toBeDisabled();
    await expect(dialog.close).toBeDisabled();
    await expect(dialog.status).toHaveText('Suspending Pelau House');
    await backend.release();
    await expect(record.status).toHaveText('Suspended');
  });

  test('admin-toast danger: when the server doesn’t respond, a toast says nothing changed and Try again reopens the dialog', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('POST /api/operator/profiles/cat-024/suspend', { network: true, times: 1 });
    const record = new CatererRecordPage(page);
    const dialog = new SuspendDialog(page);
    await record.goto('cat-024');
    await record.action('Suspend').click();
    await dialog.reason.fill('Your food handler certificate expired on 30 Sep 2026. Upload a current certificate.');

    await dialog.submit.click();

    const toast = record.toasts.titled('Couldn’t suspend Flying Fish Kitchen');
    await expect(toast).toHaveAttribute('role', 'alert');
    await expect(record.toasts.textOf(toast)).toHaveText('The server didn’t respond. Nothing was changed and the caterer wasn’t emailed.');
    await expect(dialog.dialog).toBeHidden();
    await record.toasts.action(toast, 'Try again').click();
    await expect(dialog.reason).toHaveValue('Your food handler certificate expired on 30 Sep 2026. Upload a current certificate.');
    await dialog.submit.click();
    await expect(record.status).toHaveText('Suspended');
  });

  test('L2-058.3: reinstating brings the caterer back with their earlier reviews', async ({ page, backend }) => {
    await backend.scenario('set-caterer-status', { slug: 'pelau-house', status: 'Suspended' });
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);
    const dialog = new ReinstateDialog(page);
    await record.goto('cat-001');
    const audit = await backend.watchAudit();

    await record.action('Reinstate').click();

    await expect(dialog.heading).toHaveText('Reinstate Pelau House?');
    await expect(dialog.description).toHaveText('It’s back in the listing within a minute, with its 23 earlier reviews. Kendra gets an email.');
    await expect(dialog.reasonHelp).toHaveText('Say what changed since the suspension.');
    await expect(dialog.caption).toHaveText('Enquiries closed by the suspension stay closed.');
    await dialog.submit.click();
    await expect(dialog.summary.locator('h3')).toHaveText('Fix 1 thing to reinstate Pelau House');
    await expect(dialog.reasonError).toHaveText('Add a reason for this change');
    await record.expectNoAccessibilityViolations();

    await dialog.reason.fill('Kendra sent a clean inspection notice dated 9 Oct 2026. Report R-2047 dismissed.');
    await dialog.submit.click();

    await expect(record.status).toHaveText('Published');
    await expect(record.toasts.titled('Pelau House is reinstated')).toBeVisible();
    expect(await audit.appended()).toEqual([expect.objectContaining({ action: 'Reinstate', before: { status: 'Suspended' }, after: { status: 'Published' } })]);
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await expect(caterer.heading).toHaveText('Pelau House');
    await expect(caterer.ratingLink).toContainText('23 reviews');
  });

  test('reinstate-caterer failed: nothing changed and the reason is kept', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('POST /api/operator/profiles/cat-916/reinstate', { status: 500, times: 1 });
    const record = new CatererRecordPage(page);
    const dialog = new ReinstateDialog(page);
    await record.goto('cat-916');
    await record.action('Reinstate').click();
    await expect(dialog.description).toHaveText('It’s back in the listing within a minute. Sharon gets an email.');
    await dialog.reason.fill('Sharon uploaded photos of her own food.');

    await dialog.submit.click();

    await expect(dialog.alert).toContainText('We couldn’t reinstate Hibiscus Hut');
    await expect(dialog.reason).toHaveValue('Sharon uploaded photos of her own food.');
    await backend.hold('POST /api/operator/profiles/cat-916/reinstate');
    await dialog.submit.click();
    await expect(dialog.submit).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.status).toHaveText('Reinstating Hibiscus Hut');
    await backend.release();
    await expect(record.status).toHaveText('Published');
  });

  test('L2-058.4 L2-058.5: removing needs a reason and the exact name, is final, and the page is gone', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);
    const dialog = new RemoveDialog(page);
    await record.goto('cat-001');
    const audit = await backend.watchAudit();

    await record.action('Remove').click();

    await expect(dialog.heading).toHaveText('Remove Pelau House permanently?');
    await expect(dialog.description).toHaveText('This can’t be undone. To hide it for now, suspend it instead.');
    await expect(dialog.checklist).toHaveText([
      'Its page returns “gone” and links back to the listing.',
      '23 reviews and 6 photos stop showing within a minute.',
      '4 open enquiries close; those customers are emailed.',
      'Kendra can still sign in to export their enquiry history.',
    ]);
    await expect(dialog.reason).toBeFocused();
    await expect(dialog.submit).toHaveText('Remove permanently');
    await expect(dialog.submit).toHaveAttribute('aria-disabled', 'true');
    await record.expectNoAccessibilityViolations();

    await dialog.confirmName.fill('Pelau');
    await dialog.pressRemoveAnyway();
    await expect(dialog.summary.locator('h3')).toHaveText('Fix 2 things to remove Pelau House');
    await expect(dialog.summaryLinks).toHaveText(['Add a reason for this change', 'Type the business name exactly: Pelau House']);
    await expect(dialog.reasonError).toHaveText('Add a reason for this change');
    await expect(dialog.confirmError).toHaveText('Type the business name exactly: Pelau House');
    await expect(dialog.confirmName).toHaveAttribute('aria-invalid', 'true');
    await record.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.path.endsWith('/remove'))).toEqual([]);

    await dialog.reason.fill('Business has closed; owner asked for the profile to be taken down.');
    await dialog.confirmName.fill('Pelau House');
    await expect(dialog.submit).not.toHaveAttribute('aria-disabled');
    await dialog.submit.click();

    await expect(record.status).toHaveText('Removed');
    await expect(record.actions).toHaveCount(0);
    await expect(record.noticeTitle).toHaveText('Removed on Sat 10 Oct, 10:00 a.m. This can’t be undone.');
    expect(await audit.appended()).toEqual([
      expect.objectContaining({ action: 'Remove', reason: 'Business has closed; owner asked for the profile to be taken down.', before: { status: 'Published' }, after: { status: 'Removed' } }),
    ]);
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await expect(caterer.heading).toHaveText('This caterer has left Sweet Hand');
  });

  test('remove-caterer busy and failed: inputs kept, nothing removed until it saves', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('POST /api/operator/profiles/cat-001/remove', { status: 500, times: 1 });
    const record = new CatererRecordPage(page);
    const dialog = new RemoveDialog(page);
    await record.goto('cat-001');
    await record.action('Remove').click();
    await dialog.reason.fill('Business has closed.');
    await dialog.confirmName.fill('Pelau House');

    await dialog.submit.click();

    await expect(dialog.alert).toContainText('We couldn’t remove Pelau House');
    await expect(dialog.confirmName).toHaveValue('Pelau House');
    await backend.hold('POST /api/operator/profiles/cat-001/remove');
    await dialog.submit.click();
    await expect(dialog.submit).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.confirmName).toHaveAttribute('readonly', '');
    await expect(dialog.status).toHaveText('Removing Pelau House');
    await backend.release();
    await expect(record.status).toHaveText('Removed');
  });

  test('L2-046.3: a caterer removed meanwhile cannot be changed, and the operator is told', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);
    const dialog = new SuspendDialog(page);
    await record.goto('cat-001');
    await expect(record.status).toHaveText('Published');
    await backend.scenario('set-caterer-status', { slug: 'pelau-house', status: 'Removed' });
    const audit = await backend.watchAudit();
    await record.action('Suspend').click();
    await dialog.reason.fill('Report R-2047 is being investigated.');

    await dialog.submit.click();

    await expect(dialog.alert).toContainText('This profile changed while you were looking');
    await expect(dialog.alert).toContainText('Pelau House is now Removed. Nothing was changed.');
    expect(await audit.appended()).toEqual([]);
  });

  test('L2-064: on a phone the remove dialog fills the screen and stays accessible', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);
    const dialog = new RemoveDialog(page);
    await record.usePhone();
    await record.goto('cat-001');

    await record.action('Remove').click();

    await expect(dialog.dialog).toBeVisible();
    await record.expectNoHorizontalScroll();
    await record.expectNoAccessibilityViolations();
  });
});
