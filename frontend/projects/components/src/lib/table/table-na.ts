import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** An empty cell: a muted dash read as a word ("No change"; table CRD, `sh-table-na`). */
@Component({
  selector: 'sh-table-na',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './table-na.html',
})
export class TableNa {
  readonly label = input.required<string>();
}
