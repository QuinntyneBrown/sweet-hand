import { test, expect } from '../../support/test';
import { DashboardPage } from '../../pages/dashboard.page';

test.describe('Caterer dashboard overview', () => {
  test('L2-045.3 L2-045.4 L2-046: a published caterer sees status, numbers, latest enquiries and the listing card', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const dashboard = new DashboardPage(page);

    await dashboard.open();

    await expect(dashboard.heading).toHaveText('Pelau House');
    await expect(dashboard.status).toHaveText('Published');
    await expect(dashboard.link('View your page')).toHaveAttribute('href', '/caterers/pelau-house');
    await expect(dashboard.statLabels).toHaveText(['Unread enquiries', 'Open enquiries', 'Rating', 'Reviews']);
    await expect(dashboard.stat('Unread enquiries')).toHaveText('2');
    // Open and replied: Priya, Andre, Marcia and the former customer's replied enquiry.
    await expect(dashboard.stat('Open enquiries')).toHaveText('4');
    await expect(dashboard.stat('Rating')).toHaveText('4.7 out of 5');
    await expect(dashboard.stat('Reviews')).toHaveText('23');
    // The three most recent, in the inbox's order.
    await expect(dashboard.enquiryNames).toHaveText(['Marcia Thompson', 'Unread. Priya Ramdial', 'Unread. Andre Clarke']);
    await expect(dashboard.latestEnquiries.getByRole('link', { name: 'All enquiries' })).toHaveAttribute('href', '/dashboard/enquiries');

    await expect(dashboard.navLinks).toHaveText([
      'Overview',
      'Business details',
      'Cuisines and areas',
      'Guests and occasions',
      'Photos',
      'Menu',
      'Food safety',
      'Enquiries 2 unread',
      'Reviews',
      'Account',
    ]);
    await expect(dashboard.navLink('Overview')).toHaveAttribute('aria-current', 'page');
    await expect(dashboard.navLink('Enquiries 2 unread')).toHaveAttribute('href', '/dashboard/enquiries');

    await expect(dashboard.previewLabel).toHaveText('Your listing card');
    await expect(dashboard.previewName).toHaveText('Pelau House');
    await expect(dashboard.previewMeta).toHaveText('Trinidadian & Tobagonian · Scarborough');
    await expect(dashboard.previewPhoto).toHaveAttribute('alt', 'Chicken pelau in a steel pot with lime and cucumber chutney');
    await expect(dashboard.sections.first()).toBeHidden();
    await dashboard.expectNoAccessibilityViolations();
  });

  test('L2-045.2: on a phone the sections are a stacked list, without side navigation or preview', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const dashboard = new DashboardPage(page);
    await dashboard.usePhone();

    await dashboard.open();

    await expect(dashboard.sideNav).toBeHidden();
    await expect(dashboard.previewPane).toBeHidden();
    await expect(dashboard.sectionTitles).toHaveText([
      'Done: Business details',
      'Done: Cuisines and areas',
      'Done: Guests and occasions',
      'Done: Photos',
      'Done: Menu',
      'Done: Food safety',
      'Reviews',
    ]);
    await expect(dashboard.sectionMetas).toHaveText([
      'Name and description',
      '2 cuisines · 5 areas',
      '20–300 guests · 5 occasions',
      '6 photos',
      '18 dishes',
      'Certificate valid until 14 Mar 2029',
      '23 reviews · 1 without a response',
    ]);
    await dashboard.expectNoHorizontalScroll();
    await dashboard.expectNoAccessibilityViolations();

    await dashboard.section('Cuisines and areas').click();
    await expect(page).toHaveURL(/\/dashboard\/profile\/cuisines$/);
  });

  test('L2-045.4: from LG the side navigation shows, and the preview waits for XL', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const dashboard = new DashboardPage(page);
    await page.setViewportSize({ width: 1024, height: 800 });

    await dashboard.open();

    await expect(dashboard.sideNav).toBeVisible();
    await expect(dashboard.statGrid).toBeVisible();
    await expect(dashboard.previewPane).toBeHidden();
  });

  test('loading: skeletons hold the layout while the dashboard loads', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    await backend.hold('GET /api/caterer/profile');
    const dashboard = new DashboardPage(page);

    await dashboard.open();

    await expect(dashboard.heading).toHaveText('Loading your dashboard');
    await expect(dashboard.statGrid).toHaveAttribute('aria-busy', 'true');
    await expect(dashboard.skeletons.first()).toBeVisible();
    await dashboard.expectNoAccessibilityViolations();

    await backend.release();
    await expect(dashboard.heading).toHaveText('Pelau House');
  });

  test('error: the dashboard says it could not load, with a reference and Try again', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    await backend.fail('GET /api/caterer/profile', { status: 500, body: { title: 'Something went wrong', correlationId: '7f3a-21c9' }, times: 1 });
    const dashboard = new DashboardPage(page);

    await dashboard.open();

    await expect(dashboard.loadError).toHaveAttribute('role', 'alert');
    await expect(dashboard.loadError.locator('.empty__title')).toHaveText('We couldn’t load your dashboard');
    await expect(dashboard.loadErrorReference).toHaveText('Reference 7f3a-21c9');
    await expect(dashboard.link('View your page')).toHaveAttribute('href', '/caterers/pelau-house');
    await expect(dashboard.sideNav).toBeVisible();
    await dashboard.expectNoAccessibilityViolations();

    await dashboard.button('Try again').click();
    await expect(dashboard.stat('Reviews')).toHaveText('23');
  });
});
