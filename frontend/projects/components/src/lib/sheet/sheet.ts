import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  TemplateRef,
  ViewContainerRef,
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
 * Full-height panel: the phone filters and the site menu (docs/specs/components/sheet.md).
 * Controlled by `open`; Escape and Close emit `dismissed`.
 */
@Component({
  selector: 'sh-sheet',
  imports: [Icon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <ng-template #panel>
      <div class="backdrop"></div>
      <div [class]="variant() === 'sheet' ? 'sheet' : variant() === 'drawer' ? 'drawer' : 'drawer drawer--left'" role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId" [attr.aria-busy]="busy() ? 'true' : null">
        <div [class]="region('header')">
          <h2 [class]="region('title')" [id]="titleId">{{ title() }}@if (count()) {<span class="filter-trigger__count"><span class="visually-hidden">, </span>{{ count() }}<span class="visually-hidden"> {{ countLabel() }}</span></span>}</h2>
          <button class="icon-btn" type="button" [attr.aria-label]="closeLabel()" autofocus (click)="dismissed.emit('close')"><svg shIcon="close"></svg></button>
        </div>
        @switch (bodyAs()) {
          @case ('nav') {
            <nav [class]="region('body')" [attr.aria-labelledby]="titleId"><ng-container *ngTemplateOutlet="body" /></nav>
          }
          @case ('form') {
            <form [class]="region('body')" [id]="formId()" [attr.action]="formAction()" novalidate (submit)="onSubmit($event)"><ng-container *ngTemplateOutlet="body" /></form>
          }
          @default {
            <div [class]="region('body')"><ng-container *ngTemplateOutlet="body" /></div>
          }
        }
        @if (hasFooter()) {
          <div [class]="region('footer')"><ng-container *ngTemplateOutlet="footer" /></div>
        }
      </div>
    </ng-template>
    <ng-template #body><ng-content /></ng-template>
    <ng-template #footer><ng-content select="[slot=footer]" /></ng-template>
  `,
})
export class Sheet {
  readonly open = input(false);
  readonly variant = input<'sheet' | 'drawer' | 'drawer-left'>('sheet');
  readonly title = input.required<string>();
  readonly count = input<number | null>(null);
  readonly countLabel = input<string | null>(null);
  readonly closeLabel = input.required<string>();
  readonly bodyAs = input<'div' | 'form' | 'nav'>('div');
  readonly formId = input<string | null>(null);
  readonly formAction = input<string | null>(null);
  readonly busy = input(false);
  readonly hasFooter = input(false);
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly dismissed = output<'escape' | 'close'>();
  readonly submitted = output<SubmitEvent>();
  readonly closed = output<void>();

  protected readonly titleId = `sh-sheet-${++nextId}-title`;
  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
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

  protected region(part: string): string {
    return `${this.variant() === 'sheet' ? 'sheet' : 'drawer'}__${part}`;
  }

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.submitted.emit(event);
  }

  private show(): void {
    if (this.ref) return;
    this.ref = this.layer.open(this.panel(), this.vcr, {
      onEscape: () => this.dismissed.emit('escape'),
      returnFocus: () => this.returnFocus(),
    });
  }

  private hide(): void {
    if (!this.ref) return;
    this.ref.close();
    this.ref = null;
    this.closed.emit();
  }
}
