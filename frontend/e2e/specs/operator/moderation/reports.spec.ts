import { test, expect } from '../../../support/test';
import { ReportReviewPage } from '../../../pages/report-review.page';
import { OpenEnquiryDialog } from '../../../pages/open-enquiry-dialog';
import { ResolveReportDialog } from '../../../pages/resolve-report-dialog';
import { CatererPage } from '../../../pages/caterer.page';

const REVIEW = 'Food was cold and the owner is a crook. Everybody knows that family can’t cook. Avoid.';

test.describe('Handling reports', () => {
  test('L2-055.1: reports about one review are grouped with every reason and detail, reporters unnamed', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const report = new ReportReviewPage(page);

    await report.goto('R-2041');

    await expect(report.heading).toHaveText('Report about a review of Maracas Bay');
    await expect(report.status).toHaveText('Open');
    await expect(report.subtitle).toHaveText('Report R-2041 · 2 reports · since Thu 8 Oct');
    await expect(report.backLink).toHaveAttribute('href', '/admin/queue');
    await expect(report.item).toContainText('Maracas Bay');
    await expect(report.item).toContainText('Devon W.');
    await expect(report.item).toContainText('Event in September 2026');
    await expect(report.stars).toHaveAccessibleName('1 out of 5');
    await expect(report.reviewText).toHaveText(REVIEW);
    await expect(report.itemStatus).toHaveText('Showing on Maracas Bay’s page');
    await expect(report.reports).toHaveCount(2);
    await expect(report.report(1)).toContainText('Fake or spam');
    await expect(report.report(1)).toContainText('Thu 8 Oct, 4:12 p.m. · Signed-in customer');
    await expect(report.report(1)).toContainText('This person never booked them. The same words were posted about two other caterers.');
    await expect(report.report(2)).toContainText('Fri 9 Oct, 11:30 a.m. · Visitor, not signed in');
    await expect(report.privacyNote).toHaveText('Devon W. and Maracas Bay never see who reported this.');
    await expect(report.linkedEnquiry).toContainText('Devon W. → Maracas Bay · Sat 12 Sep 2026 · 35 guests · Replied');
    await expect(report.linkedEnquiry).toContainText('Enquiries are private. Opening this one is written to the audit log.');
    expect(await page.content()).not.toContain('Priya');
    await report.expectNoAccessibilityViolations();
  });

  test('L2-055.2: a review reported 3 times in 7 days is hidden until the report is resolved', async ({ page, backend }) => {
    await backend.scenario('third-report');
    await backend.signInAs('leah');
    const report = new ReportReviewPage(page);

    await report.goto('R-2041');

    await expect(report.subtitle).toHaveText('Report R-2041 · 3 reports · since Thu 8 Oct');
    await expect(report.noticeTitle).toHaveText('Hidden from Maracas Bay’s page since 8:05 a.m.');
    await expect(report.notice).toContainText('Reported 3 times within 7 days. It stays hidden, and out of the rating, until you resolve this report. Dismissing puts it back.');
    await expect(report.itemStatus).toHaveText('Hidden automatically');
    await expect(report.report(3)).toContainText('Sat 10 Oct, 8:05 a.m. · Signed-in customer');
    await report.expectNoAccessibilityViolations();
  });

  test('a food safety report about a caterer shows its certificate and that visitors are not told the outcome', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const report = new ReportReviewPage(page);

    await report.goto('R-2047');

    await expect(report.heading).toHaveText('Report about Island Pot');
    await expect(report.subtitle).toHaveText('Report R-2047 · 1 report · since Sat 10 Oct, 4:12 a.m.');
    await expect(report.item).toContainText('Jamaican · Scarborough · Garfield Brown');
    await expect(report.itemStatus).toHaveText('Published');
    await expect(report.certificate('Certificate')).toHaveText('Valid');
    await expect(report.certificate('Issued by')).toHaveText('Toronto Public Health');
    await expect(report.certificate('Number')).toHaveText('FH-2023-552019');
    await expect(report.certificate('Expires')).toHaveText('2 Feb 2027');
    await expect(report.report(1)).toContainText('Food safety concern');
    await expect(report.report(1)).toContainText('Sat 10 Oct, 4:12 a.m. · Visitor, not signed in');
    await expect(report.privacyNote).toHaveText('Island Pot never sees who reported it. Visitors leave no email, so nobody is told the outcome.');
    await expect(report.linkedEnquiry).toHaveCount(0);
    await report.expectNoAccessibilityViolations();
  });

  test('L2-055.3: dismissing needs a note, closes the report, puts an automatically hidden review back and is audited', async ({ page, backend }) => {
    await backend.scenario('third-report');
    await backend.signInAs('leah');
    const report = new ReportReviewPage(page);
    const dialog = new ResolveReportDialog(page);
    await report.goto('R-2041');
    const audit = await backend.watchAudit();

    await report.resolve.click();

    await expect(dialog.description).toHaveText('3 reports about Devon W.’s review of Maracas Bay.');
    await expect(dialog.decision('Dismiss')).toBeChecked();
    await expect(dialog.decision('Dismiss')).toBeFocused();
    await expect(dialog.noteLabel).toHaveText('Note');
    await expect(dialog.reasonHelp).toHaveText('Kept with the report and in the audit log. Not sent to anyone.');
    await expect(dialog.caption).toHaveText('The signed-in reporter is emailed that their report was reviewed. The email doesn’t say what you decided.');
    await expect(dialog.submit).toHaveText('Dismiss and resolve');
    await report.expectNoAccessibilityViolations();
    await dialog.submit.click();
    await expect(dialog.summary.locator('h3')).toHaveText('Fix 1 thing to resolve the report');
    await expect(dialog.reasonError).toHaveText('Add a note explaining your decision');
    await report.expectNoAccessibilityViolations();

    await dialog.note.fill('The review describes a real event; Devon W.’s enquiry was replied to and the event happened.');
    await dialog.submit.click();

    await expect(dialog.dialog).toBeHidden();
    await expect(report.status).toHaveText('Resolved');
    await expect(report.noticeTitle).toHaveText('Resolved at 10:00 a.m. by Leah Mohammed: dismissed');
    await expect(report.resolve).toHaveCount(0);
    await expect(report.itemStatus).toHaveText('Showing on Maracas Bay’s page');
    const state = await backend.state();
    expect(state.reports.filter((r: { targetId: string; status: string }) => r.targetId === 'review-devon-maracas' && r.status === 'Open')).toEqual([]);
    expect(await audit.appended()).toEqual([expect.objectContaining({ action: 'DismissReports', targetType: 'report', targetId: 'R-2041' })]);
    expect(await backend.emails()).toContainEqual(expect.objectContaining({ to: 'priya.r@example.com', kind: 'report-reviewed' }));
    expect((await backend.emails()).find((e: { kind: string; reason?: string }) => e.kind === 'report-reviewed')?.reason).toBeUndefined();
  });

  test('L2-055.4 L2-055.5: taking action hides the review, links the report to it and tells the author why', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const report = new ReportReviewPage(page);
    const dialog = new ResolveReportDialog(page);
    await report.goto('R-2041');
    const audit = await backend.watchAudit();
    await report.resolve.click();

    await dialog.decision('Take action').check();

    await expect(dialog.actions).toHaveCount(2);
    await expect(dialog.action('Hide the review')).toBeChecked();
    await expect(dialog.noteLabel).toHaveText('Reason (sent to Devon W.)');
    await expect(dialog.reasonHelp).toHaveText('Devon gets an email with this reason.');
    await expect(dialog.submit).toHaveText('Hide review and resolve');
    await dialog.note.fill('Personal attack on the owner’s family, not a review of the food.');
    await dialog.submit.click();

    await expect(report.status).toHaveText('Resolved');
    await expect(report.noticeTitle).toHaveText('Resolved at 10:00 a.m. by Leah Mohammed: review hidden');
    await expect(report.notice).toContainText(
      'Reason sent to Devon W.: “Personal attack on the owner’s family, not a review of the food.” The signed-in reporter was emailed that their report was reviewed, without the outcome.',
    );
    await expect(report.notice.getByRole('link', { name: 'See the audit entry' })).toBeVisible();
    await expect(report.itemStatus).toHaveText('Hidden by an operator');
    await expect(report.openEnquiry).toHaveCount(0);
    const state = await backend.state();
    const hide = (await audit.appended()).find((a: { action: string }) => a.action === 'HideReview');
    expect(hide).toEqual(expect.objectContaining({ targetType: 'review', targetId: 'review-devon-maracas', reason: 'Personal attack on the owner’s family, not a review of the food.' }));
    expect(state.reports.find((r: { id: string }) => r.id === 'R-2041').resolution).toEqual(expect.objectContaining({ outcome: 'hidden', auditId: hide.id }));
    expect(await backend.emails()).toContainEqual(expect.objectContaining({ to: 'devon.w@example.com', kind: 'review-hidden' }));

    const caterer = new CatererPage(page);
    await caterer.open('maracas-bay');
    await expect(caterer.heading).toHaveText('Maracas Bay');
    expect(await caterer.pageMarkup()).not.toContain('owner is a crook');
  });

  test('L2-055.4: a caterer report can be resolved by suspending the caterer', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const report = new ReportReviewPage(page);
    const dialog = new ResolveReportDialog(page);
    await report.goto('R-2047');
    await report.resolve.click();

    await dialog.decision('Take action').check();
    await expect(dialog.actions).toHaveCount(2);
    await expect(dialog.action('Suspend the caterer')).toBeChecked();
    await expect(dialog.action('Remove the caterer')).toBeVisible();
    await expect(dialog.noteLabel).toHaveText('Reason (sent to Garfield)');
    await dialog.note.fill('Food safety concern under investigation after report R-2047.');
    await expect(dialog.submit).toHaveText('Suspend caterer and resolve');
    await dialog.submit.click();

    await expect(report.noticeTitle).toHaveText('Resolved at 10:00 a.m. by Leah Mohammed: caterer suspended');
    await expect(report.itemStatus).toHaveText('Suspended');
  });

  test('resolve-report failed and busy: the choice and the note are kept', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('POST /api/operator/reports/R-2041/resolve', { status: 500, times: 1 });
    const report = new ReportReviewPage(page);
    const dialog = new ResolveReportDialog(page);
    await report.goto('R-2041');
    await report.resolve.click();
    await dialog.decision('Take action').check();
    await dialog.note.fill('Personal attack on the owner’s family.');

    await dialog.submit.click();

    await expect(dialog.alert).toContainText('We couldn’t resolve this report');
    await expect(dialog.decision('Take action')).toBeChecked();
    await expect(dialog.note).toHaveValue('Personal attack on the owner’s family.');
    await backend.hold('POST /api/operator/reports/R-2041/resolve');
    await dialog.submit.click();
    await expect(dialog.submit).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.status).toHaveText('Hiding the review and resolving the report');
    await backend.release();
    await expect(report.status).toHaveText('Resolved');
  });

  test('L2-034.3: opening the linked enquiry needs a reason, shows it read-only and is audited', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const report = new ReportReviewPage(page);
    const dialog = new OpenEnquiryDialog(page);
    await report.goto('R-2041');
    const audit = await backend.watchAudit();

    await report.openEnquiry.click();

    await expect(dialog.description).toHaveText('Devon W. → Maracas Bay · Sat 12 Sep 2026');
    await expect(dialog.explanation).toHaveText('Enquiries are private between a customer and a caterer. You can open this one because it’s linked to report R-2041.');
    await expect(dialog.reason).toBeFocused();
    await dialog.submit.click();
    await expect(dialog.summary.locator('h3')).toHaveText('Fix 1 thing to open the enquiry');
    await expect(dialog.reasonError).toHaveText('Add a reason for opening this enquiry');
    await report.expectNoAccessibilityViolations();

    await dialog.reason.fill('Checking whether the event in the review happened.');
    await dialog.submit.click();

    await expect(dialog.dialog).toBeHidden();
    await expect(report.messages).toHaveCount(3);
    await expect(report.messages.first()).toContainText('we need curry duck, buss up shut and macaroni pie for 35');
    await expect(report.linkedEnquiry.getByRole('textbox')).toHaveCount(0);
    expect(await audit.appended()).toEqual([
      expect.objectContaining({ operatorId: 'user-leah', action: 'EnquiryAccess', targetType: 'enquiry', reason: 'Checking whether the event in the review happened.', after: { reportId: 'R-2041' } }),
    ]);
    await report.expectNoAccessibilityViolations();
  });

  test('open-enquiry busy: the reason is locked while the access is recorded', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('POST /api/operator/reports/R-2041/enquiry');
    const report = new ReportReviewPage(page);
    const dialog = new OpenEnquiryDialog(page);
    await report.goto('R-2041');
    await report.openEnquiry.click();
    await dialog.reason.fill('Checking whether the event happened.');

    await dialog.submit.click();

    await expect(dialog.submit).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.reason).toHaveAttribute('readonly', '');
    await expect(dialog.cancel).toBeDisabled();
    await expect(dialog.status).toHaveText('Opening the enquiry');
    await backend.release();
    await expect(report.messages).toHaveCount(3);
  });

  test('L2-034.4: an enquiry with no linked report is refused with 403', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const report = new ReportReviewPage(page);
    await report.goto('R-2041');
    await expect(report.openEnquiry).toBeVisible();
    await backend.scenario('unlink-review-enquiry');
    const audit = await backend.watchAudit();
    const dialog = new OpenEnquiryDialog(page);
    await report.openEnquiry.click();
    await dialog.reason.fill('Checking the event.');

    await dialog.submit.click();

    await expect(dialog.alert).toContainText('You can’t open this enquiry');
    await expect(dialog.alert).toContainText('No report links to it any more, so it stays private. Nothing was recorded.');
    const requests = await backend.requests();
    expect(requests.some((r) => r.path === '/api/operator/reports/R-2041/enquiry')).toBe(true);
    expect(await audit.appended()).toEqual([]);
  });

  test('loading: a skeleton of the report while it loads', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('GET /api/operator/reports/R-2041');
    const report = new ReportReviewPage(page);

    await report.goto('R-2041');

    await expect(report.loadingStatus).toBeAttached();
    await expect(report.heading).toHaveText('Report');
    await report.expectNoAccessibilityViolations();
    await backend.release();
    await expect(report.heading).toHaveText('Report about a review of Maracas Bay');
  });

  test('error: the report fails to load; nothing changed, Try again and Back to the queue', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('GET /api/operator/reports/R-2041', { status: 500, times: 1, body: { title: 'Server error', correlationId: 'c40d17ae-58b2' } });
    const report = new ReportReviewPage(page);

    await report.goto('R-2041');

    await expect(report.heading).toHaveText('We couldn’t load this report');
    await expect(report.error).toContainText('The report didn’t come back from the server. Nothing has changed. Try again, or go back to the queue.');
    await expect(report.error).toContainText('Reference c40d17ae-58b2');
    await expect(report.errorAction('Back to the queue')).toHaveAttribute('href', '/admin/queue');
    await report.expectNoAccessibilityViolations();
    await report.errorAction('Try again').click();
    await expect(report.heading).toHaveText('Report about a review of Maracas Bay');
  });

  test('L2-064: on a phone the report fits without scrolling sideways', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const report = new ReportReviewPage(page);
    await report.usePhone();

    await report.goto('R-2041');

    await expect(report.reports).toHaveCount(2);
    await report.expectNoHorizontalScroll();
    await report.expectNoAccessibilityViolations();
  });
});
