import type { Locator } from '@playwright/test';
import { optionName } from './listing.page';

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
