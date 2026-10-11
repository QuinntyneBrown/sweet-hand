import type { PickedFile } from './picked-file';
import { DashboardScreen } from './dashboard-screen';

/** Food safety, /dashboard/profile/food-safety (docs/mocks/pages/profile-certificate). */
export class ProfileCertificatePage extends DashboardScreen {
  async open() {
    await this.page.goto('/dashboard/profile/food-safety');
  }

  get holder() {
    return this.main.getByRole('textbox', { name: 'Name on the certificate' });
  }

  get issuer() {
    return this.main.getByRole('textbox', { name: 'Issued by' });
  }

  get number() {
    return this.main.getByRole('textbox', { name: 'Certificate number' });
  }

  get expiry() {
    return this.main.getByLabel('Expiry date');
  }

  get expiryHelp() {
    return this.main.locator('#expiry-help');
  }

  get privateNote() {
    return this.main.locator('form .private-note');
  }

  get fileRow() {
    return this.main.locator('.file-row');
  }

  get fileName() {
    return this.fileRow.locator('.file-row__name > span').first();
  }

  get fileMeta() {
    return this.fileRow.locator('.file-row__meta');
  }

  /** "Upload a copy" or the row's "Replace" input. */
  get fileInput() {
    return this.main.getByLabel(/^(Upload a copy|Replace)/);
  }

  async attach(file: PickedFile) {
    await this.fileInput.setInputFiles(file);
  }

  get removeFile() {
    return this.fileRow.getByRole('button', { name: /^Remove/ });
  }

  get save() {
    return this.main.getByRole('button', { name: 'Save certificate' });
  }

  /** The status beside Save certificate ("Saved Wed 2 Sep"). */
  get savedStatus() {
    return this.main.locator('.form-actions .save-status');
  }

  get savingStatus() {
    return this.main.locator('.form-actions [role="status"]');
  }

  errorFor(id: string) {
    return this.main.locator(`#${id}-error`);
  }

  readOnly(term: string) {
    return this.main.locator('dl.kv dt', { hasText: new RegExp(`^${term}$`) }).locator('xpath=following-sibling::dd[1]');
  }
}
