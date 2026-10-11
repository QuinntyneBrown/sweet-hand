import { ChangeDetectionStrategy, Component, contentChildren, input } from '@angular/core';
import { Button } from '../button/button';

/** A settings row: cuisines, operators (list CRD, `sh-admin-row`). Used as an attribute on the `li`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-admin-row]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'admin-row' },
  templateUrl: './admin-row.html',
})
export class AdminRow {
  readonly title = input.required<string>();
  readonly meta = input<string | null>(null);
  readonly initials = input<string | null>(null);

  protected readonly actions = contentChildren(Button, { descendants: true });
}
