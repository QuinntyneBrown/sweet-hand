import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  numeric?: boolean;
  sortable?: boolean;
  firstSort?: 'ascending' | 'descending';
  actions?: boolean;
}

export interface TableSort {
  key: string;
  direction: 'ascending' | 'descending';
}

let nextId = 0;

/**
 * A data table (docs/specs/components/table.md): caption, column headers and
 * the consumer's `<tr>` rows, with an optional scroll region, sorting headers
 * and a loading state. The table never sorts or formats anything itself (D-9).
 */
@Component({
  selector: 'sh-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  template: `
    @if (busy()) {
      <p class="visually-hidden" role="status">{{ busyLabel() }}</p>
    }
    <div
      class="table-wrap"
      [attr.tabindex]="isRegion() ? 0 : null"
      [attr.role]="isRegion() ? 'region' : null"
      [attr.aria-labelledby]="isRegion() ? captionId : null"
      [attr.aria-busy]="busy() ? 'true' : null"
    >
      <table [class]="isDense() ? 'table table--dense' : 'table'">
        <caption [class.visually-hidden]="!captionVisible()" [id]="captionId">{{ caption() }}</caption>
        <thead>
          <tr>
            @for (c of columns(); track c.key) {
              @if (c.actions) {
                <th scope="col"><span class="visually-hidden">{{ c.label }}</span></th>
              } @else if (c.sortable) {
                <th scope="col" [class.num]="!!c.numeric" [attr.aria-sort]="sortOf(c)">
                  <button type="button" (click)="requestSort(c)">{{ c.label }}</button>
                </th>
              } @else {
                <th scope="col" [class.num]="!!c.numeric">{{ c.label }}</th>
              }
            }
          </tr>
        </thead>
        <tbody>
          @if (busy()) {
            @for (r of skeletons(); track r) {
              <tr aria-hidden="true">
                @for (c of columns(); track c.key) {
                  <td><span class="skeleton skeleton--text"></span></td>
                }
              </tr>
            }
          } @else {
            <ng-content />
          }
        </tbody>
      </table>
    </div>
  `,
})
export class Table {
  readonly caption = input.required<string>();
  readonly captionVisible = input(false);
  readonly columns = input.required<readonly TableColumn[]>();
  readonly density = input<'default' | 'dense'>('default');
  readonly region = input(false);
  readonly sort = input<TableSort | null>(null);
  readonly busy = input(false);
  readonly busyLabel = input<string>('');
  readonly skeletonRows = input(8);

  readonly sortChange = output<TableSort>();

  protected readonly captionId = `sh-table-${++nextId}-caption`;
  /** Rows with actions keep the default density (D-4). */
  protected readonly isDense = computed(() => this.density() === 'dense' && !this.columns().some((c) => c.actions));
  protected readonly isRegion = computed(() => this.region() && !this.busy());
  protected readonly skeletons = computed(() => Array.from({ length: Math.min(20, Math.max(1, Math.round(this.skeletonRows()))) }, (_, i) => i));

  protected sortOf(c: TableColumn): 'ascending' | 'descending' | 'none' {
    const s = this.sort();
    return s && s.key === c.key ? s.direction : 'none';
  }

  protected requestSort(c: TableColumn): void {
    const current = this.sort();
    const direction = current?.key === c.key ? (current.direction === 'ascending' ? 'descending' : 'ascending') : (c.firstSort ?? 'ascending');
    this.sortChange.emit({ key: c.key, direction });
  }
}

/** The actions of one row, revealed on hover or focus (table CRD, `sh-table-row-actions`). */
@Component({
  selector: 'sh-table-row-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<div class="row-actions"><ng-content /></div>`,
})
export class TableRowActions {}

/** An empty cell: a muted dash read as a word ("No change"; table CRD, `sh-table-na`). */
@Component({
  selector: 'sh-table-na',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<span class="na" aria-hidden="true">—</span><span class="visually-hidden">{{ label() }}</span>`,
})
export class TableNa {
  readonly label = input.required<string>();
}
