import { test, expect } from '../../../support/test';
import { OperatorBreachesPage } from '../../../pages/operator-breaches.page';
import type { ConsoleDialog } from '../../../pages/operator-screen';

const EXPORT_LINK = 'A caterer’s export link was forwarded to a family member before it expired.';
const RISK_NOTES = 'The link expired after 7 days and the download log shows one use, by the caterer’s sister.';

async function fillRecord(dialog: ConsoleDialog) {
  await dialog.field('Date confirmed').fill('2026-10-09');
  await dialog.field('What happened').fill(EXPORT_LINK);
  for (const info of ['Names', 'Email addresses', 'Event details', 'Messages']) await dialog.checkbox(info).check();
  await dialog.field('People affected').fill('1');
  await dialog.radio('Low').check();
  await dialog.field('Risk assessment').fill(RISK_NOTES);
  await dialog.radio('Not reportable: no real risk of significant harm').check();
}

test.describe('Breach register', () => {
  test('L2-075.2: any operator reads the register newest first: what happened, data and people affected, risk and decision', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const register = new OperatorBreachesPage(page);

    await register.open();

    await expect(register.heading).toHaveText('Breach register');
    await expect(register.subtitle).toHaveText('2 records · each kept for at least 24 months');
    await expect(register.titles).toHaveText(['Enquiry email sent to the wrong caterer', 'Team laptop stolen from a car']);
    await expect(register.whens).toHaveText(['Confirmed Thu 17 Sep 2026 · recorded by Leah Mohammed', 'Confirmed Tue 11 Mar 2025 · recorded by Leah Mohammed']);
    await expect(register.detail(0, 'Information involved')).toHaveText('A customer’s display name and event details (date, guests, area). No email or phone.');
    await expect(register.detail(0, 'People affected')).toHaveText('1');
    await expect(register.detail(0, 'Risk assessment')).toHaveText('Low. The other caterer confirmed they deleted the email the same day.');
    await expect(register.detail(0, 'Notification decision')).toHaveText(
      'Not reported to the Privacy Commissioner: no real risk of significant harm. The customer was told on Fri 18 Sep.',
    );
    await expect(register.detail(1, 'People affected')).toHaveText('0');
    await expect(register.recordButton).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(register.currentSideNavLink).toHaveText('Breach register');
    await register.expectNoAccessibilityViolations();
  });

  test('L2-064.2: the register reads at phone width without sideways scrolling', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const register = new OperatorBreachesPage(page);
    await register.usePhone();

    await register.open();

    await expect(register.records).toHaveCount(2);
    await register.expectNoHorizontalScroll();
    await register.expectNoAccessibilityViolations();
  });

  test('with nothing recorded, the register explains itself and offers Record a breach', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.scenario('no-breaches');
    const register = new OperatorBreachesPage(page);

    await register.open();

    await expect(register.subtitle).toHaveText('Each record is kept for at least 24 months');
    await expect(register.emptyTitle).toHaveText('No breaches recorded');
    await expect(register.emptyText).toHaveText('Record a breach of security safeguards here as soon as it’s confirmed, even if nobody needs to be told.');
    await register.expectNoAccessibilityViolations();

    await register.recordButton.click();

    await expect(register.recordDialog.root).toBeVisible();
  });

  test('while the register loads, record-shaped skeletons stand in', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('GET /api/operator/breaches');
    const register = new OperatorBreachesPage(page);

    await register.open();

    await expect(register.loadingList.locator('li.breach')).toHaveCount(2);
    await expect(register.busyIntro).toBeVisible();
    await expect(register.loadingStatus).toHaveText('Loading breach records');
    await register.expectNoAccessibilityViolations();
    await backend.release();
    await expect(register.records).toHaveCount(2);
  });

  test('when the register fails to load, it says the records are safe and offers a retry', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('GET /api/operator/breaches', { status: 500, times: 1 });
    const register = new OperatorBreachesPage(page);

    await register.open();

    await expect(register.errorState).toHaveAttribute('role', 'alert');
    await expect(register.emptyTitle).toHaveText('We couldn’t load the breach register');
    await expect(register.emptyText).toHaveText('The records are safe; only this view failed. Try again in a moment.');
    await expect(register.link('Back to review queue')).toHaveAttribute('href', '/admin/queue');
    await register.expectNoAccessibilityViolations();

    await register.button('Try again').click();

    await expect(register.records).toHaveCount(2);
  });
});

test.describe('Record a breach', () => {
  test('record-breach dialog: every field of a record, starting on the date, with the warning that records cannot be changed', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const register = new OperatorBreachesPage(page);
    await register.open();

    await register.recordButton.click();

    const dialog = register.recordDialog;
    await expect(dialog.description).toHaveText('Kept for at least 24 months. You can’t edit or delete a record later.');
    await expect(dialog.field('Date confirmed')).toBeFocused();
    await expect(dialog.field('Date confirmed')).toHaveAttribute('type', 'date');
    await expect(dialog.field('Date confirmed')).toHaveAttribute('max', '2026-10-10');
    await expect(dialog.field('People affected')).toHaveAttribute('inputmode', 'numeric');
    await expect(dialog.root.getByRole('group', { name: 'Information involved' }).getByRole('checkbox')).toHaveCount(6);
    await expect(dialog.root.getByRole('group', { name: 'Risk of significant harm' }).getByRole('radio')).toHaveCount(2);
    await expect(dialog.root.getByRole('group', { name: 'Notification decision' }).getByRole('radio')).toHaveCount(2);
    await register.expectNoAccessibilityViolations();
  });

  test('L2-075.2: a saved record holds the date, description, data and people affected, risk and decision, newest first', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const register = new OperatorBreachesPage(page);
    await register.open();
    await register.recordButton.click();

    await fillRecord(register.recordDialog);
    await register.recordDialog.button('Save record').click();

    await expect(register.recordDialog.root).toBeHidden();
    await expect(register.toast).toContainText('Breach recorded');
    await expect(register.subtitle).toHaveText('3 records · each kept for at least 24 months');
    await expect(register.titles.first()).toHaveText(EXPORT_LINK);
    await expect(register.whens.first()).toHaveText('Confirmed Fri 9 Oct 2026 · recorded by Leah Mohammed');
    await expect(register.detail(0, 'Information involved')).toHaveText('Names, email addresses, event details and messages.');
    await expect(register.detail(0, 'People affected')).toHaveText('1');
    await expect(register.detail(0, 'Risk assessment')).toHaveText(`Low. ${RISK_NOTES}`);
    await expect(register.detail(0, 'Notification decision')).toHaveText('Not reportable: no real risk of significant harm.');
    await register.expectNoAccessibilityViolations();
    const { audit } = await backend.state();
    expect(audit.at(-1)).toMatchObject({ operatorId: 'user-leah', action: 'RecordBreach', targetType: 'breach', after: EXPORT_LINK });
  });

  test('L2-068.3: missing or malformed entries are listed in a summary that takes focus, and nothing is saved', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const register = new OperatorBreachesPage(page);
    await register.usePhone();
    await register.open();
    await register.recordButton.click();
    const dialog = register.recordDialog;

    await dialog.field('Date confirmed').fill('2026-10-09');
    for (const info of ['Names', 'Email addresses', 'Event details', 'Messages']) await dialog.checkbox(info).check();
    await dialog.field('People affected').fill('about 40');
    await dialog.radio('Low').check();
    await dialog.button('Save record').click();

    await expect(dialog.errorSummary).toBeFocused();
    await expect(dialog.errorSummary.getByRole('heading')).toHaveText('Fix 3 things to save the record');
    await expect(dialog.summaryLinks).toHaveText(['Describe what happened', 'Enter the number of people affected as a whole number', 'Choose a notification decision']);
    await expect(dialog.field('What happened')).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.field('People affected')).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.radio('Report to the Privacy Commissioner and notify the people affected')).toHaveAttribute('aria-invalid', 'true');
    await register.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.method === 'POST' && r.path === '/api/operator/breaches')).toHaveLength(0);

    await dialog.summaryLinks.first().click();
    await expect(dialog.field('What happened')).toBeFocused();
  });

  test('while saving, every entry is read-only and the dialog cannot be closed', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('POST /api/operator/breaches');
    const register = new OperatorBreachesPage(page);
    await register.open();
    await register.recordButton.click();
    const dialog = register.recordDialog;
    await fillRecord(dialog);

    await dialog.button('Save record').click();

    await expect(dialog.button('Save record')).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.field('What happened')).toHaveAttribute('readonly', '');
    await expect(dialog.checkbox('Names')).toBeDisabled();
    await expect(dialog.radio('Low')).toBeDisabled();
    await expect(dialog.close).toBeDisabled();
    await expect(dialog.cancel).toBeDisabled();
    await expect(dialog.status).toHaveText('Saving the record');
    await backend.release();
    await expect(dialog.root).toBeHidden();
  });

  test('when saving fails, nothing is saved and every entry is kept for a retry', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('POST /api/operator/breaches', { status: 500, times: 1 });
    const register = new OperatorBreachesPage(page);
    await register.open();
    await register.recordButton.click();
    const dialog = register.recordDialog;
    await fillRecord(dialog);

    await dialog.button('Save record').click();

    await expect(dialog.failure).toHaveAttribute('role', 'alert');
    await expect(dialog.failure).toContainText('We couldn’t save this record');
    await expect(dialog.failure).toContainText('Nothing was saved. Everything you entered is still here; try again.');
    await expect(dialog.field('What happened')).toHaveValue(EXPORT_LINK);
    await expect(dialog.checkbox('Messages')).toBeChecked();
    await register.expectNoAccessibilityViolations();

    await dialog.button('Save record').click();

    await expect(dialog.root).toBeHidden();
    await expect(register.records).toHaveCount(3);
  });
});
