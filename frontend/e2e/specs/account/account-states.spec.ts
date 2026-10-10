import { test, expect } from '../../support/test';
import { AccountPage } from '../../pages/account.page';
import { VerifyEmailPage } from '../../pages/verify-email.page';
import { cast } from '../../support/cast';

test.describe('Account page for each kind of account', () => {
  test('L2-023.2: an unverified customer is asked to verify and can have the link sent again', async ({ page, backend }) => {
    await backend.scenario('unverify-email', { email: cast.marcia.email, sentAt: '2026-10-08T15:00:00Z' });
    await backend.signInAs('marcia');
    const account = new AccountPage(page);

    await account.open();

    await expect(account.alert).toHaveAttribute('role', 'status');
    await expect(account.alert).toHaveClass(/alert--warning/);
    await expect(account.alert).toContainText('Verify your email to send enquiries');
    await expect(account.alert).toContainText(`We sent a link to ${cast.marcia.email} on Thu 8 Oct. It works for 24 hours.`);
    await expect(account.statusOf('Email')).toHaveText('Not verified');
    await account.expectNoAccessibilityViolations();

    await account.button('Resend verification email').click();

    const verify = new VerifyEmailPage(page);
    await expect(verify.heading).toHaveText('Check your email');
    await expect(verify.subtitle).toHaveText(`We sent a new link to ${cast.marcia.email}. It works for 24 hours.`);
  });

  test('L2-030.3: when emails bounce, the page says so and "Update email" opens the details dialog', async ({ page, backend }) => {
    await backend.scenario('bounce-email', { email: cast.marcia.email });
    await backend.signInAs('marcia');
    const account = new AccountPage(page);

    await account.open();

    await expect(account.alert).toHaveAttribute('role', 'alert');
    await expect(account.alert).toContainText(`Emails to ${cast.marcia.email} are bouncing`);
    await expect(account.alert).toContainText('Update your email so you don’t miss replies from caterers.');
    await expect(account.statusOf('Email')).toHaveText('Emails bouncing');
    await account.expectNoAccessibilityViolations();

    await account.button('Update email').click();
    await expect(account.editDetails.root).toBeVisible();
    await account.editDetails.field('Email').fill('marcia.thompson@example.com');
    await account.editDetails.button('Save details').click();
    await expect(account.statusOf('Email')).toHaveText('Not verified');
    await expect(account.alert).not.toContainText('bouncing');
  });

  test('a caterer sees the account inside the dashboard, with the business’s terms and deletion', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const account = new AccountPage(page);

    await account.open();

    await expect(account.sideNav).toBeVisible();
    await expect(account.sideNav.getByRole('link', { name: 'Account' })).toHaveAttribute('aria-current', 'page');
    await expect(account.sideNav.getByRole('link', { name: 'Enquiries 2 unread' })).toHaveAttribute('href', '/dashboard/enquiries');
    await expect(account.avatar).toHaveText('KB');
    await expect(account.subtitle).toHaveText('Kendra Baptiste · Caterer account since January 2025');
    await expect(account.detail('Contact name')).toHaveText('Kendra Baptiste');
    await expect(account.detail('Phone')).toContainText('Private; shown to a customer only when you share it in a thread');
    await expect(account.detail('Password')).toContainText('Last changed Sun 2 Aug');
    await expect(account.deviceMetas).toHaveText(['This device · active now', 'Last active yesterday, 9:03 p.m.']);
    await expect(account.dataText.first()).toHaveText('Caterer terms and privacy notice version 2026-03, accepted Sat 14 Mar. Read the privacy notice');
    await expect(account.deleteText).toHaveText('Takes Pelau House off Sweet Hand and closes your open enquiries. This can’t be undone.');
    await account.expectNoAccessibilityViolations();
  });

  test('L2-045: on a phone the caterer account drops the side navigation and fits the screen', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const account = new AccountPage(page);
    await account.usePhone();

    await account.open();

    await expect(account.heading).toHaveText('Account');
    await expect(account.sideNav).toBeHidden();
    await account.expectNoHorizontalScroll();
    await account.expectNoAccessibilityViolations();
  });

  test('an operator sees their details and devices; their account is managed by an Admin, not deleted here', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const account = new AccountPage(page);

    await account.open();

    await expect(account.subtitle).toHaveText('Leah Mohammed · Operator since August 2026');
    await expect(account.section('Signed-in devices')).toBeVisible();
    await expect(account.section('Your data')).toHaveCount(0);
    await expect(account.section('Delete account')).toHaveCount(0);
    await expect(account.header.wordmark).toHaveAccessibleName('Sweet Hand Operator');
    await account.expectNoAccessibilityViolations();
  });
});
