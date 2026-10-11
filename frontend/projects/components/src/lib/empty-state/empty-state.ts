import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, input, viewChild } from '@angular/core';

/**
 * What a region shows when it has nothing to show: no results, first run,
 * an error with a retry (docs/specs/components/empty-state.md). Slots:
 * `[slot=icon]`, `[slot=photos]`, `[slot=actions]`, `[slot=note]`.
 */
@Component({
  selector: 'sh-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: { style: 'display: contents' },
  // Slot wrappers with nothing projected are not shown ("No input renders an empty wrapper").
  styleUrl: './empty-state.css',
  templateUrl: './empty-state.html',
})
export class EmptyState {
  readonly heading = input.required<string>();
  readonly headingLevel = input<1 | 2 | 3 | 4 | null>(2);
  readonly headingId = input<string | null>(null);
  readonly text = input<string | null>(null);
  readonly size = input<'full' | 'compact'>('full');
  readonly tone = input<'neutral' | 'error' | 'info' | 'success'>('neutral');
  readonly live = input<'auto' | 'alert' | 'status' | 'off'>('auto');
  readonly reference = input<string | null>(null);
  readonly referenceLabel = input<string | null>(null);

  private readonly actions = viewChild.required<ElementRef<HTMLElement>>('actions');

  protected readonly cls = computed(() =>
    ['empty', this.size() === 'compact' && 'empty--compact', this.tone() !== 'neutral' && `empty--${this.tone()}`].filter(Boolean).join(' '),
  );
  protected readonly role = computed(() => {
    const live = this.live();
    if (live === 'off') return null;
    if (live !== 'auto') return live;
    return this.tone() === 'error' ? 'alert' : this.tone() === 'neutral' ? null : 'status';
  });

  focusPrimaryAction(options?: FocusOptions): void {
    this.actions().nativeElement.querySelector<HTMLElement>('a[href], button:not([disabled]), input, label')?.focus(options);
  }
}

/** Import array kept for consumers that import the state with its slot markers. */
export const EMPTY_STATE = [EmptyState] as const;
