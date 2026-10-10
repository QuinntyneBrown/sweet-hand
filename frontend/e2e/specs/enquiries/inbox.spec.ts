import { test, expect } from '../../support/test';
import { InboxPage } from '../../pages/inbox.page';

test.describe('Customer inbox', () => {
  test.beforeEach(async ({ backend }) => {
    await backend.signInAs('marcia');
  });

  test('L2-031 inbox-row AC-1 AC-4 AC-6: Marcia sees every enquiry, newest activity first, with the unread one highlighted', async ({ page }) => {
    const inbox = new InboxPage(page);

    await inbox.open();

    await expect(inbox.heading).toHaveText('Inbox');
    await expect(inbox.subtitle).toHaveText('4 enquiries · 1 unread');
    await expect(inbox.enquiries.filterItems).toHaveText(['All 4', 'Open 1', 'Replied 1', 'Declined 1', 'Closed 1']);
    await expect(inbox.enquiries.currentFilter).toHaveText('All 4');
    await expect(inbox.enquiries.names()).toHaveText(['Unread. Pelau House', 'Sugar Dumplin', 'Demerara Kitchen', 'Ti Kay']);

    const pelau = inbox.enquiries.row('Pelau House');
    await expect(pelau).toHaveAttribute('href', /^\/inbox\/[0-9a-f-]{36}$/);
    await expect(inbox.enquiries.timeOf(pelau)).toHaveText('9:42 a.m.');
    await expect(inbox.enquiries.summaryOf(pelau)).toHaveText('Sat 21 Nov · 120 guests');
    await expect(inbox.enquiries.statusOf(pelau)).toHaveText('Replied');
    await expect(inbox.enquiries.statusOf(pelau)).toHaveClass(/status--replied/);
    await expect(inbox.enquiries.pictureOf(pelau)).toHaveAttribute('alt', '');
    await expect(inbox.enquiries.dotOf(pelau)).toHaveAttribute('aria-hidden', 'true');
    await expect(pelau).toHaveAccessibleName(/^Unread\. Pelau House.*9:42 a\.m\..*Sat 21 Nov · 120 guests.*Replied$/);
    await expect(inbox.enquiries.unreadRows).toHaveCount(1);

    await expect(inbox.enquiries.timeOf(inbox.enquiries.row('Sugar Dumplin'))).toHaveText('Thu');
    await expect(inbox.enquiries.timeOf(inbox.enquiries.row('Demerara Kitchen'))).toHaveText('Tue');
    const tiKay = inbox.enquiries.row('Ti Kay');
    await expect(inbox.enquiries.timeOf(tiKay)).toHaveText('Sat 5 Sep');
    await expect(inbox.enquiries.summaryOf(tiKay)).toHaveText('Sun 23 Aug · 45 guests');
    await expect(inbox.enquiries.statusOf(tiKay)).toHaveText('Closed');
    await inbox.expectNoAccessibilityViolations();
  });

  test('L2-036.1 message AC-23: on a large screen the thread column invites Marcia to choose an enquiry', async ({ page }) => {
    const inbox = new InboxPage(page);

    await inbox.open();

    await expect(inbox.placeholder).toBeVisible();
    await expect(inbox.placeholder).toHaveText('Choose an enquiry to read it here.');
    await expect(inbox.placeholderPhotos).toHaveCount(3);
    await expect(inbox.placeholderPhotos.nth(1)).toHaveAttribute('width', '104');
  });

  test('L2-036.2: on a phone only the list shows', async ({ page }) => {
    const inbox = new InboxPage(page);
    await inbox.usePhone();

    await inbox.open();

    await expect(inbox.enquiries.rows).toHaveCount(4);
    await expect(inbox.placeholder).toBeHidden();
    await inbox.expectNoHorizontalScroll();
    await inbox.expectNoAccessibilityViolations();
  });

  test('L2-031.2 L2-067.5: filtering by status keeps the filter in the address and announces the count', async ({ page }) => {
    const inbox = new InboxPage(page);
    await inbox.open();

    await inbox.enquiries.filterItem('Open').click();

    await expect(page).toHaveURL(/\/inbox\?status=open$/);
    await expect(inbox.subtitle).toHaveText('1 open enquiry');
    await expect(inbox.subtitle).toHaveAttribute('role', 'status');
    await expect(inbox.enquiries.currentFilter).toHaveText('Open 1');
    await expect(inbox.enquiries.names()).toHaveText(['Sugar Dumplin']);
    await inbox.expectNoAccessibilityViolations();

    await page.goBack();
    await expect(inbox.enquiries.rows).toHaveCount(4);
    await expect(inbox.enquiries.currentFilter).toHaveText('All 4');
  });

  test('a filter with nothing in it says so and offers every enquiry', async ({ page, backend }) => {
    await backend.scenario('set-status', { customer: 'marcia.t@example.com', caterer: 'sugar-dumplin', status: 'Closed' });
    const inbox = new InboxPage(page);

    await inbox.open('?status=open');

    await expect(inbox.subtitle).toHaveText('0 open enquiries');
    await expect(inbox.enquiries.filterItems).toHaveText(['All 4', 'Open 0', 'Replied 1', 'Declined 1', 'Closed 2']);
    await expect(inbox.enquiries.emptyTitle).toHaveText('No open enquiries');
    await expect(inbox.enquiries.emptyText).toHaveText('Enquiries waiting for a caterer’s first reply show here.');
    await expect(inbox.enquiries.rows).toHaveCount(0);
    await inbox.expectNoAccessibilityViolations();

    await inbox.enquiries.emptyAction('Show all enquiries').click();
    await expect(page).toHaveURL(/\/inbox$/);
    await expect(inbox.enquiries.rows).toHaveCount(4);
  });

  test('empty-state: a customer with no enquiries is invited to browse caterers', async ({ page, backend }) => {
    await backend.scenario('no-enquiries', { email: 'marcia.t@example.com' });
    const inbox = new InboxPage(page);

    await inbox.open();

    await expect(inbox.subtitle).toHaveText('Your conversations with caterers');
    await expect(inbox.enquiries.emptyTitle).toHaveText('No enquiries yet');
    await expect(inbox.enquiries.emptyText).toHaveText('When you send an enquiry to a caterer, the conversation lives here.');
    await expect(inbox.enquiries.emptyAction('Browse caterers')).toHaveAttribute('href', '/caterers');
    await expect(inbox.enquiries.filter).toHaveCount(0);
    await expect(inbox.placeholder).toHaveCount(0);
    await inbox.expectNoAccessibilityViolations();
  });

  test('when the inbox fails to load the customer is told their messages are safe and can try again', async ({ page, backend }) => {
    await backend.fail('GET /api/enquiries', { status: 500, times: 1, body: { title: 'Something went wrong', correlationId: '7f3c-91ad' } });
    const inbox = new InboxPage(page);

    await inbox.open();

    await expect(inbox.enquiries.emptyState).toHaveAttribute('role', 'alert');
    await expect(inbox.enquiries.emptyTitle).toHaveText('We couldn’t load your enquiries');
    await expect(inbox.enquiries.emptyText).toHaveText('Your messages are safe. Check your connection and try again.');
    await expect(inbox.enquiries.emptyReference).toHaveText('7f3c-91ad');
    await expect(inbox.enquiries.emptyAction('Browse caterers')).toHaveAttribute('href', '/caterers');
    await inbox.expectNoAccessibilityViolations();

    await inbox.enquiries.emptyAction('Try again').click();
    await expect(inbox.enquiries.rows).toHaveCount(4);
  });

  test('inbox-row AC-8: while the inbox loads, skeleton rows stand in and the wait is announced', async ({ page, backend }) => {
    await backend.hold('GET /api/enquiries');
    const inbox = new InboxPage(page);

    await inbox.open();

    await expect(inbox.enquiries.list).toHaveAttribute('aria-busy', 'true');
    await expect(inbox.enquiries.list).toHaveAttribute('aria-label', 'Loading your enquiries');
    await expect(inbox.enquiries.skeletonRows).toHaveCount(4);
    await expect(inbox.loadingStatus).toHaveText('Loading your enquiries');
    await expect(inbox.enquiries.filterItems).toHaveText(['All', 'Open', 'Replied', 'Declined', 'Closed']);
    await inbox.expectNoAccessibilityViolations();

    await backend.release();
    await expect(inbox.enquiries.rows).toHaveCount(4);
    await expect(inbox.enquiries.list).not.toHaveAttribute('aria-busy');
  });

  test('L2-031.1: 25 enquiries show 20 on page 1 and the other 5 on page 2', async ({ page, backend }) => {
    await backend.scenario('more-enquiries', {
      email: 'marcia.t@example.com',
      count: 21,
      statuses: ['Declined', 'Closed', 'Declined', 'Closed', 'Declined', ...Array(16).fill('Closed')],
    });
    const inbox = new InboxPage(page);

    await inbox.open();

    await expect(inbox.subtitle).toHaveText('25 enquiries · 1 unread');
    await expect(inbox.enquiries.filterItems).toHaveText(['All 25', 'Open 1', 'Replied 1', 'Declined 4', 'Closed 19']);
    await expect(inbox.enquiries.rows).toHaveCount(20);
    await expect(inbox.enquiries.paginationSummary).toHaveText('Showing 1–20 of 25');
    await expect(inbox.enquiries.pageLink('Page 1')).toHaveAttribute('aria-current', 'page');
    await expect(inbox.enquiries.pageLink('Previous page')).toHaveAttribute('aria-disabled', 'true');
    await inbox.expectNoAccessibilityViolations();

    await inbox.enquiries.pageLink('Next page').click();

    await expect(page).toHaveURL(/\/inbox\?page=2$/);
    await expect(inbox.enquiries.rows).toHaveCount(5);
    await expect(inbox.enquiries.paginationSummary).toHaveText('Showing 21–25 of 25');
    await expect(inbox.enquiries.pageLink('Page 2')).toHaveAttribute('aria-current', 'page');
  });

  test('offline: the inbox stays readable and says replies wait for the connection', async ({ page, context }) => {
    const inbox = new InboxPage(page);
    await inbox.open();
    await expect(inbox.enquiries.rows).toHaveCount(4);

    await context.setOffline(true);

    await expect(inbox.offlineBanner).toHaveAttribute('role', 'status');
    await expect(inbox.offlineBanner).toContainText('You’re offline');
    await expect(inbox.offlineBanner).toContainText('Showing your inbox as of 10:00 a.m. Replies can’t be sent until you reconnect.');
    await expect(inbox.enquiries.rows).toHaveCount(4);
    await inbox.expectNoAccessibilityViolations();

    await context.setOffline(false);
    await expect(inbox.offlineBanner).toHaveCount(0);
  });
});
