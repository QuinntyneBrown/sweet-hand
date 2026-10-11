import { test, expect } from '../../../support/test';
import { OperatorAuditPage } from '../../../pages/operator-audit.page';
import { OperatorCuisinesPage } from '../../../pages/operator-cuisines.page';

test.describe('Audit log', () => {
  test('L2-060.3: an Admin reads the past week newest first, with operator, action, target, reason and the change', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const audit = new OperatorAuditPage(page);

    await audit.open();

    await expect(audit.heading).toHaveText('Audit log');
    await expect(audit.subtitle).toHaveText('Append-only · newest first · kept for 7 years');
    await expect(audit.operatorFilter).toHaveValue('');
    await expect(audit.operatorFilter.locator('option')).toHaveText(['All operators', 'Leah Mohammed', 'Tomas Reyes']);
    await expect(audit.actionFilter.locator('option').first()).toHaveText('All actions');
    await expect(audit.fromFilter).toHaveValue('2026-10-03');
    await expect(audit.toFilter).toHaveValue('2026-10-10');
    await expect(audit.resultCount).toHaveText('9 entries from 3 Oct to 10 Oct 2026 · times in Toronto');
    await expect(audit.headers).toHaveText(['When', 'Operator', 'Action', 'Target', 'Reason', 'Before → after']);
    await expect(audit.column('When')).toHaveText([
      'Today, 9:12 a.m.',
      'Today, 8:47 a.m.',
      'Fri 9 Oct, 4:30 p.m.',
      'Fri 9 Oct, 11:05 a.m.',
      'Wed 7 Oct, 10:00 a.m.',
      'Tue 6 Oct, 11:42 a.m.',
      'Mon 5 Oct, 3:15 p.m.',
      'Mon 5 Oct, 2:15 p.m.',
      'Mon 5 Oct, 9:00 a.m.',
    ]);
    await expect(audit.times.first()).toHaveAttribute('datetime', '2026-10-10T13:12:00.000Z');
    await expect(audit.column('Operator').first()).toHaveText('Tomas Reyes');
    await expect(audit.column('Action')).toHaveText([
      'Hide review',
      'Open enquiry',
      'Suspend',
      'Approve',
      'Edit',
      'Revert',
      'Request changes',
      'Resolve report',
      'Operator account',
    ]);
    await expect(audit.column('Target').first()).toContainText('Review of Maracas Bay by Devon W.');
    await expect(audit.targetIds.first()).toHaveText('review-devon-maracas-hidden');
    await expect(audit.column('Reason').first()).toHaveText('Personal attack on staff, 3 reports');
    await expect(audit.column('Change')).toHaveText([
      'Published → Hidden',
      '—No change',
      'Published → Suspended',
      'Pending review → Published',
      '“…call 416-555-0170…” → “…”',
      'Edited → previous text',
      'Pending review → Changes requested',
      'Open → Dismissed',
      '— → Operator',
    ]);
    await expect(audit.region).toHaveAttribute('tabindex', '0');
    await expect(audit.editOrDeleteControls).toHaveCount(0);
    await expect(audit.currentSideNavLink).toHaveText('Audit log');
    await audit.expectNoAccessibilityViolations();
  });

  test('L2-060.3: entries filter by operator, action, target and date range; the filters live in the address', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const audit = new OperatorAuditPage(page);
    await audit.open();

    await audit.operatorFilter.selectOption({ label: 'Tomas Reyes' });
    await audit.actionFilter.selectOption({ label: 'Hide review' });
    await audit.apply.click();

    await expect(page).toHaveURL(/operator=user-tomas/);
    await expect(audit.resultCount).toHaveText('1 entry from 3 Oct to 10 Oct 2026 · times in Toronto');
    await expect(audit.column('Action')).toHaveText(['Hide review']);

    await audit.operatorFilter.selectOption({ label: 'All operators' });
    await audit.actionFilter.selectOption({ label: 'All actions' });
    await audit.targetFilter.fill('coconut drops');
    await audit.apply.click();
    await expect(audit.column('Target')).toHaveText(['Coconut Drops Bakerycat-020']);

    await audit.targetFilter.fill('');
    await audit.fromFilter.fill('2026-10-09');
    await audit.toFilter.fill('2026-10-09');
    await audit.apply.click();
    await expect(audit.resultCount).toHaveText('2 entries from 9 Oct to 9 Oct 2026 · times in Toronto');
    await expect(audit.column('Action')).toHaveText(['Suspend', 'Approve']);

    await page.reload();
    await expect(audit.fromFilter).toHaveValue('2026-10-09');
    await expect(audit.rows).toHaveCount(2);
  });

  test('when no entry matches, the filters stay and can be cleared', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const audit = new OperatorAuditPage(page);
    await audit.open('?operator=user-tomas&action=Remove');

    await expect(audit.resultCount).toHaveText('No entries match these filters');
    await expect(audit.emptyTitle).toHaveText('No entries match');
    await expect(audit.emptyText).toHaveText('Tomas Reyes hasn’t removed anything between 3 Oct and 10 Oct 2026.');
    await expect(audit.operatorFilter).toHaveValue('user-tomas');
    await expect(audit.table).toHaveCount(0);
    await audit.expectNoAccessibilityViolations();

    await audit.link('Clear filters').click();

    await expect(audit.rows).toHaveCount(9);
    await expect(audit.operatorFilter).toHaveValue('');
  });

  test('a long log pages through 20 entries at a time and nothing breaks at phone width', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.scenario('audit-long');
    const audit = new OperatorAuditPage(page);
    await audit.usePhone();

    await audit.open('?from=2025-10-10&to=2026-10-10&page=3');

    await expect(audit.resultCount).toHaveText('1,284 entries from 10 Oct 2025 to 10 Oct 2026 · times in Toronto');
    await expect(audit.rows).toHaveCount(20);
    await expect(audit.pageSummary).toHaveText('Showing 41–60 of 1,284');
    await expect(audit.pageLink(3)).toHaveAttribute('aria-current', 'page');
    await audit.expectNoHorizontalScroll();
    await audit.expectNoAccessibilityViolations();

    await audit.pageLink(1).click();

    await expect(page).toHaveURL(/page=1/);
    await expect(audit.pageSummary).toHaveText('Showing 1–20 of 1,284');
  });

  test('a brand-new platform with no entries says what will be recorded', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.scenario('audit-empty');
    const audit = new OperatorAuditPage(page);

    await audit.open();

    await expect(audit.emptyTitle).toHaveText('No entries yet');
    await expect(audit.emptyText).toHaveText('Every approval, edit, suspension, moderation decision and enquiry access is recorded here, permanently.');
    await expect(audit.link('Go to the review queue')).toHaveAttribute('href', '/admin/queue');
    await expect(audit.filters).toHaveCount(0);
    await audit.expectNoAccessibilityViolations();
  });

  test('while entries load, the filters stay and the table shows skeleton rows', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('GET /api/operator/audit-log*');
    const audit = new OperatorAuditPage(page);

    await audit.open();

    await expect(audit.skeletonRows).toHaveCount(8);
    await expect(audit.loadingStatus).toHaveText('Loading audit entries');
    await expect(audit.filters).toBeVisible();
    await audit.expectNoAccessibilityViolations();
    await backend.release();
    await expect(audit.rows).toHaveCount(9);
  });

  test('when the log fails to load, the filters are kept and a retry is offered', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const audit = new OperatorAuditPage(page);
    await audit.open();
    await expect(audit.rows).toHaveCount(9);
    await backend.fail('GET /api/operator/audit-log*', { status: 500, times: 1, body: { title: 'Server error', correlationId: '51cd-88e3-0a19' } });

    await audit.operatorFilter.selectOption({ label: 'Leah Mohammed' });
    await audit.apply.click();

    await expect(audit.errorState).toHaveAttribute('role', 'alert');
    await expect(audit.emptyTitle).toHaveText('We couldn’t load the audit log');
    await expect(audit.emptyText).toHaveText('Your filters are kept. Nothing in the log has changed. Try again.');
    await expect(audit.reference).toHaveText('Reference 51cd-88e3-0a19');
    await expect(audit.link('Back to the queue')).toHaveAttribute('href', '/admin/queue');
    await expect(audit.operatorFilter).toHaveValue('user-leah');
    await audit.expectNoAccessibilityViolations();

    await audit.button('Try again').click();

    await expect(audit.rows).toHaveCount(7);
  });

  test('L2-056.5: an operator without Admin is told who to ask and never receives log data; the attempt is logged', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const audit = new OperatorAuditPage(page);

    await audit.open();

    await expect(audit.heading).toHaveText('Only Admins can see the audit log');
    await expect(audit.emptyText).toHaveText('You’re signed in as Tomas Reyes, an operator. Ask Leah Mohammed, an Admin, if you need an entry checked.');
    await expect(audit.link('Back to the queue')).toHaveAttribute('href', '/admin/queue');
    await expect(audit.filters).toHaveCount(0);
    await expect(audit.table).toHaveCount(0);
    await expect(audit.sideNavLink('Audit log')).toHaveCount(0);
    await audit.expectNoAccessibilityViolations();
    const { operatorSettings } = await backend.state();
    expect(operatorSettings.securityEvents).toMatchObject([{ userId: 'user-tomas', path: '/api/operator/audit-log' }]);
  });

  test('L2-060: an operator’s change to the cuisine list appears at the top of the log', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const cuisines = new OperatorCuisinesPage(page);
    await cuisines.open();
    await cuisines.addButton.click();
    await cuisines.addDialog.field('Cuisine name').fill('Caymanian');
    await cuisines.addDialog.button('Add cuisine').click();
    await expect(cuisines.addDialog.root).toBeHidden();

    const audit = new OperatorAuditPage(page);
    await audit.open();

    await expect(audit.column('When').first()).toHaveText('Today, 10:00 a.m.');
    await expect(audit.column('Operator').first()).toHaveText('Leah Mohammed');
    await expect(audit.column('Action').first()).toHaveText('Add cuisine');
    await expect(audit.column('Target').first()).toHaveText('Caymaniancaymanian');
    await expect(audit.column('Change').first()).toHaveText('— → Caymanian');
  });
});
