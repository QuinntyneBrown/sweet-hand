import { OperatorConsolePage } from './operator-console.page';

/** The operator review queue, /admin/queue (docs/mocks/pages/admin-queue). */
export class ReviewQueuePage extends OperatorConsolePage {
  async goto(query = '') {
    await this.page.goto(`/admin/queue${query}`);
  }

  get subtitle() {
    return this.workArea.locator('.page-intro .subtitle');
  }

  get filters() {
    return this.workArea.getByRole('list', { name: 'Filter by kind' });
  }

  filter(name: string | RegExp) {
    return this.filters.getByRole('link', { name });
  }

  get currentFilter() {
    return this.filters.locator('a[aria-current="page"]');
  }

  get list() {
    return this.workArea.locator('ul.queue');
  }

  get rows() {
    return this.list.locator('a.queue-item');
  }

  get titles() {
    return this.rows.locator('.queue-item__title');
  }

  row(title: string) {
    return this.rows.filter({ has: this.page.locator('.queue-item__title', { hasText: title }) }).first();
  }

  wait(title: string) {
    return this.row(title).locator('.queue-item__wait');
  }

  kind(title: string) {
    return this.row(title).locator('.kind');
  }

  meta(title: string) {
    return this.row(title).locator('.queue-item__meta');
  }

  media(title: string) {
    return this.row(title).locator('.photo, .avatar').first();
  }

  get lateWaits() {
    return this.list.locator('.queue-item__wait--late');
  }

  get skeletonRows() {
    return this.list.locator('li.queue-item--skeleton');
  }

  get loadingStatus() {
    return this.workArea.getByRole('status').filter({ hasText: 'Loading the review queue' });
  }

  get emptyHeading() {
    return this.workArea.getByRole('heading', { name: 'All caught up' });
  }

  get recentChangesLink() {
    return this.workArea.getByRole('link', { name: 'See recent changes' });
  }

  get errorAlert() {
    return this.workArea.getByRole('alert');
  }

  get retry() {
    return this.errorAlert.getByRole('button', { name: 'Retry' });
  }

  get goToRecentChanges() {
    return this.errorAlert.getByRole('link', { name: 'Go to recent changes' });
  }

  get pagination() {
    return this.workArea.getByRole('navigation', { name: 'Pagination' });
  }

  get resultCount() {
    return this.pagination.locator('.result-count');
  }

  pageLink(n: number) {
    return this.pagination.getByRole('link', { name: `Page ${n}`, exact: true });
  }
}
