import { OperatorConsolePage } from './operator-console.page';

/** Edits to published profiles from the last 30 days, /admin/changes (docs/mocks/pages/admin-changes). */
export class RecentChangesPage extends OperatorConsolePage {
  async goto(query = '') {
    await this.page.goto(`/admin/changes${query}`);
  }

  get subtitle() {
    return this.workArea.locator('.page-intro .subtitle');
  }

  get list() {
    return this.workArea.locator('ul.review-list');
  }

  get entries() {
    return this.list.locator('li.review:not(.review--skeleton)');
  }

  get skeletons() {
    return this.list.locator('li.review--skeleton');
  }

  get headings() {
    return this.entries.locator('.review__author');
  }

  entry(heading: string) {
    return this.entries.filter({ has: this.page.locator('.review__author', { hasText: heading }) }).first();
  }

  byline(heading: string) {
    return this.entry(heading).locator('.review__date');
  }

  was(heading: string) {
    return this.entry(heading).locator('dt:text-is("Was") + dd');
  }

  now(heading: string) {
    return this.entry(heading).locator('dt:text-is("Now") + dd');
  }

  photos(heading: string) {
    return this.entry(heading).locator('.photo--md img');
  }

  revert(heading: string) {
    return this.entry(heading).getByRole('button', { name: /^Revert/ });
  }

  reverted(heading: string) {
    return this.entry(heading).locator('.review__actions .status');
  }

  get loadingStatus() {
    return this.workArea.getByRole('status').filter({ hasText: 'Loading recent changes' });
  }

  get empty() {
    return this.workArea.locator('.empty');
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
