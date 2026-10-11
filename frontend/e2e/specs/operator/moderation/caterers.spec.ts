import { test, expect } from '../../../support/test';
import { OperatorCaterersPage } from '../../../pages/operator-caterers.page';

test.describe('Operator caterer list', () => {
  test('L2-046 queue-item AC-7: every caterer in every status, most recently changed first', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const caterers = new OperatorCaterersPage(page);

    await caterers.goto();

    await expect(caterers.heading).toHaveText('Caterers');
    await expect(caterers.subtitle).toHaveText('69 caterers · 60 published · sorted by last change');
    await expect(caterers.filters.getByRole('link')).toHaveText([
      'All 69',
      'Draft 3',
      'Pending review 2',
      'Changes requested 1',
      'Published 60',
      'Suspended 1',
      'Removed 2',
    ]);
    await expect(caterers.titles.first()).toHaveText('Pelau House');
    await expect(caterers.titles).toHaveCount(20);
    await expect(caterers.titles.nth(1)).toHaveText('Island Pot');
    await expect(caterers.titles.nth(2)).toHaveText('Breadfruit & Butter');
    await expect(caterers.status('Pelau House')).toHaveText('Published');
    await expect(caterers.meta('Pelau House')).toHaveText('Trinidadian & Tobagonian · Scarborough · Kendra Baptiste · updated today · Name change waiting');
    await expect(caterers.flag('Island Pot')).toHaveText('1 open report');
    await expect(caterers.flag('Breadfruit & Butter')).toHaveText('Resubmitted');
    await expect(caterers.flag('Flying Fish Kitchen')).toHaveText('Certificate expired');
    await expect(caterers.status('Tamarind Tree')).toHaveText('Changes requested');
    await expect(caterers.status('Hibiscus Hut')).toHaveText('Suspended');
    await expect(caterers.placeholder('Hibiscus Hut')).toHaveCount(1);
    await expect(caterers.meta('Hibiscus Hut')).toHaveText('Jamaican · Brampton · Sharon Bailey · updated Tue 6 Oct');
    await expect(caterers.row('Breadfruit & Butter')).toHaveAttribute('href', '/admin/review/cat-911');
    await expect(caterers.row('Pelau House')).toHaveAttribute('href', '/admin/caterers/cat-001');
    await expect(caterers.resultCount).toHaveText('Showing 1–20 of 69');
    await caterers.expectNoAccessibilityViolations();
  });

  test('L2-046: filtering by status keeps the filter in the address', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const caterers = new OperatorCaterersPage(page);
    await caterers.goto();

    await caterers.filter(/^Removed/).click();

    await expect(page).toHaveURL(/\/admin\/caterers\?status=removed$/);
    await expect(caterers.currentFilter).toHaveText('Removed 2');
    await expect(caterers.subtitle).toHaveText('2 of 69 caterers match');
    await expect(caterers.titles).toHaveText(['Rum Shop Catering', 'Coal Pot Kitchen']);
  });

  test('search finds a caterer by its owner’s name', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const caterers = new OperatorCaterersPage(page);
    await caterers.goto();

    await caterers.searchFor('kendra');

    await expect(page).toHaveURL(/\/admin\/caterers\?q=kendra$/);
    await expect(caterers.titles).toHaveText(['Pelau House']);
    await expect(caterers.chips).toHaveText(['“kendra”']);
    await expect(caterers.searchBox).toHaveValue('kendra');
  });

  test('no results: the filters stay visible and clearable, and say where the caterer is', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const caterers = new OperatorCaterersPage(page);

    await caterers.goto('?status=suspended&q=Pelau');

    await expect(caterers.subtitle).toHaveText('0 of 69 caterers match');
    await expect(caterers.chips).toHaveText(['“Pelau”', 'Suspended']);
    await expect(caterers.emptyHeading).toHaveText('No suspended caterers match “Pelau”');
    await expect(caterers.emptyText).toHaveText('Pelau House is published. Try all statuses.');
    await expect(caterers.currentFilter).toHaveText('Suspended 1');
    await caterers.expectNoAccessibilityViolations();

    await caterers.removeChip('Remove search “Pelau”').click();
    await expect(page).toHaveURL(/\/admin\/caterers\?status=suspended$/);
    await expect(caterers.titles).toHaveText(['Hibiscus Hut']);

    await caterers.goto('?status=suspended&q=Pelau');
    await caterers.emptyAction('Clear filters').click();
    await expect(page).toHaveURL(/\/admin\/caterers$/);
    await expect(caterers.rows).toHaveCount(20);
  });

  test('empty: before any caterer registers, the list says so', async ({ page, backend }) => {
    await backend.scenario('no-caterers');
    await backend.signInAs('leah');
    const caterers = new OperatorCaterersPage(page);

    await caterers.goto();

    await expect(caterers.subtitle).toHaveText('No caterers yet');
    await expect(caterers.searchBox).toBeDisabled();
    await expect(caterers.emptyHeading).toHaveText('No caterers have registered');
    await expect(caterers.emptyText).toHaveText('Caterers appear here the moment they sign up, as a draft. Submitted profiles also land in the review queue.');
    await expect(caterers.emptyAction('See the caterer sign-up page')).toHaveAttribute('href', '/join');
    await caterers.expectNoAccessibilityViolations();
  });

  test('error: the list fails to load; nothing changed and Try again loads it', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('GET /api/operator/caterers', { status: 500, times: 1 });
    const caterers = new OperatorCaterersPage(page);

    await caterers.goto();

    await expect(caterers.emptyHeading).toHaveText('We couldn’t load caterers');
    await expect(caterers.emptyText).toHaveText('The list didn’t come back from the server. Nothing has changed. Try again, or work from the review queue meanwhile.');
    await expect(caterers.emptyAction('Go to the review queue')).toHaveAttribute('href', '/admin/queue');
    await expect(caterers.searchBox).toBeDisabled();
    await caterers.expectNoAccessibilityViolations();
    await caterers.emptyAction('Try again').click();
    await expect(caterers.rows).toHaveCount(20);
  });

  test('loading: skeleton rows while the list loads', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('GET /api/operator/caterers');
    const caterers = new OperatorCaterersPage(page);

    await caterers.goto();

    await expect(caterers.skeletonRows).toHaveCount(8);
    await expect(caterers.list).toHaveAttribute('aria-busy', 'true');
    await expect(caterers.loadingStatus).toBeAttached();
    await expect(caterers.searchBox).toBeDisabled();
    await caterers.expectNoAccessibilityViolations();
    await backend.release();
    await expect(caterers.rows).toHaveCount(20);
  });

  test('long: four-digit counts and many pages', async ({ page, backend }) => {
    await backend.scenario('large-catalog');
    await backend.signInAs('leah');
    const caterers = new OperatorCaterersPage(page);

    await caterers.goto('?status=published&page=12');

    await expect(caterers.subtitle).toHaveText('1,284 of 1,293 caterers match');
    await expect(caterers.currentFilter).toHaveText('Published 1,284');
    await expect(caterers.resultCount).toHaveText('Showing 221–240 of 1,284');
    await expect(caterers.rows).toHaveCount(20);
    await caterers.pageLink(13).click();
    await expect(page).toHaveURL(/\/admin\/caterers\?status=published&page=13$/);
  });

  test('L2-064 queue-item AC-17: on a phone the status sits under the meta and nothing scrolls sideways', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const caterers = new OperatorCaterersPage(page);
    await caterers.usePhone();

    await caterers.goto();

    await expect(caterers.rows).toHaveCount(20);
    await caterers.expectNoHorizontalScroll();
    await caterers.expectNoAccessibilityViolations();
  });
});
