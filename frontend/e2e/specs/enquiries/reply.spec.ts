import { test, expect } from '../../support/test';
import { ThreadPage } from '../../pages/thread.page';
import { cast } from '../../support/cast';
import type { Backend } from '../../support/backend';

async function enquiryId(backend: Backend, caterer: string): Promise<string> {
  return (await backend.scenario('enquiry-id', { customer: cast.marcia.email, caterer })).id;
}

const REPLY = 'Hi Kendra, yes please hold the date! The hall opens at 4 p.m. — the side door on Ellesmere is easiest for unloading.';

test.describe('Replying in a thread', () => {
  test.beforeEach(async ({ backend }) => {
    await backend.signInAs('marcia');
  });

  test('L2-032.2 message AC-11 AC-12: a reply shows at once as sending, then as sent, and focus stays in the empty field', async ({ page, backend }) => {
    const id = await enquiryId(backend, 'pelau-house');
    const thread = new ThreadPage(page);
    await thread.open(id);
    await backend.hold(`POST /api/enquiries/${id}/messages`);

    await thread.thread.reply(REPLY);

    const pending = thread.thread.pending;
    await expect(pending).toHaveCount(1);
    await expect(thread.thread.bubbleOf(pending)).toHaveText(REPLY);
    await expect(thread.thread.metaOf(pending)).toHaveText('You · Sending…');
    await expect(thread.thread.metaOf(pending)).toHaveAttribute('role', 'status');
    await expect(thread.thread.replyField).toHaveValue('');
    await expect(thread.thread.replyField).toHaveAttribute('readonly', '');
    await expect(thread.thread.sendButton).toHaveAttribute('aria-busy', 'true');
    await expect(thread.thread.sendButton).toHaveAttribute('aria-disabled', 'true');
    await expect(thread.thread.sendButton).not.toHaveAttribute('disabled');
    await thread.expectNoAccessibilityViolations();

    await backend.release();

    await expect(thread.thread.pending).toHaveCount(0);
    const sent = thread.thread.mine.last();
    await expect(thread.thread.bubbleOf(sent)).toHaveText(REPLY);
    await expect(thread.thread.metaOf(sent)).toHaveText('You · Today, 10:00 a.m.');
    await expect(thread.thread.replyField).toBeFocused();
    await expect(thread.thread.replyField).not.toHaveAttribute('readonly');
    const toast = thread.toasts.withTitle('Reply sent');
    await expect(thread.toasts.textOf(toast)).toHaveText('Pelau House will get an email.');
    const requests = (await backend.requests()).filter((r) => r.method === 'POST' && r.path.endsWith('/messages'));
    expect(requests.map((r) => r.body)).toEqual([{ text: REPLY }]);
  });

  test('L2-031.3: a new message moves the enquiry to the top of the inbox', async ({ page, backend }) => {
    const thread = new ThreadPage(page);
    await thread.open(await enquiryId(backend, 'sugar-dumplin'));
    await expect(thread.enquiries.names()).toHaveText(['Unread. Pelau House', 'Sugar Dumplin', 'Demerara Kitchen', 'Ti Kay']);

    await thread.thread.reply('Could you also do a few coconut tarts without nuts?');

    await expect(thread.thread.mine).toHaveCount(1);
    await expect(thread.enquiries.names()).toHaveText(['Sugar Dumplin', 'Unread. Pelau House', 'Demerara Kitchen', 'Ti Kay']);
  });

  test('L2-032.2 L2-068.3 message AC-13: a reply over 2,000 characters is not sent and the text is kept', async ({ page, backend }) => {
    const thread = new ThreadPage(page);
    await thread.open(await enquiryId(backend, 'pelau-house'));
    const long = 'Two guests can’t have nuts. '.repeat(76) + 'Thanks!'.repeat(3);
    expect(long.length).toBe(2149);

    await thread.thread.reply(long);

    await expect(thread.thread.replySummary).toBeFocused();
    await expect(thread.thread.replySummary.getByRole('heading')).toHaveText('Your reply wasn’t sent');
    await expect(thread.thread.replySummary.getByRole('link')).toHaveText('Keep your reply under 2,000 characters. It’s 2,149 now.');
    await expect(thread.thread.replyField).toHaveAttribute('aria-invalid', 'true');
    await expect(thread.thread.replyField).toHaveAttribute('aria-describedby', 'reply-error reply-count');
    await expect(thread.thread.replyError).toHaveText('Keep your reply under 2,000 characters. It’s 2,149 now.');
    await expect(thread.thread.replyCounter).toHaveText('2,149 / 2,000');
    await expect(thread.thread.replyCounter).toHaveAttribute('data-over', '');
    await expect(thread.thread.replyField).toHaveValue(long);
    await expect(thread.thread.pending).toHaveCount(0);
    await thread.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.method === 'POST')).toHaveLength(0);

    await thread.thread.replySummary.getByRole('link').click();
    await expect(thread.thread.replyField).toBeFocused();
  });

  test('message AC-14: an empty reply asks for some words and sends nothing', async ({ page, backend }) => {
    const thread = new ThreadPage(page);
    await thread.open(await enquiryId(backend, 'pelau-house'));

    await thread.thread.reply('   ');

    await expect(thread.thread.replyError).toHaveText('Write a reply before sending');
    await expect(thread.thread.replySummary.getByRole('link')).toHaveText('Write a reply before sending');
    expect((await backend.requests()).filter((r) => r.method === 'POST')).toHaveLength(0);
  });

  test('message AC-16: Enter adds a line and Ctrl+Enter sends', async ({ page, backend }) => {
    const thread = new ThreadPage(page);
    await thread.open(await enquiryId(backend, 'pelau-house'));

    await thread.thread.replyField.fill('Yes please!');
    await thread.thread.replyField.press('Enter');
    await thread.thread.replyField.pressSequentially('See you then.');
    await expect(thread.thread.mine).toHaveCount(0);
    await thread.thread.replyField.press('Control+Enter');

    await expect(thread.thread.bubbleOf(thread.thread.mine.last())).toHaveText('Yes please!\nSee you then.');
  });

  test('L2-028 message AC-15: a reply that fails stays on screen with Try again, and the toast offers it too', async ({ page, backend }) => {
    const id = await enquiryId(backend, 'pelau-house');
    const thread = new ThreadPage(page);
    await thread.open(id);
    await backend.fail(`POST /api/enquiries/${id}/messages`, { network: true, times: 1 });

    await thread.thread.reply(REPLY);

    const failed = thread.thread.failed;
    await expect(thread.thread.bubbleOf(failed)).toHaveText(REPLY);
    await expect(thread.thread.metaOf(failed)).toHaveText('Not sent · Try again');
    const toast = thread.toasts.withTitle('Your reply wasn’t sent');
    await expect(toast).toHaveAttribute('role', 'alert');
    await expect(thread.toasts.textOf(toast)).toHaveText('Check your connection, then try again. Your message is still in the box.');
    await thread.expectNoAccessibilityViolations();

    await thread.toasts.action(toast, 'Try again').click();

    await expect(thread.thread.failed).toHaveCount(0);
    await expect(thread.thread.metaOf(thread.thread.mine.last())).toHaveText('You · Today, 10:00 a.m.');
    await expect(thread.thread.mine).toHaveCount(1);
  });

  test('message AC-15: Try again on the failed message sends it once', async ({ page, backend }) => {
    const id = await enquiryId(backend, 'pelau-house');
    const thread = new ThreadPage(page);
    await thread.open(id);
    await backend.fail(`POST /api/enquiries/${id}/messages`, { status: 503, times: 1 });
    await thread.thread.reply(REPLY);
    await expect(thread.thread.failed).toHaveCount(1);

    await thread.thread.failed.getByRole('button', { name: 'Try again' }).click();

    await expect(thread.thread.failed).toHaveCount(0);
    await expect(thread.thread.mine).toHaveCount(1);
    await expect(thread.thread.replyField).toBeFocused();
  });

  test('L2-030.1: when emails are running late the reply is still saved and the customer is told', async ({ page, backend }) => {
    await backend.scenario('emails-running-late');
    const thread = new ThreadPage(page);
    await thread.open(await enquiryId(backend, 'pelau-house'));

    await thread.thread.reply(REPLY);

    await expect(thread.thread.mine).toHaveCount(1);
    const toast = thread.toasts.withTitle('Emails are running late');
    await expect(thread.toasts.textOf(toast)).toHaveText('Your reply is saved. Pelau House will get the email as soon as our mail service catches up.');
    await expect(toast).toHaveClass(/toast--info/);
  });

  test('L2-033.5: a reply to an enquiry closed meanwhile is refused and the thread shows it is closed', async ({ page, backend }) => {
    const thread = new ThreadPage(page);
    await thread.open(await enquiryId(backend, 'pelau-house'));
    await expect(thread.thread.replyBox).toBeVisible();
    await backend.scenario('set-status', { customer: cast.marcia.email, caterer: 'pelau-house', status: 'Closed' });

    await thread.thread.reply(REPLY);

    await expect(thread.thread.status).toHaveText('Closed');
    await expect(thread.thread.closedNote).toHaveText('This enquiry is closed.');
    await expect(thread.thread.replyBox).toHaveCount(0);
    await expect(thread.thread.mine).toHaveCount(0);
    await expect(thread.toasts.textOf(thread.toasts.withTitle('Your reply wasn’t sent'))).toHaveText('This enquiry has closed, so no more messages can be sent.');
  });
});
