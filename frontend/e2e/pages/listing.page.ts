import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** The caterer listing, /caterers (docs/mocks/pages/caterers). */
export class ListingPage extends BasePage {
  async open(query = '') {
    await this.page.goto(`/caterers${query}`);
  }

  get resultCount() {
    return this.page.locator('.browse__title .result-count');
  }

  get resultsHeading() {
    return this.page.getByRole('heading', { name: 'Results', exact: true });
  }

  get cards() {
    return this.page.locator('.caterer-grid .caterer-card');
  }

  card(name: string) {
    return this.cards.filter({ has: this.page.locator('.caterer-card__name', { hasText: name }) });
  }

  cardPhoto(card: Locator) {
    return card.locator('img');
  }

  cardName(card: Locator) {
    return card.locator('.caterer-card__name');
  }

  cardMeta(card: Locator) {
    return card.locator('.caterer-card__meta');
  }

  async cardNames(): Promise<string[]> {
    return this.cards.locator('.caterer-card__name').allTextContents();
  }

  async openCaterer(name: string) {
    await this.card(name).click();
  }

  // Pagination (docs/specs/components/pagination.md)

  get pagination() {
    return this.page.getByRole('navigation', { name: 'Pagination' });
  }

  get paginationSummary() {
    return this.pagination.locator('.result-count');
  }

  pageLink(n: number) {
    return this.pagination.getByRole('link', { name: `Page ${n}`, exact: true });
  }

  /** The numbered page links that are visible at the current width. */
  get pageLinks() {
    return this.pagination.locator('ul.pagination li:visible a[aria-label^="Page "]');
  }

  get previousPage() {
    return this.pagination.getByRole('link', { name: 'Previous page' });
  }

  get nextPage() {
    return this.pagination.getByRole('link', { name: 'Next page' });
  }
}
