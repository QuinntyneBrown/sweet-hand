import { BasePage } from './base.page';

/** Two-step verification for operators, /sign-in/verify (docs/mocks/pages/two-factor). */
export class TwoFactorPage extends BasePage {
  async open(query = '') {
    await this.page.goto(`/sign-in/verify${query}`);
  }

  get subtitle() {
    return this.page.locator('.auth__head .subtitle');
  }

  get code() {
    return this.page.getByLabel('6-digit code', { exact: true });
  }

  get submit() {
    return this.page.getByRole('button', { name: 'Continue' });
  }

  get securityKey() {
    return this.page.getByRole('button', { name: 'Use a security key instead' });
  }

  get signedInAs() {
    return this.page.locator('.auth__alt');
  }

  get notYou() {
    return this.page.getByRole('link', { name: 'Not you?' });
  }

  get errorSummary() {
    return this.page.locator('.form-summary');
  }

  get codeError() {
    return this.page.locator('#code-error');
  }

  get alert() {
    return this.page.locator('.auth .alert');
  }

  get status() {
    return this.page.locator('form [role="status"]').last();
  }

  async enter(code: string) {
    await this.code.fill(code);
    await this.submit.click();
  }
}
