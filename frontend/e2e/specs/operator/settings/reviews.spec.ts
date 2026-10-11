import { test, expect } from '../../../support/test';
import { OperatorReviewsPage } from '../../../pages/operator-reviews.page';
import { CatererPage } from '../../../pages/caterer.page';

test.describe('Reviews (operator)', () => {
  test('L2-050.3: held reviews come first, with what the check matched highlighted and the decisions on offer', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const reviews = new OperatorReviewsPage(page);

    await reviews.open();

    await expect(reviews.heading).toHaveText('Reviews');
    await expect(reviews.subtitle).toHaveText('2 held for a check · 2 hidden');
    await expect(reviews.tab('Held')).toHaveText('Held 2');
    await expect(reviews.tab('Hidden')).toHaveText('Hidden 2');
    await expect(reviews.currentTab).toHaveText('Held 2');
    await expect(reviews.searchBox).toBeVisible();
    await expect(reviews.caterers).toHaveText(['Sugar Dumplin', 'Cou-Cou']);
    await expect(reviews.bylineOf('Sugar Dumplin')).toHaveText('by Priya R. · Event in September 2026');
    await expect(reviews.statusOf('Sugar Dumplin')).toHaveText('Held · contains a phone number');
    await expect(reviews.timeOf('Sugar Dumplin')).toHaveText('Today, 7:58 a.m.');
    await expect(reviews.highlightsOf('Sugar Dumplin')).toHaveText(['416-555-0187']);
    await expect(reviews.statusOf('Cou-Cou')).toHaveText('Held · contains a link');
    await expect(reviews.timeOf('Cou-Cou')).toHaveText('Yesterday, 9:14 p.m.');
    await expect(reviews.highlightsOf('Cou-Cou')).toHaveText(['instagram.com/coucou.to']);
    await expect(reviews.action('Approve', 'Priya R.', 'Sugar Dumplin')).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(reviews.action('Keep hidden', 'Priya R.', 'Sugar Dumplin')).toBeVisible();
    await expect(reviews.action('Remove', 'Priya R.', 'Sugar Dumplin')).toBeVisible();
    await expect(reviews.currentSideNavLink).toHaveText('Reviews');
    await reviews.expectNoAccessibilityViolations();
  });

  test('hidden reviews show who hid them and why, with Restore and Remove; at phone width too', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const reviews = new OperatorReviewsPage(page);
    await reviews.usePhone();
    await reviews.open();

    await reviews.tab('Hidden').click();

    await expect(page).toHaveURL(/status=hidden/);
    await expect(reviews.currentTab).toHaveText('Hidden 2');
    await expect(reviews.caterers).toHaveText(['Maracas Bay', 'Island Pot']);
    await expect(reviews.bylineOf('Maracas Bay')).toHaveText('by Devon W. · Event in July 2026');
    await expect(reviews.statusOf('Maracas Bay')).toHaveText('Hidden automatically · 3 reports');
    await expect(reviews.timeOf('Maracas Bay')).toHaveText('Thu 8 Oct, 4:12 p.m.');
    await expect(reviews.statusOf('Island Pot')).toHaveText('Hidden by Tomas Reyes');
    await expect(reviews.timeOf('Island Pot')).toHaveText('Personal details about staff · Mon 5 Oct, 10:30 a.m.');
    await expect(reviews.highlightsOf('Island Pot')).toHaveCount(0);
    await expect(reviews.action('Restore', 'Kwame O.', 'Island Pot')).toBeVisible();
    await expect(reviews.action('Remove', 'Devon W.', 'Maracas Bay')).toBeVisible();
    await expect(reviews.action('Approve', 'Devon W.', 'Maracas Bay')).toHaveCount(0);
    await reviews.expectNoHorizontalScroll();
    await reviews.expectNoAccessibilityViolations();
  });

  test('L2-067.5: a search narrows the list and says so; a search with no match can be cleared', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const reviews = new OperatorReviewsPage(page);
    await reviews.open();

    await reviews.searchBox.fill('priya');
    await reviews.searchBox.press('Enter');

    await expect(reviews.resultCount).toHaveText('1 held review matches “priya”');
    await expect(reviews.caterers).toHaveText(['Sugar Dumplin']);

    await reviews.searchBox.fill('Lambie Lane');
    await reviews.searchBox.press('Enter');

    await expect(page).toHaveURL(/q=Lambie/);
    await expect(reviews.resultCount).toHaveText('No held reviews match “Lambie Lane”');
    await expect(reviews.emptyTitle).toHaveText('No held reviews for Lambie Lane');
    await expect(reviews.emptyText).toHaveText('Try the reviewer’s name, or look under Hidden.');
    await expect(reviews.searchBox).toHaveValue('Lambie Lane');
    await reviews.expectNoAccessibilityViolations();

    await reviews.link('Clear search').click();

    await expect(reviews.caterers).toHaveText(['Sugar Dumplin', 'Cou-Cou']);
    await expect(reviews.searchBox).toHaveValue('');
  });

  test('with nothing held or hidden, the page gives the all-clear', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.scenario('no-reviews-to-moderate');
    const reviews = new OperatorReviewsPage(page);

    await reviews.open();

    await expect(reviews.subtitle).toHaveText('Nothing waiting');
    await expect(reviews.tab('Held')).toHaveText('Held 0');
    await expect(reviews.tab('Hidden')).toHaveText('Hidden 0');
    await expect(reviews.emptyTitle).toHaveText('No reviews to check');
    await expect(reviews.emptyText).toHaveText(
      'Reviews that contain a link, email address or phone number are held here before they go live. Hidden reviews appear under Hidden.',
    );
    await expect(reviews.link('Go to the review queue')).toHaveAttribute('href', '/admin/queue');
    await reviews.expectNoAccessibilityViolations();
  });

  test('while reviews load, the tabs and search stay and review rows are skeletons', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('GET /api/operator/reviews*');
    const reviews = new OperatorReviewsPage(page);

    await reviews.open();

    await expect(reviews.skeletons).toHaveCount(3);
    await expect(reviews.loadingStatus).toHaveText('Loading reviews');
    await expect(reviews.tab('Held')).toHaveText('Held');
    await expect(reviews.searchBox).toBeDisabled();
    await reviews.expectNoAccessibilityViolations();
    await backend.release();
    await expect(reviews.reviews).toHaveCount(2);
  });

  test('when reviews fail to load, nothing changes and a retry is offered', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('GET /api/operator/reviews*', { status: 500, times: 1, body: { title: 'Server error', correlationId: '3f91-0c2a-77d4' } });
    const reviews = new OperatorReviewsPage(page);

    await reviews.open();

    await expect(reviews.subtitle).toHaveText('Held for a check');
    await expect(reviews.errorState).toHaveAttribute('role', 'alert');
    await expect(reviews.emptyTitle).toHaveText('We couldn’t load reviews');
    await expect(reviews.emptyText).toHaveText('Nothing has been changed. Check your connection and try again.');
    await expect(reviews.reference).toHaveText('Reference 3f91-0c2a-77d4');
    await expect(reviews.link('Back to the queue')).toHaveAttribute('href', '/admin/queue');
    await reviews.expectNoAccessibilityViolations();

    await reviews.button('Try again').click();

    await expect(reviews.reviews).toHaveCount(2);
  });
});

test.describe('Moderate a review', () => {
  test('L2-059.1: approving a held review publishes it on the caterer’s page; the decision is audited', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const reviews = new OperatorReviewsPage(page);
    await reviews.open();

    await reviews.action('Approve', 'Andre C.', 'Cou-Cou').click();

    const dialog = reviews.dialog('Approve Andre C.’s review?');
    await expect(dialog.description).toHaveText('It appears on Cou-Cou’s page within a minute and counts toward the average.');
    await expect(dialog.body.locator('blockquote')).toHaveText('Flying fish and cou-cou like in Oistins. Their photos at instagram.com/coucou.to don’t do it justice.');
    await expect(dialog.body.locator('blockquote mark')).toHaveText('instagram.com/coucou.to');
    await expect(dialog.field('Reason')).toBeFocused();
    await expect(dialog.body).toContainText('Emailed to the reviewer and kept in the audit log.');
    await reviews.expectNoAccessibilityViolations();

    await dialog.field('Reason').fill('The link is the caterer’s own public Instagram page, not spam.');
    await dialog.button('Approve and publish').click();

    await expect(dialog.root).toBeHidden();
    await expect(reviews.toast).toContainText('Andre C.’s review is published');
    await expect(reviews.caterers).toHaveText(['Sugar Dumplin']);
    await expect(reviews.tab('Held')).toHaveText('Held 1');
    await expect(reviews.subtitle).toHaveText('1 held for a check · 2 hidden');
    const { audit } = await backend.state();
    expect(audit.at(-1)).toMatchObject({
      operatorId: 'user-leah',
      action: 'ApproveReview',
      targetType: 'review',
      targetId: 'review-andre-cou-cou',
      reason: 'The link is the caterer’s own public Instagram page, not spam.',
      before: 'Held',
      after: 'Published',
    });

    const caterer = new CatererPage(page);
    await caterer.open('cou-cou');
    await expect(caterer.reviewByAuthor('Andre C.')).toContainText('Flying fish and cou-cou like in Oistins.');
  });

  test('L2-059.2: keeping a held review hidden needs a reason and moves it to Hidden, signed by the operator', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const reviews = new OperatorReviewsPage(page);
    await reviews.open();
    await reviews.action('Keep hidden', 'Priya R.', 'Sugar Dumplin').click();
    const dialog = reviews.dialog('Keep Priya R.’s review hidden?');
    await expect(dialog.description).toHaveText('It stays off Sugar Dumplin’s page and out of the average. Priya R. is emailed your reason. You can restore it later.');

    await dialog.button('Keep hidden').click();

    await expect(dialog.errorSummary).toBeFocused();
    await expect(dialog.errorSummary.getByRole('heading')).toHaveText('Fix 1 thing to save your decision');
    await expect(dialog.summaryLinks).toHaveText(['Add a reason for this decision']);
    await expect(dialog.field('Reason')).toHaveAttribute('aria-invalid', 'true');
    await reviews.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.method === 'POST' && r.path.startsWith('/api/operator/reviews/'))).toHaveLength(0);

    await dialog.field('Reason').fill('A phone number in a review can identify the caterer’s family.');
    await dialog.button('Keep hidden').click();

    await expect(dialog.root).toBeHidden();
    await expect(reviews.toast).toContainText('Priya R.’s review stays hidden');
    await expect(reviews.subtitle).toHaveText('1 held for a check · 3 hidden');
    await reviews.tab('Hidden').click();
    await expect(reviews.caterers).toHaveText(['Sugar Dumplin', 'Maracas Bay', 'Island Pot']);
    await expect(reviews.statusOf('Sugar Dumplin')).toHaveText('Hidden by Leah Mohammed');
    await expect(reviews.timeOf('Sugar Dumplin')).toHaveText('A phone number in a review can identify the caterer’s family. · Today, 10:00 a.m.');
    const { audit } = await backend.state();
    expect(audit.at(-1)).toMatchObject({ action: 'HideReview', targetId: 'review-priya-sugar-dumplin', before: 'Held', after: 'Hidden' });
  });

  test('while a decision saves the dialog is busy; when it fails, nothing changes and the reason is kept', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('POST /api/operator/reviews/review-priya-sugar-dumplin/hide');
    const reviews = new OperatorReviewsPage(page);
    await reviews.open();
    await reviews.action('Keep hidden', 'Priya R.', 'Sugar Dumplin').click();
    const dialog = reviews.dialog('Keep Priya R.’s review hidden?');
    await dialog.field('Reason').fill('A phone number in a review can identify the caterer’s family.');

    await dialog.button('Keep hidden').click();

    await expect(dialog.button('Keep hidden')).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.field('Reason')).toHaveAttribute('readonly', '');
    await expect(dialog.close).toBeDisabled();
    await expect(dialog.cancel).toBeDisabled();
    await expect(dialog.status).toHaveText('Saving your decision');

    await backend.fail('POST /api/operator/reviews/review-priya-sugar-dumplin/hide', { status: 500, times: 1 });
    await backend.release();

    await expect(dialog.root).toBeHidden();
    await reviews.action('Remove', 'Andre C.', 'Cou-Cou').click();
    await backend.fail('POST /api/operator/reviews/review-andre-cou-cou/remove', { status: 500, times: 1 });
    const remove = reviews.dialog('Remove Andre C.’s review permanently?');
    await remove.field('Reason').fill('Spam link.');
    await remove.checkbox('I understand this review can’t be restored').check();
    await remove.button('Remove permanently').click();

    await expect(remove.failure).toHaveAttribute('role', 'alert');
    await expect(remove.failure).toContainText('We couldn’t save this decision');
    await expect(remove.failure).toContainText('The review hasn’t changed and nobody has been emailed. Try again.');
    await expect(remove.field('Reason')).toHaveValue('Spam link.');
    await expect(remove.button('Try again')).toBeVisible();
    await reviews.expectNoAccessibilityViolations();
  });

  test('L2-059.3: restoring a hidden review puts it back on the caterer’s page', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const reviews = new OperatorReviewsPage(page);
    await reviews.open('?status=hidden');

    await reviews.action('Restore', 'Kwame O.', 'Island Pot').click();

    const dialog = reviews.dialog('Restore Kwame O.’s review?');
    await expect(dialog.description).toHaveText('It reappears on Island Pot’s page within a minute and counts toward the average again. Kwame O. is emailed your reason.');
    await dialog.field('Reason').fill('The reviewer removed the personal details in an edit.');
    await dialog.button('Restore review').click();

    await expect(dialog.root).toBeHidden();
    await expect(reviews.toast).toContainText('Kwame O.’s review is restored');
    await expect(reviews.caterers).toHaveText(['Maracas Bay']);
    const { audit } = await backend.state();
    expect(audit.at(-1)).toMatchObject({ action: 'RestoreReview', targetId: 'review-kwame-island-pot', before: 'Hidden', after: 'Published' });

    const caterer = new CatererPage(page);
    await caterer.open('island-pot');
    await expect(caterer.reviewByAuthor('Kwame O.')).toContainText('Food was fine');
  });

  test('L2-059.4: removing a review is permanent and needs an explicit confirmation; only the audit entry remains', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const reviews = new OperatorReviewsPage(page);
    await reviews.open('?status=hidden');

    await reviews.action('Remove', 'Devon W.', 'Maracas Bay').click();

    const dialog = reviews.dialog('Remove Devon W.’s review permanently?');
    await expect(dialog.description).toHaveText('It can’t be restored. Only the audit entry is kept. Devon W. is emailed your reason.');
    await expect(dialog.field('Reason')).toBeFocused();
    await expect(dialog.button('Remove permanently')).toHaveClass(/btn--danger/);
    await reviews.expectNoAccessibilityViolations();

    await dialog.field('Reason').fill('Personal attack on a named member of staff, confirmed by 3 reports.');
    await dialog.button('Remove permanently').click();

    await expect(dialog.summaryLinks).toHaveText(['Confirm you understand the review can’t be restored']);
    await expect(dialog.checkbox('I understand this review can’t be restored')).toHaveAttribute('aria-invalid', 'true');

    await dialog.checkbox('I understand this review can’t be restored').check();
    await dialog.button('Remove permanently').click();

    await expect(dialog.root).toBeHidden();
    await expect(reviews.toast).toContainText('Devon W.’s review is removed');
    await expect(reviews.caterers).toHaveText(['Island Pot']);
    await expect(reviews.tab('Hidden')).toHaveText('Hidden 1');
    const { reviews: stored, audit } = await backend.state();
    expect(stored.find((r: { id: string }) => r.id === 'review-devon-maracas-hidden')).toMatchObject({ status: 'Removed', text: '' });
    expect(audit.at(-1)).toMatchObject({ action: 'RemoveReview', targetId: 'review-devon-maracas-hidden', before: 'Hidden', after: 'Removed' });
  });
});
