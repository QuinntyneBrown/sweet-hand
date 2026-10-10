import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { FIELD_CONTEXT } from './form-field';

let nextId = 0;

/** Length in user-perceived characters, so counters agree with what people see. */
export function graphemeLength(text: string): number {
  const Segmenter = (Intl as unknown as { Segmenter?: new (l?: string, o?: object) => { segment(s: string): Iterable<unknown> } }).Segmenter;
  if (!Segmenter) return [...text].length;
  return Array.from(new Segmenter(undefined, { granularity: 'grapheme' }).segment(text)).length;
}

/** Multi-line plain text (docs/specs/components/textarea.md). No maxlength: people are told by how much they are over. */
@Component({
  selector: 'sh-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Textarea), multi: true }],
  template: `
    <textarea
      #el
      [class]="variant() === 'reply' ? 'textarea reply-box__input' : 'textarea'"
      [id]="id()"
      [value]="value()"
      [attr.name]="name()"
      [attr.rows]="rows()"
      [required]="required()"
      [attr.minlength]="minlength()"
      [disabled]="disabled() || formDisabled()"
      [readOnly]="readonly()"
      [attr.autofocus]="autofocus() ? '' : null"
      [attr.spellcheck]="spellcheck() === null ? null : spellcheck()"
      [attr.aria-invalid]="isInvalid() ? 'true' : null"
      [attr.aria-describedby]="describedByIds()"
      [attr.aria-label]="ariaLabel()"
      (input)="onInput($event)"
      (blur)="onBlur($event)"
      (keydown)="onKeydown($event)"
    ></textarea>
  `,
})
export class Textarea implements ControlValueAccessor {
  readonly variant = input<'plain' | 'reply'>('plain');
  readonly value = model('');
  readonly name = input<string | null>(null);
  readonly rows = input<number | null>(null);
  readonly required = input(false);
  readonly minlength = input<number | null>(null);
  readonly readonly = input(false);
  readonly disabled = input(false);
  readonly autofocus = input(false);
  readonly spellcheck = input<boolean | null>(null);
  readonly invalid = input<boolean | null>(null);
  readonly describedBy = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly inputId = input<string | null>(null);

  readonly lengthChange = output<number>();
  readonly blurred = output<FocusEvent>();
  readonly submitRequested = output<KeyboardEvent>();

  private readonly field = inject(FIELD_CONTEXT, { optional: true });
  private readonly el = viewChild.required<ElementRef<HTMLTextAreaElement>>('el');
  private readonly generated = `sh-textarea-${++nextId}`;
  protected readonly formDisabled = signal(false);
  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected readonly id = computed(() => this.field?.id() ?? this.inputId() ?? this.generated);
  protected readonly isInvalid = computed(() => this.invalid() ?? this.field?.invalid() ?? false);
  protected readonly describedByIds = computed(() => this.field?.describedBy() ?? this.describedBy());

  constructor() {
    afterNextRender(() => {
      if (this.autofocus()) this.el().nativeElement.focus();
    });
  }

  focus(options?: FocusOptions): void {
    this.el().nativeElement.focus(options);
  }

  writeValue(v: string | null): void {
    this.value.set(v ?? '');
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  protected onInput(event: Event): void {
    const v = (event.target as HTMLTextAreaElement).value;
    this.value.set(v);
    this.onChange(v);
    this.lengthChange.emit(graphemeLength(v));
  }

  protected onBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurred.emit(event);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.variant() === 'reply' && event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !this.readonly()) {
      event.preventDefault();
      this.submitRequested.emit(event);
    }
  }
}
