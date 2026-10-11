import { ChangeDetectionStrategy, Component, contentChildren, input } from '@angular/core';
import { Button } from '../button/button';

/** A settings row: cuisines, operators (list CRD, `sh-admin-row`). Used as an attribute on the `li`. */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'li[sh-admin-row]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'admin-row' },
  template: `
    @if (initials()) {
      <span class="avatar" aria-hidden="true">{{ initials() }}</span>
    }
    <span class="admin-row__body">
      <span class="admin-row__title">{{ title() }} <ng-content select="[slot=badge]" /></span>
      @if (meta()) {
        <span class="admin-row__meta">{{ meta() }}</span>
      }
    </span>
    @if (actions().length) {
      <span class="admin-row__actions"><ng-content select="[slot=actions]" /></span>
    }
  `,
})
export class AdminRow {
  readonly title = input.required<string>();
  readonly meta = input<string | null>(null);
  readonly initials = input<string | null>(null);

  protected readonly actions = contentChildren(Button, { descendants: true });
}
