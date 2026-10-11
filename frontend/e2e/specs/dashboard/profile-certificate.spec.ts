import { test, expect } from '../../support/test';
import { ProfileCertificatePage } from '../../pages/profile-certificate.page';
import { fakeImage, jpegFile, pdfFile } from '../../pages/profile-photos.page';

test.describe('Food handler certificate', () => {
  test('L2-040 L2-065.2: the certificate details and copy, private to the caterer', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const cert = new ProfileCertificatePage(page);

    await cert.open();

    await expect(cert.heading).toHaveText('Food safety');
    await expect(cert.subtitle).toHaveText('Your food handler certificate');
    await expect(cert.status).toHaveText('Published');
    await expect(cert.privateNote).toHaveText('Only you and the Sweet Hand team see this. It never appears on your page.');
    await expect(cert.holder).toHaveValue('Kendra Baptiste');
    await expect(cert.issuer).toHaveValue('Toronto Public Health');
    await expect(cert.number).toHaveValue('FH-2024-118734');
    await expect(cert.number).toHaveAttribute('autocapitalize', 'characters');
    await expect(cert.expiry).toHaveValue('2029-03-14');
    await expect(cert.expiry).toHaveAttribute('type', 'date');
    await expect(cert.expiry).toHaveAttribute('min', '2026-10-10');
    await expect(cert.expiryHelp).toHaveText('We remind you 30 and 7 days before it expires');
    await expect(cert.fileName).toHaveText('food-handler-certificate.pdf');
    await expect(cert.fileMeta).toHaveText('PDF · 1.2 MB · uploaded Wed 2 Sep');
    await expect(cert.fileInput).toHaveAttribute('accept', 'application/pdf,image/jpeg,image/png');
    await expect(cert.savedStatus).toHaveText('Saved Wed 2 Sep');
    await cert.expectNoAccessibilityViolations();
  });

  test('L2-040.1: an expired certificate is refused', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'draft' });
    await backend.signInAs('beverley');
    const cert = new ProfileCertificatePage(page);
    await cert.open();
    await expect(cert.subtitle).toHaveText('You need a valid food handler certificate before you can submit your profile for review.');
    await expect(cert.fileRow).toHaveCount(0);

    await cert.holder.fill('Beverley Campbell');
    await cert.issuer.fill('Durham Region Health Department');
    await cert.number.fill('FH-2021-076412');
    await cert.expiry.fill('2026-06-30');
    await cert.save.click();

    await expect(cert.errorSummary).toBeFocused();
    await expect(cert.errorSummary.getByRole('heading')).toHaveText('Fix 1 thing to save');
    await expect(cert.errorSummaryLinks).toHaveText(['This certificate has expired']);
    await expect(cert.expiry).toHaveAttribute('aria-invalid', 'true');
    await expect(cert.errorFor('expiry')).toHaveText('This certificate has expired');
    await expect(cert.holder).toHaveValue('Beverley Campbell');
    await cert.expectNoAccessibilityViolations();

    await cert.errorSummaryLinks.first().click();
    await expect(cert.expiry).toBeFocused();
  });

  test('L2-040: a valid certificate saves with its copy, busy while it goes', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'draft' });
    await backend.signInAs('beverley');
    const cert = new ProfileCertificatePage(page);
    await cert.open();

    await cert.holder.fill('Beverley Campbell');
    await cert.issuer.fill('Durham Region Health Department');
    await cert.number.fill('fh-2025-204517');
    await cert.expiry.fill('2030-01-22');
    await cert.attach(jpegFile('bev-certificate.jpg', 1200, 1600));
    await expect(cert.fileName).toHaveText('bev-certificate.jpg');
    await expect(cert.fileMeta).toHaveText('JPEG · 1 KB');
    await backend.hold('PUT /api/caterer/profile/certificate');
    await cert.save.click();

    await expect(cert.save).toHaveAttribute('aria-busy', 'true');
    await expect(cert.holder).toHaveAttribute('readonly', '');
    await expect(cert.removeFile).toBeDisabled();
    await expect(cert.savingStatus).toHaveText('Saving the certificate');
    await cert.expectNoAccessibilityViolations();
    await backend.release();

    await expect(cert.savedStatus).toHaveText('Saved Sat 10 Oct');
    await expect(cert.fileMeta).toHaveText('JPEG · 1 KB · uploaded Sat 10 Oct');
    const { caterers } = await backend.state();
    expect(caterers.find((c: { id: string }) => c.id === 'cat-bev').certificate).toMatchObject({
      holder: 'Beverley Campbell',
      number: 'FH-2025-204517',
      expires: '2030-01-22',
      fileName: 'bev-certificate.jpg',
      fileType: 'JPEG',
    });
  });

  test('L2-040: a copy that is not a PDF, JPEG or PNG is refused and nothing is stored', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const cert = new ProfileCertificatePage(page);
    await cert.open();

    await cert.attach(fakeImage('scan-0412.png'));
    await cert.save.click();

    await expect(cert.fileRow).toHaveAttribute('data-state', 'failed');
    await expect(cert.fileMeta).toHaveText('This file isn’t a PDF, JPEG or PNG, so nothing was saved');
    const { caterers } = await backend.state();
    expect(caterers.find((c: { slug: string }) => c.slug === 'pelau-house').certificate.fileName).toBe('food-handler-certificate.pdf');
  });

  test('L2-040: a copy over 10 MB is refused before it is sent', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const cert = new ProfileCertificatePage(page);
    await cert.open();

    await cert.attach(pdfFile('scan.pdf', 11 * 1024 * 1024));

    await expect(cert.fileRow).toHaveAttribute('data-state', 'failed');
    await expect(cert.fileMeta).toHaveText('Certificate copies must be a PDF, JPEG or PNG of up to 10 MB');
  });

  test('the copy can be removed', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const cert = new ProfileCertificatePage(page);
    await cert.open();

    await cert.removeFile.click();
    await expect(cert.fileRow).toHaveCount(0);
    await expect(cert.fileInput).toBeFocused();
    await cert.save.click();

    await expect(cert.savedStatus).toHaveText('Saved Sat 10 Oct');
    const { caterers } = await backend.state();
    expect(caterers.find((c: { slug: string }) => c.slug === 'pelau-house').certificate.fileName).toBeUndefined();
  });

  test('L2-040.2: a certificate that expires within 30 days asks for the renewal', async ({ page, backend }) => {
    await backend.signInAs('desmond');
    const cert = new ProfileCertificatePage(page);

    await cert.open();

    await expect(cert.alert).toHaveClass(/alert--warning/);
    await expect(cert.alertTitle).toHaveText('Your certificate expires on Monday 9 November 2026');
    await expect(cert.alert).toContainText('That’s 30 days from today. Add your renewed certificate here to keep your profile published.');
    await expect(cert.fileMeta).toHaveText('PDF · 0.8 MB · uploaded 14 Jan 2022');
    await expect(cert.savedStatus).toHaveText('Saved 14 Jan 2022');
    await cert.expectNoAccessibilityViolations();
  });

  test('L2-044.4: while suspended the certificate can still be replaced', async ({ page, backend }) => {
    await backend.scenario('flying-fish-suspended');
    await backend.signInAs('sharon');
    const cert = new ProfileCertificatePage(page);
    await cert.open();

    await expect(cert.banner).toHaveClass(/alert--danger/);
    await expect(cert.banner).toContainText('Your profile is suspended and hidden from customers');
    await expect(cert.banner).toContainText('Your food handler certificate expired on 30 Sep 2026.');
    await expect(cert.banner.getByRole('link', { name: 'Upload a new certificate' })).toHaveAttribute('href', '/dashboard/profile/food-safety');
    await cert.expectNoAccessibilityViolations();
    await cert.number.fill('FH-2026-551920');
    await cert.expiry.fill('2031-10-01');
    await cert.save.click();

    await expect(cert.savedStatus).toHaveText('Saved Sat 10 Oct');
  });

  test('L2-039.4: in review the certificate is read-only', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'pending' });
    await backend.signInAs('beverley');
    const cert = new ProfileCertificatePage(page);

    await cert.open();

    await expect(cert.readOnly('Certificate number')).toHaveText('FH-2025-204517');
    await expect(cert.readOnly('Expiry date')).toHaveText('22 Jan 2030');
    await expect(cert.save).toHaveCount(0);
    await cert.expectNoAccessibilityViolations();
  });

  test('loading and error', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    await backend.hold('GET /api/caterer/profile');
    const cert = new ProfileCertificatePage(page);

    await cert.open();

    await expect(cert.loadingStatus).toHaveText('Loading your certificate');
    await cert.expectNoAccessibilityViolations();
    await backend.fail('GET /api/caterer/profile', { status: 500, body: { title: 'x', correlationId: '7f3a-21c9' }, times: 1 });
    await backend.release();
    await cert.open();
    await expect(cert.loadError.locator('.empty__title')).toHaveText('We couldn’t load your certificate');
    await expect(cert.loadErrorReference).toHaveText('Reference 7f3a-21c9');
    await cert.expectNoAccessibilityViolations();
  });
});
