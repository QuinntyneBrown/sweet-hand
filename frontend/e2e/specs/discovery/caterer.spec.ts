import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';
import { ListingPage } from '../../pages/listing.page';
import { WEB_URL } from '../../support/ports';

test.describe('Caterer page', () => {
  test('L2-004.3: activating a card opens that caterer page', async ({ page }) => {
    const listing = new ListingPage(page);
    const caterer = new CatererPage(page);
    await listing.open();

    await listing.openCaterer('Island Pot');

    await expect(page).toHaveURL(/\/caterers\/island-pot$/);
    await expect(caterer.heading).toHaveText('Island Pot');
  });

  test('L2-013.1 L2-015: a visitor sees the name, cuisines with the primary first, and the description in paragraphs', async ({ page }) => {
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(caterer.heading).toHaveText('Pelau House');
    await expect(caterer.cuisines).toHaveText(['Trinidadian & Tobagonian', 'Guyanese']);
    await expect(caterer.description).toHaveCount(2);
    await expect(caterer.description.first()).toHaveText(/^Kendra Baptiste learned to burn sugar for pelau in her grandmother’s kitchen in Couva\./);
    await expect(caterer.description.last()).toHaveText(/^Everything is cooked the morning of your event and arrives hot/);
    await expect(caterer.backLink).toHaveText('Caterers');
    await expect(caterer.backLink).toHaveAttribute('href', '/caterers');
    await expect(page).toHaveURL(/\/caterers\/pelau-house$/);
    await caterer.expectNoAccessibilityViolations();
  });

  test('L2-018.4: the page has a title, description, canonical link and Open Graph tags', async ({ page }) => {
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(page).toHaveTitle('Pelau House · Sweet Hand');
    await expect(caterer.metaContent('description')).toHaveAttribute('content', /^Kendra Baptiste learned to burn sugar for pelau/);
    await expect(caterer.canonical).toHaveAttribute('href', `${WEB_URL}/caterers/pelau-house`);
    await expect(caterer.metaContent('og:title')).toHaveAttribute('content', 'Pelau House');
    await expect(caterer.metaContent('og:description')).toHaveAttribute('content', /^Kendra Baptiste learned to burn sugar for pelau/);
    await expect(caterer.metaContent('og:image')).toHaveAttribute('content', `${WEB_URL}/media/pelau-house.jpg?w=1200&fm=jpeg`);
    await expect(caterer.metaContent('og:url')).toHaveAttribute('content', `${WEB_URL}/caterers/pelau-house`);
  });

  test('L2-019.3 L2-020.1 L2-021.1: on a desktop the side panel holds the guest range, the occasions and the enquiry button', async ({ page }) => {
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(caterer.fact(caterer.panel, 'Guests')).toHaveText('Serves 20–300 guests');
    await expect(caterer.occasions(caterer.panel)).toHaveText(['Weddings', 'Birthdays', 'Family gatherings', 'Corporate events', 'Religious and cultural celebrations']);
    await expect(caterer.enquireButtonIn(caterer.panel)).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(caterer.panel).toContainText('Free to ask. Your email and phone stay private until you choose to share them.');
    await expect(caterer.enquireButtons).toHaveCount(1);
    await expect(caterer.stickyBar).toBeHidden();
    await expect(caterer.mainFacts).toBeHidden();
  });

  test('L2-015.4 L2-019.1: on a phone the summary is in the column and a bar keeps "Send an enquiry" in view', async ({ page }) => {
    const caterer = new CatererPage(page);
    await caterer.usePhone();

    await caterer.open('pelau-house');

    await expect(caterer.fact(caterer.mainFacts, 'Guests')).toHaveText('Serves 20–300 guests');
    await expect(caterer.occasions(caterer.mainFacts)).toHaveCount(5);
    await expect(caterer.panel).toBeHidden();
    await expect(caterer.stickyBar).toHaveAttribute('role', 'region');
    await expect(caterer.stickyBar).toHaveAccessibleName('Enquire');
    await expect(caterer.stickyBar).toHaveText(/^Pelau House\s*Serves 20–300 guests\s*Send an enquiry$/);
    await expect(caterer.stickyBar).toBeInViewport();
    await caterer.footer.root.scrollIntoViewIfNeeded();
    await expect(caterer.enquireButtonIn(caterer.stickyBar)).toBeInViewport();
    await caterer.expectNoHorizontalScroll();
    await caterer.expectNoAccessibilityViolations();
  });

  test('L2-013.3: a visitor who asks to send an enquiry is taken to sign in and brought back to the caterer', async ({ page }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');

    await caterer.enquireButtonIn(caterer.panel).click();

    await expect(page).toHaveURL(/\/sign-in\?returnUrl=%2Fcaterers%2Fpelau-house$/);
  });

  test('L2-017.1 L2-017.3: each dish shows its name, description, dietary tags in the fixed order and price guidance', async ({ page }) => {
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(caterer.menuCount).toHaveText('18 dishes');
    const curryGoat = caterer.dish('Curry goat');
    await expect(caterer.dishPart(curryGoat, 'name')).toHaveText('Curry goat');
    await expect(caterer.dishPart(curryGoat, 'name')).toHaveRole('heading');
    await expect(caterer.dishPart(curryGoat, 'desc')).toHaveText('Slow-cooked with scotch bonnet.');
    await expect(caterer.dishTags(curryGoat)).toHaveText(['Gluten-free', 'Halal', 'Spicy']);
    await expect(caterer.dishPart(curryGoat, 'price')).toHaveText('From $18 per person');
    const blackCake = caterer.dish('Black cake');
    await expect(caterer.dishAllergens(blackCake)).toHaveText(['Contains nuts']);
  });

  test('L2-017.2: a dish without a description, tags or price shows none of them and no empty labels', async ({ page }) => {
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    const alooPie = caterer.dish('Aloo pie');
    await expect(caterer.dishPart(alooPie, 'desc')).toHaveCount(0);
    await expect(caterer.dishPart(alooPie, 'price')).toHaveCount(0);
    await expect(alooPie).toHaveText('Aloo pieVegan');
  });

  test('L2-017.4: the first 12 of 18 dishes show and "Show all 18 dishes" expands the rest in place', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await expect(caterer.dishes).toHaveCount(12);
    await expect(caterer.dishNames.last()).toHaveText('Black cake');
    await expect(caterer.menuToggle).toHaveText('Show all 18 dishes');
    await expect(caterer.menuToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(caterer.menuToggle).toHaveAttribute('aria-controls', 'dish-list');
    const requestsBefore = (await backend.requests()).length;

    await caterer.menuToggle.click();

    await expect(caterer.dishes).toHaveCount(18);
    await expect(caterer.dishNames.last()).toHaveText('Paw paw chow');
    await expect(caterer.menuToggle).toHaveText('Show fewer dishes');
    await expect(caterer.menuToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(caterer.menuToggle).toBeFocused();
    await expect(caterer.menuStatus).toHaveText('18 dishes shown');
    expect((await backend.requests()).length).toBe(requestsBefore);
    await caterer.expectNoAccessibilityViolations();

    await caterer.menuToggle.click();
    await expect(caterer.dishes).toHaveCount(12);
    await expect(caterer.menuToggle).toHaveText('Show all 18 dishes');
  });

  test('L2-015.3: the areas served are grouped under their region names', async ({ page }) => {
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(caterer.regionNames).toHaveText(['City of Toronto', 'Durham']);
    await expect(caterer.areasIn('City of Toronto')).toHaveText('Scarborough, East York, North York');
    await expect(caterer.areasIn('Durham')).toHaveText('Pickering, Ajax');
  });
});
