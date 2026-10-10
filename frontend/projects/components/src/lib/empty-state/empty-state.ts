import { ChangeDetectionStrategy, Component, Directive, ElementRef, computed, contentChild, input, viewChild } from '@angular/core';

/** Marks the icon slot of `sh-empty-state` (`<svg slot="icon">`). */
// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[slot=icon]' })
export class EmptyStateIcon {}

/** Marks the photos slot of `sh-empty-state`. */
// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[slot=photos]' })
export class EmptyStatePhotos {}

/** Marks the actions slot of `sh-empty-state`. */
// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[slot=actions]' })
export class EmptyStateActions {}

/** Marks the note slot of `sh-empty-state`. */
// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[slot=note]' })
export class EmptyStateNote {}

/**
 * Nothing to show yet, nothing matches, or the list failed to load
 * (docs/specs/components/empty-state.md). Absent inputs and slots leave no element behind.
 */
@Component({
  selector: 'sh-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div [class]="cls()" [attr.role]="role()">
      @if (photos()) {
        <div class="photo-row" aria-hidden="true"><ng-content select="[slot=photos]" /></div>
      } @else if (icon()) {
        <div class="empty__icon" aria-hidden="true"><ng-content select="[slot=icon]" /></div>
      }
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
      @if (actions()) {
        <div #actionsBox class="empty__actions"><ng-content select="[slot=actions]" /></div>
      }
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

  protected readonly icon = contentChild(EmptyStateIcon);
  protected readonly photos = contentChild(EmptyStatePhotos);
  protected readonly actions = contentChild(EmptyStateActions);
  private readonly actionsBox = viewChild<ElementRef<HTMLElement>>('actionsBox');

  protected readonly cls = computed(() =>
    ['empty', this.size() === 'compact' && 'empty--compact', this.tone() !== 'neutral' && `empty--${this.tone()}`].filter(Boolean).join(' '),
  );
  protected readonly role = computed(() => {
    const live = this.live();
    if (live === 'off') return null;
    if (live !== 'auto') return live;
    return this.tone() === 'error' ? 'alert' : this.tone() === 'neutral' ? null : 'status';
  });

  /** Focuses the first action, so focus never falls to the body when the last item goes. */
  focusPrimaryAction(options?: FocusOptions): void {
    this.actionsBox()?.nativeElement.querySelector<HTMLElement>('a[href], button:not([disabled]), input, label')?.focus(options);
  }
}

/** Import this with the component so its slots are recognised. */
export const EMPTY_STATE = [EmptyState, EmptyStateIcon, EmptyStatePhotos, EmptyStateActions, EmptyStateNote];
