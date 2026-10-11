import { BasePage } from './base.page';

/** Choose a new password from a reset link, /reset-password/:token (docs/mocks/pages/reset-password). */
export class ResetPasswordPage extends BasePage {
  async open(link: string) {
    await this.page.goto(link);
  }

  get subtitle() {
    return this.page.locator('.auth__head .subtitle');
  }

  /** The hidden username that tells password managers whose password this is. */
  get username() {
    return this.page.locator('input[type="hidden"][autocomplete="username"]');
  }

  get password() {
    return this.page.getByLabel('New password', { exact: true });
  }

  get submit() {
    return this.page.getByRole('button', { name: 'Save new password' });
  }

  get errorSummary() {
    return this.page.locator('.form-summary');
  }

  get passwordError() {
    return this.page.locator('#password-error');
  }

  get alert() {
    return this.page.locator('.auth .alert');
  }

  get status() {
    return this.page.locator('form [role="status"]').last();
  }

  link(name: string) {
    return this.main.getByRole('link', { name, exact: true });
  }

  button(name: string) {
    return this.main.getByRole('button', { name, exact: true });
  }

  async choose(password: string) {
    await this.password.fill(password);
    await this.submit.click();
  }
}
