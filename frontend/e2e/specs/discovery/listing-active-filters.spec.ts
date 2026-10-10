import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';

test.describe('Caterer listing: active filters and no results', () => {
  test('L2-009.4 filter-list AC-5: each active filter is a removable chip above the results, then "Clear filters"', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open('?cuisine=jamaican&area=scarborough');

    await expect(listing.activeFilters).toBeVisible();
    await expect(listing.activeFilterChips).toHaveText(['Jamaican', 'Scarborough']);
    await expect(listing.removeFilter('Jamaican')).toBeVisible();
    await expect(listing.removeFilter('Scarborough')).toBeVisible();
    await expect(listing.activeFilterControls.last()).toHaveText('Clear filters');
    await listing.expectNoAccessibilityViolations();
  });

  test('chip D-6 filter-list AC-14: removing a chip drops that filter and moves focus to the next chip, then to the results', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open('?cuisine=jamaican&area=scarborough');
    await expect(listing.resultCount).toHaveText('2 caterers');

    await listing.removeFilter('Jamaican').focus();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/caterers\?area=scarborough$/);
    await expect(listing.resultCount).toHaveText('5 caterers');
    await expect(listing.activeFilterChips).toHaveText(['Scarborough']);
    await expect(listing.removeFilter('Scarborough')).toBeFocused();

    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/caterers$/);
    await expect(listing.resultCount).toHaveText('60 caterers');
    await expect(listing.activeFilters).toHaveCount(0);
    await expect(listing.resultsHeading).toBeFocused();
  });

  test('L2-008.5 filter-list AC-9: "Clear filters" removes every filter and shows the full listing', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open('?cuisine=jamaican&region=city-of-toronto');
    await expect(listing.resultCount).toHaveText('6 caterers');

    await listing.clearFilters.click();

    await expect(page).toHaveURL(/\/caterers$/);
    await expect(listing.resultCount).toHaveText('60 caterers');
    await expect(listing.cuisineOption('Jamaican')).toHaveAttribute('aria-pressed', 'false');
    await expect(listing.areaOption('City of Toronto')).toHaveAttribute('aria-pressed', 'false');
    await expect(listing.allCuisines).toHaveAttribute('aria-current', 'true');
  });

  test('with no filters there are no chips', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.resultCount).toHaveText('60 caterers');
    await expect(listing.activeFilters).toHaveCount(0);
  });

  test('L2-001.4 filter-list AC-8: when nothing matches, the empty state says so and both chosen options stay enabled', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open('?cuisine=haitian&region=durham');

    await expect(listing.resultCount).toHaveText('0 caterers');
    await expect(listing.emptyState.title).toHaveText('No caterers match these filters');
    await expect(listing.emptyState.text).toHaveText('No Haitian caterers list Durham yet. Try a nearby area, or clear the filters.');
    await expect(listing.emptyState.root).not.toHaveAttribute('role');
    await expect(listing.cuisineOption('Haitian')).toHaveAttribute('aria-pressed', 'true');
    await expect(listing.cuisineOption('Haitian')).toBeEnabled();
    await expect(listing.areaOption('Durham')).toHaveAttribute('aria-pressed', 'true');
    await expect(listing.areaOption('Durham')).toBeEnabled();
    await expect(listing.pagination).toHaveCount(0);
    await listing.expectNoAccessibilityViolations();

    await listing.emptyState.action('Clear filters').click();

    await expect(page).toHaveURL(/\/caterers$/);
    await expect(listing.resultCount).toHaveText('60 caterers');
  });

  test('L2-001.4: with several filters the empty state suggests removing one', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open('?cuisine=haitian&cuisine=belizean&region=durham');

    await expect(listing.emptyState.title).toHaveText('No caterers match these filters');
    await expect(listing.emptyState.text).toHaveText('Try removing a filter, or clear the filters.');
  });

  test('L2-009.4 filter-list AC-20: at phone width the chips show above the results and are large enough to tap', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.usePhone();

    await listing.open('?cuisine=jamaican&area=scarborough');

    await expect(listing.activeFilterChips).toHaveText(['Jamaican', 'Scarborough']);
    const box = await listing.removeFilter('Jamaican').boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
    await listing.expectNoHorizontalScroll();
    await listing.expectNoAccessibilityViolations();
  });
});
