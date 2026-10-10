import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';
import { OccasionsPage } from '../../pages/occasions.page';

const OCCASIONS = [
  ['Weddings', '23 caterers', 'weddings'],
  ['Birthdays', '41 caterers', 'birthdays'],
  ['Corporate events', '28 caterers', 'corporate-events'],
  ['Funerals and repasts', '17 caterers', 'funerals-and-repasts'],
  ['Religious and cultural celebrations', '26 caterers', 'religious-and-cultural-celebrations'],
  ['Family gatherings', '47 caterers', 'family-gatherings'],
  ['Private dinners', '12 caterers', 'private-dinners'],
  ['Community events', '19 caterers', 'community-events'],
];

test.describe('Occasions', () => {
  test('L2-021 occasions default: eight occasion tiles, each with how many caterers take it on', async ({ page }) => {
    const occasions = new OccasionsPage(page);

    await occasions.open();

    await expect(occasions.heading).toHaveText('Occasions');
    await expect(occasions.subtitle).toHaveText('Find a caterer for the day you’re planning.');
    await expect(occasions.header.currentLink).toHaveText('Occasions');
    await expect(occasions.tileNames).toHaveText(OCCASIONS.map(([name]) => name));
    await expect(occasions.tileCounts).toHaveText(OCCASIONS.map(([, n]) => n));
    for (const [name, , id] of OCCASIONS) await expect(occasions.tile(name)).toHaveAttribute('href', `/caterers?occasion=${id}`);
    await expect(occasions.tile('Weddings')).toHaveAccessibleName(/^Weddings\s?23 caterers$/);
    for (const alt of await occasions.tilePhotos.evaluateAll((imgs) => imgs.map((i) => i.getAttribute('alt')))) expect(alt).toBe('');
    await expect(page).toHaveTitle('Occasions · Sweet Hand');
    await occasions.expectNoAccessibilityViolations();
  });

  test('L2-085.3: only the first row of occasion photos loads eagerly', async ({ page }) => {
    const occasions = new OccasionsPage(page);

    await occasions.open();

    await expect(occasions.tiles).toHaveCount(8);
    const lazy = await occasions.tilePhotos.evaluateAll((imgs) => imgs.map((i) => i.getAttribute('loading')));
    expect(lazy).toEqual([null, null, null, null, 'lazy', 'lazy', 'lazy', 'lazy']);
  });

  test('occasions at phone width: two columns of tiles and no sideways scrolling', async ({ page }) => {
    const occasions = new OccasionsPage(page);
    await occasions.usePhone();

    await occasions.open();

    await expect(occasions.tiles).toHaveCount(8);
    const [first, second] = await occasions.tiles.evaluateAll((els) => els.slice(0, 2).map((e) => e.getBoundingClientRect().top));
    expect(Math.abs(first - second)).toBeLessThan(2);
    await occasions.expectNoHorizontalScroll();
    await occasions.expectNoAccessibilityViolations();
  });

  test('occasions loading: eight skeleton tiles while the counts load', async ({ page, backend }) => {
    await backend.hold('GET /api/public/occasions');
    const occasions = new OccasionsPage(page);

    await occasions.open();

    await expect(occasions.skeletonTiles).toHaveCount(8);
    await expect(occasions.grid).toHaveAttribute('aria-busy', 'true');
    await expect(occasions.loadingStatus).toHaveText('Loading occasions');
    await occasions.expectNoAccessibilityViolations();

    await backend.release();

    await expect(occasions.tiles).toHaveCount(8);
    await expect(occasions.grid).not.toHaveAttribute('aria-busy');
  });

  test('occasions error: a failed load says so with a reference and offers all caterers instead', async ({ page, backend }) => {
    await backend.fail('GET /api/public/occasions', { status: 500, body: { title: 'Server error', correlationId: '2m8q-41tx' }, times: 1 });
    const occasions = new OccasionsPage(page);

    await occasions.open();

    await expect(occasions.emptyState.title).toHaveText('We couldn’t load occasions');
    await expect(occasions.emptyState.text).toHaveText('Something went wrong on our side.');
    await expect(occasions.emptyState.root).toHaveAttribute('role', 'alert');
    await expect(occasions.emptyState.reference).toHaveText('2m8q-41tx');
    await expect(occasions.emptyState.action('Browse all caterers')).toHaveAttribute('href', '/caterers');
    await occasions.expectNoAccessibilityViolations();

    await occasions.emptyState.action('Try again').click();

    await expect(occasions.tiles).toHaveCount(8);
  });

  test('L2-021 caterers occasion: an occasion tile opens the listing of caterers who take it on', async ({ page }) => {
    const occasions = new OccasionsPage(page);
    const listing = new ListingPage(page);
    await occasions.open();

    await occasions.tile('Weddings').click();

    await expect(page).toHaveURL(/\/caterers\?occasion=weddings$/);
    await expect(listing.heading).toHaveText('Weddings');
    await expect(listing.backToOccasions).toHaveAttribute('href', '/occasions');
    await expect(listing.resultCount).toHaveText('23 caterers take on weddings');
    await expect(listing.cards).toHaveCount(23);
    await expect(listing.activeFilterChips).toHaveText(['Weddings']);
    await listing.expectNoAccessibilityViolations();
  });

  test('L2-021: the occasion combines with other filters, and removing it returns to all caterers', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open('?occasion=weddings&cuisine=jamaican');

    await expect(listing.resultCount).toHaveText('6 caterers take on weddings');
    await expect(listing.activeFilterChips).toHaveText(['Jamaican', 'Weddings']);
    await listing.removeFilter('Weddings').click();

    await expect(page).toHaveURL(/\/caterers\?cuisine=jamaican$/);
    await expect(listing.heading).toHaveText('Caterers');
    await expect(listing.resultCount).toHaveText('14 caterers');
    await expect(listing.backToOccasions).toHaveCount(0);
  });

  test('L2-003.3: an unknown occasion is ignored', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open('?occasion=atlantis');

    await expect(listing.heading).toHaveText('Caterers');
    await expect(listing.resultCount).toHaveText('60 caterers');
    await expect(listing.activeFilters).toHaveCount(0);
  });
});
