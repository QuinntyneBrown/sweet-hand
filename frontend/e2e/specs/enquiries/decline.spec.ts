import { test, expect } from '../../support/test';
import { EnquiryPage } from '../../pages/enquiries.page';
import type { Backend } from '../../support/backend';

const PRIYA = 'priya.r@example.com';

async function openPriya(backend: Backend, enquiry: EnquiryPage): Promise<string> {
  const { id } = await backend.scenario('enquiry-id', { customer: PRIYA, caterer: 'pelau-house' });
  await enquiry.open(id);
  await expect(enquiry.thread.action('Decline')).toBeVisible();
  return id;
}

test.describe('Declining an enquiry', () => {
  test.beforeEach(async ({ backend }) => {
    await backend.signInAs('kendra');
  });

  test('L2-067.4: the decline dialog starts in the optional note and Escape returns focus to Decline', async ({ page, backend }) => {
    const enquiry = new EnquiryPage(page);
    await openPriya(backend, enquiry);

    await enquiry.thread.action('Decline').click();

    await expect(enquiry.declineDialog.heading).toHaveText('Decline Priya’s enquiry?');
    await expect(enquiry.declineDialog.description).toHaveText('Priya gets an email saying you can’t take on the event. This can’t be undone.');
    await expect(enquiry.declineDialog.note).toBeFocused();
    await expect(enquiry.declineDialog.note).toHaveAccessibleName('Note to Priya (optional)');
    await expect(enquiry.declineDialog.noteHelp).toHaveText('Shown to Priya in the email and the enquiry');
    await expect(enquiry.declineDialog.noteCounter).toHaveText('0 / 500');
    await expect(enquiry.declineDialog.button('Decline enquiry')).toHaveClass(/btn--danger/);
    await enquiry.expectNoAccessibilityViolations();

    await page.keyboard.press('Escape');

    await expect(enquiry.declineDialog.dialog).toBeHidden();
    await expect(enquiry.thread.action('Decline')).toBeFocused();
  });

  test('L2-033.2 L2-028.4: declining with a note shows the dialog busy, then the enquiry declined with the note in the thread', async ({ page, backend }) => {
    const enquiry = new EnquiryPage(page);
    const id = await openPriya(backend, enquiry);
    await backend.hold(`POST /api/enquiries/${id}/decline`);
    await enquiry.thread.action('Decline').click();

    await enquiry.declineDialog.note.fill('Fully booked that weekend.');
    await enquiry.declineDialog.button('Decline enquiry').click();

    await expect(enquiry.declineDialog.busyStatus).toHaveText('Declining Priya’s enquiry');
    await expect(enquiry.declineDialog.note).toHaveAttribute('readonly', '');
    await expect(enquiry.declineDialog.button('Decline enquiry')).toHaveAttribute('aria-busy', 'true');
    await expect(enquiry.declineDialog.button('Cancel')).toBeDisabled();
    await enquiry.expectNoAccessibilityViolations();
    await backend.release();

    await expect(enquiry.declineDialog.dialog).toBeHidden();
    await expect(enquiry.thread.status).toHaveText('Declined');
    await expect(enquiry.thread.system.last()).toContainText('Pelau House declined this enquiry: “Fully booked that weekend.”');
    await expect(enquiry.thread.closedNote).toHaveText('This enquiry is closed.');
    await expect(enquiry.thread.replyBox).toHaveCount(0);
    await expect(enquiry.thread.heading).toBeFocused();
    await expect(enquiry.enquiries.statusOf(enquiry.enquiries.row('Priya Ramdial'))).toHaveText('Declined');
    const sent = (await backend.requests()).filter((r) => r.path.endsWith('/decline'));
    expect(sent.map((r) => r.body)).toEqual([{ note: 'Fully booked that weekend.' }]);
  });

  test('declining without a note is allowed', async ({ page, backend }) => {
    const enquiry = new EnquiryPage(page);
    await openPriya(backend, enquiry);
    await enquiry.thread.action('Decline').click();

    await enquiry.declineDialog.button('Decline enquiry').click();

    await expect(enquiry.thread.status).toHaveText('Declined');
    await expect(enquiry.thread.system.last()).toContainText('Pelau House declined this enquiry');
  });

  test('L2-033 L2-068.3: a note over 500 characters is not sent and the text is kept', async ({ page, backend }) => {
    const enquiry = new EnquiryPage(page);
    await openPriya(backend, enquiry);
    await enquiry.thread.action('Decline').click();
    const long = 'Sorry Priya, downtown is outside the areas we deliver to. '.repeat(9).slice(0, 512);

    await enquiry.declineDialog.note.fill(long);
    await enquiry.declineDialog.button('Decline enquiry').click();

    await expect(enquiry.declineDialog.summary).toBeFocused();
    await expect(enquiry.declineDialog.summary.getByRole('heading')).toHaveText('Check your note');
    await expect(enquiry.declineDialog.summary.getByRole('link')).toHaveText('Keep your note under 500 characters');
    await expect(enquiry.declineDialog.noteError).toHaveText('Keep your note under 500 characters');
    await expect(enquiry.declineDialog.note).toHaveAttribute('aria-invalid', 'true');
    await expect(enquiry.declineDialog.noteCounter).toHaveText('512 / 500');
    await expect(enquiry.declineDialog.note).toHaveValue(long);
    await enquiry.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.path.endsWith('/decline'))).toHaveLength(0);
  });

  test('when declining fails Priya has not been told and Kendra can try again', async ({ page, backend }) => {
    const enquiry = new EnquiryPage(page);
    const id = await openPriya(backend, enquiry);
    await backend.fail(`POST /api/enquiries/${id}/decline`, { status: 500, times: 1 });
    await enquiry.thread.action('Decline').click();
    await enquiry.declineDialog.note.fill('Sorry Priya, downtown is outside the areas we deliver to on weekdays.');

    await enquiry.declineDialog.button('Decline enquiry').click();

    await expect(enquiry.declineDialog.alert).toHaveAttribute('role', 'alert');
    await expect(enquiry.declineDialog.alert).toContainText('We couldn’t decline the enquiry');
    await expect(enquiry.declineDialog.alert).toContainText('Check your connection and try again. Priya hasn’t been told anything yet.');
    await expect(enquiry.declineDialog.note).toHaveValue('Sorry Priya, downtown is outside the areas we deliver to on weekdays.');
    await expect(enquiry.declineDialog.noteCounter).toHaveText('69 / 500');
    await enquiry.expectNoAccessibilityViolations();

    await enquiry.declineDialog.button('Decline enquiry').click();
    await expect(enquiry.thread.status).toHaveText('Declined');
  });

  test('L2-033.3: an enquiry already replied to elsewhere cannot be declined and can be closed instead', async ({ page, backend }) => {
    const enquiry = new EnquiryPage(page);
    await openPriya(backend, enquiry);
    await backend.scenario('set-status', { customer: PRIYA, caterer: 'pelau-house', status: 'Replied' });
    await enquiry.thread.action('Decline').click();

    await enquiry.declineDialog.button('Decline enquiry').click();

    await expect(enquiry.declineDialog.alert).toContainText('You’ve already replied to Priya');
    await expect(enquiry.declineDialog.alert).toContainText('An enquiry can only be declined before the first reply. You can close it instead, and Priya will be told.');
    await expect(enquiry.declineDialog.note).toHaveCount(0);
    await expect(enquiry.thread.status).toHaveText('Replied');
    await enquiry.expectNoAccessibilityViolations();

    await enquiry.declineDialog.button('Close enquiry instead').click();

    await expect(enquiry.closeDialog.dialog).toBeVisible();
    await enquiry.closeDialog.button('Close enquiry').click();
    await expect(enquiry.thread.status).toHaveText('Closed');
    await expect(enquiry.thread.system.last()).toContainText('Pelau House closed this enquiry');
  });
});
