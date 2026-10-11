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
  template: `
    <ul class="section-list">
      @for (item of items(); track $index) {
        <li>
          <a class="section-link" [routerLink]="item.href">
            @if (item.status) {
              <sh-check [status]="item.status" />
            }
            <span class="section-link__body">
              <span class="section-link__title"
                >@if (item.status && statusLabels()) {<span class="visually-hidden">{{ statusLabels()![item.status] }}</span>}{{ item.title }}</span
              >
              @if (item.meta) {
                <span [class]="item.status === 'attention' ? 'section-link__meta section-link__meta--error' : 'section-link__meta'">{{ item.meta }}</span>
              }
            </span>
            <svg shIcon="chevron-right"></svg>
          </a>
        </li>
      }
    </ul>
  `,
})
export class SectionList {
  readonly items = input.required<readonly SectionLinkItem[]>();
  readonly statusLabels = input<CheckStatusLabels | null>(null);
}
