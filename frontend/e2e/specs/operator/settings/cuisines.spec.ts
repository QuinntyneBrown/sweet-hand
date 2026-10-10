import { test, expect } from '../../../support/test';
import { OperatorCuisinesPage } from '../../../pages/operator-cuisines.page';
import { ListingPage } from '../../../pages/listing.page';
import { CatererPage } from '../../../pages/caterer.page';

const LAUNCH_LIST = [
  'Antiguan & Barbudan',
  'Bahamian',
  'Barbadian (Bajan)',
  'Belizean',
  'Cuban',
  'Dominican (Dominica)',
  'Dominican (Dominican Republic)',
  'Grenadian',
  'Guyanese',
  'Haitian',
  'Jamaican',
  'Kittitian & Nevisian',
  'Pan-Caribbean',
  'Puerto Rican',
  'St. Lucian',
  'Surinamese',
  'Trinidadian & Tobagonian',
  'Vincentian',
];

test.describe('Cuisine list (operator)', () => {
  test('L2-007.1: an operator sees the 18 launch cuisines A to Z with the published caterers using each', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const cuisines = new OperatorCuisinesPage(page);

    await cuisines.open();

    await expect(cuisines.heading).toHaveText('Cuisines');
    await expect(cuisines.subtitle).toHaveText('18 cuisines · shown in filters and caterer profiles');
    await expect(cuisines.names).toHaveText(LAUNCH_LIST);
    await expect(cuisines.metaOf('Antiguan & Barbudan')).toHaveText('2 published caterers');
    await expect(cuisines.metaOf('Belizean')).toHaveText('1 published caterer');
    await expect(cuisines.metaOf('Bahamian')).toHaveText('No published caterers');
    await expect(cuisines.retireButton('Pan-Caribbean')).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(cuisines.addButton).toBeVisible();
    await expect(cuisines.note).toHaveText('Retired cuisines leave the filter and new profile choices. Caterers who already use one keep it on their page.');
    await expect(cuisines.currentSideNavLink).toHaveText('Cuisines');
    await cuisines.expectNoAccessibilityViolations();
  });

  test('L2-064.2: the list works at phone width without sideways scrolling', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const cuisines = new OperatorCuisinesPage(page);
    await cuisines.usePhone();

    await cuisines.open();

    await expect(cuisines.rows).toHaveCount(18);
    await cuisines.expectNoHorizontalScroll();
    await cuisines.expectNoAccessibilityViolations();
  });

  test('while the list loads, skeleton rows stand in and the status says so', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('GET /api/operator/cuisines');
    const cuisines = new OperatorCuisinesPage(page);

    await cuisines.open();

    await expect(cuisines.skeletonRows).toHaveCount(10);
    await expect(cuisines.busyIntro).toBeVisible();
    await expect(cuisines.loadingStatus).toHaveText('Loading cuisines');
    await cuisines.expectNoAccessibilityViolations();
    await backend.release();
    await expect(cuisines.rows).toHaveCount(18);
  });

  test('when the list fails to load, the page says nothing changed and offers a retry and a way back', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('GET /api/operator/cuisines', { status: 500, times: 1 });
    const cuisines = new OperatorCuisinesPage(page);

    await cuisines.open();

    await expect(cuisines.errorState).toHaveAttribute('role', 'alert');
    await expect(cuisines.emptyTitle).toHaveText('We couldn’t load the cuisine list');
    await expect(cuisines.emptyText).toHaveText('Nothing has changed: filters and caterer profiles still show the current list. Try again in a moment.');
    await expect(cuisines.subtitle).toHaveText('Shown in filters and caterer profiles');
    await expect(cuisines.link('Back to review queue')).toHaveAttribute('href', '/admin/queue');
    await cuisines.expectNoAccessibilityViolations();

    await cuisines.button('Try again').click();

    await expect(cuisines.rows).toHaveCount(18);
  });
});

test.describe('Add a cuisine', () => {
  test('add-cuisine dialog: one name field with focus in it, the rules and what happens next', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const cuisines = new OperatorCuisinesPage(page);
    await cuisines.open();

    await cuisines.addButton.click();

    const dialog = cuisines.addDialog;
    await expect(dialog.description).toHaveText('Add an island or country of origin to the cuisine list.');
    await expect(dialog.field('Cuisine name')).toBeFocused();
    await expect(dialog.field('Cuisine name')).toHaveAttribute('maxlength', '40');
    await expect(dialog.body).toContainText('Name it the way the community does, like “Kittitian & Nevisian”. 2–40 characters.');
    await expect(dialog.body).toContainText('Caterers can choose it straight away, and the listing filter offers it.');
    await cuisines.expectNoAccessibilityViolations();

    await dialog.cancel.click();

    await expect(dialog.root).toBeHidden();
    await expect(cuisines.addButton).toBeFocused();
  });

  test('L2-007.4: an operator adds “Caymanian”; it joins the list as new and the listing filter offers it', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const cuisines = new OperatorCuisinesPage(page);
    await cuisines.open();
    await cuisines.addButton.click();

    await cuisines.addDialog.field('Cuisine name').fill('Caymanian');
    await cuisines.addDialog.button('Add cuisine').click();

    await expect(cuisines.addDialog.root).toBeHidden();
    await expect(cuisines.subtitle).toHaveText('19 cuisines · shown in filters and caterer profiles');
    await expect(cuisines.names.nth(4)).toHaveText('Caymanian New');
    await expect(cuisines.badgeOf('Caymanian')).toHaveText('New');
    await expect(cuisines.metaOf('Caymanian')).toHaveText('Added today by Leah Mohammed · no caterers yet');
    await expect(cuisines.toast).toContainText('Caymanian added');
    await cuisines.expectNoAccessibilityViolations();
    const { audit } = await backend.state();
    expect(audit.at(-1)).toMatchObject({ operatorId: 'user-leah', action: 'AddCuisine', targetType: 'cuisine', targetId: 'caymanian', before: null, after: 'Caymanian' });

    const listing = new ListingPage(page);
    await listing.open();
    await expect(listing.moreCuisines).toHaveText('More cuisines (13)');
    await listing.moreCuisines.click();
    await expect(listing.cuisineOption('Caymanian')).toBeVisible();
  });

  test('L2-068.3: an empty or one-letter name is refused in the dialog; a duplicate is refused whatever its case or accents', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const cuisines = new OperatorCuisinesPage(page);
    await cuisines.open();
    await cuisines.addButton.click();
    const dialog = cuisines.addDialog;

    await dialog.button('Add cuisine').click();
    await expect(dialog.errorFor('cuisine-name')).toHaveText('Enter a cuisine name');
    await dialog.field('Cuisine name').fill('C');
    await dialog.button('Add cuisine').click();
    await expect(dialog.errorFor('cuisine-name')).toHaveText('Use 2 to 40 characters');
    expect((await backend.requests()).filter((r) => r.method === 'POST' && r.path === '/api/operator/cuisines')).toHaveLength(0);

    await dialog.field('Cuisine name').fill('jamaican');
    await dialog.button('Add cuisine').click();

    await expect(dialog.errorSummary).toBeFocused();
    await expect(dialog.errorSummary.getByRole('heading')).toHaveText('Fix 1 thing to add the cuisine');
    await expect(dialog.summaryLinks).toHaveText(['Jamaican is already on the list']);
    await expect(dialog.field('Cuisine name')).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.errorFor('cuisine-name')).toHaveText('Jamaican is already on the list');
    await cuisines.expectNoAccessibilityViolations();

    await dialog.field('Cuisine name').fill('HAÏTIAN');
    await dialog.button('Add cuisine').click();
    await expect(dialog.errorFor('cuisine-name')).toHaveText('Haitian is already on the list');
  });

  test('while the cuisine is added, the dialog is busy and cannot be closed', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('POST /api/operator/cuisines');
    const cuisines = new OperatorCuisinesPage(page);
    await cuisines.open();
    await cuisines.addButton.click();
    const dialog = cuisines.addDialog;

    await dialog.field('Cuisine name').fill('Caymanian');
    await dialog.button('Add cuisine').click();

    await expect(dialog.button('Add cuisine')).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.field('Cuisine name')).toHaveAttribute('readonly', '');
    await expect(dialog.close).toBeDisabled();
    await expect(dialog.cancel).toBeDisabled();
    await expect(dialog.status).toHaveText('Adding the cuisine');
    await page.keyboard.press('Escape');
    await expect(dialog.root).toBeVisible();
    await backend.release();
    await expect(dialog.root).toBeHidden();
  });

  test('when adding fails, nothing is saved and the typed name is kept for a retry', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('POST /api/operator/cuisines', { status: 500, times: 1 });
    const cuisines = new OperatorCuisinesPage(page);
    await cuisines.usePhone();
    await cuisines.open();
    await cuisines.addButton.click();
    const dialog = cuisines.addDialog;

    await dialog.field('Cuisine name').fill('Caymanian');
    await dialog.button('Add cuisine').click();

    await expect(dialog.failure).toHaveAttribute('role', 'alert');
    await expect(dialog.failure).toContainText('We couldn’t add Caymanian');
    await expect(dialog.failure).toContainText('Nothing was saved. Check your connection and try again.');
    await expect(dialog.field('Cuisine name')).toHaveValue('Caymanian');
    await cuisines.expectNoAccessibilityViolations();

    await dialog.button('Add cuisine').click();

    await expect(dialog.root).toBeHidden();
    await expect(cuisines.row('Caymanian')).toHaveCount(1);
  });
});

test.describe('Retire a cuisine', () => {
  test('retire-cuisine dialog: warns which published caterers use it, with Cancel focused rather than the danger button', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const cuisines = new OperatorCuisinesPage(page);
    await cuisines.open();

    await cuisines.retireButton('Pan-Caribbean').click();

    const dialog = cuisines.retireDialog('Pan-Caribbean');
    await expect(dialog.description).toHaveText('It leaves the listing filter and the choices on new and edited profiles.');
    await expect(dialog.warning).toContainText('2 published caterers use Pan-Caribbean');
    await expect(dialog.warning).toContainText('They keep it on their pages. It just won’t be offered to anyone new.');
    await expect(dialog.people('Caterers using Pan-Caribbean')).toHaveText(['Mauby & Co.', 'Sea Moss & Spice']);
    await expect(dialog.cancel).toBeFocused();
    await cuisines.expectNoAccessibilityViolations();

    await page.keyboard.press('Escape');

    await expect(dialog.root).toBeHidden();
    await expect(cuisines.retireButton('Pan-Caribbean')).toBeFocused();
  });

  test('L2-007.5: retiring a cuisine 2 caterers use names them; it leaves the filter but stays on their pages', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const cuisines = new OperatorCuisinesPage(page);
    await cuisines.open();
    await cuisines.retireButton('Pan-Caribbean').click();

    await cuisines.retireDialog('Pan-Caribbean').button('Retire cuisine').click();

    await expect(cuisines.retireDialog('Pan-Caribbean').root).toBeHidden();
    await expect(cuisines.toast).toContainText('Pan-Caribbean is retired');
    await expect(cuisines.toast).toContainText('Mauby & Co. and Sea Moss & Spice keep it on their pages.');
    await expect(cuisines.subtitle).toHaveText('17 cuisines · shown in filters and caterer profiles');
    await expect(cuisines.metaOf('Pan-Caribbean')).toHaveText('Retired today · 2 published caterers keep it');
    await expect(cuisines.retireButton('Pan-Caribbean')).toHaveCount(0);
    await cuisines.expectNoAccessibilityViolations();
    const { audit } = await backend.state();
    expect(audit.at(-1)).toMatchObject({ operatorId: 'user-leah', action: 'RetireCuisine', targetType: 'cuisine', targetId: 'pan-caribbean', before: 'Active', after: 'Retired' });

    const listing = new ListingPage(page);
    await listing.open();
    await expect(listing.moreCuisines).toHaveText('More cuisines (11)');
    await listing.moreCuisines.click();
    await expect(listing.cuisineOption('Pan-Caribbean')).toHaveCount(0);

    const mauby = new CatererPage(page);
    await mauby.open('mauby-and-co');
    await expect(mauby.cuisines).toContainText(['Pan-Caribbean']);
  });

  test('a cuisine nobody uses retires without a warning', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const cuisines = new OperatorCuisinesPage(page);
    await cuisines.open();
    await cuisines.retireButton('Bahamian').click();
    const dialog = cuisines.retireDialog('Bahamian');

    await expect(dialog.body).toContainText('No published caterers use Bahamian.');
    await expect(dialog.warning).toHaveCount(0);
    await dialog.button('Retire cuisine').click();

    await expect(dialog.root).toBeHidden();
    await expect(cuisines.metaOf('Bahamian')).toHaveText('Retired today');
  });

  test('while retiring, the dialog is busy and cannot be closed', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('POST /api/operator/cuisines/pan-caribbean/retire');
    const cuisines = new OperatorCuisinesPage(page);
    await cuisines.open();
    await cuisines.retireButton('Pan-Caribbean').click();
    const dialog = cuisines.retireDialog('Pan-Caribbean');

    await dialog.button('Retire cuisine').click();

    await expect(dialog.button('Retire cuisine')).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.close).toBeDisabled();
    await expect(dialog.cancel).toBeDisabled();
    await expect(dialog.status).toHaveText('Retiring Pan-Caribbean');
    await backend.release();
    await expect(dialog.root).toBeHidden();
  });

  test('when retiring fails, the cuisine stays active and the operator can try again', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('POST /api/operator/cuisines/pan-caribbean/retire', { status: 500, times: 1 });
    const cuisines = new OperatorCuisinesPage(page);
    await cuisines.usePhone();
    await cuisines.open();
    await cuisines.retireButton('Pan-Caribbean').click();
    const dialog = cuisines.retireDialog('Pan-Caribbean');

    await dialog.button('Retire cuisine').click();

    await expect(dialog.failure).toHaveAttribute('role', 'alert');
    await expect(dialog.failure).toContainText('We couldn’t retire Pan-Caribbean');
    await expect(dialog.failure).toContainText('It’s still active everywhere. Try again in a moment.');
    await expect(dialog.warning).toContainText('2 published caterers use Pan-Caribbean');
    await cuisines.expectNoAccessibilityViolations();
    await cuisines.expectNoHorizontalScroll();

    await dialog.button('Retire cuisine').click();

    await expect(dialog.root).toBeHidden();
    await expect(cuisines.metaOf('Pan-Caribbean')).toHaveText('Retired today · 2 published caterers keep it');
  });
});
