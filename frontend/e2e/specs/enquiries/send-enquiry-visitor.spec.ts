import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';
import { EnquiryFormDialog } from '../../pages/enquiry-form-dialog';
import { SignInReturnPage } from '../../pages/sign-in-return.page';
import { SEED_PASSWORD, cast } from '../../support/cast';

const ENTRY = {
  date: '2026-12-12',
  guests: '120',
  area: 'Scarborough',
  postal: 'M1E 4R8',
  occasion: 'Family gatherings',
  message: 'We’d love pelau, curry goat and macaroni pie for about 120 people, buffet style around 6 p.m.',
};

test.describe('Sending an enquiry before signing in', () => {
  test('L2-013.3: a visitor fills in the form, sends it, and is taken to sign in with the way back to the form', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await caterer.open('pelau-house');

    await caterer.enquireButtonIn(caterer.panel).click();
    await form.fill(ENTRY);
    await form.send.click();

    await expect(page).toHaveURL(/\/sign-in\?returnUrl=%2Fcaterers%2Fpelau-house%3Fenquiry%3Dresume$/);
    await expect(form.dialog).toHaveCount(0);
    expect((await backend.requests()).filter((r) => r.method === 'POST' && r.path === '/api/enquiries')).toHaveLength(0);
  });

  test('sign-in return: the sign-in page names the caterer, says the enquiry is saved, and registration also comes back to it', async ({ page }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    const signIn = new SignInReturnPage(page);
    await caterer.open('pelau-house');
    await caterer.enquireButtonIn(caterer.panel).click();
    await form.fill(ENTRY);

    await form.send.click();

    await expect(signIn.heading).toHaveText('Sign in to send your enquiry');
    await expect(signIn.catererName).toHaveText('Pelau House');
    await expect(signIn.catererPhoto).toHaveAttribute('src', /pelau-house/);
    await expect(signIn.catererPhoto).toHaveAttribute('alt', '');
    await expect(signIn.subtitle).toHaveText('Your enquiry to Pelau House is saved. Sign in, or create a free account, and we’ll take you straight back to it.');
    await expect(signIn.alternative).toHaveText('New to Sweet Hand? Create an account. It takes a minute and your details stay private.');
    await expect(signIn.createAccount).toHaveAttribute('href', '/register?returnUrl=%2Fcaterers%2Fpelau-house%3Fenquiry%3Dresume');
    await expect(signIn.email).toBeFocused();
    await signIn.expectNoAccessibilityViolations();

    await page.reload();
    await expect(signIn.heading).toHaveText('Sign in to send your enquiry');
  });

  test('L2-023.1 L2-013.3 restored: after signing in the form opens again with every value and sends', async ({ page }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    const signIn = new SignInReturnPage(page);
    await caterer.open('pelau-house');
    await caterer.enquireButtonIn(caterer.panel).click();
    await form.fill(ENTRY);
    await form.send.click();

    await signIn.signIn(cast.marcia.email, SEED_PASSWORD);

    await expect(page).toHaveURL(/\/caterers\/pelau-house$/);
    await expect(form.dialog).toBeVisible();
    // Info is the base alert (alert CRD): no tone class and no live role.
    await expect(form.alert).toHaveClass('alert');
    await expect(form.alert).not.toHaveAttribute('role');
    await expect(form.alertTitle).toHaveText('Welcome back, Marcia');
    await expect(form.alertText).toHaveText('We kept everything you typed before signing in.');
    await form.expectValues(ENTRY);
    await caterer.expectNoAccessibilityViolations();

    await form.send.click();
    await expect(form.outcomeTitle).toHaveText('Enquiry sent to Pelau House');

    await form.backToCaterer.click();
    await page.reload();
    await expect(caterer.heading).toHaveText('Pelau House');
    await expect(form.dialog).toHaveCount(0);
  });

  test('sign-in return on a phone: the form comes back full screen after signing in', async ({ page }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    const signIn = new SignInReturnPage(page);
    await caterer.usePhone();
    await caterer.open('pelau-house');
    await caterer.enquireButtonIn(caterer.stickyBar).click();
    await form.fill(ENTRY);
    await form.send.click();
    await expect(signIn.heading).toHaveText('Sign in to send your enquiry');
    await signIn.expectNoHorizontalScroll();
    await signIn.expectNoAccessibilityViolations();

    await signIn.signIn(cast.marcia.email, SEED_PASSWORD);

    await expect(form.alertTitle).toHaveText('Welcome back, Marcia');
    await form.expectValues(ENTRY);
    await expect(form.send).toBeInViewport();
  });
});
