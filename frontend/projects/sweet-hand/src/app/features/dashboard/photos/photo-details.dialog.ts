import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Checkbox, Dialog, FileUpload, FormField, FormSummary, Icon, Textarea, type SummaryItem } from '@sweet-hand/components';
import { problemOf } from '../../../core/forms/problem';
import { PHOTO_TYPES, readUpload } from './photo-rules';
import { CatererProfileService, type OwnPhotoView, type OwnProfileView } from '@sweet-hand/api';

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
  protected readonly busy = signal(false);
  protected readonly failed = signal<'save' | 'replace' | null>(null);
  protected readonly captionError = signal<string | null>(null);
  protected readonly attempt = signal(0);
  protected readonly captionHelp = $localize`:@@photoDetails.captionHelp:Describe the food for people who can’t see the photo`;

  protected readonly positionText = computed(() => $localize`:@@photoDetails.position:Photo ${this.position()}:n: of ${this.total()}:total:`);
  protected readonly counter = computed(() => $localize`:@@photoDetails.counter:${this.caption().trim().length}:count: / 125`);
  protected readonly summary = computed<SummaryItem[]>(() => (this.captionError() ? [{ controlId: 'caption', message: this.captionError()! }] : []));
  protected readonly busyMessage = computed(() =>
    this.failed() === 'replace' || this.replacing() ? $localize`:@@photoDetails.replacing:Replacing the photo` : $localize`:@@photoDetails.busy:Saving the photo details`,
  );
  protected readonly failedTitle = computed(() =>
    this.failed() === 'replace' ? $localize`:@@photoDetails.replaceFailed:We couldn’t replace this photo` : $localize`:@@photoDetails.failedTitle:We couldn’t save this photo’s details`,
  );
  private readonly replacing = signal(false);

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const p = this.photo();
      untracked(() => {
        this.caption.set(p?.caption ?? '');
        this.cover.set(false);
        this.failed.set(null);
        this.captionError.set(null);
        this.attempt.set(0);
      });
    });
  }

  /** Captions describe the photo in 5–125 characters (L2-042.3); "Use as cover photo" moves it to position 1 (L2-042.6). */
  protected async save(): Promise<void> {
    const p = this.photo();
    if (!p || this.busy()) return;
    const caption = this.caption().trim();
    if (caption.length < 5 || caption.length > 125) {
      this.captionError.set($localize`:@@photoDetails.captionError:Captions describe the photo in 5–125 characters`);
      this.attempt.update((n) => n + 1);
      return;
    }
    this.captionError.set(null);
    this.failed.set(null);
    this.busy.set(true);
    try {
      const profile = await firstValueFrom(this.api.updatePhoto(p.id, { caption, useAsCover: this.cover() }));
      this.saved.emit({ profile, cover: this.cover() });
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors?.['caption']) {
        this.captionError.set(problem.errors['caption'][0]);
        this.attempt.update((n) => n + 1);
      } else {
        this.failed.set('save');
      }
    } finally {
      this.busy.set(false);
    }
  }

  /** The new image takes this one's place and caption (L2-042.2). */
  protected async replace(file: File): Promise<void> {
    const p = this.photo();
    if (!p || this.busy()) return;
    this.busy.set(true);
    this.replacing.set(true);
    this.failed.set(null);
    try {
      const photo = await firstValueFrom(this.api.replacePhoto(p.id, await readUpload(file)));
      this.replaced.emit(photo);
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors?.['file']) {
        this.captionError.set(null);
        this.failed.set('replace');
      } else {
        this.failed.set('replace');
      }
    } finally {
      this.busy.set(false);
      this.replacing.set(false);
    }
  }
}
