import { test, expect } from '../../../support/test';
import { OperatorMetricsPage } from '../../../pages/operator-metrics.page';

const CHARTS = ['Enquiries', 'Replied within 48 hours', 'Listing page visits', 'Caterer page visits', 'Unique visitors', 'New caterers published'];

test.describe('Metrics dashboard', () => {
  test('L2-061.1 L2-061.5: by week, the week of 28 Sep shows 12 enquiries, and every chart has the same figures as a table', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const metrics = new OperatorMetricsPage(page);

    await metrics.open();

    await expect(metrics.heading).toHaveText('Metrics');
    await expect(metrics.subtitle).toHaveText('31 Aug – 10 Oct 2026 · by week · Toronto time');
    await expect(metrics.from).toHaveValue('2026-08-31');
    await expect(metrics.to).toHaveValue('2026-10-10');
    await expect(metrics.to).toHaveAttribute('max', '2026-10-10');
    await expect(metrics.showBy).toHaveValue('week');
    await expect(metrics.statValue('Published caterers')).toHaveText('60');
    await expect(metrics.statDelta('Published caterers')).toHaveText('+4 in this range');
    await expect(metrics.statDelta('Published caterers')).toHaveClass(/stat__delta--up/);
    await expect(metrics.statValue('Enquiries')).toHaveText('71');
    await expect(metrics.statValue('Replied within 48 hours')).toHaveText('82%');
    await expect(metrics.statValue('Caterer page visits')).toHaveText('39,700');
    await expect(metrics.chartHeadings).toHaveText(CHARTS);
    await expect(metrics.chartImage('Enquiries')).toHaveAttribute(
      'aria-label',
      'Enquiries by week. 31 Aug: 8, 7 Sep: 11, 14 Sep: 15, 21 Sep: 13, 28 Sep: 12, 5 Oct so far: 12.',
    );
    await expect(metrics.bars('Enquiries')).toHaveCount(6);
    await expect(metrics.bars('Enquiries').last()).toHaveClass(/bar-chart__bar--accent/);
    await expect(metrics.axis('Enquiries')).toHaveText(['31 Aug', '7 Sep', '14 Sep', '21 Sep', '28 Sep', '5 Oct']);
    await expect(metrics.total('Enquiries')).toHaveText('71');
    await expect(metrics.chartImage('Replied within 48 hours')).toHaveAttribute(
      'aria-label',
      'Replied within 48 hours by week. 31 Aug: 75%, 7 Sep: 82%, 14 Sep: 80%, 21 Sep: 85%, 28 Sep: 83%, 5 Oct so far: 88%.',
    );
    await expect(metrics.total('Listing page visits')).toHaveText('22,670');
    await expect(metrics.total('Unique visitors')).toHaveText('2,578 avg');
    await expect(metrics.total('New caterers published')).toHaveText('4');

    const rows = await metrics.tableRows('Enquiries');
    await expect(rows).toHaveCount(6);
    await expect(rows.nth(4)).toHaveText('Week of 28 Sep12');
    await expect(metrics.chart('Enquiries').getByRole('table')).toHaveAccessibleName('Enquiries by week');
    await expect(metrics.statusCaption).toHaveText('Caterers by status on 10 Oct 2026');
    await expect(metrics.statusRows).toHaveText(['Published60', 'Pending review3', 'Changes requested1', 'Draft9', 'Suspended1', 'Removed2']);
    await expect(metrics.exportButton).toBeEnabled();
    await expect(metrics.currentSideNavLink).toHaveText('Metrics');
    await metrics.expectNoAccessibilityViolations();
  });

  test('L2-064.2: the dashboard works at phone width without sideways scrolling', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const metrics = new OperatorMetricsPage(page);
    await metrics.usePhone();

    await metrics.open();

    await expect(metrics.chartHeadings).toHaveCount(6);
    await metrics.expectNoHorizontalScroll();
    await metrics.expectNoAccessibilityViolations();
  });

  test('L2-061: the range and granularity are chosen and kept in the address', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const metrics = new OperatorMetricsPage(page);
    await metrics.open();

    await metrics.showBy.selectOption('month');
    await metrics.apply.click();

    await expect(page).toHaveURL(/by=month/);
    await expect(metrics.subtitle).toHaveText('31 Aug – 10 Oct 2026 · by month · Toronto time');
    await expect(metrics.chartImage('Enquiries')).toHaveAttribute('aria-label', 'Enquiries by month. Aug: 1, Sep: 52, Oct so far: 18.');
    const rows = await metrics.tableRows('Enquiries');
    await expect(rows.first()).toHaveText('August 20261');

    await metrics.from.fill('2026-10-05');
    await metrics.showBy.selectOption('day');
    await metrics.apply.click();

    await expect(metrics.chartImage('Enquiries')).toHaveAttribute('aria-label', 'Enquiries by day. 5 Oct: 3, 6 Oct: 3, 7 Oct: 2, 8 Oct: 2, 9 Oct: 1, 10 Oct so far: 1.');
    await expect(metrics.statValue('Enquiries')).toHaveText('12');
    await page.reload();
    await expect(metrics.showBy).toHaveValue('day');
    await expect(metrics.from).toHaveValue('2026-10-05');
  });

  test('bar-chart AC-2 AC-5: counts scale to the best week, shares to 100 %, and a zero is a 2 % stub', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const metrics = new OperatorMetricsPage(page);

    await metrics.open();

    await expect(metrics.bars('Enquiries').first()).toHaveAttribute('style', /--value: 53%/);
    await expect(metrics.bars('Enquiries').nth(2)).toHaveAttribute('style', /--value: 100%/);
    await expect(metrics.bars('Replied within 48 hours').first()).toHaveAttribute('style', /--value: 75%/);
    await expect(metrics.bars('New caterers published').nth(1)).toHaveAttribute('style', /--value: 2%/);
    await expect(metrics.chartImage('New caterers published')).toHaveAttribute('aria-label', /7 Sep: 0,/);
  });

  test('bar-chart AC-10 L2-061.4: a long daily range draws every day densely with a thinned axis, and 12 months by day loads within 3 seconds', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const metrics = new OperatorMetricsPage(page);

    await metrics.open('?from=2026-08-31&to=2026-10-10&by=day');

    await expect(metrics.bars('Enquiries')).toHaveCount(41);
    await expect(metrics.chart('Enquiries').locator('.bar-chart')).toHaveClass(/bar-chart--dense/);
    await expect(metrics.axis('Enquiries').filter({ hasText: /\S/ })).toHaveCount(7);

    const started = Date.now();
    await metrics.open('?from=2025-10-11&to=2026-10-10&by=day');
    await expect(metrics.bars('Unique visitors')).toHaveCount(365);
    await expect(metrics.chartHeadings).toHaveCount(6);
    expect(Date.now() - started).toBeLessThan(3000);
    await metrics.expectNoHorizontalScroll();
  });

  test('L2-061.2: a range longer than 24 months is refused; the last good charts stay', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const metrics = new OperatorMetricsPage(page);
    await metrics.open();
    await expect(metrics.total('Enquiries')).toHaveText('71');

    await metrics.from.fill('2024-01-01');
    await metrics.apply.click();

    await expect(metrics.errorSummary).toBeFocused();
    await expect(metrics.errorSummary.getByRole('heading')).toHaveText('Fix 1 thing to apply the range');
    await expect(metrics.errorSummary.getByRole('link')).toHaveText(['Choose a range of 24 months or less']);
    await expect(metrics.from).toHaveAttribute('aria-invalid', 'true');
    await expect(metrics.fromError).toHaveText('Choose a range of 24 months or less');
    await expect(metrics.total('Enquiries')).toHaveText('71');
    await expect(metrics.subtitle).toHaveText('31 Aug – 10 Oct 2026 · by week · Toronto time');
    await expect(metrics.exportButton).toBeDisabled();
    await expect(page).not.toHaveURL(/2024-01-01/);
    await metrics.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.query.includes('2024-01-01'))).toHaveLength(0);
  });

  test('a range before counting began has nothing to chart and offers the last 6 weeks', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const metrics = new OperatorMetricsPage(page);

    await metrics.open('?from=2026-06-01&to=2026-07-31&by=week');

    await expect(metrics.subtitle).toHaveText('1 Jun – 31 Jul 2026 · by week');
    await expect(metrics.emptyTitle).toHaveText('No activity in this range');
    await expect(metrics.emptyText).toHaveText('Sweet Hand started counting visits and enquiries on 3 Aug 2026. Choose dates from then on.');
    await expect(metrics.exportButton).toBeDisabled();
    await expect(metrics.chartHeadings).toHaveCount(0);
    await metrics.expectNoAccessibilityViolations();

    await metrics.link('Show the last 6 weeks').click();

    await expect(metrics.from).toHaveValue('2026-08-31');
    await expect(metrics.chartHeadings).toHaveCount(6);
  });

  test('while metrics load, the form stays and stats and charts are skeletons of the same size', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.hold('GET /api/operator/metrics*', 2);
    const metrics = new OperatorMetricsPage(page);

    await metrics.open();

    await expect(metrics.busyStats).toHaveCount(4);
    await expect(metrics.busyCharts).toHaveCount(6);
    await expect(metrics.loadingStatus).toHaveText('Loading metrics');
    await expect(metrics.exportButton).toBeDisabled();
    await expect(metrics.from).toHaveValue('2026-08-31');
    await metrics.expectNoAccessibilityViolations();
    await backend.release();
    await expect(metrics.chartHeadings).toHaveCount(6);
  });

  test('when metrics fail to load, the range is kept and a retry is offered', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('GET /api/operator/metrics', { status: 500, times: 1, body: { title: 'Server error', correlationId: '9a0d-5be1-2c47' } });
    const metrics = new OperatorMetricsPage(page);

    await metrics.open();

    await expect(metrics.errorState).toHaveAttribute('role', 'alert');
    await expect(metrics.emptyTitle).toHaveText('We couldn’t load metrics');
    await expect(metrics.emptyText).toHaveText('The metrics service didn’t answer. Your range is kept; try again.');
    await expect(metrics.reference).toHaveText('Reference 9a0d-5be1-2c47');
    await expect(metrics.link('Back to the queue')).toHaveAttribute('href', '/admin/queue');
    await expect(metrics.from).toHaveValue('2026-08-31');
    await expect(metrics.exportButton).toBeDisabled();
    await metrics.expectNoAccessibilityViolations();

    await metrics.button('Try again').click();

    await expect(metrics.chartHeadings).toHaveCount(6);
  });

  test('when enquiry figures fail, two charts offer a retry and the rest still work', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('GET /api/operator/metrics/enquiries', { status: 500, times: 1 });
    const metrics = new OperatorMetricsPage(page);

    await metrics.open();

    await expect(metrics.partialAlert).toContainText('2 charts didn’t load');
    await expect(metrics.partialAlert).toContainText('The other figures are up to date.');
    await expect(metrics.statValue('Enquiries')).toHaveText('–Not loaded');
    await expect(metrics.statCaption('Enquiries')).toHaveText('Not loaded');
    await expect(metrics.statValue('Replied within 48 hours')).toHaveText('–Not loaded');
    await expect(metrics.statValue('Caterer page visits')).toHaveText('39,700');
    await expect(metrics.chartFailure('Enquiries')).toContainText('This chart didn’t load');
    await expect(metrics.chartFailure('Enquiries')).not.toHaveAttribute('role', /.+/);
    await expect(metrics.chartFailure('Replied within 48 hours')).toBeVisible();
    await expect(metrics.total('Listing page visits')).toHaveText('22,670');
    await expect(metrics.exportButton).toBeDisabled();
    await metrics.expectNoAccessibilityViolations();

    await metrics.chartFailure('Enquiries').getByRole('button', { name: 'Try again' }).click();

    await expect(metrics.total('Enquiries')).toHaveText('71');
    await expect(metrics.partialAlert).toHaveCount(0);
    await expect(metrics.tableToggle('Enquiries')).toBeFocused();
    await expect(metrics.exportButton).toBeEnabled();
  });
});

test.describe('Export metrics', () => {
  test('L2-063.1: Export CSV downloads a UTF-8 file with a header row and one row per week holding every metric', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const metrics = new OperatorMetricsPage(page);
    await metrics.open();

    const file = await metrics.exportCsv();

    expect(file.name).toBe('sweet-hand-metrics-2026-08-31-to-2026-10-10-weekly.csv');
    const lines = file.text.trim().split('\r\n');
    expect(lines).toHaveLength(7);
    expect(lines[0]).toBe(
      '"Period start","Listing page visits","Caterer page visits","Unique visitors","Enquiries","Replied within 48 hours (%)","New caterers published","Published","Pending review","Changes requested","Draft","Suspended","Removed"',
    );
    expect(lines[5]).toBe('"2026-09-28","4240","7350","2890","12","83","1","60","3","1","9","1","2"');
    await expect(metrics.toast).toContainText('Metrics export ready');
    await expect(metrics.toast).toContainText('sweet-hand-metrics-2026-08-31-to-2026-10-10-weekly.csv');
  });

  test('L2-063.2: a value that starts like a formula is written as text', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.scenario('metrics-formula-in-data');
    const metrics = new OperatorMetricsPage(page);
    await metrics.open();

    const file = await metrics.exportCsv();

    expect(file.text.split('\r\n')[0]).toContain('"\'=HYPERLINK(""https://example.com"",""Pending review"")"');
  });

  test('when the export fails, nothing downloads and the operator is told', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('GET /api/operator/metrics/export.csv', { status: 500, times: 1 });
    const metrics = new OperatorMetricsPage(page);
    await metrics.open();

    await metrics.exportButton.click();

    await expect(metrics.toast).toContainText('Couldn’t export the metrics');
    await expect(metrics.toast).toContainText('Nothing was downloaded. Try again.');
  });
});
