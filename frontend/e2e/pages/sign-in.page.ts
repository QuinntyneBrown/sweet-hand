import { BasePage } from './base.page';

/** Sign in, /sign-in (docs/mocks/pages/sign-in). */
export class SignInPage extends BasePage {
  async open(query = '') {
    await this.page.goto(`/sign-in${query}`);
  }

  get subtitle() {
    return this.page.locator('.auth__head .subtitle');
  }

  get email() {
    return this.page.getByLabel('Email', { exact: true });
  }

  get password() {
    return this.page.getByLabel('Password', { exact: true });
  }

  get showPassword() {
    return this.page.getByRole('button', { name: 'Show' });
  }

  get submit() {
    return this.page.getByRole('button', { name: 'Sign in', exact: true });
  }

  get errorSummary() {
    return this.page.locator('.form-summary');
  }

  get alert() {
    return this.page.locator('.auth .alert');
  }

  get status() {
    return this.page.locator('form [role="status"]').last();
  }

  errorFor(field: 'email' | 'password') {
    return this.page.locator(`#${field}-error`);
  }

  link(name: string) {
    return this.main.getByRole('link', { name });
  }

  async signIn(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
