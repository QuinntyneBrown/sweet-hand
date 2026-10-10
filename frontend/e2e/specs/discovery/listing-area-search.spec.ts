import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';

test.describe('Caterer listing: area or postal code in the filter column', () => {
  test('L2-011.3 L2-065.2: typing part of an area suggests it, and choosing it adds the area to the other filters', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open('?cuisine=jamaican');
    await expect(listing.resultCount).toHaveText('14 caterers');
    await expect(listing.areaSearch).toHaveAttribute('autocapitalize', 'characters');
    await expect(listing.areaSearch).toHaveAttribute('autocomplete', 'postal-code');

    await listing.areaSearch.fill('scar');

    await expect(listing.areaSuggestions).toHaveText(['Scarborough, City of Toronto']);
    await listing.expectNoAccessibilityViolations();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/caterers\?cuisine=jamaican&area=scarborough$/);
    await expect(listing.resultCount).toHaveText('2 caterers');
    await expect(listing.activeFilterChips).toHaveText(['Jamaican', 'Scarborough']);
    await expect(listing.areaOption('Scarborough')).toHaveAttribute('aria-pressed', 'true');
    await expect(listing.areaSearch).toHaveValue('');
  });

  test('L2-011.4: text that matches no area says so and the filters do not change', async ({ page, backend }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await expect(listing.resultCount).toHaveText('60 caterers');

    await listing.areaSearch.fill('Barrie');
    await page.keyboard.press('Enter');

    await expect(listing.areaNoMatch).toHaveText('No matching areas');
    await expect(listing.areaSuggestions).toHaveCount(0);
    await expect(page).toHaveURL(/\/caterers$/);
    expect((await backend.requests()).filter((r) => r.path === '/api/public/caterers')).toHaveLength(1);
  });

  test('L2-012.1 L2-012.2 L2-012.6: a postal code filters by its area and only its first 3 characters are sent', async ({ page, backend }) => {
    const listing = new ListingPage(page);
    await listing.open();

    await listing.searchArea('m1b2k3');

    await expect(page).toHaveURL(/\/caterers\?area=scarborough$/);
    await expect(listing.resultCount).toHaveText('5 caterers');
    const lookups = (await backend.requests()).filter((r) => r.path.startsWith('/api/public/fsa/'));
    expect(lookups.map((r) => r.path)).toEqual(['/api/public/fsa/M1B']);
    expect(JSON.stringify(await backend.requests())).not.toContain('2K3');
  });

  test('L2-012.4 (postal-invalid): an invalid postal code is refused under the field and the results do not change', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await expect(listing.resultCount).toHaveText('60 caterers');

    await listing.searchArea('12345');

    await expect(listing.areaError).toHaveText('Enter a valid postal code, like M5V 2T6');
    await expect(listing.areaSearch).toHaveAttribute('aria-invalid', 'true');
    await expect(listing.areaSearch).toHaveAccessibleDescription(/Enter a valid postal code, like M5V 2T6/);
    await expect(page).toHaveURL(/\/caterers$/);
    await expect(listing.resultCount).toHaveText('60 caterers');
    await listing.expectNoAccessibilityViolations();
  });

  test('L2-012.5 (out-of-area): a postal code outside the GTA gets a warning and the results do not change', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await expect(listing.resultCount).toHaveText('60 caterers');

    await listing.searchArea('K1A 0B1');

    await expect(listing.areaWarning).toHaveText('Sweet Hand currently serves Toronto and the GTA');
    await expect(listing.areaSearch).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page).toHaveURL(/\/caterers$/);
    await expect(listing.resultCount).toHaveText('60 caterers');
    await listing.expectNoAccessibilityViolations();
  });

  test('typing a full area name and pressing Enter filters by it', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();

    await listing.searchArea('mississauga');

    await expect(page).toHaveURL(/\/caterers\?area=mississauga$/);
    await expect(listing.activeFilterChips).toHaveText(['Mississauga']);
  });
});
