import { test, expect } from '../../support/test';
import { EnquiriesPage, EnquiryPage } from '../../pages/enquiries.page';
import { cast } from '../../support/cast';
import type { Backend } from '../../support/backend';

const PRIYA = 'priya.r@example.com';

async function enquiryId(backend: Backend, customer: string): Promise<string> {
  return (await backend.scenario('enquiry-id', { customer, caterer: 'pelau-house' })).id;
}

test.describe('Caterer enquiries list', () => {
  test.beforeEach(async ({ backend }) => {
    await backend.signInAs('kendra');
  });

  test('L2-031 L2-024.3 inbox-row AC-2 AC-3 AC-5 AC-9: Kendra sees every enquiry, the first unread open beside the list with its fit warning', async ({ page }) => {
    const enquiries = new EnquiriesPage(page);

    await enquiries.open();

    await expect(enquiries.heading).toHaveText('Enquiries');
    await expect(enquiries.subtitle).toHaveText('6 enquiries · 2 unread');
    await expect(enquiries.enquiries.filterItems).toHaveText(['All 6', 'Open 2', 'Replied 2', 'Declined 1', 'Closed 1']);
    await expect(enquiries.enquiries.list).toHaveAttribute('aria-label', 'Pelau House enquiries');
    await expect(enquiries.enquiries.names()).toHaveText([
      'Marcia Thompson',
      'Unread. Priya Ramdial',
      'Unread. Andre Clarke',
      'Jean-Robert Pierre',
      'Nadia Joseph',
      'Former Sweet Hand user',
    ]);
    const priya = enquiries.enquiries.row('Priya Ramdial');
    await expect(enquiries.enquiries.pictureOf(priya)).toHaveText('PR');
    await expect(enquiries.enquiries.pictureOf(priya)).toHaveAttribute('aria-hidden', 'true');
    await expect(enquiries.enquiries.timeOf(priya)).toHaveText('Yesterday');
    await expect(enquiries.enquiries.summaryOf(priya)).toHaveText('Thu 5 Nov · 60 guests · Corporate events');
    await expect(enquiries.enquiries.statusOf(priya)).toHaveText('Open');
    await expect(priya).toHaveAttribute('aria-current', 'true');
    await expect(enquiries.enquiries.summaryOf(enquiries.enquiries.row('Andre Clarke'))).toHaveText('Sat 12 Jun 2027 · 250 guests · Weddings');
    const former = enquiries.enquiries.row('Former Sweet Hand user');
    await expect(enquiries.enquiries.timeOf(former)).toHaveText('Tue 22 Sep');
    await expect(enquiries.enquiries.summaryOf(former)).toHaveText('Sat 26 Sep · 35 guests · Birthdays');

    await expect(enquiries.thread.heading).toHaveText('Priya Ramdial');
    await expect(enquiries.thread.heading).toHaveJSProperty('tagName', 'H2');
    await expect(enquiries.thread.status).toHaveText('Open');
    await expect(enquiries.thread.sentLine).toHaveText('Sent yesterday at 4:15 p.m.');
    await expect(enquiries.thread.actionButtons).toHaveText(['Share my contact details', 'Decline']);
    await expect(enquiries.thread.fitWarnings).toHaveText(['You don’t list Downtown Toronto as an area you serve']);
    await expect(enquiries.thread.metaOf(enquiries.thread.messageAt(0))).toHaveText('Priya Ramdial · Fri 9 Oct, 4:15 p.m.');
    await expect(enquiries.thread.replyLabel).toHaveText('Reply to Priya');
    await expect(enquiries.thread.replyHelp).toHaveText('Priya sees Pelau House, not your email or phone.');
    await expect(enquiries.thread.sendButton).toHaveText('Send');
    await expect(enquiries.header.link('Enquiries, 2 unread')).toBeVisible();
    await expect(page.getByText(PRIYA)).toHaveCount(0);
    await enquiries.expectNoAccessibilityViolations();
  });

  test('L2-031.2: filtering by Open shows only open enquiries', async ({ page }) => {
    const enquiries = new EnquiriesPage(page);
    await enquiries.open();

    await enquiries.enquiries.filterItem('Open').click();

    await expect(page).toHaveURL(/\/dashboard\/enquiries\?status=open$/);
    await expect(enquiries.subtitle).toHaveText('2 open · 2 unread');
    await expect(enquiries.enquiries.names()).toHaveText(['Unread. Priya Ramdial', 'Unread. Andre Clarke']);
    await expect(enquiries.thread.heading).toHaveText('Priya Ramdial');
  });

  test('a filter with nothing in it says so and offers every enquiry', async ({ page, backend }) => {
    await backend.scenario('set-status', { customer: 'jr.pierre@example.com', caterer: 'pelau-house', status: 'Replied' });
    const enquiries = new EnquiriesPage(page);

    await enquiries.open('?status=closed');

    await expect(enquiries.enquiries.filterItem('Closed')).toHaveText('Closed 0');
    await expect(enquiries.enquiries.emptyTitle).toHaveText('No closed enquiries');
    await expect(enquiries.enquiries.emptyText).toHaveText('Enquiries close when you or the customer close them, or 30 days after the event.');
    await expect(enquiries.pane).toHaveCount(0);
    await enquiries.expectNoAccessibilityViolations();
    await enquiries.enquiries.emptyAction('Show all enquiries').click();
    await expect(enquiries.enquiries.rows).toHaveCount(6);
  });

  test('a caterer with no enquiries yet is told where they will arrive', async ({ page, backend }) => {
    await backend.scenario('no-enquiries', { email: cast.kendra.email });
    const enquiries = new EnquiriesPage(page);

    await enquiries.open();

    await expect(enquiries.subtitle).toHaveText('Nothing yet');
    await expect(enquiries.enquiries.emptyTitle).toHaveText('No enquiries yet');
    await expect(enquiries.enquiries.emptyText).toHaveText('When a customer asks about an event, it lands here and we email kendra@pelauhouse.example.');
    await expect(enquiries.enquiries.emptyAction('View your page')).toHaveAttribute('href', '/caterers/pelau-house');
    await expect(enquiries.header.link('Enquiries')).toBeVisible();
    await enquiries.expectNoAccessibilityViolations();
  });

  test('when the list fails to load the caterer is told their enquiries are safe', async ({ page, backend }) => {
    await backend.fail('GET /api/enquiries', { status: 500, times: 1 });
    const enquiries = new EnquiriesPage(page);

    await enquiries.open();

    await expect(enquiries.subtitle).toHaveText('Enquiries didn’t load');
    await expect(enquiries.alert).toHaveAttribute('role', 'alert');
    await expect(enquiries.alert).toContainText('We couldn’t load your enquiries');
    await expect(enquiries.alert).toContainText('Your enquiries are safe. Check your connection and try again.');
    await expect(enquiries.alertAction('Back to overview')).toHaveAttribute('href', '/dashboard');
    await enquiries.expectNoAccessibilityViolations();

    await enquiries.alertAction('Retry').click();
    await expect(enquiries.enquiries.rows).toHaveCount(6);
  });

  test('while the list loads, skeletons hold its place', async ({ page, backend }) => {
    await backend.hold('GET /api/enquiries');
    const enquiries = new EnquiriesPage(page);

    await enquiries.open();

    await expect(enquiries.loadingStatus).toHaveText('Loading enquiries');
    await expect(enquiries.enquiries.filterSkeleton).toBeAttached();
    await expect(enquiries.enquiries.skeletonRows).toHaveCount(6);
    await expect(enquiries.enquiries.list).toHaveAttribute('aria-busy', 'true');
    await enquiries.expectNoAccessibilityViolations();
    await backend.release();
    await expect(enquiries.enquiries.rows).toHaveCount(6);
  });

  test('L2-031.1 inbox-row AC-17: 48 enquiries run to 3 pages and a long name truncates on a small phone', async ({ page, backend }) => {
    await backend.scenario('more-enquiries', { email: cast.kendra.email, count: 42, statuses: ['Replied', 'Closed', 'Declined'] });
    const enquiries = new EnquiriesPage(page);

    await enquiries.open();

    await expect(enquiries.subtitle).toHaveText('48 enquiries · 2 unread');
    await expect(enquiries.enquiries.rows).toHaveCount(20);
    await expect(enquiries.enquiries.paginationSummary).toHaveText('Showing 1–20 of 48');
    await expect(enquiries.enquiries.pageLink('Page 3')).toBeVisible();
    await page.setViewportSize({ width: 320, height: 700 });
    await expect(enquiries.enquiries.row('Simone Achterberg-Ramkissoon')).toBeVisible();
    await enquiries.expectNoHorizontalScroll();
  });

  test('L2-036.2: on a phone only the list shows and a row opens the enquiry full width', async ({ page }) => {
    const enquiries = new EnquiriesPage(page);
    const enquiry = new EnquiryPage(page);
    await enquiries.usePhone();
    await enquiries.open();

    await expect(enquiries.pane).toBeHidden();
    await enquiries.expectNoHorizontalScroll();
    await enquiries.enquiries.choose('Andre Clarke');

    await expect(page).toHaveURL(/\/dashboard\/enquiries\/[0-9a-f-]{36}$/);
    await expect(enquiry.thread.heading).toHaveText('Andre Clarke');
    await expect(enquiry.list).toBeHidden();
    await expect(enquiry.thread.backLink).toHaveText('Enquiries');
    await enquiry.expectNoAccessibilityViolations();
    await enquiry.thread.backLink.click();
    await expect(page).toHaveURL(/\/dashboard\/enquiries$/);
  });

  test('L2-079: a customer cannot open the caterer enquiries', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const enquiries = new EnquiriesPage(page);

    await enquiries.open();

    await expect(enquiries.heading).toHaveText('No access');
  });
});

test.describe('Caterer enquiry', () => {
  test.beforeEach(async ({ backend }) => {
    await backend.signInAs('kendra');
  });

  test('L2-024.3 L2-029.2 message AC-7: Kendra opens Priya’s enquiry: the fit warning shows and the badge drops to 1', async ({ page, backend }) => {
    const enquiry = new EnquiryPage(page);

    await enquiry.open(await enquiryId(backend, PRIYA));

    await expect(enquiry.thread.heading).toHaveText('Priya Ramdial');
    await expect(enquiry.thread.heading).toHaveJSProperty('tagName', 'H1');
    await expect(enquiry.thread.partyPicture).toHaveText('PR');
    await expect(enquiry.thread.summaryValue('Area')).toHaveText('Downtown Toronto · M5V');
    await expect(enquiry.thread.summaryValue('Event date')).toHaveText('Thursday 5 November 2026');
    await expect(enquiry.thread.fitWarnings).toHaveText(['You don’t list Downtown Toronto as an area you serve']);
    await expect(enquiry.thread.actionButtons).toHaveText(['Share my contact details', 'Decline']);
    await expect(enquiry.header.link('Enquiries, 1 unread')).toBeVisible();
    await expect(enquiry.enquiries.currentRow).toHaveAttribute('aria-current', 'true');
    await expect(enquiry.enquiries.nameOf(enquiry.enquiries.currentRow)).toHaveText('Priya Ramdial');
    await expect(page.getByText(PRIYA)).toHaveCount(0);
    await enquiry.expectNoAccessibilityViolations();
  });

  test('L2-033.1: the caterer’s first reply moves an Open enquiry to Replied', async ({ page, backend }) => {
    const enquiry = new EnquiryPage(page);
    await enquiry.open(await enquiryId(backend, PRIYA));
    await expect(enquiry.thread.status).toHaveText('Open');

    await enquiry.thread.reply('Hi Priya, thanks for thinking of us! We can make downtown work for 60.');

    await expect(enquiry.thread.status).toHaveText('Replied');
    await expect(enquiry.thread.metaOf(enquiry.thread.mine.last())).toHaveText('You · Today, 10:00 a.m.');
    await expect(enquiry.thread.actionButtons).toHaveText(['Share my contact details', 'Close enquiry']);
    await expect(enquiry.toasts.textOf(enquiry.toasts.withTitle('Reply sent'))).toHaveText('Priya will get an email.');
    await expect(enquiry.enquiries.statusOf(enquiry.enquiries.row('Priya Ramdial'))).toHaveText('Replied');
  });

  test('a replied enquiry shows Kendra’s own reply on her side and offers Close', async ({ page, backend }) => {
    const enquiry = new EnquiryPage(page);

    await enquiry.open(await enquiryId(backend, cast.marcia.email));

    await expect(enquiry.thread.status).toHaveText('Replied');
    await expect(enquiry.thread.sentLine).toHaveText('Sent Thu 8 Oct at 7:15 p.m.');
    await expect(enquiry.thread.senderOf(enquiry.thread.theirs.first())).toHaveText('Marcia Thompson:');
    await expect(enquiry.thread.senderOf(enquiry.thread.mine.first())).toHaveText('You:');
    await expect(enquiry.thread.metaOf(enquiry.thread.mine.first())).toHaveText('You · Today, 9:42 a.m.');
    await expect(enquiry.thread.actionButtons).toHaveText(['Share my contact details', 'Close enquiry']);
    await expect(enquiry.thread.replyLabel).toHaveText('Reply to Marcia');
    await expect(page.getByText(cast.marcia.email)).toHaveCount(0);
    await enquiry.expectNoAccessibilityViolations();
  });

  test('L2-033.2: a declined enquiry quotes the note and cannot be answered', async ({ page, backend }) => {
    const enquiry = new EnquiryPage(page);

    await enquiry.open(await enquiryId(backend, 'nadia.j@example.com'));

    await expect(enquiry.thread.status).toHaveText('Declined');
    await expect(enquiry.thread.system).toContainText('Pelau House declined this enquiry: “Fully booked that weekend.”');
    await expect(enquiry.thread.closedNote).toHaveText('This enquiry is closed.');
    await expect(enquiry.thread.actions).toHaveCount(0);
    await expect(enquiry.thread.replyBox).toHaveCount(0);
    await enquiry.expectNoAccessibilityViolations();
  });

  test('L2-033.4: an enquiry closed automatically after the event says so', async ({ page, backend }) => {
    const enquiry = new EnquiryPage(page);

    await enquiry.open(await enquiryId(backend, cast.jeanRobert.email));

    await expect(enquiry.thread.status).toHaveText('Closed');
    await expect(enquiry.thread.messages).toHaveCount(4);
    await expect(enquiry.thread.system).toContainText('Closed automatically 30 days after the event.');
    await expect(enquiry.thread.closedNote).toHaveText('This enquiry is closed.');
  });

  test('L2-072.2 message AC-10: a customer who left Sweet Hand shows as a former user with no way to reply', async ({ page, backend }) => {
    const enquiry = new EnquiryPage(page);

    await enquiry.open((await backend.scenario('enquiry-id', { customer: 'former', caterer: 'pelau-house' })).id);

    await expect(enquiry.thread.heading).toHaveText('Former Sweet Hand user');
    await expect(enquiry.thread.partyPicture).toHaveText('');
    await expect(enquiry.thread.sentLine).toHaveText('Sent Fri 11 Sep');
    await expect(enquiry.thread.senderOf(enquiry.thread.theirs.first())).toHaveText('Former Sweet Hand user:');
    await expect(enquiry.thread.actions).toHaveCount(0);
    await expect(enquiry.thread.replyBox).toHaveCount(0);
    await expect(enquiry.thread.closedNote).toHaveText('This person has left Sweet Hand, so replies can’t be delivered.');
    await expect(enquiry.thread.root).not.toContainText('@');
    await enquiry.expectNoAccessibilityViolations();
  });

  test('message AC-13 (caterer side): an over-long reply shows its error under the field, which keeps focus and text', async ({ page, backend }) => {
    const enquiry = new EnquiryPage(page);
    await enquiry.open(await enquiryId(backend, PRIYA));
    const long = 'Doubles, aloo pie, curry channa. '.repeat(65);

    await enquiry.thread.reply(long);

    await expect(enquiry.thread.replyField).toBeFocused();
    await expect(enquiry.thread.replySummary).toHaveCount(0);
    await expect(enquiry.thread.replyError).toHaveText('Keep your reply under 2,000 characters. It’s 2,145 now.');
    await expect(enquiry.thread.replyField).toHaveAttribute('aria-invalid', 'true');
    await expect(enquiry.thread.replyField).toHaveValue(long);
    await enquiry.expectNoAccessibilityViolations();
  });

  test('L2-035.2 message AC-9: when Marcia shares her details, Kendra sees them in that thread', async ({ page, backend }) => {
    await backend.scenario('share-contact', { customer: cast.marcia.email, caterer: 'pelau-house', by: 'customer' });
    const enquiry = new EnquiryPage(page);

    await enquiry.open(await enquiryId(backend, cast.marcia.email));

    await expect(enquiry.thread.system.last()).toContainText('Marcia Thompson shared their contact details');
    await expect(enquiry.thread.contactCards).toHaveText(['Marcia Thompsonmarcia.t@example.com+1 647 555 0187']);
    await enquiry.expectNoAccessibilityViolations();
  });

  test('L2-035.3: details shared in one thread do not show in another with the same customer', async ({ page, backend }) => {
    await backend.scenario('share-contact', { customer: cast.marcia.email, caterer: 'pelau-house', by: 'customer' });
    const { id } = await backend.scenario('another-enquiry', { customer: cast.marcia.email, caterer: 'pelau-house' });
    const enquiry = new EnquiryPage(page);

    await enquiry.open(id);

    await expect(enquiry.thread.heading).toHaveText('Marcia Thompson');
    await expect(enquiry.thread.contactCards).toHaveCount(0);
    await expect(page.getByText(cast.marcia.email)).toHaveCount(0);
  });

  test('L2-034.1: an enquiry sent to another caterer is not found', async ({ page, backend }) => {
    const { id } = await backend.scenario('enquiry-id', { customer: cast.marcia.email, caterer: 'sugar-dumplin' });
    const enquiry = new EnquiryPage(page);

    await enquiry.open(id);

    await expect(enquiry.thread.emptyTitle).toHaveText('We can’t find that enquiry');
    await expect(enquiry.thread.emptyAction('Back to enquiries')).toHaveAttribute('href', '/dashboard/enquiries');
    await expect(page.getByText('Sugar Dumplin')).toHaveCount(0);
  });

  test('when the enquiry fails to load nothing is lost and Kendra can retry', async ({ page, backend }) => {
    const id = await enquiryId(backend, PRIYA);
    await backend.fail(`GET /api/enquiries/${id}`, { status: 500, times: 1 });
    const enquiry = new EnquiryPage(page);

    await enquiry.open(id);

    await expect(enquiry.alert).toHaveAttribute('role', 'alert');
    await expect(enquiry.alert).toContainText('We couldn’t load this enquiry');
    await expect(enquiry.alert).toContainText('Nothing has been lost. Check your connection and try again.');
    await expect(enquiry.alertAction('Back to enquiries')).toHaveAttribute('href', '/dashboard/enquiries');
    await expect(enquiry.heading).toHaveText('Enquiry');
    await enquiry.expectNoAccessibilityViolations();

    await enquiry.alertAction('Retry').click();
    await expect(enquiry.thread.heading).toHaveText('Priya Ramdial');
  });

  test('while the enquiry loads, skeletons hold its place', async ({ page, backend }) => {
    const id = await enquiryId(backend, PRIYA);
    await backend.hold(`GET /api/enquiries/${id}`);
    const enquiry = new EnquiryPage(page);

    await enquiry.open(id);

    await expect(enquiry.thread.root).toHaveAttribute('aria-busy', 'true');
    await expect(enquiry.thread.loadingHeading).toBeAttached();
    await enquiry.expectNoAccessibilityViolations();
    await backend.release();
    await expect(enquiry.thread.heading).toHaveText('Priya Ramdial');
  });
});
