import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  InjectionToken,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';

interface RadioGroupContext {
  name: () => string;
  value: () => string | null;
  variant: () => 'plain' | 'card';
  required: () => boolean;
  isDisabled: () => boolean;
  invalid: () => boolean;
  isAutofocusTarget(radio: Radio): boolean;
  autofocus: () => boolean;
  choose(value: string): void;
}

const RADIO_GROUP = new InjectionToken<RadioGroupContext>('RADIO_GROUP');

let nextId = 0;

/**
 * One option of a radio group (docs/specs/components/radio-group.md, `sh-radio`):
 * a `label.choice` wrapping the native radio, its label and description.
 */
@Component({
  selector: 'sh-radio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <label [class]="group.variant() === 'card' ? 'choice choice--card' : 'choice'"
      ><input
        #input
        type="radio"
        [attr.name]="group.name()"
        [value]="value()"
        [attr.id]="inputId()"
        [checked]="group.value() === value()"
        [required]="group.required()"
        [disabled]="group.isDisabled() || disabled()"
        [attr.aria-invalid]="group.invalid() ? 'true' : null"
        [attr.autofocus]="group.autofocus() && group.isAutofocusTarget(self) ? '' : null"
        (change)="group.choose(value())" /><span class="choice__text"
        ><span><ng-content /></span>@if (description()) {<small>{{ description() }}</small>}</span
      ></label
    >
  `,
})
export class Radio {
  readonly value = input.required<string>();
  readonly description = input<string | null>(null);
  readonly inputId = input<string | null>(null);
  readonly disabled = input(false);

  protected readonly group = inject(RADIO_GROUP);
  protected readonly self = this;
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  /** @internal Used by the group. */
  get enabled(): boolean {
    return !this.disabled();
  }

  focus(options?: FocusOptions): void {
    this.input().nativeElement.focus(options);
  }
}

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
  template: `
    <fieldset class="stack stack--sm" [attr.aria-describedby]="describedBy()">
      <legend [class.visually-hidden]="legendHidden()"><ng-content select="[slot=legend]" /></legend>
      @if (help()) {
        <p class="field__help" [id]="ids.help">{{ help() }}</p>
      }
      @if (error()) {
        <p class="field__error" [id]="ids.error">{{ error() }}</p>
      }
      @if (layout() === 'horizontal' && variant() === 'plain') {
        <div class="cluster radio-group__row"><ng-container *ngTemplateOutlet="options" /></div>
      } @else {
        <ng-container *ngTemplateOutlet="options" />
      }
    </fieldset>
    <ng-template #options><ng-content /></ng-template>
  `,
  styles: `.radio-group__row { gap: var(--space-2) var(--space-6); }`,
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
