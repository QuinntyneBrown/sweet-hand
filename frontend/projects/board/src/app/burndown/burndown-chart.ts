import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { formatAxisDay, formatDay } from '../sprint/format-day';
import type { Burndown } from './burndown';

const H = 240;
const LEFT = 34;
const RIGHT = 14;
const TOP = 18;
const BOTTOM = 30;

/** Points remaining per working day against the ideal line, drawn at the width it is given. */
@Component({
  selector: 'board-burndown-chart',
  templateUrl: './burndown-chart.html',
  styleUrl: './burndown-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BurndownChart {
  readonly data = input.required<Burndown>();
  protected readonly height = H;
  protected readonly width = signal(560);

  protected readonly chart = computed(() => {
    const b = this.data();
    const w = this.width();
    const n = b.days.length;
    const step = b.total > 30 ? 10 : 5;
    const ymax = Math.max(step, Math.ceil(b.total / step) * step);
    const x = (i: number) => LEFT + (n > 1 ? (i * (w - LEFT - RIGHT)) / (n - 1) : 0);
    const y = (v: number) => TOP + (H - TOP - BOTTOM) * (1 - v / ymax);
    const every = (w - LEFT - RIGHT) / Math.max(1, n - 1) < 46 ? 2 : 1;
    const ticks = [];
    for (let v = 0; v <= ymax; v += step) ticks.push({ v, y: y(v) });
    const actual = b.remaining.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    const last = b.remaining.length - 1;
    const slot = (w - LEFT - RIGHT) / Math.max(1, n - 1);
    return {
      w,
      left: LEFT,
      right: w - RIGHT,
      base: y(0),
      ticks,
      labels: b.days.map((d, i) => ({ x: x(i), text: formatAxisDay(d), show: (n - 1 - i) % every === 0 })),
      ideal: `${x(0)},${y(b.total)} ${x(n - 1)},${y(0)}`,
      actual,
      area: last > 0 ? `${actual} ${x(last)},${y(0)} ${x(0)},${y(0)}` : '',
      end: last >= 0 ? { x: x(last), y: y(b.remaining[last]) } : null,
      today: b.todayIndex >= 0 ? { x: x(b.todayIndex), labelX: Math.min(x(b.todayIndex) + 6, w - RIGHT - 34) } : null,
      hits: b.days.map((d, i) => ({
        x: x(i) - slot / 2,
        width: slot,
        title:
          i < b.remaining.length
            ? `${formatDay(d)}: ${b.remaining[i]} pts left, ideal ${Math.round(b.ideal[i])}`
            : `${formatDay(d)}: ideal ${Math.round(b.ideal[i])} pts left`,
      })),
    };
  });

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const measure = () => this.width.set(Math.max(280, Math.round(host.clientWidth || 560)));
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
