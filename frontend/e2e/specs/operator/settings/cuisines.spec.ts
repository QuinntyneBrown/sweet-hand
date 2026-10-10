import { test, expect } from '../../../support/test';
import { OperatorCuisinesPage } from '../../../pages/operator-cuisines.page';

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
