import { OperatorConsolePage } from './operator-console.page';

/** Every caterer in every status, /admin/caterers (docs/mocks/pages/admin-caterers). */
export class OperatorCaterersPage extends OperatorConsolePage {
  async goto(query = '') {
    await this.page.goto(`/admin/caterers${query}`);
  }

  get subtitle() {
    return this.workArea.locator('.page-intro .subtitle');
  }

  get searchBox() {
    return this.workArea.getByRole('searchbox', { name: 'Search caterers by business or owner name' });
  }

  async searchFor(text: string) {
    await this.searchBox.fill(text);
    await this.searchBox.press('Enter');
  }

  get filters() {
    return this.workArea.getByRole('list', { name: 'Filter by status' });
  }

  filter(name: string | RegExp) {
    return this.filters.getByRole('link', { name });
  }

  get currentFilter() {
    return this.filters.locator('a[aria-current="page"]');
  }

  get activeFilters() {
    return this.workArea.getByRole('group', { name: 'Active filters' });
  }

  get chips() {
    return this.activeFilters.locator('.chip');
  }

  removeChip(label: string) {
    return this.activeFilters.getByRole('button', { name: label });
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

  row(name: string) {
    return this.rows.filter({ has: this.page.locator('.queue-item__title', { hasText: name }) }).first();
  }

  status(name: string) {
    return this.row(name).locator('.queue-item__wait .status');
  }

  meta(name: string) {
    return this.row(name).locator('.queue-item__meta');
  }

  flag(name: string) {
    return this.row(name).locator('.changed-flag');
  }

  placeholder(name: string) {
    return this.row(name).locator('.photo--placeholder');
  }

  get skeletonRows() {
    return this.list.locator('li.queue-item--skeleton');
  }

  get loadingStatus() {
    return this.workArea.getByRole('status').filter({ hasText: 'Loading caterers' });
  }

  get empty() {
    return this.workArea.locator('.empty');
  }

  get emptyHeading() {
    return this.empty.locator('.empty__title');
  }

  get emptyText() {
    return this.empty.locator('.empty__text');
  }

  emptyAction(name: string) {
    return this.empty.getByRole('link', { name }).or(this.empty.getByRole('button', { name }));
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
