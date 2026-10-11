import { SignInPage } from './sign-in.page';

/** Sign in, sent from the enquiry form (docs/mocks/pages/sign-in/return.html). */
export class SignInReturnPage extends SignInPage {
  get catererName() {
    return this.page.locator('.auth__head .dialog__caterer-name');
  }

  get catererPhoto() {
    return this.page.locator('.auth__head .dialog__caterer .photo img');
  }

  get createAccount() {
    return this.main.getByRole('link', { name: 'Create an account' });
  }

  get alternative() {
    return this.page.locator('.auth__alt');
  }
}
