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
  templateUrl: './radio.html',
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
