import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  ViewContainerRef,
  computed,
  effect,
  inject,
  input,
  output,
  untracked,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from '../icon/icon';
import { ModalLayer, type ModalRef } from '../overlay/modal-layer';

let nextId = 0;

/**
 * A modal dialog (docs/specs/components/dialog.md). Controlled by `open`;
 * Escape, Close and Cancel emit `dismissed` unless busy. With `form`, the panel
 * is a `<form novalidate>` and submitting emits `submitted`.
 */
@Component({
  selector: 'sh-dialog',
  imports: [Icon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <ng-template #overlay>
      <div class="backdrop"></div>
      <div
        [class]="fullScreenOnPhone() ? 'dialog dialog--full' : 'dialog'"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="ids.title"
        [attr.aria-describedby]="describedBy()"
      >
        @if (form()) {
          <form [class]="panelClass()" novalidate [attr.role]="formRole()" [attr.aria-busy]="busy() ? 'true' : null" (submit)="onSubmit($event)">
            <ng-container *ngTemplateOutlet="panel" />
          </form>
        } @else {
          <div [class]="panelClass()" [attr.aria-busy]="busy() ? 'true' : null"><ng-container *ngTemplateOutlet="panel" /></div>
        }
      </div>
    </ng-template>

    <ng-template #panel>
      <div class="dialog__header">
        @if (photo()) {
          <div class="dialog__caterer">
            <span class="photo"><img [src]="photo()" alt="" width="56" height="56" /></span>
            <div class="dialog__heading">
              <h2 class="dialog__title" [id]="ids.title" tabindex="-1">{{ title() }}</h2>
              @if (description()) {
                <p [class]="descriptionRole() === 'recipient' ? 'dialog__caterer-name' : 'dialog__desc'" [id]="ids.desc">{{ description() }}</p>
              }
            </div>
          </div>
        } @else {
          @if (tone()) {
            <div [class]="'dialog__icon dialog__icon--' + tone()" aria-hidden="true"><ng-content select="[slot=icon]" /></div>
          }
          <div class="dialog__heading">
            <h2 class="dialog__title" [id]="ids.title" tabindex="-1">{{ title() }}</h2>
            @if (description()) {
              <p class="dialog__desc" [id]="ids.desc">{{ description() }}</p>
            }
          </div>
        }
        <button class="icon-btn" type="button" [attr.aria-label]="closeLabel()" [disabled]="busy()" (click)="dismiss('close')"><svg shIcon="close"></svg></button>
      </div>
      <div class="dialog__body stack">
        <ng-content />
        <p class="visually-hidden" role="status">{{ busy() ? busyMessage() : '' }}</p>
      </div>
      <div class="dialog__footer">
        <ng-content select="[slot=footer-start]" />
        @if (cancelLabel()) {
          <button #cancel class="btn" type="button" [disabled]="busy()" (click)="dismiss('cancel')">{{ cancelLabel() }}</button>
        }
        <ng-content select="[slot=footer]" />
      </div>
    </ng-template>
  `,
})
export class Dialog {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly descriptionRole = input<'consequence' | 'recipient'>('consequence');
  readonly size = input<'sm' | 'md' | 'form' | 'lg'>('md');
  readonly tone = input<'info' | 'warning' | 'danger' | 'success' | null>(null);
  readonly photo = input<string | null>(null);
  readonly form = input(false);
  /** `search` renders `role="search"` on the panel form (the area search). */
  readonly formRole = input<string | null>(null);
  readonly fullScreenOnPhone = input(false);
  readonly busy = input(false);
  readonly busyMessage = input<string | null>(null);
  readonly closeLabel = input.required<string>();
  readonly cancelLabel = input<string | null>(null);
  readonly initialFocus = input<'auto' | 'cancel'>('auto');
  readonly returnFocus = input<HTMLElement | null>(null);
  /** Extra ids for `aria-describedby` (the search dialog's help line). */
  readonly describedByIds = input<string | null>(null);

  readonly dismissed = output<'escape' | 'close' | 'cancel'>();
  readonly submitted = output<SubmitEvent>();
  readonly closed = output<void>();

  protected readonly ids = { title: `sh-dialog-${++nextId}-title`, desc: `sh-dialog-${nextId}-desc` };
  protected readonly describedBy = computed(() => [this.description() ? this.ids.desc : null, this.describedByIds()].filter(Boolean).join(' ') || null);
  protected readonly panelClass = computed(() => (this.size() === 'md' ? 'dialog__panel' : `dialog__panel dialog__panel--${this.size()}`));

  private readonly overlay = viewChild.required<TemplateRef<unknown>>('overlay');
  private readonly vcr = inject(ViewContainerRef);
  private readonly layer = inject(ModalLayer);
  private ref: ModalRef | null = null;

  constructor() {
    effect(() => {
      const open = this.open();
      untracked(() => (open ? this.show() : this.hide()));
    });
    inject(DestroyRef).onDestroy(() => this.ref?.close());
  }

  /** Moves focus to the title, e.g. when the panel swaps to a success message (D-8). */
  focusTitle(): void {
    this.ref?.host.querySelector<HTMLElement>('.dialog__title')?.focus();
  }

  protected dismiss(reason: 'escape' | 'close' | 'cancel'): void {
    if (!this.busy()) this.dismissed.emit(reason);
  }

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    if (!this.busy()) this.submitted.emit(event);
  }

  private show(): void {
    if (this.ref) return;
    this.ref = this.layer.open(this.overlay(), this.vcr, {
      onEscape: () => this.dismiss('escape'),
      returnFocus: () => this.returnFocus(),
      initialFocus: (host) =>
        this.initialFocus() === 'cancel'
          ? host.querySelector<HTMLElement>('.dialog__footer .btn:not(.btn--primary):not(.btn--danger)')
          : (host.querySelector<HTMLElement>('[autofocus], .dialog__body input:not([type=hidden]), .dialog__body textarea, .dialog__body select') ??
            host.querySelector<HTMLElement>('.dialog__title')),
    });
  }

  private hide(): void {
    if (!this.ref) return;
    this.ref.close();
    this.ref = null;
    this.closed.emit();
  }
}
