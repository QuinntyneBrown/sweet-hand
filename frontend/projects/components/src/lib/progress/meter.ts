import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Progress } from './progress';

let nextId = 0;

/** "Ready to submit · 8 of 10 done": a count of items done (progress CRD, `sh-meter`). */
@Component({
  selector: 'sh-meter',
  imports: [Progress],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <div class="meter">
      <div class="meter__label"><span [id]="labelId">{{ label() }}</span><span>{{ valueText() }}</span></div>
      <sh-progress [value]="value()" [max]="max()" [valueText]="valueText()" [labelledBy]="labelId" />
    </div>
  `,
})
export class Meter {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly max = input.required<number>();
  readonly valueText = input.required<string>();

  protected readonly labelId = `sh-meter-label-${++nextId}`;
}
