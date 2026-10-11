import { BasePage } from './base.page';

/** Create a customer account, /register (docs/mocks/pages/register). */
export class RegisterPage extends BasePage {
  async open(query = '') {
    await this.page.goto(`/register${query}`);
  }

  get subtitle() {
    return this.page.locator('.auth__head .subtitle');
  }

  get name() {
    return this.page.getByLabel('Your name', { exact: true });
  }

  get email() {
    return this.page.getByLabel('Email', { exact: true });
  }

  get password() {
    return this.page.getByLabel('Password', { exact: true });
  }

  get consent() {
    return this.page.getByRole('checkbox', { name: 'I agree to the privacy notice' });
  }

  get consentSummary() {
    return this.page.locator('#consent-summary');
  }

  get privacyLink() {
    return this.page.locator('label.choice').getByRole('link', { name: 'privacy notice' });
  }

  get submit() {
    return this.page.getByRole('button', { name: 'Create account' });
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

  errorFor(field: 'name' | 'email' | 'password' | 'consent') {
    return this.page.locator(`#${field}-error`);
  }

  helpFor(field: 'name' | 'password') {
    return this.page.locator(`#${field}-help`);
  }

  link(name: string) {
    return this.main.getByRole('link', { name, exact: true });
  }

  button(name: string) {
    return this.main.getByRole('button', { name, exact: true });
  }

  /** The text under the heading on the "Check your email" screen. */
  get successText() {
    return this.page.locator('.auth > .stack > p');
  }

  async register(details: { name: string; email: string; password: string; consent?: boolean }) {
    await this.name.fill(details.name);
    await this.email.fill(details.email);
    await this.password.fill(details.password);
    if (details.consent ?? true) await this.consent.check();
    await this.submit.click();
  }
}
