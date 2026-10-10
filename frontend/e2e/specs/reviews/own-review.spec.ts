import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';

const EDITED = 'The pelau tasted like my aunt’s. Ninety people, not a grain left, and the macaroni pie too.';

test.describe('The author\'s own review', () => {
  test('L2-053: the author sees their review first, marked as theirs, with Edit until Tue 20 Oct and Delete', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(caterer.reviewPart(caterer.review(1), 'author')).toHaveText('Marcia T.');
    await expect(caterer.ownReview).toHaveCount(1);
    await expect(caterer.ownReviewEditWindow).toHaveText('You can edit this review until Tue 20 Oct.');
    await expect(caterer.editReview).toHaveAccessibleName('Edit your review');
    await expect(caterer.deleteReview).toHaveAccessibleName('Delete your review');
    await expect(caterer.reviewByAuthor('Marcia T.')).toHaveCount(1);
    await caterer.expectNoAccessibilityViolations();
  });

  test('L2-053.1: editing within 30 days saves the changes and labels the review "Edited"', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');

    await caterer.editReview.click();

    const dialog = caterer.reviewDialog;
    await expect(dialog.title).toHaveText('Edit your review');
    await expect(dialog.description).toHaveText('Pelau House · you can edit until Tue 20 Oct');
    await expect(dialog.star(5)).toBeChecked();
    await expect(dialog.filledStars).toHaveCount(5);
    await expect(dialog.text).toHaveValue('The pelau tasted like my aunt’s. Ninety people, not a grain left.');
    await expect(dialog.text).toBeFocused();
    await expect(dialog.counter).toHaveText('65 / 2,000');
    await expect(dialog.text).toHaveAccessibleDescription(/Shown as Marcia T\., event in August 2026\./);
    await caterer.expectNoAccessibilityViolations();

    await dialog.rate(4);
    await dialog.text.fill(EDITED);
    await dialog.save.click();

    await expect(dialog.dialog).toHaveCount(0);
    await expect(caterer.reviewPart(caterer.ownReview, 'body')).toHaveText(EDITED);
    await expect(caterer.reviewPart(caterer.ownReview, 'date')).toHaveText('Event in August 2026 · Edited');
    await expect(caterer.reviewStars(caterer.ownReview)).toHaveAccessibleName('4 out of 5');
    await expect(caterer.editReview).toBeFocused();
  });

  test('L2-053.2: after 30 days the review can no longer be edited, only deleted', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    await backend.setNow('2026-10-21T14:00:00Z');
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(caterer.ownReview).toHaveCount(1);
    await expect(caterer.editReview).toHaveCount(0);
    await expect(caterer.ownReviewEditWindow).toHaveCount(0);
    await expect(caterer.deleteReview).toBeVisible();
  });

  test('L2-053.3: deleting asks first, is busy, then removes the review and its response and recounts', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');

    await caterer.deleteReview.click();

    const dialog = caterer.deleteDialog;
    await expect(dialog.description).toHaveText('Your review of Pelau House and Pelau House’s response will be removed. This can’t be undone.');
    await expect(dialog.keep).toBeFocused();
    await caterer.expectNoAccessibilityViolations();

    await backend.hold('DELETE /api/me/reviews/review-marcia-pelau');
    await dialog.confirm.click();
    await expect(dialog.confirm).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.keep).toBeDisabled();
    await expect(dialog.status).toHaveText('Deleting your review');
    await backend.release();

    await expect(dialog.dialog).toHaveCount(0);
    await expect(caterer.ratingSummary).toHaveText('4.7 · 22 reviews');
    await expect(caterer.reviewByAuthor('Marcia T.')).toHaveCount(0);
    await expect(caterer.ownReview).toHaveCount(0);
    await expect(caterer.reviewsHeading).toBeFocused();
  });

  test('when deleting fails the review stays and deleting can be tried again', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    await backend.fail('DELETE /api/me/reviews/review-marcia-pelau', { status: 500, times: 1 });
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.deleteReview.click();
    const dialog = caterer.deleteDialog;

    await dialog.confirm.click();

    await expect(dialog.alert).toContainText('Your review wasn’t deleted');
    await expect(dialog.alert).toContainText('Something went wrong on our side. Try again.');
    await expect(caterer.ownReview).toHaveCount(1);
    await caterer.expectNoAccessibilityViolations();

    await dialog.tryAgain.click();
    await expect(dialog.dialog).toHaveCount(0);
    await expect(caterer.ownReview).toHaveCount(0);
  });

  test('"Keep review" closes the dialog and returns focus to Delete', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.deleteReview.click();

    await caterer.deleteDialog.keep.click();

    await expect(caterer.deleteDialog.dialog).toHaveCount(0);
    await expect(caterer.deleteReview).toBeFocused();
    await expect(caterer.ownReview).toHaveCount(1);
  });
});
