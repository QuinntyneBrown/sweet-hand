import { test, expect } from '../../../support/test';
import { ReviewQueuePage } from '../../../pages/review-queue.page';

test.describe('Review queue', () => {
  test('L2-047.1: items are listed oldest first, each with how long it has waited', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const queue = new ReviewQueuePage(page);

    await queue.goto();

    await expect(queue.heading).toHaveText('Review queue');
    await expect(queue.subtitle).toHaveText('7 waiting · oldest first · 1 waiting over 3 days');
    await expect(queue.titles).toHaveText([
      'Auntie Bev’s Kitchen',
      'Breadfruit & Butter',
      'Review of Maracas Bay by Devon W.',
      'Pelau House',
      /^Pelau House →\s?renamed to Pelau House by Kendra$/,
      'Flying Fish Kitchen',
      'Island Pot',
    ]);
    await expect(queue.rows.locator('.queue-item__wait')).toHaveText([
      'Waiting 3 days',
      'Waiting 2 days',
      'Waiting 2 days',
      'Waiting 2 days',
      'Waiting 1 day',
      'Waiting 1 day',
      'Waiting 6 hours',
    ]);
    await expect(queue.lateWaits).toHaveText(['Waiting 3 days']);
    await expect(queue.kind('Auntie Bev’s Kitchen')).toHaveText('New profile');
    await expect(queue.meta('Auntie Bev’s Kitchen')).toHaveText('New profile · Jamaican · Oshawa');
    await expect(queue.meta('Breadfruit & Butter')).toHaveText('Resubmitted · Vincentian · Brampton');
    await queue.expectNoAccessibilityViolations();
  });

  test('L2-055.1 queue-item AC-3: two reports about one review are one item with a count and both reasons', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const queue = new ReviewQueuePage(page);

    await queue.goto();

    await expect(queue.meta('Review of Maracas Bay by Devon W.')).toHaveText('2 reports · Fake or spam · Inappropriate content');
    await expect(queue.media('Review of Maracas Bay by Devon W.')).toHaveAttribute('aria-hidden', 'true');
    await expect(queue.meta('Island Pot')).toHaveText('1 report · Food safety concern');
    await queue.row('Island Pot').click();
    await expect(page).toHaveURL(/\/admin\/reports\/R-2047$/);
  });

  test('L2-044.2 queue-item AC-4: a name change reads old → new, and a screen reader hears "renamed to"', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const queue = new ReviewQueuePage(page);

    await queue.goto();

    const row = queue.row('Pelau House by Kendra');
    await expect(row).toHaveAccessibleName(/^Pelau House\s*renamed to\s*Pelau House by Kendra\s*Waiting 1 day\s*Name change · Published$/);
    await expect(queue.meta('Pelau House by Kendra')).toHaveText('Name change · Published');
    await row.click();
    await expect(page).toHaveURL(/\/admin\/review\/cat-001$/);
  });

  test('L2-040.3 queue-item AC-5: an expired certificate stays published until an operator acts', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const queue = new ReviewQueuePage(page);

    await queue.goto();

    await expect(queue.meta('Flying Fish Kitchen')).toHaveText('Certificate expired · 30 Sep 2026 · still published');
    await queue.row('Flying Fish Kitchen').click();
    await expect(page).toHaveURL(/\/admin\/caterers\/cat-024$/);
  });

  test('queue-item AC-6: a held review shows a star, "Held review" and why it was held', async ({ page, backend }) => {
    await backend.scenario('hold-review', { caterer: 'sugar-dumplin', author: 'Priya Ramdial', holdReason: 'phone' });
    await backend.signInAs('leah');
    const queue = new ReviewQueuePage(page);

    await queue.goto();

    await expect(queue.subtitle).toHaveText(/^8 waiting/);
    await expect(queue.meta('Review of Sugar Dumplin by Priya R.')).toHaveText('Held review · contains a phone number');
    await expect(queue.filter(/^Held reviews/)).toHaveAttribute('href', '/admin/reviews');
  });

  test('L2-047 filtered: the Reports filter keeps only report items, kept in the address', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const queue = new ReviewQueuePage(page);
    await queue.goto();

    await expect(queue.filters.getByRole('link')).toHaveText(['All 7', 'Profiles 2', 'Name changes 1', 'Certificates 1', 'Reports 3']);
    await queue.filter(/^Reports/).click();

    await expect(page).toHaveURL(/\/admin\/queue\?kind=reports$/);
    await expect(queue.currentFilter).toHaveText('Reports 3');
    await expect(queue.subtitle).toHaveText('3 reports · oldest first');
    await expect(queue.titles).toHaveText(['Review of Maracas Bay by Devon W.', 'Pelau House', 'Island Pot']);
  });

  test('empty: nothing waiting is all caught up, with a way to recent changes', async ({ page, backend }) => {
    await backend.scenario('empty-review-queue');
    await backend.signInAs('leah');
    const queue = new ReviewQueuePage(page);

    await queue.goto();

    await expect(queue.subtitle).toHaveText('Nothing waiting');
    await expect(queue.emptyHeading).toBeVisible();
    await expect(queue.filters).toHaveCount(0);
    await queue.expectNoAccessibilityViolations();
    await queue.recentChangesLink.click();
    await expect(page).toHaveURL(/\/admin\/changes$/);
  });

  test('error: the queue fails to load, nothing changed, and Retry loads it', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('GET /api/operator/queue', { status: 500, times: 1 });
    const queue = new ReviewQueuePage(page);

    await queue.goto();

    await expect(queue.subtitle).toHaveText('Queue didn’t load');
    await expect(queue.errorAlert).toContainText('We couldn’t load the review queue');
    await expect(queue.errorAlert).toContainText('Nothing has been changed. Try again in a moment.');
    await expect(queue.goToRecentChanges).toHaveAttribute('href', '/admin/changes');
    await queue.expectNoAccessibilityViolations();
    await queue.retry.click();
    await expect(queue.rows).toHaveCount(7);
  });

  test('loading: skeleton rows while the queue loads', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('GET /api/operator/queue');
    const queue = new ReviewQueuePage(page);

    await queue.goto();

    await expect(queue.skeletonRows).toHaveCount(7);
    await expect(queue.list).toHaveAttribute('aria-busy', 'true');
    await expect(queue.loadingStatus).toBeAttached();
    await queue.expectNoAccessibilityViolations();
    await backend.release();
    await expect(queue.rows).toHaveCount(7);
  });

  test('long: 34 items in pages of 20, late items counted in the subtitle', async ({ page, backend }) => {
    await backend.scenario('long-review-queue');
    await backend.signInAs('leah');
    const queue = new ReviewQueuePage(page);

    await queue.goto();

    await expect(queue.subtitle).toHaveText('34 waiting · oldest first · 9 waiting over 3 days');
    await expect(queue.rows).toHaveCount(20);
    await expect(queue.lateWaits).toHaveCount(9);
    await expect(queue.resultCount).toHaveText('Showing 1–20 of 34');
    await queue.pageLink(2).click();
    await expect(page).toHaveURL(/\/admin\/queue\?page=2$/);
    await expect(queue.rows).toHaveCount(14);
    await expect(queue.resultCount).toHaveText('Showing 21–34 of 34');
  });

  test('L2-064 queue-item AC-16: on a phone the queue fits without scrolling sideways', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const queue = new ReviewQueuePage(page);
    await queue.usePhone();

    await queue.goto();

    await expect(queue.rows).toHaveCount(7);
    await queue.expectNoHorizontalScroll();
    await queue.expectNoAccessibilityViolations();
  });

  test('admin-toast info: a new item arriving while the queue is open is announced with a link to it', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const queue = new ReviewQueuePage(page);
    await queue.goto();
    await expect(queue.rows).toHaveCount(7);

    await backend.scenario('new-report', { caterer: 'sugar-dumplin', reason: 'Food safety concern' });
    await page.clock.runFor(60_000);

    const toast = queue.toasts.titled('New in the queue');
    await expect(queue.toasts.textOf(toast)).toHaveText('Sugar Dumplin was reported for a food safety concern.');
    await expect(queue.rows).toHaveCount(8);
    await queue.toasts.action(toast, 'Open report').click();
    await expect(page).toHaveURL(/\/admin\/reports\/R-\d+$/);
  });
});
