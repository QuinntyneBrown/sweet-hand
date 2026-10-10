import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

/** The application shell: skip link, header, the page's main landmark, footer. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <main id="main" [class]="mainClass()" tabindex="-1">
        <router-outlet />
      </main>
    </div>
  `,
})
export class App {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Each route names the classes its main landmark carries in the mocks (`data.mainClass`). */
  protected readonly mainClass = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => {
        let r = this.route.snapshot;
        while (r.firstChild) r = r.firstChild;
        return (r.data['mainClass'] as string | undefined) ?? '';
      }),
    ),
    { initialValue: '' },
  );
}
