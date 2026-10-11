import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Dialog, Icon } from '@sweet-hand/components';
import { CatererProfileService, type OwnDishView, type OwnProfileView } from '@sweet-hand/api';
import { FormDialogState } from '../../../core/forms/form-dialog-state';

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

  protected readonly state = new FormDialogState(this.open, { noErrors: null });
  protected readonly title = computed(() =>
    this.blocked() ? $localize`:@@removeDish.blockedTitle:Keep at least 3 dishes` : $localize`:@@removeDish.title:Remove “${this.dish()?.name ?? ''}:name:”?`,
  );
  protected readonly description = computed(() =>
    this.blocked()
      ? $localize`:@@removeDish.blockedText:Published profiles need at least 3 dishes. Add another dish before you remove “${this.dish()?.name ?? ''}:name:”.`
      : $localize`:@@removeDish.text:It comes off your page within a minute. You can add it again later.`,
  );
  protected readonly busyMessage = computed(() => $localize`:@@removeDish.busy:Removing ${this.dish()?.name ?? ''}:name:`);

  protected async remove(): Promise<void> {
    const dish = this.dish();
    if (!dish || this.state.busy()) return;
    await this.state.submit(async () => {
      this.removed.emit(await firstValueFrom(this.api.removeDish(dish.id)));
    });
  }
}
