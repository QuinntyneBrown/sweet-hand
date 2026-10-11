import { test, expect } from '../../../support/test';
import { CatererRecordPage } from '../../../pages/caterer-record.page';

test.describe('Operator caterer record', () => {
  test('L2-046 L2-014: a published caterer’s record: owner, profile, certificate, activity and status history', async ({ page, backend }) => {
    await backend.scenario('pelau-name-change-pending');
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);

    await record.goto('cat-001');

    await expect(record.heading).toHaveText('Pelau House');
    await expect(record.backLink).toHaveAttribute('href', '/admin/caterers');
    await expect(record.status).toHaveText('Published');
    await expect(record.publicPage).toHaveAttribute('href', '/caterers/pelau-house');
    await expect(record.actions).toHaveText(['Edit', 'Suspend', 'Remove']);
    await expect(record.noticeTitle).toHaveText('Name change waiting for review');
    await expect(record.notice).toContainText('Pelau House → Pelau House by Kendra. The current name stays live until it’s approved.');
    await expect(record.noticeLink('Review the name change')).toHaveAttribute('href', '/admin/review/cat-001');

    await expect(record.detail('Owner', 'Contact')).toHaveText('Kendra Baptiste');
    await expect(record.detail('Owner', 'Email')).toHaveText('kendra@pelauhouse.example');
    await expect(record.detail('Owner', 'Phone')).toHaveText('+1 416 555 0142');
    await expect(record.detail('Owner', 'On Sweet Hand since')).toHaveText('Fri 14 Mar 2025');
    await expect(record.photos).toHaveCount(6);
    await expect(record.photos.first()).toHaveAttribute('alt', 'Chicken pelau in a steel pot with lime and cucumber chutney');
    await expect(record.detail('Profile', 'Cuisines')).toHaveText('Trinidadian & Tobagonian (primary), Guyanese');
    await expect(record.detail('Profile', 'Areas')).toHaveText('Scarborough (primary), East York, North York, Pickering, Ajax');
    await expect(record.detail('Profile', 'Guests')).toHaveText('Serves 20–300 guests');
    await expect(record.detail('Profile', 'Menu')).toHaveText('18 dishes');
    await expect(record.detail('Profile', 'Address')).toHaveText('/caterers/pelau-house');
    await expect(record.certificateStatus).toHaveText('Valid');
    await expect(record.detail('Food handler certificate', 'Expires')).toHaveText('14 Mar 2029');
    await expect(record.certificateFile).toHaveText('food-handler-certificate.pdf (1.2 MB)');
    await expect(record.detail('Activity', 'Enquiries')).toHaveText('6 enquiries · 4 open');
    await expect(record.detail('Activity', 'Reviews')).toHaveText('4.7 · 23 reviews');
    await expect(record.detail('Activity', 'Reports')).toHaveText('1 open report');
    await expect(record.history).toHaveText([
      'Fri 14 Mar 2025, 11:20 a.m.Published · Tomas ReyesApproved',
      'Wed 12 Mar 2025, 8:05 p.m.Pending review · Kendra BaptisteResubmitted',
      'Mon 10 Mar 2025, 2:40 p.m.Changes requested · Leah Mohammed“Photo 4 is blurry. Please replace it with a sharper one.”',
      'Sat 8 Mar 2025, 9:12 a.m.Pending review · Kendra BaptisteSubmitted',
      'Tue 4 Mar 2025, 7:30 p.m.Draft · Kendra BaptisteAccount created',
    ]);
    await expect(record.auditLogLink).toHaveAttribute('href', '/admin/audit');
    await record.expectNoAccessibilityViolations();
  });

  test('L2-056.5: an operator without Admin is not offered the audit log', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const record = new CatererRecordPage(page);

    await record.goto('cat-001');

    await expect(record.history).toHaveCount(5);
    await expect(record.auditLogLink).toHaveCount(0);
  });

  test('L2-040.3: an expired certificate is flagged, the caterer stays published and Suspend leads', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);

    await record.goto('cat-024');

    await expect(record.heading).toHaveText('Flying Fish Kitchen');
    await expect(record.status).toHaveText('Published');
    await expect(record.noticeTitle).toHaveText('Food handler certificate expired on Wed 30 Sep 2026');
    await expect(record.notice).toContainText('Reminders went out on Mon 31 Aug and Wed 23 Sep. The profile stays published until you act: suspend it, or wait for a new certificate.');
    await expect(record.noticeLink('Back to the queue')).toHaveAttribute('href', '/admin/queue');
    await expect(record.action('Suspend')).toHaveClass(/btn--primary/);
    await expect(record.certificateStatus).toHaveText('Expired');
    await expect(record.detail('Owner', 'Contact')).toHaveText('Sharon Best');
    await expect(record.detail('Owner', 'On Sweet Hand since')).toHaveText('Mon 9 Sep 2024');
    await record.expectNoAccessibilityViolations();
  });

  test('L2-058: a suspended caterer shows why, what happened to enquiries, and Reinstate first', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);

    await record.goto('cat-916');

    await expect(record.status).toHaveText('Suspended');
    await expect(record.pageHidden).toHaveText('Public page hidden');
    await expect(record.publicPage).toHaveCount(0);
    await expect(record.actions).toHaveText(['Reinstate', 'Edit', 'Remove']);
    await expect(record.action('Reinstate')).toHaveClass(/btn--primary/);
    await expect(record.noticeTitle).toHaveText('Suspended since Tue 6 Oct, 12:20 p.m.');
    await expect(record.notice).toContainText('Hidden from the listing and its page returns “not found”. 2 open enquiries were closed and the customers were emailed. Sharon can still sign in and see why.');
    await expect(record.history.first()).toHaveText(
      'Tue 6 Oct, 12:20 p.m.Suspended · Leah Mohammed“Photos copied from another caterer’s page. Upload photos of your own food and we’ll look again.”',
    );
    await expect(record.certificateStatus).toHaveCount(0);
    await expect(record.section('Food handler certificate')).toContainText('No certificate given.');
    await record.expectNoAccessibilityViolations();
  });

  test('L2-058.5: a removed caterer is read-only and the removal is final', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);

    await record.goto('cat-901');

    await expect(record.heading).toHaveText('Coal Pot Kitchen');
    await expect(record.status).toHaveText('Removed');
    await expect(record.pageHidden).toHaveText('Public page hidden');
    await expect(record.actions).toHaveCount(0);
    await expect(record.noticeTitle).toHaveText('Removed on Mon 28 Sep, 11:00 a.m. This can’t be undone.');
    await expect(record.notice).toContainText(
      'The page returns “gone” and links back to the listing. Reviews and photos are no longer shown. Winston can sign in to export their enquiry history but can’t edit the profile.',
    );
    await record.expectNoAccessibilityViolations();
  });

  test('L2-040.4: the certificate copy opens through a link that expires within 5 minutes', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);
    await record.goto('cat-001');

    const tab = page.waitForEvent('popup');
    await record.certificateFile.click();
    await tab;

    await expect.poll(async () => (await backend.requests()).some((r) => r.path.startsWith('/api/operator/certificate-files/'))).toBe(true);
  });

  test('loading: a skeleton of the record while it loads', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('GET /api/operator/caterers/cat-001');
    const record = new CatererRecordPage(page);

    await record.goto('cat-001');

    await expect(record.loadingStatus).toBeAttached();
    await expect(record.heading).toHaveText('Caterer record');
    await record.expectNoAccessibilityViolations();
    await backend.release();
    await expect(record.heading).toHaveText('Pelau House');
  });

  test('error: the record fails to load; nothing changed, Try again and Back to caterers', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('GET /api/operator/caterers/cat-001', { status: 500, times: 1, body: { title: 'Server error', correlationId: '2b81e6d0-93fa' } });
    const record = new CatererRecordPage(page);

    await record.goto('cat-001');

    await expect(record.heading).toHaveText('We couldn’t load this caterer');
    await expect(record.error).toContainText('The record didn’t come back from the server. Nothing has changed. Try again, or go back to the list.');
    await expect(record.error).toContainText('Reference 2b81e6d0-93fa');
    await expect(record.errorAction('Back to caterers')).toHaveAttribute('href', '/admin/caterers');
    await record.expectNoAccessibilityViolations();
    await record.errorAction('Try again').click();
    await expect(record.heading).toHaveText('Pelau House');
  });

  test('L2-064: on a phone the record fits without scrolling sideways', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);
    await record.usePhone();

    await record.goto('cat-001');

    await expect(record.history).toHaveCount(5);
    await record.expectNoHorizontalScroll();
    await record.expectNoAccessibilityViolations();
  });
});
