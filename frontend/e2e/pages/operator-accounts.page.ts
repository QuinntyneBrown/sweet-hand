import { ConsoleDialog, OperatorScreen } from './operator-screen';

/** Operator accounts, /admin/operators (docs/mocks/pages/admin-operators, dialogs add-operator and deactivate-operator). */
export class OperatorAccountsPage extends OperatorScreen {
  readonly addDialog = new ConsoleDialog(this.page, 'Add operator');

  async open() {
    await this.page.goto('/admin/operators');
  }

  deactivateDialog(name: string) {
    return new ConsoleDialog(this.page, `Deactivate ${name}?`);
  }

  get list() {
    return this.page.getByRole('list', { name: 'Operators' });
  }

  get loadingList() {
    return this.page.getByRole('list', { name: 'Loading operators' });
  }

  get rows() {
    return this.list.locator(':scope > li.admin-row');
  }

  get names() {
    return this.list.locator('.admin-row__title');
  }

  get metas() {
    return this.list.locator('.admin-row__meta');
  }

  get avatars() {
    return this.list.locator('.avatar');
  }

  row(name: string) {
    return this.rows.filter({ has: this.page.locator('.admin-row__title', { hasText: name }) });
  }

  deactivateButton(name: string) {
    return this.list.getByRole('button', { name: `Deactivate ${name}`, exact: true });
  }

  get addButton() {
    return this.button('Add operator');
  }

  get note() {
    return this.workArea.locator('p.text-caption').last();
  }
}
