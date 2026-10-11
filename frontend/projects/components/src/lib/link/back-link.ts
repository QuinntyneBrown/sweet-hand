import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';

/** The `.eyebrow` back link above a page title, naming the page it returns to (link CRD). */
@Component({
  selector: 'sh-back-link',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `<a [class]="untilLg() ? 'eyebrow until-lg' : 'eyebrow'" [routerLink]="href()" (click)="followed.emit($event)"><svg class="icon--sm" shIcon="chevron-left"></svg><ng-content /></a>`,
})
export class BackLink {
  readonly href = input.required<string>();
  readonly untilLg = input(false);

  readonly followed = output<MouseEvent>();
}
