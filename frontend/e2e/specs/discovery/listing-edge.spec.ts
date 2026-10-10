import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';

const LONG_NAME = 'The Original Auntie Philomena’s Roti, Doubles & Pholourie Kitchen';

test.describe('Caterer listing: edge cases and images', () => {
  test('caterers edge: 1,284 caterers page as 1 2 … 54, with thousands separators', async ({ page, backend }) => {
    await backend.scenario('large-catalog');
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.resultCount).toHaveText('1,284 caterers');
    await expect(listing.paginationSummary).toHaveText('Showing 1–24 of 1,284');
    await expect(listing.pageLinks).toHaveText(['1', '2', '54']);
    await expect(listing.paginationGaps).toHaveCount(1);
    await expect(listing.pageLink(54)).toHaveAttribute('href', '/caterers?page=54');
    await listing.expectNoAccessibilityViolations();
  });

  test('pagination AC-7 AC-8: page 6 of 54 shows its neighbours from 36rem and only itself on a phone', async ({ page, backend }) => {
    await backend.scenario('large-catalog');
    const listing = new ListingPage(page);

    await listing.open('?page=6');

    await expect(listing.pageLinks).toHaveText(['1', '5', '6', '7', '54']);
    await expect(listing.paginationGaps).toHaveCount(2);
    await listing.usePhone();
    await expect(listing.pageLinks).toHaveText(['1', '6', '54']);
    await listing.expectNoHorizontalScroll();
    await listing.expectNoAccessibilityViolations();
  });

  test('L2-004.4: a long name is cut after two lines and is still read in full', async ({ page, backend }) => {
    await backend.scenario('large-catalog');
    const listing = new ListingPage(page);

    await listing.open();

    const card = listing.card('The Original Auntie');
    await expect(listing.cardName(card)).toHaveText(LONG_NAME);
    expect(await listing.nameIsCut(card)).toBe(true);
    await expect(card).toHaveAccessibleName(new RegExp(`${LONG_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
    await expect(listing.card('Ça Gou Kreyòl Kitchen')).toBeVisible();
    await expect(listing.cardMeta(listing.card('Dominique’s'))).toHaveText('Dominican (Dominican Republic) · Halton Hills');
  });

  test('L2-006.5: a photo that fails to load leaves a placeholder of the same size', async ({ page, backend }) => {
    await backend.scenario('large-catalog');
    const listing = new ListingPage(page);

    await listing.open();

    const failed = listing.card('Salt Pond Provisions');
    await expect(listing.failedPhoto(failed)).toBeVisible();
    await expect(listing.failedPhoto(failed)).toContainText('Photo unavailable');
    const placeholder = await listing.failedPhoto(failed).boundingBox();
    const photo = await listing.cardPhotoFrame(listing.card('Ça Gou Kreyòl Kitchen')).boundingBox();
    expect(Math.round(placeholder!.width)).toBe(Math.round(photo!.width));
    expect(Math.round(placeholder!.height)).toBe(Math.round(photo!.height));
  });

  test('L2-006.1: card photos declare 400, 800 and 1200 px renditions and sizes that match the grid', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open();

    const img = listing.cardPhoto(listing.card('Pelau House'));
    await expect(img).toHaveAttribute('srcset', /400w.*800w.*1200w/);
    await expect(img).toHaveAttribute('sizes', '(min-width: 62rem) 17.5rem, (min-width: 36rem) 45vw, 90vw');
  });

  for (const [label, size, eager] of [
    ['XL', { width: 1280, height: 900 }, 6],
    ['MD', { width: 800, height: 900 }, 4],
    ['XS', { width: 360, height: 780 }, 2],
  ] as const) {
    test(`L2-006.3: at ${label} only the first ${eager} photos load eagerly, the rest lazily`, async ({ page }) => {
      const listing = new ListingPage(page);
      await page.setViewportSize(size);

      await listing.open();

      await expect(listing.cards).toHaveCount(24);
      const loading = await listing.photoLoadingAttributes();
      expect(loading.slice(0, eager).every((l) => l === null)).toBe(true);
      expect(loading.slice(eager).every((l) => l === 'lazy')).toBe(true);
    });
  }

  test('L2-085.3: no more than 6 images are requested before the load event', async ({ page }) => {
    const listing = new ListingPage(page);

    const before = await listing.imagesRequestedBeforeLoad(() => listing.open());

    expect(before).toBeLessThanOrEqual(6);
  });
});
