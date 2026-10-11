import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { FIELD_CONTEXT } from '../form/form-field';

let nextId = 0;

/**
 * A native file picker behind a button-like label (docs/specs/components/file-upload.md,
 * `sh-file-upload`). The input comes first so the label shows its focus ring;
 * the server, not `accept`, decides what is a valid file (L2-041.3).
 */
@Component({
  selector: 'sh-file-upload',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <input
      #input
      class="file-input visually-hidden"
      [id]="id()"
      type="file"
      [attr.accept]="accept()"
      [multiple]="multiple()"
      [disabled]="disabled()"
      [attr.aria-describedby]="describedByIds()"
      [attr.name]="name()"
      (change)="picked($event)"
    /><label
      [class]="labelClass()"
      [for]="id()"
      [attr.data-state]="dragging() ? 'dragging' : null"
      (dragover)="dragOver($event)"
      (dragleave)="dragging.set(false)"
      (drop)="dropped($event)"
      >@if (dragging() && dropLabel()) {{{ dropLabel() }}} @else {<ng-content />}</label
    >
  `,
})
export class FileUpload {
  private readonly field = inject(FIELD_CONTEXT, { optional: true });

  readonly accept = input.required<string>();
  readonly multiple = input(false);
  readonly trigger = input<'button' | 'tile'>('button');
  readonly variant = input<'primary' | 'secondary'>('secondary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly disabled = input(false);
  readonly inputId = input<string | null>(null);
  readonly describedBy = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly dropLabel = input<string | null>(null);

  readonly filesSelected = output<File[]>();

  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private readonly generated = `sh-file-upload-${++nextId}`;
  protected readonly dragging = signal(false);

  protected readonly id = computed(() => this.field?.id() ?? this.inputId() ?? this.generated);
  protected readonly describedByIds = computed(() => [this.field?.describedBy(), this.describedBy()].filter(Boolean).join(' ') || null);
  protected readonly labelClass = computed(() => {
    if (this.trigger() === 'tile') return 'upload-tile';
    return ['btn', this.variant() === 'primary' && 'btn--primary', this.size() !== 'md' && `btn--${this.size()}`].filter(Boolean).join(' ');
  });

  protected picked(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    // Cleared so the same file can be picked again (D-3).
    target.value = '';
    if (!files.length || this.disabled()) return;
    this.filesSelected.emit(this.multiple() ? files : files.slice(0, 1));
  }

  protected dragOver(event: DragEvent): void {
    if (this.trigger() !== 'tile' || this.disabled()) return;
    event.preventDefault();
    this.dragging.set(true);
  }

  protected dropped(event: DragEvent): void {
    if (this.trigger() !== 'tile' || this.disabled()) return;
    event.preventDefault();
    this.dragging.set(false);
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length) this.filesSelected.emit(this.multiple() ? files : files.slice(0, 1));
  }

  focus(options?: FocusOptions): void {
    this.input().nativeElement.focus(options);
  }
}

