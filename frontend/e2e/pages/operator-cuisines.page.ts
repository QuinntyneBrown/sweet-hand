import { ConsoleDialog } from './console-dialog';
import { OperatorScreen } from './operator-screen';

/** The cuisine list, /admin/cuisines (docs/mocks/pages/admin-cuisines, dialogs add-cuisine and retire-cuisine). */
export class OperatorCuisinesPage extends OperatorScreen {
  readonly addDialog = new ConsoleDialog(this.page, 'Add cuisine');

  async open() {
    await this.page.goto('/admin/cuisines');
  }

  retireDialog(name: string) {
    return new ConsoleDialog(this.page, `Retire ${name}?`);
  }

  get list() {
    return this.page.getByRole('list', { name: 'Cuisines, A to Z' });
  }

  get loadingList() {
    return this.page.getByRole('list', { name: 'Loading cuisines' });
  }

  get skeletonRows() {
    return this.loadingList.locator('li.admin-row--skeleton');
  }

  get rows() {
    return this.list.locator(':scope > li.admin-row');
  }

  get names() {
    return this.list.locator('.admin-row__title');
  }

  row(name: string) {
    return this.rows.filter({ has: this.page.locator('.admin-row__title', { hasText: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }) });
  }

  metaOf(name: string) {
    return this.row(name).locator('.admin-row__meta');
  }

  badgeOf(name: string) {
    return this.row(name).locator('.badge');
  }

  retireButton(name: string) {
    return this.list.getByRole('button', { name: `Retire ${name}`, exact: true });
  }

  get addButton() {
    return this.button('Add cuisine');
  }

  get note() {
    return this.workArea.locator('p.text-caption').last();
  }
}
