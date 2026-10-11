import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Dialog, Icon } from '@sweet-hand/components';
import { CatererProfileService, type OwnPhotoView, type OwnProfileView } from '@sweet-hand/api';
import { FormDialogState } from '../../../core/forms/form-dialog-state';

/** Remove this photo? and Keep at least 3 photos (docs/mocks/dialogs/remove-photo; L2-042.4). */
@Component({
  selector: 'app-remove-photo-dialog',
  imports: [Alert, Dialog, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './remove-photo.dialog.html',
})
export class RemovePhotoDialog {
  private readonly api = inject(CatererProfileService);

  readonly open = input(false);
  readonly photo = input<OwnPhotoView | null>(null);
  /** A published profile at its minimum of 3 photos cannot lose one. */
  readonly blocked = input(false);
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  readonly removed = output<{ profile: OwnProfileView; photo: OwnPhotoView }>();

  protected readonly state = new FormDialogState(this.open, { noErrors: null });
  protected readonly title = $localize`:@@removePhoto.title:Remove this photo?`;
  protected readonly blockedTitle = $localize`:@@removePhoto.blockedTitle:Keep at least 3 photos`;
  protected readonly cancel = $localize`:@@common.cancel:Cancel`;
  protected readonly gotIt = $localize`:@@common.gotIt:Got it`;
  protected readonly busyMessage = $localize`:@@removePhoto.busy:Removing the photo`;
  protected readonly description = computed(() =>
    this.blocked()
      ? $localize`:@@removePhoto.blockedText:Published profiles need at least 3 photos. Add another photo before you remove this one.`
      : $localize`:@@removePhoto.text:“${this.photo()?.caption || this.photo()?.fileName || ''}:caption:” leaves your page within a minute.`,
  );

  protected async remove(): Promise<void> {
    const photo = this.photo();
    if (!photo || this.state.busy()) return;
    await this.state.submit(
      async () => {
        const profile = await firstValueFrom(this.api.removePhoto(photo.id));
        this.removed.emit({ profile, photo });
      },
      (status) => {
        if (status !== 409) return false;
        this.closed.emit();
        return true;
      },
    );
  }
}
