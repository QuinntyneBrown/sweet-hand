import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChild, forwardRef, InjectionToken, input } from '@angular/core';
import type { FieldContext } from './field-context';
import { LabelAction } from './label-action';

export const FIELD_CONTEXT = new InjectionToken<FieldContext>('FIELD_CONTEXT');

let nextId = 0;

/**
 * Label, control, message, help and counter for one control
 * (docs/specs/components/form-field.md). The message sits directly under the
 * control; errors set `aria-invalid` on it, warnings never do.
 */
@Component({
  selector: 'sh-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  providers: [{ provide: FIELD_CONTEXT, useExisting: forwardRef(() => FormField) }],
  templateUrl: './form-field.html',
  imports: [NgTemplateOutlet],
})
export class FormField implements FieldContext {
  readonly label = input<string | null>(null);
  readonly controlId = input<string | null>(null);
  readonly optionalMarker = input<string | null>(null);
  readonly labelHidden = input(false);
  readonly help = input<string | null>(null);
  readonly error = input<string | null>(null);
  readonly warning = input<string | null>(null);
  readonly counter = input<string | null>(null);
  readonly counterOver = input(false);
  readonly counterAnnouncement = input<string | null>(null);
  readonly readOnlyValue = input<string | readonly string[] | null>(null);

  protected readonly labelAction = contentChild(LabelAction);
  private readonly generated = `sh-field-${++nextId}`;

  readonly id = computed(() => this.controlId() ?? this.generated);
  readonly invalid = computed(() => !!this.error());
  readonly describedBy = computed(() => {
    const ids: string[] = [];
    if (this.error()) ids.push(`${this.id()}-error`);
    else if (this.warning()) ids.push(`${this.id()}-warning`);
    if (this.help()) ids.push(`${this.id()}-help`);
    if (this.counter()) ids.push(`${this.id()}-count`);
    return ids.length ? ids.join(' ') : null;
  });
  protected readonly isList = computed(() => Array.isArray(this.readOnlyValue()));
  protected readonly list = computed(() => (Array.isArray(this.readOnlyValue()) ? (this.readOnlyValue() as string[]) : []));

  focusControl(options?: FocusOptions): void {
    document.getElementById(this.id())?.focus(options);
  }
}

