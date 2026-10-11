import { ConsoleDialog, OperatorScreen } from './operator-screen';

/** Held and hidden reviews, /admin/reviews (docs/mocks/pages/admin-reviews, dialogs/moderate-review). */
export class OperatorReviewsPage extends OperatorScreen {
  async open(query = '') {
    await this.page.goto(`/admin/reviews${query}`);
  }

  /** The moderation dialog, named by its question ("Approve Andre C.’s review?"). */
  dialog(name: string | RegExp) {
    return new ConsoleDialog(this.page, name);
  }

  get tabs() {
    return this.page.getByRole('list', { name: 'Review status' });
  }

  tab(name: 'Held' | 'Hidden') {
    return this.tabs.getByRole('link', { name: new RegExp(`^${name}`) });
  }

  get currentTab() {
    return this.tabs.locator('a[aria-current="page"]');
  }

  get searchBox() {
    return this.page.getByRole('search').getByRole('searchbox', { name: 'Caterer or reviewer' });
  }

  get resultCount() {
    return this.workArea.locator('p.result-count[role="status"]');
  }

  get list() {
    return this.workArea.locator('ul.review-list');
  }

  get reviews() {
    return this.list.locator(':scope > li.review:not([aria-hidden="true"])');
  }

  get skeletons() {
    return this.list.locator(':scope > li.review[aria-hidden="true"]');
  }

  review(caterer: string) {
    return this.reviews.filter({ has: this.page.locator('.review__author', { hasText: caterer }) });
  }

  get caterers() {
    return this.reviews.locator('.review__author');
  }

  statusOf(caterer: string) {
    return this.review(caterer).locator('.status');
  }

  timeOf(caterer: string) {
    return this.review(caterer).locator('.cluster .text-caption');
  }

  bylineOf(caterer: string) {
    return this.review(caterer).locator('.review__date');
  }

  bodyOf(caterer: string) {
    return this.review(caterer).locator('.review__body');
  }

  highlightsOf(caterer: string) {
    return this.review(caterer).locator('mark');
  }

  /** "Approve review by Priya R. of Sugar Dumplin" */
  action(name: 'Approve' | 'Keep hidden' | 'Restore' | 'Remove', reviewer: string, caterer: string) {
    return this.list.getByRole('button', { name: `${name} review by ${reviewer} of ${caterer}`, exact: true });
  }
}
