import { BasePage } from './base.page';
import { EmptyState } from './empty-state';

/** Occasions, /occasions (docs/mocks/pages/occasions). */
export class OccasionsPage extends BasePage {
  async open() {
    await this.page.goto('/occasions');
  }

  get subtitle() {
    return this.page.locator('.page-intro .subtitle');
  }

  get grid() {
    return this.page.locator('ul.occasion-grid');
  }

  get tiles() {
    return this.grid.locator('a.caterer-card');
  }

  get skeletonTiles() {
    return this.grid.locator('.caterer-card--skeleton');
  }

  tile(name: string) {
    return this.tiles.filter({ has: this.page.locator('.caterer-card__name', { hasText: name }) });
  }

  get tileNames() {
    return this.tiles.locator('.caterer-card__name');
  }

  get tileCounts() {
    return this.tiles.locator('.caterer-card__meta');
  }

  get tilePhotos() {
    return this.tiles.locator('img');
  }

  get loadingStatus() {
    return this.page.locator('main p.visually-hidden[role="status"]');
  }

  get emptyState() {
    return new EmptyState(this.main);
  }
}
