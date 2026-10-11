import { OperatorConsolePage } from './operator-console.page';

/** One reported item and its reports, /admin/reports/:id (docs/mocks/pages/admin-report). */
export class ReportReviewPage extends OperatorConsolePage {
  async goto(reportId: string) {
    await this.page.goto(`/admin/reports/${reportId}`);
  }

  get backLink() {
    return this.workArea.getByRole('link', { name: 'Review queue' });
  }

  get status() {
    return this.workArea.locator('.page-intro .status');
  }

  get subtitle() {
    return this.workArea.locator('.page-intro .subtitle');
  }

  get resolve() {
    return this.workArea.getByRole('button', { name: 'Resolve report' });
  }

  get notice() {
    return this.workArea.locator('.report-notice .alert');
  }

  get noticeTitle() {
    return this.notice.locator('.alert__title');
  }

  section(name: string | RegExp) {
    return this.workArea.getByRole('region', { name });
  }

  get item() {
    return this.section(/^Reported (review|caterer)$/);
  }

  get itemStatus() {
    return this.item.locator('.thread__title .status, .well .status').first();
  }

  get reviewText() {
    return this.item.locator('.review__body');
  }

  get stars() {
    return this.item.getByRole('img', { name: /out of 5$/ });
  }

  certificate(term: string) {
    return this.item.locator(`dl.certificate dt:text-is("${term}") + dd`);
  }

  get reports() {
    return this.section(/^(\d+ reports|Report)$/).locator('li.review');
  }

  report(n: number) {
    return this.reports.nth(n - 1);
  }

  get privacyNote() {
    return this.section(/^(\d+ reports|Report)$/).locator('.private-note');
  }

  get linkedEnquiry() {
    return this.section('Linked enquiry');
  }

  get openEnquiry() {
    return this.linkedEnquiry.getByRole('button', { name: 'Open linked enquiry' });
  }

  get messages() {
    return this.linkedEnquiry.getByRole('list', { name: 'Messages' }).locator('.message');
  }

  get loadingStatus() {
    return this.workArea.getByRole('status').filter({ hasText: 'Loading report' });
  }

  get error() {
    return this.workArea.locator('.empty--error');
  }

  errorAction(name: string) {
    return this.error.getByRole('link', { name }).or(this.error.getByRole('button', { name }));
  }
}
