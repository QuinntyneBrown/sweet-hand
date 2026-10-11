import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';

/**
 * A title-and-meta row with an optional trailing button or status
 * (list CRD, `sh-list-item`). Used as an attribute on the `li`.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-list-item]',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.list__item]': '!href()' },
  template: `
    @if (href(); as link) {
      <a class="list__item list__item--interactive" [routerLink]="link" [attr.aria-current]="current() ? 'true' : null"
        ><span class="list__body"
          ><span class="list__title">{{ title() }}</span>
          @if (meta()) {
            <span class="list__meta">{{ meta() }}</span>
          }</span
        ><svg shIcon="chevron-right"></svg
      ></a>
    } @else {
      <div class="list__body">
        <div class="list__title">{{ title() }}</div>
        @if (meta()) {
          <div class="list__meta">{{ meta() }}</div>
        }
      </div>
      <ng-content select="[slot=end]" />
    }
  `,
})
export class ListItem {
  readonly title = input.required<string>();
  readonly meta = input<string | null>(null);
  readonly href = input<string | null>(null);
  readonly current = input(false);
}
