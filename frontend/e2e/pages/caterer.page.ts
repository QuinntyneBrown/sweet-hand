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

  metaContent(name: string) {
    return this.page.locator(`head meta[name="${name}"], head meta[property="${name}"]`);
  }

  get canonical() {
    return this.page.locator('head link[rel="canonical"]');
  }
}
