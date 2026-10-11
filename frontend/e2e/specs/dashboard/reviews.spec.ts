import { test, expect } from '../../support/test';
import { DashboardReviewsPage } from '../../pages/dashboard-reviews.page';
import { cast } from '../../support/cast';

test.describe('Responding to reviews', () => {
  test('L2-052: reviews newest first, each with its response or a way to respond', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const reviews = new DashboardReviewsPage(page);

    await reviews.open();

    await expect(reviews.heading).toHaveText('Reviews');
    await expect(reviews.subtitle).toHaveText('4.7 · 23 reviews · 1 without a response');
    await expect(reviews.navLink('Reviews')).toHaveAttribute('aria-current', 'page');
    await expect(reviews.reviews).toHaveCount(10);
    await expect(reviews.authors.first()).toHaveText('Marcia T.');
    await expect(reviews.dateOf('Marcia T.')).toHaveText('Event in August 2026 · Posted Sun 20 Sep');
    await expect(reviews.responseOf('Marcia T.')).toHaveText(/^Response from Pelau House\s*Thank you, Marcia\. Give your aunt our regards!$/);
    await expect(reviews.editResponse('Marcia T.')).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(reviews.awaitingOf('Andre C.')).toHaveText('No response yet');
    await expect(reviews.respond('Andre C.')).toBeVisible();
    await reviews.expectNoAccessibilityViolations();

    await reviews.showMore.click();
    await expect(reviews.reviews).toHaveCount(20);
    await reviews.showMore.click();
    await expect(reviews.reviews).toHaveCount(23);
    await expect(reviews.showMore).toHaveCount(0);
  });

  test('L2-052.1 L2-052.4: a response is checked, posted under the review and emailed to the reviewer', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const reviews = new DashboardReviewsPage(page);
    await reviews.open();

    await reviews.respond('Andre C.').click();

    await expect(reviews.response.title).toHaveText('Respond to Andre C.');
    await expect(reviews.response.description).toHaveText('One public response per review.');
    await expect(reviews.response.quote).toContainText('Doubles for 60 at the office, hot and on time. Kendra answered every question the same day.');
    await expect(reviews.text).toBeFocused();
    await expect(reviews.help).toHaveText('Public on your page as “Response from Pelau House”. Andre gets an email.');
    await expect(reviews.response.counter).toHaveText('0 / 1,000');
    await reviews.expectNoAccessibilityViolations();

    await reviews.response.button('Post response').click();
    await expect(reviews.response.summary).toBeFocused();
    await expect(reviews.response.summaryHeading).toHaveText('Fix 1 thing to post your response');
    await expect(reviews.response.errorFor('response')).toHaveText('Write a response, up to 1,000 characters');
    await expect(reviews.text).toHaveAttribute('aria-invalid', 'true');
    await reviews.expectNoAccessibilityViolations();

    await reviews.text.fill('Thanks, Andre! Feeding your team was a pleasure. Doubles anytime.');
    await expect(reviews.response.counter).toHaveText('65 / 1,000');
    await backend.hold('POST /api/caterer/reviews/*');
    await reviews.response.button('Post response').click();
    await expect(reviews.response.button('Post response')).toHaveAttribute('aria-busy', 'true');
    await expect(reviews.response.status).toHaveText('Posting your response');
    await expect(reviews.text).toHaveAttribute('readonly', '');
    await backend.release();

    await expect(reviews.response.root).toBeHidden();
    await expect(reviews.responseOf('Andre C.')).toHaveText(/Thanks, Andre! Feeding your team was a pleasure\. Doubles anytime\.$/);
    await expect(reviews.subtitle).toHaveText('4.7 · 23 reviews');
    await expect(reviews.editResponse('Andre C.')).toBeFocused();
    const { account } = await backend.state();
    expect(account.outbox).toContainEqual(expect.objectContaining({ to: cast.andre.email, kind: 'review-response' }));
  });

  test('a response that fails to post keeps the text', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const reviews = new DashboardReviewsPage(page);
    await reviews.open();
    await reviews.respond('Andre C.').click();
    await backend.fail('POST /api/caterer/reviews/*', { network: true, times: 1 });

    await reviews.text.fill('Thanks, Andre!');
    await reviews.response.button('Post response').click();

    await expect(reviews.response.alert).toContainText('Your response wasn’t posted');
    await expect(reviews.response.alert).toContainText('We couldn’t reach Sweet Hand. Your text is still here; try again.');
    await expect(reviews.text).toHaveValue('Thanks, Andre!');
  });

  test('L2-052.2: a second response is refused and the existing one is offered for editing', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const reviews = new DashboardReviewsPage(page);
    await reviews.open();
    await reviews.respond('Andre C.').click();
    await backend.scenario('review-responded', { reviewId: 'review-andre-pelau', text: 'Thank you, Andre. See you at the next office lunch!' });

    await reviews.text.fill('Thanks, Andre!');
    await reviews.response.button('Post response').click();

    await expect(reviews.response.title).toHaveText('Edit your response');
    await expect(reviews.response.alert).toContainText('You’ve already responded to this review');
    await expect(reviews.text).toHaveValue('Thank you, Andre. See you at the next office lunch!');
  });

  test('L2-052: a response can be edited and deleted, with Undo', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const reviews = new DashboardReviewsPage(page);
    await reviews.open();

    await reviews.editResponse('Marcia T.').click();

    await expect(reviews.response.title).toHaveText('Edit your response');
    await expect(reviews.response.description).toHaveText('Posted Mon 21 Sep. You can edit or delete it any time.');
    await expect(reviews.text).toHaveValue('Thank you, Marcia. Give your aunt our regards!');
    await expect(reviews.help).toHaveText('Public on your page as “Response from Pelau House”. Marcia gets an email.');
    await reviews.expectNoAccessibilityViolations();
    await reviews.text.fill('Thank you, Marcia. Give your aunt our warmest regards!');
    await reviews.response.button('Save response').click();
    await expect(reviews.response.root).toBeHidden();
    await expect(reviews.responseOf('Marcia T.')).toContainText('Give your aunt our warmest regards!');

    await reviews.editResponse('Marcia T.').click();
    await reviews.response.button('Delete response').click();
    await expect(reviews.response.button('Delete for good?')).toBeFocused();
    await reviews.response.button('Delete for good?').click();

    await expect(reviews.response.root).toBeHidden();
    await expect(reviews.responseOf('Marcia T.')).toHaveCount(0);
    await expect(reviews.respond('Marcia T.')).toBeVisible();
    await expect(reviews.toast).toContainText('Response deleted');
    await reviews.toast.getByRole('button', { name: 'Undo' }).click();
    await expect(reviews.responseOf('Marcia T.')).toContainText('Give your aunt our warmest regards!');
  });

  test('L2-044.2: a pending name change is shown as a banner that stays', async ({ page, backend }) => {
    await backend.scenario('pelau-name-change-pending');
    await backend.signInAs('kendra');
    const reviews = new DashboardReviewsPage(page);

    await reviews.open();

    await expect(reviews.banner).toContainText('Name change waiting for review');
    await expect(reviews.banner).toContainText('Your page shows “Pelau House” until “Pelau House by Kendra” is approved.');
    await expect(reviews.banner.getByRole('link', { name: 'See the change' })).toHaveAttribute('href', '/dashboard/profile/details');
    await expect(reviews.banner.getByRole('button', { name: 'Dismiss' })).toHaveCount(0);
    await reviews.expectNoAccessibilityViolations();
  });

  test('L2-039.4: a profile in review says so in a banner that can be dismissed', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'pending' });
    await backend.signInAs('beverley');
    const reviews = new DashboardReviewsPage(page);

    await reviews.open();

    await expect(reviews.banner).toContainText('Your profile is in review');
    await expect(reviews.banner).toContainText('We’ll email you within 3 business days.');
    await reviews.expectNoAccessibilityViolations();
    await reviews.banner.getByRole('button', { name: 'Dismiss' }).click();
    await expect(reviews.banner).toHaveCount(0);
  });

  test('L2-048.3: changes requested is shown as a banner with the reason', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'changes-requested' });
    await backend.signInAs('beverley');
    const reviews = new DashboardReviewsPage(page);

    await reviews.open();

    await expect(reviews.banner).toHaveClass(/alert--warning/);
    await expect(reviews.banner).toContainText('“Photos 2 and 5 look like stock images. Please upload photos of your own food.”');
    await expect(reviews.banner.getByRole('link', { name: 'Go to photos' })).toHaveAttribute('href', '/dashboard/profile/photos');
  });

  test('empty, loading and error', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'published' });
    await backend.signInAs('beverley');
    const reviews = new DashboardReviewsPage(page);

    await reviews.open();
    await expect(reviews.subtitle).toHaveText('No reviews yet');
    await expect(reviews.empty.locator('.empty__title')).toHaveText('Your first review is on its way');
    await expect(reviews.empty).toContainText('Customers can review you once you’ve replied to their enquiry and their event has passed. You can answer each review once, in public.');
    await expect(reviews.link('Go to enquiries')).toHaveAttribute('href', '/dashboard/enquiries');
    await reviews.expectNoAccessibilityViolations();

    await backend.hold('GET /api/caterer/reviews');
    await reviews.open();
    await expect(reviews.loadingStatus).toHaveText('Loading reviews');
    await reviews.expectNoAccessibilityViolations();
    await backend.fail('GET /api/caterer/reviews', { status: 500, body: { title: 'x', correlationId: '7f3c-91a2' }, times: 1 });
    await backend.release();
    await reviews.open();
    await expect(reviews.loadError.locator('.empty__title')).toHaveText('We couldn’t load your reviews');
    await expect(reviews.loadError).toContainText('Your reviews are still on your public page. This is a problem on our side; try again in a moment.');
    await expect(reviews.loadErrorReference).toHaveText('Reference 7f3c-91a2');
    await reviews.expectNoAccessibilityViolations();
  });
});
