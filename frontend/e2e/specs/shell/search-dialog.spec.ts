import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';

test.describe('Search by area or postal code', () => {
  test('L2-067.4: the search opens as a dialog with focus in the field, and Escape returns focus to the icon', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();

    await listing.header.searchButton.click();

    await expect(listing.search.dialog).toBeVisible();
    await expect(listing.header.searchButton).toHaveAttribute('aria-expanded', 'true');
    await expect(listing.search.input).toBeFocused();
    await expect(listing.search.input).toHaveAttribute('autocapitalize', 'characters');
    await expect(listing.search.input).toHaveAttribute('autocomplete', 'postal-code');
    await listing.expectNoAccessibilityViolations();

    await page.keyboard.press('Escape');

    await expect(listing.search.dialog).toBeHidden();
    await expect(listing.header.searchButton).toBeFocused();
  });

  test('Cancel and Close also close the dialog', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();

    await listing.header.searchButton.click();
    await listing.search.cancel.click();
    await expect(listing.search.dialog).toBeHidden();

    await listing.header.searchButton.click();
    await listing.search.close.click();
    await expect(listing.search.dialog).toBeHidden();
    await expect(listing.header.searchButton).toBeFocused();
  });

  test('L2-011.3: typing part of an area suggests it, ignoring case and accents, and picking it filters the listing', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.header.searchButton.click();

    await listing.search.input.fill('SCAR');

    await expect(listing.search.suggestions).toHaveText(['Scarborough, City of Toronto']);
    await expect(listing.search.matchStatus).toHaveText('1 area matches');
    await expect(listing.search.input).toHaveAttribute('aria-expanded', 'true');
    await listing.expectNoAccessibilityViolations();

    await page.keyboard.press('ArrowDown');
    await expect(listing.search.input).toHaveAttribute('aria-activedescendant', /scarborough/);
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/caterers\?area=scarborough$/);
    await expect(listing.search.dialog).toBeHidden();
  });

  test('L2-011.4: text that matches no area says so', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.header.searchButton.click();

    await listing.search.input.fill('Barrie');

    await expect(listing.search.noMatch).toHaveText('No matching areas');
    await expect(listing.search.suggestions).toHaveCount(0);
  });

  test('L2-012.1 L2-012.6: a postal code finds its area, and only the first 3 characters are sent', async ({ page, backend }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.header.searchButton.click();

    await listing.search.search('m1b2k3');

    await expect(page).toHaveURL(/\/caterers\?area=scarborough$/);
    const lookups = (await backend.requests()).filter((r) => r.path.startsWith('/api/public/fsa/'));
    expect(lookups.map((r) => r.path)).toEqual(['/api/public/fsa/M1B']);
    expect(JSON.stringify(await backend.requests())).not.toContain('2K3');
  });

  test('L2-012.3: a forward sortation area alone works too', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.header.searchButton.click();

    await listing.search.search('M1B');

    await expect(page).toHaveURL(/\/caterers\?area=scarborough$/);
  });

  test('typing an area name in full and submitting filters by that area', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.header.searchButton.click();

    await listing.search.search('mississauga');

    await expect(page).toHaveURL(/\/caterers\?area=mississauga$/);
  });

  test('L2-012.4: an invalid postal code is refused and the listing does not change', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.header.searchButton.click();

    await listing.search.search('12345');

    await expect(listing.search.error).toHaveText('Enter a valid postal code, like M5V 2T6');
    await expect(listing.search.input).toHaveAttribute('aria-invalid', 'true');
    await expect(page).toHaveURL(/\/caterers$/);
    await listing.expectNoAccessibilityViolations();

    await listing.search.search('MMM 1B1');
    await expect(listing.search.error).toHaveText('Enter a valid postal code, like M5V 2T6');
  });

  test('L2-012.5: a postal code outside the GTA gets a warning and the listing does not change', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.header.searchButton.click();

    await listing.search.search('K1A 0B1');

    await expect(listing.search.warning).toHaveText('Sweet Hand currently serves Toronto and the GTA');
    await expect(listing.search.input).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page).toHaveURL(/\/caterers$/);
  });

  test('while the postal code is looked up the dialog is busy', async ({ page, backend }) => {
    await backend.hold('GET /api/public/fsa/*');
    const listing = new ListingPage(page);
    await listing.open();
    await listing.header.searchButton.click();

    await listing.search.search('M1B 2K3');

    await expect(listing.search.busyStatus).toHaveText('Finding caterers near M1B 2K3');
    await expect(listing.search.submit).toHaveAttribute('aria-busy', 'true');
    await expect(listing.search.cancel).toBeDisabled();
    await expect(listing.search.input).toHaveAttribute('readonly', '');
    await backend.release();
    await expect(page).toHaveURL(/\/caterers\?area=scarborough$/);
  });

  test('L2-011.2: a whole region can be chosen', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.header.searchButton.click();

    await listing.search.region('Peel').click();

    await expect(page).toHaveURL(/\/caterers\?region=peel$/);
    await expect(listing.search.dialog).toBeHidden();
  });
});
