import { SectionPage } from './profile-sections.page';

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
