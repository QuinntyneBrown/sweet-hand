import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { SideNav } from '@sweet-hand/components';
import { Session } from '../../../core/session/session';
import { operatorNavGroups } from './operator-nav';

/** Frame of every operator page: side navigation beside the work area (work-layout in the mocks). */
@Component({
  selector: 'app-operator-layout',
  imports: [RouterOutlet, SideNav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './operator-layout.html',
})
export class OperatorLayout {
  private readonly session = inject(Session);
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly groups = computed(() => operatorNavGroups(!!this.session.user()?.admin, this.session.queueCount(), this.url()));
}
