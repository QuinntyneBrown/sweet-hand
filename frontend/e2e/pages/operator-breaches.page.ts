import { ConsoleDialog } from './console-dialog';
import { OperatorScreen } from './operator-screen';

/** The breach register, /admin/breaches (docs/mocks/pages/admin-breaches, dialogs/record-breach). */
export class OperatorBreachesPage extends OperatorScreen {
  readonly recordDialog = new ConsoleDialog(this.page, 'Record a breach');

  async open() {
    await this.page.goto('/admin/breaches');
  }

  get list() {
    return this.page.getByRole('list', { name: 'Recorded breaches, newest first' });
  }

  get loadingList() {
    return this.page.getByRole('list', { name: 'Loading breach records' });
  }

  get records() {
    return this.list.locator(':scope > li.breach');
  }

  get titles() {
    return this.list.locator('.breach__title');
  }

  get whens() {
    return this.list.locator('.breach__when');
  }

  /** A value of the nth record (0 is the newest): "People affected". */
  detail(index: number, term: string) {
    return this.records.nth(index).locator('dl.kv dt', { hasText: term }).locator('xpath=following-sibling::dd[1]');
  }

  get recordButton() {
    return this.button('Record a breach');
  }
}
