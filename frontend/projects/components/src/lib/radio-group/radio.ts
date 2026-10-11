import { ChangeDetectionStrategy, Component, ElementRef, inject, input, viewChild } from '@angular/core';
import { RADIO_GROUP } from './radio-group';

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
