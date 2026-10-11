import { ChangeDetectionStrategy, Component, ElementRef, computed, forwardRef, inject, input, model, output, signal, viewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { FIELD_CONTEXT } from './form-field';
import type { SelectOption } from './select-option';
import type { SelectGroup } from './select-group';

let nextId = 0;

/** A native select (docs/specs/components/select.md); options may be grouped. */
@Component({
  selector: 'sh-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Select), multi: true }],
  templateUrl: './select.html',
})
export class Select implements ControlValueAccessor {
  readonly options = input<SelectOption[]>([]);
  readonly groups = input<SelectGroup[]>([]);
  readonly placeholder = input<string | null>(null);
  readonly value = model('');
  readonly name = input<string | null>(null);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly invalid = input<boolean | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly inputId = input<string | null>(null);

  readonly changed = output<string>();

  protected readonly field = inject(FIELD_CONTEXT, { optional: true });
  private readonly el = viewChild.required<ElementRef<HTMLSelectElement>>('el');
  private readonly generated = `sh-select-${++nextId}`;
  protected readonly formDisabled = signal(false);
  private onChange: (v: string) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  protected readonly id = computed(() => this.field?.id() ?? this.inputId() ?? this.generated);
  protected readonly isInvalid = computed(() => this.invalid() ?? this.field?.invalid() ?? false);

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

  protected onSelect(event: Event): void {
    const v = (event.target as HTMLSelectElement).value;
    this.value.set(v);
    this.onChange(v);
    this.changed.emit(v);
  }
}
