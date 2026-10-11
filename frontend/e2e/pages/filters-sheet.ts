import type { Locator } from '@playwright/test';
import { optionName } from './listing.page';

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
