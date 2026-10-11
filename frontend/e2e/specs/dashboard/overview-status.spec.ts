import { test, expect } from '../../support/test';
import { DashboardPage } from '../../pages/dashboard.page';
import { RegisterCatererPage } from '../../pages/register-caterer.page';

const CHECKLIST = ['Email verified', 'Business name', 'Description', 'Cuisines', 'Areas you serve', 'Guest range', 'Occasions', 'Photos', 'Menu', 'Food handler certificate'];

test.describe('Dashboard overview through the profile lifecycle', () => {
  test('L2-037.1 L2-038.3: a newly registered caterer lands on setup with the checklist of what is needed', async ({ page }) => {
    const join = new RegisterCatererPage(page);
    await join.open();
    await join.register({ business: 'Auntie Bev’s Kitchen', contact: 'Beverley Campbell', email: 'beverley@auntiebevs.example', phone: '(905) 555 0164', password: 'oxtail-and-rice-on-sunday' });
    await join.link('Set up your profile').click();
    const dashboard = new DashboardPage(page);

    await expect(dashboard.heading).toHaveText('Auntie Bev’s Kitchen');
    await expect(dashboard.status).toHaveText('Draft');
    await expect(dashboard.welcome.getByRole('heading')).toHaveText('Welcome, Beverley');
    await expect(dashboard.welcome.getByRole('link', { name: 'Start with your description' })).toHaveAttribute('href', '/dashboard/profile/details');
    await expect(dashboard.meterLabel).toHaveText(/Ready to submit\s*1 of 10 done/);
    await expect(dashboard.meter).toHaveAttribute('aria-valuetext', '1 of 10 done');
    await expect(dashboard.sectionTitles).toHaveText(CHECKLIST.map((t) => (t === 'Business name' ? `Done: ${t}` : `To do: ${t}`)));
    await expect(dashboard.sectionMeta('Photos')).toHaveText('3 to 30, each with a caption and a cover');
    await expect(dashboard.sectionMeta('Food handler certificate')).toHaveText('Holder, issuer, number and expiry');
    await expect(dashboard.previewLabel).toHaveText('Your listing card');
    await expect(dashboard.previewCard.locator('.photo__label')).toHaveText('Cover photo');
    await expect(dashboard.button('Submit for review')).toHaveCount(0);
    await dashboard.expectNoAccessibilityViolations();
  });

  test('L2-038.3: a draft shows the checklist, what is left and Submit for review', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'draft' });
    await backend.signInAs('beverley');
    const dashboard = new DashboardPage(page);

    await dashboard.open();

    await expect(dashboard.saveStatus).toHaveText('Saved');
    await expect(dashboard.meter).toHaveAttribute('aria-valuenow', '8');
    await expect(dashboard.meterLabel).toHaveText(/8 of 10 done/);
    await expect(dashboard.sectionTitles).toHaveText(CHECKLIST.map((t) => (t === 'Photos' || t === 'Food handler certificate' ? `To do: ${t}` : `Done: ${t}`)));
    await expect(dashboard.sectionMetas).toHaveText([
      'beverley@auntiebevs.example',
      'Auntie Bev’s Kitchen',
      '286 characters',
      'Jamaican',
      'Oshawa and 4 more',
      '10–150 guests',
      '4 occasions',
      'Add at least 3 photos · 2 so far',
      '5 dishes',
      'Add your certificate',
    ]);
    await expect(dashboard.section('Photos')).toHaveAttribute('href', '/dashboard/profile/photos');
    await expect(dashboard.button('Submit for review')).toBeVisible();
    await expect(dashboard.actionCaption).toHaveText('2 sections left: photos and food safety');
    await expect(dashboard.previewLabel).toHaveText('Live preview');
    await expect(dashboard.previewPhoto).toHaveAttribute('alt', 'Curry goat and rice in my steel pot');
    await expect(dashboard.previewMeta).toHaveText('Jamaican · Oshawa');
    await dashboard.expectNoAccessibilityViolations();
  });

  test('L2-039.4 L2-046: a profile in review is read-only, with Withdraw submission', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'pending' });
    await backend.signInAs('beverley');
    const dashboard = new DashboardPage(page);

    await dashboard.open();

    await expect(dashboard.status).toHaveText('Pending review');
    await expect(dashboard.statusCaption).toHaveText('Submitted Wed 7 Oct');
    await expect(dashboard.alert).toHaveAttribute('role', 'status');
    await expect(dashboard.alertTitle).toHaveText('Thanks — we’ll review your profile within 3 business days');
    await expect(dashboard.alert).toContainText('While we review it, your profile is read-only. We’ll email you at beverley@auntiebevs.example when it’s live, or if anything needs changing.');
    await expect(dashboard.sectionTitles).toHaveText(CHECKLIST.map((t) => `Done: ${t}`));
    await expect(dashboard.meter).toHaveCount(0);
    await expect(dashboard.actionCaption).toHaveText('Withdraw to make changes. You’ll need to submit again.');
    await expect(dashboard.previewLabel).toHaveText('How you’ll appear');
    await dashboard.expectNoAccessibilityViolations();
  });

  test('L2-048.3: changes requested shows the reason, flags the section and offers Resubmit', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'changes-requested' });
    await backend.signInAs('beverley');
    const dashboard = new DashboardPage(page);

    await dashboard.open();

    await expect(dashboard.status).toHaveText('Changes requested');
    await expect(dashboard.statusCaption).toHaveText('Fri 9 Oct');
    await expect(dashboard.alert).toHaveClass(/alert--warning/);
    await expect(dashboard.alertTitle).toHaveText('We need a couple of changes before your profile goes live');
    await expect(dashboard.alert).toContainText('“Photos 2 and 5 look like stock images. Please upload photos of your own food.” — Sweet Hand team');
    await expect(dashboard.alert.getByRole('link', { name: 'Go to photos' })).toHaveAttribute('href', '/dashboard/profile/photos');
    await expect(dashboard.section('Photos').locator('.section-link__title')).toHaveText('Needs attention: Photos');
    await expect(dashboard.sectionMeta('Photos')).toHaveText('Replace photos 2 and 5');
    await expect(dashboard.sectionMeta('Photos')).toHaveClass(/section-link__meta--error/);
    await expect(dashboard.button('Resubmit for review')).toBeVisible();
    await expect(dashboard.actionCaption).toHaveText('We’ll look at what changed first.');
    await dashboard.expectNoAccessibilityViolations();
  });

  test('L2-044.2: a pending name change is explained while the public name stays', async ({ page, backend }) => {
    await backend.scenario('pelau-name-change-pending');
    await backend.signInAs('kendra');
    const dashboard = new DashboardPage(page);

    await dashboard.open();

    await expect(dashboard.heading).toHaveText('Pelau House');
    await expect(dashboard.alertTitle).toHaveText('Name change waiting for review');
    await expect(dashboard.alert).toContainText(
      'You asked to rename “Pelau House” to “Pelau House by Kendra” on Fri 9 Oct. Your page keeps the current name until our team approves it, usually within 3 business days.',
    );
    await expect(dashboard.alert.getByRole('link', { name: 'See the change' })).toHaveAttribute('href', '/dashboard/profile/details');
    await expect(dashboard.stat('Reviews')).toHaveText('23');
    await expect(dashboard.previewName).toHaveText('Pelau House');
    await dashboard.expectNoAccessibilityViolations();
  });

  test('L2-044.4 L2-046: a suspended caterer sees the reason, a read-only profile and the way back', async ({ page, backend }) => {
    await backend.scenario('flying-fish-suspended');
    await backend.signInAs('sharon');
    const dashboard = new DashboardPage(page);

    await dashboard.open();

    await expect(dashboard.heading).toHaveText('Flying Fish Kitchen');
    await expect(dashboard.status).toHaveText('Suspended');
    await expect(dashboard.statusCaption).toHaveText('Since Thu 8 Oct');
    await expect(dashboard.alert).toHaveAttribute('role', 'alert');
    await expect(dashboard.alertTitle).toHaveText('Your profile is hidden from customers');
    await expect(dashboard.alert).toContainText(
      '“Your food handler certificate expired on 30 Sep 2026. Upload a current certificate and we’ll review it within 3 business days.” — Sweet Hand team. Open enquiries were closed and those customers were told.',
    );
    await expect(dashboard.link('Upload a new certificate')).toHaveAttribute('href', '/dashboard/profile/food-safety');
    await expect(dashboard.main.locator('.private-note')).toHaveText('Read-only while suspended, apart from your certificate.');
    await expect(dashboard.section('Food handler certificate').locator('.section-link__title')).toHaveText('Needs attention: Food handler certificate');
    await expect(dashboard.sectionMeta('Food handler certificate')).toHaveText('Expired 30 Sep 2026');
    await expect(dashboard.previewLabel).toHaveText('Hidden from the listing');
    await dashboard.expectNoAccessibilityViolations();
  });

  test('L2-058.5: a removed caterer cannot edit but keeps the enquiry history and a data download', async ({ page, backend }) => {
    await backend.signInAs('winston');
    const dashboard = new DashboardPage(page);

    await dashboard.open();

    await expect(dashboard.heading).toHaveText('Coal Pot Kitchen');
    await expect(dashboard.status).toHaveText('Removed');
    await expect(dashboard.statusCaption).toHaveText('Mon 28 Sep');
    await expect(dashboard.alertTitle).toHaveText('Your profile was removed from Sweet Hand');
    await expect(dashboard.alert).toContainText('“Repeated food safety concerns from customers, confirmed by our team.”');
    await expect(dashboard.navLinks).toHaveText(['Overview', 'Enquiry history', 'Account']);
    await expect(dashboard.records.getByRole('link', { name: 'Enquiry history' })).toHaveAttribute('href', '/dashboard/enquiries');
    await expect(dashboard.previewPane).toHaveCount(0);
    await expect(dashboard.statGrid).toHaveCount(0);
    await dashboard.expectNoAccessibilityViolations();

    await dashboard.records.getByRole('button', { name: 'Download my data' }).click();
    await expect(dashboard.downloadDialog.root).toBeVisible();
    await dashboard.downloadDialog.button('Request export').click();
    await expect(dashboard.downloadDialog.title).toHaveText('Export requested');
  });

  test('L2-048.1: a caterer approved today is told they are live, and can dismiss it', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'published' });
    await backend.signInAs('beverley');
    const dashboard = new DashboardPage(page);

    await dashboard.open();

    await expect(dashboard.banner).toHaveClass(/alert--success/);
    await expect(dashboard.banner).toContainText('Auntie Bev’s Kitchen is live');
    await expect(dashboard.banner).toContainText('Customers can find you in the listing now.');
    await expect(dashboard.banner.getByRole('link', { name: 'View your page' })).toHaveAttribute('href', '/caterers/auntie-bevs-kitchen');
    await expect(dashboard.stat('Rating')).toHaveText('–No reviews yet');
    await expect(dashboard.noEnquiries.locator('.empty__title')).toHaveText('No enquiries yet');
    await dashboard.expectNoAccessibilityViolations();

    await dashboard.banner.getByRole('button', { name: 'Dismiss' }).click();
    await expect(dashboard.banner).toHaveCount(0);
  });
});
