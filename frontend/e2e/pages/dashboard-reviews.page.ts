import { DashboardDialog } from './dashboard-dialog';
import { DashboardScreen } from './dashboard-screen';

/** The caterer's reviews, /dashboard/reviews (docs/mocks/pages/dashboard-reviews). */
export class DashboardReviewsPage extends DashboardScreen {
  readonly response = new DashboardDialog(this.page, /^(Respond to .*|Edit your response)$/);

  async open() {
    await this.page.goto('/dashboard/reviews');
  }

  get reviews() {
    return this.main.locator('.review-list > .review');
  }

  get authors() {
    return this.main.locator('.review-list .review__author');
  }

  review(author: string) {
    return this.reviews.filter({ has: this.page.locator('.review__author', { hasText: new RegExp(`^${author}$`) }) });
  }

  dateOf(author: string) {
    return this.review(author).locator('.review__date');
  }

  responseOf(author: string) {
    return this.review(author).locator('.review__response');
  }

  awaitingOf(author: string) {
    return this.review(author).locator('.status--pending');
  }

  respond(author: string) {
    return this.main.getByRole('button', { name: `Respond to ${author}`, exact: true });
  }

  editResponse(author: string) {
    return this.main.getByRole('button', { name: `Edit response to ${author}`, exact: true });
  }

  get showMore() {
    return this.main.getByRole('button', { name: 'Show more reviews' });
  }

  get empty() {
    return this.main.locator('.empty:not(.empty--error)');
  }

  get text() {
    return this.response.root.getByRole('textbox', { name: 'Your response' });
  }

  get help() {
    return this.response.root.locator('#response-help');
  }
}
