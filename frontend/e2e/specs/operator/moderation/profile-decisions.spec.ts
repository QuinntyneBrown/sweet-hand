import { test, expect } from '../../../support/test';
import { ProfileReviewPage } from '../../../pages/profile-review.page';
import { ReviewQueuePage } from '../../../pages/review-queue.page';
import { ApproveDialog, RequestChangesDialog } from '../../../pages/moderation-dialogs';
import { ListingPage } from '../../../pages/listing.page';
import { CatererPage } from '../../../pages/caterer.page';

test.describe('Profile decisions', () => {
  test('L2-048.1 L2-048.4 L2-001.2: approving publishes the profile, emails the caterer and is audited', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const review = new ProfileReviewPage(page);
    const dialog = new ApproveDialog(page);
    await review.goto('cat-910');
    const audit = await backend.watchAudit();

    await review.approve.click();

    await expect(dialog.heading).toHaveText('Approve Auntie Bev’s Kitchen?');
    await expect(dialog.description).toHaveText('The profile appears in the listing within a minute, and Beverley Campbell gets an email with a link to the public page.');
    await expect(dialog.checklist).toHaveText(['All submission rules pass', 'Certificate valid until 22 Jan 2030', 'Recorded in the audit log under your name']);
    await expect(dialog.submit).toBeFocused();
    await expect(dialog.submit).toHaveText('Approve and publish');
    await review.expectNoAccessibilityViolations();

    await dialog.submit.click();

    const queue = new ReviewQueuePage(page);
    await expect(page).toHaveURL(/\/admin\/queue$/);
    const toast = queue.toasts.titled('Auntie Bev’s Kitchen is published');
    await expect(queue.toasts.textOf(toast)).toHaveText('It appears in the listing within a minute. Beverley Campbell has been emailed.');
    await expect(queue.toasts.action(toast, 'View page')).toHaveAttribute('href', '/caterers/auntie-bevs-kitchen');
    await expect(queue.subtitle).toHaveText(/^7 waiting/);
    await expect(queue.currentSideNavLink).toHaveAccessibleName('Review queue 7 waiting');

    const state = await backend.state();
    expect(await audit.appended()).toEqual([
      expect.objectContaining({ operatorId: 'user-leah', action: 'Approve', targetType: 'CatererProfile', targetId: 'cat-910', before: { status: 'Pending review' }, after: { status: 'Published' } }),
    ]);
    expect(state.operator.moderation.emails).toContainEqual(expect.objectContaining({ to: 'beverley@auntiebevs.example', kind: 'profile-approved', link: '/caterers/auntie-bevs-kitchen' }));

    const listing = new ListingPage(page);
    await listing.open();
    await expect(listing.resultCount).toHaveText('61 caterers');
  });

  test('approve-profile busy: the button is busy and Cancel and Close are off while it saves', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('POST /api/operator/profiles/cat-910/approve');
    const review = new ProfileReviewPage(page);
    const dialog = new ApproveDialog(page);
    await review.goto('cat-910');
    await review.approve.click();

    await dialog.submit.click();

    await expect(dialog.submit).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.cancel).toBeDisabled();
    await expect(dialog.close).toBeDisabled();
    await expect(dialog.status).toHaveText('Approving Auntie Bev’s Kitchen');
    await backend.release();
    await expect(page).toHaveURL(/\/admin\/queue$/);
  });

  test('approve-profile failed: nothing was published and Try again approves it', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('POST /api/operator/profiles/cat-910/approve', { status: 500, times: 1 });
    const review = new ProfileReviewPage(page);
    const dialog = new ApproveDialog(page);
    await review.goto('cat-910');
    await review.approve.click();

    await dialog.submit.click();

    await expect(dialog.alert).toContainText('We couldn’t approve the profile');
    await expect(dialog.alert).toContainText('It is still pending and nothing was published. Try again in a moment.');
    await expect(dialog.submit).toHaveText('Try again');
    await review.expectNoAccessibilityViolations();
    await dialog.submit.click();
    await expect(page).toHaveURL(/\/admin\/queue$/);
  });

  test('L2-046.2: a profile that is no longer pending cannot be approved, and the operator is told why', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const review = new ProfileReviewPage(page);
    const dialog = new ApproveDialog(page);
    await review.goto('cat-910');
    await expect(review.heading).toHaveText('Auntie Bev’s Kitchen');
    await backend.scenario('set-caterer-status', { slug: 'auntie-bevs-kitchen', status: 'Draft' });
    const audit = await backend.watchAudit();
    await review.approve.click();

    await dialog.submit.click();

    await expect(dialog.alert).toContainText('This profile changed while you were looking');
    await expect(dialog.alert).toContainText('Auntie Bev’s Kitchen is now Draft. Nothing was changed.');
    await dialog.backToQueue.click();
    await expect(page).toHaveURL(/\/admin\/queue$/);
    expect(await audit.appended()).toEqual([]);
  });

  test('approve-profile: Escape closes the dialog and focus returns to Approve', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const review = new ProfileReviewPage(page);
    const dialog = new ApproveDialog(page);
    await review.goto('cat-910');
    await review.approve.click();
    await expect(dialog.dialog).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(dialog.dialog).toBeHidden();
    await expect(review.approve).toBeFocused();
  });

  test('L2-048.2: a reason under 10 characters is rejected with "Explain what the caterer needs to change"', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const review = new ProfileReviewPage(page);
    const dialog = new RequestChangesDialog(page);
    await review.goto('cat-910');
    await review.requestChanges.click();

    await expect(dialog.heading).toHaveText('Request changes to Auntie Bev’s Kitchen');
    await expect(dialog.description).toHaveText('Beverley Campbell gets your reason by email and sees it as a banner in the profile editor.');
    await expect(dialog.reason).toBeFocused();
    await expect(dialog.reasonHelp).toHaveText('Be specific: which photo, field or sentence, and what to do');
    await dialog.reason.fill('Photos');
    await dialog.submit.click();

    await expect(dialog.summary).toBeFocused();
    await expect(dialog.summary.locator('h3')).toHaveText('Check the reason');
    await expect(dialog.summaryLinks).toHaveText(['Explain what the caterer needs to change']);
    await expect(dialog.reasonError).toHaveText('Explain what the caterer needs to change');
    await expect(dialog.reason).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.reason).toHaveValue('Photos');
    await review.expectNoAccessibilityViolations();
    const sent = (await backend.requests()).filter((r) => r.path.endsWith('/request-changes'));
    expect(sent).toEqual([]);
  });

  test('L2-048.3: requesting changes with a reason emails the caterer, shows it in their editor and is audited', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const review = new ProfileReviewPage(page);
    const dialog = new RequestChangesDialog(page);
    await review.goto('cat-910');
    const audit = await backend.watchAudit();
    await review.requestChanges.click();

    await dialog.reason.fill('Photos 2 and 5 show stock images');
    await dialog.submit.click();

    const queue = new ReviewQueuePage(page);
    await expect(page).toHaveURL(/\/admin\/queue$/);
    const toast = queue.toasts.titled('Changes requested from Auntie Bev’s Kitchen');
    await expect(queue.toasts.textOf(toast)).toHaveText('Beverley Campbell has been emailed your reason.');
    const state = await backend.state();
    const bev = state.caterers.find((c: { id: string }) => c.id === 'cat-910');
    expect(bev.status).toBe('Changes requested');
    expect(bev.statusReason).toBe('Photos 2 and 5 show stock images');
    expect(state.operator.moderation.emails).toContainEqual(expect.objectContaining({ to: 'beverley@auntiebevs.example', kind: 'changes-requested', reason: 'Photos 2 and 5 show stock images' }));
    expect(await audit.appended()).toEqual([
      expect.objectContaining({ operatorId: 'user-tomas', action: 'Request changes', targetId: 'cat-910', reason: 'Photos 2 and 5 show stock images', after: { status: 'Changes requested' } }),
    ]);
  });

  test('request-changes busy and failed: the reason is kept and Try again sends it', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('POST /api/operator/profiles/cat-910/request-changes', { status: 503, times: 1 });
    const review = new ProfileReviewPage(page);
    const dialog = new RequestChangesDialog(page);
    await review.goto('cat-910');
    await review.requestChanges.click();
    await dialog.reason.fill('Photos 2 and 5 look like stock images. Please upload photos of your own food.');

    await dialog.submit.click();

    await expect(dialog.alert).toContainText('We couldn’t send your request');
    await expect(dialog.alert).toContainText('The profile is still pending and Beverley hasn’t been emailed. Try again in a moment.');
    await expect(dialog.reason).toHaveValue('Photos 2 and 5 look like stock images. Please upload photos of your own food.');
    await expect(dialog.submit).toHaveText('Try again');

    await backend.hold('POST /api/operator/profiles/cat-910/request-changes');
    await dialog.submit.click();
    await expect(dialog.submit).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.reason).toHaveAttribute('readonly', '');
    await expect(dialog.status).toHaveText('Sending your request for changes');
    await backend.release();
    await expect(page).toHaveURL(/\/admin\/queue$/);
  });

  test('L2-044.3: approving a name change renames the public page, and the old address redirects', async ({ page, backend }) => {
    await backend.scenario('pelau-name-change-pending');
    await backend.signInAs('leah');
    const review = new ProfileReviewPage(page);
    const dialog = new ApproveDialog(page);
    await review.goto('cat-001');
    const audit = await backend.watchAudit();
    await review.approve.click();

    await expect(dialog.heading).toHaveText('Approve Pelau House by Kendra?');
    await expect(dialog.description).toHaveText(
      'The public page shows the new name within a minute and /caterers/pelau-house redirects to /caterers/pelau-house-by-kendra. Kendra Baptiste gets an email.',
    );
    await expect(dialog.submit).toHaveText('Approve name');
    await dialog.submit.click();

    const queue = new ReviewQueuePage(page);
    const toast = queue.toasts.titled('Pelau House is now Pelau House by Kendra');
    await expect(queue.toasts.textOf(toast)).toHaveText('The public page shows the new name within a minute. Kendra Baptiste has been emailed.');
    expect(await audit.appended()).toEqual([
      expect.objectContaining({ action: 'Approve name change', targetId: 'cat-001', before: { name: 'Pelau House', slug: 'pelau-house' }, after: { name: 'Pelau House by Kendra', slug: 'pelau-house-by-kendra' } }),
    ]);

    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await expect(page).toHaveURL(/\/caterers\/pelau-house-by-kendra$/);
    await expect(caterer.heading).toHaveText('Pelau House by Kendra');
  });

  test('L2-044: sending a name change back keeps the current name and tells the caterer why', async ({ page, backend }) => {
    await backend.scenario('pelau-name-change-pending');
    await backend.signInAs('leah');
    const review = new ProfileReviewPage(page);
    const dialog = new RequestChangesDialog(page);
    await review.goto('cat-001');
    const audit = await backend.watchAudit();
    await review.requestChanges.click();

    await expect(dialog.heading).toHaveText('Request changes to Pelau House');
    await expect(dialog.description).toHaveText('Kendra Baptiste gets your reason by email. The current name stays on the public page.');
    await dialog.reason.fill('Use the business name on your food handler certificate.');
    await dialog.submit.click();

    const queue = new ReviewQueuePage(page);
    await expect(queue.toasts.titled('Changes requested from Pelau House')).toBeVisible();
    await expect(queue.subtitle).toHaveText(/^8 waiting/);
    const state = await backend.state();
    expect(state.caterers.find((c: { id: string }) => c.id === 'cat-001').name).toBe('Pelau House');
    expect(await audit.appended()).toEqual([expect.objectContaining({ action: 'Reject name change', targetId: 'cat-001', reason: 'Use the business name on your food handler certificate.' })]);
  });

  test('L2-064: on a phone the approval dialog fills the screen and is accessible', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const review = new ProfileReviewPage(page);
    const dialog = new ApproveDialog(page);
    await review.usePhone();
    await review.goto('cat-910');

    await review.approve.click();

    await expect(dialog.dialog).toBeVisible();
    await review.expectNoHorizontalScroll();
    await review.expectNoAccessibilityViolations();
  });
});
