import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ChartPoint } from './chart-point';


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

