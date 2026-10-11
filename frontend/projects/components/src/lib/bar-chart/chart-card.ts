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
  templateUrl: './chart-card.html',
  styleUrl: './chart-card.css',
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
