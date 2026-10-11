import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { SideNavItem } from './side-nav-item';

/**
 * The dashboard and operator side navigation from 62rem
 * (docs/specs/components/side-nav.md, `sh-side-nav`). Items are data.
 */
@Component({
  selector: 'sh-side-nav',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './side-nav.html',
})
export class SideNav {
  readonly label = input.required<string>();
  readonly groups = input.required<readonly (readonly SideNavItem[])[]>();

  protected readonly nonEmpty = computed(() => this.groups().filter((g) => g.length));
}

