import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A filter option is named by its label and count: "Jamaican 14 caterers", "Belizean 1 caterer". */
export const optionName = (name: string) => new RegExp(`^${escape(name)} \\d[\\d,]* caterers?$`);

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

  /** Remembers this document, so a later check can tell that no full page load happened (L2-008.6). */
  async markDocument() {
    await this.page.evaluate(() => ((window as unknown as { __kept: boolean }).__kept = true));
  }

  async documentWasKept(): Promise<boolean> {
    return this.page.evaluate(() => (window as unknown as { __kept?: boolean }).__kept === true);
  }

  // Filter column at LG and XL (docs/specs/components/filter-list.md)

  get filterColumn() {
    return this.page.getByRole('complementary', { name: 'Filters' });
  }

  get cuisineGroup() {
    return this.filterColumn.getByRole('group', { name: 'Cuisine' });
  }

  get areaGroup() {
    return this.filterColumn.getByRole('group', { name: 'Area' });
  }

  get cuisineItems() {
    return this.cuisineGroup.locator('.filter-list__item');
  }

  get areaItems() {
    return this.areaGroup.locator('.filter-list__item');
  }

  get allCuisines() {
    return this.cuisineGroup.getByRole('link', { name: 'All', exact: true });
  }

  get moreCuisines() {
    return this.cuisineGroup.locator('button.filter-more');
  }

  /** An option by its name; its accessible name is "Jamaican 14 caterers". */
  cuisineOption(name: string) {
    return this.cuisineGroup.getByRole('button', { name: optionName(name) });
  }

  areaOption(name: string) {
    return this.areaGroup.getByRole('button', { name: optionName(name) });
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
