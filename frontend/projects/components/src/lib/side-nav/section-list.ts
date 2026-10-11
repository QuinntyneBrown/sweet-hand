import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Check } from '../checklist/check';
import type { CheckStatusLabels } from '../checklist/check-status-labels';
import { Icon } from '../icon/icon';
import type { SectionLinkItem } from './section-link-item';

/** The dashboard's sections as tall linked rows with a status mark (side-nav CRD, `sh-section-list`). */
@Component({
  selector: 'sh-section-list',
  imports: [RouterLink, Check, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './section-list.html',
})
export class SectionList {
  readonly items = input.required<readonly SectionLinkItem[]>();
  readonly statusLabels = input<CheckStatusLabels | null>(null);
}
