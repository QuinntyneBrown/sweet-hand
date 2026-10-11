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
import { ModalLayer } from '../overlay/modal-layer';
import type { ModalRef } from '../overlay/modal-ref';

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
  templateUrl: './sheet.html',
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
