import { OperatorScreen } from './operator-screen';

/** The audit log, /admin/audit (docs/mocks/pages/admin-audit). Admin only. */
export class OperatorAuditPage extends OperatorScreen {
  async open(query = '') {
    await this.page.goto(`/admin/audit${query}`);
  }

  get filters() {
    return this.page.getByRole('form', { name: 'Filter the audit log' });
  }

  get operatorFilter() {
    return this.filters.getByLabel('Operator', { exact: true });
  }

  get actionFilter() {
    return this.filters.getByLabel('Action', { exact: true });
  }

  get targetFilter() {
    return this.filters.getByLabel('Target', { exact: true });
  }

  get fromFilter() {
    return this.filters.getByLabel('From', { exact: true });
  }

  get toFilter() {
    return this.filters.getByLabel('To', { exact: true });
  }

  get apply() {
    return this.filters.getByRole('button', { name: 'Apply' });
  }

  get resultCount() {
    return this.workArea.locator('p.result-count[role="status"]');
  }

  get region() {
    return this.page.getByRole('region', { name: 'Audit entries, newest first' });
  }

  get table() {
    return this.page.getByRole('table', { name: 'Audit entries, newest first' });
  }

  get busyTable() {
    return this.workArea.locator('.table-wrap[aria-busy="true"]');
  }

  get skeletonRows() {
    return this.busyTable.locator('tbody tr[aria-hidden="true"]');
  }

  get headers() {
    return this.table.locator('thead th');
  }

  get rows() {
    return this.table.locator('tbody tr');
  }

  /** The text of one column for every row: 'When', 'Operator', 'Action', 'Target', 'Reason', 'Change'. */
  column(name: 'When' | 'Operator' | 'Action' | 'Target' | 'Reason' | 'Change') {
    const index = ['When', 'Operator', 'Action', 'Target', 'Reason', 'Change'].indexOf(name) + 1;
    return this.rows.locator(`td:nth-child(${index})`);
  }

  get times() {
    return this.rows.locator('td:first-child time');
  }

  get targetIds() {
    return this.rows.locator('td .list__meta');
  }

  get pagination() {
    return this.page.getByRole('navigation', { name: 'Pagination' });
  }

  get pageSummary() {
    return this.pagination.locator('.result-count');
  }

  pageLink(n: number) {
    return this.pagination.getByRole('link', { name: `Page ${n}`, exact: true });
  }

  get editOrDeleteControls() {
    return this.workArea.getByRole('button', { name: /edit|delete/i });
  }
}
