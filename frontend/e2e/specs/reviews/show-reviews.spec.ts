import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';

test.describe('Reviews on the caterer page', () => {
  test('L2-051.1 L2-051.3: the summary, then the newest reviews with name, event month, rating, text and response', async ({ page }) => {
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(caterer.ratingLink).toHaveAccessibleName('Rated 4.7 · 23 reviews');
    await expect(caterer.ratingLink).toHaveAttribute('href', /#reviews$/);
    await expect(caterer.ratingSummary).toHaveText('4.7 · 23 reviews');
    await expect(caterer.reviews).toHaveCount(10);
    const marcia = caterer.review(1);
    await expect(caterer.reviewPart(marcia, 'author')).toHaveText('Marcia T.');
    await expect(caterer.reviewPart(marcia, 'date')).toHaveText('Event in August 2026');
    await expect(caterer.reviewStars(marcia)).toHaveAccessibleName('5 out of 5');
    await expect(caterer.reviewPart(marcia, 'body')).toHaveText('The pelau tasted like my aunt’s. Ninety people, not a grain left.');
    await expect(caterer.reviewResponse(marcia)).toHaveText(/^Response from Pelau House\s*Thank you, Marcia\. Give your aunt our regards!$/);
    await expect(caterer.reviewPart(caterer.review(2), 'author')).toHaveText('Andre C.');
    await expect(caterer.reviewPart(caterer.review(2), 'date')).toHaveText('Event in July 2026');
    await expect(caterer.reviewResponse(caterer.review(2))).toHaveCount(0);
    await expect(caterer.reviewPart(caterer.review(3), 'author')).toHaveText('Nadia J.');
    await expect(caterer.reviewStars(caterer.review(3))).toHaveAccessibleName('4 out of 5');
    await caterer.expectNoAccessibilityViolations();
  });

  test('L2-051.4: "Show more reviews" adds the next 10 without a reload until all 23 are shown', async ({ page }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await expect(caterer.showMoreReviews).toHaveAttribute('aria-controls', 'review-list');

    await caterer.showMoreReviews.click();

    await expect(caterer.reviews).toHaveCount(20);
    await expect(caterer.reviewsStatus).toHaveText('20 of 23 reviews shown');
    await caterer.showMoreReviews.click();
    await expect(caterer.reviews).toHaveCount(23);
    await expect(caterer.showMoreReviews).toHaveCount(0);
    await expect(page).toHaveURL(/\/caterers\/pelau-house$/);
  });

  test('L2-051.2: a caterer with no reviews says "No reviews yet" and shows no average', async ({ page }) => {
    const caterer = new CatererPage(page);

    await caterer.open('green-fig-catering');

    await expect(caterer.menuCount).toHaveText('8 dishes');
    await expect(caterer.fact(caterer.panel, 'Guests')).toHaveText('Serves 15–120 guests');
    await expect(caterer.noReviews).toHaveText(['No reviews yet', 'Reviews come from customers after their event.']);
    await expect(caterer.ratingSummary).toHaveCount(0);
    await expect(caterer.ratingLink).toHaveCount(0);
    await caterer.expectNoAccessibilityViolations();
  });

  test('L2-051.5: held reviews are left out of the list, the count and the average', async ({ page, backend }) => {
    await backend.scenario('set-review-status', { caterer: 'pelau-house', author: 'Marcia Thompson', status: 'Held' });
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(caterer.ratingSummary).toHaveText('4.7 · 22 reviews');
    await expect(caterer.reviewPart(caterer.review(1), 'author')).toHaveText('Andre C.');
    await expect(caterer.reviewByAuthor('Marcia T.')).toHaveCount(0);
  });
});
