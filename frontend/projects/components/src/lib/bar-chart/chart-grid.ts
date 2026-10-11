import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The grid of chart cards: one column, two from LG (bar-chart CRD, `sh-chart-grid`). */
@Component({
  selector: 'sh-chart-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './chart-grid.html',
})
export class ChartGrid {}
