import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal, untracked, type Signal } from '@angular/core';

/** One placeholder shape while content loads; always hidden from assistive technology (docs/specs/components/skeleton.md). */
@Component({
  selector: 'sh-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './skeleton.html',
})
export class Skeleton {
  readonly shape = input<'text' | 'title' | 'circle' | 'rect' | 'pill'>('text');
  readonly width = input<string | null>(null);
  readonly height = input<string | null>(null);

  protected readonly usesHeight = computed(() => this.shape() !== 'text' && this.shape() !== 'title');
}

/**
 * Turns "a request is in flight" into the busy signal skeletons and status
 * lines bind to: true only once the request has run for `delay` ms, false as
 * soon as it ends (D-3). Call in an injection context.
 */
export function delayedBusy(source: Signal<boolean>, { delay = 300 }: { delay?: number } = {}): Signal<boolean> {
  const busy = signal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  effect(() => {
    const inFlight = source();
    untracked(() => {
      clearTimeout(timer);
      if (!inFlight) busy.set(false);
      else if (!busy()) timer = setTimeout(() => busy.set(true), delay);
    });
  });
  inject(DestroyRef).onDestroy(() => clearTimeout(timer));
  return busy.asReadonly();
}
