import type { Locator, Page } from '@playwright/test';

/**
 * The list of enquiries shared by the customer inbox and the caterer's
 * enquiries (docs/specs/components/inbox-row.md, button-group.md, pagination.md).
 */
export class EnquiryList {
  constructor(
    private readonly page: Page,
    private readonly root: Locator = page.getByRole('main'),
  ) {}

  get filter() {
    return this.root.getByRole('list', { name: 'Filter by status' });
  }

  get filterItems() {
    return this.filter.getByRole('link');
  }

  get currentFilter() {
    return this.filter.locator('[aria-current="page"]');
  }

  filterItem(label: string) {
    return this.filter.getByRole('link', { name: new RegExp(`^${label}\\b`) });
  }

  get filterSkeleton() {
    return this.root.locator('ul.segmented[aria-hidden="true"]');
  }

  get list() {
    return this.root.locator('ul.inbox-list');
  }

  get rows() {
    return this.list.locator('a.inbox-row');
  }

  row(name: string) {
    return this.rows.filter({ has: this.page.locator('.inbox-row__name', { hasText: name }) });
  }

  get skeletonRows() {
    return this.list.locator('li.inbox-skeleton-row');
  }

  get unreadRows() {
    return this.list.locator('a.inbox-row--unread');
  }

  get currentRow() {
    return this.rows.and(this.page.locator('[aria-current]'));
  }

  names() {
    return this.rows.locator('.inbox-row__name');
  }

  nameOf(row: Locator) {
    return row.locator('.inbox-row__name');
  }

  timeOf(row: Locator) {
    return row.locator('.inbox-row__time');
  }

  summaryOf(row: Locator) {
    return row.locator('.inbox-row__meta');
  }

  statusOf(row: Locator) {
    return row.locator('.inbox-row__status');
  }

  pictureOf(row: Locator) {
    return row.locator('.photo img, .avatar').first();
  }

  dotOf(row: Locator) {
    return row.locator('.unread-dot');
  }

  get pagination() {
    return this.root.getByRole('navigation', { name: 'Pagination' });
  }

  get paginationSummary() {
    return this.pagination.locator('.result-count');
  }

  pageLink(name: string) {
    return this.pagination.getByRole('link', { name, exact: true });
  }

  get emptyState() {
    return this.root.locator('.empty');
  }

  get emptyTitle() {
    return this.emptyState.locator('.empty__title');
  }

  get emptyText() {
    return this.emptyState.locator('.empty__text');
  }

  emptyAction(name: string) {
    return this.emptyState.getByRole('link', { name }).or(this.emptyState.getByRole('button', { name }));
  }

  get emptyReference() {
    return this.emptyState.locator('.text-caption code');
  }

  async choose(name: string) {
    await this.row(name).click();
  }
}
