import { afterNextRender, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, Injector, input, output, signal, untracked, viewChild } from '@angular/core';
import { Alert } from '../alert/alert';
import { BarChart } from './bar-chart';
import { Button } from '../button/button';
import { Table } from '../table/table';
import type { TableColumn } from '../table/table-column';
import type { ChartPoint } from './chart-point';

let nextId = 0;

/**
 * One metric: heading, total, bar chart and the same figures as a table in a
 * disclosure, or a failed or loading card (bar-chart CRD, `sh-chart-card`).
 */
@Component({
  selector: 'sh-chart-card',
  imports: [Alert, BarChart, Button, Table],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (busy()) {
      <div class="chart-card" aria-hidden="true">
        <div class="chart-card__head"><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></div>
        <span class="skeleton skeleton--rect"></span>
      </div>
    } @else {
      <section class="chart-card" [attr.aria-labelledby]="headingId">
        <div class="chart-card__head">
          <h3 [id]="headingId" tabindex="-1">{{ title() }}</h3>
          @if (total() && !failed()) {
            <span class="chart-card__total">{{ total() }}</span>
          }
        </div>
        @if (failed()) {
          <sh-alert tone="danger" [title]="failedTitle()"
            >{{ failedText() }}
            <div slot="actions" class="alert__actions">
              <sh-button size="sm" (activated)="retry()">{{ retryLabel() }}</sh-button>
            </div></sh-alert
          >
        } @else {
          <sh-bar-chart [label]="label()" [points]="points()" [scale]="scale()" [current]="current()" [soFarLabel]="soFarLabel()" />
          <details #details [open]="tableOpen()" (toggle)="toggled(details.open)">
            <summary #summary>{{ tableLabel() }}</summary>
            @if (tableShown()) {
              <sh-table [caption]="label()" [columns]="columns()">
                @for (p of points(); track $index) {
                  <tr>
                    <th scope="row">{{ p.row }}</th>
                    <td class="num">{{ p.display }}</td>
                  </tr>
                }
              </sh-table>
            }
          </details>
        }
      </section>
    }
  `,
  styles: `
    .chart-card[aria-hidden='true'] .chart-card__head .skeleton--text:first-child {
      width: 40%;
    }
    .chart-card[aria-hidden='true'] .chart-card__head .skeleton--text:last-child {
      width: 15%;
    }
    .chart-card[aria-hidden='true'] > .skeleton--rect {
      height: calc(var(--space-32) + var(--space-16));
    }
  `,
})
export class ChartCard {
  readonly title = input.required<string>();
  readonly total = input<string | null>(null);
  readonly label = input.required<string>();
  readonly points = input<readonly ChartPoint[]>([]);
  readonly scale = input<'count' | 'percent'>('count');
  readonly current = input(false);
  readonly soFarLabel = input<string>('');
  readonly periodHeader = input<string>('');
  readonly valueHeader = input<string>('');
  readonly tableLabel = input<string>('');
  readonly tableOpen = input(false);
  readonly failed = input(false);
  readonly failedTitle = input<string>('');
  readonly failedText = input<string>('');
  readonly retryLabel = input<string>('');
  readonly busy = input(false);

  readonly retried = output<void>();
  readonly tableToggled = output<boolean>();

  private readonly injector = inject(Injector);
  private readonly summary = viewChild<ElementRef<HTMLElement>>('summary');
  protected readonly headingId = `sh-chart-${++nextId}-title`;
  /** The table is built the first time the disclosure opens (D-9). */
  protected readonly tableShown = signal(false);
  private retrying = false;
  protected readonly columns = computed<TableColumn[]>(() => [
    { key: 'period', label: this.periodHeader() },
    { key: 'value', label: this.valueHeader(), numeric: true },
  ]);

  constructor() {
    effect(() => {
      if (this.tableOpen()) untracked(() => this.tableShown.set(true));
    });
    // After "Try again" succeeds, focus moves to the new summary (D-8).
    effect(() => {
      const failed = this.failed();
      const busy = this.busy();
      untracked(() => {
        if (!failed && !busy && this.retrying) {
          this.retrying = false;
          afterNextRender(() => this.summary()?.nativeElement.focus(), { injector: this.injector });
        }
      });
    });
  }

  protected toggled(open: boolean): void {
    if (open) this.tableShown.set(true);
    this.tableToggled.emit(open);
  }

  protected retry(): void {
    this.retrying = true;
    this.retried.emit();
  }
}
