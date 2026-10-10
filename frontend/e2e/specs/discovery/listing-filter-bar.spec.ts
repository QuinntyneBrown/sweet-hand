import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';

test.describe('Caterer listing: filter bar (MD)', () => {
  test.beforeEach(async ({ page }) => {
    await new ListingPage(page).useTablet();
  });

  test('L2-009.2 filter-trigger AC-3: at 800 px the filters are a bar of dropdown triggers above the grid', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.cuisineTrigger).toBeVisible();
    await expect(listing.cuisineTrigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(listing.cuisineTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(listing.cuisineTrigger).toHaveAttribute('aria-controls', 'menu-cuisine');
    await expect(listing.areaTrigger).toBeVisible();
    await expect(listing.filterColumn).toBeHidden();
    await expect(listing.filtersButton).toBeHidden();
    await listing.expectNoHorizontalScroll();
    await listing.expectNoAccessibilityViolations();
  });

  test('filter-trigger AC-6 AC-9 AC-18: Cuisine opens a dropdown of every cuisine with counts, focus on the first', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await expect(listing.resultCount).toHaveText('60 caterers');

    await listing.cuisineTrigger.focus();
    await page.keyboard.press('Enter');

    const menu = listing.dropdown('Cuisine');
    await expect(menu.panel).toBeVisible();
    await expect(listing.cuisineTrigger).toHaveAttribute('aria-expanded', 'true');
    await expect(menu.choices).toHaveCount(18);
    await expect(menu.choice('Jamaican')).toHaveAccessibleName('Jamaican 14 caterers');
    await expect(menu.choice('Jamaican')).toBeFocused();
    await expect(menu.choice('Puerto Rican')).toBeDisabled();
    await expect(menu.status).toHaveText('60 caterers');
    await listing.expectNoAccessibilityViolations();
  });

  test('filter-trigger AC-7 AC-4: ticking a cuisine applies it at once, the dropdown stays open with the new total', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.cuisineTrigger.click();
    const menu = listing.dropdown('Cuisine');

    await menu.choice('Jamaican').check();

    await expect(page).toHaveURL(/\/caterers\?cuisine=jamaican$/);
    await expect(menu.status).toHaveText('14 caterers');
    await expect(listing.resultCount).toHaveText('14 caterers');
    await expect(menu.panel).toBeVisible();
    await expect(listing.cuisineTrigger).toHaveAccessibleName('Cuisine, 1 selected');
    await expect(listing.activeFilterChips).toHaveText(['Jamaican']);

    await menu.clear.click();

    await expect(page).toHaveURL(/\/caterers$/);
    await expect(menu.status).toHaveText('60 caterers');
    await expect(menu.choice('Jamaican')).not.toBeChecked();
  });

  test('filter-trigger AC-10: Escape closes the dropdown and returns focus to its trigger', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.cuisineTrigger.click();
    await expect(listing.dropdown('Cuisine').panel).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(listing.dropdown('Cuisine').panel).toBeHidden();
    await expect(listing.cuisineTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(listing.cuisineTrigger).toBeFocused();
  });

  test('filter-trigger AC-11: tabbing out of the dropdown closes it, and so does a click outside', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await listing.cuisineTrigger.click();
    const menu = listing.dropdown('Cuisine');
    await menu.choice('Jamaican').check();
    await expect(menu.status).toHaveText('14 caterers');

    await menu.clear.focus();
    await page.keyboard.press('Tab');
    await expect(menu.panel).toBeHidden();

    await listing.cuisineTrigger.click();
    await expect(menu.panel).toBeVisible();
    await listing.heading.click();
    await expect(menu.panel).toBeHidden();
  });

  test('filter-trigger AC-12: Area opens with focus in the search field and lists the regions', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();

    await listing.areaTrigger.click();

    const menu = listing.dropdown('Area');
    await expect(menu.panel).toBeVisible();
    await expect(menu.search).toBeFocused();
    await expect(menu.choices).toHaveCount(5);
    await menu.choice('Peel').check();

    await expect(page).toHaveURL(/\/caterers\?region=peel$/);
    await expect(menu.status).toHaveText('13 caterers');
    await expect(listing.areaTrigger).toHaveAccessibleName('Area, 1 selected');
    await listing.expectNoAccessibilityViolations();

    await menu.search.fill('scar');
    await menu.suggestions.first().click();

    await expect(page).toHaveURL(/\/caterers\?region=peel&area=scarborough$/);
    await expect(listing.activeFilterChips).toHaveText(['Peel', 'Scarborough']);
  });

  test('filter-trigger AC-5: from LG there are no filter triggers', async ({ page }) => {
    const listing = new ListingPage(page);
    await page.setViewportSize({ width: 1280, height: 900 });

    await listing.open();

    await expect(listing.cuisineTrigger).toBeHidden();
    await expect(listing.filtersButton).toBeHidden();
    await expect(listing.filterColumn).toBeVisible();
  });
});
