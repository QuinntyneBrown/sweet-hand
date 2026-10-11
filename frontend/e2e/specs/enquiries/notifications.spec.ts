import { test, expect } from '../../support/test';
import { ThreadPage } from '../../pages/thread.page';
import { EnquiryPage } from '../../pages/enquiries.page';
import { cast } from '../../support/cast';
import type { Backend } from '../../support/backend';

async function enquiryId(backend: Backend, caterer: string, customer: string = cast.marcia.email): Promise<string> {
  return (await backend.scenario('enquiry-id', { customer, caterer })).id;
}

test.describe('Enquiry notifications', () => {
  test('L2-029.3 L2-028.1: a new message arrives in the open thread within 60 seconds, and Show message takes the customer to it', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const thread = new ThreadPage(page);
    await thread.open(await enquiryId(backend, 'pelau-house'));
    await expect(thread.thread.messages).toHaveCount(1);

    await backend.scenario('add-message', { customer: cast.marcia.email, caterer: 'pelau-house', from: 'caterer', text: 'Thanks Marcia! I’ll call this afternoon to confirm the menu.' });
    await page.clock.runFor(60_000);

    await expect(thread.thread.messages).toHaveCount(2);
    const toast = thread.toasts.withTitle('New message from Pelau House');
    await expect(toast).toHaveClass(/toast--info/);
    await expect(thread.toasts.textOf(toast)).toHaveText('“Thanks Marcia! I’ll call this afternoon to confirm the menu.”');
    await expect(thread.header.link('Inbox')).toBeVisible();
    await thread.expectNoAccessibilityViolations();

    await thread.toasts.action(toast, 'Show message').click();

    await expect(thread.thread.bubbleOf(thread.thread.messageAt(1))).toBeFocused();
    await expect(toast).toHaveCount(0);
  });

  test('a caterer’s open enquiry picks up the customer’s new message too', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const enquiry = new EnquiryPage(page);
    await enquiry.open(await enquiryId(backend, 'pelau-house'));
    await expect(enquiry.thread.messages).toHaveCount(2);

    await backend.scenario('add-message', { customer: cast.marcia.email, caterer: 'pelau-house', from: 'customer', text: 'Yes please hold the date!' });
    await page.clock.runFor(60_000);

    await expect(enquiry.thread.messages).toHaveCount(3);
    await expect(enquiry.toasts.textOf(enquiry.toasts.withTitle('New message from Marcia Thompson'))).toHaveText('“Yes please hold the date!”');
  });

  test('L2-033.4: after the event, opening the thread warns when it will close', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    await backend.scenario('set-event-date', { customer: cast.marcia.email, caterer: 'sugar-dumplin', date: '2026-09-20' });
    const thread = new ThreadPage(page);

    await thread.open(await enquiryId(backend, 'sugar-dumplin'));

    const toast = thread.toasts.withTitle('This enquiry closes on Tue 20 Oct');
    await expect(toast).toHaveClass(/toast--warning/);
    await expect(thread.toasts.textOf(toast)).toHaveText('Enquiries close 30 days after the event. You can still message until then.');
  });
});
