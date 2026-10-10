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
});
