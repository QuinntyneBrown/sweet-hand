import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';

/** The `.eyebrow` back link above a page title, naming the page it returns to (link CRD). */
@Component({
  selector: 'sh-back-link',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './back-link.html',
})
export class BackLink {
  readonly href = input.required<string>();
  readonly untilLg = input(false);

  readonly followed = output<MouseEvent>();
}
