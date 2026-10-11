import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';

test.describe('Caterer listing: filter column (LG and XL)', () => {
  test('L2-009.3 filter-list AC-1 AC-2 AC-6: the column lists cuisines and regions with counts', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.filterColumn).toBeVisible();
    await expect(listing.cuisineItems).toHaveText([
      'All',
      'Jamaican 14 caterers',
      'Trinidadian & Tobagonian 11 caterers',
      'Guyanese 10 caterers',
      'Barbadian (Bajan) 6 caterers',
      'Haitian 5 caterers',
      'Grenadian 4 caterers',
    ]);
    await expect(listing.allCuisines).toHaveAttribute('aria-current', 'true');
    await expect(listing.cuisineOption('Jamaican')).toHaveAttribute('aria-pressed', 'false');
    await expect(listing.moreCuisines).toHaveText('More cuisines (12)');
    await expect(listing.moreCuisines).toHaveAttribute('aria-expanded', 'false');
    await expect(listing.areaItems).toHaveText([
      'City of Toronto 30 caterers',
      'Peel 13 caterers',
      'York Region 7 caterers',
      'Durham 10 caterers',
      'Halton 3 caterers',
    ]);
    await listing.expectNoAccessibilityViolations();
  });

  test('L2-008.1 L2-067.5 filter-list AC-12: choosing a cuisine filters in place, keeps focus and announces the count', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await expect(listing.cards).toHaveCount(24);
    await listing.markDocument();

    await listing.cuisineOption('Jamaican').focus();
    await page.keyboard.press('Space');

    await expect(page).toHaveURL(/\/caterers\?cuisine=jamaican$/);
    await expect(listing.resultCount).toHaveText('14 caterers');
    await expect(listing.resultCount).toHaveAttribute('aria-live', 'polite');
    await expect(listing.cards).toHaveCount(14);
    await expect(listing.cuisineOption('Jamaican')).toHaveAttribute('aria-pressed', 'true');
    await expect(listing.cuisineOption('Jamaican')).toBeFocused();
    await expect(listing.allCuisines).not.toHaveAttribute('aria-current');
    await expect(listing.areaOption('City of Toronto')).toHaveAccessibleName('City of Toronto 6 caterers');
    expect(await listing.documentWasKept()).toBe(true);
  });

  test('L2-008.3 L2-008.4 L2-011.1 filter-list AC-4: a cuisine and an area together, with zero-count options disabled in place', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open('?cuisine=jamaican&area=scarborough');

    await expect(listing.resultCount).toHaveText('2 caterers');
    expect((await listing.cardNames()).sort()).toEqual(["Auntie Merle's Table", 'Island Pot']);
    await expect(listing.cuisineOption('Jamaican')).toHaveAttribute('aria-pressed', 'true');
    await expect(listing.cuisineItems).toHaveText([
      'All',
      'Jamaican 2 caterers',
      'Trinidadian & Tobagonian 1 caterer',
      'Guyanese 2 caterers',
      'Barbadian (Bajan) 0 caterers',
      'Haitian 0 caterers',
      'Grenadian 0 caterers',
    ]);
    await expect(listing.cuisineOption('Barbadian (Bajan)')).toBeDisabled();
    await expect(listing.cuisineOption('Guyanese')).toBeEnabled();
    await expect(listing.areaItems.first()).toHaveText('Scarborough 2 caterers');
    await expect(listing.areaOption('Scarborough')).toHaveAttribute('aria-pressed', 'true');
    await listing.expectNoAccessibilityViolations();
  });

  test('L2-008.2: several cuisines show caterers that offer any of them', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();

    await listing.cuisineOption('Haitian').click();
    await expect(listing.resultCount).toHaveText('5 caterers');
    await listing.cuisineOption('Trinidadian & Tobagonian').click();

    await expect(listing.resultCount).toHaveText('16 caterers');
    await expect(page).toHaveURL(/cuisine=haitian&cuisine=trinidadian-and-tobagonian/);
    await expect(listing.card('Ti Kay')).toBeVisible();
    await expect(listing.card('Pelau House')).toBeVisible();
  });

  test('L2-011.2: choosing a region shows every caterer serving an area in it, and paging keeps the region', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();

    await listing.areaOption('City of Toronto').click();

    await expect(page).toHaveURL(/\/caterers\?region=city-of-toronto$/);
    await expect(listing.resultCount).toHaveText('30 caterers');
    await expect(listing.areaOption('City of Toronto')).toHaveAttribute('aria-pressed', 'true');
    await expect(listing.paginationSummary).toHaveText('Showing 1–24 of 30');
    await expect(listing.pageLink(2)).toHaveAttribute('href', '/caterers?region=city-of-toronto&page=2');
  });

  test('L2-003.1: a shared address opens with its filters and page', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open('?region=city-of-toronto&page=2');

    await expect(listing.resultCount).toHaveText('30 caterers');
    await expect(listing.paginationSummary).toHaveText('Showing 25–30 of 30');
    await expect(listing.cards).toHaveCount(6);
    await expect(listing.areaOption('City of Toronto')).toHaveAttribute('aria-pressed', 'true');
  });

  test('L2-003.2: Back restores the previous filters and their results', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.cuisineOption('Jamaican').click();
    await expect(listing.resultCount).toHaveText('14 caterers');
    await listing.cuisineOption('Haitian').click();
    await expect(listing.resultCount).toHaveText('19 caterers');

    await page.goBack();

    await expect(page).toHaveURL(/\/caterers\?cuisine=jamaican$/);
    await expect(listing.resultCount).toHaveText('14 caterers');
    await expect(listing.cuisineOption('Haitian')).toHaveAttribute('aria-pressed', 'false');
  });

  test('L2-003.3: an unknown filter value is ignored and the valid ones still apply', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open('?cuisine=atlantis&cuisine=haitian');

    await expect(listing.resultCount).toHaveText('5 caterers');
    await expect(listing.cuisineOption('Haitian')).toHaveAttribute('aria-pressed', 'true');
    await listing.cuisineOption('Jamaican').click();
    await expect(listing.resultCount).toHaveText('19 caterers');
    await expect(page).not.toHaveURL(/atlantis/);
  });

  test('filter-list AC-11 D-4: More shows every cuisine, and a cuisine chosen from it stays visible after Fewer', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();

    await listing.moreCuisines.click();

    await expect(listing.moreCuisines).toHaveText('Fewer cuisines');
    await expect(listing.moreCuisines).toHaveAttribute('aria-expanded', 'true');
    await expect(listing.moreCuisines).toBeFocused();
    await expect(listing.cuisineItems).toHaveCount(19);
    await expect(listing.cuisineOption('Puerto Rican')).toBeDisabled();
    await listing.cuisineOption('Belizean').click();
    await expect(listing.resultCount).toHaveText('1 caterer');
    await listing.moreCuisines.click();

    await expect(listing.moreCuisines).toHaveText('More cuisines (11)');
    await expect(listing.cuisineOption('Belizean')).toHaveAttribute('aria-pressed', 'true');
    await expect(listing.cuisineOption('Surinamese')).toBeHidden();
  });

  test('"All" removes the cuisine filters and keeps the area', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open('?cuisine=jamaican&region=peel');
    await expect(listing.resultCount).toHaveText('3 caterers');

    await listing.allCuisines.click();

    await expect(page).toHaveURL(/\/caterers\?region=peel$/);
    await expect(listing.resultCount).toHaveText('13 caterers');
    await expect(listing.allCuisines).toHaveAttribute('aria-current', 'true');
  });
});
