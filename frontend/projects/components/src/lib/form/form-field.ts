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
  template: `
    <div class="field">
      @if (readOnlyValue() !== null) {
        <span class="field__label">{{ label() }}</span>
        @if (isList()) {
          <div class="prose read-only-value">
            @for (p of list(); track $index) {
              <p>{{ p }}</p>
            }
          </div>
        } @else {
          <p class="read-only-value">{{ readOnlyValue() }}</p>
        }
        @if (help()) {
          <span class="field__help" [id]="id() + '-help'">{{ help() }}</span>
        }
      } @else {
        @if (labelAction()) {
          <div class="cluster cluster--between">
            <ng-container *ngTemplateOutlet="labelTpl" />
            <ng-content select="[slot=labelAction]" />
          </div>
        } @else {
          <ng-container *ngTemplateOutlet="labelTpl" />
        }
        <ng-content />
        @if (error()) {
          <span class="field__error" [id]="id() + '-error'">{{ error() }}</span>
        } @else if (warning()) {
          <span class="field__warning" [id]="id() + '-warning'">{{ warning() }}</span>
        }
        @if (help() && counter()) {
          <!-- Help and counter share one row (form-field CRD, Markup). -->
          <span class="cluster cluster--between">
            <span class="field__help" [id]="id() + '-help'">{{ help() }}</span>
            <span class="field__counter" [id]="id() + '-count'" [attr.data-over]="counterOver() ? '' : null">{{ counter() }}</span>
          </span>
        } @else if (help()) {
          <span class="field__help" [id]="id() + '-help'">{{ help() }}</span>
        } @else if (counter()) {
          <span class="field__counter" [id]="id() + '-count'" [attr.data-over]="counterOver() ? '' : null">{{ counter() }}</span>
        }
        <span class="visually-hidden" role="status">{{ !error() && warning() ? warning() : counterOver() ? counterAnnouncement() : '' }}</span>
      }
    </div>
    <ng-template #labelTpl>
      @if (label() !== null) {
        <label [class]="labelHidden() ? 'visually-hidden' : 'field__label'" [for]="id()"
          >{{ label() }}@if (optionalMarker()) {&ngsp;<span class="optional">{{ optionalMarker() }}</span>}</label
        >
      }
    </ng-template>
  `,
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

