import { test, expect } from '../../support/test';
import type { Page } from '@playwright/test';
import { PrivacyUpdatePage } from '../../pages/privacy-update.page';
import { SignInPage } from '../../pages/sign-in.page';
import { cast, SEED_PASSWORD } from '../../support/cast';

async function signInAsMarcia(page: Page) {
  const signIn = new SignInPage(page);
  await signIn.open();
  await signIn.signIn(cast.marcia.email, SEED_PASSWORD);
  await expect(page).toHaveURL(/\/privacy\/accept/);
}

test.describe('Accept a changed privacy notice', () => {
  test.beforeEach(async ({ backend }) => {
    await backend.scenario('publish-privacy-notice');
  });

  test('L2-070.4: after a substantial change, the next sign-in shows what changed before anything else', async ({ page }) => {
    const update = new PrivacyUpdatePage(page);

    await signInAsMarcia(page);

    await expect(update.heading).toHaveText('We’ve updated our privacy notice');
    await expect(update.subtitle).toHaveText('Please review the changes before you continue.');
    await expect(update.intro).toHaveText('Our privacy notice changes on 1 November 2026. What’s different:');
    await expect(update.changes).toHaveText([
      'We now use a Canadian email provider in Montréal, Quebec, to send notifications.',
      'Visit counts use a daily hash that can’t be linked across days.',
      'Closed enquiries are deleted 3 years after they close.',
    ]);
    await expect(update.noticeLink).toHaveAttribute('href', '/privacy');
    await expect(update.header.nav).toHaveCount(0);
    await update.expectNoAccessibilityViolations();
  });

  test('L2-070.4: until the notice is accepted, other pages lead back to it', async ({ page }) => {
    const update = new PrivacyUpdatePage(page);
    await signInAsMarcia(page);

    await page.goto('/caterers');

    await expect(page).toHaveURL(/\/privacy\/accept\?returnUrl=%2Fcaterers$/);
    await expect(update.heading).toHaveText('We’ve updated our privacy notice');
  });

  test('L2-070.3: accepting records the version and time, then continues', async ({ page, backend }) => {
    const update = new PrivacyUpdatePage(page);
    await signInAsMarcia(page);

    await update.accept.click();

    await expect(page).toHaveURL(/\/inbox$/);
    const sent = (await backend.requests()).find((r) => r.path === '/api/me/consents');
    expect(sent?.body).toMatchObject({ version: '2026-11' });
    const { users } = await backend.state();
    expect(users.find((u: { email: string }) => u.email === cast.marcia.email)).toMatchObject({
      acceptedPrivacyVersion: '2026-11',
      acceptedPrivacyAt: '2026-10-10T14:00:00.000Z',
    });
    await page.goto('/caterers');
    await expect(page).toHaveURL(/\/caterers$/);
  });

  test('while saving the choice the button is busy', async ({ page, backend }) => {
    const update = new PrivacyUpdatePage(page);
    await signInAsMarcia(page);
    await backend.hold('POST /api/me/consents');

    await update.accept.click();

    await expect(update.accept).toHaveAttribute('aria-busy', 'true');
    await expect(update.status).toHaveText('Saving your choice');
    await backend.release();
    await expect(page).toHaveURL(/\/inbox$/);
  });

  test('when saving fails nothing is assumed and the person stays on the page', async ({ page, backend }) => {
    const update = new PrivacyUpdatePage(page);
    await signInAsMarcia(page);
    await backend.fail('POST /api/me/consents', { status: 500, times: 1, body: { title: 'Something went wrong', correlationId: '6a91f3d0' } });

    await update.accept.click();

    await expect(update.alert).toHaveAttribute('role', 'alert');
    await expect(update.alert).toContainText('We couldn’t save your choice');
    await expect(update.alert).toContainText('Something went wrong on our side. Try again; until then you stay on this page. Reference 6a91f3d0.');
    await expect(page).toHaveURL(/\/privacy\/accept/);
    await update.expectNoAccessibilityViolations();

    await update.accept.click();
    await expect(page).toHaveURL(/\/inbox$/);
  });

  test('declining is signing out', async ({ page }) => {
    const update = new PrivacyUpdatePage(page);
    await signInAsMarcia(page);

    await update.signOut.click();

    await expect(page).toHaveURL(/\/caterers$/);
    await expect(update.header.link('Sign in')).toBeVisible();
  });

  test('L2-064.2: the page fits a phone', async ({ page }) => {
    const update = new PrivacyUpdatePage(page);
    await update.usePhone();

    await signInAsMarcia(page);

    await expect(update.accept).toBeVisible();
    await update.expectNoHorizontalScroll();
  });
});
