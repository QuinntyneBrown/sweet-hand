import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';

test.describe('Caterer listing: offline', () => {
  test('L2-091 caterers offline: the listing stays browsable with a quiet banner, and filters and unsaved pages wait', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await expect(listing.resultCount).toHaveText('60 caterers');

    await listing.goOffline();

    await expect(listing.offlineBanner).toBeVisible();
    await expect(listing.offlineBanner).toHaveAttribute('role', 'status');
    await expect(listing.offlineBanner).toContainText('You’re offline');
    await expect(listing.offlineBanner).toContainText('Showing caterers from your last visit. Filters work again when you reconnect.');
    await expect(listing.resultCount).toHaveText(/^60 caterers · saved Sat 10 Oct, 10:0\d a\.m\.$/);
    await expect(listing.cards).toHaveCount(24);
    await expect(listing.card('Pelau House')).toHaveAttribute('href', '/caterers/pelau-house');
    await expect(listing.cuisineOption('Jamaican')).toBeDisabled();
    await expect(listing.areaOption('Peel')).toBeDisabled();
    await expect(listing.moreCuisines).toBeDisabled();
    await expect(listing.areaSearch).toBeDisabled();
    await expect(listing.pageLink(1)).toHaveAttribute('aria-current', 'page');
    await expect(listing.pageLink(2)).toHaveAttribute('aria-disabled', 'true');
    await expect(listing.pageLink(2)).not.toHaveAttribute('href');
    await expect(listing.nextPage).toHaveAttribute('aria-disabled', 'true');
    await listing.expectNoAccessibilityViolations();

    await listing.goOnline();

    await expect(listing.offlineBanner).toHaveCount(0);
    await expect(listing.resultCount).toHaveText('60 caterers');
    await expect(listing.cuisineOption('Jamaican')).toBeEnabled();
    await expect(listing.pageLink(2)).toHaveAttribute('href', '/caterers?page=2');
  });

  test('L2-091: offline, going back shows the saved results for those filters', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open('?cuisine=jamaican');
    await expect(listing.resultCount).toHaveText('14 caterers');
    await listing.cuisineOption('Jamaican').click();
    await expect(listing.resultCount).toHaveText('60 caterers');

    await listing.goOffline();
    await page.goBack();

    await expect(page).toHaveURL(/\/caterers\?cuisine=jamaican$/);
    await expect(listing.resultCount).toHaveText(/^14 caterers · saved /);
    await expect(listing.cards).toHaveCount(14);
    await expect(listing.offlineBanner).toBeVisible();
    await expect(listing.activeFilterChips).toHaveText(['Jamaican']);
    await expect(listing.removeFilter('Jamaican')).toBeDisabled();
  });

  test('L2-091 filter-trigger AC-8: on a phone the Filters and area buttons wait while offline', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.usePhone();
    await listing.open();
    await expect(listing.cards).toHaveCount(24);

    await listing.goOffline();

    await expect(listing.filtersButton).toBeDisabled();
    await expect(listing.phoneAreaButton).toBeDisabled();
    await listing.expectNoHorizontalScroll();
    await listing.expectNoAccessibilityViolations();
  });

  test('filter-trigger AC-8: at MD the dropdown triggers wait while offline', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.useTablet();
    await listing.open();
    await expect(listing.cards).toHaveCount(24);

    await listing.goOffline();

    await expect(listing.cuisineTrigger).toBeDisabled();
    await expect(listing.areaTrigger).toBeDisabled();
  });
});
