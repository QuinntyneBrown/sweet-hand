import { DashboardDialog, DashboardScreen } from './dashboard.page';

/** What the autosaving section pages share (docs/mocks/pages/profile-cuisines, profile-events). */
abstract class SectionPage extends DashboardScreen {
  readonly withdrawDialog = new DashboardDialog(this.page, 'Withdraw your submission?');

  /** Let the 2-second autosave pause pass (L2-038.1). */
  async pause(ms = 2000) {
    await this.page.clock.runFor(ms);
  }

  /** The value next to a term while the section is read-only. */
  readOnly(term: string) {
    return this.main.locator('dl.kv dt', { hasText: new RegExp(`^${term}$`) }).locator('xpath=following-sibling::dd[1]');
  }

  get readOnlyTerms() {
    return this.main.locator('dl.kv dt');
  }

  errorFor(id: string) {
    return this.main.locator(`#${id}-error`);
  }

  get checkboxes() {
    return this.main.getByRole('checkbox');
  }

  get facts() {
    return this.previewPane.locator('dl.facts');
  }
}

/** Cuisines and areas, /dashboard/profile/cuisines (docs/mocks/pages/profile-cuisines). */
export class ProfileCuisinesPage extends SectionPage {
  async open() {
    await this.page.goto('/dashboard/profile/cuisines');
  }

  get cuisines() {
    return this.main.getByRole('group', { name: 'Cuisines' });
  }

  get cuisineLabels() {
    return this.cuisines.locator('.choice__text');
  }

  cuisine(name: string) {
    return this.cuisines.getByRole('checkbox', { name, exact: true });
  }

  get checkedCuisines() {
    return this.cuisines.locator('input:checked + .choice__text');
  }

  get primaryCuisines() {
    return this.main.getByRole('group', { name: 'Primary cuisine' }).getByRole('radio');
  }

  primaryCuisine(name: string) {
    return this.main.getByRole('group', { name: 'Primary cuisine' }).getByRole('radio', { name, exact: true });
  }

  /** "All of Peel", whose description says how many of its areas are ticked. */
  region(name: string) {
    return this.main.getByRole('checkbox', { name: new RegExp(`^All of ${name}`) });
  }

  regionCount(name: string) {
    return this.main.locator('label.choice', { hasText: `All of ${name}` }).locator('small');
  }

  area(name: string) {
    return this.main.getByRole('group', { name: 'Areas you serve' }).getByRole('checkbox', { name, exact: true });
  }

  get primaryArea() {
    return this.main.getByRole('combobox', { name: 'Primary area' });
  }

  get primaryAreaOptions() {
    return this.primaryArea.locator('option');
  }
}

/** Guests and occasions, /dashboard/profile/events (docs/mocks/pages/profile-events). */
export class ProfileEventsPage extends SectionPage {
  async open() {
    await this.page.goto('/dashboard/profile/events');
  }

  get smallest() {
    return this.main.getByRole('textbox', { name: 'Smallest event' });
  }

  get largest() {
    return this.main.getByRole('textbox', { name: 'Largest event' });
  }

  get guestsHelp() {
    return this.main.locator('#guests-help');
  }

  occasion(name: string) {
    return this.main.getByRole('group', { name: 'Occasions' }).getByRole('checkbox', { name, exact: true });
  }

  get checkedOccasions() {
    return this.main.getByRole('group', { name: 'Occasions' }).locator('input:checked + .choice__text');
  }
}
