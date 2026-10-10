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
  styles: `
    .empty__icon:empty,
    .photo-row:empty,
    .empty__actions:empty {
      display: none;
    }
  `,
  template: `
    <div [class]="cls()" [attr.role]="role()">
      <div class="photo-row" aria-hidden="true"><ng-content select="[slot=photos]" /></div>
      <div class="empty__icon" aria-hidden="true"><ng-content select="[slot=icon]" /></div>
      @switch (headingLevel()) {
        @case (1) {
          <h1 class="empty__title" [attr.id]="headingId()">{{ heading() }}</h1>
        }
        @case (3) {
          <h3 class="empty__title" [attr.id]="headingId()">{{ heading() }}</h3>
        }
        @case (4) {
          <h4 class="empty__title" [attr.id]="headingId()">{{ heading() }}</h4>
        }
        @case (null) {
          <p class="empty__title" [attr.id]="headingId()">{{ heading() }}</p>
        }
        @default {
          <h2 class="empty__title" [attr.id]="headingId()">{{ heading() }}</h2>
        }
      }
      @if (text()) {
        <p class="empty__text">{{ text() }}</p>
      }
      <div #actions class="empty__actions"><ng-content select="[slot=actions]" /></div>
      <ng-content select="[slot=note]" />
      @if (reference()) {
        <p class="text-caption">{{ referenceLabel() }} <code>{{ reference() }}</code></p>
      }
    </div>
  `,
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
