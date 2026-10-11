import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { Alert } from '../alert/alert';
import { Button } from '../button/button';
import { Table, type TableColumn } from '../table/table';

/** One period of a chart: "31 Aug", "Week of 31 Aug", 8, "8". */
export interface ChartPoint {
  axis: string;
  row: string;
  value: number;
  display: string;
}

let nextId = 0;

/**
 * Bars over time with an image label that lists every value
 * (docs/specs/components/bar-chart.md, `sh-bar-chart`).
 */
@Component({
  selector: 'sh-bar-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div [class]="dense() ? 'bar-chart bar-chart--dense' : 'bar-chart'" role="img" [attr.aria-label]="imageLabel()">
      @for (b of bars(); track $index) {
        <span [class]="b.accent ? 'bar-chart__bar bar-chart__bar--accent' : 'bar-chart__bar'" [style.--value]="b.height"></span>
      }
    </div>
    <div class="bar-chart__axis" aria-hidden="true">
      @for (a of axis(); track $index) {
        <span>{{ a }}</span>
      }
    </div>
  `,
  styles: `
    .bar-chart--dense:has(> :nth-child(32)) {
      gap: 0;
    }
    .bar-chart--dense + .bar-chart__axis {
      gap: var(--space-0-5);
    }
    .bar-chart--dense:has(> :nth-child(32)) + .bar-chart__axis {
      gap: 0;
    }
    .bar-chart__axis span {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
    }
    .bar-chart--dense + .bar-chart__axis span {
      overflow: visible;
      text-align: left;
    }
    @media (forced-colors: active) {
      .bar-chart__bar {
        forced-color-adjust: none;
        background: CanvasText;
      }
      .bar-chart__bar--accent {
        background: Highlight;
      }
    }
  `,
})
export class BarChart {
  readonly label = input.required<string>();
  readonly points = input.required<readonly ChartPoint[]>();
  readonly scale = input<'count' | 'percent'>('count');
  readonly current = input(false);
  readonly soFarLabel = input<string>('');

  protected readonly dense = computed(() => this.points().length > 14);
  protected readonly bars = computed(() => {
    const points = this.points();
    const max = Math.max(0, ...points.map((p) => p.value));
    return points.map((p, i) => {
      const raw = this.scale() === 'percent' ? p.value : max > 0 ? (p.value / max) * 100 : 0;
      // A zero is drawn as a 2 % stub, so it reads as a measured zero (D-4).
      return { height: `${Math.max(2, Math.round(raw))}%`, accent: this.current() && i === points.length - 1 };
    });
  });
  /** At most 7 axis labels; the others stay as empty slots (D-5). */
  protected readonly axis = computed(() => {
    const points = this.points();
    const every = Math.max(1, Math.ceil(points.length / 7));
    return points.map((p, i) => (i % every === 0 ? p.axis : ''));
  });
  protected readonly imageLabel = computed(() => {
    const points = this.points();
    const parts = points.map((p, i) => `${p.axis}${this.current() && i === points.length - 1 ? ` ${this.soFarLabel()}` : ''}: ${p.display}`);
    return `${this.label()}. ${parts.join(', ')}.`;
  });
}

/** The grid of chart cards: one column, two from LG (bar-chart CRD, `sh-chart-grid`). */
@Component({
  selector: 'sh-chart-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<div class="chart-grid"><ng-content /></div>`,
})
export class ChartGrid {}

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
