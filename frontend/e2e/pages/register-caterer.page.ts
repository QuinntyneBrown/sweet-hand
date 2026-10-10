import { BasePage } from './base.page';

/** Cater with Sweet Hand, /join (docs/mocks/pages/register-caterer). */
export class RegisterCatererPage extends BasePage {
  async open() {
    await this.page.goto('/join');
  }

  get subtitle() {
    return this.page.locator('.auth__head .subtitle');
  }

  get businessName() {
    return this.page.getByLabel('Business name', { exact: true });
  }

  get contactName() {
    return this.page.getByLabel('Your name', { exact: true });
  }

  get email() {
    return this.page.getByLabel('Email', { exact: true });
  }

  get phone() {
    return this.page.getByLabel('Phone', { exact: true });
  }

  get password() {
    return this.page.getByLabel('Password', { exact: true });
  }

  get confirmations() {
    return this.page.getByRole('group', { name: 'Before you start' });
  }

  get sellsCaribbeanFood() {
    return this.page.getByRole('checkbox', { name: 'I sell Caribbean food in Toronto or the GTA' });
  }

  get acceptsTerms() {
    return this.page.getByRole('checkbox', { name: 'I accept the caterer terms and the privacy notice' });
  }

  termsLink(name: 'caterer terms' | 'privacy notice') {
    return this.confirmations.getByRole('link', { name });
  }

  get roleChoices() {
    return this.page.getByRole('radio');
  }

  get submit() {
    return this.page.getByRole('button', { name: 'Create caterer account' });
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

  errorFor(field: 'business' | 'contact' | 'email' | 'phone' | 'password' | 'sells' | 'terms') {
    return this.page.locator(`#${field}-error`);
  }

  helpFor(field: 'business' | 'phone' | 'password') {
    return this.page.locator(`#${field}-help`);
  }

  link(name: string) {
    return this.main.getByRole('link', { name, exact: true });
  }

  /** The next steps on the welcome screen. */
  get steps() {
    return this.page.locator('ol.checklist > li');
  }

  async register(details: { business: string; contact: string; email: string; phone: string; password: string; confirm?: boolean }) {
    await this.businessName.fill(details.business);
    await this.contactName.fill(details.contact);
    await this.email.fill(details.email);
    await this.phone.fill(details.phone);
    await this.password.fill(details.password);
    if (details.confirm ?? true) {
      await this.sellsCaribbeanFood.check();
      await this.acceptsTerms.check();
    }
    await this.submit.click();
  }
}
