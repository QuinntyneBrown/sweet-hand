import { BasePage } from './base.page';

/** Forgot password, /forgot-password (docs/mocks/pages/forgot-password). */
export class ForgotPasswordPage extends BasePage {
  async open() {
    await this.page.goto('/forgot-password');
  }

  get subtitle() {
    return this.page.locator('.auth__head .subtitle');
  }

  get email() {
    return this.page.getByLabel('Email', { exact: true });
  }

  get submit() {
    return this.page.getByRole('button', { name: 'Send reset link' });
  }

  get errorSummary() {
    return this.page.locator('.form-summary');
  }

  get emailError() {
    return this.page.locator('#email-error');
  }

  get alert() {
    return this.page.locator('.auth .alert');
  }

  get status() {
    return this.page.locator('form [role="status"]').last();
  }

  /** The hint under "Back to sign in" on the "Check your email" screen. */
  get hint() {
    return this.page.locator('.auth .stack .text-muted');
  }

  link(name: string) {
    return this.main.getByRole('link', { name, exact: true });
  }

  async request(email: string) {
    await this.email.fill(email);
    await this.submit.click();
  }
}
