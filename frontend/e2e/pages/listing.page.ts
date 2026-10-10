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

  async openCaterer(name: string) {
    await this.card(name).click();
  }
}
