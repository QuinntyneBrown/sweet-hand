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
  templateUrl: './bar-chart.html',
  styleUrl: './bar-chart.css',
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

