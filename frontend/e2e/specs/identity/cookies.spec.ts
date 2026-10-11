import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';
import { SignInPage } from '../../pages/sign-in.page';
import { AccountPage } from '../../pages/account.page';
import { cast, SEED_PASSWORD } from '../../support/cast';

test.describe('Cookies and the session cookie', () => {
  test('L2-074.1: a first visit sets only strictly necessary cookies', async ({ page, context }) => {
    const listing = new ListingPage(page);

    await listing.open();
    await expect(listing.cards.first()).toBeVisible();

    const names = (await context.cookies()).map((c) => c.name);
    expect(names.every((n) => ['XSRF-TOKEN', 'sh_session'].includes(n))).toBe(true);
  });

  test('L2-078.1: the session cookie is HttpOnly, SameSite=Lax and an opaque random value of at least 128 bits', async ({ page, context }) => {
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn(cast.marcia.email, SEED_PASSWORD);
    await expect(page).toHaveURL(/\/inbox$/);

    const session = (await context.cookies()).find((c) => c.name === 'sh_session');
    expect(session).toMatchObject({ httpOnly: true, sameSite: 'Lax' });
    expect(session!.value).toMatch(/^[0-9a-f]{32,}$/);
  });

  test('L2-078.2: signing in replaces the session identifier held before, which stops working', async ({ page, context, backend }) => {
    await backend.signInAs('andre');
    const before = (await context.cookies()).find((c) => c.name === 'sh_session')!.value;
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn(cast.marcia.email, SEED_PASSWORD);
    await expect(page).toHaveURL(/\/inbox$/);

    const after = (await context.cookies()).find((c) => c.name === 'sh_session')!.value;
    expect(after).not.toBe(before);
    await context.addCookies([{ name: 'sh_session', value: before, url: page.url(), httpOnly: true, sameSite: 'Lax' }]);
    const account = new AccountPage(page);
    await account.open();
    await expect(page).toHaveURL(/\/sign-in\?returnUrl=%2Faccount$/);
  });
});
