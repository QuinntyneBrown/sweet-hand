import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Dialog, Icon } from '@sweet-hand/components';
import { CatererProfileApi } from '../../../core/api/caterer-profile-api';
import type { OwnPhotoView, OwnProfileView } from '../../../core/api/caterer-profile.models';
import { problemOf } from '../../../core/forms/problem';

/** Remove this photo? and Keep at least 3 photos (docs/mocks/dialogs/remove-photo; L2-042.4). */
@Component({
  selector: 'app-remove-photo-dialog',
  imports: [Alert, Dialog, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      size="sm"
      [title]="blocked() ? blockedTitle : title"
      [description]="description()"
      [tone]="blocked() ? 'warning' : null"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      [cancelLabel]="blocked() ? gotIt : cancel"
      initialFocus="cancel"
      [busy]="busy()"
      [busyMessage]="busyMessage"
      [returnFocus]="returnFocus()"
      (dismissed)="closed.emit()"
    >
      <svg slot="icon" shIcon="warning"></svg>
      @if (failed()) {
        <sh-alert tone="danger" live="assertive" title="The photo wasn’t removed" i18n-title="@@removePhoto.failedTitle"
          ><ng-container i18n="@@removePhoto.failedText">We couldn’t reach Sweet Hand. Try again in a moment.</ng-container></sh-alert
        >
      }
      @if (!blocked() && photo()?.image; as image) {
        <div class="dialog__photo">
          <span class="photo"><img [src]="image.src" alt="" width="160" height="160" /></span>
        </div>
      }
      @if (!blocked()) {
        <button
          slot="footer"
          class="btn btn--danger"
          type="button"
          [attr.aria-busy]="busy() ? 'true' : null"
          [attr.aria-disabled]="busy() ? 'true' : null"
          (click)="remove()"
          i18n="@@photoDetails.remove"
        >
          Remove photo
        </button>
      }
    </sh-dialog>
  `,
})
export class RemovePhotoDialog {
  private readonly api = inject(CatererProfileApi);

  readonly open = input(false);
  readonly photo = input<OwnPhotoView | null>(null);
  /** A published profile at its minimum of 3 photos cannot lose one. */
  readonly blocked = input(false);
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  readonly removed = output<{ profile: OwnProfileView; photo: OwnPhotoView }>();

  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
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

  constructor() {
    effect(() => {
      if (this.open()) untracked(() => this.failed.set(false));
    });
  }

  protected async remove(): Promise<void> {
    const photo = this.photo();
    if (!photo || this.busy()) return;
    this.busy.set(true);
    this.failed.set(false);
    try {
      const profile = await firstValueFrom(this.api.removePhoto(photo.id));
      this.removed.emit({ profile, photo });
    } catch (error) {
      if (problemOf(error).status === 409) this.closed.emit();
      else this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
