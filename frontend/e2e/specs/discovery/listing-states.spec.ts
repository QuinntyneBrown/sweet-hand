import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';

test.describe('Caterer listing: loading, error and empty', () => {
  test('caterers loading: skeleton cards fill the grid, the count says it is loading and the filters are listed', async ({ page, backend }) => {
    await backend.hold('GET /api/public/caterers*');
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.resultCount).toHaveText('Loading caterers');
    await expect(listing.skeletonCards).toHaveCount(9);
    await expect(listing.grid).toHaveAttribute('aria-busy', 'true');
    await expect(listing.cuisineOption('Antiguan & Barbudan', { counted: false })).toBeVisible();
    await expect(listing.areaOption('Peel', { counted: false })).toBeVisible();
    await listing.expectNoAccessibilityViolations();

    await backend.release();

    await expect(listing.resultCount).toHaveText('60 caterers');
    await expect(listing.cards).toHaveCount(24);
    await expect(listing.grid).not.toHaveAttribute('aria-busy');
    await expect(listing.cuisineOption('Jamaican')).toHaveAccessibleName('Jamaican 14 caterers');
  });

  test('caterers loading at phone width: three skeleton cards', async ({ page, backend }) => {
    await backend.hold('GET /api/public/caterers*');
    const listing = new ListingPage(page);
    await listing.usePhone();

    await listing.open();

    await expect(listing.skeletonCards).toHaveCount(3);
    await listing.expectNoHorizontalScroll();
    await backend.release();
    await expect(listing.cards).toHaveCount(24);
  });

  test('caterers error: a failed load says so with a reference, keeps the filters and can be tried again', async ({ page, backend }) => {
    await backend.fail('GET /api/public/caterers*', { status: 500, body: { title: 'Server error', correlationId: '7f3k-92qd' }, times: 1 });
    const listing = new ListingPage(page);

    await listing.open('?cuisine=jamaican');

    await expect(listing.emptyState.title).toHaveText('We couldn’t load caterers');
    await expect(listing.emptyState.text).toHaveText('Something went wrong on our side. Your filters are kept.');
    await expect(listing.emptyState.root).toHaveAttribute('role', 'alert');
    await expect(listing.emptyState.reference).toHaveText('7f3k-92qd');
    await expect(listing.emptyState.action('Browse occasions')).toHaveAttribute('href', '/occasions');
    await expect(listing.resultCount).toHaveText('');
    await expect(listing.cuisineOption('Jamaican', { counted: false })).toHaveAttribute('aria-pressed', 'true');
    await expect(listing.cards).toHaveCount(0);
    await listing.expectNoAccessibilityViolations();

    await listing.emptyState.action('Try again').click();

    await expect(listing.resultCount).toHaveText('14 caterers');
    await expect(listing.cards).toHaveCount(14);
    await expect(page).toHaveURL(/\/caterers\?cuisine=jamaican$/);
  });

  test('caterers empty: before any caterer is published the listing says they are on their way', async ({ page, backend }) => {
    await backend.scenario('no-published-caterers');
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.resultCount).toHaveText('0 caterers');
    await expect(listing.emptyState.title).toHaveText('The first caterers are on their way');
    await expect(listing.emptyState.text).toHaveText('We’re reviewing caterers from across Toronto and the GTA. Check back soon.');
    await expect(listing.emptyState.action('Cater with Sweet Hand')).toHaveAttribute('href', '/join');
    await expect(listing.emptyState.photos).toHaveCount(3);
    for (const alt of await listing.emptyState.photos.evaluateAll((imgs) => imgs.map((i) => i.getAttribute('alt')))) expect(alt).toBe('');
    await expect(listing.cuisineOption('Antiguan & Barbudan')).toBeDisabled();
    await expect(listing.areaOption('Peel')).toBeDisabled();
    await expect(listing.moreCuisines).toBeDisabled();
    await expect(listing.areaSearch).toBeDisabled();
    await expect(listing.activeFilters).toHaveCount(0);
    await listing.expectNoAccessibilityViolations();
  });
});
