import { ChangeDetectionStrategy, Component, computed, contentChildren, forwardRef, InjectionToken, input, model, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import type { RadioGroupContext } from './radio-group-context';
import { Radio } from './radio';

export const RADIO_GROUP = new InjectionToken<RadioGroupContext>('RADIO_GROUP');

let nextId = 0;

/**
 * A group of radios with its legend, help and one error (radio-group CRD).
 * The native radios share `name`, so the browser gives one tab stop and arrow keys.
 */
@Component({
  selector: 'sh-radio-group',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  providers: [
    { provide: RADIO_GROUP, useExisting: forwardRef(() => RadioGroup) },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RadioGroup), multi: true },
  ],
  templateUrl: './radio-group.html',
  styleUrl: './radio-group.css',
})
export class RadioGroup implements RadioGroupContext, ControlValueAccessor {
  readonly name = input.required<string>();
  readonly value = model<string | null>(null);
  readonly layout = input<'vertical' | 'horizontal'>('vertical');
  readonly variant = input<'plain' | 'card'>('plain');
  readonly legendHidden = input(false);
  readonly help = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly required = input(false);
  readonly disabled = input(false);
  readonly autofocus = input(false);

  private readonly radios = contentChildren(Radio);
  private readonly formDisabled = signal(false);
  private onChange: (v: string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected readonly ids = { help: `sh-radio-group-${++nextId}-help`, error: `sh-radio-group-${nextId}-error` };
  /** The error first, then the help (D-5). */
  protected readonly describedBy = computed(() => [this.error() ? this.ids.error : null, this.help() ? this.ids.help : null].filter(Boolean).join(' ') || null);
  readonly invalid = computed(() => !!this.error());
  /** The checked radio, or the first enabled one. */
  readonly focusTarget = computed(() => this.radios().find((r) => r.value() === this.value()) ?? this.radios().find((r) => r.enabled));

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  /** The checked radio, or the first one when none is checked; reads no other radio's inputs while they render. */
  isAutofocusTarget(radio: Radio): boolean {
    const value = this.value();
    return value === null ? this.radios()[0] === radio : radio.value() === value;
  }

  choose(value: string): void {
    if (this.isDisabled()) return;
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }

  focus(options?: FocusOptions): void {
    this.focusTarget()?.focus(options);
  }

  writeValue(v: string | null): void {
    this.value.set(v);
  }
  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }
}
