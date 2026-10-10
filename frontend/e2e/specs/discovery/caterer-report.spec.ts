import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';

const DETAILS = 'The menu lists curry goat as halal, but at our event the caterer said it wasn’t.';

test.describe('Reporting a caterer', () => {
  test('L2-054.1: a visitor reports a food safety concern without signing in and is thanked', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await expect(caterer.reportListing).toHaveAttribute('aria-haspopup', 'dialog');

    await caterer.reportListing.click();

    const report = caterer.report;
    await expect(report.description).toHaveText('Pelau House');
    await expect(report.reasons).toHaveCount(5);
    await expect(report.reason('Inaccurate information')).toBeFocused();
    await expect(report.reason('Food safety concern')).toHaveAccessibleName('Food safety concern Something that could make people ill');
    await expect(report.detailsLabel).toHaveText('Details (optional)');
    await expect(report.counter).toHaveText('0 / 1,000');
    await expect(report.details).toHaveAccessibleDescription(/The caterer never sees who reported them\./);
    await caterer.expectNoAccessibilityViolations();

    await backend.hold('POST /api/reports');
    await report.report('Food safety concern', DETAILS);

    await expect(report.counter).toHaveText('80 / 1,000');
    await expect(report.send).toHaveAttribute('aria-busy', 'true');
    await expect(report.status).toHaveText('Sending your report');
    await expect(report.reason('Other')).toBeDisabled();
    await expect(report.details).toHaveAttribute('readonly', '');
    await expect(report.cancel).toBeDisabled();
    await expect(report.close).toBeDisabled();
    await backend.release();

    await expect(report.outcomeTitle).toHaveText('Thanks — our team will look into this');
    await expect(report.outcomeText).toHaveText('We review every report. Pelau House won’t be told who sent it.');
    await expect(report.done).toBeFocused();
    await caterer.expectNoAccessibilityViolations();
    const sent = (await backend.requests()).find((r) => r.method === 'POST' && r.path === '/api/reports');
    expect(sent?.body).toMatchObject({ targetKind: 'CatererProfile', targetId: 'pelau-house', reason: 'Food safety concern', details: DETAILS, challengeToken: expect.any(String) });

    await report.done.click();
    await expect(report.dialog).toHaveCount(0);
    await expect(caterer.reportListing).toBeFocused();
  });

  test('L2-054.2: "Other" with no details is caught on the details field, which gets focus', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.reportListing.click();
    const report = caterer.report;

    await report.report('Other');

    await expect(report.detailsError).toHaveText('Tell us what’s wrong');
    await expect(report.details).toBeFocused();
    await expect(report.details).toHaveAttribute('aria-invalid', 'true');
    await expect(report.detailsLabel).toHaveText('Details (needed for “Other”)');
    await caterer.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.path === '/api/reports')).toHaveLength(0);
  });

  test('a report with no reason chosen asks for one', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.reportListing.click();
    const report = caterer.report;

    await report.send.click();

    await expect(report.reasonError).toHaveText('Choose a reason');
    await expect(report.reason('Fake or spam')).toHaveAttribute('aria-invalid', 'true');
    await expect(report.reason('Inaccurate information')).toBeFocused();
    expect((await backend.requests()).filter((r) => r.path === '/api/reports')).toHaveLength(0);
  });

  test('when sending fails the choices are kept and the report can be sent again', async ({ page, backend }) => {
    await backend.fail('POST /api/reports', { status: 500, times: 1 });
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.reportListing.click();
    const report = caterer.report;

    await report.report('Food safety concern', DETAILS);

    await expect(report.alert).toContainText('Your report wasn’t sent');
    await expect(report.alert).toContainText('Something went wrong on our side. Try again in a moment.');
    await expect(report.reason('Food safety concern')).toBeChecked();
    await expect(report.details).toHaveValue(DETAILS);
    await caterer.expectNoAccessibilityViolations();

    await report.tryAgain.click();
    await expect(report.outcomeTitle).toHaveText('Thanks — our team will look into this');
  });

  test('L2-054.3: a sixth report from one connection within an hour is refused and the details are kept', async ({ page, backend }) => {
    await backend.scenario('reports-from-this-connection', { count: 5 });
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.reportListing.click();
    const report = caterer.report;

    await report.report('Inaccurate information', 'The areas list Ajax but they told us they don’t go east of Pickering.');

    await expect(report.alert).toContainText('Too many reports from this connection');
    await expect(report.alert).toContainText('Try again in an hour. Your details are still here.');
    await expect(report.details).toHaveValue('The areas list Ajax but they told us they don’t go east of Pickering.');
    await expect(report.send).toBeDisabled();
  });

  test('L2-054.4: a signed-in customer with an open report on this caterer is told so, and nothing new is created', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.reportListing.click();
    const report = caterer.report;
    const before = (await backend.state()).reports.length;

    await report.report('Inaccurate information');

    await expect(report.outcomeTitle).toHaveText('You’ve already reported this');
    await expect(report.outcomeText).toHaveText('Your report from Thu 8 Oct is still with our team. We’ll email you when it’s been reviewed.');
    await expect(report.done).toBeFocused();
    expect((await backend.state()).reports.length).toBe(before);
  });

  test('Escape closes the dialog and returns focus to "Report this listing"', async ({ page }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.reportListing.click();
    await expect(caterer.report.reason('Inaccurate information')).toBeFocused();

    await page.keyboard.press('Escape');

    await expect(caterer.report.dialog).toHaveCount(0);
    await expect(caterer.reportListing).toBeFocused();
  });
});
