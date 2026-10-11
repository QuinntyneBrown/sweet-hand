import { OperatorConsolePage } from './operator-console.page';

/** One caterer's record for operators, /admin/caterers/:id (docs/mocks/pages/admin-caterer). */
export class CatererRecordPage extends OperatorConsolePage {
  async goto(catererId: string) {
    await this.page.goto(`/admin/caterers/${catererId}`);
  }

  get backLink() {
    return this.workArea.getByRole('link', { name: 'Caterers', exact: true });
  }

  get status() {
    return this.workArea.locator('.thread__title .status');
  }

  get publicPage() {
    return this.workArea.getByRole('link', { name: 'Public page' });
  }

  get pageHidden() {
    return this.workArea.locator('.thread__title .text-muted');
  }

  get actions() {
    return this.workArea.locator('.record-actions').getByRole('button');
  }

  action(name: 'Edit' | 'Suspend' | 'Reinstate' | 'Remove') {
    return this.workArea.locator('.record-actions').getByRole('button', { name, exact: true });
  }

  get notice() {
    return this.workArea.locator('.record-notice .alert');
  }

  get noticeTitle() {
    return this.notice.locator('.alert__title');
  }

  noticeLink(name: string) {
    return this.notice.getByRole('link', { name });
  }

  section(name: string) {
    return this.workArea.getByRole('region', { name });
  }

  detail(section: string, term: string) {
    return this.section(section).locator(`dl dt:text-is("${term}") + dd`);
  }

  get photos() {
    return this.section('Profile').locator('.photo-row img');
  }

  get certificateStatus() {
    return this.section('Food handler certificate').locator('.caterer-section__head .status');
  }

  get certificateFile() {
    return this.section('Food handler certificate').getByRole('button', { name: /\(\d+\.\d MB\)$/ });
  }

  get history() {
    return this.section('Status history').getByRole('list', { name: 'Status history, newest first' }).locator('li');
  }

  get auditLogLink() {
    return this.section('Status history').getByRole('link', { name: 'Audit log' });
  }

  get loadingStatus() {
    return this.workArea.getByRole('status').filter({ hasText: 'Loading caterer record' });
  }

  get error() {
    return this.workArea.locator('.empty--error');
  }

  errorAction(name: string) {
    return this.error.getByRole('link', { name }).or(this.error.getByRole('button', { name }));
  }
}
