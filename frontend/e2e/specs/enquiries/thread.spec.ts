import { test, expect } from '../../support/test';
import { InboxPage } from '../../pages/inbox.page';
import { ThreadPage } from '../../pages/thread.page';
import { SignInPage } from '../../pages/sign-in.page';
import { cast, SEED_PASSWORD } from '../../support/cast';
import type { Backend } from '../../support/backend';

async function enquiryId(backend: Backend, caterer: string, customer: string = cast.marcia.email): Promise<string> {
  return (await backend.scenario('enquiry-id', { customer, caterer })).id;
}

test.describe('Customer thread', () => {
  test.beforeEach(async ({ backend }) => {
    await backend.signInAs('marcia');
  });

  test('L2-032.1 message AC-1 AC-6 AC-17: Marcia opens Pelau House from her inbox and reads her enquiry and Kendra’s reply', async ({ page }) => {
    const inbox = new InboxPage(page);
    const thread = new ThreadPage(page);
    await inbox.open();

    await inbox.enquiries.choose('Pelau House');

    await expect(page).toHaveURL(/\/inbox\/[0-9a-f-]{36}$/);
    await expect(thread.thread.heading).toHaveText('Pelau House');
    await expect(thread.thread.heading).toBeFocused();
    await expect(thread.thread.partyPicture).toHaveAttribute('alt', '');
    await expect(thread.thread.status).toHaveText('Replied');
    await expect(thread.thread.viewCaterer).toHaveAttribute('href', '/caterers/pelau-house');
    await expect(thread.thread.actionButtons).toHaveText(['Share my contact details', 'Close enquiry']);
    await expect(thread.thread.summaryValue('Event date')).toHaveText('Saturday 21 November 2026');
    await expect(thread.thread.summaryValue('Guests')).toHaveText('120');
    await expect(thread.thread.summaryValue('Area')).toHaveText('Scarborough');
    await expect(thread.thread.summaryValue('Occasion')).toHaveText('Family gatherings');
    await expect(thread.thread.enquiryMessage).toHaveText(/^Hi Kendra, we’re planning my parents’ 40th anniversary/);
    await expect(thread.thread.enquiryBy).toHaveText('Marcia Thompson · Thu 8 Oct, 7:15 p.m.');
    await expect(thread.thread.messages).toHaveCount(1);
    const reply = thread.thread.theirs.first();
    await expect(thread.thread.senderOf(reply)).toHaveText('Pelau House:');
    await expect(thread.thread.bubbleOf(reply)).toHaveText(/^Hi Marcia, congratulations to your parents!/);
    await expect(thread.thread.metaOf(reply)).toHaveText('Pelau House · Today, 9:42 a.m.');
    await expect(thread.thread.privateNote).toHaveText('Pelau House sees your name, not your email or phone.');
    await expect(thread.thread.replyLabel).toHaveText('Your reply');
    await expect(thread.thread.replyHelp).toHaveText('Pelau House gets an email. Links show as plain text.');
    await expect(thread.thread.replyCounter).toHaveText('0 / 2,000');
    await expect(thread.thread.sendButton).toHaveAccessibleName('Send reply');
    await expect(thread.listHeading).toHaveText('Inbox');
    await expect(thread.enquiries.currentRow).toHaveAttribute('aria-current', 'page');
    await expect(thread.enquiries.nameOf(thread.enquiries.currentRow)).toHaveText('Pelau House');
    await thread.expectNoAccessibilityViolations();
  });

  test('L2-029.2 inbox-row AC-7: opening the unread thread marks it read and clears the badge', async ({ page, backend }) => {
    const thread = new ThreadPage(page);
    const id = await enquiryId(backend, 'pelau-house');

    await thread.open(id);

    await expect(thread.thread.heading).toHaveText('Pelau House');
    await expect(thread.header.link('Inbox')).toBeVisible();
    await expect(thread.enquiries.unreadRows).toHaveCount(0);
    const inbox = new InboxPage(page);
    await inbox.open();
    await expect(inbox.subtitle).toHaveText('4 enquiries · 0 unread');
    await expect(inbox.enquiries.unreadRows).toHaveCount(0);
  });

  test('an open enquiry says the caterer has not replied yet', async ({ page, backend }) => {
    const thread = new ThreadPage(page);

    await thread.open(await enquiryId(backend, 'sugar-dumplin'));

    await expect(thread.thread.heading).toHaveText('Sugar Dumplin');
    await expect(thread.thread.status).toHaveText('Open');
    await expect(thread.thread.closedNote).toHaveText('Sugar Dumplin hasn’t replied yet. We’ll email you when they do.');
    await expect(thread.thread.messages).toHaveCount(0);
    await expect(thread.thread.replyBox).toBeVisible();
    await thread.expectNoAccessibilityViolations();
  });

  test('L2-033.2 L2-032.5 message AC-8: a declined enquiry shows the caterer’s note and no way to reply', async ({ page, backend }) => {
    const thread = new ThreadPage(page);

    await thread.open(await enquiryId(backend, 'demerara-kitchen'));

    await expect(thread.thread.status).toHaveText('Declined');
    await expect(thread.thread.system.first()).toContainText('Demerara Kitchen can’t take on this event');
    await expect(thread.thread.metaOf(thread.thread.system.first())).toHaveText('Tue 6 Oct, 11:20 a.m.');
    await expect(thread.thread.bubbleOf(thread.thread.theirs.first())).toHaveText('Fully booked that weekend. Sorry, and congratulations to your parents.');
    await expect(thread.thread.closedNote).toHaveText('This enquiry is closed.');
    await expect(thread.thread.actions).toHaveCount(0);
    await expect(thread.thread.replyBox).toHaveCount(0);
    await thread.expectNoAccessibilityViolations();
  });

  test('L2-032.5 message AC-2: a closed enquiry keeps both sides of the conversation and says who closed it', async ({ page, backend }) => {
    const thread = new ThreadPage(page);

    await thread.open(await enquiryId(backend, 'ti-kay'));

    await expect(thread.thread.status).toHaveText('Closed');
    await expect(thread.thread.bubbles).toHaveText(['Bonswa Marcia! Yes, we can. Griot for 45 with pikliz and djon djon rice is $1,150.', 'Wonderful, let’s book it.']);
    await expect(thread.thread.senderOf(thread.thread.mine.first())).toHaveText('You:');
    await expect(thread.thread.metaOf(thread.thread.mine.first())).toHaveText('You · Tue 4 Aug, 7:12 a.m.');
    await expect(thread.thread.system).toContainText('Marcia Thompson closed this enquiry');
    await expect(thread.thread.metaOf(thread.thread.system)).toHaveText('Sat 5 Sep, 8:00 a.m.');
    await expect(thread.thread.closedNote).toHaveText('This enquiry is closed.');
    await expect(thread.thread.replyBox).toHaveCount(0);
    await thread.expectNoAccessibilityViolations();
  });

  test('L2-032.1: a long conversation lists every message oldest to newest with Toronto times', async ({ page, backend }) => {
    await backend.scenario('long-thread', { customer: cast.marcia.email, caterer: 'pelau-house' });
    const thread = new ThreadPage(page);

    await thread.open(await enquiryId(backend, 'pelau-house'));

    await expect(thread.thread.messages).toHaveCount(10);
    await expect(thread.thread.metaOf(thread.thread.messageAt(0))).toHaveText('Pelau House · Fri 9 Oct, 8:05 a.m.');
    await expect(thread.thread.metaOf(thread.thread.messageAt(9))).toHaveText('You · Today, 9:50 a.m.');
    await expect(thread.thread.bubbleOf(thread.thread.messageAt(9))).toHaveText('Yes please! I’ll confirm the final count by 7 November.');
  });

  test('L2-032.3 L2-032.4 L2-080.1 message AC-4 AC-5 AC-25: markup and links show as plain text and nothing runs', async ({ page, backend }) => {
    await backend.scenario('edge-thread', { customer: cast.marcia.email, caterer: 'pelau-house' });
    const dialogs: string[] = [];
    page.on('dialog', (d) => {
      dialogs.push(d.message());
      void d.dismiss();
    });
    const thread = new ThreadPage(page);
    await thread.usePhone();

    await thread.open(await enquiryId(backend, 'pelau-house'));

    await expect(thread.thread.enquiryMessage).toContainText('<script>alert(1)</script> Sorry, my phone pasted something odd.');
    await expect(thread.thread.bubbleOf(thread.thread.messageAt(0))).toContainText('https://pelauhouse.example/menu-2026');
    await expect(thread.thread.bubbleOf(thread.thread.messageAt(0))).toContainText('<img src=x onerror=alert(1)>');
    await expect(thread.thread.messageList.getByRole('link')).toHaveCount(0);
    await expect(thread.thread.bubbleOf(thread.thread.messageAt(1))).toHaveText('👍🏾 Thank you! Ou se yon bon kizinyè. ¡Gracias!');
    await page.setViewportSize({ width: 320, height: 700 });
    await thread.expectNoHorizontalScroll();
    expect(dialogs).toEqual([]);
  });

  test('L2-034.1: another customer’s enquiry is not found', async ({ page, backend }) => {
    const thread = new ThreadPage(page);
    const someoneElses = await enquiryId(backend, 'pelau-house', 'priya.r@example.com');

    await thread.open(someoneElses);

    await expect(thread.thread.emptyTitle).toHaveText('We can’t find that enquiry');
    await expect(thread.thread.emptyTitle).toHaveRole('heading');
    await expect(thread.thread.emptyText).toHaveText('The link may be old, or it belongs to a different account.');
    await expect(page.getByText('Priya')).toHaveCount(0);
    await thread.expectNoAccessibilityViolations();

    await thread.thread.emptyAction('Back to inbox').click();
    await expect(page).toHaveURL(/\/inbox$/);
  });

  test('message AC-20: while the thread loads, its layout is held by skeletons', async ({ page, backend }) => {
    const id = await enquiryId(backend, 'pelau-house');
    await backend.hold(`GET /api/enquiries/${id}`);
    const thread = new ThreadPage(page);

    await thread.open(id);

    await expect(thread.thread.root).toHaveAttribute('aria-busy', 'true');
    await expect(thread.thread.loadingHeading).toBeAttached();
    await thread.expectNoAccessibilityViolations();
    await backend.release();
    await expect(thread.thread.heading).toHaveText('Pelau House');
  });

  test('when a thread fails to load nothing is lost and the customer can try again', async ({ page, backend }) => {
    const id = await enquiryId(backend, 'pelau-house');
    await backend.fail(`GET /api/enquiries/${id}`, { status: 500, times: 1, body: { title: 'Something went wrong', correlationId: '2b8e-04c1' } });
    const thread = new ThreadPage(page);

    await thread.open(id);

    await expect(thread.thread.emptyState).toHaveAttribute('role', 'alert');
    await expect(thread.thread.emptyTitle).toHaveText('We couldn’t load this enquiry');
    await expect(thread.thread.emptyText).toHaveText('Nothing you wrote is lost. Check your connection and try again.');
    await expect(thread.thread.emptyReference).toHaveText('2b8e-04c1');
    await expect(thread.thread.emptyAction('Back to inbox')).toHaveAttribute('href', '/inbox');
    await thread.expectNoAccessibilityViolations();

    await thread.thread.emptyAction('Try again').click();
    await expect(thread.thread.heading).toHaveText('Pelau House');
  });
});

test.describe('Customer thread on a phone', () => {
  test('L2-036.2 inbox-row AC-10: the thread fills the screen with an "Inbox" back link that returns to the row', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const inbox = new InboxPage(page);
    const thread = new ThreadPage(page);
    await inbox.usePhone();
    await inbox.open();

    await inbox.enquiries.choose('Sugar Dumplin');

    await expect(thread.thread.heading).toHaveText('Sugar Dumplin');
    await expect(thread.list).toBeHidden();
    await expect(thread.thread.backLink).toHaveText('Inbox');
    await expect(thread.thread.backLink).toHaveAccessibleName('Inbox');
    await thread.expectNoHorizontalScroll();
    await thread.expectNoAccessibilityViolations();

    await thread.thread.backLink.click();

    await expect(page).toHaveURL(/\/inbox$/);
    await expect(inbox.enquiries.row('Sugar Dumplin')).toBeFocused();
  });

  test('L2-036.3: in a long thread the reply box stays at the bottom of the screen', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    await backend.scenario('long-thread', { customer: cast.marcia.email, caterer: 'pelau-house' });
    const thread = new ThreadPage(page);
    await thread.usePhone();

    await thread.open(await enquiryId(backend, 'pelau-house'));

    await expect(thread.thread.messages).toHaveCount(10);
    await thread.thread.messageAt(0).scrollIntoViewIfNeeded();
    const box = await thread.thread.replyBox.boundingBox();
    expect(box && box.y + box.height).toBeCloseTo(780, -1);
    await expect(thread.thread.sendButton).toBeInViewport();
  });
});

test.describe('Customer thread on a phone, by keyboard and touch', () => {
  test.beforeEach(async ({ backend }) => {
    await backend.signInAs('marcia');
  });

  test('L2-065.1 message AC-26 inbox-row AC-18: actions, Send and rows are at least 44 px tall on a phone', async ({ page, backend }) => {
    const inbox = new InboxPage(page);
    const thread = new ThreadPage(page);
    await inbox.usePhone();
    await inbox.open();
    const row = await inbox.enquiries.row('Sugar Dumplin').boundingBox();
    expect(row!.height).toBeGreaterThanOrEqual(44);

    await thread.open(await enquiryId(backend, 'pelau-house'));

    for (const target of [thread.thread.action('Share my contact details'), thread.thread.action('Close enquiry'), thread.thread.sendButton, thread.thread.backLink]) {
      const box = await target.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    const send = await thread.thread.sendButton.boundingBox();
    expect(send!.width).toBeGreaterThanOrEqual(44);
  });

  test('L2-067.1 message AC-17: Tab goes from the heading through the thread in reading order', async ({ page, backend }) => {
    const thread = new ThreadPage(page);
    await thread.usePhone();
    await thread.open(await enquiryId(backend, 'pelau-house'));
    await expect(thread.thread.heading).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(thread.thread.viewCaterer).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(thread.thread.action('Share my contact details')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(thread.thread.action('Close enquiry')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(thread.thread.replyField).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(thread.thread.sendButton).toBeFocused();

    await thread.thread.heading.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(thread.thread.backLink).toBeFocused();
  });
});

test('L2-027.4 L2-013: a signed-out visitor following a thread link signs in and lands on the thread', async ({ page, backend }) => {
  const id = await enquiryId(backend, 'pelau-house');
  const signIn = new SignInPage(page);
  const thread = new ThreadPage(page);

  await thread.open(id);
  await expect(page).toHaveURL(/\/sign-in\?returnUrl=/);
  await signIn.signIn(cast.marcia.email, SEED_PASSWORD);

  await expect(page).toHaveURL(new RegExp(`/inbox/${id}$`));
  await expect(thread.thread.heading).toHaveText('Pelau House');
});
