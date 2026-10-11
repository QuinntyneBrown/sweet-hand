import { test, expect } from '../../support/test';
import { DashboardPage } from '../../pages/dashboard.page';

test.describe('Submit a profile for review', () => {
  test('L2-039.2 L2-039.3: an unfinished draft is refused with every failed rule, and the checklist highlights them', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'draft' });
    await backend.signInAs('beverley');
    const dashboard = new DashboardPage(page);
    const dialog = dashboard.submitDialog;
    await dashboard.open();

    await dashboard.button('Submit for review').click();

    await expect(dialog.title).toHaveText('Your profile isn’t ready yet');
    await expect(dialog.description).toHaveText('We can only review profiles that meet every rule.');
    await expect(dialog.summaryHeading).toHaveText('2 sections still need work');
    await expect(dialog.summaryItems).toHaveText(['Add at least 3 photos (you have 2)', 'Add your food handler certificate']);
    await expect(dialog.summary.getByRole('link', { name: 'Add at least 3 photos' })).toHaveAttribute('href', '/dashboard/profile/photos');
    await expect(dialog.link('Add photos')).toBeFocused();
    await expect(dashboard.section('Photos').locator('.section-link__title')).toHaveText('Needs attention: Photos');
    await expect(dashboard.section('Food handler certificate').locator('.section-link__title')).toHaveText('Needs attention: Food handler certificate');
    const sent = (await backend.requests()).filter((r) => r.method === 'POST' && r.path === '/api/caterer/profile/submission');
    expect(sent).toHaveLength(1);
    await dashboard.expectNoAccessibilityViolations();

    await dialog.button('Close').first().click();
    await expect(dialog.root).toBeHidden();
    await expect(dashboard.button('Submit for review')).toBeFocused();
    await expect(dashboard.status).toHaveText('Draft');
  });

  test('L2-039.1: a complete draft is confirmed, sent and thanked, then read-only', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'ready' });
    await backend.signInAs('beverley');
    const dashboard = new DashboardPage(page);
    const dialog = dashboard.submitDialog;
    await dashboard.open();
    await expect(dashboard.meterLabel).toHaveText(/10 of 10 done/);

    await dashboard.button('Submit for review').click();

    await expect(dialog.title).toHaveText('Submit Auntie Bev’s Kitchen for review?');
    await expect(dialog.description).toHaveText('Our team checks every new profile within 3 business days and emails you the result.');
    await expect(dialog.body).toContainText('All 10 sections are complete.');
    await expect(dialog.button('Submit for review')).toBeFocused();
    await dashboard.expectNoAccessibilityViolations();

    await dialog.button('Not yet').click();
    await expect(dialog.root).toBeHidden();
    await expect(dashboard.status).toHaveText('Draft');

    await backend.hold('POST /api/caterer/profile/submission');
    await dashboard.button('Submit for review').click();
    await dialog.button('Submit for review').click();
    await expect(dialog.button('Submit for review')).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.button('Not yet')).toBeDisabled();
    await expect(dialog.status).toHaveText('Submitting Auntie Bev’s Kitchen for review');
    await backend.release();

    await expect(dialog.title).toHaveText('Thanks — we’ll review your profile within 3 business days');
    await expect(dialog.description).toHaveText('Your profile is now pending review.');
    await expect(dialog.timelineItems).toHaveText([
      /^Now\s*Your profile is read-only while we look at it\.$/,
      /^Within 3 business days\s*We email beverley@auntiebevs\.example with the result\.$/,
      /^Approved\s*Auntie Bev’s Kitchen appears in the listing within a minute\.$/,
    ]);
    await dashboard.expectNoAccessibilityViolations();

    await dialog.link('Back to overview').click();
    await expect(dialog.root).toBeHidden();
    await expect(dashboard.status).toHaveText('Pending review');
    await expect(dashboard.button('Withdraw submission')).toBeVisible();
  });

  test('a submission that fails to send keeps the draft and offers Try again', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'ready' });
    await backend.signInAs('beverley');
    const dashboard = new DashboardPage(page);
    const dialog = dashboard.submitDialog;
    await dashboard.open();
    await backend.fail('POST /api/caterer/profile/submission', { network: true, times: 1 });

    await dashboard.button('Submit for review').click();
    await dialog.button('Submit for review').click();

    await expect(dialog.alert).toHaveAttribute('role', 'alert');
    await expect(dialog.alert).toContainText('We couldn’t send your profile');
    await expect(dialog.alert).toContainText('The connection dropped before we got it. Your profile is still a draft and nothing is lost.');
    await dashboard.expectNoAccessibilityViolations();

    await dialog.button('Try again').click();
    await expect(dialog.title).toHaveText('Thanks — we’ll review your profile within 3 business days');
  });

  test('L2-048.3: after changes are requested the profile can be resubmitted', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'changes-requested' });
    await backend.signInAs('beverley');
    const dashboard = new DashboardPage(page);
    await dashboard.open();

    await dashboard.button('Resubmit for review').click();
    await dashboard.submitDialog.button('Submit for review').click();

    await expect(dashboard.submitDialog.title).toHaveText('Thanks — we’ll review your profile within 3 business days');
    const { caterers } = await backend.state();
    expect(caterers.find((c: { id: string }) => c.id === 'cat-bev').status).toBe('Pending review');
  });

  test('L2-039.4: withdrawing asks first, then returns the profile to draft', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'pending' });
    await backend.signInAs('beverley');
    const dashboard = new DashboardPage(page);
    const dialog = dashboard.withdrawDialog;
    await dashboard.open();

    await dashboard.button('Withdraw submission').click();

    await expect(dialog.description).toHaveText('Auntie Bev’s Kitchen goes back to draft so you can edit it. When you submit again, the 3-day review starts over.');
    await expect(dialog.button('Keep it in review')).toBeFocused();
    await dashboard.expectNoAccessibilityViolations();

    await dialog.button('Keep it in review').click();
    await expect(dialog.root).toBeHidden();
    await expect(dashboard.status).toHaveText('Pending review');

    await backend.hold('DELETE /api/caterer/profile/submission');
    await dashboard.button('Withdraw submission').click();
    await dialog.button('Withdraw submission').click();
    await expect(dialog.button('Withdraw submission')).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.button('Keep it in review')).toBeDisabled();
    await expect(dialog.status).toHaveText('Withdrawing your submission');
    await backend.release();

    await expect(dialog.root).toBeHidden();
    await expect(dashboard.status).toHaveText('Draft');
    await expect(dashboard.button('Submit for review')).toBeVisible();
  });
});
