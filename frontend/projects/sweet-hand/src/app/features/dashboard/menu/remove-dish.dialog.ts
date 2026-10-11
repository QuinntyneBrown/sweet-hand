import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Dialog, Icon } from '@sweet-hand/components';
import { CatererProfileService, type OwnDishView, type OwnProfileView } from '@sweet-hand/api';

/** Remove “Curry goat”? and Keep at least 3 dishes (docs/mocks/dialogs/remove-dish; L2-043.2). */
@Component({
  selector: 'app-remove-dish-dialog',
  imports: [Alert, Dialog, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './remove-dish.dialog.html',
})
export class RemoveDishDialog {
  private readonly api = inject(CatererProfileService);

  readonly open = input(false);
  readonly dish = input<OwnDishView | null>(null);
  readonly blocked = input(false);
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  readonly removed = output<OwnProfileView>();
  readonly addRequested = output<void>();

  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly title = computed(() =>
    this.blocked() ? $localize`:@@removeDish.blockedTitle:Keep at least 3 dishes` : $localize`:@@removeDish.title:Remove “${this.dish()?.name ?? ''}:name:”?`,
  );
  protected readonly description = computed(() =>
    this.blocked()
      ? $localize`:@@removeDish.blockedText:Published profiles need at least 3 dishes. Add another dish before you remove “${this.dish()?.name ?? ''}:name:”.`
      : $localize`:@@removeDish.text:It comes off your page within a minute. You can add it again later.`,
  );
  protected readonly busyMessage = computed(() => $localize`:@@removeDish.busy:Removing ${this.dish()?.name ?? ''}:name:`);

  constructor() {
    effect(() => {
      if (this.open()) untracked(() => this.failed.set(false));
    });
  }

  protected async remove(): Promise<void> {
    const dish = this.dish();
    if (!dish || this.busy()) return;
    this.busy.set(true);
    this.failed.set(false);
    try {
      this.removed.emit(await firstValueFrom(this.api.removeDish(dish.id)));
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
