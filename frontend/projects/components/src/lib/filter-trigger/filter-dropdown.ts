import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Popover, type PopoverDismissal } from '../popover/popover';

/**
 * One filter group in a tablet dropdown under its trigger: the choices, Clear
 * and the live total (filter-trigger CRD, `sh-filter-dropdown`). Choices apply
 * on each tick (D-3); the panel is `sh-popover` in its filter shape.
 */
@Component({
  selector: 'sh-filter-dropdown',
  imports: [Popover],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <sh-popover variant="filter" [open]="open()" [panelId]="panelId()" [heading]="title()" (dismissed)="closed.emit($event)">
      <ng-container ngProjectAs="[slot=trigger]"><ng-content select="[slot=trigger]" /></ng-container>
      <ng-content />
      <div class="cluster cluster--between">
        <button class="btn btn--link btn--sm" type="button" [disabled]="clearDisabled()" (click)="cleared.emit()">{{ clearLabel() }}</button>
        <span class="result-count" role="status">{{ resultCount() }}</span>
      </div>
    </sh-popover>
  `,
})
export class FilterDropdown {
  readonly open = input(false);
  readonly panelId = input.required<string>();
  readonly title = input.required<string>();
  readonly resultCount = input.required<string>();
  readonly clearLabel = input.required<string>();
  readonly clearDisabled = input(false);

  readonly cleared = output<void>();
  readonly closed = output<PopoverDismissal | 'trigger'>();
}
