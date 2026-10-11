import { ChangeDetectionStrategy, Component } from '@angular/core';

/** The actions of one row, revealed on hover or focus (table CRD, `sh-table-row-actions`). */
@Component({
  selector: 'sh-table-row-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<div class="row-actions"><ng-content /></div>`,
})
export class TableRowActions {}
