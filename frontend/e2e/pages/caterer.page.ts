import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** A caterer's public page, /caterers/:slug (docs/mocks/pages/caterer). */
export class CatererPage extends BasePage {
  async open(slug: string) {
    await this.page.goto(`/caterers/${slug}`);
  }

  get backLink() {
    return this.main.locator('a.eyebrow');
  }

  /** The cuisines under the name, primary first. */
  get cuisines() {
    return this.main.locator('.caterer-head__meta > li:not(:has(a))');
  }

  get description() {
    return this.main.locator('.caterer-layout .prose > p');
  }

  /** The desktop side panel (LG and up). */
  get panel() {
    return this.page.getByRole('complementary', { name: 'Enquire' });
  }

  /** The bar fixed to the bottom of phones and tablets (below LG). */
  get stickyBar() {
    return this.page.locator('.sticky-cta');
  }

  /** The guests and occasions summary in the main column (below LG). */
  get mainFacts() {
    return this.main.locator('.caterer-layout > div dl.facts');
  }

  /** The value of one fact ("Guests", "Occasions") in a facts list. */
  fact(facts: Locator, term: string) {
    return facts.locator('div').filter({ has: this.page.locator('dt', { hasText: term }) }).locator('dd');
  }

  occasions(facts: Locator) {
    return this.fact(facts, 'Occasions').locator('.inline-list > li');
  }

  /** Every visible "Send an enquiry" button: in the flow, in the panel and in the bar. */
  get enquireButtons() {
    return this.page.getByRole('button', { name: 'Send an enquiry' });
  }

  enquireButtonIn(scope: Locator) {
    return scope.getByRole('button', { name: 'Send an enquiry' });
  }

  get menu() {
    return this.main.getByRole('region', { name: 'Menu' });
  }

  get menuCount() {
    return this.menu.locator('.caterer-section__head .result-count');
  }

  /** Dishes on show; dishes past the first 12 are hidden until the menu is expanded. */
  get dishes() {
    return this.menu.locator('.dish-list > li.dish').filter({ visible: true });
  }

  get dishNames() {
    return this.dishes.locator('.dish__name');
  }

  dish(name: string) {
    return this.menu.locator('li.dish').filter({ has: this.page.locator('.dish__name', { hasText: new RegExp(`^${name}$`) }) });
  }

  dishPart(dish: Locator, part: 'name' | 'price' | 'desc') {
    return dish.locator(`.dish__${part}`);
  }

  dishTags(dish: Locator) {
    return dish.locator('.tags > li.tag');
  }

  dishAllergens(dish: Locator) {
    return dish.locator('.tags > li.tag--allergen');
  }

  get menuToggle() {
    return this.menu.getByRole('button', { name: /^Show (all \d+|fewer) dishes$/ });
  }

  get menuStatus() {
    return this.menu.getByRole('status');
  }

  metaContent(name: string) {
    return this.page.locator(`head meta[name="${name}"], head meta[property="${name}"]`);
  }

  get canonical() {
    return this.page.locator('head link[rel="canonical"]');
  }
}
