import { ChangeDetectionStrategy, Component, ElementRef, computed, forwardRef, inject, input, model, signal, viewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { FIELD_CONTEXT } from './form-field';

let nextId = 0;

/**
 * One checkbox in a `label.choice` (docs/specs/components/checkbox.md). The
 * label is projected; a `[slot=summary]` paragraph follows the label for
 * agreements (the register consent summary).
 */
@Component({
  selector: 'sh-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => Checkbox), multi: true }],
  template: `
    <label class="choice">
      <input
        #el
        type="checkbox"
        [id]="id()"
        [attr.name]="name()"
        [attr.value]="value()"
        [checked]="checked()"
        [required]="required()"
        [disabled]="disabled() || formDisabled()"
        [attr.aria-invalid]="isInvalid() ? 'true' : null"
        [attr.aria-describedby]="describedByIds()"
        (change)="onToggle($event)"
        (blur)="onTouched()"
      />
      <span class="choice__text"
        ><span><ng-content /></span>
        @if (description()) {
          <small>{{ description() }}</small>
        }</span
      >
    </label>
    <ng-content select="[slot=summary]" />
  `,
})
export class Checkbox implements ControlValueAccessor {
  readonly checked = model(false);
  readonly name = input<string | null>(null);
  readonly value = input<string | null>(null);
  readonly inputId = input<string | null>(null);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly invalid = input(false);
  readonly describedBy = input<string | null>(null);
  readonly description = input<string | null>(null);
  /** Set when a `[slot=summary]` paragraph with id `{id}-summary` follows. */
  readonly hasSummary = input(false);

  private readonly field = inject(FIELD_CONTEXT, { optional: true });
  private readonly el = viewChild.required<ElementRef<HTMLInputElement>>('el');
  private readonly generated = `sh-checkbox-${++nextId}`;
  protected readonly formDisabled = signal(false);
  private onChange: (v: boolean) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  readonly id = computed(() => this.field?.id() ?? this.inputId() ?? this.generated);
  protected readonly isInvalid = computed(() => this.invalid() || (this.field?.invalid() ?? false));
  protected readonly describedByIds = computed(() => {
    const ids = [this.field?.describedBy(), this.hasSummary() ? `${this.id()}-summary` : null, this.describedBy()].filter(Boolean);
    return ids.length ? ids.join(' ') : null;
  });

  focus(options?: FocusOptions): void {
    this.el().nativeElement.focus(options);
  }

  writeValue(v: boolean | null): void {
    this.checked.set(!!v);
  }
  registerOnChange(fn: (v: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  protected onToggle(event: Event): void {
    const v = (event.target as HTMLInputElement).checked;
    this.checked.set(v);
    this.onChange(v);
  }
}
