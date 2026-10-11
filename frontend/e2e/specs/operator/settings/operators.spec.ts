import { test, expect, TODAY } from '../../../support/test';
import { Backend, SESSION_HEADER } from '../../../support/backend';
import { OperatorAccountsPage } from '../../../pages/operator-accounts.page';
import { OperatorConsolePage } from '../../../pages/operator-console.page';

test.describe('Operator accounts', () => {
  test('L2-056: an Admin sees every operator with role, second step and last activity; only others can be deactivated', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const operators = new OperatorAccountsPage(page);

    await operators.open();

    await expect(operators.heading).toHaveText('Operators');
    await expect(operators.subtitle).toHaveText('2 operators · two-step verification for everyone');
    await expect(operators.names).toHaveText(['Leah Mohammed You', 'Tomas Reyes']);
    await expect(operators.metas).toHaveText(['Admin · Authenticator app · Active now', 'Operator · Security key · Last active today, 8:15 a.m.']);
    await expect(operators.avatars).toHaveText(['LM', 'TR']);
    await expect(operators.row('Leah Mohammed').getByRole('button')).toHaveCount(0);
    await expect(operators.deactivateButton('Tomas Reyes')).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(operators.note).toHaveText('Operators can’t sign up themselves. Every change here is written to the audit log.');
    await expect(operators.link('audit log')).toHaveAttribute('href', '/admin/audit');
    await expect(operators.currentSideNavLink).toHaveText('Operators');
    await operators.expectNoAccessibilityViolations();
  });

  test('L2-064.2: the operator list works at phone width', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const operators = new OperatorAccountsPage(page);
    await operators.usePhone();

    await operators.open();

    await expect(operators.rows).toHaveCount(2);
    await operators.expectNoHorizontalScroll();
    await operators.expectNoAccessibilityViolations();
  });

  test('L2-056.5: an operator without Admin who opens Operators is told who to ask, inside the console, and the attempt is logged', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const operators = new OperatorAccountsPage(page);

    await operators.open();

    await expect(operators.heading).toHaveText('Operators');
    await expect(operators.subtitle).toHaveText('Admins only');
    await expect(operators.emptyTitle).toHaveText('Only Admins can manage operators');
    await expect(operators.emptyText).toHaveText('Ask Leah Mohammed, an Admin, to add or deactivate an operator.');
    await expect(operators.link('Back to review queue')).toHaveAttribute('href', '/admin/queue');
    await expect(operators.list).toHaveCount(0);
    await expect(operators.addButton).toHaveCount(0);
    await expect(operators.sideNavLink('Operators')).toHaveCount(0);
    await operators.expectNoAccessibilityViolations();
    const state = await backend.state();
    // Every refused request is an authorization-failure security event (L2-079.4, L2-084).
    const refused = state.securityEvents.filter((e: { type: string }) => e.type === 'authorization-failure');
    expect(refused).toMatchObject([{ userId: 'user-tomas', path: '/api/operator/accounts' }]);
  });

  test('while the list loads, avatar and text skeletons stand in', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('GET /api/operator/accounts');
    const operators = new OperatorAccountsPage(page);

    await operators.open();

    await expect(operators.loadingList.locator('li.admin-row--skeleton')).toHaveCount(2);
    await expect(operators.loadingList.locator('.avatar.skeleton')).toHaveCount(2);
    await expect(operators.loadingStatus).toHaveText('Loading operators');
    await operators.expectNoAccessibilityViolations();
    await backend.release();
    await expect(operators.rows).toHaveCount(2);
  });

  test('when the list fails to load, no account changes and a retry is offered', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('GET /api/operator/accounts', { status: 500, times: 1 });
    const operators = new OperatorAccountsPage(page);

    await operators.open();

    await expect(operators.errorState).toHaveAttribute('role', 'alert');
    await expect(operators.emptyTitle).toHaveText('We couldn’t load the operator list');
    await expect(operators.emptyText).toHaveText('No accounts were changed. Try again, or check the audit log for recent operator changes.');
    await expect(operators.subtitle).toHaveText('Two-step verification for everyone');
    await operators.expectNoAccessibilityViolations();

    await operators.button('Try again').click();

    await expect(operators.rows).toHaveCount(2);
  });
});

test.describe('Add an operator', () => {
  test('add-operator dialog: name, work email and role, with Operator chosen as the least privilege', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const operators = new OperatorAccountsPage(page);
    await operators.open();

    await operators.addButton.click();

    const dialog = operators.addDialog;
    await expect(dialog.description).toHaveText('Invite someone from the Sweet Hand team.');
    await expect(dialog.field('Full name')).toBeFocused();
    await expect(dialog.field('Work email')).toHaveAttribute('type', 'email');
    await expect(dialog.radio('Operator Reviews profiles, reviews and reports')).toBeChecked();
    await expect(dialog.radio('Admin Also manages operators and the full audit log')).not.toBeChecked();
    await expect(dialog.body).toContainText('They set a password and a second step (authenticator app or security key) the first time they sign in.');
    await operators.expectNoAccessibilityViolations();
  });

  test('L2-056: only an Admin creates an operator; the invitation shows in the list and the audit log', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const operators = new OperatorAccountsPage(page);
    await operators.open();
    await operators.addButton.click();
    const dialog = operators.addDialog;

    await dialog.field('Full name').fill('Ayesha Khan');
    await dialog.field('Work email').fill('ayesha.khan@sweethand.example');
    await dialog.button('Send invitation').click();

    await expect(dialog.root).toBeHidden();
    await expect(operators.toast).toContainText('Invitation sent');
    await expect(operators.toast).toContainText('Ayesha Khan has 24 hours to accept it at ayesha.khan@sweethand.example.');
    await expect(operators.names).toHaveText(['Leah Mohammed You', 'Tomas Reyes', 'Ayesha Khan Invited']);
    await expect(operators.row('Ayesha Khan').locator('.admin-row__meta')).toHaveText('Operator · Invited today, 10:00 a.m. · the link works for 24 hours');
    await operators.expectNoAccessibilityViolations();
    const { audit } = await backend.state();
    expect(audit.at(-1)).toMatchObject({ operatorId: 'user-leah', action: 'CreateOperator', targetType: 'operator', before: null, after: 'Operator' });
  });

  test('L2-068.3: an incomplete email is refused with a summary; the role stays on Operator', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const operators = new OperatorAccountsPage(page);
    await operators.open();
    await operators.addButton.click();
    const dialog = operators.addDialog;

    await dialog.field('Full name').fill('Ayesha Khan');
    await dialog.field('Work email').fill('ayesha.khan@sweethand');
    await dialog.button('Send invitation').click();

    await expect(dialog.errorSummary).toBeFocused();
    await expect(dialog.errorSummary.getByRole('heading')).toHaveText('Fix 1 thing to send the invitation');
    await expect(dialog.summaryLinks).toHaveText(['Enter an email address like name@example.com']);
    await expect(dialog.field('Work email')).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.radio('Operator Reviews profiles, reviews and reports')).toBeChecked();
    await operators.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.method === 'POST' && r.path === '/api/operator/accounts')).toHaveLength(0);

    await dialog.field('Full name').fill('');
    await dialog.field('Work email').fill('');
    await dialog.button('Send invitation').click();
    await expect(dialog.summaryLinks).toHaveText(['Enter their full name', 'Enter their work email']);
  });

  test('while the invitation is sent, the dialog is busy; when it fails, the entries are kept', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('POST /api/operator/accounts');
    const operators = new OperatorAccountsPage(page);
    await operators.open();
    await operators.addButton.click();
    const dialog = operators.addDialog;
    await dialog.field('Full name').fill('Ayesha Khan');
    await dialog.field('Work email').fill('ayesha.khan@sweethand.example');

    await dialog.button('Send invitation').click();

    await expect(dialog.button('Send invitation')).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.field('Full name')).toHaveAttribute('readonly', '');
    await expect(dialog.radio('Admin Also manages operators and the full audit log')).toBeDisabled();
    await expect(dialog.cancel).toBeDisabled();
    await expect(dialog.close).toBeDisabled();
    await expect(dialog.status).toHaveText('Sending the invitation');

    await backend.release();
    await expect(dialog.root).toBeHidden();

    await backend.fail('POST /api/operator/accounts', { status: 500, times: 1 });
    await operators.addButton.click();
    await dialog.field('Full name').fill('Marlon Gittens');
    await dialog.field('Work email').fill('marlon.g@sweethand.example');
    await dialog.radio('Admin Also manages operators and the full audit log').check();
    await dialog.button('Send invitation').click();

    await expect(dialog.failure).toHaveAttribute('role', 'alert');
    await expect(dialog.failure).toContainText('We couldn’t send the invitation');
    await expect(dialog.failure).toContainText('No account was created. Your entries are kept; try again.');
    await expect(dialog.field('Work email')).toHaveValue('marlon.g@sweethand.example');
    await expect(dialog.radio('Admin Also manages operators and the full audit log')).toBeChecked();
    await operators.expectNoAccessibilityViolations();
  });
});

test.describe('Deactivate an operator', () => {
  test('deactivate-operator dialog: the danger button stays unavailable until the name is typed', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const operators = new OperatorAccountsPage(page);
    await operators.open();

    await operators.deactivateButton('Tomas Reyes').click();

    const dialog = operators.deactivateDialog('Tomas Reyes');
    await expect(dialog.description).toHaveText('Tomas is signed out everywhere within 60 seconds and can’t sign in again.');
    await expect(dialog.body).toContainText('Their past actions stay in the audit log.');
    await expect(dialog.field('Type Tomas Reyes to confirm')).toBeFocused();
    await expect(dialog.button('Deactivate')).toHaveAttribute('aria-disabled', 'true');
    await operators.expectNoAccessibilityViolations();

    await dialog.button('Deactivate').click({ force: true });
    await expect(dialog.root).toBeVisible();
    await dialog.field('Type Tomas Reyes to confirm').fill('tomas reyes');

    await expect(dialog.button('Deactivate')).not.toHaveAttribute('aria-disabled', 'true');
    await operators.expectNoAccessibilityViolations();
  });

  test('L2-056.4: deactivating an operator ends their sessions; their row says so', async ({ page, backend, browser, request }) => {
    const tomasContext = await browser.newContext({ extraHTTPHeaders: { [SESSION_HEADER]: backend.session } });
    const tomasBackend = new Backend(request, tomasContext, backend.session);
    await tomasBackend.signInAs('tomas');
    const tomasPage = await tomasContext.newPage();
    await tomasPage.clock.install({ time: TODAY });
    const tomasConsole = new OperatorConsolePage(tomasPage);
    await tomasConsole.open('/admin/cuisines');
    await expect(tomasConsole.sideNav).toBeVisible();

    await backend.signInAs('leah');
    const operators = new OperatorAccountsPage(page);
    await operators.open();
    await operators.deactivateButton('Tomas Reyes').click();
    const dialog = operators.deactivateDialog('Tomas Reyes');
    await dialog.field('Type Tomas Reyes to confirm').fill('Tomas Reyes');
    await dialog.button('Deactivate').click();

    await expect(dialog.root).toBeHidden();
    await expect(operators.toast).toContainText('Tomas Reyes is deactivated');
    await expect(operators.row('Tomas Reyes').locator('.admin-row__meta')).toHaveText('Operator · Deactivated today, 10:00 a.m.');
    await expect(operators.deactivateButton('Tomas Reyes')).toHaveCount(0);
    await expect(operators.subtitle).toHaveText('1 operator · two-step verification for everyone');
    const { audit } = await backend.state();
    expect(audit.at(-1)).toMatchObject({ operatorId: 'user-leah', action: 'DeactivateOperator', targetId: 'user-tomas', before: 'Operator', after: 'Deactivated' });

    await tomasConsole.open('/admin/cuisines');
    await expect(tomasPage).toHaveURL(/\/sign-in/);
    await tomasContext.close();
  });

  test('while deactivating, the dialog is busy and cannot be closed', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('POST /api/operator/accounts/user-tomas/deactivate');
    const operators = new OperatorAccountsPage(page);
    await operators.open();
    await operators.deactivateButton('Tomas Reyes').click();
    const dialog = operators.deactivateDialog('Tomas Reyes');
    await dialog.field('Type Tomas Reyes to confirm').fill('Tomas Reyes');

    await dialog.button('Deactivate').click();

    await expect(dialog.button('Deactivate')).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.field('Type Tomas Reyes to confirm')).toHaveAttribute('readonly', '');
    await expect(dialog.cancel).toBeDisabled();
    await expect(dialog.close).toBeDisabled();
    await expect(dialog.status).toHaveText('Deactivating Tomas Reyes');
    await backend.release();
    await expect(dialog.root).toBeHidden();
  });
});
