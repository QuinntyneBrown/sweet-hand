import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Checkbox, Dialog, FileUpload, FormField, FormSummary, Icon, Textarea, type SummaryItem } from '@sweet-hand/components';
import { PHOTO_TYPES, readUpload } from './photo-rules';
import { CatererProfileService, type OwnPhotoView, type OwnProfileView } from '@sweet-hand/api';
import { FormDialogState } from '../../../core/forms/form-dialog-state';
import { fieldError } from '../../../core/forms/problem';

/** Photo details (docs/mocks/dialogs/photo-details; manage-photos, PhotoDetailsDialog): caption, cover, replace, remove. */
@Component({
  selector: 'app-photo-details-dialog',
  imports: [Alert, Checkbox, Dialog, FileUpload, FormField, FormSummary, Icon, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './photo-details.dialog.html',
})
export class PhotoDetailsDialog {
  private readonly api = inject(CatererProfileService);

  readonly open = input(false);
  readonly photo = input<OwnPhotoView | null>(null);
  readonly position = input(1);
  readonly total = input(1);

  readonly closed = output<void>();
  /** The saved profile and whether the photo became the cover. */
  readonly saved = output<{ profile: OwnProfileView; cover: boolean }>();
  readonly replaced = output<OwnPhotoView>();
  readonly removeRequested = output<void>();

  protected readonly photoTypes = PHOTO_TYPES;
  protected readonly caption = signal('');
  protected readonly cover = signal(false);
  protected readonly state = new FormDialogState<string | null, OwnPhotoView | null>(this.open, {
    noErrors: null,
    from: this.photo,
    reset: (p) => {
      this.caption.set(p?.caption ?? '');
      this.cover.set(false);
    },
  });
  /** Which request the dialog last sent, for its busy and failure messages. */
  private readonly sent = signal<'save' | 'replace'>('save');
  protected readonly captionHelp = $localize`:@@photoDetails.captionHelp:Describe the food for people who can’t see the photo`;

  protected readonly positionText = computed(() => $localize`:@@photoDetails.position:Photo ${this.position()}:n: of ${this.total()}:total:`);
  protected readonly counter = computed(() => $localize`:@@photoDetails.counter:${this.caption().trim().length}:count: / 125`);
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.state.errors();
    return e ? [{ controlId: 'caption', message: e }] : [];
  });
  protected readonly busyMessage = computed(() =>
    this.sent() === 'replace' ? $localize`:@@photoDetails.replacing:Replacing the photo` : $localize`:@@photoDetails.busy:Saving the photo details`,
  );
  protected readonly failedTitle = computed(() =>
    this.sent() === 'replace' ? $localize`:@@photoDetails.replaceFailed:We couldn’t replace this photo` : $localize`:@@photoDetails.failedTitle:We couldn’t save this photo’s details`,
  );

  /** Captions describe the photo in 5–125 characters (L2-042.3); "Use as cover photo" moves it to position 1 (L2-042.6). */
  protected async save(): Promise<void> {
    const p = this.photo();
    if (!p || this.state.busy()) return;
    const caption = this.caption().trim();
    const error = caption.length < 5 || caption.length > 125 ? $localize`:@@photoDetails.captionError:Captions describe the photo in 5–125 characters` : null;
    if (!this.state.validate(error)) return;
    this.sent.set('save');
    await this.state.submit(
      async () => {
        const profile = await firstValueFrom(this.api.updatePhoto(p.id, { caption, useAsCover: this.cover() }));
        this.saved.emit({ profile, cover: this.cover() });
      },
      (status, problem) => status === 400 && !!fieldError(problem, 'caption') && this.state.reject(fieldError(problem, 'caption')),
    );
  }

  /** The new image takes this one's place and caption (L2-042.2). */
  protected async replace(file: File): Promise<void> {
    const p = this.photo();
    if (!p || this.state.busy()) return;
    this.sent.set('replace');
    await this.state.submit(
      async () => this.replaced.emit(await firstValueFrom(this.api.replacePhoto(p.id, await readUpload(file)))),
      (status, problem) => {
        if (status === 400 && fieldError(problem, 'file')) this.state.errors.set(null);
        return false;
      },
    );
  }
}
