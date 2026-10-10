import type { Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { EmptyState } from './empty-state';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** A filter option is named by its label and count: "Jamaican 14 caterers", "Belizean 1 caterer". */
export const optionName = (name: string, counted = true) => new RegExp(`^${escape(name)}${counted ? ' \\d[\\d,]* caterers?' : ''}$`);

/** The caterer listing, /caterers (docs/mocks/pages/caterers). */
export class ListingPage extends BasePage {
  async open(query = '') {
    await this.page.goto(`/caterers${query}`);
  }

  get resultCount() {
    return this.page.locator('.browse__title .result-count');
  }

  /** The "Occasions" link above an occasion's heading. */
  get backToOccasions() {
    return this.page.locator('.browse__title a.eyebrow');
  }

  get resultsHeading() {
    return this.page.getByRole('heading', { name: 'Results', exact: true });
  }

  get grid() {
    return this.page.locator('ul.caterer-grid');
  }

  get cards() {
    return this.page.locator('.caterer-grid .caterer-card:not(.caterer-card--skeleton)');
  }

  /** Placeholder cards while results load (docs/specs/components/skeleton.md). */
  get skeletonCards() {
    return this.page.locator('.caterer-grid .caterer-card--skeleton');
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

  /** An option by its name; its accessible name is "Jamaican 14 caterers", or just "Jamaican" before counts are known. */
  cuisineOption(name: string, { counted = true } = {}) {
    return this.cuisineGroup.getByRole('button', { name: optionName(name, counted) });
  }

  areaOption(name: string, { counted = true } = {}) {
    return this.areaGroup.getByRole('button', { name: optionName(name, counted) });
  }

  /** The area or postal code search in the column's Area group. */
  get areaSearch() {
    return this.areaGroup.getByRole('combobox', { name: 'Area or postal code' });
  }

  get areaSuggestions() {
    return this.areaGroup.getByRole('listbox', { name: 'Matching areas' }).getByRole('option');
  }

  get areaNoMatch() {
    return this.areaGroup.locator('.suggestions__empty');
  }

  get areaError() {
    return this.areaGroup.locator('.field__error');
  }

  get areaWarning() {
    return this.areaGroup.locator('.field__warning');
  }

  async searchArea(text: string) {
    await this.areaSearch.fill(text);
    await this.areaSearch.press('Enter');
  }

  // Filter bar at MD and the phone bar (docs/specs/components/filter-trigger.md)

  /** Switch to a tablet-sized viewport (MD). */
  async useTablet() {
    await this.page.setViewportSize({ width: 800, height: 900 });
  }

  get cuisineTrigger() {
    return this.page.locator('.filter-bar').getByRole('button', { name: /^Cuisine/ });
  }

  get areaTrigger() {
    return this.page.locator('.filter-bar').getByRole('button', { name: /^Area/ });
  }

  /** The phone "Filters" button. */
  get filtersButton() {
    return this.page.locator('.mobile-browse-bar').getByRole('button', { name: /^Filters/ });
  }

  /** The phone button that opens the area or postal code search. */
  get phoneAreaButton() {
    return this.page.locator('.mobile-browse-bar').getByRole('button', { name: /^Area/ });
  }

  /** The phone Filters sheet (docs/mocks/dialogs/filters). */
  get filtersSheet() {
    return new FiltersSheet(this.page.getByRole('dialog', { name: /^Filters/ }));
  }

  /** An open filter dropdown at MD, named by its title. */
  dropdown(title: 'Cuisine' | 'Area') {
    return new FilterDropdown(this.page.locator('.filter-dropdown').filter({ has: this.page.getByRole('heading', { name: title, exact: true }) }));
  }

  // Active filters above the results (docs/specs/components/chip.md)

  get activeFilters() {
    return this.page.getByRole('group', { name: 'Active filters' });
  }

  get activeFilterChips() {
    return this.activeFilters.locator('.chip--filter');
  }

  /** The chips' remove buttons and "Clear filters", in order. */
  get activeFilterControls() {
    return this.activeFilters.locator('button, a');
  }

  removeFilter(label: string) {
    return this.activeFilters.getByRole('button', { name: `Remove ${label} filter` });
  }

  get clearFilters() {
    return this.activeFilters.getByRole('link', { name: 'Clear filters' });
  }

  /** The no-results, empty and error states in the results. */
  get emptyState() {
    return new EmptyState(this.page.locator('.browse__results'));
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

/** The Filters sheet: pending choices, Clear and "Show N caterers". */
export class FiltersSheet {
  constructor(readonly dialog: Locator) {}

  get title() {
    return this.dialog.locator('.sheet__title');
  }

  get close() {
    return this.dialog.getByRole('button', { name: 'Close filters' });
  }

  get cuisines() {
    return this.dialog.getByRole('group', { name: 'Cuisine' }).getByRole('checkbox');
  }

  get regions() {
    return this.dialog.getByRole('group', { name: 'Area' }).getByRole('checkbox');
  }

  choice(name: string) {
    return this.dialog.getByRole('checkbox', { name: optionName(name) });
  }

  get search() {
    return this.dialog.getByRole('combobox', { name: 'Area or postal code' });
  }

  get suggestions() {
    return this.dialog.getByRole('listbox', { name: 'Matching areas' }).getByRole('option');
  }

  get selectedAreas() {
    return this.dialog.getByRole('group', { name: 'Selected areas' }).locator('.chip--filter');
  }

  removeArea(name: string) {
    return this.dialog.getByRole('group', { name: 'Selected areas' }).getByRole('button', { name: `Remove ${name} filter` });
  }

  get clear() {
    return this.dialog.getByRole('button', { name: 'Clear', exact: true });
  }

  get apply() {
    return this.dialog.getByRole('button', { name: /^Show \d[\d,]* caterers?$/ });
  }
}

/** A filter dropdown (`.filter-dropdown[role=dialog]`): checkboxes with counts, Clear and the live total. */
export class FilterDropdown {
  constructor(readonly panel: Locator) {}

  get choices() {
    return this.panel.getByRole('checkbox');
  }

  choice(name: string) {
    return this.panel.getByRole('checkbox', { name: optionName(name) });
  }

  get status() {
    return this.panel.locator('.result-count[role="status"]');
  }

  get clear() {
    return this.panel.getByRole('button', { name: 'Clear', exact: true });
  }

  get search() {
    return this.panel.getByRole('combobox', { name: 'Area or postal code' });
  }

  get suggestions() {
    return this.panel.getByRole('listbox', { name: 'Matching areas' }).getByRole('option');
  }
}
