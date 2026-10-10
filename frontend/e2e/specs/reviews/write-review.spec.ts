import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';

const REVIEW =
  'We had Pelau House for my mother’s thanksgiving service, 80 people. The curry goat and pelau were perfect and Kendra’s team set up the chafing dishes before anyone arrived. The doubles disappeared first.';

test.describe('Writing a review', () => {
  test('L2-049.1: a customer whose replied enquiry\'s event has passed is invited to write a review', async ({ page, backend }) => {
    await backend.signInAs('jeanRobert');
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');

    await expect(caterer.writePrompt).toHaveText('How was Sun 6 Sep? Your review helps the next family decide.');
    await expect(caterer.writeReview).toHaveAttribute('aria-haspopup', 'dialog');
    await caterer.writeReview.click();

    const dialog = caterer.reviewDialog;
    await expect(dialog.title).toHaveText('Write a review');
    await expect(dialog.description).toHaveText('Pelau House · your event on Sun 6 Sep');
    await expect(dialog.star(1)).toBeFocused();
    await expect(dialog.filledStars).toHaveCount(0);
    await expect(dialog.counter).toHaveText('0 / 2,000');
    await expect(dialog.text).toHaveAccessibleDescription(/20 to 2,000 characters\. Shown as Jean-Robert P\., event in September 2026\./);
    await caterer.expectNoAccessibilityViolations();
  });

  test('L2-050.2: a missing rating and too little text are listed and marked, and nothing is posted', async ({ page, backend }) => {
    await backend.signInAs('jeanRobert');
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.writeReview.click();
    const dialog = caterer.reviewDialog;

    await dialog.write(null, 'Great food!!');
    await dialog.post.click();

    await expect(dialog.summary).toBeFocused();
    await expect(dialog.summary.getByRole('heading')).toHaveText('Fix 2 things to post your review');
    await expect(dialog.summary.getByRole('link')).toHaveText(['Choose a rating from 1 to 5 stars', 'Write at least 20 characters']);
    await expect(dialog.ratingError).toHaveText('Choose a rating from 1 to 5 stars');
    await expect(dialog.star(3)).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.textError).toHaveText('Write at least 20 characters');
    await expect(dialog.text).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.counter).toHaveText('12 / 2,000');
    await caterer.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.method === 'POST' && r.path.endsWith('/reviews'))).toHaveLength(0);

    await dialog.summary.getByRole('link', { name: 'Choose a rating from 1 to 5 stars' }).click();
    await expect(dialog.star(1)).toBeFocused();
  });

  test('L2-050.1: posting is busy, then the review is live, first on the page and counted', async ({ page, backend }) => {
    await backend.signInAs('jeanRobert');
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.writeReview.click();
    const dialog = caterer.reviewDialog;
    await dialog.write(5, REVIEW);
    await expect(dialog.filledStars).toHaveCount(5);
    await expect(dialog.counter).toHaveText('203 / 2,000');
    await backend.hold('POST /api/me/caterers/pelau-house/reviews');

    await dialog.post.click();

    await expect(dialog.post).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.status).toHaveText('Posting your review');
    await expect(dialog.star(5)).toBeDisabled();
    await expect(dialog.text).toHaveAttribute('readonly', '');
    await expect(dialog.cancel).toBeDisabled();
    await backend.release();

    await expect(dialog.outcomeTitle).toHaveText('Thanks, Jean-Robert. Your review is live.');
    await expect(dialog.outcomeText).toHaveText('It’s on Pelau House’s page now. You can edit it until Mon 9 Nov, or delete it any time.');
    await expect(dialog.seeYourReview).toBeFocused();
    await caterer.expectNoAccessibilityViolations();

    await dialog.seeYourReview.click();
    await expect(dialog.dialog).toHaveCount(0);
    await expect(caterer.ratingSummary).toHaveText('4.8 · 24 reviews');
    await expect(caterer.reviewPart(caterer.review(1), 'author')).toHaveText('Jean-Robert P.');
    await expect(caterer.ownReview).toHaveCount(1);
    await expect(caterer.writeReview).toHaveCount(0);
    await expect(caterer.editReview).toBeFocused();
  });

  test('when posting fails the rating and words are kept and it can be posted again', async ({ page, backend }) => {
    await backend.signInAs('jeanRobert');
    await backend.fail('POST /api/me/caterers/pelau-house/reviews', { status: 500, times: 1 });
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.writeReview.click();
    const dialog = caterer.reviewDialog;

    await dialog.write(5, REVIEW);
    await dialog.post.click();

    await expect(dialog.alert).toContainText('Your review wasn’t posted');
    await expect(dialog.alert).toContainText('Something went wrong on our side. Your words are still here.');
    await expect(dialog.star(5)).toBeChecked();
    await expect(dialog.text).toHaveValue(REVIEW);
    await caterer.expectNoAccessibilityViolations();

    await dialog.tryAgain.click();
    await expect(dialog.outcomeTitle).toHaveText('Thanks, Jean-Robert. Your review is live.');
  });

  test('L2-050.3: a review with a phone number is held for a quick check and not shown yet', async ({ page, backend }) => {
    await backend.signInAs('jeanRobert');
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.writeReview.click();
    const dialog = caterer.reviewDialog;

    await dialog.write(5, 'Lovely food for 80 people. Call Kendra on 416-555-0199, she is the best!');
    await dialog.post.click();

    await expect(dialog.outcomeTitle).toHaveText('Your review will appear after a quick check');
    await expect(dialog.outcomeText).toHaveText('Reviews with a link, email address or phone number are checked by our team first. We’ll email you when it’s live.');
    await expect(dialog.done).toBeFocused();
    await dialog.done.click();
    await expect(caterer.ratingSummary).toHaveText('4.7 · 23 reviews');
    expect((await backend.state()).reviews.find((r: { authorName: string }) => r.authorName === 'Jean-Robert Pierre').status).toBe('Held');
  });

  test('L2-049.2 L2-013: no "Write a review" for a visitor or a customer whose only enquiry here is still open', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await expect(caterer.reviews.first()).toBeVisible();
    await expect(caterer.writeReview).toHaveCount(0);

    await backend.signInAs('marcia');
    await caterer.open('sugar-dumplin');
    await expect(caterer.heading).toHaveText('Sugar Dumplin');
    await expect(caterer.noReviews.first()).toBeVisible();
    await expect(caterer.writeReview).toHaveCount(0);
  });

  test('L2-049.3: 91 days after the event the invitation is gone', async ({ page, backend }) => {
    await backend.signInAs('jeanRobert');
    await backend.setNow('2026-12-06T15:00:00Z');
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(caterer.reviews.first()).toBeVisible();
    await expect(caterer.writeReview).toHaveCount(0);
  });

  test('L2-049.5: a caterer account is never invited to review, even its own business', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(caterer.reviews.first()).toBeVisible();
    await expect(caterer.writeReview).toHaveCount(0);
  });
});
