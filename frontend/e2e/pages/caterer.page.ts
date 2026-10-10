import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { PhotoViewer } from './photo-viewer';

/** A caterer's public page, /caterers/:slug (docs/mocks/pages/caterer). */
export class CatererPage extends BasePage {
  readonly viewer: PhotoViewer;

  constructor(page: Page) {
    super(page);
    this.viewer = new PhotoViewer(page);
  }

  /** Whether the page behind an open dialog is inert. */
  async pageIsInert(): Promise<boolean> {
    return this.main.evaluate((el) => el.closest('[inert]') !== null);
  }

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

  /** Whether each allergen tag on the dish draws its warning icon (not just an empty box). */
  async allergenIconsDrawn(dish: Locator): Promise<boolean[]> {
    return this.dishAllergens(dish).evaluateAll((tags) => tags.map((t) => ((t.querySelector('svg') as SVGGraphicsElement | null)?.getBBox().width ?? 0) > 0));
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
    return this.main.locator('section.gallery:not([aria-busy]) .gallery__track').evaluate((track) => {
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
    return this.main.locator('section.gallery:not([aria-busy]) .gallery__track').evaluate((track) => track.scrollWidth > track.clientWidth && getComputedStyle(track).overflowX === 'auto');
  }

  /** "Rated 4.7 · 23 reviews" under the name, linking to the reviews. */
  get ratingLink() {
    return this.main.locator('.caterer-head__meta a');
  }

  get reviewsSection() {
    return this.main.getByRole('region', { name: 'Reviews' });
  }

  get ratingSummary() {
    return this.reviewsSection.locator('.rating__summary');
  }

  get reviews() {
    return this.reviewsSection.locator('.review-list > li.review');
  }

  review(n: number) {
    return this.reviews.nth(n - 1);
  }

  reviewByAuthor(author: string) {
    return this.reviews.filter({ has: this.page.locator('.review__author', { hasText: author }) });
  }

  reviewPart(review: Locator, part: 'author' | 'date' | 'body') {
    return review.locator(`.review__head .review__${part}, :scope > .review__${part}`).first();
  }

  reviewStars(review: Locator) {
    return review.locator('.stars[role="img"]');
  }

  reviewResponse(review: Locator) {
    return review.locator('.review__response');
  }

  get showMoreReviews() {
    return this.reviewsSection.getByRole('button', { name: 'Show more reviews' });
  }

  get reviewsStatus() {
    return this.reviewsSection.locator('p[role="status"]');
  }

  /** The quiet text a section shows when there are no reviews yet. */
  get noReviews() {
    return this.reviewsSection.locator('p');
  }

  /** Opens the page and returns the bodies of every API response it used. */
  async openCollectingResponses(slug: string): Promise<string[]> {
    const bodies: Promise<string>[] = [];
    const listener = (response: import('@playwright/test').Response) => {
      if (response.url().includes('/api/')) bodies.push(response.text().catch(() => ''));
    };
    this.page.on('response', listener);
    await this.open(slug);
    await this.heading.waitFor();
    await this.reviews.first().waitFor().catch(() => undefined);
    this.page.off('response', listener);
    return Promise.all(bodies);
  }

  /** Everything the page shows, as text and markup. */
  async pageMarkup(): Promise<string> {
    return this.page.content();
  }

  get loadingStatus() {
    return this.main.locator(':scope > p[role="status"], app-caterer-page > p[role="status"]').first();
  }

  get layout() {
    return this.main.locator('.caterer-layout');
  }

  get galleryBusy() {
    return this.main.locator('section.gallery[aria-busy="true"]');
  }

  get menuSkeleton() {
    return this.main.locator('.dish-list[aria-busy="true"] .dish--skeleton');
  }

  /** The "We couldn't load …" state. */
  get loadError() {
    return this.main.locator('.empty--error');
  }

  get loadErrorText() {
    return this.loadError.locator('.empty__text');
  }

  get loadErrorReference() {
    return this.loadError.locator('.text-caption code');
  }

  loadErrorAction(name: string) {
    return this.loadError.getByRole('button', { name }).or(this.loadError.getByRole('link', { name }));
  }

  /** The system page shown for a removed caterer (410) and its parts. */
  get systemText() {
    return this.main.locator('.system-page .prose');
  }

  get systemCode() {
    return this.main.locator('.system-page__code');
  }

  systemAction(name: string) {
    return this.main.locator('.system-page__actions').getByRole('link', { name });
  }

  /** The page's parts in reading order, as L2-015 names them (on a phone, where all sit in one column). */
  async sectionOrder(): Promise<string[]> {
    return this.main.evaluate((main) => {
      const parts: [string, Element | null][] = [
        ['photo gallery', main.querySelector('section.gallery')],
        ['business name', main.querySelector('h1')],
        ['cuisines', main.querySelector('.caterer-head__meta')],
        ['description', main.querySelector('.caterer-layout .prose')],
        ['event sizes and occasions', main.querySelector('.caterer-layout > div dl.facts')],
        ['menu', main.querySelector('[aria-labelledby="menu-title"]')],
        ['service areas', main.querySelector('[aria-labelledby="areas-title"]')],
        ['reviews', main.querySelector('#reviews')],
        ['send an enquiry', main.querySelector('.caterer-layout > div > .caterer-section.until-lg')],
      ];
      return parts
        .filter((p): p is [string, Element] => p[1] !== null)
        .sort((a, b) => (a[1].compareDocumentPosition(b[1]) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1))
        .map(([name]) => name);
    });
  }

  /** Whether the name is shown in full, wrapping rather than cut off. */
  async nameFits(): Promise<boolean> {
    return this.heading.evaluate((h) => h.scrollWidth <= h.clientWidth + 1 && getComputedStyle(h).textOverflow !== 'ellipsis');
  }

  /** Elements (not text) inside the description, which must show markup as literal text. */
  get descriptionElements() {
    return this.main.locator('.caterer-layout .prose > p *');
  }

  reviewBodyElements(review: Locator) {
    return review.locator('.review__body *');
  }

  metaContent(name: string) {
    return this.page.locator(`head meta[name="${name}"], head meta[property="${name}"]`);
  }

  get canonical() {
    return this.page.locator('head link[rel="canonical"]');
  }
}
