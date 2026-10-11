import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import type { PopoverDismissal } from './popover-dismissal';

let nextId = 0;

/**
 * A small non-modal panel anchored to the control that opened it: the generic
 * `.popover` or the tablet `.filter-dropdown` (docs/specs/components/popover.md).
 * Controlled by `open`; Escape, a pointer down outside and focus leaving the
 * trigger and panel emit `openChange(false)` (D-3, D-4).
 */
@Component({
  selector: 'sh-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  styles: `
    .popover__actions:empty {
      display: none;
    }
  `,
  template: `
    <div #anchor class="menu-anchor" (keydown)="onKeydown($event)" (focusout)="onFocusOut($event)">
      <ng-content select="[slot=trigger]" />
      @if (open()) {
        <div
          #panel
          [class]="variant() === 'filter' ? 'filter-dropdown' : 'popover'"
          [style.left]="align() === 'end' ? 'auto' : null"
          [style.right]="align() === 'end' ? '0' : null"
          [id]="id()"
          role="dialog"
          [attr.aria-labelledby]="heading() ? headingId : null"
          [attr.aria-label]="heading() ? null : ariaLabel()"
        >
          @if (heading()) {
            @if (variant() === 'filter') {
              @if (headingLevel() === 3) {
                <h3 class="filter-group__title" [id]="headingId">{{ heading() }}</h3>
              } @else {
                <h2 class="filter-group__title" [id]="headingId">{{ heading() }}</h2>
              }
            } @else {
              <p class="popover__title" [id]="headingId">{{ heading() }}</p>
            }
          }
          <ng-content />
          @if (variant() === 'default') {
            <div class="popover__actions"><ng-content select="[slot=actions]" /></div>
          }
        </div>
      }
    </div>
  `,
})
export class Popover {
  readonly variant = input<'default' | 'filter'>('default');
  readonly open = input(false);
  readonly heading = input<string | null>(null);
  readonly headingLevel = input<2 | 3>(2);
  readonly ariaLabel = input<string | null>(null);
  readonly align = input<'start' | 'end'>('start');
  readonly initialFocus = input<'auto' | 'none'>('auto');
  /** The panel's id, when the trigger needs it before the panel exists (`aria-controls`). */
  readonly panelId = input<string | null>(null);

  readonly openChange = output<boolean>();
  /** Why the panel asked to close. */
  readonly dismissed = output<PopoverDismissal>();

  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly anchor = viewChild.required<ElementRef<HTMLElement>>('anchor');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');
  private readonly generated = `sh-popover-${++nextId}`;
  protected readonly id = computed(() => this.panelId() ?? this.generated);
  protected readonly headingId = `${this.generated}-title`;

  constructor() {
    const onPointerDown = (event: PointerEvent) => {
      if (this.open() && !this.anchor().nativeElement.contains(event.target as Node)) this.dismiss('outside', false);
    };
    this.document.addEventListener('pointerdown', onPointerDown, true);
    inject(DestroyRef).onDestroy(() => this.document.removeEventListener('pointerdown', onPointerDown, true));

    // The trigger says what it opens and whether it is open (D-6).
    effect(() => {
      const open = this.open();
      const id = this.id();
      const trigger = this.trigger();
      if (!trigger) return;
      trigger.setAttribute('aria-haspopup', 'dialog');
      trigger.setAttribute('aria-expanded', String(open));
      trigger.setAttribute('aria-controls', id);
    });

    // Focus moves to the first control in the panel when it opens.
    effect(() => {
      if (!this.open()) return;
      untracked(() =>
        afterNextRender(
          () => {
            if (this.initialFocus() === 'none') return;
            this.panel()
              ?.nativeElement.querySelector<HTMLElement>('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href]')
              ?.focus();
          },
          { injector: this.injector },
        ),
      );
    });
  }

  /** Closes; focus goes back to the trigger unless an action moves it elsewhere. */
  close(returnFocus = true): void {
    this.openChange.emit(false);
    if (returnFocus) this.trigger()?.focus();
  }

  private trigger(): HTMLElement | null {
    return this.anchor().nativeElement.querySelector<HTMLElement>('button');
  }

  private dismiss(reason: PopoverDismissal, returnFocus: boolean): void {
    this.dismissed.emit(reason);
    this.close(returnFocus);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || !this.open() || event.defaultPrevented) return;
    event.preventDefault();
    this.dismiss('escape', true);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    // Leaving for somewhere outside closes; focus dropped by a re-render (no target) does not.
    if (this.open() && next && !this.anchor().nativeElement.contains(next)) this.dismiss('focusout', false);
  }
}
