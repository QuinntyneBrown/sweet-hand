import { SectionPage } from './profile-sections.page';

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
