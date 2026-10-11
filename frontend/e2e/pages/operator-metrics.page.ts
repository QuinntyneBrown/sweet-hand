import { readFile } from 'node:fs/promises';
import { OperatorScreen } from './operator-screen';

/** The metrics dashboard, /admin/metrics (docs/mocks/pages/admin-metrics). */
export class OperatorMetricsPage extends OperatorScreen {
  async open(query = '') {
    await this.page.goto(`/admin/metrics${query}`);
  }

  get rangeForm() {
    return this.page.getByRole('form', { name: 'Date range' });
  }

  get from() {
    return this.rangeForm.getByLabel('From', { exact: true });
  }

  get to() {
    return this.rangeForm.getByLabel('To', { exact: true });
  }

  get showBy() {
    return this.rangeForm.getByLabel('Show by', { exact: true });
  }

  get apply() {
    return this.rangeForm.getByRole('button', { name: 'Apply' });
  }

  get exportButton() {
    return this.rangeForm.getByRole('button', { name: 'Export CSV' });
  }

  /** Activates Export CSV and returns the file that downloads (L2-063.1). */
  async exportCsv(): Promise<{ name: string; text: string }> {
    const download = this.page.waitForEvent('download');
    await this.exportButton.click();
    const file = await download;
    return { name: file.suggestedFilename(), text: await readFile(await file.path(), 'utf8') };
  }

  get errorSummary() {
    return this.workArea.locator('.form-summary');
  }

  get fromError() {
    return this.rangeForm.locator('.field__error');
  }

  get stats() {
    return this.workArea.locator('dl.stat-grid .stat');
  }

  get busyStats() {
    return this.workArea.locator('.stat-grid[aria-busy="true"] .stat');
  }

  stat(label: string) {
    return this.stats.filter({ has: this.page.locator('.stat__label', { hasText: label }) });
  }

  statValue(label: string) {
    return this.stat(label).locator('.stat__value');
  }

  statDelta(label: string) {
    return this.stat(label).locator('.stat__delta');
  }

  statCaption(label: string) {
    return this.stat(label).locator('.text-caption');
  }

  get chartHeadings() {
    return this.workArea.locator('.chart-card h3');
  }

  get busyCharts() {
    return this.workArea.locator('.chart-card[aria-hidden="true"]');
  }

  chart(title: string) {
    return this.page.getByRole('region', { name: title, exact: true });
  }

  chartImage(title: string) {
    return this.chart(title).getByRole('img');
  }

  bars(title: string) {
    return this.chart(title).locator('.bar-chart__bar');
  }

  axis(title: string) {
    return this.chart(title).locator('.bar-chart__axis span');
  }

  total(title: string) {
    return this.chart(title).locator('.chart-card__total');
  }

  tableToggle(title: string) {
    return this.chart(title).locator('summary');
  }

  /** Opens "Show as a table" and returns its body rows. */
  async tableRows(title: string) {
    await this.tableToggle(title).click();
    return this.chart(title).getByRole('table').locator('tbody tr');
  }

  chartFailure(title: string) {
    return this.chart(title).locator('.alert--danger');
  }

  /** The one summary alert over the charts when some fail. */
  get partialAlert() {
    return this.workArea.locator(':scope .alert--danger[role="alert"]');
  }

  get statusSection() {
    return this.page.getByRole('region', { name: 'Caterers by status' });
  }

  get statusRows() {
    return this.statusSection.locator('tbody tr');
  }

  get statusCaption() {
    return this.statusSection.locator('caption');
  }
}
