import { test, expect } from '../../support/test';
import { ThreadPage } from '../../pages/thread.page';
import { cast } from '../../support/cast';
import type { Backend } from '../../support/backend';

async function openPelau(backend: Backend, thread: ThreadPage): Promise<string> {
  const { id } = await backend.scenario('enquiry-id', { customer: cast.marcia.email, caterer: 'pelau-house' });
  await thread.open(id);
  await expect(thread.thread.replyBox).toBeVisible();
  return id;
}

test.describe('Closing an enquiry', () => {
  test.beforeEach(async ({ backend }) => {
    await backend.signInAs('marcia');
  });

  test('L2-067.4: the close dialog says what closing means, starts on "Keep it open" and Escape returns focus', async ({ page, backend }) => {
    const thread = new ThreadPage(page);
    await openPelau(backend, thread);

    await thread.thread.action('Close enquiry').click();

    await expect(thread.closeDialog.dialog).toBeVisible();
    await expect(thread.closeDialog.description).toHaveText('You and Pelau House won’t be able to send more messages. The conversation stays in your inbox.');
    await expect(thread.closeDialog.icon).toHaveClass(/dialog__icon--danger/);
    await expect(thread.closeDialog.button('Keep it open')).toBeFocused();
    await expect(thread.closeDialog.button('Close enquiry')).toHaveClass(/btn--danger/);
    await thread.expectNoAccessibilityViolations();

    await page.keyboard.press('Escape');

    await expect(thread.closeDialog.dialog).toBeHidden();
    await expect(thread.thread.action('Close enquiry')).toBeFocused();
    await expect(thread.thread.status).toHaveText('Replied');
  });

  test('L2-033: closing shows the dialog busy, then the thread closed with no way to reply', async ({ page, backend }) => {
    const thread = new ThreadPage(page);
    const id = await openPelau(backend, thread);
    await backend.hold(`POST /api/enquiries/${id}/close`);
    await thread.thread.action('Close enquiry').click();

    await thread.closeDialog.button('Close enquiry').click();

    await expect(thread.closeDialog.panel).toHaveAttribute('aria-busy', 'true');
    await expect(thread.closeDialog.busyStatus).toHaveText('Closing the enquiry');
    await expect(thread.closeDialog.button('Close enquiry')).toHaveAttribute('aria-busy', 'true');
    await expect(thread.closeDialog.button('Keep it open')).toBeDisabled();
    await expect(thread.closeDialog.closeButton).toBeDisabled();
    await thread.expectNoAccessibilityViolations();

    await backend.release();

    await expect(thread.closeDialog.dialog).toBeHidden();
    await expect(thread.thread.status).toHaveText('Closed');
    await expect(thread.thread.system.last()).toContainText('Marcia Thompson closed this enquiry');
    await expect(thread.thread.closedNote).toHaveText('This enquiry is closed.');
    await expect(thread.thread.replyBox).toHaveCount(0);
    await expect(thread.thread.actions).toHaveCount(0);
    await expect(thread.thread.heading).toBeFocused();
    await expect(thread.enquiries.statusOf(thread.enquiries.row('Pelau House'))).toHaveText('Closed');
  });

  test('when closing fails the enquiry stays open and the customer can try again', async ({ page, backend }) => {
    const thread = new ThreadPage(page);
    const id = await openPelau(backend, thread);
    await backend.fail(`POST /api/enquiries/${id}/close`, { status: 500, times: 1 });
    await thread.thread.action('Close enquiry').click();

    await thread.closeDialog.button('Close enquiry').click();

    await expect(thread.closeDialog.alert).toHaveAttribute('role', 'alert');
    await expect(thread.closeDialog.alert).toContainText('We couldn’t close the enquiry');
    await expect(thread.closeDialog.alert).toContainText('It’s still open. Check your connection and try again.');
    await expect(thread.closeDialog.button('Keep it open')).toBeEnabled();
    await thread.expectNoAccessibilityViolations();

    await thread.closeDialog.button('Try again').click();

    await expect(thread.closeDialog.dialog).toBeHidden();
    await expect(thread.thread.status).toHaveText('Closed');
  });
});

test.describe('Sharing contact details', () => {
  test.beforeEach(async ({ backend }) => {
    await backend.signInAs('marcia');
  });

  test('L2-035: the share dialog shows exactly what Pelau House will see, in this enquiry only', async ({ page, backend }) => {
    const thread = new ThreadPage(page);
    await openPelau(backend, thread);

    await thread.thread.action('Share my contact details').click();

    await expect(thread.shareDialog.dialog).toBeVisible();
    await expect(thread.shareDialog.description).toHaveText(
      'Your email and phone will show to Pelau House in this enquiry only. Other caterers and other enquiries stay private. You can’t take this back.',
    );
    await expect(thread.shareDialog.icon).toHaveClass(/dialog__icon--info/);
    await expect(thread.shareDialog.card).toHaveText(['Pelau House will seemarcia.t@example.com+1 647 555 0187']);
    await expect(thread.shareDialog.button('Cancel')).toBeFocused();
    await thread.expectNoAccessibilityViolations();

    await thread.shareDialog.button('Cancel').click();
    await expect(thread.shareDialog.dialog).toBeHidden();
    await expect(thread.thread.action('Share my contact details')).toBeFocused();
  });

  test('L2-035.2: after sharing, the thread records it and shows the details shared', async ({ page, backend }) => {
    const thread = new ThreadPage(page);
    const id = await openPelau(backend, thread);
    await backend.hold(`POST /api/enquiries/${id}/contact-shares`);
    await thread.thread.action('Share my contact details').click();

    await thread.shareDialog.button('Share details').click();

    await expect(thread.shareDialog.busyStatus).toHaveText('Sharing your contact details');
    await expect(thread.shareDialog.button('Share details')).toHaveAttribute('aria-busy', 'true');
    await expect(thread.shareDialog.button('Cancel')).toBeDisabled();
    await backend.release();

    await expect(thread.shareDialog.dialog).toBeHidden();
    await expect(thread.thread.sharedStatus).toHaveText('Contact details shared');
    await expect(thread.thread.action('Share my contact details')).toHaveCount(0);
    await expect(thread.thread.system.last()).toContainText('You shared your contact details with Pelau House');
    await expect(thread.thread.contactCards).toHaveText(['Your details, visible to Pelau House in this enquirymarcia.t@example.com+1 647 555 0187']);
    await expect(thread.thread.privateNote).toHaveCount(0);
    await expect(thread.toasts.textOf(thread.toasts.withTitle('Contact details shared'))).toHaveText('Pelau House can now see your email and phone in this enquiry.');
    await thread.expectNoAccessibilityViolations();
  });

  test('when sharing fails nothing is shared and the customer can try again', async ({ page, backend }) => {
    const thread = new ThreadPage(page);
    const id = await openPelau(backend, thread);
    await backend.fail(`POST /api/enquiries/${id}/contact-shares`, { network: true, times: 1 });
    await thread.thread.action('Share my contact details').click();

    await thread.shareDialog.button('Share details').click();

    await expect(thread.shareDialog.alert).toContainText('We couldn’t share your details');
    await expect(thread.shareDialog.alert).toContainText('Nothing was shared. Check your connection and try again.');
    await expect(thread.shareDialog.card).toBeVisible();
    await thread.expectNoAccessibilityViolations();

    await thread.shareDialog.button('Try again').click();
    await expect(thread.shareDialog.dialog).toBeHidden();
    await expect(thread.thread.sharedStatus).toHaveText('Contact details shared');
  });

  test('L2-035.4: when the caterer shares, the customer sees the business email and phone in that thread', async ({ page, backend }) => {
    await backend.scenario('share-contact', { customer: cast.marcia.email, caterer: 'pelau-house', by: 'caterer' });
    const thread = new ThreadPage(page);

    await openPelau(backend, thread);

    await expect(thread.thread.system.last()).toContainText('Pelau House shared their contact details');
    await expect(thread.thread.contactCards).toHaveText(['Pelau Househello@pelauhouse.example+1 416 555 0142']);
    await expect(thread.thread.action('Share my contact details')).toBeVisible();
    await thread.expectNoAccessibilityViolations();
  });
});
