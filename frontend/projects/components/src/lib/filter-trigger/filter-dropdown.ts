import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Popover } from '../popover/popover';
import type { PopoverDismissal } from '../popover/popover-dismissal';

/**
 * One filter group in a tablet dropdown under its trigger: the choices, Clear
 * and the live total (filter-trigger CRD, `sh-filter-dropdown`). Choices apply
 * on each tick (D-3); the panel is `sh-popover` in its filter shape.
 */
@Component({
  selector: 'sh-filter-dropdown',
  imports: [Popover],
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The title input must not become a tooltip on the host.
  host: { style: 'display: contents', '[attr.title]': 'null' },
  templateUrl: './filter-dropdown.html',
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
