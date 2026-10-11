import { DashboardDialog } from './dashboard-dialog';
import { DashboardScreen } from './dashboard-screen';

/** What the autosaving section pages share (docs/mocks/pages/profile-cuisines, profile-events). */
export abstract class SectionPage extends DashboardScreen {
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

