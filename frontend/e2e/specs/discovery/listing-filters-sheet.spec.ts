import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';

test.describe('Caterer listing: Filters sheet (XS and SM)', () => {
  test.beforeEach(async ({ page }) => {
    await new ListingPage(page).usePhone();
  });

  test('L2-009.1 filter-trigger AC-1: on a phone the filters sit behind a Filters button', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.filtersButton).toBeVisible();
    await expect(listing.filtersButton).toHaveAccessibleName('Filters');
    await expect(listing.filtersButton).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(listing.phoneAreaButton).toHaveText('Area or postal code');
    await expect(listing.filterColumn).toBeHidden();
    await expect(listing.cuisineTrigger).toBeHidden();
    await listing.expectNoHorizontalScroll();
    await listing.expectNoAccessibilityViolations();
  });

  test('L2-009.1 L2-067.4: the sheet opens with focus on Close and lists every choice with counts', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();

    await listing.filtersButton.click();

    const sheet = listing.filtersSheet;
    await expect(sheet.dialog).toBeVisible();
    await expect(sheet.close).toBeFocused();
    await expect(sheet.cuisines).toHaveCount(18);
    await expect(sheet.choice('Jamaican')).toHaveAccessibleName('Jamaican 14 caterers');
    await expect(sheet.choice('Cuban')).toBeDisabled();
    await expect(sheet.regions).toHaveCount(5);
    await expect(sheet.apply).toHaveText('Show 60 caterers');
    await listing.expectNoAccessibilityViolations();
  });

  test('L2-009.1: choices wait in the sheet, the primary names the result, and applying it filters the listing', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.filtersButton.click();
    const sheet = listing.filtersSheet;

    await sheet.choice('Jamaican').check();
    await expect(sheet.apply).toHaveText('Show 14 caterers');
    await expect(sheet.title).toHaveText('Filters, 1 active');
    await sheet.search.fill('scar');
    await sheet.suggestions.first().click();

    await expect(sheet.selectedAreas).toHaveText(['Scarborough']);
    await expect(sheet.apply).toHaveText('Show 2 caterers');
    await expect(sheet.title).toHaveText('Filters, 2 active');
    await expect(page).toHaveURL(/\/caterers$/);
    await expect(listing.resultCount).toHaveText('60 caterers');
    await listing.expectNoAccessibilityViolations();

    await sheet.apply.click();

    await expect(sheet.dialog).toBeHidden();
    await expect(page).toHaveURL(/\/caterers\?cuisine=jamaican&area=scarborough$/);
    await expect(listing.resultCount).toHaveText('2 caterers');
    await expect(listing.filtersButton).toHaveAccessibleName('Filters, 2 active');
    await expect(listing.filtersButton).toBeFocused();
    await expect(listing.phoneAreaButton).toHaveText('Area');
  });

  test('sheet: removing a selected area in the sheet updates the pending total', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open('?cuisine=jamaican&area=scarborough');
    await listing.filtersButton.click();
    const sheet = listing.filtersSheet;
    await expect(sheet.apply).toHaveText('Show 2 caterers');

    await sheet.removeArea('Scarborough').click();

    await expect(sheet.selectedAreas).toHaveCount(0);
    await expect(sheet.apply).toHaveText('Show 14 caterers');
  });

  test('sheet: Clear empties every choice and keeps the sheet open; Close discards what was not applied', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open('?cuisine=jamaican');
    await listing.filtersButton.click();
    const sheet = listing.filtersSheet;
    await expect(sheet.choice('Jamaican')).toBeChecked();

    await sheet.clear.click();

    await expect(sheet.choice('Jamaican')).not.toBeChecked();
    await expect(sheet.apply).toHaveText('Show 60 caterers');
    await expect(sheet.dialog).toBeVisible();

    await sheet.close.click();

    await expect(sheet.dialog).toBeHidden();
    await expect(page).toHaveURL(/\/caterers\?cuisine=jamaican$/);
    await expect(listing.resultCount).toHaveText('14 caterers');
    await expect(listing.filtersButton).toBeFocused();
  });

  test('sheet busy: while the total is counted the choices and buttons wait', async ({ page, backend }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.filtersButton.click();
    const sheet = listing.filtersSheet;
    await expect(sheet.apply).toHaveText('Show 60 caterers');
    await backend.hold('GET /api/public/caterers*');

    await sheet.choice('Jamaican').check();

    await expect(sheet.dialog).toHaveAttribute('aria-busy', 'true');
    await expect(sheet.apply).toHaveAttribute('aria-busy', 'true');
    await expect(sheet.clear).toBeDisabled();
    await expect(sheet.choice('Haitian')).toBeDisabled();
    await expect(sheet.search).toHaveAttribute('readonly', '');
    await listing.expectNoAccessibilityViolations();

    await backend.release();

    await expect(sheet.apply).toHaveText('Show 14 caterers');
    await expect(sheet.dialog).not.toHaveAttribute('aria-busy');
    await expect(sheet.choice('Haitian')).toBeEnabled();
  });

  test('L2-067.4: Escape closes the sheet and focus returns to Filters', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.filtersButton.click();
    await expect(listing.filtersSheet.close).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(listing.filtersSheet.dialog).toBeHidden();
    await expect(listing.filtersButton).toBeFocused();
  });

  test('the phone area button opens the area search, which adds the area to the current filters', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open('?cuisine=jamaican');
    await expect(listing.phoneAreaButton).toHaveText('Area');

    await listing.phoneAreaButton.click();
    await expect(listing.search.dialog).toBeVisible();
    await listing.search.input.fill('scar');
    await listing.search.suggestions.first().click();

    await expect(page).toHaveURL(/\/caterers\?cuisine=jamaican&area=scarborough$/);
    await expect(listing.resultCount).toHaveText('2 caterers');
  });
});
