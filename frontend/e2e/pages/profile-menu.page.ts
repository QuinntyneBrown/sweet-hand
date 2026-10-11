import { DashboardDialog, DashboardScreen } from './dashboard.page';

/** Menu, /dashboard/profile/menu (docs/mocks/pages/profile-menu). */
export class ProfileMenuPage extends DashboardScreen {
  readonly dish = new DashboardDialog(this.page, /^(Add a dish|Edit dish)$/);
  readonly remove = new DashboardDialog(this.page, /^(Remove “.*”\?|Keep at least 3 dishes)$/);
  readonly withdrawDialog = new DashboardDialog(this.page, 'Withdraw your submission?');

  async open() {
    await this.page.goto('/dashboard/profile/menu');
  }

  get addDish() {
    return this.main.getByRole('button', { name: /^(Add dish|Add your first dish)$/ });
  }

  get limitHelp() {
    return this.main.locator('#dish-limit');
  }

  get list() {
    return this.main.getByRole('list', { name: 'Dishes, in the order they appear on your page' });
  }

  get rows() {
    return this.main.locator('.edit-list .edit-row');
  }

  get names() {
    return this.main.locator('.edit-list .dish__name');
  }

  row(name: string) {
    return this.rows.filter({ has: this.page.locator('.dish__name', { hasText: new RegExp(`^${name}$`) }) });
  }

  moveUp(name: string) {
    return this.main.getByRole('button', { name: `Move ${name} up`, exact: true });
  }

  moveDown(name: string) {
    return this.main.getByRole('button', { name: `Move ${name} down`, exact: true });
  }

  edit(name: string) {
    return this.main.getByRole('button', { name: `Edit ${name}`, exact: true });
  }

  removeButton(name: string) {
    return this.main.getByRole('button', { name: `Remove ${name}`, exact: true });
  }

  get empty() {
    return this.main.locator('.empty:not(.empty--error)');
  }

  get dishName() {
    return this.dish.root.getByRole('textbox', { name: 'Dish name' });
  }

  get dishDescription() {
    return this.dish.root.getByRole('textbox', { name: /^Description/ });
  }

  get dishPrice() {
    return this.dish.root.getByRole('textbox', { name: /^Price guidance/ });
  }

  tag(name: string) {
    return this.dish.root.getByRole('checkbox', { name, exact: true });
  }
}
