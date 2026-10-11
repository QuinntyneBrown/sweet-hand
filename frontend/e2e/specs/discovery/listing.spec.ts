import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';

test.describe('Caterer listing', () => {
  test('L2-001.1 L2-002.1: a visitor sees the first 24 of the 60 published caterers', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.heading).toHaveText('Caterers');
    await expect(listing.resultCount).toHaveText('60 caterers');
    await expect(listing.cards).toHaveCount(24);
  });

  test('L2-001.1: caterers that are not published do not appear', async ({ page, backend }) => {
    await backend.scenario('set-caterer-status', { slug: 'island-pot', status: 'Suspended' });
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.resultCount).toHaveText('59 caterers');
    await expect(listing.card('Island Pot')).toHaveCount(0);
  });

  test('L2-004.1 L2-006.4: a card shows only the cover photo, name, primary cuisine and primary area', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open();

    const card = listing.card('Pelau House');
    await expect(listing.cardPhoto(card)).toHaveAttribute('alt', 'Chicken pelau in a steel pot with lime and cucumber chutney');
    await expect(listing.cardName(card)).toHaveText('Pelau House');
    await expect(listing.cardMeta(card)).toHaveText('Trinidadian & Tobagonian · Scarborough');
    await expect(card).toHaveText('Pelau HouseTrinidadian & Tobagonian · Scarborough');
  });

});
