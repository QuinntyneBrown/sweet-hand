import { DashboardDialog, DashboardScreen } from './dashboard.page';

/** Business details, /dashboard/profile/details (docs/mocks/pages/profile-details). */
export class ProfileDetailsPage extends DashboardScreen {
  readonly withdrawDialog = new DashboardDialog(this.page, 'Withdraw your submission?');

  async open() {
    await this.page.goto('/dashboard/profile/details');
  }

  get name() {
    return this.main.getByRole('textbox', { name: 'Business name' });
  }

  get description() {
    return this.main.getByRole('textbox', { name: 'Description' });
  }

  get nameHelp() {
    return this.main.locator('#name-help');
  }

  get nameError() {
    return this.main.locator('#name-error');
  }

  get descriptionError() {
    return this.main.locator('#description-error');
  }

  get counter() {
    return this.main.locator('.field__counter');
  }

  /** A value shown as text while the profile is read-only. */
  readOnlyValue(label: string) {
    return this.main.locator('.field', { has: this.page.locator('.field__label', { hasText: label }) }).locator('.read-only-value');
  }

  get textboxes() {
    return this.main.getByRole('textbox');
  }

  /** Let the 2-second autosave pause pass (L2-038.1). */
  async pause(ms = 2000) {
    await this.page.clock.runFor(ms);
  }
}
