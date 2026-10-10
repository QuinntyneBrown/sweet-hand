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

  get areasServed() {
    return this.main.getByRole('region', { name: 'Areas served' });
  }

  get regionNames() {
    return this.areasServed.locator('dl.regions dt');
  }

  /** The areas listed under one region name. */
  areasIn(region: string) {
    return this.fact(this.areasServed.locator('dl.regions'), region);
  }

  /** Switch to a tablet-sized viewport (MD). */
  async useTablet() {
    await this.page.setViewportSize({ width: 800, height: 900 });
  }

  get gallery() {
    return this.main.getByRole('region', { name: 'Photos' });
  }

  /** Every photo button, in order, including any the layout hides. */
  get galleryButtons() {
    return this.main.locator('.gallery .gallery__btn');
  }

  get visibleGalleryButtons() {
    return this.galleryButtons.filter({ visible: true });
  }

  galleryPhoto(n: number) {
    return this.galleryButtons.nth(n - 1);
  }

  galleryImage(n: number) {
    return this.galleryPhoto(n).locator('img');
  }

  galleryPhotoLabel(n: number) {
    return this.galleryPhoto(n).locator('.photo__label');
  }

  /** The "+25 photos" scrim the layout shows on its last visible thumbnail. */
  get galleryMore() {
    return this.main.locator('.gallery .gallery__more').filter({ visible: true });
  }

  get galleryDots() {
    return this.main.locator('.gallery__dots > span');
  }

  get currentGalleryDot() {
    return this.main.locator('.gallery__dots > span[aria-current="true"]');
  }

  /** Which of the three gallery layouts is showing: carousel (XS), lead + strip (SM–MD) or lead + grid (LG–XL). */
  async galleryLayout(): Promise<'carousel' | 'lead-strip' | 'lead-grid'> {
    return this.main.locator('.gallery__track').evaluate((track) => {
      const style = getComputedStyle(track);
      if (style.display === 'flex') return 'carousel';
      return style.gridTemplateColumns.split(' ').length === 5 ? 'lead-strip' : 'lead-grid';
    });
  }

  /** Width in CSS pixels of the lead photo. */
  async leadPhotoWidth(): Promise<number> {
    return (await this.galleryPhoto(1).boundingBox())?.width ?? 0;
  }

  /** The carousel scrolls sideways inside itself. */
  async galleryScrollsSideways(): Promise<boolean> {
    return this.main.locator('.gallery__track').evaluate((track) => track.scrollWidth > track.clientWidth && getComputedStyle(track).overflowX === 'auto');
  }

  metaContent(name: string) {
    return this.page.locator(`head meta[name="${name}"], head meta[property="${name}"]`);
  }

  get canonical() {
    return this.page.locator('head link[rel="canonical"]');
  }
}
