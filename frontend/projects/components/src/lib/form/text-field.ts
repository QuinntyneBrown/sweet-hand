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
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from '../icon/icon';

let nextId = 0;

/**
 * A single-line input (docs/specs/components/text-field.md). Works with
 * reactive forms or `[(value)]`; reads its id, description and validity from
 * the enclosing form field.
 */
@Component({
  selector: 'sh-text-field',
  imports: [Icon, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextField), multi: true }],
  templateUrl: './text-field.html',
})
export class TextField implements ControlValueAccessor {
  readonly type = input<'text' | 'email' | 'password' | 'tel' | 'date' | 'search'>('text');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly variant = input<'plain' | 'search' | 'search-pill'>('plain');
  readonly searchIcon = input<'search' | 'pin'>('search');
  readonly value = model('');
  readonly name = input<string | null>(null);
  readonly autocomplete = input<string | null>(null);
  readonly inputmode = input<'numeric' | 'tel' | 'email' | null>(null);
  readonly autocapitalize = input<'characters' | 'words' | 'off' | null>(null);
  readonly spellcheck = input<boolean | null>(null);
  readonly enterkeyhint = input<'search' | 'send' | 'next' | 'done' | null>(null);
  readonly pattern = input<string | null>(null);
  readonly minlength = input<number | null>(null);
  readonly maxlength = input<number | null>(null);
  readonly min = input<string | null>(null);
  readonly max = input<string | null>(null);
  readonly placeholder = input<string | null>(null);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly autofocus = input(false);
  readonly revealed = input(false);
  readonly invalid = input<boolean | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly prefix = input<string | null>(null);
  readonly suffix = input<string | null>(null);
  /** Standalone use: id when there is no form field. */
  readonly inputId = input<string | null>(null);
  /** Extra ids appended after the form field's (e.g. a combobox's help). */
  readonly extraDescribedBy = input<string | null>(null);
  /** Combobox wiring (combobox CRD). */
  readonly role = input<string | null>(null);
  readonly ariaAutocomplete = input<string | null>(null);
  readonly ariaControls = input<string | null>(null);
  readonly ariaExpanded = input<boolean | null>(null);
  readonly ariaActivedescendant = input<string | null>(null);

  readonly blurred = output<FocusEvent>();
  readonly inputKeydown = output<KeyboardEvent>();

  private readonly field = inject(FIELD_CONTEXT, { optional: true });
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');
  private readonly generated = `sh-text-field-${++nextId}`;
  private readonly formDisabled = signal(false);
  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected readonly id = computed(() => this.field?.id() ?? this.inputId() ?? this.generated);
  protected readonly isInvalid = computed(() => this.invalid() ?? this.field?.invalid() ?? false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected readonly describedBy = computed(() => {
    const ids = [this.field?.describedBy(), this.suffix() ? `${this.id()}-unit` : null, this.extraDescribedBy()].filter(Boolean);
    return ids.length ? ids.join(' ') : null;
  });
  protected readonly cls = computed(() => ['input', this.size() !== 'md' && `input--${this.size()}`].filter(Boolean).join(' '));

  constructor() {
    afterNextRender(() => {
      if (this.autofocus()) this.input().nativeElement.focus();
    });
  }

  focus(options?: FocusOptions): void {
    this.input().nativeElement.focus(options);
  }

  get element(): HTMLInputElement {
    return this.input().nativeElement;
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
    const v = (event.target as HTMLInputElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  protected onBlur(event: FocusEvent): void {
    this.onTouched();
    this.blurred.emit(event);
  }
}
