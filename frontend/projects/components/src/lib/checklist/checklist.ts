import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { CheckStatusLabels } from './check-status-labels';

/** A compact list of checked lines (checklist CRD, `sh-checklist`). Items are `sh-checklist-item` children. */
@Component({
  selector: 'sh-checklist',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (ordered()) {
      <ol class="checklist" [attr.aria-labelledby]="ariaLabelledby()"><ng-container *ngTemplateOutlet="items" /></ol>
    } @else {
      <ul class="checklist" [attr.aria-labelledby]="ariaLabelledby()"><ng-container *ngTemplateOutlet="items" /></ul>
    }
    <ng-template #items><ng-content /></ng-template>
  `,
})
export class Checklist {
  readonly ordered = input(false);
  readonly statusLabels = input<CheckStatusLabels | null>(null);
  /** `false` only when every item is done and a heading says so (D-3). */
  readonly prefixes = input(true);
  readonly ariaLabelledby = input<string | null>(null);
}

